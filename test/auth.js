
var expect = require('chai').expect;
var request = require('supertest');

describe('Authentication Server', function () {

    var app, driver, db;

    before(function (done) {

        db = require('../lib/db')

        db.connect('mongodb://localhost/intern-buptsse-test');

        db.P(function () {
            app = require('../lib/server');
            driver = request(app);
            done();
        })();

    });

    it('should get 404 when login with user does not exist', function (done) {

        driver
        .post('/login')
        .send({
            username: 'foo',
            password: 'bar',
        })
        .expect(404, done);

    });

    it('should set session for client when successfully authenticated');

});

