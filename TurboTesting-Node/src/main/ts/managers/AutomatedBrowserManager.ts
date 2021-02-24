/**
 * TurboTesting is a general purpose cross-language library to improve automated testing productivity
 *
 * Website : -> http://www.turboframework.org
 * License : -> Licensed under the Apache License, Version 2.0. You may not use this file except in compliance with the License.
 * License Url : -> http://www.apache.org/licenses/LICENSE-2.0
 * CopyRight : -> Copyright 2015 Edertone Advanded Solutions (08211 Castellar del Vallès, Barcelona). http://www.edertone.com
 */
 

import { ArrayUtils, StringUtils, HTTPManager, HTTPManagerGetRequest } from 'turbocommons-ts';
import { HTTPTestsManager } from './HTTPTestsManager';
import { StringTestsManager } from './StringTestsManager';
import { ObjectTestsManager } from './ObjectTestsManager';
import { FilesManager } from 'turbodepot-node';

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
        
        this.nodeFs = require('fs');
        this.nodeUrl = require('url');
        this.nodeExecSync = require('child_process').execSync;
        this.webdriver = require('selenium-webdriver');
        this.chrome = require('selenium-webdriver/chrome');
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
     * Specify the viewport size and the main browser window position. This method can be called at any time
     *
     * @param width The desired browser viewport width. (Note this is the internal area where the website is displayed)
     * @param height The desired browser viewport height. (Note this is the internal area where the website is displayed)
     * @param x The desired browser left corner position
     * @param y The desired browser top corner position
     * @param completeCallback A method that will be executed once the process finishes correctly
     */
    setBrowserSizeAndPosition(width: number, height: number, x = 0, y = 0, completeCallback: () => void){
    
        this.driver.executeScript(`return [window.outerWidth - window.innerWidth + ${width}, window.outerHeight - window.innerHeight + ${height}];`)
            .then((viewportSize: any) =>{
        
            this.driver.manage().window().setRect({width: viewportSize[0], height: viewportSize[1], x: x, y: y}).then(completeCallback);
        });
    }
    
    
    /**
     * Maximize the browser window just like clicking on the OS maximize button. This method can be called at any time
     *
     * @param completeCallback A method that will be executed once the process finishes correctly
     */
    setBrowserAsMaximized(completeCallback: () => void){
      
        this.driver.manage().window().maximize().then(completeCallback);
    }
    
    
    /**
     * Set the full screen state for the browser window. This method can be called at any time
     *
     * @param completeCallback A method that will be executed once the process finishes correctly
     */
    setBrowserAsFullScreen(completeCallback: () => void){
      
        this.driver.manage().window().fullscreen().then(completeCallback);
    }
    
    
    /**
     * Specify which of the currently open tabs is active for the user.
     *
     * @param tabIndex The numeric index for the tab that we want to set as active. 0 is the first, the one most to the left
     * @param completeCallback A method that will be executed once the process finishes correctly
     */
    setBrowserActiveTab(tabIndex:number, completeCallback: () => void){
    
        this.driver.getAllWindowHandles().then((windowHandles: any) => {
            
            this.driver.switchTo().window(windowHandles[tabIndex]).then(completeCallback);
        }); 
    }
    
    
    /**
     * Remove all the currently visible entries from the browser console 
     * 
     * @param completeCallback A method that will be executed once the browser console is cleared
     */
    clearConsole(completeCallback: () => void){
        
        return this.driver.executeScript("return console.clear()").then(completeCallback);  
    }


    /**
     * Wait till the browser has finished loading everything and is in a ready state.
     * If it is already ready once this method is called, the complete callback will be called inmediately
     * 
     * @param completeCallback A method that will be executed once the browser is ready
     */
    waitTillBrowserReady(completeCallback: () => void){
        
        this.driver.wait(() => {
            
            return this.driver.executeScript('return document.readyState').then((readyState: any) => {
                
                return readyState === 'complete';
            });
            
        }, this.waitTimeout).then(completeCallback).catch((e:Error) => {
            
            throw new Error('Error waiting for browser ready: ' + e.toString());
        });
    }
    
    
    /**
     * Wait till the specified number of milliseconds has passed.  
     * 
     * @param milliseconds The number of milliseconds that we want to wait
     * @param completeCallback A method that will be called once the time has passed
     */
    waitMilliseconds(milliseconds:number, completeCallback: () => void){
        
        setTimeout(completeCallback, milliseconds);
    }
    
    
    /**
     * Request the browser instance to load the specified URL.
     * If we have defined any wildcard, they will be replaced on the url before requesting it on the browser.
     * 
     * @param url The url we want to open with the browser
     * @param completeCallback A method that will be executed once the url loading finishes. A single results object will be passed
     *        to this method, containing all the loaded page information we may need: title, source (may have been altered by the browser after loading is complete) 
     *        and finalUrl (in case any redirection happened from the original url)
     */
    loadUrl(url: string, completeCallback: (results: {title:string; source:any; finalUrl:string}) => void){
        
        let results: any = {};
    
        this.driver.get(this.stringTestsManager.replaceWildCardsOnText(url, this.wildcards)).then(() => {
            
            this.driver.getTitle().then((title: any) => {
            
                results.title = title;
                
                this.driver.executeScript("return document.documentElement.outerHTML").then((html: string) => {
                
                    results.source = html;

                    this.driver.getCurrentUrl().then((finalUrl: string) => {
                        
                        results.finalUrl = finalUrl;
                        
                        this.driver.manage().logs().get('browser').then((browserLogs: any) => {
                            
                            this.logEntries = browserLogs;
                            
                            this.waitTillBrowserReady(() => {
                                
                                completeCallback(results);
                            });
                        }); 
                    });
                });
            });
            
        }).catch((e:Error) => {
            
            throw new Error('Error in loadUrl calling driver.get for ' + url +':\n' + e.toString());
        });
    }
    
    
    /**
     * Perform several tests regarding the current state of the browser: Verify the current url, title, html original code, html
     * loaded code, errors on console, etc..
     * 
     * If any of the specified assertions fail, an exception will be thrown and complete callback won't be executed
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
     *        
     * @param completeCallback A method that will be called once all the tests have been successfully executed on the current browser state
     * 
     * @return void
     */
    assertBrowserState(asserts: any, completeCallback: () => void){
        
        let anyErrors: string[] = [];
    
        this.objectTestsManager.assertIsObject(asserts);
        
        // Check that asserts has the right properties
        try {
            
            this.objectTestsManager.assertObjectProperties(asserts,
                    ['url', 'titleContains', 'ignoreConsoleErrors', 'sourceHtmlContains', 'sourceHtmlRegExp', 'sourceHtmlStartsWith',
                    'sourceHtmlEndsWith', 'sourceHtmlNotContains', 'loadedHtmlStartsWith', 'loadedHtmlEndsWith', 'loadedHtmlContains',
                    'loadedHtmlRegExp', 'loadedHtmlNotContains', 'tabsCount'], false);
                 
        } catch (e) {
        
            anyErrors.push(e.toString());
        }
        
        this.waitTillBrowserReady(() => {
        
            // An auxiliary method to perform the final errors test and call the complete callback
            let finish = () => {
                
                if(anyErrors.length > 0){
                    
                    throw new Error(`AutomatedBrowserManager.assertBrowserState failed with ${anyErrors.length} errors:\n` + anyErrors.join('\n'));
                }
                
                completeCallback();
            }
            
            // An auxiliary method that is used to validate the specified html code with the specified asserts
            let validateHtml = (html: string, url: string, startsWith: string, endsWith: string, notContains: string, contains: string, regExp: RegExp) => {
                
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
            
            this.driver.executeScript('return window.location.href').then((browserUrl: any) => {
                
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
                
                this.driver.getTitle().then((browserTitle: any) => {
                    
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
                    this.driver.manage().logs().get('browser').then((browserLogs: any) => {
                        
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
                        this.driver.executeScript("return document.documentElement.outerHTML").then((html: string) => {
                        
                            validateHtml(html, browserUrl,
                                    asserts.hasOwnProperty('loadedHtmlStartsWith') ? asserts.loadedHtmlStartsWith : null,
                                    asserts.hasOwnProperty('loadedHtmlEndsWith') ? asserts.loadedHtmlEndsWith : null,
                                    asserts.hasOwnProperty('loadedHtmlNotContains') ? asserts.loadedHtmlNotContains : null,
                                    asserts.hasOwnProperty('loadedHtmlContains') ? asserts.loadedHtmlContains : null,
                                    asserts.hasOwnProperty('loadedHtmlRegExp') ? asserts.loadedHtmlRegExp : null);
                            
                            this.driver.getAllWindowHandles().then((windowHandles: any) => {
                            
                                // If tabsCount is specified, check that the browser tabs number matches it   
                                if(asserts.hasOwnProperty('tabsCount') && asserts.tabsCount !== windowHandles.length){
                                    
                                    anyErrors.push('Browser tabs count (' + windowHandles.length + ') must be: ' + asserts.tabsCount);
                                }
                            
                                // In case none of the real source code assertions have been defined, we will finish here, to avoid performing an unnecessary
                                // http request to obtain the real source code.
                                if((!asserts.hasOwnProperty('sourceHtmlStartsWith') || asserts.sourceHtmlStartsWith === null) &&
                                   (!asserts.hasOwnProperty('sourceHtmlEndsWith') || asserts.sourceHtmlEndsWith === null) &&
                                   (!asserts.hasOwnProperty('sourceHtmlNotContains') || asserts.sourceHtmlNotContains === null) &&
                                   (!asserts.hasOwnProperty('sourceHtmlContains') || asserts.sourceHtmlContains === null),
                                   (!asserts.hasOwnProperty('sourceHtmlRegExp') || asserts.sourceHtmlRegExp === null)){
                                    
                                    finish();
                                    
                                    return;
                                }
                                
                                // If the url to test belongs to a local file, we will directly get the source code from there.
                                let urlLocalFileContents = '';
                                    
                                try {
    
                                    urlLocalFileContents = this.nodeFs.readFileSync(this.nodeUrl.fileURLToPath(browserUrl), "utf8");
    
                                } catch (e) {}
    
                                if(urlLocalFileContents !== ''){
    
                                    validateHtml(urlLocalFileContents, browserUrl,
                                            asserts.hasOwnProperty('sourceHtmlStartsWith') ? asserts.sourceHtmlStartsWith : null,
                                            asserts.hasOwnProperty('sourceHtmlEndsWith') ? asserts.sourceHtmlEndsWith : null,
                                            asserts.hasOwnProperty('sourceHtmlNotContains') ? asserts.sourceHtmlNotContains : null,
                                            asserts.hasOwnProperty('sourceHtmlContains') ? asserts.sourceHtmlContains : null,
                                            asserts.hasOwnProperty('sourceHtmlRegExp') ? asserts.sourceHtmlRegExp : null);
                                    
                                    finish();
                                    
                                    return;
                                }
                                
                                // Perform an http request to get the url real code. This code may be different from the one that is found at the browser level,
                                // cause the browser or any javascript dynamic process may alter it.
                                try{
                                    
                                    let request = new HTTPManagerGetRequest(browserUrl);
                                    
                                    request.errorCallback = (errorMsg: string, errorCode: number) => {
                                    
                                        anyErrors.push('Could not load url: ' + browserUrl + '\nError code: ' + errorCode + '\n' + errorMsg);
                                    };
                                    
                                    request.successCallback = (html: any) => {
                                       
                                        validateHtml(html, browserUrl,
                                            asserts.hasOwnProperty('sourceHtmlStartsWith') ? asserts.sourceHtmlStartsWith : null,
                                            asserts.hasOwnProperty('sourceHtmlEndsWith') ? asserts.sourceHtmlEndsWith : null,
                                            asserts.hasOwnProperty('sourceHtmlNotContains') ? asserts.sourceHtmlNotContains : null,
                                            asserts.hasOwnProperty('sourceHtmlContains') ? asserts.sourceHtmlContains : null,
                                            asserts.hasOwnProperty('sourceHtmlRegExp') ? asserts.sourceHtmlRegExp : null);
                                     };
    
                                    // Once the request to get the real browser code is done, we will check if any error has happened
                                    request.finallyCallback = finish;
                                    
                                    this.httpManager.execute(request);    
                                    
                                } catch (e) {
    
                                    anyErrors.push('Error performing http request to '+ browserUrl + '\n' + e.toString());
                                    
                                    finish();
                                }
                            });
                        });
                    });
                });
            });
        });
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
     * @param completeCallback A method that will be called once all the urls from the list have been tested.
     */
    assertUrlsLoadOk(urls: any[], completeCallback: () => void){
    
        let anyErrors: string[] = [];
        
        // Fail if list has duplicate values
        if(ArrayUtils.hasDuplicateElements(urls.map(l => l.url))){
            
            throw new Error('AutomatedBrowserManager.assertUrlsLoadOk duplicate urls: ' + ArrayUtils.getDuplicateElements(urls.map(l => l.url)).join('\n'));
        }
        
        // Load all the urls on the list and perform a request for each one.
        let recursiveCaller = (urls: any[], completeCallback: () => void) => {
            
            if(urls.length <= 0){
                
                if(anyErrors.length > 0){
                    
                    throw new Error(`AutomatedBrowserManager.assertUrlsLoadOk failed with ${anyErrors.length} errors:\n` + anyErrors.join('\n'));
                }
                
                return completeCallback();
            }
        
            let entry = urls.shift();
            entry.url = this.stringTestsManager.replaceWildCardsOnText(entry.url, this.wildcards);
            
            this.loadUrl(entry.url, () => {

                // The url assert must be removed from the entry to prevent it from failing on the assertBrowserState method
                delete entry.url;

                this.assertBrowserState(entry, () => {

                    recursiveCaller(urls, completeCallback);
                });            
            });
        }
        
        recursiveCaller(urls, completeCallback);
    }
        
    
    /**
     * Test that all the provided urls redirect to another expected url.
     * If any of the provided urls fail to redirect to its expected value, the test will throw an exception.
     * 
     * @param urls An array of objects where each one contains the following properties:
     *        "url" the url to test
     *        "to" the url (or a fragment of it) that must be the final redirection target for the provided url
     *        "comment" (Optional) An informative comment about the redirect purpose
     * @param completeCallback A method that will be called once all the urls from the list have been tested.
     */
    assertUrlsRedirect(urls: any[], completeCallback: () => void){
    
        // Fail if list has duplicate values
        if(ArrayUtils.hasDuplicateElements(urls.map(l => l.url))){
            
            throw new Error('duplicate urls: ' + ArrayUtils.getDuplicateElements(urls.map(l => l.url)).join('\n'));
        }
        
        let anyErrors: string[] = [];
        
        // Load all the urls on the list and perform a request for each one.
        let recursiveCaller = (urls: any[], completeCallback: () => void) => {
            
            if(urls.length <= 0){
                
                if(anyErrors.length > 0){
                    
                    throw new Error(`failed with ${anyErrors.length} errors:\n` + anyErrors.join('\n'));
                }
                
                return completeCallback();
            }
            
            let entry = urls.shift();
            entry.url = this.stringTestsManager.replaceWildCardsOnText(entry.url, this.wildcards);
            entry.to = this.stringTestsManager.replaceWildCardsOnText(entry.to, this.wildcards);
            
            this.loadUrl(entry.url, (results) => {
                
                // If the finalUrl does not end with entry.to value, the test will fail
                if(results.finalUrl.indexOf(entry.to, results.finalUrl.length - entry.to.length) === -1){
                    
                    anyErrors.push('Url redirect failed. expected:\n    ' + entry.url +
                        ' to redirect to:\n    ' + entry.to + ' but was:\n    ' + results.finalUrl);
                }
                    
                recursiveCaller(urls, completeCallback);
            });
        }
        
        recursiveCaller(urls, completeCallback);
    }
    
    
    /**
     * Test that all the urls on a given list return non "200 ok" error code.
     * 
     * If any of the provided urls gives a 200 ok result or can be correctly loaded, the test will fail
     *
     * @see HTTPTestsManager.assertUrlsFail
     * 
     * @param urls An array of strings where each item is an url to test
     * @param completeCallback A method that will be called once all the urls from the list have been tested.
     */
    assertUrlsFail(urls: string[], completeCallback: () => void){
    
        this.httpTestsManager.wildcards = this.wildcards;
        
        try {

            this.httpTestsManager.assertUrlsFail(urls, completeCallback);
            
        } catch (e) {

            throw new Error(e.message);
        }
    }
    
    
    /**
     * Wait till all the provided list of xpath expressions exist/not exist on the current document or fail after the timeout has passed  
     * (globally defined by the waitTimeout property)
     * 
     * @param xpaths A list with the xpath expressions that we are looking for (Examples on assertClickableXpath method docs)
     * @param exist True if we expect the elements to exist, false otherwise
     * @param completeCallback A method that will be called once the elements are found and will receive all the located instances
     */
    assertExistXpath(xpaths:string|string[], exist: boolean, completeCallback: (elements: any[]) => void){
        
        let elemensFound: any[] = [];
        
        let recursiveCaller = (xpathsArray:string[], index: number, completeCallback: (e: any[]) => void) => {
            
            if(index >= xpathsArray.length){
                
                return completeCallback(elemensFound);
            }
            
            if(!exist){
                
                this.driver.findElement(this.webdriver.By.xpath(xpathsArray[index]))
                    .then(() => {
                        
                        exist = true;
                        
                        throw new Error('Expected xpath to NOT exist, but existed: ' + xpathsArray[index]);
                        
                    }).catch((e:Error) => {
                        
                        if(exist){
                            
                            throw new Error(e.toString());
                        }
                        
                        recursiveCaller(xpathsArray, index + 1, completeCallback);
                    });
            
            }else{
                
                this.driver.wait(this.webdriver.until.elementLocated(this.webdriver.By.xpath(xpathsArray[index])), this.waitTimeout)
                    .then((element:any) => {
                        
                    elemensFound.push(element);
                        
                    recursiveCaller(xpathsArray, index + 1, completeCallback);
                    
                }).catch((e:Error) => {
                    
                    throw new Error('Error trying to find xpath: ' + xpathsArray[index] + '\n' + e.toString());
                });
            }
        }
        
        recursiveCaller(ArrayUtils.isArray(xpaths) ? xpaths as string[] : [xpaths as string], 0, completeCallback);  
    }
    
    
    /**
     * Wait till all the elements for the provided list of ids exist/not exist on the current document or fail after the timeout has passed  
     * (globally defined by the waitTimeout property)
     * 
     * @param ids A list with the ids for the html elements that we are looking for
     * @param exist True if we expect the elements to exist, false otherwise
     * @param completeCallback A method that will be called once the elements are found and will receive all the located instances
     */
    assertExistId(ids:string|string[], exist: boolean, completeCallback: (elements: any[]) => void){
        
        ids = ArrayUtils.isArray(ids) ? ids as string[] : [ids as string];
        
        this.assertExistXpath(ids.map(x => "//*[@id='" + x + "']"), exist, completeCallback);
    }
        
    
    /**
     * Wait till the provided list of elements exist/not exist on the current document or fail after the timeout has passed
     * (globally defined by the waitTimeout property) 
     * 
     * @param elements A list with the name for the html elements that we are looking for
     * @param exist True if we expect the elements to exist, false otherwise
     * @param completeCallback A method that will be called once the elements are found and will receive all the located instances
     */
    assertExistElement(elements:string|string[], exist: boolean, completeCallback: (elements: any[]) => void){
        
        let elementsArray = ArrayUtils.isArray(elements) ? elements as string[] : [elements as string];
        
        this.assertExistXpath(elementsArray.map(x => "//" + x), exist, completeCallback);
    }
    
    
    /**
     * Wait till all the provided list of xpath expressions are visible or invisible on the current document or fail after the timeout has passed  
     * (globally defined by the waitTimeout property)
     * 
     * @param xpaths A list with the xpath expressions that we are looking for (Examples on assertClickableXpath method docs)
     * @param visible True if we expect the elements to be visible, false otherwise
     * @param completeCallback A method that will be called once the elements are found and will receive all the located instances
     */
    assertVisibleXpath(xpaths:string|string[], visible: boolean, completeCallback: (elements: any[]) => void){
        
        let xpathsArray = ArrayUtils.isArray(xpaths) ? xpaths as string[] : [xpaths as string];
        
        this.assertExistXpath(xpathsArray, true, (elementsFound) => {
            
            let recursiveCaller = (index: number, completeCallback: (e: any[]) => void) => {
                
                if(index >= xpathsArray.length){
                    
                    return completeCallback(elementsFound);
                }
                
                this.driver.wait(visible ?
                    this.webdriver.until.elementIsVisible(elementsFound[index]):
                    this.webdriver.until.elementIsNotVisible(elementsFound[index]), this.waitTimeout)
                    .then(() => {
                        
                    recursiveCaller(index + 1, completeCallback);
                    
                }).catch((e:Error) => {
                        
                    throw new Error('Expected ' + xpathsArray[index] + ' ' +
                        (visible ? 'to be visible ' : 'to be NON visible') + '\n' + e.toString());
                });
            }
            
            recursiveCaller(0, completeCallback); 
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
     * @param completeCallback A method that will be called once the elements are found and will receive all the located instances
     */
    assertClickableXpath(xpaths:string|string[], clickable: boolean, completeCallback: (elements: any[]) => void){
        
        let xpathsArray = ArrayUtils.isArray(xpaths) ? xpaths as string[] : [xpaths as string];
        
        this.assertVisibleXpath(xpathsArray, true, (elementsFound) => {
            
            let recursiveCaller = (index: number, completeCallback: (e: any[]) => void) => {
                
                if(index < xpathsArray.length){
                    
                    let errorCatcher = (e:Error) => {
                        
                        throw new Error('Expected ' + xpathsArray[index] + ' ' +
                            (clickable ? 'to be clickable ' : 'to be NON clickable') + '\n' + e.toString());
                    }
                
                    this.driver.wait(clickable ?
                        this.webdriver.until.elementIsEnabled(elementsFound[index]) :
                        this.webdriver.until.elementIsDisabled(elementsFound[index]),
                        this.waitTimeout).then(() => {
                    
                        recursiveCaller(index + 1, completeCallback);
                    
                    }).catch(errorCatcher);
                   
                }else{
                    
                     return completeCallback(elementsFound);
                }
            }
            
            recursiveCaller(0, completeCallback);
        })
    }
    
    
    /**
     * Test that the current document visible area matches a previously stored snapshot. First time the snapshot will be stored if not exist, and then always compared with
     * the contents of the browser viewport. Specific regions of the snapshot can be ignored if necessary, and comparison sensitivity can be also specified.
     * 
     * @param snapShotPath Full file system path to the snapshot that must be used to compare with the browser. First time will be created if not exists
     * @param options Parameters to modify the assert behaviour:
     *        - maxDifferentPixels: (default 0) Allowed number of pixels that are allowed to be different between the saved snapshot and the browser viewport contents
     *        - tolerance: (default 0.1) A value between 0 and 1 which defines the threshold to define that a pixel is different or not. 0 means stricter image comparison
     *        - ignoreRegions: An array of objects with x,y, width and height properties where each object defines a rectangular area that will be ignored from the comparison
     * @param completeCallback A method that will be called once the assert finishes correctly
     */
    assertSnapshot(snapShotPath: string,
                   options: { maxDifferentPixels: number,
                              tolerance: number,
                              ignoreRegions: {x: number, y: number, width: number, height: number}[]
                            },
                   completeCallback: () => void){
        
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
        
        // Test that specified path is a png file and tha parent folder exists
        if(StringUtils.getPathExtension(snapShotPath).toLowerCase() !== 'png'){
            
            throw new Error('Snapshot path must be to a PNG file: ' + snapShotPath);
        }

        if(!this.filesManager.isDirectory(StringUtils.getPath(snapShotPath))){
            
            throw new Error('Cannot save snapshot to non existant path: ' + snapShotPath);
        }
        
        this.waitTillBrowserReady(() => {
 
            // Get the screen shot for the browser window visible contents with selenium
            this.driver.takeScreenshot().then((data:any) => {
    
                let newSnapshot = this.nodePNG.sync.read(Buffer.from(data.replace(/^data:image\/png;base64,/, ''), 'base64'));
    
                // If the specified snapshot path does not exist, we will simply save the captured image and finish
                if(!this.filesManager.isFile(snapShotPath)){
                
                    this.filesManager.saveFile(snapShotPath, this.nodePNG.sync.write(newSnapshot));
                        
                    return completeCallback();
                }
            
                // Load the previously stored snapshot to compare it with the new one
                let oldSnapshot = this.nodePNG.sync.read(this.nodeFs.readFileSync(snapShotPath));
                let diffSnapshot = new this.nodePNG({width: oldSnapshot.width, height: oldSnapshot.height});
                
                // Both snapshots must be the same size
                if(oldSnapshot.width !== newSnapshot.width || oldSnapshot.height !== newSnapshot.height){
                    
                    throw new Error(`Snapshot size mismatch: Expected ${oldSnapshot.width}x${oldSnapshot.height}px, but received ${newSnapshot.width}x${newSnapshot.height}px\n${snapShotPath}`);
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
                    
                    // Save the new snapshot and the diff image at the same place where the old one is found
                    let failSnapshotPath = StringUtils.getPath(snapShotPath) + '/' + StringUtils.getPathElementWithoutExt(snapShotPath);
                    this.filesManager.saveFile(failSnapshotPath + '-failedSnapshot.png', this.nodePNG.sync.write(newSnapshot));
                    this.filesManager.saveFile(failSnapshotPath + '-failedSnapshotDiff.png', this.nodePNG.sync.write(diffSnapshot));

                    throw new Error(`Snapshot mismatch: Allowed ${options.maxDifferentPixels} different pixels, but found ${differentPixels}\n${snapShotPath}\nSaved new snapshot with ignored regions painted in black and diff file to:\n${StringUtils.getPath(snapShotPath)}\n`);
                }
                     
                completeCallback();
            });
        });
    }
    
    
    /**
     * This method will perform standard recursive tests on a full website provided its root link. The whole site will be tested
     * on all its pages against broken links, valid html structure, valid css, ...
     * 
     * @param siteRoot The full url to the root of the site to test
     * @param completeCallback A method that will be executed once all the tests have finished
     */
    assertWholeWebSite(siteRoot: string, completeCallback: () => void){
        
        this.loadUrl(siteRoot, (results) => {
            
            // TODO
            console.log('TODO - Perform site recursive tests on ' + results.finalUrl);
            
            completeCallback();
        });
    }
    
    
    /**
     * Click on one or more document elements (sequentially) by id, waiting 1.5 seconds between each call
     * 
     * @param id A single string with the id for the element which we want to click or a list of ids that will be sequentially clicked
     *        one after the other. Any failure trying to click any of the provided ids will throw an exception
     * @param completeCallback A method that will be called once the specified element or all the specified elements are found and a click is performed
     */
    clickById(id:string|string[], completeCallback: () => void){
        
        let ids = ArrayUtils.isArray(id) ? id as string[] : [id as string];
        
        for(let i = 0; i < ids.length; i++){
            
            ids[i] = "//*[@id='" + ids[i] + "']";
        }
        
        this.clickByXpath(ids, completeCallback);
    }
    
    
    /**
     * Click on one or more document elements (sequentially) by xpath, waiting 1.5 seconds between each call
     * 
     * @param xpath A single string with the xpath query that lets us find the element which we want to click or a list of xpaths
     *        that will be sequentially clicked one after the other. Any failure trying to click any of the provided xpaths will throw an exception
     * @param completeCallback A method that will be called once the specified element or all the specified elements are found and a click is performed
     */
    clickByXpath(xpaths:string|string[], completeCallback: () => void){
    
        let xpathsArray = ArrayUtils.isArray(xpaths) ? xpaths as string[] : [xpaths as string];
    
        let recursiveCaller = (index: number, completeCallback: () => void) => {
            
            if(index >= xpathsArray.length){
                
                return completeCallback();
            }
            
            this._clickByXpathAux(xpathsArray[index], 5, () => {
                
                this.waitMilliseconds(xpathsArray.length <= 0 ? 0 : 1500, () => {
                    
                    recursiveCaller(index + 1, completeCallback);
                });
            });      
        }
        
        recursiveCaller(0, completeCallback);   
    }
    
    
    /**
     * Auxiliary method for the clickByXpath method. It will click on the provided xpath and retry the specified number of times if the click fails.
     * 
     * @param xpath A single string with the xpath query that lets us find the element which we want to click. Any failure trying to click will throw an exception
     * @param attempts Number of times the wait for element to be clickable and click process will be retried before throwing an exception if click is not possible.
     * @param completeCallback A method that will be called once the specified element is found and a click is performed
     */
    private _clickByXpathAux(xpath:string, attempts: number, completeCallback: () => void){
    
        this.assertClickableXpath(xpath, true, (elements) => {
                
            elements[0].click().then(() => {
                
                completeCallback();
            
            }).catch((e:Error) => {
    
                if(attempts <= 0){
                    
                    throw new Error('Error trying to click by: ' + xpath + '\n' + e.toString());
                
                }else{
                    
                    this._clickByXpathAux(xpath, attempts - 1, completeCallback); 
                }
            });
        });
    }
    
    
    /**
     * Remove all text for the specified document element
     * 
     * @param id The html id for the element from which we want to clear the text
     * @param completeCallback A method that will be called once the specified element is found and the text is cleared
     */
    clearInputById(id:string, completeCallback: () => void){
        
        this.clearInputByXpath("//*[@id='" + id + "']", completeCallback);
    }
    
    
    /**
     * Remove all text for the specified document element
     * 
     * @param xpath The xpath query that lets us find element from which we want to clear the text
     * @param completeCallback A method that will be called once the specified element is found and the text is cleared
     */
    clearInputByXpath(xpath:string, completeCallback: () => void){
        
        this.driver.wait(this.webdriver.until.elementLocated(this.webdriver.By.xpath(xpath)), this.waitTimeout)
            .then((element: any) => {
            
            element.clear().then(() => {
                
                // We send a backspace key to make sure that the key change events are fired on the component
                element.sendKeys("\b").then(completeCallback);
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
     * @param completeCallback A method that will be called once the specified element is found and the text is sent
     */
    sendKeysById(id:string, text:string, completeCallback: () => void){
        
        this.sendKeysByXpath("//*[@id='" + id + "']", text, completeCallback);
    }
    
    
    /**
     * Send text to the specified document element
     * 
     * @param xpath The xpath query that lets us find element to which we want to send text
     * @param text The text we want to send
     * @param completeCallback A method that will be called once the specified element is found and the text is sent
     */
    sendKeysByXpath(xpath:string, text:string, completeCallback: () => void){
        
        this.driver.wait(this.webdriver.until.elementLocated(this.webdriver.By.xpath(xpath)), this.waitTimeout)
            .then((element: any) => {
            
            element.sendKeys(text).then(completeCallback);
        
        }).catch((e:Error) => {
            
            throw new Error('Error trying to send input by: ' + xpath + '\n' + e.toString());
        });
    }
    
    
    /**
     * Obtain the value for an attribute of a document element 
     * 
     * @param id The html id for the element
     * @param attribute The attribute that we want to read
     * @param completeCallback A method that will be called once the specified attribute value is found. Attribute value will be passed.
     */
    getAttributeById(id:string, attribute:string, completeCallback: (attributeValue: string) => void){
        
        this.getAttributeByXpath("//*[@id='" + id + "']", attribute, completeCallback);
    }
    
    
    /**
     * Obtain the value for an attribute of a document element 
     * 
     * @param xpath The xpath query that lets us find the element
     * @param attribute The attribute that we want to read
     * @param completeCallback A method that will be called once the specified attribute value is found. Attribute value will be passed.
     */
    getAttributeByXpath(xpath:string, attribute:string, completeCallback: (text: string) => void){
        
        this.driver.wait(this.webdriver.until.elementLocated(this.webdriver.By.xpath(xpath)), this.waitTimeout)
            .then((element: any) => {
            
            element.getAttribute(attribute).then(completeCallback);
        
        }).catch((e:Error) => {
            
            throw new Error('Error trying to get attribute by: ' + xpath + '\n' + e.toString());
        });
    }
    
    
    /**
     * Allows us to secuentially execute any of this class methods one after the other by chaining them via the completeCallback method.
     * It is basically a shortcut to execute several browser automations one after the other with a compact syntax
     * 
     * @param queries An array of arrays where each element will define a single call to one of the class methods. First element must be the
     *        method name and next ones the method parameter values. Each call will wait till the completeCallback is executed, and then the 
     *        next of the list will be called, till all finish. If any error happens, execution will be interrupted.
     * @param completeCallback A method that will be called once all the calls of the query have been executed correctly.
     */
    queryCalls(queries: any[], completeCallback: () => void){
        
        let recursiveCaller = (queries: any[], completeCallback: () => void) => {
            
            if(queries.length <= 0){
                
                return completeCallback();
            }
            
            let query = queries[0];
            let functionName = query[0];
            
            if((this as any)[functionName]) {
                
                let functionObject = (this as any)[functionName];
            
                if(functionObject.length !== query.length){
                    
                    throw new Error('Method ' + functionName + ' expects ' + (functionObject.length - 1) + ' arguments, but received ' + (query.length - 1));
                }
                
                // Run the method, passing all the specified parameters and adding a call to the recursive caller as the last parameter
                functionObject.apply(this, query.slice(1).concat(() => {
                    
                    recursiveCaller(queries.slice(1), completeCallback);
                }));
            
            }else{
                
                throw new Error('Specified method to query does not exist: ' + functionName);
            }
        }
        
        recursiveCaller(queries, completeCallback); 
    }
    
    
    /**
     * Close the specified browser tab
     *
     * @param tabIndex The numeric index for the tab that we want to close. 0 is the first, the one most to the left
     * @param completeCallback A method that will be executed once the process finishes correctly
     */
    closeBrowserTab(tabIndex:number, completeCallback: () => void){
    
        this.driver.getAllWindowHandles().then((windowHandles: any) => {
            
            this.driver.switchTo().window(windowHandles[tabIndex]).then(() => {
                
                 this.driver.close().then(completeCallback);
            });
        }); 
    }
    
    
    /**
     * Disconnect and close the browser
     */
    quit(){
        
        if(this.driver !== null){
            
            this.driver.quit();
        }
    }
}
