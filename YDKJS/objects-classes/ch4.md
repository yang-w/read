# You Don't Know JS Yet: Objects & Classes - 2nd Edition
# Chapter 4: This Works

The value of `this` is **not determined at author time — it is determined at runtime**, based on how the function is invoked. You cannot look at a `this`-aware function and know what `this` will hold. You must find each call-site and examine *how* the function is called there.

A single `this`-aware function can be invoked in at least four different ways, each producing a different `this`.

## This Aware

A **`this`-aware function** is any function that contains the `this` keyword. If a function has no `this`, none of these rules apply to it.

`this` is effectively an **implicit parameter** — it has no declaration in the function signature, you must read the entire function body to find it, and virtually all `this`-aware code assumes `this` holds the expected value without validation.

### So What Is This?

- **Lexical scope** is *static* context — determined at author time, fixed by where variables and functions are declared.
- **`this`** is *dynamic* context — determined at runtime, based on how a `this`-aware function is invoked.
- `this` lets a function be dynamically invoked against different contexts, which is impossible with closure and lexical scope alone.

## This Is It!

```js
var point = {
    x: null,
    y: null,

    init(x,y) {
        this.x = x;
        this.y = y;
    },
    rotate(angleRadians) {
        var rotatedX = this.x * Math.cos(angleRadians) -
            this.y * Math.sin(angleRadians);
        var rotatedY = this.x * Math.sin(angleRadians) +
            this.y * Math.cos(angleRadians);
        this.x = rotatedX;
        this.y = rotatedY;
    },
    toString() {
        return `(${this.x},${this.y})`;
    },
};
```

The `this` value for a function is determined by *how* the function is invoked — not where it is defined, not what object it is a property of, not where it is called from.

### Implicit Context Invocation

```js
point.init(3,4);
```

The `point.` prefix is an *implicit context* binding: invoke `init(..)` with `this` referencing `point`.

### Default Context Invocation

```js
const init = point.init;
init(3,4);
```

No implicit context, no other `this`-assignment mechanism — **default context** applies.

- **Strict mode** (ESM, `class` blocks, transpiled code via Babel/TypeScript): `this` is `undefined`. The `this.x` reference throws `TypeError: Cannot set properties of undefined (setting 'x')`.

```js
"use strict";

var point = { /* .. */ };

const init = point.init;
init(3,4);
// TypeError: Cannot set properties of
// undefined (setting 'x')
```

- **Non-strict mode**: `this` defaults to `globalThis` (`window` in browser, `global` in Node). Properties are set on the global object, not on `point`.

```js
// no strict-mode here, beware!

var point = { /* .. */ };

const init = point.init;
init(3,4);

globalThis.x;   // 3
globalThis.y;   // 4
point.x;        // null
point.y;        // null
```

A `this`-aware function **always needs a `this`**. Invoking it without one is a mistake; strict mode makes that mistake visible immediately.

### Explicit Context Invocation

`call(..)` and `apply(..)` explicitly set `this` at the call-site:

```js
var point = { /* .. */ };

const init = point.init;

init.call( point, 3, 4 );
// or: init.apply( point, [ 3, 4 ] )

point.x;        // 3
point.y;        // 4
```

- `call(..)` — first arg is `this` context; subsequent args are passed through to the function.
- `apply(..)` — first arg is `this` context; second arg is an array of arguments.

This enables "borrowing" functions across objects:

```js
var point = {
    x: null,
    y: null,

    init(x,y) {
        this.x = x;
        this.y = y;
    },
    rotate(angleRadians) { /* .. */ },
    toString() {
        return `(${this.x},${this.y})`;
    },
};

point.init(3,4);

var anotherPoint = {};
point.init.call( anotherPoint, 5, 6 );

point.x;                // 3
point.y;                // 4
anotherPoint.x;         // 5
anotherPoint.y;         // 6
```

Any `this`-aware function can be borrowed: `point.rotate.call(anotherPoint, ..)`, `point.toString.call(anotherPoint)`.

#### Revisiting Implicit Context Invocation

An alternative to `call(..)` is adding shared function references to the target object:

