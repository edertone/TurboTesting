#!/usr/bin/env node

'use strict';


/**
 * Tests related to the ObjectTestsManager class
 */

const { ObjectTestsManager } = require('./../../../../target/turbotesting-node/dist/ts/index');


describe('ObjectTestsManagerTest', function() {
    
    beforeEach(function() {
        
        this.sut = new ObjectTestsManager();
    });

    
    afterEach(function() {
  
        
    });
    
    
    it('should correctly test object properties with the assertObjectProperties method', function() {

        expect(() => {this.sut.assertObjectProperties({}, [])}).not.toThrow();
        
        expect(() => {this.sut.assertObjectProperties({a: 1}, ['a'])}).not.toThrow();
        expect(() => {this.sut.assertObjectProperties({a: 1, b:2}, ['a', 'b'])}).not.toThrow();
        expect(() => {this.sut.assertObjectProperties({b: 1, a:2}, ['b', 'a'])}).not.toThrow();
        expect(() => {this.sut.assertObjectProperties({a: 1, b:2,c:3}, ['a', 'b', 'c'])}).not.toThrow();
        
        expect(() => {this.sut.assertObjectProperties({a: 1}, ['b'])})
            .toThrowError(Error, /ObjectTestsManager.assertObjectProperties failed. key <b> was not found on the object/);
        
        expect(() => {this.sut.assertObjectProperties({a: 1, b:2}, ['c'])})
            .toThrowError(Error, /ObjectTestsManager.assertObjectProperties failed. key <c> was not found on the object/);
            
        expect(() => {this.sut.assertObjectProperties({a: 1, b:2}, ['a', 'b', 'c'])})
            .toThrowError(Error, /ObjectTestsManager.assertObjectProperties failed. key <c> was not found on the object/);
            
        expect(() => {this.sut.assertObjectProperties({a: 1, b:2,c :3}, ['a', 'c'])})
            .toThrowError(Error, /ObjectTestsManager.assertObjectProperties failed. Object has unexpected key: b/);
    });
    
    
    it('should correctly test object properties with the assertObjectProperties method when strict is false', function() {

        expect(() => {this.sut.assertObjectProperties({}, [], false)}).not.toThrow();
        
        expect(() => {this.sut.assertObjectProperties({a: 1}, ['a'], false)}).not.toThrow();
        expect(() => {this.sut.assertObjectProperties({a: 1, b:2}, ['a', 'b'], false)}).not.toThrow();
        expect(() => {this.sut.assertObjectProperties({b: 1, a:2}, ['b', 'a'], false)}).not.toThrow();
        expect(() => {this.sut.assertObjectProperties({a: 1, b:2,c:3}, ['a', 'b', 'c'], false)}).not.toThrow();
        expect(() => {this.sut.assertObjectProperties({a: 1, c:3}, ['a', 'b', 'c'], false)}).not.toThrow();
        
        expect(() => {this.sut.assertObjectProperties({a: 1}, ['b'], false)})
            .toThrowError(Error, /ObjectTestsManager.assertObjectProperties failed. Object has unexpected key: a/);
        
        expect(() => {this.sut.assertObjectProperties({a: 1, b:2}, ['c'], false)})
            .toThrowError(Error, /ObjectTestsManager.assertObjectProperties failed. Object has unexpected key: a/);
            
        expect(() => {this.sut.assertObjectProperties({a: 1, b:2}, ['a', 'b', 'c'], false)}).not.toThrow();
            
        expect(() => {this.sut.assertObjectProperties({a: 1, b:2,c :3}, ['a', 'c'], false)})
            .toThrowError(Error, /ObjectTestsManager.assertObjectProperties failed. Object has unexpected key: b/);
    });
    
});