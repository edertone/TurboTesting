/**
 * TurboTesting is a general purpose cross-language library to improve automated testing productivity
 *
 * Website : -> http://www.turboframework.org
 * License : -> Licensed under the Apache License, Version 2.0. You may not use this file except in compliance with the License.
 * License Url : -> http://www.apache.org/licenses/LICENSE-2.0
 * CopyRight : -> Copyright 2015 Edertone Advanded Solutions (08211 Castellar del Vallès, Barcelona). http://www.edertone.com
 */


import { StringUtils, ArrayUtils, ObjectUtils } from 'turbocommons-ts';


/**
 * StringTestsManager class
 *
 * @see constructor()
 */
export class StringTestsManager {
   
    
    /**
     * Class that helps with the process of testing the contents of strings and texts
     *  
     * @return A StringTestsManager instance
     */
    constructor() {
    }
    
    
    /**
     * Generate a regular expression that can be used to validate an HTML5 document structure.
     * It will chech that the document starts and ends correctly and its html tags are correct and in the right order. 
     * We can also provide our custom regular expressions to test anything we want inside the <head> and <body> tags 
     *
     * @param headContents A regular expression that will be used to test the contents of the <head> section of the html document
     * @param bodyContents A regular expression that will be used to test the contents of the <body> section of the html document
     * 
     * @return A regular expression object that is ready to validate any html5 document
     */
    getRegExpToValidateHtml5(headContents:null|RegExp = null, bodyContents:null|RegExp = null){
    
        let headContentsString = (headContents === null) ? '.*' : '.*' + headContents.source + '.*';
        let bodyContentsString = (bodyContents === null) ? '.*' : '.*' + bodyContents.source + '.*';
        
        let resultRegExp = '^<!doctype html>( |\n|\r)*<html.*<head>' + headContentsString + '<\/head>';
        
        resultRegExp += '.*<body>' + bodyContentsString + '<\/body>.*<\/html>$';
        
        return new RegExp(resultRegExp, 's');
    }
    
    
    /**
     * Replace all the occurences of the provided wildcard values into the given text
     * 
     * @param text A text where the replacement will take place
     * @param wildcards An object containing key/pair values with the wildcard patterns and their respective values
     * 
     * @return The text with all the wildcard values replaced
     */
    replaceWildCardsOnText(text: string, wildcards:any){
        
        let result = text;
        
        let wildCardNames = ObjectUtils.getKeys(wildcards);
        
        // Sort the wildcard keys by string length, so the longer ones are replaced first
        wildCardNames.sort((a, b) => {
        
            return b.length - a.length;
        });
        
        for (let wildcard of wildCardNames) {
    
            result = StringUtils.replace(result, wildcard, wildcards[wildcard]);
        }
        
        return result;
    }
    
    
    /**
     * Test that a provided text starts exactly with the provided string.
     * If the test fails, an exception will be thrown
     * 
     * @param text A text to be tested
     * @param mustStartWith A string which must be the first one of the provided text 
     * @param message The error message that will be thrown if the assertion fails. We can define wildcards
     *        in the message to be replaced in each case:
     *        - $fragment will be replaced with the mustStartWith variable value
     *        - $startedWith will be replaced with the first 80 characters of the provided text
     * 
     * @return void
     */
    assertTextStartsWith(text: string, mustStartWith: string, message: string){
        
        if(text.lastIndexOf(mustStartWith, 0) !== 0){
            
            throw new Error(StringUtils.replace(message, ['$fragment', '$startedWith'], [mustStartWith, text.substr(0, 80)]));
        }
    }
    
    
    /**
     * Test that a provided text ends exactly with the provided string.
     * If the test fails, an exception will be thrown
     * 
     * @param text A text to be tested
     * @param mustEndWith A string which must be the last one of the provided text 
     * @param message The error message that will be thrown if the assertion fails. We can define wildcards
     *        in the message to be replaced in each case:
     *        - $fragment will be replaced with the mustEndWith variable value
     *        - $endedWith will be replaced with the last 80 characters of the provided text
     *        
     * @return void
     */
    assertTextEndsWith(text: string, mustEndWith: string, message: string){
        
        if(text.indexOf(mustEndWith, text.length - mustEndWith.length) === -1){
            
            throw new Error(StringUtils.replace(message, ['$fragment', '$endedWith'], [mustEndWith, text.slice(-80)]));
        }
    }
    
    
    /**
     * Test that a provided text contains ALL of the provided strings.
     * If the test fails, an exception will be thrown
     * 
     * @param text A text to be tested
     * @param toBeFound A string or a list of strings that must all exist on the provided text
     * @param message The error message that will be thrown for each one of the toBeFound values that fail the assertion (If
     *        not provided, a default one willl be used). We can define wildcards in the message to be replaced in each case:
     *        - $fragment will be replaced by each one of the toBeFound variable values that fail the assertion
     *        - $errorMsg will be replaced by the specific error that happened on each of the toBeFound variable values that fail the assertion
     * @param strictOrder If set to true, the toBeFound texts must appear in the target text with same order as defined (if more than one)  
     *        
     * @return void
     */
    assertTextContainsAll(text: string, toBeFound: string|string[], message: string = '', strictOrder = true){
        
        let anyErrors = [];
        let indexesFound = [];
        let fragmentsArray = ArrayUtils.isArray(toBeFound) ? toBeFound : [String(toBeFound)];
        
        if(message === ''){
            
            message = `Error found with the specified fragment $fragment: $errorMsg`;
        }
        
        for (let fragment of fragmentsArray) {
            
            indexesFound.push(text.indexOf(fragment));
            
            if(indexesFound[indexesFound.length - 1] < 0){
                
                anyErrors.push(StringUtils.replace(message,['$fragment', '$errorMsg'],
                        [fragment, 'The value was not found on the text']));
            
            }else if(strictOrder){
                    
                let maxIndexFound = Math.max.apply(null, indexesFound);
                
                if(indexesFound[indexesFound.length - 1] < maxIndexFound){
                    
                    anyErrors.push(StringUtils.replace(message, ['$fragment', '$errorMsg'],
                            [fragment, 'The string was found on text, but does not follow the expected strict order']));
                }
            }          
        }
        
        if(anyErrors.length > 0){
            
            throw new Error(`StringTestsManager.assertTextContainsAll failed with ${anyErrors.length} errors:\n` +
                    anyErrors.join('\n'));
        }
    }
    
    
    /**
     * Test that a provided text does NOT contain any of the provided strings.
     * If the test fails, an exception will be thrown
     * 
     * @param text A text to be tested
     * @param notToBeFound A string or a list of strings that must NOT exist on the provided text
     * @param message The error message that will be thrown for each one of the notToBeFound values that fail the assertion (If
     *        not provided, a default one willl be used). We can define wildcards in the message to be replaced in each case:
     *        - $fragment will be replaced by each one of the notToBeFound variable values that fail the assertion
     *        - $errorMsg will be replaced by the specific error that happened on each of the notToBeFound variable values that fail the assertion
     *        
     * @return void
     */
    assertTextNotContainsAny(text: string, notToBeFound: string|string[], message: string = ''){
        
        let anyErrors = [];
        let fragmentsArray = ArrayUtils.isArray(notToBeFound) ? notToBeFound : [String(notToBeFound)];
        
        if(message === ''){
            
            message = `\nError found with the specified fragment $fragment: $errorMsg\n`;
        }

        for (let fragment of fragmentsArray) {
            
            if(text.indexOf(fragment) >= 0){
                
                anyErrors.push(StringUtils.replace(message, ['$fragment', '$errorMsg'],
                    [fragment, 'The string was found on text, and it shouldn\'t']));
            }
        }
        
        if(anyErrors.length > 0){
            
            throw new Error(`StringTestsManager.assertTextNotContainsAny failed with ${anyErrors.length} errors\n` +
                    anyErrors.join('\n'));
        }
    }
}