# You Don't Know JS Yet: Objects & Classes - 2nd Edition
# Chapter 2: How Objects Work

The underlying behaviors of objects are collectively referred to as the "metaobject protocol" (MOP)[^mop]. Understanding the MOP lets you both predict default object behavior and override it.

## Property Descriptors

Each property on an object is internally described by a "property descriptor" — itself an object (metaobject) with attributes that control how the property behaves.

Retrieve a property descriptor with `Object.getOwnPropertyDescriptor(..)` (ES5):

```js
myObj = {
    favoriteNumber: 42,
    isDeveloper: true,
    firstName: "Kyle"
};

Object.getOwnPropertyDescriptor(myObj,"favoriteNumber");
// {
//     value: 42,
//     enumerable: true,
//     writable: true,
//     configurable: true
// }
```

Define a new property using a descriptor with `Object.defineProperty(..)` (ES5):

```js
anotherObj = {};

Object.defineProperty(anotherObj,"fave",{
    value: 42,
    enumerable: true,     // default if omitted
    writable: true,       // default if omitted
    configurable: true    // default if omitted
});

anotherObj.fave;          // 42
```

If an existing property has not already been marked as non-configurable (`configurable: false`), it can always be re-defined/overwritten using `Object.defineProperty(..)`.

| WARNING: |
| :--- |
| Operations that "copy" or "duplicate" properties (e.g., `...` spread, `Object.assign(..)`) do simple `=` style access and assignment — they do NOT copy property descriptors. Descriptor attributes like `writable` or `enumerable` are silently ignored. |

Define multiple properties at once with their own descriptors:

```js
anotherObj = {};

Object.defineProperties(anotherObj,{
    "fave": {
        // a property descriptor
    },
    "superFave": {
        // another property descriptor
    }
});
```

### Accessor Properties

An "accessor property" (getter/setter) uses a descriptor with `get()` / `set(..)` instead of `value`:

```js
{
    get() { .. },    // function to invoke when retrieving the value
    set(v) { .. },   // function to invoke when assigning the value
    // .. enumerable, etc
}
```

- A getter looks like a property access (`obj.prop`) but invokes the `get()` method under the covers.
- A setter looks like a property assignment (`obj.prop = value`) but invokes `set(..)`.

```js
anotherObj = {};

Object.defineProperty(anotherObj,"fave",{
    get() { console.log("Getting 'fave' value!"); return 123; },
    set(v) { console.log(`Ignoring ${v} assignment.`); }
});

anotherObj.fave;
// Getting 'fave' value!
// 123

anotherObj.fave = 42;
// Ignoring 42 assignment.

anotherObj.fave;
// Getting 'fave' value!
// 123
```

### Enumerable, Writable, Configurable

The three additional descriptor attributes (beyond `value` / `get()` / `set(..)`):

- **`enumerable`**: Controls whether the property appears in enumerations — `Object.keys(..)`, `Object.entries(..)`, `for..in` loops, `...` object spread, `Object.assign(..)`. Set to `false` to hide a property from iteration/copying.

- **`writable`**: Controls whether a `value` assignment via `=` is allowed. `writable: false` makes a property read-only. However, as long as the property is still `configurable: true`, `Object.defineProperty(..)` can still change the `value` attribute directly.

- **`configurable`**: Controls whether the property descriptor itself can be re-defined. `configurable: false` locks the descriptor — further `Object.defineProperty(..)` calls on it will fail. A non-configurable property can still be assigned new values via `=`, as long as `writable: true`.

## Object Sub-Types

### Arrays

Arrays are objects specifically intended to be **numerically indexed**.

- Still objects, so named string properties are technically legal — but strongly discouraged.
- Defined with `[ .. ]` literal syntax.
- Zero-indexed: first element is at index `0`.
- String property names that look like integers are treated as integer indexes.

```js
myList = [ 23, 42, 109 ];

myList[0];      // 23
myList[1];      // 42

// "2" works as an integer index here, but it's not advised
myList["2"];    // 109
```

The `length` property is automatically maintained:

```js
myList = [ 23, 42, 109 ];

myList.length;   // 3

// "push" another value onto the end of the list
myList.push("Hello");

myList.length;   // 4
```

| WARNING: |
| :--- |
| Array `length` is NOT a getter. Accessing it does not trigger a recomputation — the JS engine maintains it internally and efficiently. Caching `length` before a loop (a former "best practice") has been an anti-pattern for at least 10 years. Just access `length` directly. |

#### Empty Slots

Assigning to an index more than one position beyond the current end of the array leaves in-between slots "empty" — not `undefined`, but empty:

```js
myList = [ 23, 42, 109 ];
myList.length;              // 3

myList[14] = "Hello";
myList.length;              // 15

myList;                     // [ 23, 42, 109, empty x 11, "Hello" ]

// looks like a real slot with a
// real `undefined` value in it,
// but beware, it's a trick!
myList[9];                  // undefined
```

Empty slots are silently skipped by array methods like `map(..)`. Never intentionally create them.

### Functions

Functions are objects. In addition to being callable, they can hold named properties.

Two pre-defined properties useful for meta-programming:

```js
function help(opt1,opt2,...remainingOpts) {
    // ..
}

help.name;          // "help"
help.length;        // 2
```

- `name`: the function's declared name.
- `length`: count of explicitly defined parameters, up to (but not including) a parameter with a default value or a rest parameter (`...`).

