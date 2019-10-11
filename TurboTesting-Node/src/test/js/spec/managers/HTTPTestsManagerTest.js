"use strict";

/**
 * TurboTesting is a general purpose cross-language library to improve automated testing productivity
 *
 * Website : -> http://www.turboframework.org
 * License : -> Licensed under the Apache License, Version 2.0. You may not use this file except in compliance with the License.
 * License Url : -> http://www.apache.org/licenses/LICENSE-2.0
 * CopyRight : -> Copyright 2015 Edertone Advanded Solutions (08211 Castellar del Vallès, Barcelona). http://www.edertone.com
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
    
    
    it('should generate an exception when invalid properties have been passed to an entry for the assertUrlsFail method', function(done) {

        this.sut.isAssertExceptionsEnabled = false;
        
        let urls = [{
            url: "someinvalidurl",
            responseCode: 400,
            contains: ['<', 'Bad Request'],
            notContains: '23423werewrwer----34534534',
            someinvalidProp: 'value'
        }];
        
        this.sut.assertUrlsFail(urls, (assertErrors) => {
            
            expect(assertErrors.length).toBe(1);
            expect(assertErrors[0]).toContain("Object has unexpected key: someinvalidProp");
            
            done();
        });
    });
    
    
    it('should correctly find duplicate urls for the assertHttpRequests method', function() {

        expect(() => {this.sut.assertHttpRequests(['aaaaaaaaaa', 'bbbbbbbbbb', 'aaaaaaaaaa'], () => {})})
            .toThrowError(Error, /HTTPTestsManager.assertHttpRequests duplicate urls: aaaaaaaaaa/);
            
        expect(() => {this.sut.assertHttpRequests([{ url: "aaa" }, { url: "ccc" }, { url: "ccc" }], () => {})})
            .toThrowError(Error, /HTTPTestsManager.assertHttpRequests duplicate urls: ccc/);
            
        expect(() => {this.sut.assertHttpRequests(['bbbbbbbbbb', 'aaaaaaaaaa', { url: "bbbbbbbbbb" }], () => {})})
            .toThrowError(Error, /HTTPTestsManager.assertHttpRequests duplicate urls: bbbbbbbbbb/);      
    });
    
    
    it('should correctly execute the assertHttpRequests method when a list of valid string urls are passed', function(done) {

        this.sut.assertHttpRequests(['https://www.google.com', 'https://www.github.com'], done);      
    });
    
    
    it('should correctly execute the assertHttpRequests method when a list of objects containing valid urls are passed', function(done) {

        this.sut.assertHttpRequests([{ url: "https://www.github.com" }, { url: "https://www.google.com" }], done);
    });
    
    
    it('should correctly execute the assertHttpRequests method when a mixed list of valid string urls and objects containing valid urls are passed', function(done) {

        this.sut.assertHttpRequests([{ url: "https://www.github.com" }, 'https://www.stackoverflow.com', { url: "https://www.google.com" }], done);
    });
    
    
    it('should correctly perform the expected assertions on the assertHttpRequests method when a valid url is provided', function(done) {

        let urls = [{
            url: "https://stackoverflow.com",
            responseCode: 200,
            contains: ['<', 'head'],
            notContains: '23423werewrwer----34534534'
        }];
        
        this.sut.assertHttpRequests(urls, done); 
    });
    
    
    it('should generate assert exceptions for the assertHttpRequests method when a list of invalid string urls are passed', function(done) {

        this.sut.isAssertExceptionsEnabled = false;
        
        this.sut.assertHttpRequests(['invalid1', 'invalid2'], (responses, assertErrors) => {
            
            expect(assertErrors.length).toBe(2);
            expect(assertErrors[0]).toContain("HTTPManager could not execute request to invalid1");
            expect(assertErrors[1]).toContain("HTTPManager could not execute request to invalid2");
            
            done();
        });  
    });
    
    
    it('should generate assert exceptions for the assertHttpRequests method when a list of objects containing invalid urls are passed', function(done) {

        this.sut.isAssertExceptionsEnabled = false;
        
        this.sut.assertHttpRequests([{ url: "invalid1" }, { url: "invalid2" }], (responses, assertErrors) => {
            
            expect(assertErrors.length).toBe(2);
            expect(assertErrors[0]).toContain("HTTPManager could not execute request to invalid1");
            expect(assertErrors[1]).toContain("HTTPManager could not execute request to invalid2");
            
            done();
        });
    });
    
    
    it('should generate assert exceptions for the assertHttpRequests method when an url that gives error code is passed', function(done) {

        this.sut.isAssertExceptionsEnabled = false;
        
        this.sut.assertHttpRequests(["https://stackoverflow.com/%"], (responses, assertErrors) => {
            
            expect(responses[0]).toContain('Bad Request');
            expect(assertErrors.length).toBe(1);
            expect(assertErrors[0]).toContain("Could not load url (400)");
            expect(assertErrors[0]).toContain("Bad Request");
            expect(assertErrors[0]).toContain("<");
            
            done();
        });
    });
    
    
    it('should generate assert exceptions for the assertHttpRequests method when a mixed list of invalid string urls and objects containing invalid urls are passed', function(done) {

        this.sut.isAssertExceptionsEnabled = false;
        
        this.sut.assertHttpRequests([{ url: "invalid1" }, 'invalid2', { url: "invalid3" }], (responses, assertErrors) => {
            
            expect(assertErrors.length).toBe(3);
            expect(assertErrors[0]).toContain("HTTPManager could not execute request to invalid1");
            expect(assertErrors[1]).toContain("HTTPManager could not execute request to invalid2");
            expect(assertErrors[2]).toContain("HTTPManager could not execute request to invalid3");
            
            done();
        });  
    });
    
    
    it('should generate an exception when invalid properties have been passed to an entry for the assertHttpRequests method', function(done) {

        this.sut.isAssertExceptionsEnabled = false;
        
        let urls = [{
            url: "someinvalidurl",
            responseCode: 200,
            someinvalidProp: 'value'
        }];
        
        this.sut.assertHttpRequests(urls, (responses, assertErrors) => {
            
            expect(assertErrors.length).toBe(3);
            expect(assertErrors[0]).toContain("Object has unexpected key: someinvalidProp");
            expect(assertErrors[1]).toContain("HTTPManager could not execute request to someinvalidurl");
            expect(assertErrors[2]).toContain("Response code for the url: someinvalidurl was expected to be 200 but was 0");
            
            done();
        });
    });
});