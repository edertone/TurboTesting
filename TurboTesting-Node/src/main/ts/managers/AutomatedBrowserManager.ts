/**
 * TurboTesting is a general purpose cross-language library to improve automated testing productivity
 *
 * Website : -> http://www.turboframework.org
 * License : -> Licensed under the Apache License, Version 2.0. You may not use this file except in compliance with the License.
 * License Url : -> http://www.apache.org/licenses/LICENSE-2.0
 * CopyRight : -> Copyright 2015 Edertone Advanded Solutions (08211 Castellar del Vallès, Barcelona). http://www.edertone.com
 */
 

import { ArrayUtils, StringUtils, HTTPManager, HTTPManagerGetRequest, ObjectUtils } from 'turbocommons-ts';
import { HTTPTestsManager } from './HTTPTestsManager';
import { StringTestsManager } from './StringTestsManager';
import { ObjectTestsManager } from './ObjectTestsManager';
import { FilesManager } from 'turbodepot-node';

declare const Promise: any;
declare const Buffer: any;
declare function require(name: string): any;


/**
 * AutomatedBrowserManager class
 *
 * @see constructor()
 */
export class AutomatedBrowserManager {
    
    
    /**
     * Defines the default amount of miliseconds to wait for the existence of elements before failing
     * when performing interactions with the browser on several methods of this class 
     */
    waitTimeout = 20000;
    
    
    /**
     * An object containing key / pair values where each key is the name of a wildcard,
     * and the key value is the text that will replace each wildcard on all the texts analyzed
     * by this class (urls, html code, document titles, etc...)
     */
    wildcards: { [key: string]: string } = {};
    
    
    /**
     * Contains all the log entries that have been generated for the currently loaded URL.
     * This array will be reset each time a new url is loaded by the browser.
     */
    logEntries: any[] = [];

    
    /**
     * A value that can be specified to ignore all the browser console errors matching any of the provided
     * strings. This list of ignore strings will apply to all the assert methods executed on this instance, so it
     * can be avoided to specify those values at each one of the method calls
     */
    ignoreConsoleErrors = [];
    
    
    /**
     * The selenium webdriver instance used to manage the browser automation
     */
    private driver: any = null;

    
    /**
     * The StringTestsManager instance used to perform string tests
     */
    private stringTestsManager: StringTestsManager = new StringTestsManager();
    
    
    /**
     * The ObjectTestsManager instance used to perform object tests
     */
    private objectTestsManager: ObjectTestsManager = new ObjectTestsManager();
    
    
    /**
     * The HTTPManager instance used to perform http requests
     */
    private httpManager: HTTPManager = new HTTPManager();
    
    
    /**
     * The httpTestsManager instance used to perform http request tests
     */
    private httpTestsManager: HTTPTestsManager = new HTTPTestsManager();
    
    
    /**
     * A files manager instance used by this class
     */
    private filesManager: FilesManager = new FilesManager();
    
    
    /**
     * Stores the NodeJs fs instance
     */
    private nodeFs: any;
    
    
    /**
     * Stores the NodeJs url instance
     */
    private nodeUrl: any;
    
    /**
     * Stores the NodeJs execSync instance
     */
    private nodeExecSync: any;
    
    
    /**
     * Stores the NodeJs pngjs chrome instance
     */
    private nodePNG: any = null;
    
    
    /**
     * Stores the NodeJs pixelmatch chrome instance
     */
    private nodePixelmatch: any = null;
    
    
    /**
     * Stores the NodeJs node-canvas chrome instance
     */
    private nodeCanvas: any = null;
    
    
    /**
     * Stores the NodeJs webdriver instance
     */
    private webdriver: any;
    
    
    /**
     * Stores the NodeJs webdriver chrome instance
     */
    private chrome: any;
        
    
    /**
     * Browser automated testing management class
     * 
     * @return An AutomatedBrowserManager instance
     */
    constructor() {
        
        this.httpTestsManager.isAssertExceptionsEnabled = false;
            
        this.nodeFs = require('fs');
        this.nodeUrl = require('url');
        this.nodeExecSync = require('child_process').execSync;
        this.webdriver = require('selenium-webdriver');
    }
    
    
    /**
     * Initialize this class to work with the google chrome browser.
     * The browser and the chromedriver application must be installed on the system. Chromedriver must be globally
     * accessible via the command line input (added to the OS path) as chromedriver
     * 
     * @param language The language in which the browser will start
     * @param defaultDownloadPath If specified, all the downloadable links or files that are open by the automation
     *        will be stored on the provided fs path without any prompt.
     * @param disableGPU If set to true, the chrome browser won't use GPU to accelerate rendering. This is recommended to
     *        avoid having lots of useless gpu errors on the cmd output.
     */
    initializeChrome(language = 'en', defaultDownloadPath = '', disableGPU = true){
        
        // Check that chrome driver is available on our system
        try{
            
            this.nodeExecSync('chromedriver -v', {stdio : 'pipe'}).toString();
                    
        }catch(e){
            
            throw new Error("Error: Could not initialize selenium chromedriver. Please make sure it is available on your OS cmd path");
        }
        
        this.chrome = require('selenium-webdriver/chrome');
        
        let chromeOptions = new this.chrome.Options();
        let chromeCapabilities = this.webdriver.Capabilities.chrome();
        
        // Initialize the chrome driver with the specified language.
        chromeOptions.addArguments([`--lang=${language}`]);
        
        // Define the files download location if specified
        if(defaultDownloadPath !== ''){
            
            chromeOptions.setUserPreferences({
                "download.default_directory": defaultDownloadPath,
                "download.prompt_for_download": false
            });
        }
        
        // Force acceptance of https untrusted certificates
        chromeOptions.addArguments("--ignore-certificate-errors");
        chromeOptions.addArguments('--allow-insecure-localhost');
        
        // Enable logs so the tests can read them
        let loggingPrefs = new this.webdriver.logging.Preferences();
        loggingPrefs.setLevel('browser', this.webdriver.logging.Level.ALL); 
        loggingPrefs.setLevel('driver', this.webdriver.logging.Level.ALL); 
        
        // Make the console output less verbose (not the browser console, the cmd console!)
        if(disableGPU){
            
            chromeOptions.addArguments('--disable-gpu');
        }
        
        chromeOptions.addArguments('--log-level=3');
        
        // Instantiate the browser driver
        this.driver = new this.webdriver.Builder()
            .withCapabilities(chromeCapabilities)
            .setChromeOptions(chromeOptions)
            .setLoggingPrefs(loggingPrefs)
            .build();
    }
    
    
    /**
     * Specify the viewport (internal browser document area) size and the main browser window position. This method can be called at any time
     *
     * @param width The desired browser viewport width. (Note this is the internal area where the website is displayed)
     * @param height The desired browser viewport height. (Note this is the internal area where the website is displayed)
     * @param x The desired browser left corner position
     * @param y The desired browser top corner position
     *
     * @return A promise which will end correctly if the process finishes ok or fail with exception otherwise.     
     */
    setBrowserSizeAndPosition(width: number, height: number, x = 0, y = 0){
    
        return this.driver.executeScript(`return [window.outerWidth - window.innerWidth + ${width}, window.outerHeight - window.innerHeight + ${height}];`)
            .then((viewportSize: any) =>{
        
            return this.driver.manage().window().setRect({width: viewportSize[0], height: viewportSize[1], x: x, y: y}).then(() =>{
                
                // We must wait till the browser window is correctly resized before letting the execution continue
                return this.waitTillJavaScriptCondition(`window.innerWidth === ${width} && window.innerHeight === ${height}`).then().catch((e:Error) => {
                    
                    return this.driver.executeScript('return window.innerWidth + "x" + window.innerHeight').then((realSize:string) =>{
                    
                        throw new Error(`Error trying to set browser viewport size to: ${width}x${height} (it was ${realSize})\n` + e.toString());    
                    });
                });
            });
        });
    }
    
    
    /**
     * Maximize the browser window just like clicking on the OS maximize button. This method can be called at any time
     *
     * @return A promise which will end correctly if the process finishes ok or fail with exception otherwise.
     */
    setBrowserAsMaximized(){
      
        return this.driver.manage().window().maximize();
    }
    
    
    /**
     * Set the full screen state for the browser window. This method can be called at any time
     *
     * @return A promise which will end correctly if the process finishes ok or fail with exception otherwise.
     */
    setBrowserAsFullScreen(){
      
        return this.driver.manage().window().fullscreen();
    }
    
    
    /**
     * Specify which of the currently open tabs is active for the user.
     *
     * @param tabIndex The numeric index for the tab that we want to set as active. 0 is the first, the one most to the left
     *
     * @return A promise which will end correctly if the process finishes ok or fail with exception otherwise.
     */
    setBrowserActiveTab(tabIndex:number){
    
        return this.driver.getAllWindowHandles().then((windowHandles: any) => {
            
            return this.driver.switchTo().window(windowHandles[tabIndex]);
        }); 
    }
    
    
    /**
     * Remove all the currently visible entries from the browser console
     *
     * @return A promise which will end correctly if the process finishes ok or fail with exception otherwise.
     */
    clearConsole(){
        
        return this.driver.executeScript("return console.clear()");  
    }


