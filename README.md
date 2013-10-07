EXOS - Unobtrusive Behaviour Layer
==================================
The purpose of Exos (as in Exosphere, the outermost layer of the atmosphere) is to provide a
behaviour layer for webapps that is 1.non-binding, 2.unobtrusive and 3.performant.

A good number of frameworks have excellent behaviour management, but most tend to bind events directly
to DOM elements. This approach will necessarily violate 1, likely violate 2 (to some degree) and
potentially violate 3.

So why is non-binding good?

Apart from the fact that it facilitates - and promotes - 2 and 3 above, there are some key benefits:

1. When the DOM changes, behaviours are automatically inherited without executing any code. Change it
as often as you like - you never have to assign event handlers to any new element.
2. Single elements can easily have multiple behaviours, again without having to explicitly register
handlers against them.
3. Fault tolerance. If your script binds directly to the DOM and the DOM changes, the script must be
able to handle such change gracefully (eg not error because a className has changed). Not binding
means that in such an instance, the behaviour will cease to work but the script will not.

Some benefits of Exos:

1. All event handlers managed in one place.
2. On-the-fly add/remove/update of behaviours.
3. Simple selector-based syntax (preferred, using MooTools Slick parser - full config objects also
supported)

Usage

This example registers a behaviour such that whenever an element with className "hello" is clicked,
it will fire myFunction.

Exos.enable([{'.hello': {'click' : myFunction}}]);