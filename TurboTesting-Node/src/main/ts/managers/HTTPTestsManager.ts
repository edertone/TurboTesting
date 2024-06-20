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

declare const Promise: any;


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
     * @param timeout We can specify a custom time limit for the http requests. Default value is 0, which is the system one
     *
     * @return A HTTPTestsManager instance
     */
    constructor(timeout?:number) {
        
        if(timeout !== undefined){
            
            this.httpManager.timeout = timeout;
        }
                
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
     * @param urls An array where each element can be a string containing the url that must fail, or an object that contains the following properties:<br>
     *        "url" the url to test<br>
     *        "postParameters" If defined, an object containing key pair values that will be sent as POST parameters to the url. If this property does not exist, the request will be a GET one.<br>
     *        "responseCode" If defined, the url response code must match the specified value<br>
     *        "is" If defined, the url response must be exactly the specified string<br>
     *        "contains" A string or an array of strings with texts that must exist on the url response (or null if not used)<br>
     *        "startWith" If defined, the url response must start with the specified text (or null if not used)<br>
     *        "endWith" If defined, the url response must end with the specified text (or null if not used)<br>
     *        "notContains" A string or an array of strings with texts that must NOT exist on the url response (or null if not used)
     *
     * @return A promise which will end correctly if the process finishes ok or fail with exception otherwise (If assert exceptions are disabled, it will end correctly but with the list of errors) 
     */
    assertUrlsFail(urls: any[]){
        
        if(!ArrayUtils.isArray(urls)){
            
            throw new Error('urls parameter must be an array');
        }

        this.findDuplicateUrlValues(urls, 'HTTPTestsManager.assertUrlsFail duplicate urls:');
        
        return new Promise ((resolve: (results:any) => void) => {
            
            let responses: string[] = [];
            let anyErrors: string[] = [];
            
            // Perform a recursive execution for all the provided urls
            let recursiveCaller = (index:number) => {
    
                if(index >= urls.length){
                    
                    if(this.isAssertExceptionsEnabled && anyErrors.length > 0){
                        
                        throw new Error(`HTTPTestsManager.assertUrlsFail failed with ${anyErrors.length} errors:\n` +
                            anyErrors.join('\n') + `\n\nLIST OF RESPONSES:\n` + responses.join('\n\n'));
                    }

                    return resolve({responses: responses, assertErrors: anyErrors});
                }
                
                let request = this.createRequestFromEntry(urls[index], anyErrors);
                
                request.errorCallback = (errorMsg: string, errorCode: number, response: string) => {
                
                    responses.push(response);
                    
                    this.assertRequestContents(response, urls[index], anyErrors, String(errorCode), errorMsg);
                    
                    recursiveCaller(index + 1);
                };
                
                request.successCallback = (response: string) => {
                
                    responses.push(response);
                    
                    anyErrors.push(`URL expected to fail but was 200 ok: ${request.url}`);
                
                    recursiveCaller(index + 1);
                };
                
                try{
                    
                    this.httpManager.execute(request);
                    
                } catch (e) {
    
                    recursiveCaller(index + 1);
                }
            }
            
            recursiveCaller(0);
        });
    }
    
    
    /**
     * Test that all the urls on a given list (which will be loaded using HTTP POST) give the expected (valid response) results
     * Note that urls will be executed one after the other in the same order as provided
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
     *
     * @return A promise which will end correctly if the process finishes ok or fail with exception otherwise (If assert exceptions are disabled, it will
     *         end correctly with the list of errors). The resulting structure is {responses: string[], assertErrors?: string[]}
     */
    assertHttpRequests(urls: any[]){
    
        if(!ArrayUtils.isArray(urls)){
            
            throw new Error('urls parameter must be an array');
        }

        this.findDuplicateUrlValues(urls, 'HTTPTestsManager.assertHttpRequests duplicate urls:');
        
        return new Promise ((resolve: (results:any) => void) => {
            
            let responses: string[] = [];
            let anyErrors: string[] = [];
            
            // Perform a recursive execution for all the provided urls
            let recursiveCaller = (urls: any[]) => {
                
                if(urls.length <= 0){
                    
                    if(this.isAssertExceptionsEnabled && anyErrors.length > 0){
                        
                        throw new Error(`HTTPTestsManager.assertHttpRequests failed with ${anyErrors.length} errors:\n` + anyErrors.join('\n') +
                                        `\n\nLIST OF RESPONSES:\n` + responses.join('\n\n'));
                    }
                    
                    return resolve({responses: responses, assertErrors: anyErrors});
                }
                
                let entry = urls.shift();
                
                let request = this.createRequestFromEntry(entry, anyErrors);
                
                request.errorCallback = (errorMsg: string, errorCode: number, response: string) => {
                
                    responses.push(response);
                    anyErrors.push(`Could not load url (${errorCode}): ${request.url}\n${errorMsg}\n${response}`);
    
                    recursiveCaller(urls);
                };
                
                request.successCallback = (response: string) => {
                    
                    responses.push(response);
                    
                    this.assertRequestContents(response, entry, anyErrors, '200');
                     
                    recursiveCaller(urls);
                };
                
                try{
                    
                    this.httpManager.execute(request);
                    
                } catch (e) {
    
                    anyErrors.push('Error performing http request to '+ request.url + '\n' + e.toString());
    
                    this.assertRequestContents('', entry, anyErrors, '0');
    
                    recursiveCaller(urls);
                }
            }
            
            recursiveCaller(urls);
        });
    }
    
    
    /**
     * Test the result of a list of urls (which can be loaded using HTTP POST) against a custom method.
     * The method will receive the response for each one of the calls. We can then perform with this method any assert we want with the result 
     * of each url call.
     * 
     * Notice that urls will be executed one after the other in the same order as provided
     * 
     * If any of the provided urls fails or does not exist, the test will fail
     * 
     * @param urls An array of objects where each one contains the following properties:
     *        "url" the url to test
     *        "postParameters" If defined, an object containing key pair values that will be sent as POST parameters to the url. If this property does not exist, the request will be a GET one.
     *        "data" A parameter that we can use to send extra information we may need the assert method. For example a list of expected values for that url call
     *
     * @return A promise which will end correctly if the process finishes ok or fail with exception otherwise (If assert exceptions are disabled, it will
     *         end correctly with the list of errors). The resulting structure is {responses: string[], assertErrors?: string[]}
     */
    assertMethodToUrls(urls: any[], method:(assertData:any) => void){
        
        if(!ArrayUtils.isArray(urls)){
            
            throw new Error('urls parameter must be an array');
        }
        
        // Verify the urls have the mandatory properties
        for(let url of urls){
            
            if(!url.hasOwnProperty('url')){
            
                throw new Error('Url object does not have mandatory url property');
            }
            
            if(!url.hasOwnProperty('postParameters')){
            
                throw new Error('Url object does not have mandatory postParameters property');
            }
        }
        
        return new Promise ((resolve: (results:any) => void) => {
            
            let responses: string[] = [];
            let anyErrors: string[] = [];
            
            // Perform a recursive execution for all the provided urls
            let recursiveCaller = (urls: any[]) => {
                
                if(urls.length <= 0){
                    
                    if(this.isAssertExceptionsEnabled && anyErrors.length > 0){
                        
                        throw new Error(`HTTPTestsManager.assertMethodToUrls failed with ${anyErrors.length} errors:\n` + anyErrors.join('\n') +
                                        `\n\nLIST OF RESPONSES:\n` + responses.join('\n\n'));
                    }
                    
                    return resolve({responses: responses, assertErrors: anyErrors});
                }
                
                let entry = urls.shift();
                
                let request = this.createRequestFromEntry(entry, anyErrors, false);
                
                request.errorCallback = (errorMsg: string, errorCode: number, response: string) => {
                
                    responses.push(response);
                    anyErrors.push(`Could not load url (${errorCode}): ${request.url}\n${errorMsg}\n${response}`);
    
                    recursiveCaller(urls);
                };
                
                request.successCallback = (response: string) => {
                    
                    responses.push(response);
                    
                    try{
                        
                        method({
                            url: entry.url,
                            response: response,
                            data: entry.data
                        });
                        
                    } catch (e) {
        
                        anyErrors.push('Error on method called asserting url '+ request.url + '\n' + e.toString());
                    }
 
                    recursiveCaller(urls);
                };
                
                try{
                    
                    this.httpManager.execute(request);
                    
                } catch (e) {
    
                    anyErrors.push('Error performing http request to '+ request.url + '\n' + e.toString());
    
                    recursiveCaller(urls);
                }
            }
            
            recursiveCaller(urls);
        });
    }
    
    
    /**
     * Aux method to find duplicate values on an url list
     */
    private findDuplicateUrlValues(urls: any[], errorMessageHeading: string){
        
        // Fail if list has duplicate values
        let urlHashesList: any[] = [];
        
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
    private createRequestFromEntry(entry: any, anyErrors: string[], validateProperties = true){
        
        if(StringUtils.isString(entry)){

            entry = this.stringTestsManager.replaceWildCardsOnText(entry, this.wildcards);

            return new HTTPManagerGetRequest(entry);
        }
        
        // Check that the provided entry object is correct
        if(validateProperties){
            
            try {
                
                this.objectTestsManager.assertObjectProperties(entry,
                    ["url", "postParameters", "responseCode", "is", "contains", "startWith", "endWith", "notContains"], false);
                    
            } catch (e) {
            
                anyErrors.push(e.toString());
            } 
        }
                    
        entry.url = this.stringTestsManager.replaceWildCardsOnText(entry.url, this.wildcards);
        
        if(entry.hasOwnProperty('contains')){
        
            entry.contains = this.objectTestsManager.replaceWildCardsOnObject(entry.contains, this.wildcards);
        }
        
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