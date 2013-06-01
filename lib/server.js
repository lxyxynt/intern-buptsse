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

db.connect("mongodb://localhost/intern-buptsse");

var User, Job; 

db.P(function () { 
    // Expose Types
    User = db.Types.User;
    Job = db.Types.Job;
})();

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
