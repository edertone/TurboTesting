#!/usr/bin/env node

'use strict';


/**
 * Tests that check the app view
 */

const path = require('path');
const projectRoot = path.resolve('./');
const { AutomatedBrowserManager } = require(projectRoot + '/target/turbotesting-node/dist/ts/index');


describe('AutomatedBrowserManagerTest', function() {

    beforeAll(function() {
        
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 2500011;
        
        this.automatedBrowserManager = new AutomatedBrowserManager();     
        this.automatedBrowserManager.initializeChrome();
    });

    
    afterAll(function() {
        
        this.automatedBrowserManager.quit();
    });
    
    
    it('should correctly execute the initializeChrome method', function(done) {
    
        // TODO
        done();
    });
    
    
    it('should correctly execute the clearConsole method', function(done) {
    
        // TODO
        done();
    });
    
    
    it('should correctly execute the waitTillBrowserReady method', function(done) {
    
        // TODO
        done();
    });
    
    
    it('should correctly execute the loadUrl method with a basic html page', function(done) {
    
        this.automatedBrowserManager.loadUrl(
            projectRoot + '/src/test/js/resources/managers/automatedBrowserManager/basic-html/basic.html', (results) => {

                expect(results.title).toBe('Convert text to camel case online');
                expect(results.source).toContain('<h1>Convert string to camelCase online</h1>');
                expect(results.finalUrl).toContain('resources/managers/automatedBrowserManager/basic-html/basic.html');
                expect(results.browserLogs.length).toBe(0);
                                  
                done();
            });
    });
    
    
    it('should correctly execute the loadUrl method with an url containing wildcards for a basic html page', function(done) {
    
        this.automatedBrowserManager.wildcards = {$projectRoot: projectRoot};
    
        this.automatedBrowserManager.loadUrl(
            '$projectRoot/src/test/js/resources/managers/automatedBrowserManager/basic-html/basic.html', (results) => {

                expect(results.title).toBe('Convert text to camel case online');
                expect(results.source).toContain('<h1>Convert string to camelCase online</h1>');
                expect(results.finalUrl).toContain('resources/managers/automatedBrowserManager/basic-html/basic.html');
                expect(results.browserLogs.length).toBe(0);
                                  
                done();
            });
    });
    
    
    it('should correctly execute the loadUrl method with an url that contains javascript console errors', function(done) {
        
        this.automatedBrowserManager.loadUrl(
            projectRoot + '/src/test/js/resources/managers/automatedBrowserManager/basic-html/basic-with-error-js.html', (results) => {

                expect(results.title).toBe('Convert text to camel case online');
                expect(results.source).toContain('<body onload="myFunction()">');
                expect(results.finalUrl).toContain('resources/managers/automatedBrowserManager/basic-html/basic-with-error-js.html');
                expect(results.browserLogs.length).toBe(1);
                expect(results.browserLogs[0].message).toContain('myFunction is not defined');
                expect(results.browserLogs[0].level.name).toBe('SEVERE');
                done();
            });
    });
    
    
    it('should throw exceptions when executing the loadUrl method with non existant urls', function(done) {
    
        // TODO - We should test that exceptions are thrown when providing invalid urls to the .loadUrl method.
        // For now, we are not able to test this because we cannot catch async exceptions of the type "Unhandled promise rejection"
        
        // expect(() => {this.automatedBrowserManager.loadUrl('nonexistant.html', done)})
        //    .toThrowError(Error, /Cannot navigate to invalid URL/);
        
        done();
    });
    
    
    it('should correctly execute the assertBrowserState method for a basic html page', function(done) {
    
        this.automatedBrowserManager.wildcards = {$projectRoot: projectRoot};
        
        expect(() => {this.automatedBrowserManager.assertBrowserState([1,2,3])})
            .toThrowError(Error, /provided element is not an object/);
    
        this.automatedBrowserManager.loadUrl(
            '$projectRoot/src/test/js/resources/managers/automatedBrowserManager/basic-html/basic.html', (results) => {
        
            let expected = {
                url: "/src/test/js/resources/managers/automatedBrowserManager/basic-html/basic.html",
                titleContains: "Convert text to camel case online",
                loadedHtmlStartsWith: '<html lang="en">',
                loadedHtmlEndsWith: "</html>",
                loadedHtmlContains: [
                    '<meta name="description" content="An online text to camelCase calculator">',
                    '<footer>',
                    '<h4>© 2018 Edertone Advanced Solutions</h4>',
                    '</footer>',
                    '</html>'
                ],
                loadedHtmlNotContains: 'nottocontaintextstring'
            };
    
            this.automatedBrowserManager.assertBrowserState(expected, done); 
        });
    });
    
    
    it('should correctly execute the assertBrowserState method for the google.com page', function(done) {
        
        this.automatedBrowserManager.loadUrl(
            'https://www.google.com', (results) => {
        
            let expected = {
                url: "google.com",
                titleContains: "Google",
                loadedHtmlStartsWith: '<html',
                loadedHtmlEndsWith: "</html>",
                loadedHtmlContains: ['Google'],
                loadedHtmlNotContains: 'nottocontaintextstring',
                sourceHtmlStartsWith: '<!doctype html>',
                sourceHtmlEndsWith: "</html>",
                sourceHtmlContains: ['Google'],
                sourceHtmlNotContains: 'nottocontaintextstring'
            };
    
            this.automatedBrowserManager.assertBrowserState(expected, done);    
        });
    });


    it('should throw exceptions when executing the assertBrowserState method with wrong values', function(done) {
    
        // TODO - We should test that exceptions are thrown when providing invalid values to the method.
        // For now, we are not able to test this because we cannot catch async exceptions of the type "Unhandled promise rejection"
        
        done();
    });


    it('should correctly execute the assertUrlsLoadOk method', function(done) {
        
        this.automatedBrowserManager.wildcards = {$projectRoot: projectRoot};
    
        let expected = [{
            url: "$projectRoot/src/test/js/resources/managers/automatedBrowserManager/basic-html/basic.html",
            titleContains: "Convert text to camel case online",
            loadedHtmlStartsWith: '<html',
            loadedHtmlEndsWith: "</html>",
            loadedHtmlContains: [
                '<meta name="description" content="An online text to camelCase calculator">',
                '<footer>',
                '<h4>© 2018 Edertone Advanced Solutions</h4>',
                '</footer>',
                '</html>'
            ],
            loadedHtmlNotContains: 'nottocontaintextstring',
            sourceHtmlStartsWith: '<!doctype html>',
            sourceHtmlEndsWith: "</html>",
            sourceHtmlContains: [
                '<meta name="description" content="An online text to camelCase calculator">',
                '<footer>',
                '<h4>© 2018 Edertone Advanced Solutions</h4>',
                '</footer>',
                '</html>'
            ],
            sourceHtmlNotContains: 'nottocontaintextstring'                 
        }];

        this.automatedBrowserManager.assertUrlsLoadOk(expected, done);
    });
    
    
    it('should correctly execute the assertUrlsLoadOk method on an internet url with asserts on the original source code', function(done) {
        
        // To perform this test we are using the github readme file url that should not change ever
         
        let expected = [{
            url: "https://github.com/edertone/TurboTesting/blob/master/README.md",
            titleContains: "TurboTesting/README.md",
            loadedHtmlContains: '<head>',
            loadedHtmlNotContains: 'nottocontaintextstring',
            sourceHtmlContains: ['<!DOCTYPE html>', '<head>'],
            sourceHtmlNotContains: 'nottocontaintextstring'                    
        }];
                        
        this.automatedBrowserManager.assertUrlsLoadOk(expected, done);
    });
    
    
    it('should correctly execute the assertUrlsRedirect method', function(done) {
        
        this.automatedBrowserManager.wildcards = {$projectRoot: projectRoot};
    
        let expected = [{
            url: "$projectRoot/src/test/js/resources/managers/automatedBrowserManager/basic-html/basic-with-redirect.html",
            to: "src/test/js/resources/managers/automatedBrowserManager/basic-html/basic.html"      
        }];
    
        this.automatedBrowserManager.assertUrlsRedirect(expected, done);
    });
});