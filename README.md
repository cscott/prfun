# prfun
[![NPM][NPM1]][NPM2]

[![Build Status][1]][2] [![dependency status][3]][4] [![dev dependency status][5]][6]

Helper functions for ES6 Promises.

The `Promise` implementation included in the [ES6] "harmony" Javascript
specification is missing some of the useful utility functions that
are common in popular packages like [bluebird], [when], and [q].

This package supplies them.  It optionally loads a `Promise`
implementation from [core-js], if there is not already a `Promise`
implementation present.  The `prfun` package also requires an
implementation of `Object.setPrototypeOf`; it will attempt to
load this from [core-js] if not already present.   Implementations
loaded from [core-js] do not pollute the global namespace.

Portions of the API and test suite are borrowed from [bluebird], [when],
and [q].

## Usage

Unlike many other utility packages for `Promise`, `prfun` does not
pollute the global namespace.  By default `prfun` creates a `Promise`
subclass, using ES6 semantics.  This means you use it like:
```
var Promise = require('prfun'); // subclasses global.Promise
// note that global.Promise !== Promise after this point
```
or
```
var SomeOtherPromise = require( /*something*/ );
var Promise = require('prfun/wrap')( SomeOtherPromise );
// Note that the same `Promise` object will always be
// returned if given the same `SomeOtherPromise` to wrap.
```
Note that the `SomeOtherPromise` implementation must support `Promise`
subclassing using ES6 semantics.  (The implementations in [babybird],
[es6-shim], and [core-js] are known to do so.)  We will call the subclass
created by `prfun` a "`prfun` `Promise`".

According to the ES6 `Promise` spec, all `Promise` methods (including
the new ones added by `prfun`) will return an instance of the subclass
when invoked on an instance of the subclass.  That is, if you are given
a `prfun` `Promise` and you call `then` on it, the result will be
another `prfun` `Promise`.  So within your own code you can assume
that all `prfun` helper methods will be present, and they will all
return `prfun` `Promise`s which also contain all the `prfun` helper
methods.

If your code is given a promise from an outside API, and you can't
guarantee that it is a `prfun` Promise, then you can use
`Promise.resolve` in order to cast the outside promise to a `prfun`
`Promise`.   For example:
```
var Promise = require('prfun'); // this is a "prfun Promise"

function myApi(externalPromise) {
  return Promise.resolve(externalPromise).tap(function(value) {
    // we can call 'tap' after resolving the external promise
  }); // this result will also be a "prfun Promise"
}
```

In order to *modify the global `Promise` object* (instead of
subclassing), use:
```
require('prfun/smash');
// global.Promise.reduce, global.Promise.tap, etc, now exist.
```
This is how `prfun` worked by default prior to version 2.0, but it
it not recommended: stomping on global objects is never a good idea,
and future changes to the `Promise` object in ES7 or incompatible
methods added by your third-party `Promise` implementation or other
libraries could break your code in mysterious ways.

## API

