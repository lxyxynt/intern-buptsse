var exp = require('express');
var crypto = require('crypto');
var con = require('console');
var path = require('path');
var fs = require('fs');
var passwordHash = require('password-hash');

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

app.get("/u/:uid/profile", function (req, res, next) {
    var uid = req.params.uid;
    User.findOne({username: uid}, function (err, user) {

        if(err) return next(err);
        if(!user) return res.send(404, {err: 'user not found'});

        var profile = {};
        profile.id = user.username;
        profile.realname = user.realname;
        
        profile.email = user.email;
        profile.phone = user.phone;
        
        profile.resume = user.resume;
        profile.homepage = user.homepage;
        
        return res.send(200, profile);
    });

});

app.post("/u/:uid/profile", function (req, res, next) {
    var uid = req.params.uid;
    
    if (uid != req.session.user.username)
        return res.send(403, {err: 'access denied'});
    
    User.findOne({username: uid}, function (err, user) {
        if(err) return next(err);
        if(!user) return res.send(404, {err: 'user not found'});

        var args = req.body;

        var profile = {};
        user.realname = profile.realname = args.realname || user.realname;
        user.email = profile.email = args.email || user.email;
        user.phone = profile.phone = args.phone || user.phone;
        user.resume = profile.resume = args.resume || user.resume;
        user.homepage = profile.homepage = args.homepage || user.homepage;
        
        user.save(function(err) {
            if (err) {
                res.send(400, {err: 'save failed'});        
            }
        });

        return res.send(200, profile);
    });    
});

app.post("/u/", function (req, res, next) {
    var args = req.body;

    var user = new User();
    user.username = args.username;
    user.password = args.password;
    user.realname = args.realname;
    user.role = args.role;

    user.save(function(err) {
        if (err) {
            res.send(400, {err: 'save failed'});        
        }
        res.send(200, {});
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
    User.findOne({username: username}, function (err, user) {

        if(err) return next(err);

        if(!user) return res.send(404, {err: 'invalid_user'});

        if(!passwordHash.verify(password, user.password)) {
            // Always prefix `return` to the res.send function call
            // 403 is the http code
            return res.send(403, {err: 'access_denied'});
        }else{
            // Set the user to session, so other logic can access it
            req.session.user = user;
            // Send the User information to the client
            return res.send(200, {uid:username, role:user.role});
        }

    });

});

// Initialization completed

module.exports = app;
