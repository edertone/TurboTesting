/**
 * TurboTesting is a general purpose cross-language library to improve automated testing productivity
 *
 * Website : -> http://www.turboframework.org
 * License : -> Licensed under the Apache License, Version 2.0. You may not use this file except in compliance with the License.
 * License Url : -> http://www.apache.org/licenses/LICENSE-2.0
 * CopyRight : -> Copyright 2015 Edertone Advanded Solutions (08211 Castellar del Vallès, Barcelona). http://www.edertone.com
 */
 

import { ArrayUtils, HTTPManager, HTTPManagerGetRequest } from 'turbocommons-ts';
import { HTTPTestsManager } from './HTTPTestsManager';
import { StringTestsManager } from './StringTestsManager';
import { ObjectTestsManager } from './ObjectTestsManager';

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
    logEntries = [];

    
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
     * Stores the NodeJs execSync instance
     */
    private execSync: any;
    
    
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
        
        this.execSync = require('child_process').execSync;
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
            
            this.execSync('chromedriver -v', {stdio : 'pipe'}).toString();
                    
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
     * Wait till the provided list of elements is found on the current document or fail after the timeout has passed  
     * 
     * @param elements A list with the name for the html elements that we are looking for
     * @param completeCallback A method that will be called once the specified elements are found
     */
    waitTillElementsExist(elements:string[], completeCallback: () => void){
        
        let recursiveCaller = (elements: any[], completeCallback: () => void) => {
            
            if(elements.length <= 0){
                
                return completeCallback();
            }
            
            let element = elements.shift();
            
            this.driver.wait(this.webdriver.until.elementLocated(this.webdriver.By.xpath("//" + element)), this.waitTimeout)
                .then(() => {
                    
                    recursiveCaller(elements, completeCallback);
                    
                }).catch((e:Error) => {
                
                throw new Error('Error trying to find element: ' + element + '\n' + e.toString());
            });
        }
        
        recursiveCaller(elements, completeCallback);
    }
    
    
    /**
     * Wait till the elements for the provided list of ids are found on the current document or fail after the timeout has passed  
     * 
     * @param ids A list with the ids for the html elements that we are looking for
     * @param completeCallback A method that will be called once the specified elements are found
     */
    waitTillIdsExist(ids:string|string[], completeCallback: () => void){
        
        let recursiveCaller = (ids: string[], completeCallback: () => void) => {
            
            if(ids.length <= 0){
                
                return completeCallback();
            }
            
            let id = ids.shift();
            
            this.driver.wait(this.webdriver.until.elementLocated(this.webdriver.By.xpath("//*[@id='" + id + "']")), this.waitTimeout)
                .then(() => {
                    
                    recursiveCaller(ids, completeCallback);
                    
                }).catch((e:Error) => {
                
                throw new Error('Error trying to find id: ' + id + '\n' + e.toString());
            });
        }
        
        let idsToSearch = ArrayUtils.isArray(ids) ? ids as string[] : [ids as string];
        
        recursiveCaller(idsToSearch, completeCallback);
    }
    
    
    /**
     * Wait till the element which is found with the provided xpath expression is found, visible and enabled (ready to be clicked), or fail after the timeout has passed  
     * 
     * @param xpath The xpath expression to search for the element that must be clickable
     * @param completeCallback A method that will be called once the specified element passes the wait conditions. The element instance will be passed to this method.
     */
    waitTillXpathClickable(xpath:string, completeCallback: (element: any) => void){
        
        this.driver.wait(this.webdriver.until.elementLocated(this.webdriver.By.xpath(xpath)), this.waitTimeout)
            .then((element: any) => {
            
            this.driver.wait(this.webdriver.until.elementIsVisible(element), this.waitTimeout)
                .then((element: any) => {
            
                this.driver.wait(this.webdriver.until.elementIsEnabled(element), this.waitTimeout)
                    .then((element: any) => {
                
                    completeCallback(element);
                }); 
            }); 
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
     *        to this method, containing all the loaded page information we may need: title, source and finalUrl (in case any redirection
     *        happened from the original url)
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
            
            throw new Error('Error in loadUrl calling driver.get: ' + e.toString());
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
     *        "sourceHtmlNotContains" A string or an array of strings with texts tat must NOT exist on the html source code<br>
     *        "loadedHtmlStartsWith" If defined, the html code that is loaded (and maybe altered) by the browser must start with the specified text<br>
     *        "loadedHtmlEndsWith" If defined, the html code that is loaded (and maybe altered) by the browser must end with the specified text<br>
     *        "loadedHtmlContains" A string or an array of strings with texts that must exist in the same order on the html code that is loaded (and maybe altered) by the browser<br>
     *        "loadedHtmlNotContains" A string or an array of strings with texts tat must NOT exist on the html code that is loaded (and maybe altered) by the browser
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
                    ['url', 'titleContains', 'ignoreConsoleErrors', 'sourceHtmlContains', 'sourceHtmlStartsWith', 'sourceHtmlEndsWith',
                     'sourceHtmlNotContains', 'loadedHtmlContains', 'loadedHtmlStartsWith', 'loadedHtmlEndsWith', 'loadedHtmlNotContains'], false);
                 
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
            let validateHtml = (html: string, url: string, startsWith: string, endsWith: string, notContains: string, contains: string) => {
                
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
                                    if(asserts.hasOwnProperty('ignoreConsoleErrors') && ArrayUtils.isArray(asserts.ignoreConsoleErrors)){
                                        
                                        for (let ignoreConsoleError of asserts.ignoreConsoleErrors) {
                
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
                                    asserts.hasOwnProperty('loadedHtmlContains') ? asserts.loadedHtmlContains : null);
                            
                            // In case none of the real source code assertions have been defined, we will finish here, to avoid performing an unnecessary
                            // http request to obtain the real source code.
                            if((!asserts.hasOwnProperty('sourceHtmlStartsWith') || asserts.sourceHtmlStartsWith === null) &&
                               (!asserts.hasOwnProperty('sourceHtmlEndsWith') || asserts.sourceHtmlEndsWith === null) &&
                               (!asserts.hasOwnProperty('sourceHtmlNotContains') || asserts.sourceHtmlNotContains === null) &&
                               (!asserts.hasOwnProperty('sourceHtmlContains') || asserts.sourceHtmlContains === null)){
                                
                                finish();
                                
                                return;
                            }
                            
                            // If the url to test is belongs to a local file, we will directly get the source code from there.
                            let urlLocalFileContents = '';
                                
                            try {

                                const fs = require('fs');
                                const url = require('url');
                                urlLocalFileContents = fs.readFileSync(url.fileURLToPath(browserUrl), "utf8");

                            } catch (e) {}

                            if(urlLocalFileContents !== ''){

                                validateHtml(urlLocalFileContents, browserUrl,
                                        asserts.hasOwnProperty('sourceHtmlStartsWith') ? asserts.sourceHtmlStartsWith : null,
                                        asserts.hasOwnProperty('sourceHtmlEndsWith') ? asserts.sourceHtmlEndsWith : null,
                                        asserts.hasOwnProperty('sourceHtmlNotContains') ? asserts.sourceHtmlNotContains : null,
                                        asserts.hasOwnProperty('sourceHtmlContains') ? asserts.sourceHtmlContains : null);
                                
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
                                        asserts.hasOwnProperty('sourceHtmlContains') ? asserts.sourceHtmlContains : null);
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
            
            throw new Error('AutomatedBrowserManager.assertUrlsRedirect duplicate urls: ' + ArrayUtils.getDuplicateElements(urls.map(l => l.url)).join('\n'));
        }
        
        let anyErrors: string[] = [];
        
        // Load all the urls on the list and perform a request for each one.
        let recursiveCaller = (urls: any[], completeCallback: () => void) => {
            
            if(urls.length <= 0){
                
                if(anyErrors.length > 0){
                    
                    throw new Error(`AutomatedBrowserManager.assertUrlsRedirect failed with ${anyErrors.length} errors:\n` + anyErrors.join('\n'));
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
     * Click on one or more document elements (sequentially) by id.
     * 
     * @param id A single string with the id for the element which we want to click or a list of ids that will be sequentially clicked
     *        one after the other. Any failure trying to click any of the provided ids will throw an exception
     * @param completeCallback A method that will be called once the specified element or all the specified elements are found and a click is performed
     * @param waitMilliseconds The number of milliseconds that we will wait between each click call, even if the ids are inmediately available
     */
    clickById(id:string|string[], completeCallback: () => void, waitMilliseconds = 1000){
        
        let ids = ArrayUtils.isArray(id) ? id as string[] : [id as string];
        
        for(let i = 0; i < ids.length; i++){
            
            ids[i] = "//*[@id='" + ids[i] + "']";
        }
        
        this.clickByXpath(ids, completeCallback, waitMilliseconds);
    }
    
    
    /**
     * Click on one or more document elements (sequentially) by xpath.
     * 
     * @param xpath A single string with the xpath query that lets us find the element which we want to click or a list of xpaths
     *        that will be sequentially clicked one after the other. Any failure trying to click any of the provided xpaths will throw an exception
     * @param completeCallback A method that will be called once the specified element or all the specified elements are found and a click is performed
     * @param waitMilliseconds The number of milliseconds that we will wait between each click call, even if the xpath elements are inmediately available
     */
    clickByXpath(xpath:string|string[], completeCallback: () => void, waitMilliseconds = 1000){
    
        let xpaths = ArrayUtils.isArray(xpath) ? xpath as string[] : [xpath as string];
    
        let recursiveCaller = (xpaths: string[], completeCallback: () => void) => {
            
            if(xpaths.length <= 0){
                
                return completeCallback();
            }
            
            let path = xpaths.shift();
            
            this.waitTillXpathClickable(path, (element: any) => {
                
                element.click().then(() => {
                    
                    this.waitMilliseconds(xpaths.length <= 0 ? 0 : waitMilliseconds, () => {
                        
                        recursiveCaller(xpaths, completeCallback);
                    });                    
                
                }).catch((e:Error) => {
                
                    throw new Error('Error trying to click by: ' + path + '\n' + e.toString());
                });
            });
        }
        
        recursiveCaller(xpaths, completeCallback);        
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
     * This method will perform standard recursive tests on a full website provided its root link. The whole site will be tested
     * on all its pages against broken links, valid html structure, valid css, ...
     * 
     * @param siteRoot The full url to the root of the site to test
     * @param completeCallback A method that will be executed once all the tests have finished
     */
    assertWholeWebsite(siteRoot: string, completeCallback: () => void){
        
        this.loadUrl(siteRoot, (results) => {
            
            // TODO
            console.log('TODO - Perform site recursive tests on ' + results.finalUrl);
            
            completeCallback();
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
