/**
 * TurboTesting is a general purpose cross-language library to improve automated testing productivity
 *
 * Website : -> http://www.turboframework.org
 * License : -> Licensed under the Apache License, Version 2.0. You may not use this file except in compliance with the License.
 * License Url : -> http://www.apache.org/licenses/LICENSE-2.0
 * CopyRight : -> Copyright 2015 Edertone Advanded Solutions (08211 Castellar del Vallès, Barcelona). http://www.edertone.com
 */


import { ArrayUtils, HTTPManagerGetRequest, HTTPManager, HTTPManagerPostRequest, HTTPManagerBaseRequest, ObjectUtils } from 'turbocommons-ts';
import { ConsoleManager } from './ConsoleManager';
import { StringTestsManager } from './StringTestsManager';


/**
 * HTTPTestsManager class
 *
 * @see constructor()
 */
export class HTTPTestsManager {

    
    /**
     * An object containing key / pair values where each key is the name of a wildcard,
     * and the key value is the text that will replace each wildcard on all the texts analyzed
     * by this class (urls, expected values, etc ...)
     */
    wildcards: { [key: string]: string } = {};

    
    /**
     * The HTTPManager instance used to perform http requests
     */
    private httpManager: HTTPManager = new HTTPManager();


    /**
     * The StringTestsManager instance used to perform string tests
     */
    private stringTestsManager: StringTestsManager;

    
    /**
     * The ConsoleManager instance used to perform console output
     */
    private consoleManager: ConsoleManager;

    
    /**
     * Class that helps with the process of testing http requests and operations
     * 
     * This constructor requires some node modules to work, which are passed as dependencies
     *  
     * @param console An instance for the console process node object
     * @param process An instance for the global process node object
     * 
     * @return A HTTPTestsManager instance
     */
    constructor(console:any, process:any) {
        
        this.stringTestsManager = new StringTestsManager(console, process);
        this.consoleManager = new ConsoleManager(console, process);
    }

    
    /**
     * Test that all the urls on a given list throw a 404 error
     * 
     * If any of the provided urls gives a 200 ok result or can be correctly loaded, the test will fail
     * 
     * @param urls An array of strings where each item is an url to test
     * @param completeCallback A method that will be called once all the urls from the list have been tested.
     */
    assertUrlsFail(urls: string[], completeCallback: () => void){
        
        // Fail if list has duplicate values
        if(ArrayUtils.hasDuplicateElements(urls)){
            
            throw new Error('AutomatedBrowserManager.assertUrlsFail duplicate urls: ' + ArrayUtils.getDuplicateElements(urls).join('\n'));
        }
        
        let anyErrors = 0;
        
        // Perform a recursive execution for all the provided urls
        let recursiveCaller = (urls: string[], completeCallback: () => void) => {
            
            if(urls.length <= 0){
                
                if(anyErrors > 0){
                    
                    throw new Error(`AutomatedBrowserManager.assertUrlsFail failed with ${anyErrors} errors`);
                }
                
                return completeCallback();
            }
            
            let url = this.stringTestsManager.replaceWildCardsOnText(String(urls.shift()), this.wildcards);
            
            let request = new HTTPManagerGetRequest(url);
            
            request.errorCallback = () => {
            
                recursiveCaller(urls, completeCallback);
            };
            
            request.successCallback = () => {
            
                anyErrors ++;
                    
                this.consoleManager.error(`URL expected to fail with 404 but was 200 ok: ${url}`);
            
                recursiveCaller(urls, completeCallback);
            };
            
            this.httpManager.execute(request);
        }
        
        recursiveCaller(urls, completeCallback);
    }
    
    
    /**
     * Test that all the urls on a given list (which will be loaded using HTTP POST) give the expected results
     * 
     * If any of the provided urls fails any of the expected values, the test will fail
     * 
     * @param urls An array of objects where each one contains the following properties:
     *        "url" the url to test
     *        "postParameters" If defined, an object containing key pair values that will be sent as POST parameters to the url. If this property does not exist, the request will be a GET one.
     *        "contains" A string or an array of strings with texts that must exist on the url response (or null if not used)
     *        "startWith" If defined, the url response must start with the specified text (or null if not used)
     *        "endWith" If defined, the url response must end with the specified text (or null if not used)
     *        "notContains" A string or an array of strings with texts that must NOT exist on the url response (or null if not used)
     * @param completeCallback A method that will be called once all the urls from the list have been tested.
     */
    assertHttpRequests(urls: any[], completeCallback: () => void){
    
        // Fail if list has duplicate values
        if(ArrayUtils.hasDuplicateElements(urls.map((l) => {
            
            let hash = l.url;
            
            if(l.postParameters && ObjectUtils.getKeys(l.postParameters).length > 0){
                
                hash += JSON.stringify(l.postParameters);
            }
            
            return hash;
            
        }))){
            
            throw new Error('HTTPTestsManager.assertHttpRequests duplicate urls: ' + ArrayUtils.getDuplicateElements(urls.map(l => l.url)).join('\n'));
        }
        
        let anyErrors = 0;
        
        // Perform a recursive execution for all the provided urls
        let recursiveCaller = (urls: any[], completeCallback: () => void) => {
            
            if(urls.length <= 0){
                
                if(anyErrors > 0){
                    
                    throw new Error(`HTTPTestsManager.assertHttpRequests failed with ${anyErrors} errors`);
                }
                
                return completeCallback();
            }
            
            let entry = urls.shift();
            
            entry.url = this.stringTestsManager.replaceWildCardsOnText(entry.url, this.wildcards);
            entry.contains = this.stringTestsManager.replaceWildCardsOnObject(entry.contains, this.wildcards);
            
            let request: HTTPManagerBaseRequest;
            
            if(entry.postParameters){
            
                request = new HTTPManagerPostRequest(entry.url);
                
                (request as HTTPManagerPostRequest).parameters = entry.postParameters;
                    
            }else{
                
                request = new HTTPManagerGetRequest(entry.url);
            }
            
            request.errorCallback = (errorMsg: string) => {
            
                anyErrors ++;
                
                this.consoleManager.error(`Could not load url: ${entry.url}\n${errorMsg}`);

                recursiveCaller(urls, completeCallback);
            };
            
            request.successCallback = (response: any) => {

                if(entry.contains &&
                   entry.contains !== null &&
                   !this.stringTestsManager.assertTextContainsAll(response, entry.contains,
                           `Response expected to contain: $fragment\nBut not contained it for the url: ${entry.url}`)){

                    anyErrors ++;
                }
                
                if(entry.startWith &&
                   entry.startWith !== null &&
                   !this.stringTestsManager.assertTextStartsWith(response, entry.startWith,
                           `Response expected to start with: $fragment\nBut started with: ${response.substr(0, 40)}\nFor the url: ${entry.url}`)){
                     
                     anyErrors ++;
                 }
                 
                 if(entry.endWith && 
                    entry.endWith !== null &&
                    !this.stringTestsManager.assertTextEndsWith(response, entry.endWith,
                            `Response expected to end with: $fragment\nBut ended with: ${response.slice(-40)}\nFor the url: ${entry.url}`)){
                      
                     anyErrors ++;
                 }
                 
                 if(entry.notContains &&
                    entry.notContains !== null &&
                    !this.stringTestsManager.assertTextNotContainsAny(response, entry.notContains,
                            `Response NOT expected to contain: $fragment\nBut contained it for the url: ${entry.url}`)){

                     anyErrors ++;
                 }
                 
                 recursiveCaller(urls, completeCallback);
            };
            
            this.httpManager.execute(request);
        }
        
        recursiveCaller(urls, completeCallback);        
    }
}