```js
var point = { /* .. */ };

var anotherPoint = {
    init: point.init,
    rotate: point.rotate,
    toString: point.toString,
};

anotherPoint.init(5,6);

anotherPoint.x;         // 5
anotherPoint.y;         // 6
```

Tradeoff: requires manually modifying the target object with all shared references — verbose and error-prone. `call(..)` / `apply(..)` is often preferable.

### New Context Invocation

`new` is the fourth way to invoke a function and assign `this`. It is not inherently a `class` operation.

```js
var point = {
    // ..

    init: function() { /* .. */ }

    // ..
};

var anotherPoint = new point.init(3,4);

anotherPoint.x;     // 3
anotherPoint.y;     // 4
```

| TIP: |
| :--- |
| The `init: function() { .. }` form (function expression assigned to a property) is required for `new` to work. The concise method form `init() { .. }` *cannot* be called with `new`. |

**The 4 steps `new` performs when invoking a function:**

1. Create a brand new empty object.
2. Link the `[[Prototype]]` of that new object to the function's `.prototype` object.
3. Invoke the function with `this` set to that new empty object.
4. If the function doesn't explicitly return an object, return the new object from steps 1–3.

| WARNING: |
| :--- |
| If the function has an explicit `return { .. }`, the new object from steps 1–3 is *discarded* and the explicitly returned object is used instead. Never use `new` with functions that have explicit `return` statements returning objects. |

Illustrated as code (equivalent to `var anotherPoint = new point.init(3,4)`):

```js
var anotherPoint;
{
    // (Step 1)
    let tmpObj = {};

    // (Step 2)
    Object.setPrototypeOf(
        tmpObj, point.init.prototype
    );
    // or: tmpObj.__proto__ = point.init.prototype

    // (Step 3)
    let res = point.init.call(tmpObj,3,4);

    // (Step 4)
    anotherPoint = (
        typeof res !== "object" ? tmpObj : res
    );
}
```

| TIP: |
| :--- |
| Step 2 can also be done via `tmpObj.__proto__ = point.init.prototype`, or inside the object literal: `tmpObj = { __proto__: point.init.prototype }`. |

Comparison:

```js
var point = { /* .. */ };

// this approach:
var anotherPoint = {};
point.init.call(anotherPoint,5,6);

// can instead be approximated as:
var yetAnotherPoint = new point.init(5,6);
```

Use `new` only to create a new object. For invoking against an *existing* object, use explicit context:

```js
point.rotate.call( anotherPoint, /*angleRadians=*/Math.PI );

point.toString.call( yetAnotherPoint );
// (5,6)
```

### Review This

**Precedence order for `this` context assignment (highest to lowest):**

1. **`new`** — creates and sets a new `this`.
2. **`call(..)` / `apply(..)`** — explicitly sets `this`.
3. **Implicit context** — object reference at call-site (e.g., `point.init(..)`).
4. **Default** — strict mode: `undefined`; non-strict: `globalThis`.

When multiple rules could apply (e.g., `new point.init.call(..)`), the highest-precedence rule wins.

## An Arrow Points Somewhere

All the call-site rules above apply to **regular functions**. Arrow functions (`=>`) are different.

```js
const clickHandler = evt =>
    evt.target.matches("button") ?
        this.theFormElem.submit() :
        evt.stopPropagation();
```

### Where's The Call-site?

Consider this event binding:

```js
var infoForm = {
    theFormElem: null,
    theSubmitBtn: null,

    init() {
        this.theFormElem =
            document.getElementById("the-info-form");
        this.theSubmitBtn =
            theFormElem.querySelector("button[type=submit]");

        this.theSubmitBtn.addEventListener(
            "click",
            this.clickHandler,
            false
        );
    },

    // ..
}
```

`this.clickHandler` is a reference to a function object — it is not a call-site. The actual call-site is hidden inside the browser's event system, and might look like:

```js
// ..
eventCallback( domEventObj );
// ..
```

or:

```js
// ..
eventCallback.call( domElement, domEventObj );
```

