/**
 * TurboTesting is a general purpose cross-language library to improve automated testing productivity
 *
 * Website : -> http://www.turboframework.org
 * License : -> Licensed under the Apache License, Version 2.0. You may not use this file except in compliance with the License.
 * License Url : -> http://www.apache.org/licenses/LICENSE-2.0
 * CopyRight : -> Copyright 2015 Edertone Advanded Solutions (08211 Castellar del Vallès, Barcelona). http://www.edertone.com
 */


import { StringUtils, ObjectUtils, ArrayUtils } from 'turbocommons-ts';
import { StringTestsManager } from './StringTestsManager';


/**
 * ObjectTestsManager class
 *
 * @see constructor()
 */
export class ObjectTestsManager {
   
    
    /**
     * The StringTestsManager instance used to perform string tests
     */
    private stringTestsManager: StringTestsManager = new StringTestsManager();

    
    /**
     * Class that helps with the process of testing object structures
     *  
     * @return A ObjectTestsManager instance
     */
    constructor() {
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
            
            return this.stringTestsManager.replaceWildCardsOnText(cloned, wildcards);
        }
        
        if(ArrayUtils.isArray(cloned)){
            
            for (var i = 0; i < cloned.length; i++) {

                cloned[i] = this.stringTestsManager.replaceWildCardsOnText(cloned[i], wildcards);
            }
            
            return cloned;
        }
        
        // TODO - implement other types of possible object structures
        
        return cloned;
    }
    
    
    /**
     * Test that the provided value is an object.
     * If the test fails, an exception will be thrown
     * 
     * @param object Anything to test
     * 
     * @return void 
     */
    assertIsObject(object: any){
        
        if(!ObjectUtils.isObject(object)){
            
            throw new Error(`ObjectTestsManager.assertObjectProperties failed. provided element is not an object`);
        }
    }
    
    
    /**
     * Test that a provided object has one or more of the provided properties
     * If the test fails, an exception will be thrown
     * 
     * @param object An object to be tested
     * @param keys A list with the only key names that are accepted for the object.
     * @param strict If set to true, all the provided keys must appear on the object. If set to false, not all the keys
     *        are required to be found on the object. (In both cases, any object property must exist on the list of keys)
     * 
     * @return void
     */
    assertObjectProperties(object: any, keys: string[], strict = true){
        
        let objectKeys = ObjectUtils.getKeys(object);
        
        // Check that all the keys appear on the object
        if(strict){
            
            for (let key of keys) {
    
                if(objectKeys.indexOf(key) < 0){
                    
                    throw new Error(`ObjectTestsManager.assertObjectProperties failed. key <${key}> was not found on the object`);
                }
            }
        }
        
        // Check that all the object keys appear on the keys list
        for (let key of objectKeys) {
    
            if(keys.indexOf(key) < 0){
                
                throw new Error(`ObjectTestsManager.assertObjectProperties failed. Object has unexpected key: ${key}`);
            }
        }
    }
}