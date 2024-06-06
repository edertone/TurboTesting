"use strict";

/**
 * TurboTesting is a general purpose cross-language library to improve automated testing productivity
 *
 * Website : -> http://www.turboframework.org
 * License : -> Licensed under the Apache License, Version 2.0. You may not use this file except in compliance with the License.
 * License Url : -> http://www.apache.org/licenses/LICENSE-2.0
 * CopyRight : -> Copyright 2015 Edertone Advanded Solutions (08211 Castellar del Vallès, Barcelona). http://www.edertone.com
 */


const path = require('path');
const projectRoot = path.resolve('./');
const { StringTestsManager } = require(projectRoot + '/target/turbotesting-node/dist/ts/index');


describe('StringTestsManagerTest', function() {
    
    beforeEach(function() {
        
        this.sut = new StringTestsManager();
    });

    
    afterEach(function() {
     
    });
    
    
    it('should correctly generate html validation regexps with getRegExpToValidateHtmlDoc when several values are provided for head and body', function() {

        expect(this.sut.getRegExpToValidateHtml5()).toEqual(/^<!doctype html>( |\n|\r)*<html.*<head>.*<\/head>.*<body>.*<\/body>.*<\/html>$/s);
        
        expect(this.sut.getRegExpToValidateHtml5(/<title>Download TurboDepot<\/title>/))
            .toEqual(/^<!doctype html>( |\n|\r)*<html.*<head>.*<title>Download TurboDepot<\/title>.*<\/head>.*<body>.*<\/body>.*<\/html>$/s);
        
        expect(this.sut.getRegExpToValidateHtml5(null, /<a href=".*">Download<\/a>/))
            .toEqual(/^<!doctype html>( |\n|\r)*<html.*<head>.*<\/head>.*<body>.*<a href=".*">Download<\/a>.*<\/body>.*<\/html>$/s);
        
        expect(this.sut.getRegExpToValidateHtml5(/<title>Download TurboDepot<\/title>/, /<a href=".*">Download<\/a>/))
            .toEqual(/^<!doctype html>( |\n|\r)*<html.*<head>.*<title>Download TurboDepot<\/title>.*<\/head>.*<body>.*<a href=".*">Download<\/a>.*<\/body>.*<\/html>$/s);
    });
    
    
    it('should correctly replace wildcards on text with replaceWildCardsOnText method', function() {

        expect(this.sut.replaceWildCardsOnText('$a $bb $ccc', {$a: "1", $bb: "2", $ccc: "3"})).toBe('1 2 3');
        
        expect(this.sut.replaceWildCardsOnText('$a $a $aaa $aa', {$a: "1", $aa: "2", $aaa: "3"})).toBe('1 1 3 2');
        
        expect(this.sut.replaceWildCardsOnText('some text with $a $host wildcards', {$a: "1", $host: "google.com"}))
            .toBe('some text with 1 google.com wildcards');
            
        expect(this.sut.replaceWildCardsOnText('some text with $a $host wildcards', {$host: "google.com"}))
            .toBe('some text with $a google.com wildcards');
    });
    
    
    it('should correctly run assertTextContainsAll when strict order is true', function() {
        
        expect(() => {this.sut.assertTextContainsAll('hello', ['h', ''])}).not.toThrow();
        
        expect(() => {this.sut.assertTextContainsAll('hello', ['h', 'll', ''])}).not.toThrow();

        expect(() => {this.sut.assertTextContainsAll('hello', ['h', 'e', 'o'])}).not.toThrow();
        
        expect(() => {this.sut.assertTextContainsAll('hello', ['e', 'h'])})
            .toThrowError(Error, /StringTestsManager.assertTextContainsAll failed with 1 errors/);
        
        expect(() => {this.sut.assertTextContainsAll('hello world again for', ['for', 'hello'])})
            .toThrowError(Error, /does not follow the expected strict order/);
                                
        expect(() => {this.sut.assertTextContainsAll('hello world again for', ['for', 'hello', 'again'])})
            .toThrowError(Error, /StringTestsManager.assertTextContainsAll failed with 2 errors/);
        
        expect(() => {this.sut.assertTextContainsAll('hello world again for', ['hello', 'again', 'for'])}).not.toThrow();
        
        expect(() => {this.sut.assertTextContainsAll('hello world again for', ['hello', '', 'again', 'for'])}).not.toThrow();
            
        expect(() => {this.sut.assertTextContainsAll('hello world again for', ['hello', 'world', 'again', 'for'])}).not.toThrow();
                    
        expect(() => {this.sut.assertTextContainsAll('hello', ['h', 'l', 'o'])}).not.toThrow();
        
        expect(() => {this.sut.assertTextContainsAll('one two three two four', ['one', 'two', 'four'])}).not.toThrow();
    });
    
    
    it('should correctly run assertTextContainsAll when strict order is false', function() {

        expect(() => {this.sut.assertTextContainsAll('hello', ['h', 'e', 'o'], '', false)}).not.toThrow();
        expect(() => {this.sut.assertTextContainsAll('hello', ['e', 'h'], '', false)}).not.toThrow();
    });
    
    
    it('should correctly run assertTextNotContainsAny', function() {

        expect(() => {this.sut.assertTextNotContainsAny('hello', ['Q', 'w', 'A'])}).not.toThrow();
        
        expect(() => {this.sut.assertTextNotContainsAny('hello', ['e', 'X'])})
            .toThrowError(Error, /StringTestsManager.assertTextNotContainsAny failed with 1 errors/);
        
        expect(() => {this.sut.assertTextNotContainsAny('hello world again for', ['for', 'GOGO', 'again'])})
            .toThrowError(Error, /StringTestsManager.assertTextNotContainsAny failed with 2 errors/);
        
        expect(() => {this.sut.assertTextNotContainsAny('hello', ['H', 'R', 't'])}).not.toThrow();
    });
});