Most click-handler implementations use `.call(..)` and set the DOM element as `this`. Since DOM buttons don't have a `theFormElem` property, `this` inside `clickHandler` will be wrong.

### Fixing `this`

**Option 1: Lexical variable capture**

```js
var context = this;

this.submitBtn.addEventListener(
    "click",
    function handler(evt){
        return context.clickHandler(evt);
    },
    false
);
```

`handler(..)` is not `this`-aware. It captures `context` as a lexical variable. Inside `context.clickHandler(evt)`, the *implicit context* rule (#3) applies. Whatever `this` the library sets on `handler`, it is irrelevant.

This pattern is called **"lexical this"** — `this` behaving like a lexical variable instead of a dynamic context binding.

| TIP: |
| :--- |
| Prefer `var context = this` over `var self = this`. `this` is not a "self" reference to the function — it is the context for that specific invocation. |

**Option 2: Arrow function (preferred)**

```js
this.submitBtn.addEventListener(
    "click",
    evt => this.clickHandler(evt),
    false
);
```

### Lexical This

In an `=>` arrow function, `this` **is not a keyword** — it is treated as a normal lexical variable. Arrow functions define no `this` of their own; `this` resolves by walking up the lexical scope chain until a regular function's `this` is found.

```js
function outer() {
    console.log(this.value);

    var inner = () => {
        console.log(this.value);
    };

    return inner;
}

var one = {
    value: 42,
};
var two = {
    value: "sad face",
};

var innerFn = outer.call(one);
// 42

innerFn.call(two);
// 42   <-- not "sad face"
```

`innerFn.call(two)` — the explicit context assignment is **ignored** for arrow functions. `this` inside `inner` resolves to `outer`'s `this`, which was set to `one`.

| NOTE: |
| :--- |
| Arrow functions have `call(..)` / `apply(..)` / `bind(..)` on them, but these are silent no-ops for `this` assignment purposes. |

When `this` is encountered inside an `=>` function, JS walks up the lexical scope chain — skipping other `=>` functions (which also have no `this`) — until it finds a regular function with a `this` in scope.

#### Back To The Button

```js
this.submitBtn.addEventListener(
    "click",
    evt => this.clickHandler(evt),
    false
);
```

The `=>` arrow function's `this` is the `this` of the surrounding regular function at the time the `addEventListener` call runs.

The primary design purpose of `=>` arrow functions is "lexical this" — not shorter syntax.

| TIP: |
| :--- |
| If you need "lexical this", use an `=>` arrow function. If you don't need "lexical this", `=>` may not be the right tool. |

#### Confession Time

For regular functions: where and how a function is *written* does not determine `this`. For `=>` arrow functions: *where* the function is written matters, because it determines which lexical scope's `this` is captured.

```js
const clickHandler = evt =>
    evt.target.matches("button") ?
        this.theFormElem.submit() :
        evt.stopPropagation();

this.submitBtn.addEventListener("click",clickHandler,false);
```

Or inline:

```js
this.submitBtn.addEventListener(
    "click",
    evt => evt.target.matches("button") ?
        this.theFormElem.submit() :
        evt.stopPropagation(),
    false
);
```

When using an `=>` arrow function, `this` is exactly the `this` of the surrounding function's invocation context. The call-site question shifts to *how the enclosing function was invoked*.

**The nuance:** the call-site that matters is the nearest function invocation in the current call stack *that actually assigns a `this` context*. Arrow function call-sites never assign `this`, so they are skipped. Walk up the call stack until you find a `this`-assigning invocation.

#### Find The Right Call-Site

```js
globalThis.value = { result: "Sad face" };

function one() {
    function two() {
        var three = {
            value: { result: "Hmmm" },

            fn: () => {
                const four = () => this.value;
                return four.call({
                    value: { result: "OK", },
                });
            },
        };
        return three.fn();
    };
    return two();
}

new one();          // ???
```

Call-stack analysis:

```
four         |
three.fn     |
two          | (this = globalThis)
one          | (this = {})
[ global ]   | (this = globalThis)
```

- `four()` is `=>` — no `this` assignment, skip.
- `three.fn()` is `=>` — no `this` assignment, skip.
- `two()` is a regular function, called with no context, no explicit binding → *default context* rule (#4), non-strict → `this = globalThis`.
- `this.value` inside `four` resolves to `globalThis.value` → `{ result: "Sad face" }`.

`four.call({ value: { result: "OK" } })` is ignored because `four` is an arrow function.

### This Is Bound To Come Up

`bind(..)` creates a new function with `this` **preset and fixed**, immune to `call(..)`, `apply(..)`, or implicit context at the call-site:

```js
this.submitBtn.addEventListener(
    "click",
    this.clickHandler.bind(this),
    false
);
```

This is called **"hard binding"**.

#### Hardly New

A simplified illustration of `bind(..)`:

```js
function bind(fn,context) {
    return function bound(...args){
        return fn.apply(context,args);
    };
}
```

| NOTE: |
| :--- |
| This is not the full implementation of `bind(..)` — it illustrates one portion of the behavior. |

**`bind(this)` vs `=>` arrow function — they are NOT the same:**

```js
function fakeBind(fn,context) {
    return (...args) => fn.apply(context,args);
}

function thisAwareFn() {
    console.log(`Value: ${this.value}`);
}

var obj = {
    value: 42,
};

var f = thisAwareFn.bind(obj);
var g = fakeBind(thisAwareFn,obj);

f();            // Value: 42
g();            // Value: 42

new f();        // Value: undefined
new g();        // TypeError: g is not a constructor
```

- `new f()`: `new` overrides the hard-bound `this`, re-binding it to a new empty object. `value` is `undefined` on that object. This confirms `new` (#1) has higher precedence than explicit binding (#2).
- `new g()`: throws `TypeError` — **`=>` arrow functions cannot be used with `new`**. An arrow function has no `this` at all; `new` is disallowed, not just ignored.

An `=>` arrow function is **not** syntax for `bind(this)`. A hard-bound function can still have its `this` overridden by `new`; an arrow function cannot be `new`-invoked at all.

| NOTE: |
| :--- |
| Arrow functions have `call(..)`, `apply(..)`, and `bind(..)` as pass-through no-ops, but `new` is an exception — it throws rather than silently ignoring. |

### Losing This Battle

Every approach to pre-fixing `this` (arrow functions, `bind(this)`, `var context = this`) produces a **new function reference**, not an in-place modification of an existing one. This has costs:

- Memory allocation for each new function object.
- Garbage collection pressure when old references are discarded (can cause GC pauses, visible as animation jitter).
- For event listeners: removing an event listener requires a reference to the *exact same function* that was added. If re-creating function references, you must track them explicitly.

#### Pre-Binding Function Contexts

Pre-binding all `this`-aware methods using `=>` or `bind(this)` is a code smell when applied broadly:

```js
// approach 1: arrow function class fields (ick)
class Point2d {
    x = null
    y = null
    getDoubleX = () => this.x * 2
    toString = () => `(${this.x},${this.y})`

    constructor(x,y) {
        this.x = x;
        this.y = y;
    }
}

var point = new Point2d(3,4);
var anotherPoint = new Point2d(5,6);

var f = point.getDoubleX;
var g = anotherPoint.toString;

f();            // 6
g();            // (5,6)
```

```js
// approach 2: bind in constructor (double ick)
class Point2d {
    x = null
    y = null

    constructor(x,y) {
        this.x = x;
        this.y = y;
        this.getDoubleX = this.getDoubleX.bind(this);
        this.toString = this.toString.bind(this);
    }
    getDoubleX() { return this.x * 2; }
    toString() { return `(${this.x},${this.y})`; }
}

var point = new Point2d(3,4);
var anotherPoint = new Point2d(5,6);

var f = point.getDoubleX;
var g = anotherPoint.toString;

f();            // 6
g();            // (5,6)
```

Both approaches use `this` but completely remove its dynamicism. Each instance gets its own copy of the methods — the `[[Prototype]]` chain sharing is defeated.

#### Take A More Critical Look

When all you need is a fixed, predictable context, **lexical scope closure is the more appropriate tool**:

```js
function Point2d(px,py) {
    var x = px;
    var y = py;

    return {
        getDoubleX() { return x * 2; },
        toString() { return `(${x},${y})`; }
    };
}

var point = Point2d(3,4);
var anotherPoint = Point2d(5,6);

var f = point.getDoubleX;
var g = anotherPoint.toString;

f();            // 6
g();            // (5,6)
```

No `this`, no corner cases, no complexity. When you want all function behaviors to have a fixed, predictable context, lexical variables and scope closure are simpler and more performant than `this` + hard-binding.

## Variations

### Indirect Function Calls

```js
var point = {
    x: null,
    y: null,

    init(x,y) {
        this.x = x;
        this.y = y;
    },
    rotate(angleRadians) { /* .. */ },
    toString() { /* .. */ },
};

var init = point.init;
init(3,4);                  // broken!
```

Other patterns that produce the same broken result (indirect invocation → default context rule):

```js
(1,point.init)(3,4);        // broken!
```

The comma series expression `(1,point.init)` evaluates to the function reference. Invoking that reference indirectly matches *default context* rule (#4): `globalThis` in non-strict, `undefined` (throws) in strict.

```js
(()=>point.init)()(3,4);    // broken!
```

The IIFE pattern also produces default context:

```js
(function(){
    // `this` assigned via "default" rule
})();
```

Exception — JS grammar treats `(someIdentifier)(..)` as equivalent to `someIdentifier(..)` (not an indirect call):

```js
(point.init)(3,4);   // same as point.init(3,4) — implicit context rule applies
```

### Accessing `globalThis`

Indirect function invocation combined with `new Function(..)` or `eval(..)` can escape strict-mode for `this` assignment. A common use case was polyfilling `globalThis` before it was standardized:

```js
"use strict";

var gt = new Function("return this")();
gt === globalThis;                      // true
```

`new Function(..)` always creates a function in global scope, always in non-strict mode.

Similarly, using the comma operator with `eval(..)`:

```js
"use strict";

function getGlobalThis() {
    return (1,eval)("this");
}

getGlobalThis() === globalThis;      // true
```

| NOTE: |
| :--- |
| `eval("this")` is sensitive to strict-mode, but `(1,eval)("this")` is not, and reliably gives `globalThis` in any program. |

Both `new Function(..)` and `(1,eval)(..)` are blocked by Content-Security-Policy (CSP) restrictions that disallow dynamic code evaluation. A CSP-safe alternative using a getter on `Object.prototype`:

```js
// Adapted from: https://mathiasbynens.be/notes/globalthis#robust-polyfill
function getGlobalThis() {
    Object.defineProperty(Object.prototype,"__get_globalthis__",{
        get() { return this; },
        configurable: true
    });
    var gt = __get_globalthis__;
    delete Object.prototype.__get_globalthis__;
    return gt;
}

getGlobalThis() === globalThis;      // true
```

The JS specification guarantees that a getter defined on the global object (or `Object.prototype`, which the global object inherits from) runs with `this` set to `globalThis`, regardless of strict-mode.

### Template Tag Functions

Template literals can be "tagged" with a prefix function that receives the parsed string parts and interpolated values:

```js
function tagFn(/* .. */) {
    // ..
}

tagFn`actually a function invocation!`;
```

No `(..)` invocation syntax — just the tag function before the template literal (whitespace allowed but uncommon). The function is still invoked.

Object method form:

```js
var someObj = {
    tagFn() { /* .. */ }
};

someObj.tagFn`also a function invocation!`;
```

`this` assignment for tag functions mirrors regular call-site rules:

- `` tagFn`..` `` → *default context* rule (#4)
- `` someObj.tagFn`..` `` → *implicit context* rule (#3)

`new` and `call(..)` / `apply(..)` forms are not possible with tag functions.

[^globalThisPolyfill]: "A horrifying globalThis polyfill in universal JavaScript"; Mathias Bynens; April 18 2019; https://mathiasbynens.be/notes/globalthis#robust-polyfill ; Accessed July 2022
