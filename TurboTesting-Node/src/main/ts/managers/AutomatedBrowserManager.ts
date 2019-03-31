/**
 * TurboTesting is a general purpose cross-language library to improve automated testing productivity
 *
 * Website : -> http://www.turboframework.org
 * License : -> Licensed under the Apache License, Version 2.0. You may not use this file except in compliance with the License.
 * License Url : -> http://www.apache.org/licenses/LICENSE-2.0
 * CopyRight : -> Copyright 2015 Edertone Advanded Solutions (08211 Castellar del Vallès, Barcelona). http://www.edertone.com
 */
 

import { ArrayUtils, StringUtils, ObjectUtils } from 'turbocommons-ts';
import { ConsoleManager } from './ConsoleManager';


/**
 * AutomatedBrowserManager class
 *
 * @see constructor()
 */
export class AutomatedBrowserManager {
    
    
    /**
     * An object containing key / pair values where each key is the name of a wildcard,
     * and each value is the text that will replace each wildcard on all the urls used by this class
     */
    wildcards: { [key: string]: string } = {};

    
    /**
     * The selenium webdriver instance used to manage the browser automation
     */
    private driver: any = null;
    
    
    /**
     * Browser automated testing management class
     * 
     * This constructor requires some node modules to work, which are passed as dependencies
     *  
     * @param execSync A node execSync module instance (const { execSync } = require('child_process'))
     * @param webdriver A node webdriver module instance (const webdriver = require('selenium-webdriver');)
     * @param chrome A node chrome module instance (const chrome = require('selenium-webdriver/chrome'))
     * @param console An initialized ConsoleManager instance
     * 
     * @return An AutomatedBrowserManager instance
     */
    constructor(private execSync:any,
                private webdriver:any,
                private chrome:any,
                private console:ConsoleManager) {
    }
    
    
    /**
     * TODO
     */
    initializeChrome(language = 'en', defaultDownloadPath = ''){
        
        // Check that chrome driver is available on our system
        try{
            
            this.execSync('chromedriver -v', {stdio : 'pipe'}).toString();
                    
        }catch(e){
            
            throw new Error("Error: Could not initialize selenium chromedriver. Please make sure it is available on your OS cmd path");
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
     * TODO
     */
    loadUrl(url: string, completeCallback: (finalUrl: string) => void){
        
        this.driver.get(url).then(() => {
            
            this.driver.getCurrentUrl().then((finalUrl: string) => {
                
                completeCallback(finalUrl);
            });
        });
    }
    
    
    /**
     * TODO
     */
    assertUrlsRedirect(urls: any[], completeCallback: () => void){
    
        // Fail if list has duplicate values
        if(ArrayUtils.hasDuplicateElements(urls.map(l => l.url))){
            
            throw new Error('duplicate urls: ' + ArrayUtils.getDuplicateElements(urls.map(l => l.url)).join(', '));
        }
        
        let anyErrors = 0;
        
        // Load all the urls on the json file and perform a request for each one.
        let recursiveCaller = (urls: any[], completeCallback: () => void) => {
            
            if(urls.length <= 0){
                
                if(anyErrors > 0){
                    
                    throw new Error(`AutomatedBrowserManager.assertUrlsRedirect failed with ${anyErrors} errors`);
                }
                
                return completeCallback();
            }
            
            let entry = urls.shift();
            entry.url = this.replaceWildCardsOnText(entry.url);
            entry.to = this.replaceWildCardsOnText(entry.to);
            
            this.loadUrl(entry.url, (finalUrl) => {
                
                if(finalUrl !== entry.to){
                    
                    anyErrors ++;
                    
                    this.console.error('Url redirect failed. expected:\n    ' + entry.url +
                            ' to redirect to:\n    ' + entry.to + ' but was:\n    ' + finalUrl);
                }
                    
                recursiveCaller(urls, completeCallback);
            });
        }
        
        recursiveCaller(urls, completeCallback);
    }
    
    
    /**
     * TODO
     */
    private replaceWildCardsOnText(text: string){
        
        let result = text;
        
        for (let wildcard of ObjectUtils.getKeys(this.wildcards)) {
    
            result = StringUtils.replace(result, wildcard, this.wildcards[wildcard]);
        }
        
        return result;
    }
    
    
    /**
     * TODO
     */
    quit(){
        
        this.driver.quit();
    }
}
