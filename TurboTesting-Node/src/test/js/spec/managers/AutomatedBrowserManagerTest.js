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
const { AutomatedBrowserManager } = require(projectRoot + '/target/turbotesting-node/dist/ts/index');


describe('AutomatedBrowserManagerTest', function() {

    beforeAll(function() {
        
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
    
    
    it('should correctly execute the setBrowserSizeAndPosition method', function(done) {
    
        // TODO
        done();
    });
    
    
    it('should correctly execute the setBrowserAsMaximized method', function(done) {
    
        // TODO
        done();
    });
    
    
    it('should correctly execute the setBrowserAsFullScreen method', function(done) {
    
        // TODO
        done();
    });
    
    
    it('should correctly execute the setBrowserActiveTab method', function(done) {
    
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
    
    
    it('should correctly execute the waitMilliseconds method', function(done) {
    
        // TODO
        done();
    });
    
    
    it('should correctly execute the loadUrl method with a basic html page', function(done) {
    
        this.automatedBrowserManager.loadUrl(
            projectRoot + '/src/test/resources/managers/automatedBrowserManager/basic-html/basic.html', (results) => {

                expect(results.title).toBe('Convert text to camel case online');
                expect(results.source).toContain('<h1>Convert string to camelCase online</h1>');
                expect(results.finalUrl).toContain('resources/managers/automatedBrowserManager/basic-html/basic.html');
                expect(this.automatedBrowserManager.logEntries.length).toBe(0);
                                  
                done();
            });
    });
    
    
    it('should correctly execute the loadUrl method with an url containing wildcards for a basic html page', function(done) {
    
        this.automatedBrowserManager.wildcards = {$projectRoot: projectRoot};
    
        this.automatedBrowserManager.loadUrl(
            '$projectRoot/src/test/resources/managers/automatedBrowserManager/basic-html/basic.html', (results) => {

                expect(results.title).toBe('Convert text to camel case online');
                expect(results.source).toContain('<h1>Convert string to camelCase online</h1>');
                expect(results.finalUrl).toContain('resources/managers/automatedBrowserManager/basic-html/basic.html');
                expect(this.automatedBrowserManager.logEntries.length).toBe(0);
                                  
                done();
            });
    });
    
    
    it('should correctly execute the loadUrl method with an url that contains javascript console errors', function(done) {
        
        this.automatedBrowserManager.loadUrl(
            projectRoot + '/src/test/resources/managers/automatedBrowserManager/basic-html/basic-with-error-js.html', (results) => {

                expect(results.title).toBe('Convert text to camel case online');
                expect(results.source).toContain('<body onload="myFunction()">');
                expect(results.finalUrl).toContain('resources/managers/automatedBrowserManager/basic-html/basic-with-error-js.html');
                expect(this.automatedBrowserManager.logEntries.length).toBe(1);
                expect(this.automatedBrowserManager.logEntries[0].message).toContain('myFunction is not defined');
                expect(this.automatedBrowserManager.logEntries[0].level.name).toBe('SEVERE');
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
            '$projectRoot/src/test/resources/managers/automatedBrowserManager/basic-html/basic.html', (results) => {
        
            let expected = {
                url: "/src/test/resources/managers/automatedBrowserManager/basic-html/basic.html",
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
                loadedHtmlRegExp: /Google/,
                loadedHtmlNotContains: 'nottocontaintextstring',
                sourceHtmlStartsWith: '<!doctype html>',
                sourceHtmlEndsWith: "</html>",
                sourceHtmlContains: ['Google'],
                sourceHtmlRegExp: /Google/,
                sourceHtmlNotContains: 'nottocontaintextstring'
            };
    
            this.automatedBrowserManager.assertBrowserState(expected, done);    
        });
    });
    
    
    it('should correctly execute the assertBrowserState method when checking for the number of open tabs on the browser', function(done) {
        
        this.automatedBrowserManager.wildcards = {$projectRoot: projectRoot};
        
        this.automatedBrowserManager.loadUrl(
            '$projectRoot/src/test/resources/managers/automatedBrowserManager/basic-html/basic.html', () => {
        
            this.automatedBrowserManager.assertBrowserState({ tabsCount: 1 }, done); 
        });
    });
    
    
    it('should correctly ignore all the console errors on the assertBrowserState method when enabling ALL ignoreConsoleErrors', function(done) {
        
        this.automatedBrowserManager.loadUrl(
            projectRoot + '/src/test/resources/managers/automatedBrowserManager/basic-html/basic-with-error-js.html', (results) => {
        
            expect(this.automatedBrowserManager.logEntries.length).toBe(1);
            expect(this.automatedBrowserManager.logEntries[0].message).toContain('myFunction is not defined');
            expect(this.automatedBrowserManager.logEntries[0].level.name).toBe('SEVERE');
            
            let expected = {
                url: "basic-with-error-js.html",
                titleContains: "Convert text to camel case online",
                sourceHtmlContains: "myFunction()",
                ignoreConsoleErrors: true
            };
    
            this.automatedBrowserManager.assertBrowserState(expected, done);    
        });
    });
    
    
    it('should correctly ignore the console errors when specified globally by the instance ignoreConsoleErrors property', function(done) {
        
        this.automatedBrowserManager.ignoreConsoleErrors = ['myFunction is not defined'];
        
        this.automatedBrowserManager.loadUrl(
            projectRoot + '/src/test/resources/managers/automatedBrowserManager/basic-html/basic-with-error-js.html', (results) => {
        
            let expected = {
                url: "basic-with-error-js.html",
                titleContains: "Convert text to camel case online",
                sourceHtmlContains: "myFunction()"
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
            url: "$projectRoot/src/test/resources/managers/automatedBrowserManager/basic-html/basic.html",
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
            url: "$projectRoot/src/test/resources/managers/automatedBrowserManager/basic-html/basic-with-redirect.html",
            to: "src/test/resources/managers/automatedBrowserManager/basic-html/basic.html"      
        }];
    
        this.automatedBrowserManager.assertUrlsRedirect(expected, done);
    });
    
    
    it('should correctly execute the assertUrlsFail method', function(done) {
        
        // TODO
        done();
    });
    
    
    it('should correctly execute the assertExistXpath method', function(done) {
        
        this.automatedBrowserManager.loadUrl(
            projectRoot + '/src/test/resources/managers/automatedBrowserManager/basic-html/basic-with-input.html', () => {
                
            this.automatedBrowserManager.assertExistXpath("//*[@id='someInput']", true, (elements) => {
                
                expect(elements.length).toBe(1);
                    
                this.automatedBrowserManager.assertExistXpath("//*[@id='nonexistantId']", false, (elements2) => {
                    
                    expect(elements2.length).toBe(0);
                    done();
                });
            });
        });
    });
    
    
    it('should correctly execute the assertExistId method', function(done) {
        
        this.automatedBrowserManager.loadUrl(
            projectRoot + '/src/test/resources/managers/automatedBrowserManager/basic-html/basic-with-input.html', () => {
                
            this.automatedBrowserManager.assertExistId("someInput", true, (elements) => {
                
                expect(elements.length).toBe(1);
                    
                this.automatedBrowserManager.assertExistId("nonexistantId", false, (elements2) => {
                    
                    expect(elements2.length).toBe(0);
                    done();
                });
            });
        });
    });
    
    
    it('should correctly execute the assertExistElement method', function(done) {
        
        this.automatedBrowserManager.loadUrl(
            projectRoot + '/src/test/resources/managers/automatedBrowserManager/basic-html/basic-with-input.html', () => {
            
            this.automatedBrowserManager.assertExistElement("input", true, (elements) => {
                
                expect(elements.length).toBe(1);
                        
                this.automatedBrowserManager.assertExistElement(["input", "h1", "section"], true, (elements2) => {
                    
                    expect(elements2.length).toBe(3);
                        
                    this.automatedBrowserManager.assertExistElement("nonexistantElement1", false, (elements3) => {
                        
                        expect(elements3.length).toBe(0);
                        
                        this.automatedBrowserManager.assertExistElement(["nonexistantElement1", "nonexistantElement2"], false, (elements4) => {
                            
                            expect(elements4.length).toBe(0);
                            done();
                        });
                    });
                });
            });
        });
    });
    
    
    it('should correctly execute the assertVisibleXpath method', function(done) {
        
        this.automatedBrowserManager.loadUrl(
            projectRoot + '/src/test/resources/managers/automatedBrowserManager/basic-html/basic-with-input-invisible.html', () => {
            
            this.automatedBrowserManager.assertVisibleXpath("//*[@id='someInput']", true, (elements) => {
                
                expect(elements.length).toBe(1);
                        
                this.automatedBrowserManager.assertVisibleXpath(["//*[@id='someInput']", "/html/body/main/section/h1"], true, (elements2) => {
                    
                    expect(elements2.length).toBe(2);
                        
                    this.automatedBrowserManager.assertVisibleXpath("//*[@id='invisibleInput']", false, (elements3) => {
                        
                        expect(elements3.length).toBe(1);
                        done();
                    });
                });
            });
        });
    });
    
    
    it('should correctly execute the assertClickableXpath method', function(done) {
        
        this.automatedBrowserManager.loadUrl(
            projectRoot + '/src/test/resources/managers/automatedBrowserManager/basic-html/basic-with-input-disabled.html', () => {
            
            this.automatedBrowserManager.assertClickableXpath("//*[@id='someInput']", true, (elements) => {
                
                expect(elements.length).toBe(1);
                        
                this.automatedBrowserManager.assertClickableXpath(["//*[@id='someInput']", "/html/body/main/section/h1"], true, (elements2) => {
                    
                    expect(elements2.length).toBe(2);
                        
                    this.automatedBrowserManager.assertClickableXpath("//*[@id='disabledInput']", false, (elements3) => {
                        
                        expect(elements3.length).toBe(1);
                        done();
                    });
                });
            });
        });
    });
    
    
    it('should correctly execute the assertSnapshot method', function(done) {
        
        // TODO
        done();
    });
    
    
    it('should correctly execute the assertWholeWebSite method', function(done) {
        
        // TODO
        done();
    });
    
    
    it('should correctly execute the clickById method', function(done) {
        
        // TODO        
        done();
    });
    
    
    it('should correctly execute the clickByXpath method', function(done) {
        
        // TODO        
        done();
    });
    
    
    it('should correctly execute the clearInputById method', function(done) {
        
        // TODO        
        done();
    });
    
    
    it('should correctly execute the clearInputByXpath method', function(done) {
        
        // TODO        
        done();
    });
    
    
    it('should correctly execute the sendKeysById method', function(done) {
        
        this.automatedBrowserManager.loadUrl(
            projectRoot + '/src/test/resources/managers/automatedBrowserManager/basic-html/basic-with-input.html', () => {
                
            this.automatedBrowserManager.sendKeysById('someInput', 'some text here', () => {
                
                this.automatedBrowserManager.getAttributeById('someInput', 'value', (text) => {

                    expect(text).toBe('some text here');
                    done();
                })
            });
        });
    });
    
    
    it('should correctly execute the sendKeysByXpath method', function(done) {
        
        // TODO
        done();
    });
    
    
    it('should correctly execute the getAttributeById method', function(done) {
        
        // TODO        
        done();
    });
    
    
    it('should correctly execute the getAttributeByXpath method', function(done) {
        
        // TODO        
        done();
    });
    
    
    it('should correctly execute the queryCalls method', function(done) {
        
        // TODO        
        done();
    });
    
    
    it('should correctly execute the quit method', function(done) {
        
        // TODO        
        done();
    });
});