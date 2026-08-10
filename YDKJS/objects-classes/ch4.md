# You Don't Know JS Yet: Objects & Classes — 2nd Edition
# Chapter 4: This Works

The value of `this` is **not determined at author time for regular functions — it is determined at runtime**, based on how the function is invoked. You generally cannot look only at a `this`-aware regular function and know what `this` will hold. You must find its call-site and examine *how* the function is called there.

A single `this`-aware regular function can be invoked in several different ways, each potentially producing a different `this`.

## This Aware

A **`this`-aware function** is a function whose behavior depends on a `this` expression.

For regular functions, `this` acts much like an **implicit parameter**. It does not appear in the function's declared parameter list; its value is supplied according to how the function is invoked.

Arrow functions are different: they do not create their own `this` binding. A `this` expression inside an arrow function resolves through the surrounding lexical environment.

### So What Is This?

- **Lexical scope** is *static* context — determined by where variables and functions are declared.
- **`this` in a regular function** is *dynamic* context — normally determined at runtime from how that function is invoked.
- **`this` in an arrow function** comes from the surrounding lexical environment because an arrow function does not create its own `this` binding.
- Dynamic `this` lets the same regular function operate against different contexts without closing over one specific object.

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

For a regular function, `this` is determined by *how the function is invoked* — not merely by where the function was defined or where its reference happens to be stored.

### Implicit Context Invocation

```js
point.init(3,4);
```

The `point.` portion of the call provides an *implicit context*: `init(..)` is invoked with `this` referencing `point`.

### Default Context Invocation

Consider extracting the method:

```js
const init = point.init;
init(3,4);
```

The second statement is now a plain function call. There is no `point.` receiver and no other mechanism explicitly supplying `this`.

In **strict mode**, `this` remains `undefined`:

```js
"use strict";

var point = {
    init(x,y) {
        this.x = x;
        this.y = y;
    }
};

const init = point.init;
init(3,4);

// TypeError: Cannot set properties of
// undefined (setting 'x')
```

In a **non-strict regular function**, a `null` or `undefined` `this` value is substituted with the global `this` value, normally accessible through `globalThis`:

```js
// non-strict regular function

function init(x,y) {
    this.x = x;
    this.y = y;
}

init(3,4);

globalThis.x;   // 3
globalThis.y;   // 4
```

`globalThis` is the standard cross-environment way to access the global `this` value. In browser environments it commonly corresponds to a `WindowProxy`; Node.js and other hosts provide their own global environment semantics. Prefer `globalThis` over environment-specific names such as `window` or `global` when writing portable code.

A `this`-aware regular function therefore needs to be invoked in a way that supplies the intended context. Strict mode is especially useful because an accidental context-free invocation commonly fails immediately instead of silently modifying global state.

### Explicit Context Invocation

`call(..)` and `apply(..)` can explicitly supply `this` at the call-site:

```js
var point = {
    x: null,
    y: null,

    init(x,y) {
        this.x = x;
        this.y = y;
    }
};

const init = point.init;

init.call(point,3,4);
// or:
init.apply(point,[3,4]);

point.x;        // 3
point.y;        // 4
```

- `call(..)` — the first argument supplies `this`; subsequent arguments are passed individually.
- `apply(..)` — the first argument supplies `this`; the second argument is an array-like collection of arguments.

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

point.init.call(anotherPoint,5,6);

point.x;                // 3
point.y;                // 4
anotherPoint.x;         // 5
anotherPoint.y;         // 6
```

The same technique works with other compatible `this`-aware functions:

```js
point.rotate.call(anotherPoint,Math.PI);
point.toString.call(anotherPoint);
```

#### Revisiting Implicit Context Invocation

Instead of using `call(..)`, shared function references can be assigned to another object:

```js
var anotherPoint = {
    init: point.init,
    rotate: point.rotate,
    toString: point.toString,
};

anotherPoint.init(5,6);

anotherPoint.x;         // 5
anotherPoint.y;         // 6
```

Because the eventual call is `anotherPoint.init(..)`, the implicit context is `anotherPoint`.

This approach requires modifying the target object with the shared function references. Depending on the design, explicit invocation with `call(..)` or a prototype/class relationship may be more appropriate.

### New Context Invocation

`new` is another way to invoke a constructable function and assign `this`. It is not limited to `class` syntax.

```js
var point = {
    init: function(x,y) {
        this.x = x;
        this.y = y;
    }
};

var anotherPoint = new point.init(3,4);

