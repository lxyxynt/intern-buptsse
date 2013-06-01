
var _ = require('underscore');

var Types = require('./schema');

var $P = (function () {
    var trigger = require('trigger.js')
    var invoker = function (fn) {
        return invoker.m.wrap('initialized', fn);
    };
    invoker.m = trigger('unknown');
    invoker.initialize = function () {
        invoker.m('initialized');
    };
    invoker.close = function () {
        invoker.m('closed');
    };
    return invoker;
})();

var mongoose = require('mongoose');

var conn = function (connString) {

    mongoose.connect(connString);

    var db = mongoose.connection;

    db.on('error', console.error.bind(console, 'connection error:'));

    db.once('open', function () {

        $P.initialize();

    });

};

var User, Event, Subscr;

var logic = {};

_(logic).extend({
    mongoose: mongoose,
    connect: conn,
    close: $P(function (callback) {
        mongoose.connection.close(callback);
        $P.close();
    }),
    Types: Types,
    P: $P
});

module.exports = logic;
