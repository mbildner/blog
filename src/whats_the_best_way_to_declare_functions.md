<title>Function Declaration in JS</title>

# Function Declaration in JS

## How do I function?

There are two commonly accepted ways of getting a function ready for use in JavaScript, which I'll call `declaration` and `assignment` syntaxes.

This dichotomy isn't *exactly* correct, but it's close enough to be useful for now.

## Declaration Syntax

JS permits the creation of functions using the familiar function declaration syntax:

```JavaScript

function doThings(arg){
  return 'omg hi guys';
}

```

## Assignment Syntax

```JavaScript

var doThings = function(arg){
  return 'omg hi guys';
};

```

## What's the difference?

For most purposes, these two syntaxes do the same thing, they make a function callable by using the reference `doThings` from other code.

So either way, we can do this:


```JavaScript

var hiGuysString = doThings();

console.log(hiGuysString); // 'omg hi guys'

```

The major difference is that the declaration syntax permits the function to be used at a point in the code before it is written down.

So you can do cool stuff like this:


```JavaScript

var name = getName();

console.log(name); // 'moshe bildner'

function getName() {
  return 'moshe bildner';
}

```

This trick **does not** work for assignment syntax, so this does not work:

```JavaScript

var name = getName();

/*

LOL NOPE - you get an error:

Uncaught ReferenceError: getName is not defined

*/

console.log(name); // 'moshe bildner'

var getName = function () {
  return 'moshe bildner';
}

```

Assignment syntax takes advantage of some fun scoping rules to let you write some surprisingly clean code.

