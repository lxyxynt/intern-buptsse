var exp = require('express');
var crypto = require('crypto');
var con = require('console');
var path = require('path');
var fs = require('fs');

var sessionSecretSeed = crypto.randomBytes(16).toString('hex');

var app = exp();

var lessware = require('compile-mw-less');
var jadeware = require('compile-mw-jade-runtime');

var compile = {
    less: lessware({
        filename  : /(?:\/style\/)(.*)\.css/i,
        src       : 'www/less'
    }),
    jade: jadeware({
        filename  : /(?:\/ui\/)(.*)\.js/i,
        src       : 'www/ui',
        runtime   : /^\/js\/runtime((\.|-)min)?\.js$/i
    })
};

var db = require('./db');
var User = db.Types.User;
var Job = db.Types.Job; 

app.configure(function(){
    app.set('views', path.resolve(__dirname + '/../www/ui'))
    app.use(exp.logger());
    app.use(exp.bodyParser());
    app.use(exp.cookieParser());
    app.use(exp.compress());
    app.use(exp.session({ secret : sessionSecretSeed }));
    app.use(compile.less);
    app.use(compile.jade);
    app.use(app.router);
    app.use(exp.static(path.resolve(__dirname + '/../www/asset')));
});

app.get("/", function(req, res){
    res.render("index.jade");
});

var csv = require('csv');
var passwordHash = require('password-hash');
var hash = require('node_hash');

app.post("/u/_import",function(req, res, next){
    var args = req.body;
    var username = args.username;
    var password = hash.md5(args.password);
    var file = req.files.file;

    //User is the admin of internship manage system
    User.findOne({ username: username, role: 'professor'}, function ( err, user) {
        if(err) return next(err);
        if(!user) return res.send(404, {err: 'invalid_user'});
        else if(!passwordHash.verify(password, user.password)){
            return res.send(403, {err:'access_denied'});
        }
        else{
            csv()
            .from.path(file.path)
            .transform(function(row,index){
                var hashedPassword = passwordHash.generate(row[2]);
                
                var student = new User();
                student.username = row[0];
                student.password = hashedPassword;
                student.realname = row[1];
                student.role = 'student';
                
                student.save(function(err){
                    if(err){
                        res.send(400,{err:'save failed'});
                    }
                });
            })
            .on('end',function(){
                console.log('Read from csv done!');
                res.send(200,{});
            });
            fs.unlink(file.path);
            return res.send(200,'success');
        }
    });
});

app.post("/login", function (req, res, next) {
    // Attention          > ^              > ^
    // Blanks in a function declaration

    // Parameter in POST request is in req.body
    var args = req.body;

    var username = args.username;
    var password = args.password;

    // User is the MongoDB Schema here
    User.findOne({ username: username }, function (err, user) {

        if(err) return next(err);
        if(!user) return res.send(404, {err: 'invalid_user'});

        if(user.password != password) {
            // Always prefix `return` to the res.send function call
            // 403 is the http code
            return res.send(403, {err: 'access_denied'});
        }else{
            // Set the user to session, so other logic can access it
            req.session.user = user;
            // Send the User information to the client
            return res.send(200, user);
        }

    });

});

// Initialization completed

module.exports = app;
