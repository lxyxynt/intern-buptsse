#!/usr/bin/env node

var db = require('./lib/db');
db.connect("mongodb://localhost/intern-buptsse");
db.P(function () { 
    var server = require('./lib/server.js');
    server.listen(10920);
    console.log('Listen on 10920.');
})();

