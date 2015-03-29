<title>Promise.js - Promises in JavaScript</title>

# Promise.js
# [[on github]](https://github.com/mbildner/promise.js)

## Promises in JavaScript

### Wat are Promises?

*TL;DR Promises are a functional abstraction to manage asynchronous control flow. BOOM.*

Promises are a really cool technique for managing async stuff in your code. The technique gives you a `promise` object that has a method for adding callbacks to be called after some asynchronous code runs. These promises can be chained together, meaning that we can finally flatten out our dreaded [nested callbacks](https://www.google.com/search?q=callback+hell+javascript) into a clean, understandable chain of calls. Promises help turn this:

```JavaScript
getUserId(function (err, userId) {
  if (err) {
    alert('problem making your async call');
  }
  else {
    getUserInfo(userId, function (err, userInfoObj) {
      if (err) {
        alert('problem making your async call');
      }
      else {
        saveUserInfo(userInfoObj, function (err, saveWorked) {
          if (err) {
            alert('problem making your async call');
          }
          else if (!err && saveWorked) {
            alert('congratulations, your data is saved on the server');
          }
          else if (!err && !saveWorked) {
            alert('oh no! your data got all gatted');
          }
        });
      }
    });
  }
});
```
into this:

```JavaScript
getUserId()
  .then(getUserInfo)
  .then(saveUserInfo)
  .then(function (saveWorked) {
    if (saveWorked) {
      alert('congratulations, your data is saved on the server');
    }
    else {
      alert('oh no! your data got all gatted');
    }
  })
  .catch(function (error) {
    alert('problem making your async call');
  });
```

In fairness to the rat's nest of callbacks above, nested callbacks don't *have* to be that bad. There are absolutely [ways of improving](http://andrewkelley.me/post/js-callback-organization.html) the readability and organization of that code using better practices and vanilla js (ie no 3rd party frameworks). But something like this seems to be the reflex of a lot of people writing JavaScript, and honestly it makes sense - JS has amazing support for in-line functions, and thinking asynchronously is hard. Given those two facts it makes a lot of sense that people sort of muddle their way through async tasks like this by nesting a bunch of anonymous functions and maybe adding some comments.

(Also to be fair, the promises example could be made almost equally rats-nesty if you try hard enough. I'll show you how later!)

Luckily, there is a better way!

### Why do YOU care?


You care because dealing with async stuff is really really hard, and any tool that makes your code easier to write and - much more importantly - *easier to read* will make you a better programmer.

Promises are a great abstraction that encourage much more linear code. They do this by inverting the typical pattern for handling callbacks.

With any (single threaded event-looped) asynchronous code, the basic model you'll use is to give your code instructions to do something that would otherwise force it to wait, as well as instructions for what to do when that waiting time is over. Doing that for one activitiy really isn't bad, but when you want need to make the same kind of tasks with the information you get back from that call things start getting messy.

The problem is that you have to give your program instructions for what to do when it's finished with some task as well as instructions for how to handle a failure BEFORE you are even finished describing the task itself. Visually, you are literally writing your callback code *inside* your async function. I can think of very few other examples where people write complicated functions as the arguments for other functions, and there's a great reason: it's a terrible pattern and you shouldn't do it and it makes me sad.

### How do Promises Help

Promises help by permitting you to decouple your function call and your callback provisions. Promise based async code produces asynchronous calls that make some non-blocking call like normal, but provide their own pipeline for getting the resulting return values to your callback functions. It's worth thinking about what that comment means:

> Promises work exactly the same as regular callbacks, all that changes is the pattern and order for providing callbacks.

That's really nifty! There are a bunch of really cool libraries out there that offer their own special dsl for writing async functionality that then compiles into JavaScript. But with promises, you get to write plain old JS the entire time. No special magic is taking place, only some very clever engineering.

When you use a promise library in JS, you write async functions that follow the following pattern:

1. Take one predefined library function as the callback for your async call
2. Return one predefined library function that takes one function which will take whatever information is passed to the function from step one, and returns itself

The trick to this pattern is that now you are making your function calls BEFORE you ever write a callback. Since you only ever have one function that gets used as your callback, you pass it in pro-forma into async calls, and write your callbacks where they belong: AFTER your function body.

### Promises in the Wild
There are a few well-known promise libraries in common use right now. The best known is probably [Q, by Kris Kowal](https://github.com/kriskowal/q). It's the one I use for most of my node projects, and I really like it. There's also [BlueBird, by Petka Antonov](https://github.com/petkaantonov/bluebird). I have never used it, but I've read a lot of hype about it. For my browser work, I tend to work almost exclusively in AngularJS these days, which provides its own promise library (because Angular) - [$q](https://docs.angularjs.org/api/ng/service/$q). It has a relatively tiny feature set and a simple API, which actually made it a GREAT way to get introduced to promises! It can feel a touch limiting though compared to some of the more robust tools out there.

### Promises as Spec

Promises are actually part of the ES6 specification, which means that they are going to be included natively in your browser soon (protip® they are already there in most modern browsers!). [MDN has a great write up explaining the spec](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise).

### Why I Wrote my Own

I wrote my own Promise library partly because I like doing that, but specifically because promises felt like they did a lot of magic and were super hard for me to understand. Most cool libraries I use make synchronous work simpler - which is super important, but relatively easy to understand. Promises, by contrast, work in the domain of time. They feel like they're changing something much more fundamental than they are, the control flow of your program. Of course, they ARE NOT DOING THAT, but promises well-written can really transform how it feels to write asynchronous code in JavaScript. I wrote my own implementation sort of to convince myself that there's no magic involved, just some really cool tricks.

## Thoughts for the Future

You should be using promises. If you don't want to use promises, then you should be using something like [async](https://github.com/caolan/async) that provides some utility functions for dealing with tricky async code. But you should be using promises. Some part of me really would love to use a compile-to-js language with stronger native support for asyncronicity (eg [iced-coffeescript](http://maxtaco.github.io/coffee-script/)), but overall I've decided that I'd rather stick with actual JS for most things. Barring better native support, promises are the best way you can get leverage for writing asynchronous code for the browser (or node). They provide a *very* simple interface for doing things out of order in time (because async...), and they do it with ZERO MAGIC.

Take a peek at my [promise implementation](https://github.com/mbildner/promise.js). This was a fast and dirty weekend approach - but I'm considering following Kris Kowal's [spec](https://github.com/kriskowal/uncommonjs/blob/master/promises/specification.md) to build out a more robust version in the future.

# But seriously, use Promises
