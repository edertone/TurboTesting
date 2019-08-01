#!/usr/bin/env node

'use strict';


/**
 * Tests related to the HTTPTestsManager class
 */

const path = require('path');
const projectRoot = path.resolve('./');
const { HTTPTestsManager } = require(projectRoot + '/target/turbotesting-node/dist/ts/index');


describe('HTTPTestsManagerTest', function() {
    
    beforeAll(function() {
        
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 2500000;
    });

    
    afterAll(function() {
        
    });
        
    beforeEach(function() {
        
        this.sut = new HTTPTestsManager();
    });

    
    afterEach(function() {
  
    });
    
    
    it('should correctly find duplicate urls for the assertUrlsFail method', function() {

        expect(() => {this.sut.assertUrlsFail(['aaaaaaaaaa', 'bbbbbbbbbb', 'aaaaaaaaaa'], () => {})})
            .toThrowError(Error, /HTTPTestsManager.assertUrlsFail duplicate urls: aaaaaaaaaa/);
            
        expect(() => {this.sut.assertUrlsFail([{ url: "aaa" }, { url: "ccc" }, { url: "ccc" }], () => {})})
            .toThrowError(Error, /HTTPTestsManager.assertUrlsFail duplicate urls: ccc/);
            
        expect(() => {this.sut.assertUrlsFail(['bbbbbbbbbb', 'aaaaaaaaaa', { url: "bbbbbbbbbb" }], () => {})})
            .toThrowError(Error, /HTTPTestsManager.assertUrlsFail duplicate urls: bbbbbbbbbb/);
    });
    
    
    it('should correctly execute the assertUrlsFail method when a list of invalid string urls are passed', function(done) {

        this.sut.assertUrlsFail(['', ' ', 'asdfsdfasdfasdf', '121212121212', 'https://invalid'], done);
    });
    
    
    it('should correctly execute the assertUrlsFail method when a list of objects containing invalid urls are passed', function(done) {

        let urls = [{ url: "" }, { url: " " }, { url: "asdfsdfasdfasdf" }, { url: "121212121212" }, { url: "https://invalid" }];
        
        this.sut.assertUrlsFail(urls, done);
    });
    
    
    it('should correctly execute the assertUrlsFail method when a mixed list of invalid string urls and objects containing invalid urls are passed', function(done) {

        let urls = ['1', { url: "" }, 'asdfsdfasdfasdf', { url: " " }, { url: "rtrtrtyrtyrty" }, 'https://invalid', { url: "121212121212" }, { url: "https://invalid2" }];
        
        this.sut.assertUrlsFail(urls, done);
    });
    
    
    it('should correctly perform the expected assertions on the assertUrlsFail method when an invalid url is provided', function(done) {

        let urls = [{
            url: "https://stackoverflow.com/%",
            responseCode: 400,
            contains: ['<', 'Bad Request'],
            notContains: '23423werewrwer----34534534'
        }];
        
        this.sut.assertUrlsFail(urls, done);
    });
    
    
    it('should generate assert exceptions for the assertUrlsFail method when a list of valid string urls are passed', function(done) {

        this.sut.isAssertExceptionsEnabled = false;
        
        this.sut.assertUrlsFail(['https://www.google.com', 'https://www.github.com'], (assertErrors) => {
            
            expect(assertErrors.length).toBe(2);
            expect(assertErrors[0]).toContain("URL expected to fail but was 200 ok: https://www.google.com");
            expect(assertErrors[1]).toContain("URL expected to fail but was 200 ok: https://www.github.com");
            
            done();
        });
    });
    
    
    it('should generate assert exceptions for the assertUrlsFail method when a list of objects containing valid urls are passed', function(done) {

        this.sut.isAssertExceptionsEnabled = false;
        
        this.sut.assertUrlsFail([{ url: "https://www.github.com" }, { url: "https://www.google.com" }], (assertErrors) => {
            
            expect(assertErrors.length).toBe(2);
            expect(assertErrors[0]).toContain("URL expected to fail but was 200 ok: https://www.github.com");
            expect(assertErrors[1]).toContain("URL expected to fail but was 200 ok: https://www.google.com");
            
            done();
        });
    });
    
    
    it('should generate assert exceptions for the assertUrlsFail method when a mixed list of valid string urls and objects containing valid urls are passed', function(done) {

        this.sut.isAssertExceptionsEnabled = false;
        
        this.sut.assertUrlsFail([{ url: "https://www.github.com" }, 'https://www.stackoverflow.com', { url: "https://www.google.com" }], (assertErrors) => {
            
            expect(assertErrors.length).toBe(3);
            expect(assertErrors[0]).toContain("URL expected to fail but was 200 ok: https://www.github.com");
            expect(assertErrors[1]).toContain("URL expected to fail but was 200 ok: https://www.stackoverflow.com");
            expect(assertErrors[2]).toContain("URL expected to fail but was 200 ok: https://www.google.com");
            
            done();
        });
    });
});