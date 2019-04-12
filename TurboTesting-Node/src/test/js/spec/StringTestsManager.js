#!/usr/bin/env node

'use strict';


/**
 * Tests related to the StringTestsManager class
 */

const { StringTestsManager } = require('./../../../../target/turbotesting-node/dist/ts/index');


describe('cmd-parameter-build', function() {
    
    beforeEach(function() {
        
        this.sut = new StringTestsManager(console, process);
    });

    
    afterEach(function() {
  
        
    });
    
    it('should correctly run assertTextContainsAll when strict order is true', function() {

        expect(this.sut.assertTextContainsAll('hello', ['h', 'e', 'o'])).toBe(true);
        expect(this.sut.assertTextContainsAll('hello', ['e', 'h'])).toBe(false);
    });
    
    
    it('should correctly run assertTextContainsAll when strict order is false', function() {

        expect(this.sut.assertTextContainsAll('hello', ['h', 'e', 'o'], '', false)).toBe(true);
        expect(this.sut.assertTextContainsAll('hello', ['e', 'h'], '', false)).toBe(true);
    });
});