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
    
    beforeEach(function() {
        
        this.sut = new HTTPTestsManager(20000);
    });
    
    
    it('should correctly find duplicate urls for the assertUrlsFail method', function() {

        expect(() => {this.sut.assertUrlsFail(['aaaaaaaaaa', 'bbbbbbbbbb', 'aaaaaaaaaa'], () => {})})
            .toThrowError(Error, /HTTPTestsManager.assertUrlsFail duplicate urls: aaaaaaaaaa/);
            
        expect(() => {this.sut.assertUrlsFail([{ url: "aaa" }, { url: "ccc" }, { url: "ccc" }], () => {})})
            .toThrowError(Error, /HTTPTestsManager.assertUrlsFail duplicate urls: ccc/);
            
        expect(() => {this.sut.assertUrlsFail(['bbbbbbbbbb', 'aaaaaaaaaa', { url: "bbbbbbbbbb" }], () => {})})
            .toThrowError(Error, /HTTPTestsManager.assertUrlsFail duplicate urls: bbbbbbbbbb/);
    });
    
    
    it('should correctly execute the assertUrlsFail method when a list of invalid string urls are passed', async function() {

        await this.sut.assertUrlsFail(['', ' ', 'asdfsdfasdfasdf', '121212121212', 'https://invalid']);
    });
    
    
    it('should correctly execute the assertUrlsFail method when a list of objects containing invalid urls are passed', async function() {

        let urls = [{ url: "" }, { url: " " }, { url: "asdfsdfasdfasdf" }, { url: "121212121212" }, { url: "https://invalid" }];
        
        await this.sut.assertUrlsFail(urls);
    });
    
    
    it('should correctly execute the assertUrlsFail method when a mixed list of invalid string urls and objects containing invalid urls are passed', async function() {

        let urls = ['1', { url: "" }, 'asdfsdfasdfasdf', { url: " " }, { url: "rtrtrtyrtyrty" }, 'https://invalid', { url: "121212121212" }, { url: "https://invalid2" }];
        
        await this.sut.assertUrlsFail(urls);
    });
    
    
    it('should correctly perform the expected assertions on the assertUrlsFail method when an invalid url is provided', async function() {

        let urls = [{
            url: "https://stackoverflow.com/%",
            responseCode: 400,
            contains: ['<', 'Bad Request'],
            notContains: '23423werewrwer----34534534'
        }];
        
        await this.sut.assertUrlsFail(urls);
    });
    
    
    it('should generate assert exceptions for the assertUrlsFail method when a list of valid string urls are passed', async function() {

        this.sut.isAssertExceptionsEnabled = false;
        
        await this.sut.assertUrlsFail(['https://www.google.com', 'https://www.github.com']).then((results) => {
            
            expect(results.assertErrors.length).toBe(2);
            expect(results.assertErrors[0]).toContain("URL expected to fail but was 200 ok: https://www.google.com");
            expect(results.assertErrors[1]).toContain("URL expected to fail but was 200 ok: https://www.github.com");
        });
    });
    
    
    it('should generate assert exceptions for the assertUrlsFail method when a list of valid string urls (after replacing the wildcards) are passed', async function() {

        this.sut.isAssertExceptionsEnabled = false;
        this.sut.wildcards = { $host: 'www.google.com' };
        
        await this.sut.assertUrlsFail(['https://$host']).then((results) => {
            
            expect(results.assertErrors.length).toBe(1);
            expect(results.assertErrors[0]).toContain("URL expected to fail but was 200 ok: https://www.google.com");
        });
    });
    
    
    it('should generate assert exceptions for the assertUrlsFail method when a list of objects containing valid urls are passed', async function() {

        this.sut.isAssertExceptionsEnabled = false;
        
        await this.sut.assertUrlsFail([{ url: "https://www.turboframework.org" }, { url: "https://www.google.com" }]).then((results) => {
            
            expect(results.assertErrors.length).toBe(2);
            expect(results.assertErrors[0]).toContain("URL expected to fail but was 200 ok: https://www.turboframework.org");
            expect(results.assertErrors[1]).toContain("URL expected to fail but was 200 ok: https://www.google.com");
        });
    });
    
    
    it('should generate assert exceptions for the assertUrlsFail method when a mixed list of valid string urls and objects containing valid urls are passed', async function() {

        this.sut.isAssertExceptionsEnabled = false;
        
        await this.sut.assertUrlsFail([{ url: "https://www.turboframework.org" }, 'https://www.stackoverflow.com', { url: "https://www.google.com" }]).then((results) => {
            
            expect(results.assertErrors.length).toBe(3);
            expect(results.assertErrors[0]).toContain("URL expected to fail but was 200 ok: https://www.turboframework.org");
            expect(results.assertErrors[1]).toContain("URL expected to fail but was 200 ok: https://www.stackoverflow.com");
            expect(results.assertErrors[2]).toContain("URL expected to fail but was 200 ok: https://www.google.com");
        });
    });
    
    
    it('should generate an exception when invalid properties have been passed to an entry for the assertUrlsFail method', async function() {

        this.sut.isAssertExceptionsEnabled = false;
        
        let urls = [{
            url: "someinvalidurl",
            responseCode: 400,
            contains: ['<', 'Bad Request'],
            notContains: '23423werewrwer----34534534',
            someinvalidProp: 'value'
        }];
        
        await this.sut.assertUrlsFail(urls).then((results) => {
            
            expect(results.assertErrors.length).toBe(1);
            expect(results.assertErrors[0]).toContain("Object has unexpected key: someinvalidProp");
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
    
    
    it('should correctly execute the assertHttpRequests method when a list of valid string urls are passed', async function() {

        await this.sut.assertHttpRequests(['https://www.google.com', 'https://www.github.com']);      
    });
    
    
    it('should correctly execute the assertHttpRequests method when a list of objects containing valid urls are passed', async function() {

        await this.sut.assertHttpRequests([{ url: "https://www.github.com" }, { url: "https://www.google.com" }]);
    });
    
    
    it('should correctly execute the assertHttpRequests method when a mixed list of valid string urls and objects containing valid urls are passed', async function() {

        await this.sut.assertHttpRequests([{ url: "https://www.github.com" }, 'https://www.stackoverflow.com', { url: "https://www.google.com" }]);
    });
    
    
    it('should correctly perform the expected assertions on the assertHttpRequests method when a valid url is provided', async function() {

        let urls = [{
            url: "https://stackoverflow.com",
            responseCode: 200,
            contains: ['<', 'head'],
            notContains: '23423werewrwer----34534534'
        }];
        
        await this.sut.assertHttpRequests(urls); 
    });
    
    
    it('should generate assert exceptions for the assertHttpRequests method when a list of invalid string urls are passed', async function() {

        this.sut.isAssertExceptionsEnabled = false;
        
        await this.sut.assertHttpRequests(['invalid1', 'invalid2']).then((result) => {
            
            expect(result.assertErrors.length).toBe(2);
            expect(result.assertErrors[0]).toContain("HTTPManager could not execute request to invalid1");
            expect(result.assertErrors[1]).toContain("HTTPManager could not execute request to invalid2");
        });  
    });
    
    
    it('should generate assert exceptions for the assertHttpRequests method when a list of objects containing invalid urls are passed', async function() {

        this.sut.isAssertExceptionsEnabled = false;
        
        await this.sut.assertHttpRequests([{ url: "invalid1" }, { url: "invalid2" }]).then((result) => {
            
            expect(result.assertErrors.length).toBe(2);
            expect(result.assertErrors[0]).toContain("HTTPManager could not execute request to invalid1");
            expect(result.assertErrors[1]).toContain("HTTPManager could not execute request to invalid2");
        });
    });
    
    
    it('should generate assert exceptions for the assertHttpRequests method when an url that gives error code is passed', async function() {

        this.sut.isAssertExceptionsEnabled = false;
        
        await this.sut.assertHttpRequests(["https://stackoverflow.com/%"]).then((result) => {
            
            expect(result.responses[0]).toContain('Bad Request');
            expect(result.assertErrors.length).toBe(1);
            expect(result.assertErrors[0]).toContain("Could not load url (400)");
            expect(result.assertErrors[0]).toContain("Bad Request");
            expect(result.assertErrors[0]).toContain("<");
        });
    });
    
    
    it('should generate assert exceptions for the assertHttpRequests method when a mixed list of invalid string urls and objects containing invalid urls are passed', async function() {

        this.sut.isAssertExceptionsEnabled = false;
        
        await this.sut.assertHttpRequests([{ url: "invalid1" }, 'invalid2', { url: "invalid3" }]).then((result) => {
            
            expect(result.assertErrors.length).toBe(3);
            expect(result.assertErrors[0]).toContain("HTTPManager could not execute request to invalid1");
            expect(result.assertErrors[1]).toContain("HTTPManager could not execute request to invalid2");
            expect(result.assertErrors[2]).toContain("HTTPManager could not execute request to invalid3");
        });  
    });
    
    
    it('should generate an exception when invalid properties have been passed to an entry for the assertHttpRequests method', async function() {

        this.sut.isAssertExceptionsEnabled = false;
        
        let urls = [{
            url: "someinvalidurl",
            responseCode: 200,
            someinvalidProp: 'value'
        }];
        
        await this.sut.assertHttpRequests(urls).then((result) => {
            
            expect(result.assertErrors.length).toBe(3);
            expect(result.assertErrors[0]).toContain("Object has unexpected key: someinvalidProp");
            expect(result.assertErrors[1]).toContain("HTTPManager could not execute request to someinvalidurl");
            expect(result.assertErrors[2]).toContain("Response code for the url: someinvalidurl was expected to be 200 but was 0");
        });
    });
    
    
    it('should correctly execute the assertMethodToUrls method when a list of valid string urls are passed', async function() {

        let urls = [
            {
                url: 'https://turboframework.org/en/blog/2024-02-19/easily-show-material-calendar-with-angular-to-pick-date',
                postParameters: {},
                data: 'show an Angular material calendar'
            },
            {
                url: 'https://turboframework.org/en/blog/2024-01-01/get-size-file-directory-using-javascript-typescript-php',
                postParameters: {},
                data: 'size of a file or a directory'
            } 
        ];

        await this.sut.assertMethodToUrls(urls, (assertData) => {
            
            expect(assertData.response).toContain(assertData.data);
        });  
    });
    
    
    it('should generate assert exceptions for the assertMethodToUrls method when the urls are invalid', async function() {

        this.sut.isAssertExceptionsEnabled = false;
        
        let urls = [
            {
                url: 'uHFtFgrt2ty66TGGHhfg2ghH$$',
                postParameters: {},
                data: ''
            },
            {
                url: '1232343423432HGGGg--',
                postParameters: {},
                data: ''
            } 
        ];
        
        await this.sut.assertMethodToUrls(urls, (assertData) => {
            
        }).then((result) => {
            
            expect(result.assertErrors.length).toBe(2);
            expect(result.assertErrors[0]).toContain("Error performing http request to uHFtFgrt2ty66TGGHhfg2ghH$$");
            expect(result.assertErrors[1]).toContain("Error performing http request to 1232343423432HGGGg--");
        });  
    });
    
    
    it('should generate assert exceptions for the assertMethodToUrls method when the assert method fails the verification', async function() {

        this.sut.isAssertExceptionsEnabled = false;
        
        let urls = [
            {
                url: 'https://turboframework.org/en/blog/2024-02-19/easily-show-material-calendar-with-angular-to-pick-date',
                postParameters: {},
                data: 'hgfGgt2tgVhg2gbHbv2ghnNh2'
            },
            {
                url: 'https://turboframework.org/en/blog/2024-01-01/get-size-file-directory-using-javascript-typescript-php',
                postParameters: {},
                data: 'cocococococococococo'
            } 
        ];
        
        await this.sut.assertMethodToUrls(urls, (assertData) => {
            
            if(!assertData.response.includes(assertData.data)){
            
                throw new Error(assertData.data + ' not found');
            }
            
        }).then((result) => {
            
            expect(result.assertErrors.length).toBe(2);
            expect(result.assertErrors[0]).toContain("hgfGgt2tgVhg2gbHbv2ghnNh2 not found");
            expect(result.assertErrors[1]).toContain("cocococococococococo");
        });  
    });
    
    
    it('should throw exception when calling assertMethodToUrls if the provided url object does not have mandatory properties', function() {

        let urls = [
            {
                url: 'https://turboframework.org/en/blog/2024-02-19/easily-show-material-calendar-with-angular-to-pick-date',
                data: 'hgfGgt2tgVhg2gbHbv2ghnNh2'
            } 
        ];

        expect(() => {this.sut.assertMethodToUrls(urls, () => {})})
            .toThrowError(Error, /Url object does not have mandatory postParameters property/);
        
        
        urls = [
            {
                postParameters: {},
                data: 'cocococococococococo'
            } 
        ];
          
        expect(() => {this.sut.assertMethodToUrls(urls, () => {})})
            .toThrowError(Error, /Url object does not have mandatory url property/);
    });

});