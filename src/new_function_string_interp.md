<title>Interpolating Strings in JavaScript</title>

# Thoughts on JavaScript string templating engines
### JS templating engines are awesome.

JavaScript templating engines have become incredibly important parts of the web development ecosystem. Conceptually, they are simple tools: templating engines typically take strings as inputs and replace parts of them with data from some provided data structure. Most languages come with some version of this tool built in to a native String class. JavaScript does not (althoug node exposes one in the util module).

For the most part, the value of this kind of tool is obvious: string interpolation lets developers render computer-readable data structures (models) into human readable ui elements (view). Conceptually these tools are orthogonal to the MVC pattern, but it's easy to see how critical an interpolation engine is to a usable MVC system: if you are responsible for manually moving your models into your view, coding is going to suck:

```JavaScript

var h1 = document.createElement('h1');
var h1Str = 'Welcome to our site, ' + userData.name + '!';

if (userData.age < 21) {
  h1Str += '\nThanks for checking us out, unfortunately our whiskey website is for users ages 21+ only!';
}
else {
  h1Str += '\nLet\'s get you some booze!';
}

h1Str.textContent = h1Str;
document.body.appendChild(h1);

```

This is the work necessary to render a single tag on the page. It's not the end of the world, but it scales terribly, is profoundly brittle, and makes your HTML useless to a developer or designer trying to figure out how the markup will eventually look. Which is why we use templating engines:

```HTML
<h1>Welcome to our site, {{ userData.name }}!</h1>

<p ng-if="userData.age<21">
  Thanks for checking us out, unfortunately our whiskey website is for users ages 21+ only!
</p>
<p ng-if="userData.age>21">
  Let's get you some booze!
</p>
```
This is pretty readable, and lets anyone reading the markup get at least a decent idea of how the final thing should look. Not bad.

## How they work

Most templating engines tend to make use of the same basic API and implementation patterns:

### API
1. Expose a compile function that takes a string and returns a function that takes a data structure
2. Let the function returned from step 1 take a data structure and return a compiled string

It's a super basic and highly readable pattern. [Underscore](http://underscorejs.org/#template) uses, it, as does [Angular](https://docs.angularjs.org/api/ng/service/$interpolate) (and others).  One common modification is to combine the two steps into one, where the user provides a string and data structure to one templating function, which returns a rendered string. [Mustache](https://github.com/janl/mustache.js) works this way, for example, but this is just a shorthand for the same technique.

### Implementation

Implementations also follow a basic pattern, but are differentiated in how they work under the hood.
JS template engines tend to follow one basic pattern:

1. Run the raw string against a regex to identify candidates for replacement
2. Extract data from a context and replace candidates with their corresponding data

The first half (regex searches) tend to be about the same everywhere. The second half however, has two wildly divergent implementations, one is good, one is not.

One way that templating engines work is to write a JS parser in JavaScript, and to ship it with the templating engine. This is difficult, and relatively expensive, and kind of a pain in the ass to write. I've been working sporadically on this kind of [parsing engine](https://github.com/mbildner/parser.js) for a while now, with mixed results (expect a follow up post on that later).

Conceptually though the idea is simple: write code that can read strings that mimic code, and figure out how to traverse a data structure to extract the data the user wants:

```JavaScript
// assume for convenience that the user will only be accessing things with dots
function parse (accessStr, contextObj) {
  // get an array of the nested accessors we'll use
  var accessKeys = accessStr.split('.');

  // iteratively read nested accessors
  var value = accessKeys.reduce(function (scope, key) {
    return scope[key];
  }, contextObj);

  return value;
}

var user = {
  contact: {
    addresses: {
      home: {
        city: 'Manhattan',
        state: 'New York'
      }
    }
  }
};

var scope = { user: user };

var userCityStr = parse('user.contact.addresses.home.city', scope);
console.log(userCityStr); // Manhattan
```

The other basic pattern is to make a call to the JS eval engine to directly interpret a string as JavaScript, typically by creating a function using the `new Function` format:

```JavaScript
// can use dot and bracket accessors
function parse (accessStr, contextObj) {
  // the body of our template function
  var funcStr = 'var value; with (contextObj) { value = ' + accessStr + ' }; return value;';
  // this calls into the JS eval engine
  var func = new Function('contextObj', funcStr);
  var value = func(contextObj);
  return value;
}

var user = {
  contact: {
    addresses: {
      home: {
        city: 'Manhattan',
        state: 'New York'
      }
    }
  }
};

var scope = { user: user };

var userCityStr = parse('user.contact.addresses.home.city', user);
console.log(userCityStr); // Manhattan
```

This is actually a much cooler idea! It's taking JavaScript and using it to dynamically generate new code to be run at runtime. In other words, these templating engines are using macros, making their code [homoiconic](http://en.wikipedia.org/wiki/Homoiconicity). It's also highly dangerous and relatively inefficient.

You'll notice that the above code never makes a call to `eval`, so what am I talking about? The answer is that making use of the JS function constructor is an indirect way of using the interpreter. This makes intuitive sense: when you write out a function in your code, that code has to be read and interpreted before it produces a function in memory that can be used by your program. In order to generate a function with new behavior on the fly, you need to make that same call to the interpreter.

Anyone with some cultural knowledge of JavaScript has probably heard that ["Eval is evil"](http://archive.oreilly.com/pub/a/javascript/excerpts/javascript-good-parts/bad-parts.html). Like everything else, there's some disagreement about the topic, but I think there are good reasons to discourage direct accesses of the JS interpreter, as it tends to make your code less safe and slower. At this point it is also contrary to accepted idiomatic JS standards, which means your code will look less familiar to the community, and be less trusted for inclusion in third party applications.

Using `with` is another cool but [bad practice](http://www.yuiblog.com/blog/2006/04/11/with-statement-considered-harmful/): the `with` operator lets you reset JavaScript's typical function scoping, by setting as the scope for your code whatever variable it is provided. Messing with your scope like that makes code less reliable for humans to read, and slows down the JS engine, which now has to check multiple scope chains for any read inside that code. It's a bad thing, don't use it. But it sure is cool.

### In the wild

Most responsible templating engines use the former technique to interpolate strings. Angular is the library that I'm most familiar with, and it has its own fairly complicated and highly optimized parser. [It's really cool](https://github.com/angular/angular.js/blob/master/src/ng/parse.js#L956).

Unfortunately, there are also libraries that make use of the eval technique. In particular, I know of a DEPRECATED tool, jQuery-tmpl [that works this way](https://github.com/BorisMoore/jquery-tmpl/blob/21d2a8f3b3ad5c2e09548558be8d3005352b70c4/jquery.tmpl.js#L317).

## Conclusion: JS templating engines are so cool!

I've been working sporadically on a JS parser to build out a templating engine. It's a ton of fun, and has been a great learning experience. I highly recommend you try it. More importantly though, go find something cool that you use every day and try to make one yourself. I guarantee that even if you don't get a working model off the ground that it will enrich your understanding of the tool itself and the ecosystem in which it operates. GO HAVE FUN.
