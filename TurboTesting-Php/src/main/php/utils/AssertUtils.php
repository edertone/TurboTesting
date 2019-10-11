<?php

/**
 * TurboTesting is a general purpose cross-language library to improve automated testing productivity
 *
 * Website : -> http://www.turboframework.org
 * License : -> Licensed under the Apache License, Version 2.0. You may not use this file except in compliance with the License.
 * License Url : -> http://www.apache.org/licenses/LICENSE-2.0
 * CopyRight : -> Copyright 2015 Edertone Advanded Solutions (08211 Castellar del Vallès, Barcelona). http://www.edertone.com
 */

namespace org\turbotesting\src\main\php\utils;

use Throwable;
use UnexpectedValueException;


/**
 * Methods that help with running test assertions
 */
class AssertUtils {


    /**
     * Test that the provided method throws a runtime exception
     *
     * @param callable $function A callable function that will be executed to test for exceptions
     * @param string $expectedErrorRegexp A string containing a regular expression that must be found on the thrown exception error message
     * @param string $assertionFailMessage A message that will be set to the error that is thrown if no exception happens on the callable method
     *
     * @throws UnexpectedValueException
     *
     * @return void
     */
    public static function throwsException($function, $expectedErrorRegexp, $assertionFailMessage = 'Expecting an exception that was not thrown'){

        $exceptionHappened = false;

        try {

            $function();

        } catch (Throwable $e) {

            if (!preg_match($expectedErrorRegexp, $e->getMessage())) {

                throw new UnexpectedValueException("Exception was thrown as expected, but the exception message :\n".$e->getMessage()."\nDoes not match the expected regexp:\n".$expectedErrorRegexp);
            }

            $exceptionHappened = true;
        }

        if(!$exceptionHappened){

            throw new UnexpectedValueException($assertionFailMessage);
        }
    }
}

?>