A lot of libraries insist on using assignment syntax, since it's a little more explicit.
*(see [underscore](http://underscorejs.org/docs/underscore.html) and [angular](http://underscorejs.org/docs/underscore.html) for two giant examples)*

Fine.

I still prefer Declaration syntax, since it permits you to move implementation code to below the actual interesting API, like this:

```JavaScript

function Person(){
  var wallet = new Wallet(100);
  var bankAccount = new BankAccount(10000);

  // API:
  this.getPayment(amount){
    var source = pickPaymentSource(amount);
    return source.get(amount);
  };

  // Implementation:
  function pickPaymentSource(amount){
    if (wallet.hasAtLeast(amount)){
      return wallet;
    }
    else if (bankAccount.hasAtLeast(amount)){
      return bankAccount;
    }

    throw new Error('lol too broke sorry');
  }

}
```

As a consumer of the `Person` constructor (*please* don't say `class`) I should only know how to ask for a payment. It is up to the object to decide how (or whether) it will fulfill that payment.
This is the classic example given to explain the [Law of Demeter](https://en.wikipedia.org/wiki/Law_of_Demeter), and it's a great illustration.

Consider the alternative, if we use assignments:

```JavaScript

function Person(){
  var wallet = new Wallet(100);
  var bankAccount = new BankAccount(10000);

  // Implementation:
  var pickPaymentSource = function(amount){
    if (wallet.hasAtLeast(amount)){
      return wallet;
    }
    else if (bankAccount.hasAtLeast(amount)){
      return bankAccount;
    }

    throw new Error('lol too broke sorry');
  }

  // API:
  this.getPayment(amount){
    var source = pickPaymentSource(amount);
    return source.get(amount);
  };

}
```

Now I have to read through a ton of boilerplate code that explains *how* this object works, instead of getting to skip to *what* it can do.

This is suboptimal.

# Aha, but surprises:

So far so good, Declarations are simpler and awesome. Yes they behave a little magically, but they are super useful and not hard to reason about.

But there is one unintended consequence of this generally awesome flexibility, which is that function declarations mutate the environment record in a way that you cannot know without knowing that the function is being declared:


```JavaScript

if (userIsLoggedOut){
  myApi.blowAwayTheData();
}


function userIsLoggedOut(){
  return false;
}

```

HAHAHA FUCK YOU. Your user just lost their data for no good reason. Ruby handles this problem with more magic:

```Ruby

if user_is_logged_out {
  my_api.blow_away_the_data()
}

def user_is_logged_out()
  return false
end

```

This sytax is **extremely** similar, but in this case ruby treats all references to a method as an invocation of it, so your data is safe.

JS is getting us into trouble here because of a combination of two tricks:

1. Declaration hoisting:
  - when I declare a function, it is available inside its parent's scope, not just beneath the place it is defined.

2. Everything is an object! --- sort of
  - in JS, functions are objects, which means that we are conducting a boolean test on an object, which in JS (and most languages) evaluates to true


For anyone mad at JavaScript, note that Python does the same thing to functions:

```Python

def user_is_logged_out():
  return false

if user_is_logged_out:
  my_api.blow_away_the_data()

```

It's not 100% the same thing as the JS example, since you are forced to declare the function ahead of time, but Python has no problem with the easy-to-miss boolean test of a function that lets us shoot ourselves in the foot here.


# Declarations are Statements:

The danger we're seeing here arises from the fact that function declarations are a case of JavaScript expressions, instead of JavaScript statements, as they might seem.
Expressions are chunks of code that can be used anywhere your code expects a reference to a value, whereas statements guide execution of the program that operates on expressions.

Wat?

The classic demonstration of this difference is given using conditional branching:

Statements make you build more verbose code with bigger detours in your branches:

```JavaScript

function userIsLoggedOut(){
  var tokenIsExpired = false;

  if (myApi.checkToken()){
    tokenIsExpired = true;
  }
  
  return tokenIsExpired;

}

```

This code is pretty imperative, but gets the job done.

Here that is as an expression:

```JavaScript

function userIsLoggedOut(){
  return !!myApi.checkToken();
}

```

This is a goofy trivial case, but:

1. I have *absolutely* seen the former syntax in production code.
2. It is not always obvious to figure out how to get to the simple expression of your code

Getting to expressions that can handle lots of abuse is a lot of what good functional abstractions provide. Haskell users love their [maybe](https://hackage.haskell.org/package/base-4.8.1.0/docs/Data-Maybe.html), and you can even get it in [JavaScript](http://sean.voisen.org/blog/2013/10/intro-monads-maybe/)... but it's less popular (for a lot of reasons).

Function declarations are expressions that can be used - in place - in your code, which is extremely powerful, and an *extremely* popular JavaScript pattern:

```JavaScript

$.get('/some/remote/resource', function(response){
  alert('here it is!', JSON.stringify(response));
});

```

This only works because declaring a function makes that function immediately usable in the place it is declared. It is usable as a reference. Ruby uses blocks (and procs, and lambdas) to get the same effect, since methods have the reference-is-invocation behavior that we mentioned above.

Python also has lambdas, but they suck. They're just awful.

But the golden rule of an expression is that it should only provide a value, and not mutate state.

```JavaScript

var userIsLoggedOut = false;

// if you do this I will kill you
var name = todayIsTuesday() ? (userIsLoggedOut = true) : 'moshe';

```

Again, this is an obviously contrived case, but I have seen examples of expressions mutating state in production.

*(NB: there are times and places where clever code is unavoidable, and in the bowels of some complicated library I'm okay with it, but please document and test your weird shit.)*

The point is, when we use our Declaration syntax, we are actually using an expression that subtly mutates the state of our application.

# Conclusion: Declarations are still better

To my mind, it's still ok to use Declaration syntax, for one critical reason:

**I believe it makes my code easier to read**

As much as I hate surprise state changes, function declaration behavior is well enough documented that I should reasonably expect a competent developer to know how to read a file with "private" methods declared.

More importantly, forcing developers - no matter how experienced they are - to slog through all of my implementation before getting to my API is a crappy deal, and I think burns more of their cognitive resources than risking a surprise variable being introduced.

With that said, I think it's worth understanding what's going on in your environment, and really coming to grips with your language of choice.

If you have an opinion on which syntax is better, I'd love to hear it!
