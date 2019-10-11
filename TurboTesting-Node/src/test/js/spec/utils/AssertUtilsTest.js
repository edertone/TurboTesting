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
const { AssertUtils } = require(projectRoot + '/target/turbotesting-node/dist/ts/index');


describe('AssertUtilsTest', function() {

    beforeAll(function() {
    });

    
    afterAll(function() {
    });
    
    
    it('should correctly execute the throwsException method', function() {
    
        let exceptionMessage = '';

        // Test empty values
        try {
            AssertUtils.throwsException(null);
            exceptionMessage = 'null did not cause exception';
        } catch (e) {
            expect(e.toString()).toMatch(/callableFunction must be a function/);
        }

        try {
            AssertUtils.throwsException(null, null);
            exceptionMessage = 'null did not cause exception';
        } catch (e) {
            expect(e.toString()).toMatch(/callableFunction must be a function/);
        }

        try {
            AssertUtils.throwsException(function() {}, []);
            exceptionMessage = 'function() {}, [] did not cause exception';
        } catch (e) {
            expect(e.toString()).toMatch(/expectedErrorRegexp must be a valid regexp/);
        }

        try {
            AssertUtils.throwsException(function() {}, '');
            exceptionMessage = 'function() {}, "" did not cause exception';
        } catch (e) {
            expect(e.toString()).toMatch(/expectedErrorRegexp must be a valid regexp/);
        }

        // Test ok values
        try {
            AssertUtils.throwsException(function() {throw new Error('exception is thrown');});
        } catch (e) {
            throw new Error('AssertUtils.throwsException did throw an exception: ' + e.toString());
        }

        try {
            AssertUtils.throwsException(function() {throw new Error('exception is thrown');}, /exception is thrown/);
        } catch (e) {
            throw new Error('AssertUtils.throwsException did throw an exception: ' + e.toString());
        }

        // Test wrong values
        try {
            AssertUtils.throwsException(function() {let a='no exception here';});
            exceptionMessage = 'no exception here did not cause exception';
        } catch (e) {
            expect(e.toString()).toMatch(/Expecting an exception that was not thrown/);
        }

        try {
            AssertUtils.throwsException(function() {throw new Error('exception is thrown');}, /text message not to be found/);
            exceptionMessage = 'text message not to be found did not cause exception';
        } catch (e) {
            expect(e.toString()).toMatch(/Exception was thrown as expected, but the exception message[\s\S]*exception is thrown[\s\S]*Does not match the expected regexp[\s\S]*text message not to be found/);
        }

        // Test exceptions
        try {
            AssertUtils.throwsException(function() {throw new Error('exception is thrown');}, 'EE');
            exceptionMessage = 'EE did not cause exception';
        } catch (e) {
            expect(e.toString()).toMatch(/expectedErrorRegexp must be a valid regexp/);
        }

        if(exceptionMessage !== ''){

            throw new Error(exceptionMessage);
        }
    });
});