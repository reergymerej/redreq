# Red(ux) Req(uest Helpers and Whatnot)

When performing AJAX calls with Redux, you typically want three actions.

* start the request
* it was ok
* it failed

You'll typically want to keep track of some state for these things too.

* the request is pending
* the entity that was fetched
* the request is complete
* the error

And you probably want little action factories you can use so actions are always
created the same way.

This package will help generate these for your with almost no effort.
