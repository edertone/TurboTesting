### General purpose cross-language library to improve automated testing productivity

This library tries to help developers to write automated tests for their projects, focusing on speed and productivity. The most common testing procedures are coded into classes that are easy to use and understand, grouped by functional areas.

It is a library that uses the same methods and classes across all the implemented languages, so we can work the same way when switching between different projects or technologies.

### Documentation

**A detailed code specification is available online. You can check it [here](https://turboframework.org/en/libs/turbotesting)**

### How to use it

- Php:
```
Currently available only as a .phar file (download it from https://turboframework.org)
require '..../turbotesting-php-X.X.X.phar';
use org\turbotesting\src\main\php\utils\AssertUtils;
$n = AssertUtils::throwsException(function() { someMethodThatFails(); }, '/assert exception message/');
```
- Typescript:
```
npm install turbotesting-ts
import { AssertUtils } from 'turbotesting-ts';
let n = AssertUtils.throwsException(function() {throw new Error('exception is thrown');}, 'assert exception message');
```
- NodeJS projects:
```
npm install turbotesting-ts
const {AssertUtils} = require('turbotesting-ts');
var n = AssertUtils.throwsException(function() {throw new Error('exception is thrown');}, 'assert exception message');
```

### Language support

- Php (7 or more recommended)
- Typescript
- NodeJS

We want to increase this list. So! if you want to translate the library to your language of choice, please contact us! We need your help to port this library to as many languages as possible, and more important, we need to code the SAME unit tests across all the implemented languages. This is the only way to guarantee that the library delivers exactly the same behavior everywhere.

### Dependencies

This library requires the latest [turbocommons](https://turboframework.org/en/libs/turbocommons) and [turbodepot](https://turboframework.org/en/libs/turbodepot) library versions

### Contribute

Turbo Testing is 100% free and open source, but we will be really pleased to receive any help, support, comments or donations to help us improve this library. If you like it, spread the word!

- You can get more info at the official site:

	- [https://turboframework.org/en/libs/turbotesting](https://turboframework.org/en/libs/turbotesting)

### Donate
	
[![Donate](https://turboframework.org/view/views/home/donate-button.png)](https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=53MJ6SY66WZZ2&lc=ES&item_name=TurboTesting&no_note=0&cn=A%c3%b1adir%20instrucciones%20especiales%20para%20el%20vendedor%3a&no_shipping=2&currency_code=EUR&bn=PP%2dDonationsBF%3abtn_donateCC_LG%2egif%3aNonHosted)
