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
const { FilesManager } = require('turbodepot-node');

const fm = new FilesManager();


describe('AutomatedBrowserManagerTest', function() {

    beforeAll(async function() {
        
        this.automatedBrowserManager = new AutomatedBrowserManager();     
        this.automatedBrowserManager.initializeChrome();
    });
    
    
    beforeEach(async function() {
        
        this.automatedBrowserManager.wildcards = {};
        this.automatedBrowserManager.waitTimeout = 20000;
        this.automatedBrowserManager.ignoreConsoleErrors = [];
        
        await this.automatedBrowserManager.setBrowserSizeAndPosition(1024, 768, 0, 0);
    });

    
    afterAll(async function() {
        
        await this.automatedBrowserManager.quit();
    });
    
    
    it('should correctly execute the initializeChrome method', async function() {
    
        // TODO
    });
    
    
    it('should correctly execute the setBrowserSizeAndPosition method', async function() {
    
        await expectAsync(this.automatedBrowserManager.setBrowserSizeAndPosition('invalid', 100, 100, 100))
            .toBeRejectedWithError(/invalid is not defined/);
        
        await expectAsync(this.automatedBrowserManager.setBrowserSizeAndPosition(500, 'invalid height', 100, 100))
            .toBeRejectedWithError(/Unexpected identifier/);
            
        await expectAsync(this.automatedBrowserManager.setBrowserSizeAndPosition(500, 100, 'invalid x', 100))
            .toBeRejectedWithError(/.x. must be a number/);
            
        await expectAsync(this.automatedBrowserManager.setBrowserSizeAndPosition(500, 100, 100, 'invalid y'))
            .toBeRejectedWithError(/.y. must be a number/);
                
        await expectAsync(this.automatedBrowserManager.setBrowserSizeAndPosition(500, 100, 100, 100)).toBeResolved();
    });
    
    
    it('should correctly resize the browser internal viewport when calling setBrowserSizeAndPosition', async function() {
   
        await this.automatedBrowserManager.queryCalls([
            ['loadUrl', projectRoot + '/src/test/resources/managers/automatedBrowserManager/basic-html/basic.html'],
            ['assertBrowserState', { viewportSize: '1024x768' }],
            ['setBrowserSizeAndPosition', 800, 600, 0, 0],
            ['assertBrowserState', { viewportSize: '800x600' }],
            ['setBrowserSizeAndPosition', 500, 400, 0, 0],
            ['assertBrowserState', { viewportSize: '500x400' }],
            ['setBrowserSizeAndPosition', 600, 600, 0, 0],
            ['assertBrowserState', { viewportSize: '600x600' }],
            ['setBrowserSizeAndPosition', 800, 100, 0, 0],
            ['assertBrowserState', { viewportSize: '800x100' }]
        ]);
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
    
    
    it('should throw exception when passing an invalid snapShotPath to the saveSnapshot method', function() {
    
        expect(() => {this.automatedBrowserManager.saveSnapshot('')})
            .toThrowError(Error, /Snapshot path must be to a PNG file/);
         
        expect(() => {this.automatedBrowserManager.saveSnapshot(projectRoot + 'asdfasdfas')})
            .toThrowError(Error, /Snapshot path must be to a PNG file[\s\S]*asdfasdfas/);
            
        expect(() => {this.automatedBrowserManager.saveSnapshot(projectRoot + 'asdfasdfas/dfasdfasdfasdfa.png', '', {})})
            .toThrowError(Error, /Cannot save snapshot to non existant path[\s\S]*dfasdfasdfasdfa/);
    });
    
    
    it('should correctly execute the saveSnapshot method', async function() {
    
        let snapshotpath = fm.getOSTempDirectory() + '/saveSnapshot-jasmine-test.png';
    
        await this.automatedBrowserManager.saveSnapshot(snapshotpath)
            .then(() => {
                
                expect(fm.isFile(snapshotpath)).toBe(true);
                expect(fm.deleteFile(snapshotpath)).toBe(true);
            });
    });
        
    
    it('should correctly execute the waitTillBrowserReady method', async function() {
    
        await expectAsync(this.automatedBrowserManager.waitTillBrowserReady()).toBeResolved();
    });
    
    
    it('should correctly execute the waitMilliseconds method', function(done) {
    
        // TODO
        done();
    });
    
    
    it('should correctly execute the loadUrl method with a basic html page', async function() {
    
        await this.automatedBrowserManager.loadUrl(projectRoot + '/src/test/resources/managers/automatedBrowserManager/basic-html/basic.html')
            .then((results) => {

                expect(results.title).toBe('Convert text to camel case online');
                expect(results.source).toContain('<h1>Convert string to camelCase online</h1>');
                expect(results.finalUrl).toContain('resources/managers/automatedBrowserManager/basic-html/basic.html');
                expect(this.automatedBrowserManager.logEntries.length).toBe(0);
            });
    });
    
    
    it('should correctly execute the loadUrl method with an url containing wildcards for a basic html page', async function() {
    
        this.automatedBrowserManager.wildcards = {$projectRoot: projectRoot};
    
        await this.automatedBrowserManager.loadUrl('$projectRoot/src/test/resources/managers/automatedBrowserManager/basic-html/basic.html')
            .then((results) => {

                expect(results.title).toBe('Convert text to camel case online');
                expect(results.source).toContain('<h1>Convert string to camelCase online</h1>');
                expect(results.finalUrl).toContain('resources/managers/automatedBrowserManager/basic-html/basic.html');
                expect(this.automatedBrowserManager.logEntries.length).toBe(0);
            });
    });
    
    
    it('should correctly execute the loadUrl method with an url that contains javascript console errors', async function() {
        
        await this.automatedBrowserManager.loadUrl(projectRoot + '/src/test/resources/managers/automatedBrowserManager/basic-html/basic-with-error-js.html')
            .then((results) => {

                expect(results.title).toBe('Convert text to camel case online');
                expect(results.source).toContain('<body onload="myFunction()">');
                expect(results.finalUrl).toContain('resources/managers/automatedBrowserManager/basic-html/basic-with-error-js.html');
                expect(this.automatedBrowserManager.logEntries.length).toBe(1);
                expect(this.automatedBrowserManager.logEntries[0].message).toContain('myFunction is not defined');
                expect(this.automatedBrowserManager.logEntries[0].level.name).toBe('SEVERE');
            });
    });
    
    
    it('should throw exceptions when executing the loadUrl method with non existant urls', async function() {
    
        await expectAsync(this.automatedBrowserManager.loadUrl(''))
            .toBeRejectedWithError(/Error in loadUrl/);
            
        await expectAsync(this.automatedBrowserManager.loadUrl('nonexistant.html'))
            .toBeRejectedWithError(/Error in loadUrl/);
        
        await expectAsync(this.automatedBrowserManager.loadUrl('$nonexistantwildcard/src/test/resources/managers/automatedBrowserManager/basic-html/basic.html'))
            .toBeRejectedWithError(/Error in loadUrl.*nonexistantwildcard\/src/);
    });
    
    
    it('should correctly execute the assertBrowserState method for a basic html page', async function() {

        this.automatedBrowserManager.wildcards = {$projectRoot: projectRoot};
        
        await this.automatedBrowserManager.loadUrl('$projectRoot/src/test/resources/managers/automatedBrowserManager/basic-html/basic.html')
            .then(() => {
        
            return this.automatedBrowserManager.assertBrowserState({
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
            }); 
        });
    });
    
    
    it('should fail the assertion for the assertBrowserState method for a basic html page when invalid expected values are provided', async function() {

        this.automatedBrowserManager.wildcards = {$projectRoot: projectRoot};
        
        expect(() => {this.automatedBrowserManager.assertBrowserState([1,2,3])})
            .toThrowError(Error, /provided element is not an object/);
    
        await expectAsync(this.automatedBrowserManager.loadUrl('$projectRoot/src/test/resources/managers/automatedBrowserManager/basic-html/basic.html')
            .then(() => {
        
            return this.automatedBrowserManager.assertBrowserState({
                url: "invalid-expected-url-value",
                titleContains: "invalid-expected-title-value",
                loadedHtmlStartsWith: 'invalid-html-starts-with',
                loadedHtmlEndsWith: "invalid-html-ends-with",
                loadedHtmlContains: ['invalid-html-contains'],
                loadedHtmlNotContains: 'html'
            }); 
            
        })).toBeRejectedWithError(/failed with 6 errors[\s\S]*invalid-expected-title-value[\s\S]*invalid-html-starts-with[\s\S]*invalid-html-ends-with[\s\S]*invalid-html-contains[\s\S]*html/);
    });
    
    
    it('should fail the assertion for the assertBrowserState method for a basic html page when invalid expected values are provided for the source HTML', async function() {

        this.automatedBrowserManager.wildcards = {$projectRoot: projectRoot};
        
        await expectAsync(this.automatedBrowserManager.loadUrl('$projectRoot/src/test/resources/managers/automatedBrowserManager/basic-html/basic.html')
            .then(() => {
        
            return this.automatedBrowserManager.assertBrowserState({
                sourceHtmlStartsWith: 'unexpectedStart',
                sourceHtmlEndsWith: "unexpectedEnd",
                sourceHtmlNotContains: 'html',
                sourceHtmlContains: ['unexpectedContains'],
                sourceHtmlRegExp: /unexpectedRegexp/,
            }); 
            
        })).toBeRejectedWithError(/failed with 5 errors[\s\S]*unexpectedStart[\s\S]*unexpectedEnd[\s\S]*NOT expected to contain: html[\s\S]*unexpectedContains[\s\S]*unexpectedRegexp/);
    });
    
    
    it('should correctly execute the assertBrowserState method for a basic html page', async function() {
        
        this.automatedBrowserManager.wildcards = {$projectRoot: projectRoot};

        await this.automatedBrowserManager.loadUrl('$projectRoot/src/test/resources/managers/automatedBrowserManager/basic-html/basic.html')
            .then(() => {
        
            return this.automatedBrowserManager.assertBrowserState({
                url: "automatedBrowserManager/basic-html/basic.html",
                titleContains: "Convert text to camel case online",
                loadedHtmlStartsWith: '<html lang="en">',
                loadedHtmlEndsWith: "</html>",
                loadedHtmlContains: ['Turbo Commons'],
                loadedHtmlRegExp: /Turbo Commons/,
                loadedHtmlNotContains: 'nottocontaintextstring',
                sourceHtmlStartsWith: '<!doctype html>',
                sourceHtmlEndsWith: "</html>",
                sourceHtmlNotContains: 'nottocontaintextstring',
                sourceHtmlContains: ['Turbo Commons'],
                sourceHtmlRegExp: /Turbo Commons/,
            });    
        });
    });
    
    
    it('should fail the assertion for the assertBrowserState method for an internet url when invalid expected values are provided for the source HTML', async function() {

        this.automatedBrowserManager.wildcards = {$projectRoot: projectRoot};

        await expectAsync(this.automatedBrowserManager.loadUrl('$projectRoot/src/test/resources/managers/automatedBrowserManager/basic-html/basic.html')
            .then(() => {
        
            return this.automatedBrowserManager.assertBrowserState({
                sourceHtmlStartsWith: 'unexpectedStart',
                sourceHtmlEndsWith: "unexpectedEnd",
                sourceHtmlNotContains: 'html',
                sourceHtmlContains: ['unexpectedContains'],
                sourceHtmlRegExp: /unexpectedRegexp/
            }); 
            
        })).toBeRejectedWithError(/failed with 5 errors[\s\S]*unexpectedStart[\s\S]*unexpectedEnd[\s\S]*NOT expected to contain: html[\s\S]*unexpectedContains[\s\S]*unexpectedRegexp/);
    });
    
    
    it('should correctly execute the assertBrowserState method when checking for the number of open tabs on the browser', async function() {
        
        this.automatedBrowserManager.wildcards = {$projectRoot: projectRoot};
        
        await this.automatedBrowserManager.loadUrl('$projectRoot/src/test/resources/managers/automatedBrowserManager/basic-html/basic.html')
            .then(() => {
        
            return this.automatedBrowserManager.assertBrowserState({ tabsCount: 1 }); 
        });
    });
    
    
    it('should correctly execute the assertBrowserState method when checking for the viewport size', async function() {
        
        this.automatedBrowserManager.wildcards = {$projectRoot: projectRoot};
        
        await this.automatedBrowserManager.queryCalls([
            ['loadUrl', '$projectRoot/src/test/resources/managers/automatedBrowserManager/basic-html/basic.html'],
            ['assertBrowserState', { viewportSize: '1024x768' }]
        ]);
    });
    
    
    it('should fail assertion when executing the assertBrowserState method checking for a wrong nubmer of open browser tabs', async function() {
        
        this.automatedBrowserManager.wildcards = {$projectRoot: projectRoot};
        
        await expectAsync(this.automatedBrowserManager.loadUrl('$projectRoot/src/test/resources/managers/automatedBrowserManager/basic-html/basic.html')
            .then(() => {
        
            return this.automatedBrowserManager.assertBrowserState({ tabsCount: 2 });
            
        })).toBeRejectedWithError(/Browser tabs count .1. must be: 2/);
    });
    
    
    it('should correctly ignore all the console errors on the assertBrowserState method when enabling ALL ignoreConsoleErrors', async function() {
        
        await this.automatedBrowserManager.loadUrl(projectRoot + '/src/test/resources/managers/automatedBrowserManager/basic-html/basic-with-error-js.html')
            .then(() => {
        
            expect(this.automatedBrowserManager.logEntries.length).toBe(1);
            expect(this.automatedBrowserManager.logEntries[0].message).toContain('myFunction is not defined');
            expect(this.automatedBrowserManager.logEntries[0].level.name).toBe('SEVERE');
            
            return this.automatedBrowserManager.assertBrowserState({
                url: "basic-with-error-js.html",
                titleContains: "Convert text to camel case online",
                sourceHtmlContains: "myFunction()",
                ignoreConsoleErrors: true
            });    
        });
    });
    
    
    it('should fail assertion when assertBrowserState is called with existing javascript console errors', async function() {
        
        await expectAsync(this.automatedBrowserManager
            .loadUrl(projectRoot + '/src/test/resources/managers/automatedBrowserManager/basic-html/basic-with-error-js.html')
            .then(() => {
            
            return this.automatedBrowserManager.assertBrowserState({
                ignoreConsoleErrors: false
            });    
        })).toBeRejectedWithError(/Browser console has shown an error[\s\S]*myFunction is not defined/);
    });
    
    
    it('should correctly ignore the console errors when specified globally by the instance ignoreConsoleErrors property', async function() {
        
        this.automatedBrowserManager.ignoreConsoleErrors = ['myFunction is not defined'];
        
        await this.automatedBrowserManager.loadUrl(projectRoot + '/src/test/resources/managers/automatedBrowserManager/basic-html/basic-with-error-js.html')
            .then(() => {
        
            return this.automatedBrowserManager.assertBrowserState({
                url: "basic-with-error-js.html",
                titleContains: "Convert text to camel case online",
                sourceHtmlContains: "myFunction()"
            });    
        });
    });
    
    
    it('should throw an exception when invalid structures are passed to the assertUrlsLoadOk method', async function() {
        
        expect(() => {this.automatedBrowserManager.assertUrlsLoadOk([])})
            .toThrowError(Error, /urls must be a non empty array/);
       
        expect(() => {this.automatedBrowserManager.assertUrlsLoadOk(1)})
            .toThrowError(Error, /urls must be a non empty array/);
            
        expect(() => {this.automatedBrowserManager.assertUrlsLoadOk("12456778")})
            .toThrowError(Error, /urls must be a non empty array/);
            
        expect(() => {this.automatedBrowserManager.assertUrlsLoadOk({})})
            .toThrowError(Error, /urls must be a non empty array/);
            
        expect(() => {this.automatedBrowserManager.assertUrlsLoadOk({abc: '111'})})
            .toThrowError(Error, /urls must be a non empty array/);
                        
        expect(() => {this.automatedBrowserManager.assertUrlsLoadOk([1])})
            .toThrowError(Error, /invalid urls structure provided/);
            
        expect(() => {this.automatedBrowserManager.assertUrlsLoadOk(["12456778"])})
            .toThrowError(Error, /invalid urls structure provided/);
            
        expect(() => {this.automatedBrowserManager.assertUrlsLoadOk([1,2,3])})
            .toThrowError(Error, /invalid urls structure provided/);
            
        expect(() => {this.automatedBrowserManager.assertUrlsLoadOk([{}])})
            .toThrowError(Error, /invalid urls structure provided/);
            
        expect(() => {this.automatedBrowserManager.assertUrlsLoadOk([{abc: '111'}])})
            .toThrowError(Error, /invalid urls structure provided/);
            
        expect(() => {this.automatedBrowserManager.assertUrlsLoadOk([{url: 'url1'}, {url: 'url1'}])})
            .toThrowError(Error, /duplicate urls/);
    });


    it('should correctly execute the assertUrlsLoadOk method', async function() {
        
        this.automatedBrowserManager.wildcards = {$projectRoot: projectRoot};
    
        await this.automatedBrowserManager.assertUrlsLoadOk([{
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
        }]);
    });
    
    
    it('should fail assertions on assertUrlsLoadOk when invalid expected values are provided', async function() {
        
        this.automatedBrowserManager.wildcards = {$projectRoot: projectRoot};
    
        await expectAsync(this.automatedBrowserManager.assertUrlsLoadOk([{
            url: "unexpectedURL"
        }])).toBeRejectedWithError(/Error in loadUrl trying to get unexpectedURL/);
    
        await expectAsync(this.automatedBrowserManager.assertUrlsLoadOk([{
            url: "$projectRoot/src/test/resources/managers/automatedBrowserManager/basic-html/basic.html",
            titleContains: "unexpectedTitle",
            loadedHtmlStartsWith: 'unexpectedStartsWith',
            loadedHtmlEndsWith: "unexpectedEndsWith",
            loadedHtmlContains: ['unexpectedContains'],
            loadedHtmlNotContains: 'html'                
        }])).toBeRejectedWithError(/assertBrowserState failed with 5 errors[\s\S]*unexpectedTitle[\s\S]*unexpectedStartsWith[\s\S]*unexpectedEndsWith[\s\S]*unexpectedContains[\s\S]*html/);
        
        await expectAsync(this.automatedBrowserManager.assertUrlsLoadOk([{
            url: "$projectRoot/src/test/resources/managers/automatedBrowserManager/basic-html/basic.html",
            sourceHtmlStartsWith: 'unexpectedSourceStartsWith',
            sourceHtmlEndsWith: "unexpectedSourceEndsWith",
            sourceHtmlContains: ['unexpectedSourceContains'],
            sourceHtmlNotContains: 'html'                 
        }])).toBeRejectedWithError(/assertBrowserState failed with 4 errors[\s\S]*unexpectedSourceStartsWith[\s\S]*unexpectedSourceEndsWith[\s\S]*unexpectedSourceContains[\s\S]*html/);
    });
    
    
    it('should correctly execute the assertUrlsLoadOk method on an internet url with asserts on the original source code', async function() {
        
        this.automatedBrowserManager.ignoreConsoleErrors = ["googletagmanager.com"];
        
        // To perform this test we are using the turboframework url that should not change ever
        await this.automatedBrowserManager.assertUrlsLoadOk([{
            url: "https://turboframework.org/en",
            titleContains: "framework",
            loadedHtmlContains: '<head>',
            loadedHtmlNotContains: 'nottocontaintextstring',
            sourceHtmlContains: ['<!doctype html>', '<head>'],
            sourceHtmlNotContains: 'nottocontaintextstring'                    
        }]);
    });
    
    
    it('should fail assertions on the assertUrlsLoadOk method with more than one url calls when one is not valid', async function() {
                
        this.automatedBrowserManager.ignoreConsoleErrors = ["googletagmanager.com"];
        
        await expectAsync(this.automatedBrowserManager.assertUrlsLoadOk([
            { url: "https://turboframework.org/en" },                 
            { url: "https://turboframework.org/en/libs/home" },                 
            { url: "https://asdfasfsafasdfasdfasdfasfdasdf.asdfasdfasfdasf" },                 
            { url: "https://turboframework.org/en/docs" },                 
            { url: "https://turboframework.org/en/download" }               
        ])).toBeRejectedWithError(/Error in loadUrl trying to get https:..asdfasfsafasdfasdfasdfasfdasdf.asdfasdfasfdasf/);
    });
    
    
    it('should correctly execute the assertUrlsLoadOk method with more than one url calls', async function() {
                
        this.automatedBrowserManager.ignoreConsoleErrors = ["googletagmanager.com"];
        
        await this.automatedBrowserManager.assertUrlsLoadOk([
            { url: "https://turboframework.org/en" },                 
            { url: "https://turboframework.org/en/libs/home" },                 
            { url: "https://turboframework.org/en/apps" },                 
            { url: "https://turboframework.org/en/docs" },                 
            { url: "https://turboframework.org/en/download" }               
        ]);
    });
    
    
    it('should correctly execute the assertUrlsRedirect method', async function() {
        
        this.automatedBrowserManager.wildcards = {$projectRoot: projectRoot};
    
        await this.automatedBrowserManager.assertUrlsRedirect([{
            url: "$projectRoot/src/test/resources/managers/automatedBrowserManager/basic-html/basic-with-redirect.html",
            to: "src/test/resources/managers/automatedBrowserManager/basic-html/basic.html"      
        }]);
    });
    
    
    it('should fail assertion when the assertUrlsRedirect method expects invalid values', async function() {
        
        this.automatedBrowserManager.wildcards = {$projectRoot: projectRoot};
    
        await expectAsync(this.automatedBrowserManager.assertUrlsRedirect([{
            url: "$projectRoot/src/test/resources/managers/automatedBrowserManager/basic-html/basic-with-redirect.html",
            to: "src/test/resources/managers/automatedBrowserManager/basic-html/invalid-redirect.html"      
        }])).toBeRejectedWithError(/Url redirect assertion failed[\s\S]*basic-with-redirect.html[\s\S]*to redirect to:[\s\S]*invalid-redirect.html[\s\S]*but was:[\s\S]*basic.html/);
    });
    
    
    it('should correctly execute the assertUrlsFail method', async function() {

        await expectAsync(this.automatedBrowserManager.assertUrlsFail(['invalidUrl', 'invalidurl2', 234234234]))
            .toBeRejectedWithError(/234234234/);
        
        await this.automatedBrowserManager.assertUrlsFail(['invalidUrl']);
        await this.automatedBrowserManager.assertUrlsFail(['invalidUrl', 'invalidurl2']);
    });
    
    
    it('should fail assertion for the assertUrlsFail method when receiving valid one and more urls', async function() {
        
        this.automatedBrowserManager.wildcards = {$projectRoot: projectRoot};
        
        await this.automatedBrowserManager.assertUrlsFail(['https://github.com/edertone/TurboTesting/blob/master/README.md']).then((result) => {
            
            expect(result.assertErrors.length).toBe(1);
            expect(result.assertErrors[0]).toMatch(/URL expected to fail but was 200 ok[\s\S]*github.com.edertone/);
        });
    });
    
    
    it('should fail assertion for the assertUrlsFail method when receiving valid urls (after replacing the wildcards)', async function() {
        
        this.automatedBrowserManager.wildcards = {
            $projectRoot: projectRoot,
            $host: 'github.com'
        };
        
        await this.automatedBrowserManager.assertUrlsFail(['https://$host/edertone/TurboTesting/blob/master/README.md']).then((result) => {
            
            expect(result.assertErrors.length).toBe(1);
            expect(result.assertErrors[0]).toMatch(/URL expected to fail but was 200 ok[\s\S]*github.com.edertone/);
        });
    });
    
    
    it('should correctly execute the assertExistXpath method', async function() {
        
        await this.automatedBrowserManager.loadUrl(projectRoot + '/src/test/resources/managers/automatedBrowserManager/basic-html/basic-with-input.html')
            .then(() => {
                
            return this.automatedBrowserManager.assertExistXpath("//*[@id='someInput']", true).then((elements) => {
                
                expect(elements.length).toBe(1);
                    
                return this.automatedBrowserManager.assertExistXpath("//*[@id='nonexistantId']", false).then((elements2) => {
                    
                    expect(elements2.length).toBe(0);
                });
            });
        });
    });
    
    
    it('should fail assertion for the assertExistXpath method when expected values do not match', async function() {
        
        this.automatedBrowserManager.waitTimeout = 2000;
        
        await expectAsync(this.automatedBrowserManager.loadUrl(projectRoot + '/src/test/resources/managers/automatedBrowserManager/basic-html/basic-with-input.html')
            .then(() => {
                
            return this.automatedBrowserManager.assertExistXpath("//*[@id='nonexistantId']", true);
                 
        })).toBeRejectedWithError(/Error trying to find xpath.*id..nonexistantId/);
        
        await expectAsync(this.automatedBrowserManager.loadUrl(projectRoot + '/src/test/resources/managers/automatedBrowserManager/basic-html/basic-with-input.html')
            .then(() => {
                
            return this.automatedBrowserManager.assertExistXpath("//*[@id='someInput']", false);
                 
        })).toBeRejectedWithError(/Error: Expected xpath to NOT exist, but existed:.*id..someInput/);
    });
    
    
    it('should correctly execute the assertExistId method', async function() {
        
        await this.automatedBrowserManager.loadUrl(projectRoot + '/src/test/resources/managers/automatedBrowserManager/basic-html/basic-with-input.html')
            .then(() => {
                
            return this.automatedBrowserManager.assertExistId("someInput", true).then((elements) => {
                
                expect(elements.length).toBe(1);
                    
                return this.automatedBrowserManager.assertExistId("nonexistantId", false).then((elements2) => {
                    
                    expect(elements2.length).toBe(0);
                });
            });
        });
    });
    
    
    it('should fail assertion for the assertExistId method when expected values do not match', async function() {
        
        this.automatedBrowserManager.waitTimeout = 2000;
        
        await expectAsync(this.automatedBrowserManager.loadUrl(projectRoot + '/src/test/resources/managers/automatedBrowserManager/basic-html/basic-with-input.html')
            .then(() => {
                
            return this.automatedBrowserManager.assertExistId("someInput", false);
                 
        })).toBeRejectedWithError(/Error: Expected xpath to NOT exist, but existed.*id..someInput/);
        
        await expectAsync(this.automatedBrowserManager.loadUrl(projectRoot + '/src/test/resources/managers/automatedBrowserManager/basic-html/basic-with-input.html')
            .then(() => {
                
            return this.automatedBrowserManager.assertExistId("nonexistantId", true);
                 
        })).toBeRejectedWithError(/Error trying to find xpath.*id..nonexistantId/);
    });
    
    
    it('should correctly execute the assertExistElement method', async function() {
        
        await this.automatedBrowserManager.loadUrl(projectRoot + '/src/test/resources/managers/automatedBrowserManager/basic-html/basic-with-input.html')
            .then(() => {
            
            return this.automatedBrowserManager.assertExistElement("input", true).then((elements) => {
                
                expect(elements.length).toBe(1);
                        
                return this.automatedBrowserManager.assertExistElement(["input", "h1", "section"], true).then((elements2) => {
                    
                    expect(elements2.length).toBe(3);
                        
                    return this.automatedBrowserManager.assertExistElement("nonexistantElement1", false).then((elements3) => {
                        
                        expect(elements3.length).toBe(0);
                        
                        return this.automatedBrowserManager.assertExistElement(["nonexistantElement1", "nonexistantElement2"], false).then((elements4) => {
                            
                            expect(elements4.length).toBe(0);
                        });
                    });
                });
            });
        });
    });
    
    
    it('should fail assertion for the assertExistElement method when expected values do not match', async function() {
        
        this.automatedBrowserManager.waitTimeout = 2000;
        
        await expectAsync(this.automatedBrowserManager.loadUrl(projectRoot + '/src/test/resources/managers/automatedBrowserManager/basic-html/basic-with-input.html')
            .then(() => {
                
            return this.automatedBrowserManager.assertExistElement("input", false);
                 
        })).toBeRejectedWithError(/Error: Expected xpath to NOT exist, but existed: ..input/);
        
        await expectAsync(this.automatedBrowserManager.loadUrl(projectRoot + '/src/test/resources/managers/automatedBrowserManager/basic-html/basic-with-input.html')
            .then(() => {
                
            return this.automatedBrowserManager.assertExistElement(["nonexistantElement2", "input"], false);
                 
        })).toBeRejectedWithError(/Error: Expected xpath to NOT exist, but existed: ..input/);
                
        await expectAsync(this.automatedBrowserManager.loadUrl(projectRoot + '/src/test/resources/managers/automatedBrowserManager/basic-html/basic-with-input.html')
            .then(() => {
                
            return this.automatedBrowserManager.assertExistElement("nonexistantElement1", true);
                 
        })).toBeRejectedWithError(/Error trying to find xpath: ..nonexistantElement1/);
        
        await expectAsync(this.automatedBrowserManager.loadUrl(projectRoot + '/src/test/resources/managers/automatedBrowserManager/basic-html/basic-with-input.html')
            .then(() => {
                
            return this.automatedBrowserManager.assertExistElement(["input", "nonexistantElement2"], true);
                 
        })).toBeRejectedWithError(/Error trying to find xpath: ..nonexistantElement2/);
    });
    
    
    it('should correctly execute the assertVisibleXpath method', async function() {
        
        await this.automatedBrowserManager.loadUrl(projectRoot + '/src/test/resources/managers/automatedBrowserManager/basic-html/basic-with-input-invisible.html')
            .then(() => {
            
            return this.automatedBrowserManager.assertVisibleXpath("//*[@id='someInput']", true).then((elements) => {
                
                expect(elements.length).toBe(1);
                        
                return this.automatedBrowserManager.assertVisibleXpath(["//*[@id='someInput']", "/html/body/main/section/h1"], true).then((elements2) => {
                    
                    expect(elements2.length).toBe(2);
                        
                    return this.automatedBrowserManager.assertVisibleXpath("//*[@id='invisibleInput']", false).then((elements3) => {
                        
                        expect(elements3.length).toBe(1);
                    });
                });
            });
        });
    });
    
    
    it('should fail assertion for the assertVisibleXpath method when expected values do not match', async function() {
        
        this.automatedBrowserManager.waitTimeout = 2000;
        
        await expectAsync(this.automatedBrowserManager.loadUrl(projectRoot + '/src/test/resources/managers/automatedBrowserManager/basic-html/basic-with-input-invisible.html')
            .then(() => {
                
            return this.automatedBrowserManager.assertVisibleXpath("//*[@id='someInput']", false);
                 
        })).toBeRejectedWithError(/Expected.*id..someInput.. to be NON visible/);
        
        await expectAsync(this.automatedBrowserManager.loadUrl(projectRoot + '/src/test/resources/managers/automatedBrowserManager/basic-html/basic-with-input-invisible.html')
            .then(() => {
                
            return this.automatedBrowserManager.assertVisibleXpath(["//*[@id='invisibleInput']", "/html/body/main/section/h1"], false);
                 
        })).toBeRejectedWithError(/Expected.*html.body.main.section.h1 to be NON visible/);
        
        await expectAsync(this.automatedBrowserManager.loadUrl(projectRoot + '/src/test/resources/managers/automatedBrowserManager/basic-html/basic-with-input-invisible.html')
            .then(() => {
                
            return this.automatedBrowserManager.assertVisibleXpath("//*[@id='invisibleInput']", true);
                 
        })).toBeRejectedWithError(/Expected.*id..invisibleInput.. to be visible/);
    });
    
    
    it('should correctly execute the assertClickableXpath method', async function() {
        
        await this.automatedBrowserManager.loadUrl(projectRoot + '/src/test/resources/managers/automatedBrowserManager/basic-html/basic-with-input-disabled.html')
            .then(() => {
            
            return this.automatedBrowserManager.assertClickableXpath("//*[@id='someInput']", true).then((elements) => {
                
                expect(elements.length).toBe(1);
                        
                return this.automatedBrowserManager.assertClickableXpath(["//*[@id='someInput']", "/html/body/main/section/h1"], true).then((elements2) => {
                    
                    expect(elements2.length).toBe(2);
                        
                    return this.automatedBrowserManager.assertClickableXpath("//*[@id='disabledInput']", false).then((elements3) => {
                        
                        expect(elements3.length).toBe(1);
                    });
                });
            });
        });
    });
    
    
    it('should fail assertion for the assertClickableXpath method when expected values do not match', async function() {
        
        this.automatedBrowserManager.waitTimeout = 2000;
        
        await expectAsync(this.automatedBrowserManager.loadUrl(projectRoot + '/src/test/resources/managers/automatedBrowserManager/basic-html/basic-with-input-disabled.html')
            .then(() => {
                
            return this.automatedBrowserManager.assertClickableXpath("//*[@id='someInput']", false);
                 
        })).toBeRejectedWithError(/Expected.*id..someInput.. to be NON clickable/);
        
        await expectAsync(this.automatedBrowserManager.loadUrl(projectRoot + '/src/test/resources/managers/automatedBrowserManager/basic-html/basic-with-input-disabled.html')
            .then(() => {
                
            return this.automatedBrowserManager.assertClickableXpath(["//*[@id='disabledInput']", "/html/body/main/section/h1"], false);
                 
        })).toBeRejectedWithError(/Expected .html.body.main.section.h1 to be NON clickable/);
        
        await expectAsync(this.automatedBrowserManager.loadUrl(projectRoot + '/src/test/resources/managers/automatedBrowserManager/basic-html/basic-with-input-disabled.html')
            .then(() => {
                
            return this.automatedBrowserManager.assertClickableXpath("//*[@id='disabledInput']", true);
                 
        })).toBeRejectedWithError(/Expected.*id..disabledInput.. to be clickable/);
    });
    
    
    it('should throw exception when passing an invalid snapShotPath to the assertSnapshot method', function() {
    
        expect(() => {this.automatedBrowserManager.assertSnapshot('', '', {})})
            .toThrowError(Error, /Snapshot path must be to a PNG file/);
        
        expect(() => {this.automatedBrowserManager.assertSnapshot(projectRoot + 'asdfasdfas', '', {})})
            .toThrowError(Error, /Snapshot path must be to a PNG file[\s\S]*asdfasdfas/);
            
        expect(() => {this.automatedBrowserManager.assertSnapshot(projectRoot + 'asdfasdfas/dfasdfasdfasdfa.png', '', {})})
            .toThrowError(Error, /Specified an invalid path for failureSnapShotsPath/);
            
        expect(() => {this.automatedBrowserManager.assertSnapshot(projectRoot + 'asdfasdfas/dfasdfasdfasdfa.png', fm.getOSTempDirectory(), {})})
            .toThrowError(Error, /Cannot save snapshot to non existant path[\s\S]*dfasdfasdfasdfa/);
    });
    
    
    it('should throw exception when passing invalid failureSnapShotsPath to the assertSnapshot method', function() {
    
        let correctPath = projectRoot + '/src/test/resources/managers/automatedBrowserManager/snapshots/basic-with-input-disabled-snapshot-800x600.png';
    
        expect(() => {this.automatedBrowserManager.assertSnapshot(correctPath, null, {})})
            .toThrowError(Error, /failureSnapShotsPath must be a string/);
            
        expect(() => {this.automatedBrowserManager.assertSnapshot(correctPath, projectRoot + 'asdfasdfas', {})})
            .toThrowError(Error, /Specified an invalid path for failureSnapShotsPath[\s\S]*asdfasdfas/);
    });
    

    it('should correctly execute the assertSnapshot method with a snapshot that already exists', async function() {
    
        await this.automatedBrowserManager.queryCalls([
            ['setBrowserSizeAndPosition', 800, 600, 0, 0],
            ['loadUrl', projectRoot + '/src/test/resources/managers/automatedBrowserManager/basic-html/basic-with-input-disabled.html'],
            ['assertSnapshot', projectRoot + '/src/test/resources/managers/automatedBrowserManager/snapshots/basic-with-input-disabled-snapshot-800x600.png', fm.getOSTempDirectory(), {}]
        ]);
    });
    
    
    it('should fail assertion when calling the assertSnapshot method with an existing snapshot and a different browser window size', async function() {

        await expectAsync(this.automatedBrowserManager.queryCalls([
            ['setBrowserSizeAndPosition', 1000, 600, 0, 0],
            ['loadUrl', projectRoot + '/src/test/resources/managers/automatedBrowserManager/basic-html/basic-with-input-disabled.html'],
            ['assertSnapshot', projectRoot + '/src/test/resources/managers/automatedBrowserManager/snapshots/basic-with-input-disabled-snapshot-800x600.png', fm.getOSTempDirectory(), {}]
        ])).toBeRejectedWithError(/Snapshot size mismatch: Expected .saved. 800x600px, but received .browser. 1000x600px[\s\S]*Please make sure your snapshot has the same exact s/);
    });
    
    
    it('should fail assertion when calling the assertSnapshot method with an existing snapshot and different browser contents', async function() {
    
        // Clean failure files if generated by previous executions
        if(fm.isFile(fm.getOSTempDirectory() + fm.dirSep() + 'basic-with-input-disabled-snapshot-800x600-failedSnapshot.png')){
            
            fm.deleteFile(fm.getOSTempDirectory() + fm.dirSep() + 'basic-with-input-disabled-snapshot-800x600-failedSnapshot.png');
        }
        
        if(fm.isFile(fm.getOSTempDirectory() + fm.dirSep() + 'basic-with-input-disabled-snapshot-800x600-failedSnapshotDiff.png')){
            
            fm.deleteFile(fm.getOSTempDirectory() + fm.dirSep() + 'basic-with-input-disabled-snapshot-800x600-failedSnapshotDiff.png');
        }
        
        await expectAsync(this.automatedBrowserManager.queryCalls([
            ['setBrowserSizeAndPosition', 800, 600, 0, 0],
            ['loadUrl', projectRoot + '/src/test/resources/managers/automatedBrowserManager/basic-html/basic.html'],
            ['assertSnapshot', projectRoot + '/src/test/resources/managers/automatedBrowserManager/snapshots/basic-with-input-disabled-snapshot-800x600.png', fm.getOSTempDirectory(), {}]
        ])).toBeRejectedWithError(/Snapshot mismatch: Allowed 0 different pixels, but found ....[\s\S]*Saved new snapshot/);
        
        
        // Make sure the expected failure images exist
        expect(fm.isFile(fm.getOSTempDirectory() + fm.dirSep() + 'basic-with-input-disabled-snapshot-800x600.png')).toBe(false);
        expect(fm.isFile(fm.getOSTempDirectory() + fm.dirSep() + 'basic-with-input-disabled-snapshot-800x600-failedSnapshot.png')).toBe(true);
        expect(fm.isFile(fm.getOSTempDirectory() + fm.dirSep() + 'basic-with-input-disabled-snapshot-800x600-failedSnapshotDiff.png')).toBe(true);
    });
    
    
    it('should correctly execute the waitTillJavaScriptCondition method', async function() {
        
        await this.automatedBrowserManager.waitTillJavaScriptCondition("1 === 1");
    });
    
    
    it('should fail when the waitTillJavaScriptCondition method is called with a wrong js expression', async function() {
        
        // Test with a 2 seconds timeout
        this.automatedBrowserManager.waitTimeout = 2000;
        
        let start = new Date().getTime();
        
        await expectAsync(this.automatedBrowserManager.waitTillJavaScriptCondition("1 === 2"))
            .toBeRejectedWithError(/Error waiting for javascript condition to be true/);
        
        let time = (new Date().getTime()) - start;
        expect(time).toBeLessThan(3000);    
        expect(time).toBeGreaterThan(2000);
        
        // Test with a 20 seconds timeout
        this.automatedBrowserManager.waitTimeout = 10000;

        start = new Date().getTime();
        
        await expectAsync(this.automatedBrowserManager.waitTillJavaScriptCondition("1 === 2"))
            .toBeRejectedWithError(/Error waiting for javascript condition to be true/);
        
        time = (new Date().getTime()) - start;
        expect(time).toBeLessThan(11000);    
        expect(time).toBeGreaterThan(10000);
        
        // Test with a 5 seconds timeout as a parameter
        start = new Date().getTime();
        
        await expectAsync(this.automatedBrowserManager.waitTillJavaScriptCondition("1 === 2", 5000))
            .toBeRejectedWithError(/Error waiting for javascript condition to be true/);
        
        time = (new Date().getTime()) - start;
        expect(time).toBeLessThan(6000);
        expect(time).toBeGreaterThan(5000);
    });
    
    
    it('should correctly execute the assertWholeWebSite method', async function() {
        
        // TODO
    });
    
    
    it('should correctly execute the clickById method', async function() {
        
        // TODO
    });
    
    
    it('should correctly execute the clickByText method', async function() {
        
        // TODO
    });
    
    
    it('should correctly execute the clickByXpath method', async function() {
        
        // TODO
    });
    
    
    it('should correctly execute the clearInputById method', async function() {
        
        // TODO
    });
    
    
    it('should correctly execute the clearInputByXpath method', async function() {
        
        // TODO
    });
    
    
    it('should correctly execute the sendKeysById method', async function() {
        
        await this.automatedBrowserManager.loadUrl(projectRoot + '/src/test/resources/managers/automatedBrowserManager/basic-html/basic-with-input.html')
            .then(() => {
                
            return this.automatedBrowserManager.sendKeysById('someInput', 'some text here').then(() => {
                
                return this.automatedBrowserManager.getAttributeById('someInput', 'value').then((text) => {

                    expect(text).toBe('some text here');
                })
            });
        });
    });
    
    
    it('should fail assertions for the sendKeysById method when invalid values are passed', async function() {
        
        this.automatedBrowserManager.waitTimeout = 2000;
        
        await expectAsync(this.automatedBrowserManager.loadUrl(projectRoot + '/src/test/resources/managers/automatedBrowserManager/basic-html/basic-with-input.html')
            .then(() => {
                
            return this.automatedBrowserManager.sendKeysById('nonexistantInput', 'some text here');
            
        })).toBeRejectedWithError(/Error trying to send input by[\s\S]*nonexistantInput[\s\S]*Waiting for element to be located/);
    });
    
    
    it('should correctly execute the sendKeysByXpath method', async function() {
        
        // TODO
    });
    
    
    it('should correctly execute the getAttributeById method', async function() {
        
        // TODO
    });
    
    
    it('should correctly execute the getAttributeByXpath method', async function() {
        
        // TODO
    });
    
    
    it('should correctly execute the queryCalls method', async function() {
        
        // TODO
    });
    
    
    it('should fail assertion for the queryCalls method when invalid expected values are passed', async function() {
        
        this.automatedBrowserManager.waitTimeout = 2000;
        
        await expectAsync(this.automatedBrowserManager.queryCalls([
            ['loadUrl', projectRoot + '/src/test/resources/managers/automatedBrowserManager/basic-html/basic-with-input-disabled.html'],
            ['assertClickableXpath', "//*[@id='someInput']", false]
        ])).toBeRejectedWithError(/Expected.*id..someInput.. to be NON clickable/);
        
        await expectAsync(this.automatedBrowserManager.queryCalls([
            ['loadUrl', projectRoot + '/src/test/resources/managers/automatedBrowserManager/basic-html/basic-with-input-disabled.html'],
            ['assertBrowserState', {sourceHtmlContains: 'notcontainedonhtml'}]
        ])).toBeRejectedWithError(/Error searching for: notcontainedonhtml on text in the url/);
    });
    
    
    it('should correctly execute the closeBrowserTab method', async function() {
        
        // TODO
    });
    
    
    it('should correctly execute the quit method', async function() {
        
        // TODO
    });
});