<title>FIxing Google's Broken Tabs</title>

# Fixing Google's Broken Tabs
# [on github](https://gist.github.com/mbildner/c30fdc6b61d2a2cb19ae)

If you, like me, prefer to use your keyboard for everything computer-related, then Google's search page tab-ordering probably makes you crazy.

There was a time, way back when, when after you searched for something on Google, you could hit tab a few times, get to the result you wanted to see, hit enter, and be taken straight to that page. Great workflow: **A+** to Google's UX people.
Fast forward to 2015, and Google's basic search screen is full of all kinds of bells and whistles between the search bar and the results panel. Now when I tab, I have to swim through this thicket of links and buttons before I can get to my results. Terrible workflow: **F** for the UX here.

In other words, the markup went from something like this:

```HTML
<input id="google-search-box"/>
<a href="firstresult.com">One</a>
<a href="secondresult.com">Two</a>
<a href="thirdresult.com">Three</a>
<a href="fourthresult.com">Four</a>
<a href="fifthresult.com">Five</a>
```

To something like this:

```HTML
<input id="google-search-box"/>
<a href="some google link">Stay in google!</a>
<a href="some other google link">NEVER lEAVE US</a>
<a href="google promotional page">this link might not be here tomorrow lol</a>
<a href="srsly stahp">why is this happening to me? there is no joy left in the world</a>
<a href="firstresult.com">One</a>
<a href="secondresult.com">Two</a>
<a href="thirdresult.com">Three</a>
<a href="fourthresult.com">Four</a>
<a href="fifthresult.com">Five</a>
```


## Life doesn't have to be this hard.

Looking at the page, it's "obvious" how the tabbing behavior got broken:

- tabs move focus on the page
- tabbing moves vertically, from top to bottom
- there's more stuff between the top (search bar) and the bottom (your results)
- tabbing has to move through all that stuff before getting to your results


That's of course "obvious", but as some readers will know it's not strictly speaking correct.

## tabindex ftw

The order in which you tab through items on a page _does_ default to the behavior described above, but it can easily be [overridden](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/tabIndex), by giving html elements their own custom `tabindex` property. Waaaaat?

Theoretically, a site's whole tabbing order could be managed this way. In most cases though, it makes sense to set `tabindex` for special elements in a workflow, eg the first field you want users to focus on, or maybe to walk users through a set of inputs with a non-obvious inputs. Luckily, `tabindex` is not an all-or-nothing proposal. If you give some elements indices and not others, your browser will move through the defined sequence **first** and then move through the rest of the page in "obvious" default order described above (top to bottom).

The improved markup would look something like this (indices start at 1 here):

```HTML
<input id="google-search-box"/>
<a href="some google link">Stay in google!</a>
<a href="some other google link">NEVER lEAVE US</a>
<a href="google promotional page">this link might not be here tomorrow lol</a>
<a href="srsly stahp">why is this happening to me? there is no joy left in the world</a>
<a href="firstresult.com" tabindex="1">One</a>
<a href="secondresult.com" tabindex="2">Two</a>
<a href="thirdresult.com" tabindex="3">Three</a>
<a href="fourthresult.com" tabindex="4">Four</a>
<a href="fifthresult.com" tabindex="5">Five</a>
```


## How did it get broken?

For what it's worth, I don't *necessarily* think this is the best way to fix the page. My bet is that it's better to lay out the page in a way that makes the obvious user behavior work by default. In other words, it's probably better to move most of the special Google'y links to somewhere other than **right between** the search bar and the search results.

Presumably Google's UX people understand that, and have chosen to interfere with the natural workflow anyway. My guess is that they are working on a mandate to try to keep traffic inside the Google ecosystem, and letting users fall-through to search results if they don't find what they're looking for there. I can't really say that I blame them if this is in fact what's happening. Product designers are supposed to make their users' lives easier, but they're also supposed to build and improve their companies, and changing the search page UX (still Google's star product) to try to capture more user-time makes a ton of sense as a way to do that.

Still, it's super annoying.

## Fix it!

Unless Google decides to fix the workflow, the simplest fix is to set the tabbing order manually. I've written a little snippet to do that [here](https://gist.github.com/mbildner/c30fdc6b61d2a2cb19ae). This is how it looks run through the Google Closure compiler (the irony is not lost on me):

```JavaScript

(function(c){function d(a,b){a.setAttribute("tabindex",b.toString());return b}var e=[].slice.call(c.querySelectorAll("#rso h3 a")),f=e.length;[].slice.call(c.querySelectorAll("[tabindex]")).forEach(function(a){var b=+a.getAttribute("tabindex")+f;d(a,b)});e.forEach(function(a,b){d(a,b+1)})})(document);

```


This will not per-se fix the problem, since the old tabbing order will come right back the next time the page's content refreshes (which may happen before reload, I don't know how google's homepage search results work).

A longer term client-side fix would be putting this into a browser extension, so that the code gets run (and the page gets fixed) every tine you hit the results page. Definitely something I'd consider for another Sunday morning.
