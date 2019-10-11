<?php

/**
 * TurboTesting is a general purpose cross-language library to improve automated testing productivity
 *
 * Website : -> http://www.turboframework.org
 * License : -> Licensed under the Apache License, Version 2.0. You may not use this file except in compliance with the License.
 * License Url : -> http://www.apache.org/licenses/LICENSE-2.0
 * CopyRight : -> Copyright 2015 Edertone Advanded Solutions (08211 Castellar del Vallès, Barcelona). http://www.edertone.com
 */

namespace org\turbocommons\src\test\php\utils;

use Throwable;
use UnexpectedValueException;
use PHPUnit\Framework\TestCase;
use org\turbotesting\src\main\php\utils\AssertUtils;


/**
 * Stringutils tests
 *
 * @return void
 */
class AssertUtilsTest extends TestCase {


    /**
     * @see TestCase::setUpBeforeClass()
     *
     * @return void
     */
    public static function setUpBeforeClass(){
    }


    /**
     * @see TestCase::setUp()
     *
     * @return void
     */
    protected function setUp(){
    }


    /**
     * @see TestCase::tearDown()
     *
     * @return void
     */
    protected function tearDown(){
    }


    /**
     * @see TestCase::tearDownAfterClass()
     *
     * @return void
     */
    public static function tearDownAfterClass(){
    }


    /**
     * testThrowsException
     *
     * @return void
     */
    public function testThrowsException(){

        $exceptionMessage = '';

        // Test empty values
        try {
            AssertUtils::throwsException(null);
            $exceptionMessage = 'null did not cause exception';
        } catch (Throwable $e) {
            $this->assertRegExp('/callableFunction must be a function/', $e->getMessage());
        }

        try {
            AssertUtils::throwsException(null, null);
            $exceptionMessage = 'null did not cause exception';
        } catch (Throwable $e) {
            $this->assertRegExp('/callableFunction must be a function/', $e->getMessage());
        }

        try {
            AssertUtils::throwsException(function() {}, null);
            $exceptionMessage = 'function() {}, null did not cause exception';
        } catch (Throwable $e) {
            $this->assertRegExp('/expectedErrorRegexp must be a valid regexp/', $e->getMessage());
        }

        try {
            AssertUtils::throwsException(function() {}, '');
            $exceptionMessage = 'function() {}, "" did not cause exception';
        } catch (Throwable $e) {
            $this->assertRegExp('/Expecting an exception that was not thrown/', $e->getMessage());
        }

        // Test ok values
        try {
            AssertUtils::throwsException(function() {throw new UnexpectedValueException('exception is thrown');});
        } catch (Throwable $e) {
            $this->fail('AssertUtils::throwsException did throw an exception: '.$e->getMessage());
        }

        try {
            AssertUtils::throwsException(function() {throw new UnexpectedValueException('exception is thrown');}, '/exception is thrown/');
        } catch (Throwable $e) {
            $this->fail('AssertUtils::throwsException did throw an exception: '.$e->getMessage());
        }

        // Test wrong values
        try {
            AssertUtils::throwsException(function() {$a='no exception here';});
            $exceptionMessage = 'no exception here did not cause exception';
        } catch (Throwable $e) {
            $this->assertRegExp('/Expecting an exception that was not thrown/', $e->getMessage());
        }

        try {
            AssertUtils::throwsException(function() {throw new UnexpectedValueException('exception is thrown');}, '/text message not to be found/');
            $exceptionMessage = 'text message not to be found did not cause exception';
        } catch (Throwable $e) {
            $this->assertRegExp('/Exception was thrown as expected, but the exception message[\s\S]*exception is thrown[\s\S]*Does not match the expected regexp[\s\S]*text message not to be found/', $e->getMessage());
        }

        // Test exceptions
        try {
            AssertUtils::throwsException(function() {throw new UnexpectedValueException('exception is thrown');}, 'EE');
            $exceptionMessage = 'EE did not cause exception';
        } catch (Throwable $e) {
            $this->assertRegExp('/Delimiter must not be alphanumeric or backslash/', $e->getMessage());
        }

        if($exceptionMessage !== ''){

            $this->fail($exceptionMessage);
        }
    }
}

?>