/**
 * TurboTesting is a general purpose cross-language library to improve automated testing productivity
 *
 * Website : -> http://www.turboframework.org
 * License : -> Licensed under the Apache License, Version 2.0. You may not use this file except in compliance with the License.
 * License Url : -> http://www.apache.org/licenses/LICENSE-2.0
 * CopyRight : -> Copyright 2015 Edertone Advanded Solutions (08211 Castellar del Vallès, Barcelona). http://www.edertone.com
 */


import { StringUtils, ArrayUtils, ObjectUtils } from 'turbocommons-ts';
import { ConsoleManager } from 'turbodepot-node';


/**
 * StringTestsManager class
 *
 * @see constructor()
 */
export class StringTestsManager {
   
    
    /**
     * The ConsoleManager instance used to perform http requests
     */
    private consoleManager: ConsoleManager;

    
    /**
     * Class that helps with the process of testing the contents of strings and texts
     * 
     * This constructor requires some node modules to work, which are passed as dependencies
     *  
     * @param console An instance for the console process node object
     * @param process An instance for the global process node object
     * 
     * @return A StringTestsManager instance
     */
    constructor(console:any, process:any) {
        
        this.consoleManager = new ConsoleManager(console, process);
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
        
        for (let wildcard of ObjectUtils.getKeys(wildcards)) {
    
            result = StringUtils.replace(result, wildcard, wildcards[wildcard]);
        }
        
        return result;
    }
    
    
    /**
     * Replace all the occurences of the provided wildcard values into the given object
     * 
     * @param object An object that will be inspected for wildcard replacements
     * @param wildcards An object containing key/pair values with the wildcard patterns and their respective values
     * 
     * @return An object with all the wildcard occurences replaced. Note that this is a copy, the original object won't be modified
     */
    replaceWildCardsOnObject(object: any, wildcards:any){
        
        let cloned = ObjectUtils.clone(object); 
            
        if(StringUtils.isString(cloned)){
            
            return this.replaceWildCardsOnText(cloned, wildcards);
        }
        
        if(ArrayUtils.isArray(cloned)){
            
            for (var i = 0; i < cloned.length; i++) {

                cloned[i] = this.replaceWildCardsOnText(cloned[i], wildcards);
            }
            
            return cloned;
        }
        
        // TODO - implement other types of possible object structures
        
        return cloned;
    }
    
    
    /**
     * Test that a provided text starts exactly with the provided string
     * 
     * @param text A text to be tested
     * @param mustStartWith A string which must be the first one of the provided text 
     * @param message An error message that will be shown on the console if the assertion fails. We can define wildcards
     *        in the message to be replaced in each case:
     *        - $fragment will be replaced by the mustStartWith variable value
     *        
     * @return true if the provided text starts with the mustStartWith string, false otherwise
     */
    assertTextStartsWith(text: string, mustStartWith: string, message: string){
        
        if(text.lastIndexOf(mustStartWith, 0) !== 0){
            
            this.consoleManager.error(StringUtils.replace(message, ['$fragment'], [mustStartWith]));
            
            return false;
        }
        
        return true;
    }
    
    
    /**
     * Test that a provided text ends exactly with the provided string
     * 
     * @param text A text to be tested
     * @param mustEndWith A string which must be the last one of the provided text 
     * @param message An error message that will be shown on the console if the assertion fails. We can define wildcards
     *        in the message to be replaced in each case:
     *        - $fragment will be replaced by the mustEndWith variable value
     *        
     * @return true if the provided text ends with the mustEndWith string, false otherwise
     */
    assertTextEndsWith(text: string, mustEndWith: string, message: string){
        
        if(text.indexOf(mustEndWith, text.length - mustEndWith.length) === -1){
            
            this.consoleManager.error(StringUtils.replace(message, ['$fragment'], [mustEndWith]));
            
            return false;
        }
        
        return true;
    }
    
    
    /**
     * Test that a provided text contains all of the provided strings
     * 
     * @param text A text to be tested
     * @param toBeFound A string or a list of strings that must all exist on the provided text
     * @param message An error message that will be shown on the console for each one of the toBeFound values that fail
     *        the assertion (If not provided, a default one willl be used). We can define wildcards in the message to be replaced in each case:
     *        - $fragment will be replaced by each one of the toBeFound variable values that fail the assertion
     * @param strictOrder If set to true, the toBeFound texts must appear in the target text with same order as defined (if more than one)  
     *        
     * @return true if all of the strings are found on the provided text, false if any of the strings is not found on the provided text
     */
    assertTextContainsAll(text: string, toBeFound: string|string[], message: string = '', strictOrder = true){
        
        let anyErrors = 0;
        let indexesFound = [];
        let fragmentsArray = ArrayUtils.isArray(toBeFound) ? toBeFound : [String(toBeFound)];
        
        if(message === ''){
            
            message = `Text expected to contain: $fragment\nBut it didn't`;
        }
        
        for (let fragment of fragmentsArray) {
            
            indexesFound.push(text.indexOf(fragment));
            
            if(indexesFound[indexesFound.length - 1] < 0){
                
                anyErrors ++;
                
                this.consoleManager.error(StringUtils.replace(message, ['$fragment'], [fragment]));
            }
            
            if(strictOrder){
                
                let maxIndexFound = Math.max.apply(null, indexesFound);
                
                if(indexesFound[indexesFound.length - 1] < maxIndexFound){
                    
                    anyErrors ++;
                    
                    this.consoleManager.error('The following string was found on text, but does not follow the expected strict order: ' + fragment);
                }
            }
        }
        
        return anyErrors === 0;
    }
    
    
    /**
     * Test that a provided text does NOT contain any of the provided strings
     * 
     * @param text A text to be tested
     * @param notToBeFound A string or a list of strings that must NOT exist on the provided text
     * @param message An error message that will be shown on the console for each one of the notToBeFound values that fail
     *        the assertion. We can define wildcards in the message to be replaced in each case:
     *        - $fragment will be replaced by each one of the notToBeFound variable values that fail the assertion
     *        
     * @return true if none of the strings is found on the provided text, false if any of the strings exists on the provided text
     */
    assertTextNotContainsAny(text: string, notToBeFound: string|string[], message: string){
        
        let anyErrors = 0;
        let fragmentsArray = ArrayUtils.isArray(notToBeFound) ? notToBeFound : [String(notToBeFound)];
        
        for (let fragment of fragmentsArray) {
            
            if(text.indexOf(fragment) >= 0){
                
                anyErrors ++;
                
                this.consoleManager.error(StringUtils.replace(message, ['$fragment'], [fragment]));
            }
        }
        
        return anyErrors === 0;
    }
}