#### Avoid Setting Function-Object Properties

Prefer a `Map` (or `WeakMap`) keyed by the function instead of adding properties directly to a function object:

```js
extraInfo = new Map();

extraInfo.set(help,"this is some important information");

// later:
extraInfo.get(help);   // "this is some important information"
```

## Object Characteristics

These behaviors are configurable at the whole-object level:

- `extensible`
- `sealed`
- `frozen`

### Extensible

By default, all objects are extensible (new properties can be added). `Object.preventExtensions(..)` disables this:

```js
myObj = {
    favoriteNumber: 42
};

myObj.firstName = "Kyle";                  // works fine

Object.preventExtensions(myObj);

myObj.nicknames = [ "getify", "ydkjs" ];   // fails
myObj.favoriteNumber = 123;                // works fine
```

- In non-strict mode: the assignment silently fails.
- In strict mode: a `TypeError` is thrown.

### Sealed

// TODO

### Frozen

// TODO

## Extending The MOP

// TODO

## `[[Prototype]]` Chain

Every object has an internal `[[Prototype]]` linkage pointing to another object. This forms a chain used for property lookup delegation.

- Do not confuse `[[Prototype]]` (internal linkage) with the public `prototype` property on functions — they are distinct.
- By default, all objects are `[[Prototype]]`-linked to `Object.prototype`.
- The chain ends when a `[[Prototype]]` is `null` — `Object.prototype`'s own `[[Prototype]]` is `null`.

```js
myObj = {
    favoriteNumber: 42
};

myObj.toString();                         // "[object Object]"
myObj.hasOwnProperty("favoriteNumber");   // true
```

`myObj` has no `toString` or `hasOwnProperty` properties of its own. The lookup **delegates** up the `[[Prototype]]` chain to `Object.prototype`, where they are found. This is "prototypal inheritance" (more precisely: delegation).

### Inherited Properties from `Object.prototype`

All objects `[[Prototype]]`-linked (directly or indirectly) to `Object.prototype` inherit:

- `constructor`
- `__proto__`
- `toString()`
- `valueOf()`
- `hasOwnProperty(..)`
- `isPrototypeOf(..)`

**`hasOwnProperty(..)` vs `Object.hasOwn(..)` (ES2022)**

```js
myObj = {
    favoriteNumber: 42
};

myObj.hasOwnProperty("favoriteNumber");   // true  (instance method — avoid)
Object.hasOwn(myObj,"favoriteNumber");    // true  (static — preferred)
```

`Object.hasOwn(..)` is the preferred, more robust form. Avoid the instance method form.

### Creating An Object With A Different `[[Prototype]]`

Using `Object.create(..)`:

```js
myObj = Object.create(differentObj);
```

The first argument becomes the new object's `[[Prototype]]`. Properties must then be added individually via `=`.

| NOTE: |
| :--- |
| `Object.create(..)` accepts an optional second argument — an object of property descriptors (same format as `Object.defineProperties(..)`). Rarely used in practice due to the verbosity of full descriptors. |

Using `__proto__` in object literal syntax:

```js
myObj = {
    __proto__: differentObj,

    // .. the rest of the object definition
};
```

| WARNING: |
| :--- |
| `__proto__` was standardized in ES6 but placed in Appendix B of the spec (browser-required features not guaranteed in all JS environments). Node.js inherits it from V8/Chrome. Be aware of which JS environments your code targets. |

#### Empty `[[Prototype]]` Linkage

Create a "dictionary object" with no `[[Prototype]]` linkage:

```js
emptyObj = Object.create(null);
// or: emptyObj = { __proto__: null }

emptyObj.toString;   // undefined
```

- `in` and `for..in` consult the `[[Prototype]]` chain — not desirable for pure dictionaries.
- No risk of property name collisions with inherited properties.
- `"toString" in emptyObj` correctly resolves to `false`.

### `[[Prototype]]` vs `prototype`

- Every function (which is itself an object) has a public `prototype` property pointing at an object.
- This `prototype` property does NOT define the function's own `[[Prototype]]` linkage.
- Instead, it defines the object that will be used as `[[Prototype]]` for any object created by calling that function with `new`.

```js
myObj = {};

// is basically the same as:
myObj = new Object();
```

`{}` is equivalent to `new Object()`, so the new object's `[[Prototype]]` is set to `Object.prototype`.

Functions themselves (as objects) are `[[Prototype]]`-linked to `Function.prototype`. This is where functions inherit methods like `toString()`, `call(..)`, `apply(..)`, and `bind(..)`.

## Objects Behavior

- Property behavior is controlled by descriptor attributes (`value`, `enumerable`, `writable`, `configurable`) via `Object.defineProperty(..)`.
- Object-wide behavior is controlled via methods like `Object.freeze(..)`.
- Property lookup that misses on the target object **delegates** up the `[[Prototype]]` chain.
- When a delegated method is invoked, `this` is bound to the original object that initiated the lookup, not the object where the method was found.

[^mop]: "Metaobject", Wikipedia; https://en.wikipedia.org/wiki/Metaobject ; Accessed July 2022.

[^specApB]: "Appendix B: Additional ECMAScript Features for Web Browsers", ECMAScript 2022 Language Specification; https://262.ecma-international.org/13.0/#sec-additional-ecmascript-features-for-web-browsers ; Accessed July 2022
