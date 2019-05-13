/**
 * TurboTesting is a general purpose cross-language library to improve automated testing productivity
 *
 * Website : -> http://www.turboframework.org
 * License : -> Licensed under the Apache License, Version 2.0. You may not use this file except in compliance with the License.
 * License Url : -> http://www.apache.org/licenses/LICENSE-2.0
 * CopyRight : -> Copyright 2015 Edertone Advanded Solutions (08211 Castellar del Vallès, Barcelona). http://www.edertone.com
 */


import { ArrayUtils, HTTPManagerGetRequest, HTTPManager, HTTPManagerPostRequest, HTTPManagerBaseRequest, ObjectUtils } from 'turbocommons-ts';
import { StringTestsManager } from './StringTestsManager';

declare let process: any;
declare let global: any;
declare function require(name: string): any;


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
     * Class that helps with the process of testing http requests and operations
     *  
     * @return A HTTPTestsManager instance
     */
    constructor() {
        
        this.stringTestsManager = new StringTestsManager();
        
        // Make sure the XMLHttpRequest class is available. If not, initialize it from the xhr2 library
        try {

            new XMLHttpRequest();
            
        } catch (e) {

            // HTTPManager class requires XMLHttpRequest which is only available on browser but not on node.
            // The xhr2 library emulates this class so it can be used on nodejs projects. We declare it globally here
            global.XMLHttpRequest = require('xhr2');
            
            // This value is set to disable the SSL bad certificate errors on nodejs which would make some http requests
            // fail with no error message
            process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
        }
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
        
        let anyErrors: string[] = [];
        
        // Perform a recursive execution for all the provided urls
        let recursiveCaller = (urls: string[], completeCallback: () => void) => {
            
            if(urls.length <= 0){
                
                if(anyErrors.length > 0){
                    
                    throw new Error(`AutomatedBrowserManager.assertUrlsFail failed with ${anyErrors.length} errors:\n` + anyErrors.join('\n'));
                }
                
                return completeCallback();
            }
            
            let url = this.stringTestsManager.replaceWildCardsOnText(String(urls.shift()), this.wildcards);
            
            let request = new HTTPManagerGetRequest(url);
            
            request.errorCallback = () => {
            
                recursiveCaller(urls, completeCallback);
            };
            
            request.successCallback = () => {
            
                anyErrors.push(`URL expected to fail with 404 but was 200 ok: ${url}`);
            
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
        
        let anyErrors: string[] = [];
        
        // Perform a recursive execution for all the provided urls
        let recursiveCaller = (urls: any[], completeCallback: () => void) => {
            
            if(urls.length <= 0){
                
                if(anyErrors.length > 0){
                    
                    throw new Error(`HTTPTestsManager.assertHttpRequests failed with ${anyErrors} errors:\n` + anyErrors.join('\n'));
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
            
                anyErrors.push(`Could not load url: ${entry.url}\n${errorMsg}`);

                recursiveCaller(urls, completeCallback);
            };
            
            request.successCallback = (response: any) => {

                if(entry.contains && entry.contains !== null){

                    try {
                        
                        this.stringTestsManager.assertTextContainsAll(response, entry.contains,
                            `Response expected to contain: $fragment\nBut not contained it for the url: ${entry.url}`);
                             
                    } catch (e) {
                    
                        anyErrors.push(e.toString());
                    }
                }
                
                if(entry.startWith && entry.startWith !== null){
                    
                    try {

                        this.stringTestsManager.assertTextStartsWith(response, entry.startWith,
                            `Response expected to start with: $fragment\nBut started with: $startedWith\nFor the url: ${entry.url}`);
                        
                    } catch (e) {

                        anyErrors.push(e.toString());
                    }                    
                 }
                 
                 if(entry.endWith && entry.endWith !== null){
                     
                     try {

                         this.stringTestsManager.assertTextEndsWith(response, entry.endWith,
                             `Response expected to end with: $fragment\nBut ended with: $endedWith\nFor the url: ${entry.url}`);
                                 
                     } catch (e) {
                    
                         anyErrors.push(e.toString());
                     }
                 }
                 
                 if(entry.notContains && entry.notContains !== null){
                     
                     try {

                         this.stringTestsManager.assertTextNotContainsAny(response, entry.notContains,
                             `Response NOT expected to contain: $fragment\nBut contained it for the url: ${entry.url}`);
                                 
                     } catch (e) {
                    
                         anyErrors.push(e.toString());
                     }
                 }
                 
                 recursiveCaller(urls, completeCallback);
            };
            
            this.httpManager.execute(request);
        }
        
        recursiveCaller(urls, completeCallback);        
    }
}