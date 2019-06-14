#!/usr/bin/env node

'use strict';


/**
 * Tests related to the StringTestsManager class
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
    
    
    it('should correctly replace wildcards on text with replaceWildCardsOnText method', function() {

        expect(this.sut.replaceWildCardsOnText('$a $bb $ccc', {$a: "1", $bb: "2", $ccc: "3"})).toBe('1 2 3');
        
        expect(this.sut.replaceWildCardsOnText('$a $a $aaa $aa', {$a: "1", $aa: "2", $aaa: "3"})).toBe('1 1 3 2');
        
        expect(this.sut.replaceWildCardsOnText('some text with $a $host wildcards', {$a: "1", $host: "google.com"}))
            .toBe('some text with 1 google.com wildcards');
            
        expect(this.sut.replaceWildCardsOnText('some text with $a $host wildcards', {$host: "google.com"}))
            .toBe('some text with $a google.com wildcards');
    });
    
    
    it('should correctly run assertTextContainsAll when strict order is true', function() {

        expect(() => {this.sut.assertTextContainsAll('hello', ['h', 'e', 'o'])}).not.toThrow();
        
        expect(() => {this.sut.assertTextContainsAll('hello', ['e', 'h'])})
            .toThrowError(Error, /StringTestsManager.assertTextContainsAll failed with 1 errors/);
        
        expect(() => {this.sut.assertTextContainsAll('hello world again for', ['for', 'hello', 'again'])})
            .toThrowError(Error, /StringTestsManager.assertTextContainsAll failed with 2 errors/);
        
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