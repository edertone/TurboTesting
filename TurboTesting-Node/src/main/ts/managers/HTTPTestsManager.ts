/**
 * TurboTesting is a general purpose cross-language library to improve automated testing productivity
 *
 * Website : -> http://www.turboframework.org
 * License : -> Licensed under the Apache License, Version 2.0. You may not use this file except in compliance with the License.
 * License Url : -> http://www.apache.org/licenses/LICENSE-2.0
 * CopyRight : -> Copyright 2015 Edertone Advanded Solutions (08211 Castellar del Vallès, Barcelona). http://www.edertone.com
 */


import { ArrayUtils, StringUtils,HTTPManagerGetRequest, HTTPManager, HTTPManagerPostRequest, HTTPManagerBaseRequest, ObjectUtils } from 'turbocommons-ts';
import { StringTestsManager } from './StringTestsManager';
import { ObjectTestsManager } from './ObjectTestsManager';

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
     * Defines if this class will throw code exceptions for all the assertions that fail (RECOMMENDED!).
     * If set to false, the list of failed assertion errors will be returned by each assertion complete callback method and
     * no assertion exception will be thrown by this class. (Note that all exception that are not related with asserts will still be thrown)
     */
    isAssertExceptionsEnabled = true;

    
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
    private stringTestsManager: StringTestsManager = new StringTestsManager();

    
    /**
     * The ObjectTestsManager instance used to perform object tests
     */
    private objectTestsManager: ObjectTestsManager = new ObjectTestsManager();

    
    /**
     * Class that helps with the process of testing http requests and operations
     *  
     * @return A HTTPTestsManager instance
     */
    constructor() {
                
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
     * Test that all the urls on a given list return non "200 ok" error code.
     * 
     * If any of the provided urls gives a 200 ok result or can be correctly loaded, the test will fail
     * 
     * @param urls An array where each element can be a string containing the url that must fail, or an object that contains the following properties:
     *        "url" the url to test
     *        "postParameters" If defined, an object containing key pair values that will be sent as POST parameters to the url. If this property does not exist, the request will be a GET one.
     *        "responseCode" If defined, the url response code must match the specified value
     *        "is" If defined, the url response must be exactly the specified string
     *        "contains" A string or an array of strings with texts that must exist on the url response (or null if not used)
     *        "startWith" If defined, the url response must start with the specified text (or null if not used)
     *        "endWith" If defined, the url response must end with the specified text (or null if not used)
     *        "notContains" A string or an array of strings with texts that must NOT exist on the url response (or null if not used)
     * @param completeCallback A method that will be called once all the urls from the list have been tested (If assert exceptions are disabled, the list of errors will also be found here).
     */
    assertUrlsFail(urls: any[], completeCallback: (assertErrors?: string[]) => void){
        
        if(!ArrayUtils.isArray(urls)){
            
            throw new Error('urls parameter must be an array');
        }

        this.findDuplicateUrlValues(urls, 'HTTPTestsManager.assertUrlsFail duplicate urls:');
        
        let anyErrors: string[] = [];
        
        // Perform a recursive execution for all the provided urls
        let recursiveCaller = (urls: any[], completeCallback: (assertErrors?: string[]) => void) => {

            if(urls.length <= 0){
                
                if(this.isAssertExceptionsEnabled && anyErrors.length > 0){
                    
                    throw new Error(`HTTPTestsManager.assertUrlsFail failed with ${anyErrors.length} errors:\n` + anyErrors.join('\n'));
                }

                return completeCallback(anyErrors);
            }
            
            let entry = urls.shift();
            
            let request = this.createRequestFromEntry(entry, anyErrors);
            
            request.errorCallback = (errorMsg: string, errorCode: number, response: string) => {
            
                this.assertRequestContents(response, entry, anyErrors, String(errorCode), errorMsg);
                
                recursiveCaller(urls, completeCallback);
            };
            
            request.successCallback = () => {
            
                anyErrors.push(`URL expected to fail but was 200 ok: ${request.url}`);
            
                recursiveCaller(urls, completeCallback);
            };
            
            try{
                
                this.httpManager.execute(request);
                
            } catch (e) {

                recursiveCaller(urls, completeCallback);
            }
        }
        
        recursiveCaller(urls, completeCallback);
    }
    
    
    /**
     * Test that all the urls on a given list (which will be loaded using HTTP POST) give the expected (valid response) results
     * 
     * If any of the provided urls fails any of the expected values, the test will fail
     * 
     * @param urls An array of objects where each one contains the following properties:
     *        "url" the url to test
     *        "postParameters" If defined, an object containing key pair values that will be sent as POST parameters to the url. If this property does not exist, the request will be a GET one.
     *        "responseCode" If defined, the url response code must match the specified value
     *        "is" If defined, the url response must be exactly the specified string
     *        "contains" A string or an array of strings with texts that must exist on the url response (or null if not used)
     *        "startWith" If defined, the url response must start with the specified text (or null if not used)
     *        "endWith" If defined, the url response must end with the specified text (or null if not used)
     *        "notContains" A string or an array of strings with texts that must NOT exist on the url response (or null if not used)
     * @param completeCallback A method that will be called once all the urls from the list have been tested. An array with all the results for
     *        each request will be passed to this method (If assert exceptions are disabled, the list of errors will also be found here).
     */
    assertHttpRequests(urls: any[], completeCallback: (responses: string[], assertErrors?: string[]) => void){
    
        if(!ArrayUtils.isArray(urls)){
            
            throw new Error('urls parameter must be an array');
        }

        this.findDuplicateUrlValues(urls, 'HTTPTestsManager.assertHttpRequests duplicate urls:');
        
        let responses: string[] = [];
        let anyErrors: string[] = [];
        
        // Perform a recursive execution for all the provided urls
        let recursiveCaller = (urls: any[], completeCallback: (responses: string[], assertErrors?: string[]) => void) => {
            
            if(urls.length <= 0){
                
                if(this.isAssertExceptionsEnabled && anyErrors.length > 0){
                    
                    throw new Error(`HTTPTestsManager.assertHttpRequests failed with ${anyErrors} errors:\n` + anyErrors.join('\n'));
                }
                
                return completeCallback(responses, anyErrors);
            }
            
            let entry = urls.shift();
            
            let request = this.createRequestFromEntry(entry, anyErrors);
            
            request.errorCallback = (errorMsg: string, errorCode: number, response: string) => {
            
                responses.push(response);
                anyErrors.push(`Could not load url (${errorCode}): ${request.url}\n${errorMsg}\n${response}`);

                recursiveCaller(urls, completeCallback);
            };
            
            request.successCallback = (response: string) => {
                
                responses.push(response);
                
                this.assertRequestContents(response, entry, anyErrors, '200');
                 
                recursiveCaller(urls, completeCallback);
            };
            
            try{
                
                this.httpManager.execute(request);
                
            } catch (e) {

                anyErrors.push('Error performing http request to '+ request.url + '\n' + e.toString());

                this.assertRequestContents('', entry, anyErrors, '0');

                recursiveCaller(urls, completeCallback);
            }
        }
        
        recursiveCaller(urls, completeCallback);        
    }
    
    
    /**
     * Aux method to find duplicate values on an url list
     */
    private findDuplicateUrlValues(urls: any[], errorMessageHeading: string){
        
        // Fail if list has duplicate values
        let urlHashesList = [];
        
        for (let url of urls) {
            
            if(StringUtils.isString(url)){
                
                urlHashesList.push(url);
            
            }else{
                
                let hash = url.url;
            
                // Post parameters are taken into consideration if defined.
                if(url.hasOwnProperty('postParameters') && ObjectUtils.getKeys(url.postParameters).length > 0){
                    
                    hash += JSON.stringify(url.postParameters);
                }
                
                urlHashesList.push(hash);
            }
        }
        
        if(ArrayUtils.hasDuplicateElements(urlHashesList)){
            
            throw new Error(errorMessageHeading + ' ' + ArrayUtils.getDuplicateElements(urlHashesList).join('\n'));
        }        
    }
    
    /**
     * Aux method to generate an http request from the data of an entry
     */
    private createRequestFromEntry(entry: any, anyErrors: string[]){
        
        if(StringUtils.isString(entry)){

            entry = this.stringTestsManager.replaceWildCardsOnText(entry, this.wildcards);

            return new HTTPManagerGetRequest(entry);
        }
        
        // Check that the provided entry object is correct
        try {
            
            this.objectTestsManager.assertObjectProperties(entry,
                ["url", "postParameters", "responseCode", "is", "contains", "startWith", "endWith", "notContains"], false);
                
        } catch (e) {
        
            anyErrors.push(e.toString());
        } 
                    
        entry.url = this.stringTestsManager.replaceWildCardsOnText(entry.url, this.wildcards);
        entry.contains = this.objectTestsManager.replaceWildCardsOnObject(entry.contains, this.wildcards);
        
        let request: HTTPManagerBaseRequest;
            
        if(entry.hasOwnProperty('postParameters')){
        
            request = new HTTPManagerPostRequest(entry.url);
            
            (request as HTTPManagerPostRequest).parameters = entry.postParameters;
                
        }else{
            
            request = new HTTPManagerGetRequest(entry.url);
        }
        
        return request;
    }
    
    
    /**
     * Aux method to perform multiple assertions on a request response
     */
    private assertRequestContents(response: string, entry: any, anyErrors: string[], errorCode: string = '', errorMsg: string = ''){
    
        if(errorCode !== '' && entry.hasOwnProperty('responseCode') && entry.responseCode !== null && String(errorCode) !== String(entry.responseCode)){
                       
            anyErrors.push(`Response code for the url: ${entry.url} was expected to be ${entry.responseCode} but was ${errorCode} - ${errorMsg}\n\n`);
        }
                
        if(entry.hasOwnProperty('is') && entry.is !== null && response !== entry.is){
                       
            anyErrors.push(`Response for the url: ${entry.url} was expected to be:\n${entry.is}\nBut was:\n${StringUtils.limitLen(response, 500)}\n\n`);
        }
       
        if(entry.hasOwnProperty('contains') && entry.contains !== null && entry.contains !== undefined && entry.contains !== ''){
           
            try {
               
                this.stringTestsManager.assertTextContainsAll(response, entry.contains,
                    `Response expected to contain: $fragment\nBut not contained it for the url: ${entry.url} which started with: \n${StringUtils.limitLen(response, 500)}\n\n`);
                    
            } catch (e) {
           
                anyErrors.push(e.toString());
            }
        }
       
        if(entry.hasOwnProperty('startWith') && entry.startWith !== null){
           
            try {
               
                this.stringTestsManager.assertTextStartsWith(response, entry.startWith,
                    `Response expected to start with: $fragment\nBut started with: $startedWith\nFor the url: ${entry.url}`);
               
            } catch (e) {
            
                anyErrors.push(e.toString());
            }                    
        }
        
        if(entry.hasOwnProperty('endWith') && entry.endWith !== null){
            
            try {
                
                this.stringTestsManager.assertTextEndsWith(response, entry.endWith,
                    `Response expected to end with: $fragment\nBut ended with: $endedWith\nFor the url: ${entry.url}`);
                        
            } catch (e) {
           
                anyErrors.push(e.toString());
            }
        }
        
        if(entry.hasOwnProperty('notContains') && entry.notContains !== null){
            
            try {
                
                this.stringTestsManager.assertTextNotContainsAny(response, entry.notContains,
                    `Response NOT expected to contain: $fragment\nBut contained it for the url: ${entry.url}`);
                        
            } catch (e) {
            
                anyErrors.push(e.toString());
            }
        }
    }
}