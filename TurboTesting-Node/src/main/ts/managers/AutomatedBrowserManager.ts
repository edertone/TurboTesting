/**
 * TurboTesting is a general purpose cross-language library to improve automated testing productivity
 *
 * Website : -> http://www.turboframework.org
 * License : -> Licensed under the Apache License, Version 2.0. You may not use this file except in compliance with the License.
 * License Url : -> http://www.apache.org/licenses/LICENSE-2.0
 * CopyRight : -> Copyright 2015 Edertone Advanded Solutions (08211 Castellar del Vallès, Barcelona). http://www.edertone.com
 */
 

import { ArrayUtils, ObjectUtils } from 'turbocommons-ts';
import { ConsoleManager } from 'turbodepot-node';
import { HTTPTestsManager } from './HTTPTestsManager';
import { StringTestsManager } from './StringTestsManager';


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
     * The selenium webdriver instance used to manage the browser automation
     */
    private driver: any = null;
    
    
    /**
     * The ConsoleManager instance used to perform console output
     */
    private consoleManager: ConsoleManager;
    
    /**
     * The StringTestsManager instance used to perform string tests
     */
    private stringTestsManager: StringTestsManager;
    
    
    /**
     * The httpTestsManager instance used to perform http request tests
     */
    private httpTestsManager: HTTPTestsManager;
    
    
    /**
     * Browser automated testing management class
     * 
     * This constructor requires some node modules to work, which are passed as dependencies
     *  
     * @param execSync A node execSync module instance (const { execSync } = require('child_process'))
     * @param webdriver A node webdriver module instance (const webdriver = require('selenium-webdriver');)
     * @param chrome A node chrome module instance (const chrome = require('selenium-webdriver/chrome'))
     * @param console An instance for the console process node object
     * @param process An instance for the global process node object
     * 
     * @return An AutomatedBrowserManager instance
     */
    constructor(private execSync:any,
                private webdriver:any,
                private chrome:any,
                console:any,
                process:any) {

        this.stringTestsManager = new StringTestsManager(console, process);
        this.consoleManager = new ConsoleManager(console, process);
        this.httpTestsManager = new HTTPTestsManager(console, process);
    }
    
    
    /**
     * Initialize this class to work with the google chrome browser.
     * The browser and the chromedriver application must be installed on the system. Chromedriver must be globally
     * accessible via the command line input (added to the OS path)
     * 
     * @param language The language in which the browser will start
     * @param defaultDownloadPath If specified, all the downloadable links or files that are open by the automation
     *        will be stored on the provided fs path without any prompt.
     */
    initializeChrome(language = 'en', defaultDownloadPath = ''){
        
        // Check that chrome driver is available on our system
        try{
            
            this.execSync('chromedriver -v', {stdio : 'pipe'}).toString();
                    
        }catch(e){
            
            this.quitWithError("Error: Could not initialize selenium chromedriver. Please make sure it is available on your OS cmd path");
        }
        
        let chromeOptions = new this.chrome.Options();
        
        // Initialize the chrome driver with the specified language.
        chromeOptions.addArguments([`--lang=${language}`]);
        
        // Define the files download location if specified
        if(defaultDownloadPath !== ''){
            
            chromeOptions.setUserPreferences({
                "download.default_directory": defaultDownloadPath,
                "download.prompt_for_download": false
            });
        }
        
        // Enable logs so the tests can read them
        let loggingPrefs = new this.webdriver.logging.Preferences();
        loggingPrefs.setLevel('browser', this.webdriver.logging.Level.ALL); 
        loggingPrefs.setLevel('driver', this.webdriver.logging.Level.ALL); 
        
        // Instantiate the browser driver
        this.driver = new this.webdriver.Builder()
            .withCapabilities(this.webdriver.Capabilities.chrome())
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
     * Wait till the browser has finished loading everything and is in a ready state
     * 
     * @param completeCallback A method that will be executed once the browser is ready
     */
    waitTillBrowserReady(completeCallback: () => void){
        
        this.driver.wait(() => {
            
            return this.driver.executeScript('return document.readyState').then((readyState: any) => {
                
                return readyState === 'complete';
            });
            
        }, this.waitTimeout).then(completeCallback);
    }
    
    
    /**
     * Request the browser instance to load the specified URL.
     * If we have defined any wildcard, they will be replaced on the url before requesting it on the browser.
     * 
     * @param url The url we want to open with the browser
     * @param completeCallback A method that will be executed once the url loading finishes. A single results object will be passed
     *        to this method, containing all the loaded page information we may need: title, source, finalUrl (in case any redirection
     *        happened from the original url), and browserLogs (containing all the information that browser may have output to its console)
     */
    loadUrl(url: string, completeCallback: (results: {title:string; source:any; finalUrl:string; browserLogs:any}) => void){
        
        let results: any = {};
    
        this.driver.get(this.stringTestsManager.replaceWildCardsOnText(url, this.wildcards)).then(() => {
            
            this.driver.getTitle().then((title: any) => {
            
                results.title = title;
                
                this.driver.executeScript("return document.documentElement.outerHTML").then((html: string) => {
                
                    results.source = html;

                    this.driver.getCurrentUrl().then((finalUrl: string) => {
                        
                        results.finalUrl = finalUrl;
                        
                        this.driver.manage().logs().get('browser').then((browserLogs: any) => {
                            
                            results.browserLogs = browserLogs;
                            
                            this.waitTillBrowserReady(() => {
                                
                                completeCallback(results);
                            });
                        }); 
                    });
                });
            });  
        });
    }
        
    
    /**
     * Test that all the provided urls redirect to another expected url.
     * If any of the provided urls fail to redirect to its expected value, the test will fail.
     * 
     * @param urls An array of objects where each one contains the following properties:
     *        "url" the url to test
     *        "to" the url that must be the final redirection target for the provided url
     *        "comment" (Optional) An informative comment about the redirect purpose
     * @param completeCallback A method that will be called once all the urls from the list have been tested.
     */
    assertUrlsRedirect(urls: any[], completeCallback: () => void){
    
        // Fail if list has duplicate values
        if(ArrayUtils.hasDuplicateElements(urls.map(l => l.url))){
            
            this.quitWithError('AutomatedBrowserManager.assertUrlsRedirect duplicate urls: ' + ArrayUtils.getDuplicateElements(urls.map(l => l.url)).join('\n'));
        }
        
        let anyErrors = 0;
        
        // Load all the urls on the list and perform a request for each one.
        let recursiveCaller = (urls: any[], completeCallback: () => void) => {
            
            if(urls.length <= 0){
                
                if(anyErrors > 0){
                    
                    this.quitWithError(`AutomatedBrowserManager.assertUrlsRedirect failed with ${anyErrors} errors`);
                }
                
                return completeCallback();
            }
            
            let entry = urls.shift();
            entry.url = this.stringTestsManager.replaceWildCardsOnText(entry.url, this.wildcards);
            entry.to = this.stringTestsManager.replaceWildCardsOnText(entry.to, this.wildcards);
            
            this.loadUrl(entry.url, (results) => {
                
                if(results.finalUrl !== entry.to){
                    
                    anyErrors ++;
                    
                    this.consoleManager.error('Url redirect failed. expected:\n    ' + entry.url +
                        ' to redirect to:\n    ' + entry.to + ' but was:\n    ' + results.finalUrl);
                }
                    
                recursiveCaller(urls, completeCallback);
            });
        }
        
        recursiveCaller(urls, completeCallback);
    }
    
    
    /**
     * This method will perform a large amount of tests for a provided list of urls.
     *
     * If any of the provided urls fails any of the verifications, the test will fail.
     * 
     * @param urls An array of objects where each one contains the following properties:
     *        "url" the url to test (mandatory)
     *        "title" A text that must exist on the browser title for the url once loaded (skip it or set it to null if not used)
     *        "source" A string or an array of strings with texts that must exist on the url source code (skip it or set it to null if not used)
     *        "ignoreConsoleErrors" The console output is always analyzed for errors. Any console error that happens will make the tests fail unless it contains
     *                              any of the strings provided here
     *        "startWith" If defined, the loaded source code must start with the specified text (skip it or set it to null if not used)
     *        "endWith" If defined, the loaded source code must end with the specified text (skip it or set it to null if not used)
     *        "notContains" A string or an array of strings with texts tat must NOT exist on the url source code (skip it or set it to null if not used)
     * @param completeCallback A method that will be called once all the urls from the list have been tested.
     */
    assertUrlsLoadOk(urls: any[], completeCallback: () => void){
    
        let anyErrors = 0;
        
        // Fail if list has duplicate values
        if(ArrayUtils.hasDuplicateElements(urls.map(l => l.url))){
            
            this.quitWithError('AutomatedBrowserManager.assertUrlsLoadOk duplicate urls: ' + ArrayUtils.getDuplicateElements(urls.map(l => l.url)).join('\n'));
        }
        
        // Load all the urls on the list and perform a request for each one.
        let recursiveCaller = (urls: any[], completeCallback: () => void) => {
            
            if(urls.length <= 0){
                
                if(anyErrors > 0){
                    
                    this.quitWithError(`AutomatedBrowserManager.assertUrlsLoadOk failed with ${anyErrors} errors`);
                }
                
                return completeCallback();
            }
        
            let entry = urls.shift();
            entry.url = this.stringTestsManager.replaceWildCardsOnText(entry.url, this.wildcards);
            entry.source = this.stringTestsManager.replaceWildCardsOnObject(entry.source, this.wildcards);
            
            this.loadUrl(entry.url, (results) => {
                
                // Check that there are no SEVERE error logs on the browser
                for (let logEntry of results.browserLogs) {
                
                    if(logEntry.level.name === 'SEVERE'){
                        
                        let errorMustBeThrown = true;
                        
                        if(ArrayUtils.isArray(entry.ignoreConsoleErrors)){
                            
                            for (let ignoreConsoleError of entry.ignoreConsoleErrors) {
    
                                if(logEntry.message.indexOf(ignoreConsoleError) >= 0){
                                    
                                    errorMustBeThrown = false;
                                }
                            }
                        }
                        
                        if(errorMustBeThrown){
                            
                            anyErrors ++;
                            
                            this.consoleManager.error('Browser console has shown an error:\n    ' + logEntry.message + '\n' +
                                'For the url:\n    ' + entry.url);
                        }
                    }
                }
                
                // Make sure no 404 error is shown at the result title
                if(!this.stringTestsManager.assertTextNotContainsAny(results.title, ['404 Not Found', 'Error 404 page'],
                        `Unexpected 404 error found:\n    ${results.title}\nFor the url:\n    ${entry.url}`)){
                
                    anyErrors ++;
                }
                                
                // Make sure title contains the text that is specified on the current url expected values entry
                if(entry.title && entry.title !== null &&
                   !this.stringTestsManager.assertTextContainsAll(results.title, entry.title,
                            `Title: ${results.title}\nDoes not contain expected text: ${entry.title}\nFor the url: ${entry.url}`)){
                
                    anyErrors ++;
                }
            
                if(entry.startWith && entry.startWith !== null &&
                   !this.stringTestsManager.assertTextStartsWith(results.source, entry.startWith,
                           `Source expected to start with: ${entry.startWith}\nBut started with: ${results.source.substr(0, 80)}\nFor the url: ${entry.url}`)){
                      
                    anyErrors ++;
                }
                
                if(entry.endWith && entry.endWith !== null &&
                   !this.stringTestsManager.assertTextEndsWith(results.source, entry.endWith,
                           `Source expected to end with: ${entry.endWith}\nBut ended with: ${results.source.slice(-80)}\nFor the url: ${entry.url}`)){
                  
                    anyErrors ++;
                }
                
                if(entry.notContains && entry.notContains !== null &&
                   !this.stringTestsManager.assertTextNotContainsAny(results.source, entry.notContains,
                           `Source NOT expected to contain: $fragment\nBut contained it for the url: ${entry.url}`)){

                    anyErrors ++;
                }
                
                if(entry.source && entry.source !== null &&
                   !this.stringTestsManager.assertTextContainsAll(results.source, entry.source,
                           `\nError searching for: $fragment on text in the url: ${entry.url}\n$errorMsg\n`)){

                    anyErrors ++;
                }
                
                if(results.finalUrl !== entry.url){
                    
                    anyErrors ++;
                    
                    this.consoleManager.error(`Unexpected redirection for the url: ${entry.url}\nWhich redirected to: ${results.finalUrl}`);
                }
                
                recursiveCaller(urls, completeCallback);
            });
        }
        
        recursiveCaller(urls, completeCallback);
    }
    
    
    /**
     * Test that all the urls on a given list throw a 404 error
     * 
     * If any of the provided urls gives a 200 ok result, the test will fail
     * 
     * @param urls An array of strings where each item is an url to test
     * @param completeCallback A method that will be called once all the urls from the list have been tested.
     */
    assertUrlsFail(urls: string[], completeCallback: () => void){
    
        this.httpTestsManager.wildcards = this.wildcards;
        
        try {

            this.httpTestsManager.assertUrlsFail(urls, completeCallback);
            
        } catch (e) {

            this.quitWithError(e.message);
        }
    }
    
    
    /**
     * Click on a document element  
     * 
     * @param id The html id for the element that we want to click on
     * @param completeCallback A method that will be called once the specified element is found and a click is performed
     */
    clickById(id:string, completeCallback: () => void){
        
        this.driver.wait(this.webdriver.until.elementLocated(this.webdriver.By.id(id)), this.waitTimeout)
            .then((element: any) => {
            
            element.click().then(completeCallback); 
            
        }).catch((e:Error) => {
            
            throw new Error('Error trying to click by id: ' + id + '\n' + e.toString());
        });
    }
    
    
    /**
     * Click on a document element
     * 
     * @param xpath The xpath query that lets us find element which we want to click
     * @param completeCallback A method that will be called once the specified element is found and a click is performed
     */
    clickByXpath(xpath:string, completeCallback: () => void){
    
        this.driver.wait(this.webdriver.until.elementLocated(this.webdriver.By.xpath(xpath)), this.waitTimeout)
            .then((element: any) => {
            
            element.click().then(completeCallback);
        
        }).catch((e:Error) => {
            
            throw new Error('Error trying to click by xpath: ' + xpath + '\n' + e.toString());
        });
    }
    
    
    /**
     * Perform several tests regarding the current state of the browser: Verify the current url, title, html code,
     * errors on console, etc..
     * 
     * If any of the specified assertions fails, an exception will be thrown
     * 
     * @param asserts An object that defines the assertions that will be applied by this test:
     *        "url" A string or an array of strings with texts that must exist on the current browser url (skip it or set it to null if not used)
     *        "titleContains" A text that must exist on the current browser title (skip it or set it to null if not used)
     *        "ignoreConsoleErrors" The console output is analyzed for errors. Any console error that happens will make the tests fail unless it contains
     *                              any of the strings provided here
     *        "htmlContains" A string or an array of strings with texts that must exist on the html source code (skip it or set it to null if not used)
     *        "htmlStartsWith" If defined, the html source code must start with the specified text (skip it or set it to null if not used)
     *        "htmlEndsWith" If defined, the html source code must end with the specified text (skip it or set it to null if not used)
     *        "htmlNotContains" A string or an array of strings with texts tat must NOT exist on the html source code (skip it or set it to null if not used)
     * @param completeCallback A method that will be called once all the tests have been successfully executed on the current browser state
     * 
     * @return void
     */
    assertBrowserState(asserts: any,  completeCallback: () => void){
        
        let anyErrors = 0;
        
        // Check that asserts has the right properties
        let assertKeys = ObjectUtils.getKeys(asserts);
        
        for (let assertKey of assertKeys) {

            if(['url', 'titleContains', 'ignoreConsoleErrors',
                'htmlContains', 'htmlStartsWith', 'htmlEndsWith', 'htmlNotContains']
                    .indexOf(assertKey) < 0){
                
                throw new Error(`Unexpected assert property found: ${assertKey}`);
            }
        }
        
        // Replace wildcards on assert values
        asserts.url = this.stringTestsManager.replaceWildCardsOnText(asserts.url, this.wildcards);
        asserts.htmlContains = this.stringTestsManager.replaceWildCardsOnObject(asserts.htmlContains, this.wildcards);
        
        this.waitTillBrowserReady(() => {
        
            this.driver.executeScript('return window.location.href').then((browserUrl: any) => {
                
                if(asserts.url && asserts.url !== null &&
                   !this.stringTestsManager.assertTextContainsAll(browserUrl, asserts.url,
                        `Browser URL: ${browserUrl}\nDoes not contain expected text: $fragment`)){
                    
                    anyErrors ++;
                }
                
                this.driver.getTitle().then((browserTitle: any) => {
                    
                    // Make sure no 404 error is shown at the browser title
                    if(!this.stringTestsManager.assertTextNotContainsAny(browserTitle, ['404 Not Found', 'Error 404 page'],
                            `Unexpected 404 error found on browser title:\n    ${browserTitle}\nFor the url:\n    ${browserUrl}`)){
                    
                        anyErrors ++;
                    }
                                    
                    // Make sure title contains the text that is specified on the asserts expected values 
                    if(asserts.titleContains && asserts.titleContains !== null &&
                       !this.stringTestsManager.assertTextContainsAll(browserTitle, asserts.titleContains,
                                `Title: ${browserTitle}\nDoes not contain expected text: ${asserts.titleContains}\nFor the url: ${browserUrl}`)){
                    
                        anyErrors ++;
                    }
                    
                    this.driver.manage().logs().get('browser').then((browserLogs: any) => {

                        // Check that there are no SEVERE error logs on the browser
                        for (let logEntry of browserLogs) {
                        
                            if(logEntry.level.name === 'SEVERE'){
                                
                                let errorMustBeThrown = true;
                                
                                if(ArrayUtils.isArray(asserts.ignoreConsoleErrors)){
                                    
                                    for (let ignoreConsoleError of asserts.ignoreConsoleErrors) {
            
                                        if(logEntry.message.indexOf(ignoreConsoleError) >= 0){
                                            
                                            errorMustBeThrown = false;
                                        }
                                    }
                                }
                                
                                if(errorMustBeThrown){
                                    
                                    anyErrors ++;
                                    
                                    this.consoleManager.error('Browser console has shown an error:\n    ' + logEntry.message + '\n' +
                                        'For the url:\n    ' + browserUrl);
                                }
                            }
                        }
                        
                        this.driver.executeScript("return document.documentElement.outerHTML").then((html: string) => {
                        
                            if(asserts.htmlStartsWith && asserts.htmlStartsWith !== null &&
                                !this.stringTestsManager.assertTextStartsWith(html, asserts.htmlStartsWith,
                                        `Source expected to start with: ${asserts.htmlStartsWith}\nBut started with: ${html.substr(0, 80)}\nFor the url: ${browserUrl}`)){
                                   
                                 anyErrors ++;
                             }
                             
                             if(asserts.htmlEndsWith && asserts.htmlEndsWith !== null &&
                                !this.stringTestsManager.assertTextEndsWith(html, asserts.htmlEndsWith,
                                        `Source expected to end with: ${asserts.htmlEndsWith}\nBut ended with: ${html.slice(-80)}\nFor the url: ${browserUrl}`)){
                               
                                 anyErrors ++;
                             }
                             
                             if(asserts.htmlNotContains && asserts.htmlNotContains !== null &&
                                !this.stringTestsManager.assertTextNotContainsAny(html, asserts.htmlNotContains,
                                        `Source NOT expected to contain: $fragment\nBut contained it for the url: ${browserUrl}`)){
    
                                 anyErrors ++;
                             }
                             
                             if(asserts.htmlContains && asserts.htmlContains !== null &&
                                !this.stringTestsManager.assertTextContainsAll(html, asserts.htmlContains,
                                        `\nError searching for: $fragment on text in the url: ${browserUrl}\n$errorMsg\n`)){
    
                                 anyErrors ++;
                             }
                             
                             if(anyErrors > 0){
                                 
                                 throw new Error(`AutomatedBrowserManager.assertBrowserState failed with ${anyErrors} errors`);
                             }
                             
                             completeCallback();                         
                        });
                    });
                });
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
    
    
    /**
     * Make sure the browser driver is correctly closed and throw an exception with the given message
     */
    private quitWithError(error: string){
        
        this.quit();
        
        throw new Error(error);
    }
}