    /**
     * Wait till the browser has finished loading everything and is in a ready state.
     * If it is already ready once this method is called, the promise then() will be called inmediately
     *
     * @return A promise which will end correctly if the process finishes ok or fail with exception otherwise.
     */
    waitTillBrowserReady(){
        
        return this.driver.wait(() => {
            
            return this.driver.executeScript('return document.readyState').then((readyState: any) => {
                
                return readyState === 'complete';
            });
            
        }, this.waitTimeout).then().catch((e:Error) => {
            
            throw new Error('Error waiting for browser ready: ' + e.toString());
        });
    }
    
    
    /**
     * Wait till the specified javascript condition is evaluated as true, or fail after the class waitTimeout value is reached
     *
     * @param condition A javascript expression to evaluate, like for example: 'document.readyState === "complete"'
     *
     * @return A promise which will end correctly if the process finishes ok or fail with exception otherwise.
     */
    waitTillJavaScriptCondition(condition:string){
        
        return this.driver.wait(() => {
            
            return this.driver.executeScript('return ' + condition).then((condition: any) => {
                
                return condition === true;
            });
            
        }, this.waitTimeout).then().catch((e:Error) => {
            
            throw new Error('Error waiting for javascript condition to be true:\n' + condition + '\n' + e.toString());
        });
    }
    
    
    /**
     * Wait till the specified number of milliseconds has passed.  
     * 
     * @param milliseconds The number of milliseconds that we want to wait
     *
     * @return A promise which will end correctly if the process finishes ok or fail with exception otherwise.
     */
    waitMilliseconds(milliseconds:number){
        
        return new Promise((resolve:any) => setTimeout(resolve, milliseconds));
    }
    
    
    /**
     * Request the browser instance to load the specified URL.
     * If we have defined any wildcard, they will be replaced on the url before requesting it on the browser.
     * 
     * @param url The url we want to open with the browser
     * @return A promise. When resolved correctly, an object will be passed to the .then() method with all the information regarding the loaded page we may need:
     *         title, source (may have been altered by the browser after loading is complete) and finalUrl (in case any redirection happened from the original url)
     */
    loadUrl(url: string){
        
        let results: {title:string; source:any; finalUrl:string} = {title: '', source: '', finalUrl: ''};
    
        url = this.stringTestsManager.replaceWildCardsOnText(url, this.wildcards);
    
        return this.driver.get(url).then(() => {
            
            return this.driver.getTitle().then((title: any) => {
            
                results.title = title;
                
                return this.driver.executeScript("return document.documentElement.outerHTML").then((html: string) => {
                
                    results.source = html;

                    return this.driver.getCurrentUrl().then((finalUrl: string) => {
                        
                        results.finalUrl = finalUrl;
                        
                        return this.driver.manage().logs().get('browser').then((browserLogs: any) => {
                            
                            this.logEntries = browserLogs;
                            
                            return this.waitTillBrowserReady().then(() => {
                                
                                return results;
                            });
                        }); 
                    });
                });
            });
            
        }).catch((e:Error) => {
            
            throw new Error('Error in loadUrl trying to get ' + url +':\n' + e.toString());
        });
    }
    
    
    /**
     * Perform several tests regarding the current state of the browser: Verify the current url, title, html original code, html
     * loaded code, errors on console, etc..
     * 
     * If any of the specified assertions fail, an exception will be thrown
     * 
     * @param asserts An object that defines the assertions that will be applied by this test. Following properties are accepted (skip them or set to null when not used):<br>
     *        "url" A string or an array of strings with texts that must exist in the same order on the current url<br>              
     *        "titleContains" A text that must exist on the current browser title<br>
     *        "ignoreConsoleErrors" The console output is always analyzed for errors. Any console error that happens will make the tests fail unless
     *                              it contains any of the strings provided in this array. To ignore ALL the console errors, we can set this value directly to true<br>
     *        "sourceHtmlStartsWith" The html source code must start with the specified text<br>
     *        "sourceHtmlEndsWith" The html source code must end with the specified text<br>
     *        "sourceHtmlContains" A string or an array of strings with texts that must exist in the same order on the html source code.<br>
     *        "sourceHtmlRegExp" A regular expression that will be evaluated against the source code and must match.<br>
     *        "sourceHtmlNotContains" A string or an array of strings with texts tat must NOT exist on the html source code<br>
     *        "loadedHtmlStartsWith" If defined, the html code that is loaded (and maybe altered) by the browser must start with the specified text<br>
     *        "loadedHtmlEndsWith" If defined, the html code that is loaded (and maybe altered) by the browser must end with the specified text<br>
     *        "loadedHtmlContains" A string or an array of strings with texts that must exist in the same order on the html code that is loaded (and maybe altered) by the browser<br>
     *        "loadedHtmlRegExp" A regular expression that will be evaluated against the html code that is loaded (and maybe altered) by the browser and must match.<br>
     *        "loadedHtmlNotContains" A string or an array of strings with texts tat must NOT exist on the html code that is loaded (and maybe altered) by the browser
     *        "tabsCount" A number specifiyng how many tabs must currently exist on the browser
     *        "viewportSize" A string in the form NNNxNNN that defines a window dimensions that must match the browser internal document window excluding the OS window frame. Example: 1024x768
     *        
     * @return A promise which will end correctly if the process finishes ok or fail with exception otherwise.
     */
    assertBrowserState(asserts: any){

        let anyErrors: string[] = [];
    
        this.objectTestsManager.assertIsObject(asserts);
        
        // Check that asserts has the right properties
        try {
            
            this.objectTestsManager.assertObjectProperties(asserts,
                    ['url', 'titleContains', 'ignoreConsoleErrors', 'sourceHtmlContains', 'sourceHtmlRegExp', 'sourceHtmlStartsWith',
                    'sourceHtmlEndsWith', 'sourceHtmlNotContains', 'loadedHtmlStartsWith', 'loadedHtmlEndsWith', 'loadedHtmlContains',
                    'loadedHtmlRegExp', 'loadedHtmlNotContains', 'tabsCount', 'viewportSize'], false);
                 
        } catch (e) {
        
            anyErrors.push(e.toString());
        }
        
        return this.waitTillBrowserReady().then(() => {
        
            return this.driver.executeScript('return window.location.href').then((browserUrl: string) => {
                
                // Check if the current url contents must be tested
                if(asserts.hasOwnProperty('url') && asserts.url !== null){
                    
                    try {

                        this.stringTestsManager.assertTextContainsAll(browserUrl,
                            this.stringTestsManager.replaceWildCardsOnText(asserts.url, this.wildcards),
                            `Browser URL: ${browserUrl}\nDoes not contain expected text: $fragment`);
                             
                    } catch (e) {
                    
                        anyErrors.push(e.toString());
                    }
                }
                
                return this.driver.getTitle().then((browserTitle: any) => {
                    
                    // Make sure no 404 error is shown at the browser title
                    try {

                        this.stringTestsManager.assertTextNotContainsAny(browserTitle, ['404 Not Found', 'Error 404 page'],
                            `Unexpected 404 error found on browser title:\n    ${browserTitle}\nFor the url:\n    ${browserUrl}`);
                        
                    } catch (e) {
                    
                        anyErrors.push(e.toString());
                    }
                                    
                    // Make sure title contains the text that is specified on the asserts expected values 
                    if(asserts.hasOwnProperty('titleContains') && asserts.titleContains !== null){
                    
                        try {
                            
                            this.stringTestsManager.assertTextContainsAll(browserTitle, asserts.titleContains,
                                `Title: ${browserTitle}\nDoes not contain expected text: ${asserts.titleContains}\nFor the url: ${browserUrl}`);
                                 
                        } catch (e) {
                        
                            anyErrors.push(e.toString());
                        }
                    }
                    
                    // Note that calling this to get the browser logs resets the logs buffer, so the next time is called it will be empty.
                    // This is why we store all the logs on the logEntries property, so they can all be available for the currently loaded url
                    return this.driver.manage().logs().get('browser').then((browserLogs: any) => {
                        
                        this.logEntries.concat(browserLogs);

                        // Check that there are no SEVERE error logs on the browser
                        if(!(asserts.hasOwnProperty('ignoreConsoleErrors') && asserts.ignoreConsoleErrors === true)){
                            
                            for (let logEntry of this.logEntries) {
                            
                                if(logEntry.level.name === 'SEVERE'){
                                    
                                    let errorMustBeThrown = true;
                                    
                                    // All the browser logs which contain any of the texts on the ignoreConsoleErrors array will be ignored 
                                    if(this.ignoreConsoleErrors.length > 0 ||
                                       (asserts.hasOwnProperty('ignoreConsoleErrors') && ArrayUtils.isArray(asserts.ignoreConsoleErrors))){
                                        
                                        for (let ignoreConsoleError of this.ignoreConsoleErrors.concat(asserts.ignoreConsoleErrors)) {
                
                                            if(logEntry.message.indexOf(ignoreConsoleError) >= 0){
                                                
                                                errorMustBeThrown = false;
                                            }
                                        }
                                    }
                                    
                                    if(errorMustBeThrown){
                                        
                                        anyErrors.push('Browser console has shown an error:\n    ' + logEntry.message + '\n' +
                                            'For the url:\n    ' + browserUrl);
                                    }
                                }
                            }
                        }
                        
                        // Get the html code as it is loaded by the browser. This code may be different from the one that is given by the server,
                        // cause it may be altered by the browser or any dynamic javascript code.
                        return this.driver.executeScript("return document.documentElement.outerHTML").then((html: string) => {
                        
                            this._validateHtml(anyErrors, html, browserUrl,
                                    asserts.hasOwnProperty('loadedHtmlStartsWith') ? asserts.loadedHtmlStartsWith : null,
                                    asserts.hasOwnProperty('loadedHtmlEndsWith') ? asserts.loadedHtmlEndsWith : null,
                                    asserts.hasOwnProperty('loadedHtmlNotContains') ? asserts.loadedHtmlNotContains : null,
                                    asserts.hasOwnProperty('loadedHtmlContains') ? asserts.loadedHtmlContains : null,
                                    asserts.hasOwnProperty('loadedHtmlRegExp') ? asserts.loadedHtmlRegExp : null);
                            
                             return this.driver.executeScript(`return [window.innerWidth, window.innerHeight];`).then((viewportSize: any) =>{
        
                                if(asserts.hasOwnProperty('viewportSize') && asserts.viewportSize !== viewportSize.join('x')){
                                    
                                    anyErrors.push('Viewport actual size (' + viewportSize.join('x') + ') expected to be: ' + asserts.viewportSize);
                                }
                            
                                return this.driver.getAllWindowHandles().then((windowHandles: any) => {
                                
                                    // An auxiliary method to perform the final errors test
                                    let finish = () => {
                                        
                                        if(anyErrors.length > 0){
                                            
                                            throw new Error(`AutomatedBrowserManager.assertBrowserState failed with ${anyErrors.length} errors:\n` + anyErrors.join('\n'));
                                        }
                                    }
                                    
                                    // If tabsCount is specified, check that the browser tabs number matches it   
                                    if(asserts.hasOwnProperty('tabsCount') && asserts.tabsCount !== windowHandles.length){
                                        
                                        anyErrors.push('Browser tabs count (' + windowHandles.length + ') must be: ' + asserts.tabsCount);
                                    }
                                
                                    // In case none of the real source code assertions have been defined, we will finish here, to avoid performing an unnecessary
                                    // http request to obtain the real source code.
                                    if((!asserts.hasOwnProperty('sourceHtmlStartsWith') || asserts.sourceHtmlStartsWith === null) &&
                                       (!asserts.hasOwnProperty('sourceHtmlEndsWith') || asserts.sourceHtmlEndsWith === null) &&
                                       (!asserts.hasOwnProperty('sourceHtmlNotContains') || asserts.sourceHtmlNotContains === null) &&
                                       (!asserts.hasOwnProperty('sourceHtmlContains') || asserts.sourceHtmlContains === null) &&
                                       (!asserts.hasOwnProperty('sourceHtmlRegExp') || asserts.sourceHtmlRegExp === null)){
                                        
                                        return finish();
                                    }
                                    
                                    // If the url to test belongs to a local file, we will directly get the source code from there.
                                    let urlLocalFileContents = '';
                                        
                                    try {
                                        
                                        urlLocalFileContents = this.nodeFs.readFileSync(this.nodeUrl.fileURLToPath(browserUrl), "utf8");
        
                                    } catch (e) {}
        
                                    if(urlLocalFileContents !== ''){
        
                                        this._validateHtml(anyErrors, urlLocalFileContents, browserUrl,
                                                asserts.hasOwnProperty('sourceHtmlStartsWith') ? asserts.sourceHtmlStartsWith : null,
                                                asserts.hasOwnProperty('sourceHtmlEndsWith') ? asserts.sourceHtmlEndsWith : null,
                                                asserts.hasOwnProperty('sourceHtmlNotContains') ? asserts.sourceHtmlNotContains : null,
                                                asserts.hasOwnProperty('sourceHtmlContains') ? asserts.sourceHtmlContains : null,
                                                asserts.hasOwnProperty('sourceHtmlRegExp') ? asserts.sourceHtmlRegExp : null);
                                        
                                        return finish();
                                    }
                                    
                                    // Perform an http request to get the url real code. This code may be different from the one that is found at the 
                                    // browser level, cause the browser or any javascript dynamic process may alter it.
                                    return new Promise ((resolve:any, reject:any) => {
                                    
                                        try{
                                        
                                            let request = new HTTPManagerGetRequest(browserUrl);
                                            
                                            request.errorCallback = (errorMsg: string, errorCode: number) => {
                                            
                                                anyErrors.push('Could not load url: ' + browserUrl + '\nError code: ' + errorCode + '\n' + errorMsg);
                                            };
                                            
                                            request.successCallback = (html: any) => {
                                               
                                                this._validateHtml(anyErrors, html, browserUrl,
                                                    asserts.hasOwnProperty('sourceHtmlStartsWith') ? asserts.sourceHtmlStartsWith : null,
                                                    asserts.hasOwnProperty('sourceHtmlEndsWith') ? asserts.sourceHtmlEndsWith : null,
                                                    asserts.hasOwnProperty('sourceHtmlNotContains') ? asserts.sourceHtmlNotContains : null,
                                                    asserts.hasOwnProperty('sourceHtmlContains') ? asserts.sourceHtmlContains : null,
                                                    asserts.hasOwnProperty('sourceHtmlRegExp') ? asserts.sourceHtmlRegExp : null);
                                             };
            
                                            // Once the request to get the real browser code is done, we will check if any error has happened
                                            request.finallyCallback = () => {
                                                
                                                try{
                                                    
                                                    finish();
                                                    resolve();
                                                    
                                                } catch (e) {
            
                                                    reject(e);
                                                }
                                            }
                                            
                                            this.httpManager.execute(request);    
                                            
                                        } catch (e) {
            
                                            anyErrors.push('Error performing http request to '+ browserUrl + '\n' + e.toString());
                                            
                                            try{
                                                    
                                                finish();
                                                resolve();
                                                
                                            } catch (e) {
        
                                                reject(e);
                                            }
                                        }
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    }
    
    
    /**
     * An auxiliary method that is used to validate the specified html code with the specified asserts
     */
    private _validateHtml(anyErrors:any[], html: string, url: string, startsWith: string, endsWith: string, notContains: string, contains: string, regExp: RegExp) {
        
        if(startsWith !== null){
            
            try {

                this.stringTestsManager.assertTextStartsWith(html, startsWith,
                    `Source expected to start with: $fragment\nBut started with: $startedWith\nFor the url: ${url}`);
                
            } catch (e) {

                anyErrors.push(e.toString());
            }
        }
         
        if(endsWith !== null){
           
            try {

                this.stringTestsManager.assertTextEndsWith(html, endsWith,
                    `Source expected to end with: $fragment\nBut ended with: $endedWith\nFor the url: ${url}`);
                 
            } catch (e) {
                 
                anyErrors.push(e.toString());
            }
        }
         
        if(notContains !== null){
             
            try {

                this.stringTestsManager.assertTextNotContainsAny(html, notContains,
                    `Source NOT expected to contain: $fragment\nBut contained it for the url: ${url}`);
                 
            } catch (e) {
                 
                anyErrors.push(e.toString());
            }
        }
         
        if(contains !== null){

            try {
                 
                this.stringTestsManager.assertTextContainsAll(html,
                    this.objectTestsManager.replaceWildCardsOnObject(contains, this.wildcards),
                    `\nError searching for: $fragment on text in the url: ${url}\n$errorMsg\n`);
                      
            } catch (e) {
             
                anyErrors.push(e.toString());
            }
        }
        
        if(regExp !== null && !regExp.test(html)){

            anyErrors.push(`\nSource does not match rexExp:\n${regExp.toString()}\nfor the url: ${url}`);
        }
    }
    
    
    /**
     * This method will perform a large amount of tests for a provided list of urls to check that they load as expected.
     *
     * If any of the provided urls fails any of the verifications, the test will fail.
     * 
     * @see AutomatedBrowserManager.assertBrowserState()
     
     * @param urls An array of objects where each one contains the following properties:
     *        "url" the url to test (mandatory)
     *        Any of the properties that can be specifed with the assertBrowserState() method can also be used.
     *
     * @return A promise which will end correctly if the process finishes ok or fail with exception otherwise.
     */
    assertUrlsLoadOk(urls: any[]){
        
        // Verify the received structures are valid
        if(!ArrayUtils.isArray(urls) || urls.length <= 0){
            
            throw new Error(`urls must be a non empty array`);
        }
        
        for(let url of urls){
            
            if(!ObjectUtils.isObject(url) || !url.hasOwnProperty('url')){
                
                throw new Error(`invalid urls structure provided. Must be an object with at least the 'url' property`);
            }
        }
                
        let anyErrors: string[] = [];
        
        // Fail if list has duplicate values
        if(ArrayUtils.hasDuplicateElements(urls.map(l => l.url))){
            
            throw new Error('duplicate urls: ' + ArrayUtils.getDuplicateElements(urls.map(l => l.url)).join('\n'));
        }
        
        // Load all the urls on the list and perform a request for each one.
        let recursiveCaller = (urls: any[]) => {
            
            if(urls.length <= 0){
                
                if(anyErrors.length > 0){
                    
                    throw new Error(`failed with ${anyErrors.length} errors:\n` + anyErrors.join('\n'));
                }
                
                return;
            }
            
            let entry = urls.shift();
            
            entry.url = this.stringTestsManager.replaceWildCardsOnText(entry.url, this.wildcards);
            
            return this.loadUrl(entry.url).then(() => {

                // The url assert must be removed from the entry to prevent it from failing on the assertBrowserState method
                delete entry.url;

                return this.assertBrowserState(entry).then(() => {

                    return recursiveCaller(urls);
                });            
            });
        }
        
        return recursiveCaller(urls);
    }
        
    
    /**
     * Test that all the provided urls redirect to another expected url.
     * If any of the provided urls fail to redirect to its expected value, the test will throw an exception.
     * 
     * @param urls An array of objects where each one contains the following properties:
     *        "url" the url to test
     *        "to" the url (or a fragment of it) that must be the final redirection target for the provided url
     *        "comment" (Optional) An informative comment about the redirect purpose
     *
     * @return A promise which will end correctly if the process finishes ok or fail with exception otherwise.
     */
    assertUrlsRedirect(urls: any[]){
    
        // Fail if list has duplicate values
        if(ArrayUtils.hasDuplicateElements(urls.map(l => l.url))){
            
            throw new Error('duplicate urls: ' + ArrayUtils.getDuplicateElements(urls.map(l => l.url)).join('\n'));
        }
        
        let anyErrors: string[] = [];
        
        // Load all the urls on the list and perform a request for each one.
        let recursiveCaller = (urls: any[]) => {
            
            if(urls.length <= 0){
                
                if(anyErrors.length > 0){
                    
                    throw new Error(`failed with ${anyErrors.length} errors:\n` + anyErrors.join('\n'));
                }
                
                return;
            }
            
            let entry = urls.shift();
            entry.url = this.stringTestsManager.replaceWildCardsOnText(entry.url, this.wildcards);
            entry.to = this.stringTestsManager.replaceWildCardsOnText(entry.to, this.wildcards);
            
            return this.loadUrl(entry.url).then((results:any) => {
                
                // If the finalUrl does not end with entry.to value, the test will fail
                if(results.finalUrl.indexOf(entry.to, results.finalUrl.length - entry.to.length) === -1){
                    
                    anyErrors.push('Url redirect assertion failed. expected:\n    ' + entry.url +
                        ' to redirect to:\n    ' + entry.to + ' but was:\n    ' + results.finalUrl);
                }
                    
                return recursiveCaller(urls);
            });
        }
        
        return recursiveCaller(urls);
    }
    
    
    /**
     * Test that all the urls on a given list return non "200 ok" error code.
     * 
     * If any of the provided urls gives a 200 ok result or can be correctly loaded, the test will fail
     *
     * @see HTTPTestsManager.assertUrlsFail
     * 
     * @param urls An array of strings where each item is an url to test
     */
    assertUrlsFail(urls: string[]){
    
        this.httpTestsManager.wildcards = this.wildcards;
        
        return new Promise ((resolve:any, reject:any) => {
            
            try{
                
                this.httpTestsManager.assertUrlsFail(urls, (assertErrors:any) => {
                
                    if(assertErrors && assertErrors.length > 0){
                        
                        reject(new Error(assertErrors.join('\n')));
                    
                    }else{
                        
                        resolve();
                    }                    
                });
                
            }catch(e){
                    
                reject(e);
            };
        });
    }
    
    
    /**
     * Wait till all the provided list of xpath expressions exist/not exist on the current document or fail after the timeout has passed  
     * (globally defined by the waitTimeout property)
     * 
     * @param xpaths A list with the xpath expressions that we are looking for (Examples on assertClickableXpath method docs)
     * @param exist True if we expect the elements to exist, false otherwise
     *
     * @return A promise. When resolved correctly, all the found instances will be passed to the .then() method
     */
    assertExistXpath(xpaths:string|string[], exist: boolean){
        
        let elemensFound: any[] = [];
        
        let recursiveCaller = (xpathsArray:string[], index: number) => {
            
            if(index >= xpathsArray.length){
                
                return elemensFound;
            }
            
            if(!exist){
                
                return this.driver.findElement(this.webdriver.By.xpath(xpathsArray[index]))
                    .then(() => {
                        
                        exist = true;
                        
                        throw new Error('Expected xpath to NOT exist, but existed: ' + xpathsArray[index]);
                        
                    }).catch((e:Error) => {
                        
                        if(exist){
                            
                            throw new Error(e.toString());
                        }
                        
                        return recursiveCaller(xpathsArray, index + 1);
                    });
            
            }else{
                
                return this.driver.wait(this.webdriver.until.elementLocated(this.webdriver.By.xpath(xpathsArray[index])), this.waitTimeout)
                    .then((element:any) => {
                        
                    elemensFound.push(element);
                        
                    return recursiveCaller(xpathsArray, index + 1);
                    
                }).catch((e:Error) => {
                    
                    throw new Error('Error trying to find xpath: ' + xpathsArray[index] + '\n' + e.toString());
                });
            }
        }
        
        return recursiveCaller(ArrayUtils.isArray(xpaths) ? xpaths as string[] : [xpaths as string], 0);  
    }
    
    
    /**
     * Wait till all the elements for the provided list of ids exist/not exist on the current document or fail after the timeout has passed  
     * (globally defined by the waitTimeout property)
     * 
     * @param ids A list with the ids for the html elements that we are looking for
     * @param exist True if we expect the elements to exist, false otherwise
     *
     * @return A promise. When resolved correctly, all the found instances will be passed to the .then() method
     */
    assertExistId(ids:string|string[], exist: boolean){
        
        ids = ArrayUtils.isArray(ids) ? ids as string[] : [ids as string];
        
        return this.assertExistXpath(ids.map(x => "//*[@id='" + x + "']"), exist);
    }
        
    
    /**
     * Wait till the provided list of elements exist/not exist on the current document or fail after the timeout has passed
     * (globally defined by the waitTimeout property) 
     * 
     * @param elements A list with the name for the html elements that we are looking for
     * @param exist True if we expect the elements to exist, false otherwise
     *
     * @return A promise. When resolved correctly, all the found instances will be passed to the .then() method
     */
    assertExistElement(elements:string|string[], exist: boolean){
        
        let elementsArray = ArrayUtils.isArray(elements) ? elements as string[] : [elements as string];
        
        return this.assertExistXpath(elementsArray.map(x => "//" + x), exist);
    }
    
    
    /**
     * Wait till all the provided list of xpath expressions are visible or invisible on the current document or fail after the timeout has passed  
     * (globally defined by the waitTimeout property)
     * 
     * @param xpaths A list with the xpath expressions that we are looking for (Examples on assertClickableXpath method docs)
     * @param visible True if we expect the elements to be visible, false otherwise
     *
     * @return A promise. When resolved correctly, all the found instances will be passed to the .then() method
     */
    assertVisibleXpath(xpaths:string|string[], visible: boolean){
        
        let xpathsArray = ArrayUtils.isArray(xpaths) ? xpaths as string[] : [xpaths as string];
        
        return this.assertExistXpath(xpathsArray, true).then((elementsFound:any) => {
            
            let recursiveCaller = (index: number) => {
                
                if(index >= xpathsArray.length){
                    
                    return elementsFound;
                }
                
                return this.driver.wait(visible ?
                    this.webdriver.until.elementIsVisible(elementsFound[index]):
                    this.webdriver.until.elementIsNotVisible(elementsFound[index]), this.waitTimeout)
                    .then(() => {
                        
                    return recursiveCaller(index + 1);
                    
                }).catch((e:Error) => {
                        
                    throw new Error('Expected ' + xpathsArray[index] + ' ' +
                        (visible ? 'to be visible ' : 'to be NON visible') + '\n' + e.toString());
                });
            }
            
            return recursiveCaller(0); 
        });
    }
    
    
    /**
     * Wait till the element which are defined by the provided xpath expression are found, visible and enabled (ready to be clicked), or fail after 
     * the timeout has passed (globally defined by the waitTimeout property)
     * 
     * @param xpath The xpath expression to search for the element that must be clickable. Examples:
     *        - To search by id: "//*[@id='someId']"
     *        - To search by the href value of all a elements: "//a[contains(@href, 'someurl')]"
     *        - To search by the href value of all a elements that are inside a section element: "//section/a[contains(@href, 'someurl')]"
     * @param clickable True if we expect the elements to be clickable, false otherwise
     *
     * @return A promise. When resolved correctly, all the found instances will be passed the .then() method
     */
    assertClickableXpath(xpaths:string|string[], clickable: boolean){
        
        let xpathsArray = ArrayUtils.isArray(xpaths) ? xpaths as string[] : [xpaths as string];
        
        return this.assertVisibleXpath(xpathsArray, true).then((elementsFound:any) => {
            
            let recursiveCaller = (index: number) => {
                
                if(index < xpathsArray.length){
                    
                    let errorCatcher = (e:Error) => {
                        
                        throw new Error('Expected ' + xpathsArray[index] + ' ' +
                            (clickable ? 'to be clickable ' : 'to be NON clickable') + '\n' + e.toString());
                    }
                
                    return this.driver.wait(clickable ?
                        this.webdriver.until.elementIsEnabled(elementsFound[index]) :
                        this.webdriver.until.elementIsDisabled(elementsFound[index]),
                        this.waitTimeout).then(() => {
                    
                        return recursiveCaller(index + 1);
                    
                    }).catch(errorCatcher);
                   
                }else{
                    
                     return elementsFound;
                }
            }
            
            return recursiveCaller(0);
        })
    }
    
    
    /**
     * Test that the current document visible area matches a previously stored snapshot.
     * If no snapshot still exists, it will be created the first time and test will pass. If it exist, it will be compared with the contents of the browser viewport.
     * Specific regions of the snapshot can be ignored if necessary, and comparison sensitivity can be also specified.
     *
     * If the test fails, a new snapshot will be created with the current browser visible area so we can reuse it in case we think it is now the actual valid one.
     * 
     * @param snapShotPath Full file system path to the snapshot that must be used to compare with the browser. First time will be created if not exists
     * @param failureSnapShotsPath Full file system path to a folder where two snapshots will be saved if the test fails (Set an empty string to use the same folder as snapShotPath):
     *        - One snapshot will be the snapshot as it is currently visible on the actual browser contents. This one can be reused if necessary
     *        - The other snapshot will show the pixel difference between the currently visible document area and the previously expected 
     * @param options Parameters to modify the assert behaviour:
     *        - maxDifferentPixels: (default 0) Allowed number of pixels that are allowed to be different between the saved snapshot and the browser viewport contents
     *        - tolerance: (default 0.1) A value between 0 and 1 which defines the threshold to define that a pixel is different or not. 0 means stricter image comparison
     *        - ignoreRegions: An array of objects with x,y, width and height properties where each object defines a rectangular area that will be ignored from the comparison
     *
     * @return A promise which will end correctly if the process finishes ok or fail with exception otherwise.
     */
    assertSnapshot(snapShotPath: string, failureSnapShotsPath: string,
                   options: { maxDifferentPixels: number,
                              tolerance: number,
                              ignoreRegions: {x: number, y: number, width: number, height: number}[]
                            }){

        // Validate the snapshot path
        StringUtils.forceNonEmptyString(snapShotPath, 'snapShotPath');
        
        // Test that specified path is a png file and the parent folder exists
        if(StringUtils.getPathExtension(snapShotPath).toLowerCase() !== 'png'){
            
            throw new Error('Snapshot path must be to a PNG file:\n' + snapShotPath);
        }

        if(!this.filesManager.isDirectory(StringUtils.getPath(snapShotPath))){
            
            throw new Error('Cannot save snapshot to non existant path:\n' + snapShotPath);
        }
        
        // Validate the failure snapshot path
        StringUtils.forceString(failureSnapShotsPath, 'failureSnapShotsPath');
        
        if(StringUtils.isEmpty(failureSnapShotsPath)){
            
            failureSnapShotsPath = StringUtils.getPath(snapShotPath);
        }
            
        if(!this.filesManager.isDirectory(failureSnapShotsPath)){
            
            throw new Error('Specified an invalid path for failureSnapShotsPath:\n' + failureSnapShotsPath);
        }
        
        // Init required instances if necessary
        if(this.nodePNG === null){
            
            this.nodePNG = require('pngjs').PNG;
        }
        
        if(this.nodePixelmatch === null){
            
            this.nodePixelmatch = require('pixelmatch');
        }
        
        if(this.nodeCanvas === null){
            
            this.nodeCanvas = require('canvas');
        }
        
        // Initialize default options if necessary
        options.maxDifferentPixels = options.hasOwnProperty('maxDifferentPixels') ? options.maxDifferentPixels : 0;
        options.tolerance = options.hasOwnProperty('tolerance') ? options.tolerance : 0.1;
        options.ignoreRegions = options.hasOwnProperty('ignoreRegions') ? options.ignoreRegions : [];
        
        return this.waitTillBrowserReady().then(() => {
 
            // Get the screen shot for the browser window visible contents with selenium
            return this.driver.takeScreenshot().then((data:any) => {
    
                let newSnapshot = this.nodePNG.sync.read(Buffer.from(data.replace(/^data:image\/png;base64,/, ''), 'base64'));
    
                // If the specified snapshot path does not exist, we will simply save the captured image and finish
                if(!this.filesManager.isFile(snapShotPath)){
                
                    this.filesManager.saveFile(snapShotPath, this.nodePNG.sync.write(newSnapshot));
                        
                    return;
                }
            
                // Load the previously stored snapshot to compare it with the new one
                let oldSnapshot = this.nodePNG.sync.read(this.nodeFs.readFileSync(snapShotPath));
                let diffSnapshot = new this.nodePNG({width: oldSnapshot.width, height: oldSnapshot.height});
                
                // Both snapshots must be the same size
                if(oldSnapshot.width !== newSnapshot.width || oldSnapshot.height !== newSnapshot.height){
                    
                    throw new Error(`Snapshot size mismatch: Expected ${oldSnapshot.width}x${oldSnapshot.height}px, but received ${newSnapshot.width}x${newSnapshot.height}px\n${snapShotPath}\n` +
                    'Please make sure your snapshot has the same exact size as the browser window that is being tested');
                }
                
                // Paint in black on both snapshots the specified ignore regions so they do not count for the comparison
                if(options.ignoreRegions.length > 0){
                    
                    // Aux function to paint a black rectangle on a PNG image instance
                    let paintRegion = (pngImage:any, x:number, y:number, width:number, height:number) => {
                        
                        if((x + width) > oldSnapshot.width || (y + height) > oldSnapshot.height){
                            
                            throw new Error('Specified an ignore region that is bigger than the snapshot\n' + snapShotPath);
                        }
                        
                        let canvas = this.nodeCanvas.createCanvas(oldSnapshot.width, oldSnapshot.height);
                        let ctx = canvas.getContext('2d');
                        let img = new this.nodeCanvas.Image();
                        img.src = this.nodePNG.sync.write(pngImage);
                        
                        ctx.fillStyle = "black";
                        ctx.clearRect(0, 0, canvas.width, canvas.height);
                        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                        ctx.fillRect(x, y, width, height);
                        
                        return this.nodePNG.sync.read(Buffer.from(canvas.toDataURL("image/png").replace(/^data:image\/png;base64,/, ''), 'base64'));
                    };
                    
                    for(let ignoreRegion of options.ignoreRegions){
                    
                        oldSnapshot = paintRegion(oldSnapshot, ignoreRegion.x, ignoreRegion.y, ignoreRegion.width, ignoreRegion.height);
                        newSnapshot = paintRegion(newSnapshot, ignoreRegion.x, ignoreRegion.y, ignoreRegion.width, ignoreRegion.height);
                    }
                }
                
                // Compare the old snapshot with the new one, and fail if different pixels exceed the expected         
                let differentPixels = this.nodePixelmatch(oldSnapshot.data, newSnapshot.data, diffSnapshot.data,
                    oldSnapshot.width, oldSnapshot.height, {threshold: options.tolerance});
                
                // Test diferent pixels are as expected
                if(options.maxDifferentPixels < differentPixels){
                    
                    // Save the new failure snapshot and the diff image at the same place where the old one is found
                    let failSnapshotFullPath = failureSnapShotsPath + this.filesManager.dirSep() + StringUtils.getPathElementWithoutExt(snapShotPath);
                    
                    this.filesManager.saveFile(failSnapshotFullPath + '-failedSnapshot.png', this.nodePNG.sync.write(newSnapshot));
                    this.filesManager.saveFile(failSnapshotFullPath + '-failedSnapshotDiff.png', this.nodePNG.sync.write(diffSnapshot));

                    throw new Error(`Snapshot mismatch: Allowed ${options.maxDifferentPixels} different pixels, but found ${differentPixels}\n${snapShotPath}\n` +
                        `Saved new snapshot (ignored regions painted in black) and diff file to:\n${failureSnapShotsPath}\nPlease use that snapshot if you think is correct now`);
                };
            });
        });
    }
    
    
    /**
     * This method will perform standard recursive tests on a full website provided its root link. The whole site will be tested
     * on all its pages against broken links, valid html structure, valid css, ...
     * 
     * @param siteRoot The full url to the root of the site to test
     *
     * @return A promise which will end correctly if the process finishes ok or fail with exception otherwise.
     */
    assertWholeWebSite(siteRoot: string){
        
        return this.loadUrl(siteRoot).then((results:any) => {
            
            // TODO
            console.log('TODO - Perform site recursive tests on ' + results.finalUrl);
        });
    }
    
    
    /**
     * Click on one or more document elements (sequentially) by id, waiting 1.5 seconds between each call
     * 
     * @param id A single string with the id for the element which we want to click or a list of ids that will be sequentially clicked
     *        one after the other. Any failure trying to click any of the provided ids will throw an exception
     *
     * @return A promise which will end correctly if the process finishes ok or fail with exception otherwise.
     */
    clickById(id:string|string[]){
        
        let ids = ArrayUtils.isArray(id) ? id as string[] : [id as string];
        
        for(let i = 0; i < ids.length; i++){
            
            ids[i] = "//*[@id='" + ids[i] + "']";
        }
        
        return this.clickByXpath(ids);
    }
    
    
    /**
     * Click on one or more document elements (sequentially) by xpath, waiting 1.5 seconds between each call
     * 
     * @param xpath A single string with the xpath query that lets us find the element which we want to click or a list of xpaths
     *        that will be sequentially clicked one after the other. Any failure trying to click any of the provided xpaths will throw an exception
     *
     * @return A promise which will end correctly if the process finishes ok or fail with exception otherwise.
     */
    clickByXpath(xpaths:string|string[]){
    
        let xpathsArray = ArrayUtils.isArray(xpaths) ? xpaths as string[] : [xpaths as string];
    
        let recursiveCaller = (index: number) => {
            
            if(index >= xpathsArray.length){
                
                return;
            }
            
            return this._clickByXpathAux(xpathsArray[index], 5).then(() => {
                
                return this.waitMilliseconds(xpathsArray.length <= 0 ? 0 : 1500).then(() => {
                    
                    return recursiveCaller(index + 1);
                });
            });      
        }
        
        return recursiveCaller(0);   
    }
    
    
    /**
     * Auxiliary method for the clickByXpath method. It will click on the provided xpath and retry the specified number of times if the click fails.
     * 
     * @param xpath A single string with the xpath query that lets us find the element which we want to click. Any failure trying to click will throw an exception
     * @param attempts Number of times the wait for element to be clickable and click process will be retried before throwing an exception if click is not possible.
     */
    private _clickByXpathAux(xpath:string, attempts: number){
    
        return this.assertClickableXpath(xpath, true).then((elements:any) => {
                
            return elements[0].click().then().catch((e:Error) => {
    
                if(attempts <= 0){
                    
                    throw new Error('Error trying to click by: ' + xpath + '\n' + e.toString());
                
                }else{
                    
                    return this._clickByXpathAux(xpath, attempts - 1); 
                }
            });
        });
    }
    
    
    /**
     * Remove all text for the specified document element
     * 
     * @param id The html id for the element from which we want to clear the text
     *
     * @return A promise which will end correctly if the process finishes ok or fail with exception otherwise.
     */
    clearInputById(id:string){
        
        return this.clearInputByXpath("//*[@id='" + id + "']");
    }
    
    
    /**
     * Remove all text for the specified document element
     * 
     * @param xpath The xpath query that lets us find element from which we want to clear the text
     *
     * @return A promise which will end correctly if the process finishes ok or fail with exception otherwise.
     */
    clearInputByXpath(xpath:string){
        
        return this.driver.wait(this.webdriver.until.elementLocated(this.webdriver.By.xpath(xpath)), this.waitTimeout)
            .then((element: any) => {
            
            return element.clear().then(() => {
                
                // We send a backspace key to make sure that the key change events are fired on the component
                return element.sendKeys("\b");
            });
        
        }).catch((e:Error) => {
            
            throw new Error('Error trying to clear input by: ' + xpath + '\n' + e.toString());
        });
    }
    
    
    /**
     * Send text to the specified document element 
     * 
     * @param id The html id for the element that we want to send text to
     * @param text The text we want to send
     *
     * @return A promise which will end correctly if the process finishes ok or fail with exception otherwise.
     */
    sendKeysById(id:string, text:string){
        
        return this.sendKeysByXpath("//*[@id='" + id + "']", text);
    }
    
    
    /**
     * Send text to the specified document element
     * 
     * @param xpath The xpath query that lets us find element to which we want to send text
     * @param text The text we want to send
     *
     * @return A promise which will end correctly if the process finishes ok or fail with exception otherwise.
     */
    sendKeysByXpath(xpath:string, text:string){
        
        return this.driver.wait(this.webdriver.until.elementLocated(this.webdriver.By.xpath(xpath)), this.waitTimeout)
            .then((element: any) => {
            
            return element.sendKeys(text);
        
        }).catch((e:Error) => {
            
            throw new Error('Error trying to send input by: ' + xpath + '\n' + e.toString());
        });
    }
    
    
    /**
     * Obtain the value for an attribute of a document element 
     * 
     * @param id The html id for the element
     * @param attribute The attribute that we want to read
     *
     * @return A promise. When resolved correctly, the attribute value will be passed to the .then() method
     */
    getAttributeById(id:string, attribute:string){
        
        return this.getAttributeByXpath("//*[@id='" + id + "']", attribute);
    }
    
    
    /**
     * Obtain the value for an attribute of a document element 
     * 
     * @param xpath The xpath query that lets us find the element
     * @param attribute The attribute that we want to read
     *
     * @return A promise which will end correctly if the process finishes ok or fail with exception otherwise.
     */
    getAttributeByXpath(xpath:string, attribute:string){
        
        return this.driver.wait(this.webdriver.until.elementLocated(this.webdriver.By.xpath(xpath)), this.waitTimeout)
            .then((element: any) => {
            
            return element.getAttribute(attribute);
        
        }).catch((e:Error) => {
            
            throw new Error('Error trying to get attribute by: ' + xpath + '\n' + e.toString());
        });
    }
    
    
    /**
     * Allows us to secuentially execute any of this class methods one after the other by chaining them via promises.
     * It is basically a shortcut to execute several browser automations one after the other with a compact syntax
     * 
     * @param queries An array of arrays where each element will define a single call to one of this class methods. First element must be the
     *        method name and next ones the method parameter values. Each call will wait till its promise is executed, and then the 
     *        next of the list will be called, till all finish. If any error happens, execution will be interrupted.
     *
     * @return A promise which will end correctly if the process finishes ok or fail with exception otherwise.
     */
    queryCalls(queries: any[]){
        
        let recursiveCaller = (queries: any[]) => {
            
            if(queries.length <= 0){
                
                return;
            }
            
            let query = queries[0];
            let functionName = query[0];
            
            if((this as any)[functionName]) {
                
                let functionObject = (this as any)[functionName];
            
                if(functionObject.length !== (query.length - 1)){
                    
                    throw new Error('Method ' + functionName + ' expects ' + functionObject.length + ' arguments, but received ' + (query.length - 1));
                }
                
                // Run the method passing all the parameters that are specified at the query element, and execute the recursiveCaller
                // at the then() part of the returned promise
                return functionObject.apply(this, query.slice(1)).then(() => {
                    
                    return recursiveCaller(queries.slice(1));
                });
            
            }else{
                
                throw new Error('Specified method to query does not exist: ' + functionName);
            }
        }
        
        return recursiveCaller(queries); 
    }
    
    
    /**
     * Close the specified browser tab
     *
     * @param tabIndex The numeric index for the tab that we want to close. 0 is the first, the one most to the left
     *
     * @return A promise which will end correctly if the process finishes ok or fail with exception otherwise.
     */
    closeBrowserTab(tabIndex:number){
    
        return this.driver.getAllWindowHandles().then((windowHandles: any) => {
            
            return this.driver.switchTo().window(windowHandles[tabIndex]).then(() => {
                
                 return this.driver.close();
            });
        }); 
    }
    
    
    /**
     * Disconnect and close the browser
     *
     * @return A promise which will end correctly if the process finishes ok or fail with exception otherwise.
     */
    quit(){
        
        if(this.driver !== null){
            
            return this.driver.quit();
        }
    }
}