anotherPoint.x;     // 3
anotherPoint.y;     // 4
```

The `function` expression form is significant here. A concise method definition:

```js
var point = {
    init(x,y) {
        // ..
    }
};
```

is not constructable and therefore cannot be invoked with `new`.

### What `new` Does

For an ordinary constructable function, `new` can be understood approximately as performing these steps:

1. Create a new object.
2. Link the new object's `[[Prototype]]` to the constructor function's `.prototype`.
3. Invoke the constructor with `this` referring to the new object.
4. If the constructor returns an object or function, use that explicit result; otherwise, return the newly created object.

For example:

```js
function Point(x,y) {
    this.x = x;
    this.y = y;
}

var point = new Point(3,4);
```

can be approximated conceptually as:

```js
var point;

{
    let tmpObj = {};

    Object.setPrototypeOf(
        tmpObj,
        Point.prototype
    );

    let res = Point.call(tmpObj,3,4);

    let returnedObject =
        res !== null &&
        (
            typeof res === "object" ||
            typeof res === "function"
        );

    point = returnedObject ? res : tmpObj;
}
```

This is an explanatory approximation rather than an implementation of the ECMAScript specification.

Importantly:

```js
function Example() {
    this.value = 42;
    return null;
}

var obj = new Example();

obj.value;      // 42
```

`null` does **not** replace the newly constructed object, even though:

```js
typeof null === "object";   // true
```

That's why simply checking `typeof res === "object"` is not enough to model constructor-return behavior.

Use `new` when the intent is to construct a new object. To invoke a function against an *existing* object, explicit context is usually clearer:

```js
point.rotate.call(anotherPoint,Math.PI);
```

## Review This

For ordinary regular functions, a useful precedence model for `this` is:

1. **`new` invocation** — constructs a new object and supplies it as `this`.
2. **Explicit invocation** — `call(..)`, `apply(..)`, or related explicit mechanisms supply `this`.
3. **Implicit invocation** — the receiver in `obj.method(..)` supplies `this`.
4. **Plain/default invocation** — strict mode leaves `this` as `undefined`; non-strict functions perform `this` substitution, commonly resulting in `globalThis` for a missing context.

Bound functions introduce an additional wrinkle, discussed later.

These call-site rules describe **regular functions**. Arrow functions follow a different model.

# An Arrow Points Somewhere

Arrow functions (`=>`) do **not have their own `this` binding**.

That difference is fundamental.

```js
function outer() {
    console.log(this.value);

    var inner = () => {
        console.log(this.value);
    };

    return inner;
}
```

The `this` inside `inner` comes from the surrounding lexical environment.

### Where's The Call-Site?

Consider an event binding:

```js
var infoForm = {
    theFormElem: null,
    theSubmitBtn: null,

    init() {
        this.theFormElem =
            document.getElementById("the-info-form");

        this.theSubmitBtn =
            this.theFormElem.querySelector(
                "button[type=submit]"
            );

        this.theSubmitBtn.addEventListener(
            "click",
            this.clickHandler,
            false
        );
    },

    clickHandler(evt) {
        // ..
    }
};
```

Notice the important expression:

```js
this.clickHandler
```

That expression merely retrieves a function reference. It does **not** invoke the function.

The actual invocation happens later inside the event system.

When a callback API controls the invocation, you need to understand what context, if any, that API supplies to a regular callback function.

### Fixing `this`

One solution is lexical variable capture:

```js
var context = this;

this.theSubmitBtn.addEventListener(
    "click",
    function handler(evt) {
        return context.clickHandler(evt);
    },
    false
);
```

`handler(..)` does not depend on its own `this`. Instead, it closes over the lexical variable `context`.

Then:

```js
context.clickHandler(evt);
```

uses `context` as the implicit receiver of `clickHandler`.

### Arrow Function

An arrow function makes this pattern more direct:

```js
this.theSubmitBtn.addEventListener(
    "click",
    evt => this.clickHandler(evt),
    false
);
```

The arrow does not establish a new `this`. The `this` expression in its body comes from the surrounding lexical environment.

## Lexical `this`

Consider:

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
// 42
```

Calling:

```js
outer.call(one)
```

supplies `one` as `outer`'s `this`.

The arrow function is created inside that environment, so the `this` expression in `inner` resolves to the surrounding `this`.

Later:

```js
innerFn.call(two);
```

cannot give the arrow function a new `this`.

The result remains:

```js
42
```

Similarly, `apply(..)` and `bind(..)` cannot establish a different `this` binding for an arrow function.

They can still affect ordinary arguments:

```js
const add = (a,b) => a + b;

add.call(null,2,3);      // 5
```

