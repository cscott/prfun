# prfun 2.1.5 (2018-01-06)
* Allow functions created by `Promise.async` to accept legacy node-style
  callback arguments.
* Switch to `eslint`, update `mocha`, and ensure we test up to node 9.

# prfun 2.1.4 (2016-05-05)
* Add a cache to ensure that only a single `prfun` `Promise` class is
  constructed even when using the wrapper interface.
* Update npm dev dependencies.

# prfun 2.1.3 (2015-12-11)
* Optimize the `Promise` subclass constructor to avoid costly overhead
  in ES5 environments.  The slow ES6 path is only used if necessary
  for correctness (or if the native Promise implementation uses ES6
  class syntax).
* Added `Promise#then0` to the API, which is a shim when a native
  `Promise#then0` is not available.  Some `Promise` implementations
  provide this method, which is much more efficient than calling
  `Promise#then` and discarding the result.
* Used `Promise#then0` in internal implementations where appropriate,
  including `Promise.async` (where the use of generators can now yield
  better performance than chaining promises in the usual way).

# prfun 2.1.2 (2015-11-20)
* Ensure that `Promise.async` always returns a `Promise`.
  (Previously if the function returned immediately without yielding
  the result would not be wrapped in a promise.)

# prfun 2.1.1 (2014-04-28)
* Improve compatibilty with environments missing a definition of
  `Object.setPrototypeOf`.

# prfun 2.1.0 (2015-04-27)
* Switch from `es6-shim` to `core-js` by default.
* Fix our subclass code to follow the latest ES6 specification.
* Work around some bugs in native Promise implementations to allow
`prfun` to use native promises.

# prfun 2.0.0 (2015-04-23)
* Breaking change: `prfun` now creates a subclass of `Promise` by
  default, instead of smashing the global `Promise`.  This only works
  if your `Promise` implementation properly supports the ES6 subclass
  semantics -- `es6-shim` is known to implement the ES6 spec properly.
  To smash the global `Promise` like in the bad old days, use
  `require('prfun/smash')`.

# prfun 1.0.2 (2014-11-06)

* Fix potential resource leak in `Promise#timeout`.

# prfun 1.0.1 (2014-09-25)

* Added `Promise#tap`, `Promise#filter`.
* Bug fix to `promisify` with named arguments (an array of names as
  second parameter).

# prfun 1.0.0 (2014-07-15)

* Breaking change to `promisify` API: following the lead of
`denodeify` in `rsvp` and `q` version 2, the `promisify` function has
been changed to eliminate the magic variadic argument inference.  The
`promisify` function now takes an explicit second parameter, `names`.
If the `names` parameter is missing or falsy, then a single argument
is used to resolve the promise.  If the `names` parameter is `true`,
then the promise is resolved with an array of the variadic arguments
to the callback.  If the `names` parameter is an array, the array
names the variadic arguments, and the promise is resolved with an
object containing fields with those names.

See [comments on bower's issue #1403](https://github.com/bower/bower/pull/1403#issuecomment-48784169)
and [this commit on q's v2 branch](https://github.com/kriskowal/q/commit/d5bea58bfb0fc091beb52dd91fe78506851bc7c5)
for more details.

# prfun 0.1.0 (2014-03-30)
* Initial release.
