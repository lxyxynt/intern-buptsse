#!/usr/bin/env node

var db = require('./lib/db');
db.connect("mongodb://localhost/intern-buptsse");
var passwordHash = require('password-hash');
var hash = require('node_hash');
var program = require('commander');

var User = db.Types.User;

program
.version('0.0.1')
.option('-u, --user','Add admin\'s username')
.option('-p, --password','Add admin\'s password')
.parse(process.argv);

var username = program.args[0];
var password = program.args[1];

var md5Password = hash.md5(password);
console.log("md5Password: "+md5Password);
var hashedPassword = passwordHash.generate(md5Password);
console.log("hashedpassword: "+hashedPassword);

var user = new User();
user.username = username;
user.password = hashedPassword;
user.realname = 'professor';
user.role = 'professor';

user.save(function(err){
    if(err){
        console.log('failed!');
        db.close();
        return ;
    }
    db.close();
    console.log('success!');
    return ;
});


