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
