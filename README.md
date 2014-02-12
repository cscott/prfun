# prfun
[![NPM][NPM1]][NPM2]

[![Build Status][1]][2] [![dependency status][3]][4] [![dev dependency status][5]][6]

Helper functions for ES6 Promises.

The `Promise` implementation included in the [ES6] "harmony" Javascript
specification is missing some of the useful utility functions that
are common in popular packages like [bluebird], [when], and [q].

This package supplies them.  It also loads [es6-shim] for the basic
`Promise` implementation, if there is not already a `Promise` implemention
present.

Portions of the API and test suite are borrowed from [bluebird] and [when].

## Usage

To use the promise implementation from your ES6 engine (or [es6-shim], if
you are running on an ES5 engine):
```
require('prfun')();

// Use Promise.reduce, etc...
```

To use a different promise implementation:
```
var prfun = require('prfun');
var Promise = prfun( require('bluebird'/*etc*/) );
```

## API

- [Collections](#collections)
    - [`Promise.all`]
    - [`Promise#all`]
    - [`Promise.join`]
    - [`Promise.map`]
    - [`Promise#map`]
    - [`Promise.props`]
    - [`Promise#props`]
    - [`Promise.race`]
    - [`Promise#race`]
    - [`Promise.reduce`]
    - [`Promise#reduce`]
    - [`Promise.reduceRight`]
    - [`Promise#reduceRight`]
    - [`Promise#spread`]
- [Utility](#utility)
    - [`Promise#call`]
    - [`Promise#get`]
    - [`Promise#return`]
    - [`Promise#throw`]
- [Try/caught/finally](#trycaughtfinally)
    - [`Promise.try`]
    - [`Promise#caught`]
    - [`Promise#finally`]

###Collections

Methods of `Promise` instances and core static methods of the Promise
class to deal with collections of promises or mixed promises and
values.

#####`Promise.all(Array<dynamic>|Iterable values)` -> `Promise`
[`Promise.all`]: #promiseallarraydynamiciterable-values---promise

This is an
[ES6 built-in](http://people.mozilla.org/~jorendorff/es6-draft.html#sec-promise.all).
Note that, unlike many libraries, the ES6
method accepts as its argument only an array (or iterable), not a
promise for an array (or iterable).  Also, the ES6 method does not
preserve sparsity in the passed array.

Given an array or iterable which contains promises (or a mix of
promises and values) return a promise that is fulfilled when all the
items in the array are fulfilled. The promise's fulfillment value is
an array with fulfillment values at respective positions to the
original iterable. If any promise in the iterable rejects, the
returned promise is rejected with the rejection reason.

<hr>

#####`Promise#all()` -> `Promise`
[`Promise#all`]: #promiseall---promise

Convenience method for:
```js
promise.then(function(value) {
    return Promise.all(value);
});
```

See [`Promise.all`].
<hr>

#####`Promise.join([dynamic value...])` -> `Promise`
[`Promise.join`]: #promisejoindynamic-value---promise

Like [`Promise.all`] but instead of having to pass an array, the array
is generated from the passed variadic arguments.

So instead of:

```js
Promise.all([a, b]).spread(function(aResult, bResult) {

});
```

You can do:

```js
Promise.join(a, b).spread(function(aResult, bResult) {

});
```

<hr>

#####`Promise.map(Array<dynamic>|Promise values, Function mapper [, Object thisArg])` -> `Promise`
[`Promise.map`]: #promisemaparraydynamicpromise-values-function-mapper--object-thisarg---promise

Maps an array-like, or a promise of an array-like, using the provided
`mapper` function.

Convenience method for:
```js
Promise.cast(values).map(mapper, thisArg);
```

See [`Promise#map`].
<hr>

#####`Promise#map(Function mapper [, Object thisArg])` -> `Promise`
[`Promise#map`]: #promisemapfunction-mapper--object-thisarg---promise

Map (a promise of) an array which contains a promises (or
a mix of promises and values) with the given `mapper` function with
the signature `(item, index, array)` where `item` is the resolved
value of a respective promise in the input array. If any promise in
the input array is rejected the returned promise is rejected as well.

If the `mapper` function returns promises or thenables, the returned
promise will wait for all the mapped results to be resolved as well,
as if [`Promise.all`] were invoked on the result.

If a `thisArg` parameter is provided, it will be passed to `mapper`
when invoked, for use as its `this` value.  Otherwise, the value
`undefined` will be passed for use as its `this` value.

The behavior of `map` matches
[`Array.prototype.map`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map)
as much as possible.  Note that this means that non-array objects are often
accepted without error, and any object without a length field returns a
zero-length array.  For example,
`Array.prototype.map.call(123, Object.toString)` returns `[]`.
`Promise#map` rejects with a `TypeError` if `Array.prototype.map`
would throw a `TypeError`.

*The original array is not modified.*

<hr>

#####`Promise.props(Object|Promise object)` -> `Promise`
[`Promise.props`]: #promisepropsobjectpromise-object---promise

Like [`Promise.all`] but for object properties instead of array
items. Returns a promise that is fulfilled when all the properties of
the object are fulfilled. The promise's fulfillment value is an object
with fulfillment values at respective keys to the original object. If
any promise in the object rejects, the returned promise is rejected
with the rejection reason.

If `object` is a `Promise` or "thenable" --- that is, if it has a
property named `then` which is a callable function --- then it will be
treated as a promise for the object, rather than for its properties.
All other objects are treated for their own enumerable properties, as returned by
[`Object.keys`].

```js
Promise.props({
    pictures: getPictures(),
    comments: getComments(),
    tweets: getTweets()
}).then(function(result){
    console.log(result.tweets, result.pictures, result.comments);
});
```

Note that if you have no use for the result object other than
retrieving the properties, it is more convenient to use
[`Promise.all`] and [`Promise#spread`]:

```js
Promise.all([getPictures(), getComments(), getTweets()])
.spread(function(pictures, comments, tweets) {
    console.log(pictures, comments, tweets);
});
```

*The original object is not modified.*

[`Object.keys`]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys

<hr>

#####`Promise#props()` -> `Promise`
[`Promise#props`]: #promiseprops---promise

Convenience method for:
```js
promise.then(function(value) {
    return Promise.props(value);
});
```

See [`Promise.props`].
<hr>

#####`Promise.race(Array<dynamic>|Iterable values)` -> `Promise`
[`Promise.race`]: #promiseracearraydynamiciterable-values---promise

This is an
[ES6 built-in](http://people.mozilla.org/~jorendorff/es6-draft.html#sec-promise.race).
Note that, unlike many libraries, the ES6
method accepts as its argument only an array (or iterable), not a
promise for an array (or iterable).  The ES6 method also returns
**a promise that never resolves** if you promise a zero-length array;
user beware!

Given an array or iterable which contains promises (or a mix of
promises and values) return a promise that is fulfilled or rejected as
soon as a promise in the array is fulfilled or rejected with the
respective rejection reason or fulfillment value.

<hr>

#####`Promise#race()` -> `Promise`
[`Promise#race`]: #promiserace---promise

Convenience method for:
```js
promise.then(function(value) {
    return Promise.race(value);
});
```

See [`Promise.race`].
<hr>

#####`Promise.reduce(Array<dynamic>|Promise values, Function reducer [, dynamic initialValue])` -> `Promise`
[`Promise.reduce`]: #promisereducearraydynamicpromise-values-function-reducer--dynamic-initialvalue---promise

Reduce an array-like, or a promise of an array-like, left-to-right
using the provided `reducer` function.

Convenience method for:
```js
Promise.cast(values).reduce(reducer /*, initialValue*/);
```

See [`Promise#reduce`].
<hr>

#####`Promise#reduce(Function reducer [, dynamic initialValue])` -> `Promise`
[`Promise#reduce`]: #promisereducefunction-reducer--dynamic-initialvalue---promise

Reduce an array, or a promise of an array, which contains a promises
(or a mix of promises and values) left-to-right with the given
`reducer` function with the signature `(previousValue, currentValue,
index, array)` where `currentValue` is the resolved value of a
respective promise in the input array, and `previousValue` is the
value returned by the previous invocation of the `reducer`.  If the
`reducer` returns a promise or thenable, it will be resolved and
`previousValue` will be the resolved value.  The `initialValue` may
also be a promise or thenable.  If any promise is rejected (in the
input array, an `initialValue`, or a promise returned by `resolved`),
returned promise is rejected as well.

Promises are resolved in order: first the initialValue (if any), then
the first item in the array, then the returned value from the
`resolver` (if it is a promise), then the next item in the array, then
the next returned value from `resolver`, etc.

For example: Read given files sequentially while summing their
contents as an integer. Each file contains just the text `10`.

```js
var readFileAsync = Promise.promisify(fs.readFile, fs);
Promise.reduce(["file1.txt", "file2.txt", "file3.txt"], function(total, fileName) {
    return readFileAsync(fileName, "utf8").then(function(contents) {
        return total + parseInt(contents, 10);
    });
}, 0).then(function(total) {
    //Total is 30
});
```

The behavior of `reduce` matches
[`Array.prototype.reduce`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/Reduce)
as much as possible.  Note that this means that non-array objects are often
accepted without error, and any object without a length field is treated as a
zero-length array.  For example,
`Array.prototype.reduce.call(123, Math.pow, 42)` returns `42`.
`Promise#reduce` rejects with a `TypeError` if `Array.prototype.reduce`
would throw a `TypeError`, for example if you pass a zero-length array without
an `initialValue`.

*The original array is not modified.*

<hr>

#####`Promise.reduceRight(Array<dynamic>|Promise values, Function reducer [, dynamic initialValue])` -> `Promise`
[`Promise.reduceRight`]: #promisereducerightarraydynamicpromise-values-function-reducer--dynamic-initialvalue---promise

Reduce an array-like, or a promise of an array-like, right-to-left
using the provided `reducer` function.

Convenience method for:
```js
Promise.cast(values).reduceRight(reducer /*, initialValue*/);
```

See [`Promise#reduceRight`].
<hr>

#####`Promise#reduceRight(Function reducer [, dynamic initialValue])` -> `Promise`
[`Promise#reduceRight`]: #promisereducerightfunction-reducer--dynamic-initialvalue---promise

Reduce an array, or a promise of an array, which contains a promises
(or a mix of promises and values) right-to-left with the given
`reducer` function with the signature `(previousValue, currentValue,
index, array)` where `currentValue` is the resolved value of a
respective promise in the input array, and `previousValue` is the
value returned by the previous invocation of the `reducer`.  If the
`reducer` returns a promise or thenable, it will be resolved and
`previousValue` will be the resolved value.  The `initialValue` may
also be a promise or thenable.  If any promise is rejected (in the
input array, an `initialValue`, or a promise returned by `resolved`),
returned promise is rejected as well.

Promises are resolved in order: first the initialValue (if any), then
the last item in the array, then the returned value from the
`resolver` (if it is a promise), then the next-to-last item in the array, then
the next returned value from `resolver`, etc.

The behavior of `reduceRight` matches
[`Array.prototype.reduceRight`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/ReduceRight)
as much as possible.  Note that this means that non-array objects are often
accepted without error, and any object without a length field is treated as a
zero-length array.  For example,
`Array.prototype.reduceRight.call(123, Math.pow, 42)` returns `42`.
`Promise#reduceRight` rejects with a `TypeError` if `Array.prototype.reduceRight`
would throw a `TypeError`, for example if you pass a zero-length array without
an `initialValue`.

*The original array is not modified.*

<hr>

#####`Promise#spread([Function fulfilledHandler] [, Function rejectedHandler ])` -> `Promise`
[`Promise#spread`]: #promisespreadfunction-fulfilledhandler--function-rejectedhandler----promise

Like calling `Promise#then`, but the fulfillment value or rejection reason is
assumed to be an array, which is flattened to the formal parameters of
the handlers.

```js
Promise.all([task1, task2, task3]).spread(function(result1, result2, result3){

});
```

Normally when using `Promise#then` the code would be like:

```js
Promise.all([task1, task2, task3]).then(function(results){
    var result1 = results[0];
    var result2 = results[1];
    var result3 = results[2];
});
```

This is useful when the `results` array contains items that are not
conceptually items of the same list.

<hr>

###Utility

Shorthands for common operations.

#####`Promise#call(String propertyName [, Promise|dynamic arg...])` -> `Promise`
[`Promise#call`]: #promisecallstring-propertyname--promisedynamic-arg---promise

This is a convenience method for doing:

```js
promise.then(function(obj){
    return obj[propertyName].call(obj, arg...);
});
```
If any of the `arg...` are Promises, they will be resolved before the method
is invoked.

<hr>

#####`Promise#get(String propertyName)` -> `Promise`
[`Promise#get`]: #promisegetstring-propertyname---promise

This is a convenience method for doing:

```js
promise.then(function(obj){
    return obj[propertyName];
});
```

<hr>

#####`Promise#return(Promise|dynamic value)` -> `Promise`
[`Promise#return`]: #promisereturnpromisedynamic-value---promise

Convenience method for:

```js
promise.then(function() {
   return value;
});
```

in the case where `value` doesn't change its value.

That means `value` is bound at the time of calling `Promise#return`
so this will not work as expected:

```js
function getData() {
    var data;

    return query().then(function(result) {
        data = result;
    }).return(data);
}
```

because `data` is `undefined` at the time `.return` is called.

<hr>

#####`Promise#throw(Promise|dynamic reason)` -> `Promise`
[`Promise#throw`]: #promisethrowpromisedynamic-reason---promise

Convenience method for:

```js
promise.then(function() {
   throw reason;
});
```
...except that `reason` is first resolved, if it is a `Promise` or thenable.

Same limitations apply as with [`Promise#return`].

<hr>

### Try/caught/finally

#####`Promise.try(Function fn [, dynamic ctx [, dynamic args...]] )` -> `Promise`
[`Promise.try`]: #promisetryfunction-fn--dynamic-ctx--dynamic-args----promise

Start the chain of promises with `Promise.try`. Any synchronous
exceptions will be turned into rejections on the returned promise.

```js
function getUserById(id) {
    return Promise.try(function(){
        if (typeof id !== "number") {
            throw new Error("id must be a number");
        }
        return db.getUserById(id);
    });
}
```

Now if someone uses this function, they will catch all errors in their
Promise `.catch` handlers instead of having to handle both synchronous
and asynchronous exception flows.

If provided, `ctx` becomes the `this` value for the function call.  Any `args`
provided are resolved (if they are promises) and passed as arguments to the
function call.

<hr>

#####`Promise#caught([Function ErrorClass|Function predicate...], Function handler)` -> `Promise`
[`Promise#caught`]: #promisecaughtfunction-errorclassfunction-predicate-function-handler---promise

This extends `.catch` to work more like catch-clauses in languages
like Java or C#. Instead of manually checking `instanceof` or
`.name === "SomeError"`, you may specify a number of error constructors which
are eligible for this catch handler. The catch handler that is first
met that has eligible constructors specified, is the one that will be
called.

Example:

```js
somePromise.then(function(){
    return a.b.c.d();
}).caught(TypeError, function(e){
    //If a is defined, will end up here because
    //it is a type error to reference property of undefined
}).caught(ReferenceError, function(e){
    //Will end up here if a wasn't defined at all
}).caught(function(e){
    //Generic catch-the rest, error wasn't TypeError nor
    //ReferenceError
});
 ```

You may also add multiple filters for a catch handler:

```js
somePromise.then(function(){
    return a.b.c.d();
}).caught(TypeError, ReferenceError, function(e){
    //Will end up here on programmer error
}).caught(NetworkError, TimeoutError, function(e){
    //Will end up here on expected everyday network errors
}).catch(function(e){
    //Catch any unexpected errors
});
```

For a parameter to be considered a type of error that you want to
filter, you need the constructor to have its `.prototype` property be
`instanceof Error`.

Such a constructor can be minimally created like so:

```js
function MyCustomError() {}
MyCustomError.prototype = Object.create(Error.prototype);
```

Using it:

```js
Promise.resolve().then(function(){
    throw new MyCustomError();
}).caught(MyCustomError, function(e){
    //will end up here now
});
```

However, you can obtain better stack traces and string output with:

```js
function MyCustomError(message) {
    this.message = message;
    this.name = "MyCustomError";
    if (Error.captureStackTrace) // v8 environments
        Error.captureStackTrace(this, MyCustomError);
}
MyCustomError.prototype = Object.create(Error.prototype);
MyCustomError.prototype.constructor = MyCustomError;
```

Using CoffeeScript's `class` for the same:

```coffee
class MyCustomError extends Error
  constructor: (@message) ->
    @name = "MyCustomError"
    Error.captureStackTrace?(this, MyCustomError)
```

This method also supports predicate-based filters. If you pass a
predicate function instead of an error constructor, the predicate will
receive the error as an argument. The return result of the predicate
will be used determine whether the error handler should be called.

Predicates should allow for very fine grained control over caught
errors: pattern matching, error-type sets with set operations and many
other techniques can be implemented on top of them.

Example of using a predicate-based filter:

```js
var request = Promise.promisify(require("request"));

function clientError(e) {
    return e.code >= 400 && e.code < 500;
}

request("http://www.google.com").then(function(contents){
    console.log(contents);
}).caught(clientError, function(e){
   //A client error like 400 Bad Request happened
});
```

<hr>

#####`Promise#finally(Function handler)` -> `Promise`
[`Promise#finally`]: #promisefinallyfunction-handler---promise

Pass a handler that will be called regardless of this promise's
fate. Returns a new promise chained from this promise, which will
become resolved with the same fulfillment value or rejection reason as
this promise. However, if `handler` returns a promise, the resolution
of the returned promise will be delayed until the promise returned
from `handler` is finished.  If `handler` throws an exception or
returns a rejected promise, the returned promise will reject in the
same way.  (This matches the JavaScript semantics for exceptions
thrown inside `finally` clauses.)

Consider the example:

```js
function anyway() {
    $("#ajax-loader-animation").hide();
}

function ajaxGetAsync(url) {
    return new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest;
        xhr.addEventListener("error", reject);
        xhr.addEventListener("load", resolve);
        xhr.open("GET", url);
        xhr.send(null);
    }).then(anyway, anyway);
}
```

This example doesn't work as intended because the `then` handler
actually swallows the exception and returns `undefined` for any
further chainers.

The situation can be fixed with `Promise#finally`:

```js
function ajaxGetAsync(url) {
    return new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest;
        xhr.addEventListener("error", reject);
        xhr.addEventListener("load", resolve);
        xhr.open("GET", url);
        xhr.send(null);
    }).finally(function(){
        $("#ajax-loader-animation").hide();
    });
}
```

Now the animation is hidden but an exception or the actual return
value will automatically skip the finally and propagate to further
chainers. This is more in line with the synchronous `finally` keyword.

`Promise#finally` works like [Q's finally method](https://github.com/kriskowal/q/wiki/API-Reference#wiki-promisefinallycallback).

<hr>

## License

Copyright (c) 2014 C. Scott Ananian

Portions are Copyright (c) 2014 Petka Antonov

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:</p>

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

[ES6]:      http://wiki.ecmascript.org/doku.php?id=harmony:specification_drafts
[bluebird]: https://github.com/petkaantonov/bluebird
[when]:     https://github.com/cujojs/when
[q]:        https://github.com/kriskowal/q
[es6-shim]: https://github.com/paulmillr/es6-shim

[NPM1]: https://nodei.co/npm/prfun.png
[NPM2]: https://nodei.co/npm/prfun/

[1]: https://travis-ci.org/cscott/prfun.png
[2]: https://travis-ci.org/cscott/prfun
[3]: https://david-dm.org/cscott/prfun.png
[4]: https://david-dm.org/cscott/prfun
[5]: https://david-dm.org/cscott/prfun/dev-status.png
[6]: https://david-dm.org/cscott/prfun#info=devDependencies
