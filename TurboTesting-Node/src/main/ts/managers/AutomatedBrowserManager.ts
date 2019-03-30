/**
 * TurboTesting is a general purpose cross-language library to improve automated testing productivity
 *
 * Website : -> http://www.turboframework.org
 * License : -> Licensed under the Apache License, Version 2.0. You may not use this file except in compliance with the License.
 * License Url : -> http://www.apache.org/licenses/LICENSE-2.0
 * CopyRight : -> Copyright 2015 Edertone Advanded Solutions (08211 Castellar del Vallès, Barcelona). http://www.edertone.com
 */
 

import { ArrayUtils, StringUtils, ObjectUtils } from 'turbocommons-ts';


/**
 * Browser automated testing management class
 *
 * @see constructor()
 */
export class AutomatedBrowserManager {
    
    
    wildCards: { [key: string]: string } = {};

    
    /**
     * The selenium webdriver instance used to manage the browser automation
     */
    private _driver: any = null;

    
    /**
     * Browser automated testing management class
     * 
     * This constructor requires some node modules to work, which are passed as dependencies
     *  
     * @param execSync A node execSync module instance (const { execSync } = require('child_process'))
     * @param webdriver A node webdriver module instance (const webdriver = require('selenium-webdriver');)
     * @param chrome A node chrome module instance (const chrome = require('selenium-webdriver/chrome'))
     * 
     * @return An AutomatedBrowserManager instance
     */
    constructor(private execSync:any,
                private webdriver:any,
                private chrome:any) {
        
    }
    
    
    initializeChrome(){
        
        // Check that chrome driver is available on our system
        try{
            
            this.execSync('chromedriver -v', {stdio : 'pipe'}).toString();
                    
        }catch(e){
            
            throw new Error("Error: Could not initialize selenium chromedriver. Please make sure it is available on OS path");
        }
        
        let chromeOptions = new this.chrome.Options();
        
        // Initialize the chrome driver with english language. Otherwise tests won't work
        chromeOptions.addArguments(["--lang=en"]);
        
        // Define the files download location to the folder where the site is deployed
        // TODO
//        chromeOptions.setUserPreferences({
//            "download.default_directory": turbobuilderSetup.sync.destPath,
//            "download.prompt_for_download": false
//        });
        
        // Enable logs so the tests can read them
        let loggingPrefs = new this.webdriver.logging.Preferences();
        loggingPrefs.setLevel('browser', this.webdriver.logging.Level.ALL); 
        loggingPrefs.setLevel('driver', this.webdriver.logging.Level.ALL); 
        
        this._driver = new this.webdriver.Builder()
            .withCapabilities(this.webdriver.Capabilities.chrome())
            .setChromeOptions(chromeOptions)
            .setLoggingPrefs(loggingPrefs)
            .build();
    }
    
    
    loadUrl(url: string, completeCallback: (finalUrl: string) => void){
        
        this._driver.get(url).then(() => {
            
            this._driver.getCurrentUrl().then((finalUrl: string) => {
                
                completeCallback(finalUrl);
            });
        });
    }
    
    
    assertUrlsRedirect(urls: any[], completeCallback: () => void){
      
        // Fail if list has duplicate values
        if(ArrayUtils.hasDuplicateElements(urls.map(l => l.url))){
            
            throw new Error('duplicate urls: ' + ArrayUtils.getDuplicateElements(urls.map(l => l.url)).join(', '));
        }
        
        // Load all the urls on the json file and perform a request for each one.
        let recursiveCaller = (urls: any[], completeCallback: () => void) => {
            
            if(urls.length <= 0){
                
                return completeCallback();
            }
            
            let entry = urls.shift();
            entry.url = this.replaceWildCardsOnText(entry.url);
            entry.to = this.replaceWildCardsOnText(entry.to);
            
            this.loadUrl(entry.url, (finalUrl) => {
                
                if(finalUrl !== entry.to){
                    
                    throw new Error('Url redirect failed: expected ' + entry.url + ' to redirect to ' + entry.to + ' but was ' + finalUrl);
                }
                    
                recursiveCaller(urls, completeCallback);
            });
        }
        
        recursiveCaller(urls, completeCallback);
    }
    
    
    private replaceWildCardsOnText(text: string){
        
        let result = text;
        
        for (let wildcard of ObjectUtils.getKeys(this.wildCards)) {
    
            result = StringUtils.replace(result, wildcard, this.wildCards[wildcard]);
        }
        
        return result;
    }
    
    
    terminate(){
        
        this._driver.quit();
    }
}
