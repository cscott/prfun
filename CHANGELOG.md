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
