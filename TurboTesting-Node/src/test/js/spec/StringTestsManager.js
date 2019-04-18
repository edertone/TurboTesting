#!/usr/bin/env node

'use strict';


/**
 * Tests related to the StringTestsManager class
 */

const { StringTestsManager } = require('./../../../../target/turbotesting-node/dist/ts/index');


describe('StringTestsManager', function() {
    
    beforeEach(function() {
        
        this.sut = new StringTestsManager();
    });

    
    afterEach(function() {
  
        
    });
    
    it('should correctly run assertTextContainsAll when strict order is true', function() {

        expect(() => {this.sut.assertTextContainsAll('hello', ['h', 'e', 'o'])}).not.toThrow();
        
        expect(() => {this.sut.assertTextContainsAll('hello', ['e', 'h'])})
            .toThrowError(Error, /AutomatedBrowserManager.assertTextContainsAll failed with 1 errors/);
        
        expect(() => {this.sut.assertTextContainsAll('hello world again for', ['for', 'hello', 'again'])})
            .toThrowError(Error, /AutomatedBrowserManager.assertTextContainsAll failed with 2 errors/);
        
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
            .toThrowError(Error, /AutomatedBrowserManager.assertTextNotContainsAny failed with 1 errors/);
        
        expect(() => {this.sut.assertTextNotContainsAny('hello world again for', ['for', 'GOGO', 'again'])})
            .toThrowError(Error, /AutomatedBrowserManager.assertTextNotContainsAny failed with 2 errors/);
        
        expect(() => {this.sut.assertTextNotContainsAny('hello', ['H', 'R', 't'])}).not.toThrow();
    });
});