<title>Set.js - Sets in in JavaScript</title>

# Set.js - Sets in in JavaScript

# [[on github]](https://github.com/mbildner/Set.js)

## Sets in JavaScript

JavaScript does not have a native implementation of sets. ES6 is [expected](http://wiki.ecmascript.org/doku.php?id=harmony:simple_maps_and_sets)
expected to have sets built in, but for now JavaScript does not support sets out of the box.

### Sets polyfill

Sets are conceptually extremely simple: they are unique collections that have to have the ability to add and remove elements while maintaining their internal uniqueness, and they must be able to be combined with other, similar sets.

Figuring out what a Set polyfill should look like turned out to be super easy. In retrospect, I should have just looked up the ES6 spec listed above and cloned that API (or as much of it as ES3/5 can support, ie no native iterating). Instead, I looked to [Redis](http://redis.io/) for inspiration.

### Redis sets

Redis is an amazing database system that I've been playing around with lately. At its core, Redis supports the storage and manipulation of a few "abstract data structures", including sets.

Redis has two types of sets, sorted and unsorted. Sorted sets are much cooler, but adding sorting seemed like unnecessary chrome for a quick curiosity-satisfying project, so I stuck with the more pedestrian unsorted set.

The API they expose (detailed [here](http://redis.io/commands#set)) must include the following commands:

1. Add
2. Intersect
3. Union
4. Length
5. Pop
6. Subtract
7. Test Membership
8. Get All Members
9. Get Random Member
10. Subtract Sets

### Implementation

I completely forgot to implement Subtraction. Everything else was relatively straightforward. The basic trick underlying the sets is to take an array and make it unique without doing a ton of work. This was accomplished by taking advantage of JavaScript's super simple hash maps, or as we call them in JavaScript, objects.

For the record, there are [problems and dangers](http://www.devthought.com/2012/01/18/an-object-is-not-a-hash/) presented by treating JS objects like they're just hash maps. But I'm kind of a bad ass.

The uniquifying function at the core of the Set constructor is as follows:

```JavaScript
function makeUnique (arr) {
var obj = {};

arr.forEach(function (member) {
  obj[member] = true;
});

return Object.keys(obj);
}
```

Basically, by storing each property as a key in a hash we get JavaScript to do the hard work of figuring out which things are unique and throwing the extras away. Note that Array.prototype.forEach was used instead of Array.prototype.map. That was a *very* conscious design decision:

**map returns an array, forEach returns nothing**

As a general rule I prefer to use Array.prototype.map everywhere where you need to work with the transformation of an array. The only exception is when you want your operation to have some kind of side effect besides the creation of a new array. If the method call is going to change *ANYTHING AT ALL* use forEach to signal to other people that they cannot rely on things being the way they were before you ran your sneaky code.

In this case, the forEach call is supposed to change the intermediate storage object each time it fires its callback. We want people to know that. So we use forEach.

The rest of the implementation is equally simple. The basic trick is to take advantage internally of the fact that the set object can get its constituent members very easily, and so any operation that has to return a set can just grab that array and operate on it as necessary.

The project is reasonably well tested, [here](https://github.com/mbildner/Set.js/blob/master/sets.spec.js). The tests ensure that all methods work on at least a group of more than two members with at least two non-unique members, and that they work (or fail, if appropriate) on an empty set.

Writing a set implementation was actually a lot of fun. The two changes I would consider making are:

- Clone the EcmaScript Set API instead of using a (really awesome) foreign library.
Redis was chosen for inspiration because the project grew out of my thoughts about Redis, but I think that it would have been more productive for me to build something that mimics a real plan for this language. Not a big deal.

 - Make returns the same type as inputs.
returns are all strings since in JavaScript, all object keys are strings (any non-string keys are coerced to their string representation implicitly when you initally set them). For what it's worth, Redis sets bear the same policy (return all strings), but as before, I think a JavaScript native project might have been better targeting JavaScript thinking.
Don't forget Set subtraction. That was stupid.

### Do it yourself it's really fun

I'll be picking other data structures in the future to clone. Even a really basic one like Set turned out to be a lot of fun. I'd consider the implementation to be just about complete, except for the two problems listed above (set subtraction and non-string returns). But even with that complete, there's a ton of optimization work that would be a lot of fun to try out. But pick something that should be *really* basic and go ahead and make it yourself, it's rewarding and if you set the bar for success nice and low it's not that difficult.