- [Collections](#collections)
    - [`Promise.all`]
    - [`Promise#all`]
    - [`Promise.filter`]
    - [`Promise#filter`]
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
    - [`Promise.bind`]
    - [`Promise#bind`]
    - [`Promise#call`]
    - [`Promise#get`]
    - [`Promise#return`]
    - [`Promise#tap`]
    - [`Promise#then0`]
    - [`Promise#throw`]
    - [`Promise.defer`]
    - [`Promise#done`]
- [Try/caught/finally](#trycaughtfinally)
    - [`Promise.try`]
    - [`Promise#caught`]
    - [`Promise#finally`]
- [Method wrappers and helpers](#method-wrappers-and-helpers)
    - [`Promise.guard`]
    - [`Promise.method`]
    - [`Promise#nodify`]
    - [`Promise.promisify`]
- [Timers](#timers)
    - [`Promise.delay`]
    - [`Promise#delay`]
    - [`Promise#timeout`]
- [Generators](#generators)
    - [`Promise.async`]

### Collections

Methods of `Promise` instances and core static methods of the Promise
class to deal with collections of promises or mixed promises and
values.

#### `Promise.all(Array<dynamic>|Iterable values)` → `Promise`
[`Promise.all`]: #promiseallarraydynamiciterable-values--promise

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

#### `Promise#all()` → `Promise`
[`Promise#all`]: #promiseall--promise

Convenience method for:
```js
promise.then(function(value) {
    return Promise.all(value);
});
```

See [`Promise.all`].
<hr>

#### `Promise.filter(Array<dynamic>|Promise values, Function callback [, Object thisArg])` → `Promise`
[`Promise.filter`]: #promisefilterarraydynamicpromise-values-function-callback--object-thisarg--promise

Filters an array-like, or a promise of an array-like, using the provided
`callback` function.

Convenience method for:
```js
Promise.resolve(values).filter(callback, thisArg);
```

See [`Promise#filter`].
<hr>

#### `Promise#filter(Function callback [, Object thisArg])` → `Promise`
[`Promise#filter`]: #promisefilterfunction-callback--object-thisarg--promise

Call the given `callback` function once for each element in (a promise of)
an array which contains a promises (or a mix of promises and values), and
construct a new array of all the values for which the callback returns
(a promise of) a true value.  The `callback` function has
the signature `(item, index, array)` where `item` is the resolved
value of the promise in the input array at `index`. If any promise in
the input array is rejected the returned promise is rejected as well.

If a `thisArg` parameter is provided, it will be passed to `callback`
when invoked, for use as its `this` value.  Otherwise, the value
`undefined` will be passed for use as its `this` value.

Note that the callback is invoked on each element in the array as soon
as possible; that is, as soon as the promise for each element is
resolved the callback is invoked for that element, without waiting for
other elements to be resolved.

The behavior of `filter` matches
[`Array.prototype.filter`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter)
as much as possible.  Note that this means that non-array objects are often
accepted without error, and any object without a length field returns a
zero-length array.  For example,
`Array.prototype.filter.call(123, Object.toString)` returns `[]`.
`Promise#filter` rejects with a `TypeError` if `Array.prototype.filter`
would throw a `TypeError`.

*The original array is not modified.*

<hr>

#### `Promise.join([dynamic value...])` → `Promise`
[`Promise.join`]: #promisejoindynamic-value--promise

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

#### `Promise.map(Array<dynamic>|Promise values, Function mapper [, Object thisArg])` → `Promise`
[`Promise.map`]: #promisemaparraydynamicpromise-values-function-mapper--object-thisarg--promise

Maps an array-like, or a promise of an array-like, using the provided
`mapper` function.

Convenience method for:
```js
Promise.resolve(values).map(mapper, thisArg);
```

See [`Promise#map`].
<hr>

#### `Promise#map(Function mapper [, Object thisArg])` → `Promise`
[`Promise#map`]: #promisemapfunction-mapper--object-thisarg--promise

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

Note that the `mapper` function is invoked on each element in the
array as soon as possible; that is, as soon as the promise for each
element is resolved `mapper` is invoked for that element, without
waiting for other elements to be resolved.

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

#### `Promise.props(Object|Promise object)` → `Promise`
[`Promise.props`]: #promisepropsobjectpromise-object--promise

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

#### `Promise#props()` → `Promise`
[`Promise#props`]: #promiseprops--promise

Convenience method for:
```js
promise.then(function(value) {
    return Promise.props(value);
});
```

See [`Promise.props`].
<hr>

#### `Promise.race(Array<dynamic>|Iterable values)` → `Promise`
[`Promise.race`]: #promiseracearraydynamiciterable-values--promise

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

#### `Promise#race()` → `Promise`
[`Promise#race`]: #promiserace--promise

Convenience method for:
```js
promise.then(function(value) {
    return Promise.race(value);
});
```

See [`Promise.race`].
<hr>

#### `Promise.reduce(Array<dynamic>|Promise values, Function reducer [, dynamic initialValue])` → `Promise`
[`Promise.reduce`]: #promisereducearraydynamicpromise-values-function-reducer--dynamic-initialvalue--promise

Reduce an array-like, or a promise of an array-like, left-to-right
using the provided `reducer` function.

Convenience method for:
```js
Promise.resolve(values).reduce(reducer /*, initialValue*/);
```

See [`Promise#reduce`].
<hr>

#### `Promise#reduce(Function reducer [, dynamic initialValue])` → `Promise`
[`Promise#reduce`]: #promisereducefunction-reducer--dynamic-initialvalue--promise

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
var readFileAsync = Promise.promisify(fs.readFile, false, fs);
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

#### `Promise.reduceRight(Array<dynamic>|Promise values, Function reducer [, dynamic initialValue])` → `Promise`
[`Promise.reduceRight`]: #promisereducerightarraydynamicpromise-values-function-reducer--dynamic-initialvalue--promise

Reduce an array-like, or a promise of an array-like, right-to-left
using the provided `reducer` function.

Convenience method for:
```js
Promise.resolve(values).reduceRight(reducer /*, initialValue*/);
```

See [`Promise#reduceRight`].
<hr>

#### `Promise#reduceRight(Function reducer [, dynamic initialValue])` → `Promise`
[`Promise#reduceRight`]: #promisereducerightfunction-reducer--dynamic-initialvalue--promise

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

#### `Promise#spread([Function fulfilledHandler] [, Function rejectedHandler ])` → `Promise`
[`Promise#spread`]: #promisespreadfunction-fulfilledhandler--function-rejectedhandler---promise

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

### Utility

Shorthands for common operations.

#####`Promise.bind(dynamic thisArg)` -> `Promise`
[`Promise.bind`]: #promisebinddynamic-thisarg---promise

Sugar for `Promise.resolve(undefined).bind(thisArg);`.
See [`Promise#bind`].

<hr>

#####`Promise#bind(dynamic thisArg)` -> `Promise`
[`Promise#bind`]: #promisebinddynamic-thisarg---promise-1

Create a promise that follows this promise, but is bound to the given
`thisArg` value. A bound promise will call its handlers with `this`
set to the bound value. Additionally promises derived from a bound
promise will also be bound promises with the same `thisArg` binding as
the original promise.

<hr>

Without arrow functions that provide lexical `this`, the
correspondence between async and sync code breaks down when writing
object-oriented code. The `Promise#bind` method alleviates this.

Consider:

```js
MyClass.prototype.method = function() {
    try {
        var contents = fs.readFileSync(this.file);
        var url = urlParse(contents);
        var result = this.httpGetSync(url);
        var refined = this.refine(result);
        return this.writeRefinedSync(refined);
    }
    catch (e) {
        this.error(e.stack);
    }
};
```

The above has a direct translation:

```js
MyClass.prototype.method = function() {
    return fs.readFileAsync(this.file).bind(this)
    .then(function(contents) {
        var url = urlParse(contents);
        return this.httpGetAsync(url);
    }).then(function(result){
        var refined = this.refine(result);
        return this.writeRefinedAsync(refined);
    }).catch(function(e){
        this.error(e.stack);
    });
};
```

`Promise#bind` also has a useful side purpose --- promise handlers don't
need to share a function to use shared state:

```js
somethingAsync().bind({})
.then(function (aValue, bValue) {
    this.aValue = aValue;
    this.bValue = bValue;
    return somethingElseAsync(aValue, bValue);
}).then(function (cValue) {
    return this.aValue + this.bValue + cValue;
});
```

The above without `Promise#bind` could be achieved with:

```js
var scope = {};
somethingAsync()
.then(function (aValue, bValue) {
    scope.aValue = aValue;
    scope.bValue = bValue;
    return somethingElseAsync(aValue, bValue);
}).then(function (cValue) {
    return scope.aValue + scope.bValue + cValue;
});
```

However, there are many differences when you look closer:

- Requires a statement so cannot be used in an expression context.
- If not there already, an additional wrapper function is required to
  avoid leaking or sharing `scope`.
- The handler functions are now closures, thus less efficient and not
  reusable.

<hr>

Note that bind is only propagated with promise transformation. If you
create new promise chains inside a handler, those chains are not bound
to the "outer" `this`:

```js
something().bind(var1).then(function(){
    //`this` is var1 here
    return Promise.all(getStuff()).then(function(results){
        //`this` is undefined here
        //refine results here etc
    });
}).then(function(){
    //`this` is var1 here
});
```

If you don't want to return a bound promise to the consumers of a
promise, you can rebind the chain at the end:

```js
MyClass.prototype.method = function() {
    return fs.readFileAsync(this.file).bind(this)
    .then(function(contents) {
        var url = urlParse(contents);
        return this.httpGetAsync(url);
    }).then(function(result){
        var refined = this.refine(result);
        return this.writeRefinedAsync(refined);
    }).catch(function(e){
        this.error(e.stack);
    }).bind(); // Unbind the promise.
};
```

Rebinding can also be abused to do something gratuitous like this:

```js
Promise.resolve("my-element")
    .bind(document)
    .then(document.getElementById)
    .bind(console)
    .then(console.log);
```

The above does `console.log(document.getElementById("my-element"));`.

<hr>

#### `Promise#call(String propertyName [, Promise|dynamic arg...])` → `Promise`
[`Promise#call`]: #promisecallstring-propertyname--promisedynamic-arg--promise

This is a convenience method for doing:

```js
promise.then(function(obj){
    return obj[propertyName].call(obj, arg...);
});
```
If any of the `arg...` are Promises, they will be resolved before the method
is invoked.

<hr>

#### `Promise#get(String propertyName)` → `Promise`
[`Promise#get`]: #promisegetstring-propertyname--promise

This is a convenience method for doing:

```js
promise.then(function(obj){
    return obj[propertyName];
});
```

<hr>

#### `Promise#return(Promise|dynamic value)` → `Promise`
[`Promise#return`]: #promisereturnpromisedynamic-value--promise

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

#### `Promise#tap(Function handler)` → `Promise`
[`Promise#tap`]: #promisetapfunction-handler--promise

Convenience method for:

```js
promise.then(function(value) {
   return Promise.resolve(handler(value)).return(value);
});
```

That is, it waits for the promise, then invokes the handler with the
promised value.  It waits for any promise returned by the handler, then
returns the original value.

Common use case is to add logging to an existing promise chain:

```js
doSomething()
    .then(...)
    .then(...)
    .tap(console.log)
    .then(...)
    .then(...)
```

<hr>

#### `Promise#then0([Function onFulfilled [, Function onRejected]])` → `undefined`
[`Promise#then0`]: #promisethen0function-onFulfilled--undefined

This is identical to `Promise#then` except that it does not return
a value.  Some `Promise` implementations (for example, [babybird])
export a `then0` implementation which is substantially faster than
calling `Promise#then`.  If such an implementation is present, its
implementation will be used.  Otherwise `prfun` will provide a
shim implementation that just calls `Promise#then` and discards
the result.

This allows you to use `then0` freely in your own code whenever
you don't care about the result, and `prfun` will use the most
efficient implementation available.

<hr>

#### `Promise#throw(Promise|dynamic reason)` → `Promise`
[`Promise#throw`]: #promisethrowpromisedynamic-reason--promise

Convenience method for:

```js
promise.then(function() {
   throw reason;
});
```
...except that `reason` is first resolved, if it is a `Promise` or thenable.

Same limitations apply as with [`Promise#return`].

<hr>

#### `Promise.defer()` → `PromiseResolver`
[`Promise.defer`]: #promisedefer--promiseresolver

Create a promise with undecided fate and return a `PromiseResolver` to
control it.

The use of `Promise.defer` is discouraged---it is much more awkward
and error-prone than using `new Promise`.  It is provided only for
compatibility with older libraries like [q], [when], etc.

A `PromiseResolver` contains three fields: `promise`, `resolve`, and
`reject`.  It also contains two additional helpers, which are
implemented as getters: `resolver` and `callback`.  The `resolver`
property returns an object with only `resolve` and `reject` fields, as
in the [when] package.  The `callback` property returns a node-style
callback function with signature `(err, result)` which will invoke
`reject` and `resolve` as appropriate.  This is like the `callback`
property in [bluebird] or the result of `makeNodeResolver` in [q].

<hr>

#### `Promise#done()` → `undefined`
[`Promise#done`]: #promisedone--undefined

Terminate a chain of promises, ensuring that any unhandled rejections
are rethrown so as to trigger the top-level unhandled exception
handler (which will typically result in a message on console).

The use of `Promise#done` is discouraged---it is hoped that future
promise implementations [will provide special development tools to
track orphaned promises]
(https://github.com/domenic/promises-unwrapping/issues/19).
This method is provided for compatibility with older libraries,
and as a make-do until better debugging tools are integrated
into JavaScript engines.

<hr>

### Try/caught/finally

#### `Promise.try(Function fn [, dynamic ctx [, dynamic args...]] )` → `Promise`
[`Promise.try`]: #promisetryfunction-fn--dynamic-ctx--dynamic-args---promise

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

If provided, `ctx` becomes the `this` value for the function call.  If
it is a promise, it is first resolved.  Any `args` provided are
resolved (if they are promises) and passed as arguments to the
function call.

<hr>

#### `Promise#caught([Function ErrorClass|Function predicate...], Function handler)` → `Promise`
[`Promise#caught`]: #promisecaughtfunction-errorclassfunction-predicate-function-handler--promise

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
var request = Promise.promisify(require("request"), ['response', 'body']);

function clientError(e) {
    return e.code >= 400 && e.code < 500;
}

request("http://www.google.com").then(function(result) {
    console.log(result.body);
}).caught(clientError, function(e){
   //A client error like 400 Bad Request happened
});
```

<hr>

#### `Promise#finally(Function handler)` → `Promise`
[`Promise#finally`]: #promisefinallyfunction-handler--promise

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

`Promise#finally` works like [Q's finally method](https://github.com/kriskowal/q/wiki/API-Reference#wiki-promisefinallycallback), unless `callback` returns a rejected promise.

Note that the parallel with synchronous `finally` is not exact:
```js
// as expected:
(function() { try { return 1; } finally { throw "2"; } })(); // throws "2"
Promise.resolve(1).finally(function() { throw "2"; }); // rejects with "2"

// but:
(function() { try { return 1; } finally { return 2; } })(); // returns 2
Promise.resolve(1).finally(function() { return 2; }); // resolves to '1'

// compare:
(function() { try { return 1; } finally { 2; } })(); // returns 1
```

This asymmetry is because the `Promise` API can't distinguish the `return`
statement from an expression evaluating to a value.

<hr>

### Method wrappers and helpers

Functions for writing promise-returning methods.

#### `Promise.guard(Function|Number condition, Function fn)` → `Function`
[`Promise.guard`]: #promiseguardfunctionnumber-condition-function-fn--function

Limit the concurrency of a function `fn`.  Creates a new function
whose concurrency is limited by `condition`.  This can be useful with
operations such as [`Promise.map`], [`Promise.all`], etc that allow
tasks to execute in "parallel", to limit the number which can be
in-flight simultanously.

The `condition` argument is a concurrency limiting condition, such as
[`Promise.guard.n`].  If `condition` is a number, it will be treated
as if it were `Promise.guard.n(condition)`.

Example:
```js
// Using Promise.guard with Promise.map to limit concurrency
// of the mapFunc

var guardedAsyncOperation, mapped;

// Allow only 1 inflight execution of guarded
guardedAsyncOperation = Promise.guard(1, asyncOperation);

mapped = Promise.map(array, guardedAsyncOperation);
mapped.then(function(results) {
    // Handle results as usual
});
```

Example:
```js
// Using Promise.guard with Promise.all to limit concurrency
// across *all tasks*

var guardTask, tasks, taskResults;

tasks = [/* Array of async functions to execute as tasks */];

// Use bind() to create a guard that can be applied to any function
// Only 2 tasks may execute simultaneously.
// Note that all guarded tasks share the same condition instance
// (`Promise.guard.n(2)`) -- if we had passed `2` instead they
// would each have their own guard, which wouldn't do what we want.
guardTask = Promise.guard.bind(Promise, Promise.guard.n(2));

// Use guardTask to guard all the tasks.
tasks = tasks.map(guardTask);

// Execute the tasks with concurrency/"parallelism" limited to 2
taskResults = Promise.all(tasks);
taskResults.then(function(results) {
    // Handle results as usual
});
```

##### `Promise.guard.n(Number number)` → `Function`
[`Promise.guard.n`]: #promiseguardnnumber-number--function

Creates a condition that allows at most `number` of simultaneous executions inflight.

```js
var condition = Promise.guard.n(number);
```

#### `Promise.method(Function fn)` → `Function`
[`Promise.method`]: #promisemethodfunction-fn--function

Returns a new function that wraps the given function `fn`. The new
function will always return a promise that is fulfilled with the
original function's return value or rejected with thrown exceptions
from the original function.  It will also unwrap any arguments
(including `this`) which are promises, converting them to their
fulfilled values.

This method is convenient when a function can sometimes return
synchronously or throw synchronously.

Example without using `Promise.method`:

```js
MyClass.prototype.method = function(input) {
    if (!this.isValid(input)) {
        return Promise.reject(new TypeError("input is not valid"));
    }

    if (this.cache(input)) {
        return Promise.resolve(this.someCachedValue);
    }

    return db.queryAsync(input).bind(this).then(function(value) {
        this.someCachedValue = value;
        return value;
    });
};
```

Using `Promise.method`, there is no need to manually wrap direct
return or throw values into a promise:

```js
MyClass.prototype.method = Promise.method(function(input) {
    if (!this.isValid(input)) {
        throw new TypeError("input is not valid");
    }

    if (this.cachedFor(input)) {
        return this.someCachedValue;
    }

    return db.queryAsync(input).bind(this).then(function(value) {
        this.someCachedValue = value;
        return value;
    });
});
```

See also [`Q.promised`](https://github.com/kriskowal/q/wiki/API-Reference#wiki-qpromisedfunc),
[`when.lift`](https://github.com/cujojs/when/blob/master/docs/api.md#whenlift).

<hr>

#### `Promise#nodify([Function callback])` → `Promise`
[`Promise#nodify`]: #promisenodifyfunction-callback--promise

Register a node-style callback on this promise. When this promise is
is either fulfilled or rejected, the node callback will be called back
with the node.js convention, where error reason is the first argument
and success value is the sec ond argument. The error argument will be
`null` in case of success.

Returns back this promise instead of creating a new one. If the
`callback` argument is not a function, this method does not do
anything.

This can be used to create APIs that both accept node-style callbacks
and return promises:

```js
function getDataFor(input, callback) {
    return dataFromDataBase(input).nodify(callback);
}
```

The above function can then make everyone happy.

Promises:

```js
getDataFor("me").then(function(dataForMe) {
    console.log(dataForMe);
});
```

Normal callbacks:

```js
getDataFor("me", function(err, dataForMe) {
    if( err ) {
        console.error( err );
    } else {
        console.log(dataForMe);
    }
});
```

<hr>

#### `Promise.promisify(Function nodeFunction [, dynamic pattern [, dynamic receiver]])` → `Function`
[`Promise.promisify`]: #promisepromisifyfunction-nodefunction--dynamic-pattern--dynamic-receiver--function

Returns a function that will wrap the given `nodeFunction`. Instead of
taking a callback, the returned function will return a promise whose
fate is decided by the callback behavior of the given node
function. The node function should conform to node.js convention of
accepting a callback as last argument and calling that callback with
error as the first argument and success value(s) in the second and
following arguments.

If the `pattern` is `true`, the fulfillment value will be an array
containing the callback arguments.

If the `pattern` is not present or falsy, the fulfillment value will
be the second value passed to the callback.  (This is useful in the
common case where only a single value is provided to the callback.)

If the `pattern` is an array of names, the fulfillment value will be
an object with the callback arguments assigned to named fields in the
order given by `pattern`.

If you pass a `receiver`, the `nodeFunction` will be called as a
method on the `receiver` (that is, `this` will be set to `receiver` when
`nodeFunction` is invoked).

Example of promisifying the asynchronous `readFile` of node.js `fs`-module:

```js
var fs = require('fs');
var readFile = Promise.promisify(fs.readFile, false, fs);

readFile("myfile.js", "utf8").then(function(contents){
    return eval(contents);
}).then(function(result){
    console.log("The result of evaluating myfile.js", result);
}).caught(SyntaxError, function(e){
    console.log("File had syntax error", e);
//Catch any other error
}).catch(function(e){
    console.log("Error reading file", e);
});
```

**Tip**

Use [`Promise#spread`] with APIs that have multiple success values:

```js
var request = Promise.promisify(require('request'), true);
request("http://www.google.com").spread(function(response, body) {
    console.log(body);
}).catch(function(err) {
    console.error(err);
});
```

The above uses the [request](https://github.com/mikeal/request)
library which has a callback signature of multiple success values.

Since `prfun` version 1.0.0.
<hr>

### Timers

Methods to delay and time out promises.

#### `Promise.delay([dynamic value,] int ms)` → `Promise`
[`Promise.delay`]: #promisedelaydynamic-value-int-ms--promise

Returns a promise that will be fulfilled with `value` (or `undefined`)
after given `ms` milliseconds. If `value` is a promise, the delay will
start counting down when it is fulfilled and the returned promise will
be fulfilled with the fulfillment value of the `value` promise.

```js
Promise.delay(500).then(function(){
    console.log("500 ms passed");
    return "Hello world";
}).delay(500).then(function(helloWorldString) {
    console.log(helloWorldString);
    console.log("another 500 ms passed") ;
});
```

<hr>

#### `Promise#delay(int ms)` → `Promise`
[`Promise#delay`]: #promisedelayint-ms--promise

Convenience method for:
```js
Promise.delay(this, ms);
```

See [`Promise.delay`].

<hr>

#### `Promise#timeout(int ms [, String message])` → `Promise`
[`Promise#timeout`]: #promisetimeoutint-ms--string-message--promise

Returns a promise that will be fulfilled with this promise's
fulfillment value or rejection reason. However, if this promise is not
fulfilled or rejected within `ms` milliseconds, the returned promise
is rejected with a `Promise.TimeoutError` instance.

You may specify a custom error message with the `message` parameter.

The example function `fetchContent` tries to fetch the contents of a
web page with a 50ms timeout and sleeping 100ms between each retry. If
there is no response after 5 retries, then the returned promise is
rejected with a `ServerError` (made up error type).

```js
function fetchContent(retries) {
    if (!retries) retries = 0;
    var jqXHR = $.get("http://www.slowpage.com");
    //Cast the jQuery promise into a bluebird promise
    return Promise.resolve(jqXHR)
        .timeout(50)
        .caught(Promise.TimeoutError, function() {
            if (retries < 5) {
                return Promise.delay(100).then(function(){
                    return fetchContent(retries+1);
                });
            } else {
                throw new ServerError("not responding after 5 retries");
            }
        });
}
```

<hr>

### Generators

Using ECMAScript6 generators feature to implement better syntax for promises.

**Experimental**: Requires an environment that supports ES6 generators
and the `yield` keyword.  Node >= `0.11.2` with the `--harmony-generators`
command-line flag will work.

#### `Promise.async(GeneratorFunction generatorFunction [, int cbArg])` → `Function`
[`Promise.async`]: #promiseasyncgeneratorfunction-generatorfunction--int-cbArg--function

Takes a function that can use `yield` to await the resolution of
promises while control is transferred back to the JS event loop.  You
can write code that looks and acts like synchronous code, even using
synchronous `try`, `catch` and `finally`.  Returns a function which
returns a `Promise`.

If the optional `cbArg` is present, then `Promise.nodify` is invoked
on the result with the given (optional) argument as a parameter.

```js
// Use Promise.async to create a function that acts as a coroutine
var getRecentTodosForUser = Promise.async(function*(todosFilter, userId) {
    var todos;
    try {
        todos = yield getTodosForUser(userId);
        showTodos(todos.filter(todosFilter));
    } catch(e) {
        showError(e);
    }
});

function getTodosForUser(userId) {
    // returns a promise for an array of the user's todos
}

// Get (a promise for) the todos for user 123, and filter them
// using the `isRecentTodo` filter.
var filteredTodos = getRecentTodosForUser(isRecentTodo, 123);
```

In addition to `try`, `catch`, and `finally`, `return` also works as
expected.  In this revised example, `yield` allows us to return a
result and move error handling out to the caller.

```js
// Use Promise.async to create a function that acts as a coroutine
var getRecentTodosForUser = Promise.async(function*(todosFilter, userId) {
    var todos = yield getTodosForUser(userId);
    return todos.filter(todosFilter);
});

function getTodosForUser(userId) {
    // returns a promise for an array of the user's todos
}

// Get (a promise for) the todos for user 123, and filter them
// using the `isRecentTodo` filter.
var filteredTodos = getRecentTodosForUser(isRecentTodo, 123);

filteredTodos.then(showTodos, showError);
```

You can also use this function to implement coroutines:

```js
function PingPong() { }

PingPong.prototype.ping = Promise.async(function* (val) {
    console.log("Ping?", val)
    yield Promise.delay(500)
    this.pong(val+1)
});

PingPong.prototype.pong = Promise.async(function* (val) {
    console.log("Pong!", val)
    yield Promise.delay(500);
    this.ping(val+1)
});

var a = new PingPong();
a.ping(0);
```

Running the example with node version at least `0.11.2`:

    $ node --harmony test.js
    Ping? 0
    Pong! 1
    Ping? 2
    Pong! 3
    Ping? 4
    ...

**Caution**

Note the difference between `func1` and `func2` in the following:

```js
var thrower = Promise.method(function(msg) { throw new Error(msg); });

var func1 = Promise.async(function *() {
    try {
        return thrower("hey");
    } catch (e) {
        console.log("This line is never reached.");
    }
});

var func2 = Promise.async(function *() {
    try {
        return (yield thrower("ho"));
    } catch (e) {
        console.log("Exception is caught here!", e);
    }
});
```

When `func1` returns a `Promise`, we leave the scope of the try block.
By the time the returned `Promise` rejects with an error, we can no longer
catch it.

If you want to ensure that rejected `Promise`s get a chance to be caught,
be sure to `yield` them (which resolves the `Promise` completely) before
returning, as in `func2`.

**Tip**

You can use [`Promise.join`] to wait for multiple promises at once.

You can combine it with ES6 destructuring for some neat syntax:

```js
var getData = Promise.async(function* (urlA, urlB) {
    [resultA, resultB] = yield Promise.join(http.getAsync(urlA), http.getAsync(urlB));
    //use resultA
    //use resultB
});
```

You might wonder why not just do this?

```js
var getData = Promise.async(function* (urlA, urlB) {
    var resultA = yield http.getAsync(urlA);
    var resultB = yield http.getAsync(urlB);
});
```

The problem with the above is that the requests are not done in
parallel. It will completely wait for request A to complete before
even starting request B. In the example with [`Promise.join`] both
requests fire off at the same time in parallel.

See also [`Q.async`](https://github.com/kriskowal/q/wiki/API-Reference#wiki-qasyncgeneratorfunction).

**Legacy callbacks**

For compatibility with legacy code which uses callbacks, you can
use the optional `cbArg`, as follows:

```js
var getDataFor = Promise.async(function *(input) {
  return dataFromDataBase(input);
}, 1 /* arg #1 is optional callback */);

/* Calling this using node 'callback' syntax */
getDataFor(input, function(err, dataForMe) {
    if (err) {
        console.error( err );
    } else {
        console.log(dataForMe);
    }
});
```

<hr>


## License

Copyright (c) 2014-2018 C. Scott Ananian

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
[core-js]:  https://github.com/zloirock/core-js
[babybird]: https://github.com/cscott/babybird

[NPM1]: https://nodei.co/npm/prfun.png
[NPM2]: https://nodei.co/npm/prfun/

[1]: https://travis-ci.org/cscott/prfun.png
[2]: https://travis-ci.org/cscott/prfun
[3]: https://david-dm.org/cscott/prfun.png
[4]: https://david-dm.org/cscott/prfun
[5]: https://david-dm.org/cscott/prfun/dev-status.png
[6]: https://david-dm.org/cscott/prfun#info=devDependencies