but the supplied `thisArg` has no effect on an arrow's `this`.

### Finding an Arrow's `this`

Do **not** determine an arrow function's `this` by walking up the runtime call stack.

Instead, ask:

> In what lexical environment was this arrow function created?

Then examine the surrounding lexical scopes.

For example:

```js
function makeGetter() {
    return () => this.value;
}

var getter = makeGetter.call({
    value: 42
});

getter();
// 42

getter.call({
    value: 100
});
// still 42
```

The important invocation is:

```js
makeGetter.call({ value: 42 });
```

That establishes `makeGetter`'s `this`.

The arrow created inside `makeGetter` uses that surrounding `this`. Calling the arrow later does not replace it.

Nested arrows work the same way:

```js
function outer() {
    return () => {
        return () => this.value;
    };
}

var first = outer.call({
    value: 42
});

var second = first();

second();
// 42
```

Neither arrow introduces its own `this` binding, so the `this` expression ultimately resolves through the surrounding lexical environments to the `this` supplied to `outer`.

### Where an Arrow Is Written Matters

For a regular function, where the function is written generally does not determine its `this`; its invocation does.

For an arrow function, lexical placement matters because the arrow does not establish a new `this` binding.

For example:

```js
function setup() {
    this.theSubmitBtn.addEventListener(
        "click",
        evt => this.clickHandler(evt),
        false
    );
}
```

The `this` inside the arrow is the `this` available in `setup`'s environment.

So the relevant question becomes:

> How was `setup(..)` invoked?

If:

```js
formController.setup();
```

then `setup` receives `formController` as its implicit `this`, and the arrow created during that invocation uses the surrounding `this`.

## This Is Bound To Come Up

`bind(..)` creates a **bound function**:

```js
this.theSubmitBtn.addEventListener(
    "click",
    this.clickHandler.bind(this),
    false
);
```

The resulting function remembers the supplied `this` value for ordinary calls.

This is often called **hard binding**.

A simplified conceptual illustration is:

```js
function fakeBind(fn,context) {
    return function bound(...args) {
        return fn.apply(context,args);
    };
}
```

This is only an illustration. Native `bind(..)` has additional behavior, especially when a bound function is invoked with `new`.

### `bind(this)` Is Not the Same as an Arrow

Consider:

```js
function thisAwareFn() {
    console.log(`Value: ${this.value}`);
}

var obj = {
    value: 42,
};

var f = thisAwareFn.bind(obj);

f();
// Value: 42
```

A native bound function can still be constructable if its target function is constructable:

```js
new f();
```

When a bound function is used with `new`, the bound `this` value is ignored in favor of the newly constructed instance.

Arrow functions are different:

```js
var g = () => {
    // ..
};

new g();
// TypeError: g is not a constructor
```

Arrow functions are not constructable.

So an arrow function is **not** merely shorthand for:

```js
someFunction.bind(this)
```

The mechanisms are different.

## Losing This Battle

Creating wrappers or bound callbacks generally produces new function objects:

```js
obj.method.bind(obj)
```

and:

```js
(...args) => obj.method(...args)
```

each create function objects.

That matters particularly for APIs requiring the exact same callback reference when unregistering:

```js
const handler = evt => controller.handle(evt);

button.addEventListener("click",handler);

// later:
button.removeEventListener("click",handler);
```

This will **not** work as intended:

```js
button.addEventListener(
    "click",
    evt => controller.handle(evt)
);

button.removeEventListener(
    "click",
    evt => controller.handle(evt)
);
```

Those two arrow expressions create different function objects.

### Pre-Binding Function Contexts

Class fields can define per-instance arrow functions:

```js
class Point2d {
    x = null;
    y = null;

    getDoubleX = () => this.x * 2;

    toString = () =>
        `(${this.x},${this.y})`;

    constructor(x,y) {
        this.x = x;
        this.y = y;
    }
}
```

Another pattern binds prototype methods in the constructor:

```js
class Point2d {
    x = null;
    y = null;

    constructor(x,y) {
        this.x = x;
        this.y = y;

        this.getDoubleX =
            this.getDoubleX.bind(this);

        this.toString =
            this.toString.bind(this);
    }

    getDoubleX() {
        return this.x * 2;
    }

    toString() {
        return `(${this.x},${this.y})`;
    }
}
```

Both approaches can be useful when a method must retain an instance-specific context, especially when passing methods as callbacks.

But they have a structural consequence: each instance receives its own function object instead of simply using one shared prototype method.

Whether that tradeoff is appropriate depends on the API and design.

