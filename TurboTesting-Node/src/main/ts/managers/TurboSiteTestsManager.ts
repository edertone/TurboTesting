/**
 * TurboTesting is a general purpose cross-language library to improve automated testing productivity
 *
 * Website : -> http://www.turboframework.org
 * License : -> Licensed under the Apache License, Version 2.0. You may not use this file except in compliance with the License.
 * License Url : -> http://www.apache.org/licenses/LICENSE-2.0
 * CopyRight : -> Copyright 2015 Edertone Advanded Solutions (08211 Castellar del Vallès, Barcelona). http://www.edertone.com
 */


import { StringUtils } from 'turbocommons-ts';
import { FilesManager } from 'turbodepot-node';


/**
 * TurboSiteTestsManager class
 *
 * @see constructor()
 */
export class TurboSiteTestsManager {
    
    
    /**
     * A files manager instance used by this class
     */
    private filesManager: FilesManager;

    
    /**
     * Class with methods that help when testing Turbosite-Php projects
     * 
     * @param projectRootPath Full filesystem path to the root of the project we are testing
     * 
     * @return A TurboSiteTestsManager instance
     */
    constructor(private projectRootPath:string) {
        
        this.filesManager = new FilesManager();
    }
    
    
    /**
     * TODO - Finish this method and document it
     */
    getWildcards(){
        
        let turboBuilderSetup = this.getSetup('turbobuilder');
        let turboSiteSetup = this.getSetup('turbosite');

        // TODO - per trobar el cache hash, mirem si a la carpeta de projecte que ens han passat existeix
        // una carpeta target. A partir d'aqui, busquem el index.php corresponent, en llegim el site setup
        // i d'alla podrem treure el cache hash.
        
        // TODO - This must be improved.
        // Projectname fails here if we are testing a release compiled version
        // let projectName = turboBuilderSetup.metadata.name;
        
        // TODO - the way in which we are obtaining the $hostRoot value should be improved cause it 
        // uses several splits that may give wrong values some time... It should be better to use the StringUtils
        // getHostNameFromUrl method, but it now only works with browsers cause it relies on the anchor element to
        // obtain the hostname. We should first fix the StringUtils method and then use it here.
        
        return {
            "$host": turboBuilderSetup.sync.remoteUrl.split('://')[1],
            "$hostRoot": turboBuilderSetup.sync.remoteUrl.split('://')[1].split('/')[0],
            "$locale": turboSiteSetup.locales[0].split('_')[0],
            "$homeView": turboSiteSetup.homeView,
            "$cacheHash": 'TODO - how to find this?',
            "$baseURL": turboSiteSetup.baseURL === '' ? '' : '/' + turboSiteSetup.baseURL
        };
    }
    
    
    /**
     * Obtain the requested setup data as a fully initialized object from the project that is currently defined as root on this class.
     * 
     * @param setupName The name for a setup that we want to read from the current project. This must be the same name that is
     *        defined on the physical .json file that stores the setup. For example: "turbosite" to get the "turbosite.json" setup
     *
     * @return An object containing all the requested setup data
     */
    getSetup(setupName: string){
    
        let setupPath = StringUtils.formatPath(this.projectRootPath + this.filesManager.dirSep() + setupName + '.json');
        
        return JSON.parse(this.filesManager.readFile(setupPath));
    }


    /**
     * Obtain the requested setup data as a fully initialized object from the index.php file of a compiled TurboSite-Php project.
     * 
     * @param setupName The name for a setup that we want to read from the specified index.php file. This must be the same name that is
     *        defined on the physical .json file that stores the setup before compilation. For example: "turbosite" to get the "turbosite.json" setup
     *        
     * @param indexPhpPath The full file system path to the compiled index.php file from which we want to read the setup data. 
     *
     * @return An object containing all the requested setup data
     */
    getSetupFromIndexPhp(setupName: string, indexPhpPath: string) {
        
        let setupJson = this.filesManager.readFile(indexPhpPath).split('"' + setupName + '.json" => json_decode(\'{')[1].split("}')")[0];

        setupJson = setupJson.replace(/\\'/g, "'").replace(/\\\\/g, "\\");

        return JSON.parse('{' + setupJson + '}');    
    }


    /**
     * Save the specified setup data object into the specified index.php file with the specified setup name.
     * 
     * If the setup json string already exists on the index.php file, it will be overriden, otherwise a new line will be
     * added to the index.php file containing the provided setup data with the specified name.
     * 
     * @param setupObject An object containing the setup data we want to save
     * @param The name for a setup that we want to save to the specified index.php file. This must be the same name that is
     *        defined on the physical .json file that stores the setup before compilation. For example: "turbosite" to save the "turbosite.json" setup
     * @param indexPhpPath The full file system path to the compiled index.php file to which we want to save the setup data. 
     *        
     * @return True on success, false on failure
     */
    saveSetupToIndexPhp(setupObject:any, setupName: string, indexPhpPath: string) {
        
        let indexPhpContent = this.filesManager.readFile(indexPhpPath);
        let indexPhpContentModified = '';
        let setupJson = JSON.stringify(setupObject).replace(/'/g, "\\'").replace(/\\/g, "\\\\");
            
        if(indexPhpContent.includes('$ws->generateContent(__FILE__);')){
        
            indexPhpContentModified = indexPhpContent
                .replace('$ws->generateContent(__FILE__);', 
                         '$ws->generateContent(__FILE__, [\n    "' + setupName + '.json" => json_decode(\'' + setupJson + "')\n]);");
        
        } else if(indexPhpContent.includes('"' + setupName + '.json" => json_decode(')) {

            indexPhpContentModified = indexPhpContent
                .replace(new RegExp('"' + setupName + "\\.json\" => json_decode\\('{.*}'\\)", 'g'),
                         '"' + setupName + '.json" => json_decode(\'' + setupJson + '\')'); 
        
        } else {
        
            indexPhpContentModified = indexPhpContent
                .replace('$ws->generateContent(__FILE__, [\n',
                         '$ws->generateContent(__FILE__, [\n    "' + setupName + '.json" => json_decode(\'' + setupJson + "'),\n");
        }
        
        return this.filesManager.saveFile(indexPhpPath, indexPhpContentModified);    
    }
}
