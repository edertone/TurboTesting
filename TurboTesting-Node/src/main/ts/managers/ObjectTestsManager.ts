/**
 * TurboTesting is a general purpose cross-language library to improve automated testing productivity
 *
 * Website : -> http://www.turboframework.org
 * License : -> Licensed under the Apache License, Version 2.0. You may not use this file except in compliance with the License.
 * License Url : -> http://www.apache.org/licenses/LICENSE-2.0
 * CopyRight : -> Copyright 2015 Edertone Advanded Solutions (08211 Castellar del Vallès, Barcelona). http://www.edertone.com
 */


import { ObjectUtils } from 'turbocommons-ts';


/**
 * ObjectTestsManager class
 *
 * @see constructor()
 */
export class ObjectTestsManager {
   
    
    /**
     * Class that helps with the process of testing object structures
     *  
     * @return A ObjectTestsManager instance
     */
    constructor() {
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
        
        // Check that all the project keys appear on the keys list
        for (let key of objectKeys) {
    
            if(keys.indexOf(key) < 0){
                
                throw new Error(`ObjectTestsManager.assertObjectProperties failed. Object has unexpected key: ${key}`);
            }
        }
    }
}