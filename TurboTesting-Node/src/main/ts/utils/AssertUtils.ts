/**
 * TurboTesting is a general purpose cross-language library to improve automated testing productivity
 *
 * Website : -> http://www.turboframework.org
 * License : -> Licensed under the Apache License, Version 2.0. You may not use this file except in compliance with the License.
 * License Url : -> http://www.apache.org/licenses/LICENSE-2.0
 * CopyRight : -> Copyright 2015 Edertone Advanded Solutions (08211 Castellar del Vallès, Barcelona). http://www.edertone.com
 */


/**
 * Methods that help with running test assertions
 */
export class AssertUtils {


    /**
     * Test that the provided method throws a runtime exception. If assertion fails, an exception will be thrown
     *
     * @param callableFunction A callable function that will be executed to test for exceptions
     * @param expectedErrorRegexp A regular expression that must be found on the thrown exception error message (If not provided, any error message will be accepted).
     * @param assertionFailMessage A message that will be set to the error that is thrown if no exception happens on the callable method
     *
     * @throws Error
     *
     * @return void
     */
    public static throwsException(callableFunction: () => void, expectedErrorRegexp: undefined|RegExp = undefined, assertionFailMessage = 'Expecting an exception that was not thrown'){

        if(typeof callableFunction !== 'function'){

            throw new Error('callableFunction must be a function');
        }

        if(expectedErrorRegexp !== undefined && !(expectedErrorRegexp instanceof RegExp)){

            throw new Error('expectedErrorRegexp must be a valid regexp');
        }

        let exceptionHappened = false;

        try {

            callableFunction();

        } catch (e) {

            if (expectedErrorRegexp !== undefined && !expectedErrorRegexp.test(e.toString())) {

                throw new Error("Exception was thrown as expected, but the exception message :\n" + e.toString() + "\nDoes not match the expected regexp:\n" + expectedErrorRegexp);
            }

            exceptionHappened = true;
        }

        if(!exceptionHappened){

            throw new Error(assertionFailMessage);
        }
    }
}