### Take A More Critical Look

If all behavior should permanently operate over one fixed set of private values, lexical closure may be a simpler design:

```js
function Point2d(px,py) {
    var x = px;
    var y = py;

    return {
        getDoubleX() {
            return x * 2;
        },

        toString() {
            return `(${x},${y})`;
        }
    };
}

var point = Point2d(3,4);
var anotherPoint = Point2d(5,6);

var f = point.getDoubleX;
var g = anotherPoint.toString;

f();        // 6
g();        // (5,6)
```

No dynamic `this` behavior is needed here. The methods close over `x` and `y`.

This is not universally "better" or "more performant" than using `this`; it is a different design with different allocation, encapsulation, inheritance, and optimization characteristics.

Use lexical closure when lexical state matches the problem. Use dynamic `this` when dynamically selecting an invocation context is useful.

# Variations

## Indirect Function Calls

Consider:

```js
var point = {
    x: null,
    y: null,

    init(x,y) {
        this.x = x;
        this.y = y;
    }
};

var init = point.init;

init(3,4);      // context lost
```

Retrieving the function into `init` separates the function reference from the original object.

Other expressions can similarly produce a function value that is then called without the original receiver.

For example:

```js
(1,point.init)(3,4);
```

The comma expression evaluates to the function value, and the resulting invocation does not retain `point` as the receiver.

By contrast:

```js
(point.init)(3,4);
```

still preserves the reference needed for `point` to be the call's receiver.

Parentheses alone do not strip the method's implicit context.

## Accessing `globalThis`

Modern JavaScript provides:

```js
globalThis
```

as the standard cross-environment way to access the global `this` value.

Use it directly:

```js
console.log(globalThis);
```

Older JavaScript sometimes used techniques such as:

```js
Function("return this")()
```

or indirect `eval(..)` to discover the global object.

These techniques are primarily of historical interest now. Dynamic code evaluation also introduces security concerns and may be blocked by Content Security Policy.

Prefer:

```js
globalThis
```

### Historical Note: `Function(..)` and Strict Mode

The `Function` constructor creates functions that execute in the global scope rather than capturing the surrounding lexical scope:

```js
const fn = new Function(
    "return typeof localVariable;"
);
```

A dynamically created function also does **not inherit strict mode** merely because the surrounding code is strict:

```js
"use strict";

const fn = new Function(
    "return this;"
);

fn() === globalThis;
// true
```

However, saying that `Function(..)` is *always* non-strict would be inaccurate.

Its generated body can explicitly enable strict mode:

```js
const strictFn = new Function(`
    "use strict";
    return this;
`);

strictFn();
// undefined
```

So the more precise rule is:

> A function created with the `Function` constructor does not inherit strict mode from its surrounding source. Its generated body is non-strict unless that body itself enables strict mode.

Because dynamically constructing executable source code carries security and performance concerns, it should not be used merely as a replacement for ordinary function declarations or expressions.

## Template Tag Functions

Template literals can be tagged:

```js
function tagFn(/* .. */) {
    // ..
}

tagFn`actually a function invocation!`;
```

Although there are no `(..)` parentheses, `tagFn` is being invoked.

A property reference can also be used as a tag:

```js
var someObj = {
    tagFn() {
        console.log(this === someObj);
    }
};

someObj.tagFn`also a function invocation!`;
// true
```

For regular tag functions, receiver behavior follows the same general reference semantics as ordinary calls:

```js
tagFn`..`
```

has no object receiver, whereas:

```js
someObj.tagFn`..`
```

uses `someObj` as the receiver.

# This, Reviewed

The most important distinction in this chapter is between **dynamic `this`** and **lexical `this` behavior**.

For a regular function:

```js
function identify() {
    return this.name;
}
```

the invocation determines `this`:

```js
var one = {
    name: "One",
    identify
};

var two = {
    name: "Two",
    identify
};

one.identify();         // "One"
two.identify();         // "Two"

identify.call(one);     // "One"
identify.call(two);     // "Two"
```

For an arrow function:

```js
function makeIdentifier() {
    return () => this.name;
}
```

the arrow does not create a new `this` binding:

```js
var identifyOne =
    makeIdentifier.call({
        name: "One"
    });

identifyOne();
// "One"

identifyOne.call({
    name: "Two"
});
// still "One"
```

That's the dividing line to remember:

**Regular function:** determine `this` from the invocation.

**Arrow function:** determine `this` from the surrounding lexical environment in which the arrow was created.

And when you don't need dynamic context at all, ordinary lexical variables and closure may be the clearer tool.