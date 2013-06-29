var path = require('path');
var expect = require('chai').expect;
var request = require('supertest');

describe('announcement', function () {
    var app,driver;

    before(function(){
        app=require('../lib/server');
	driver=request(app);
    });
    
    after(function(){
        delete require.cache[require.resolve('../lib/server')];
    });
   
    it('should publish a new annoucement after POST request',function(done){
        driver
        .post('/announcement')
        .send({
	    text:'abc'
        })
        .expect(200)
        .end(function(err,res){
    	    if(err) throw err;

    	    done();
    	});
    });
  
    it('should get the newest annoucement',function(done){
        driver
	.get('/announcement')
    .expect(200)
    .end(function(err,res){
    	    if(err) throw err;
	    expect(res.body).to.have.property('text', "abc");

    	    done();
    	});
    });
});
