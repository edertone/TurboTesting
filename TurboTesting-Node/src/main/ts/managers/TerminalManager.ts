/**
 * TurboTesting is a general purpose cross-language library to improve automated testing productivity
 *
 * Website : -> http://www.turboframework.org
 * License : -> Licensed under the Apache License, Version 2.0. You may not use this file except in compliance with the License.
 * License Url : -> http://www.apache.org/licenses/LICENSE-2.0
 * CopyRight : -> Copyright 2015 Edertone Advanded Solutions (08211 Castellar del Vallès, Barcelona). http://www.edertone.com
 */


import { StringUtils } from 'turbocommons-ts';


/**
 * TerminalManager class
 *
 * @see constructor()
 */
export class TerminalManager {
    
    
    /**
     * Class that helps with the process of testing command line applications and executions through the OS terminal
     * 
     * This constructor requires some node modules to work, which are passed as dependencies
     *  
     * @param execSync A node execSync module instance (const { execSync } = require('child_process');)
     * 
     * @return A CommandLineTestsManager instance
     */
    constructor(private execSync:any) {
        
    }
    
    
    /**
     * Execute an arbitrary cmd command on the currently active directory
     * 
     * @param command Some cmd operation to execute on the current working directory
     * 
     * @return The full cmd output for the given command
     */
    exec(command: string) {
        
        try{
            
            return this.execSync(command, {stdio : 'pipe'}).toString();
            
        }catch(e){
            
            if(!StringUtils.isEmpty(e.stderr.toString())){
                
                return e.stderr.toString();
            }
            
            return e.stdout.toString();
        }  
    }
}
