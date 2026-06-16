# You Don't Know JS Yet: Types & Grammar - 2nd Edition
# Chapter 3: Object Values

## Types of Objects

The `object` value-type comprises several sub-types, each with specialized behaviors:

* plain objects
* fundamental objects (boxed primitives)
* built-in objects
* arrays
* regular expressions
* functions (aka, "callable objects")

All objects can act as collections (of properties) holding values (including functions/methods).

## Plain Objects

Plain objects (POJOs — *plain ol' javascript objects*) have a literal form:

```js
address = {
    street: "12345 Market St",
    city: "San Francisco",
    state: "CA",
    zip: "94114"
};
```

Properties can hold any values: primitives or other objects (including arrays, functions, etc).

Equivalent imperative construction:

```js
address = new Object();
address.street = "12345 Market St";
address.city = "San Francisco";
address.state = "CA";
address.zip = "94114";
```

Plain objects are by default `[[Prototype]]` linked to `Object.prototype`, giving them delegated access to:

* `toString()` / `toLocaleString()`
* `valueOf()`
* `isPrototypeOf(..)`
* `hasOwnProperty(..)` (recently deprecated — alternative: static `Object.hasOwn(..)` utility)
* `propertyIsEnumerable(..)`
* `__proto__` (getter function)

```js
address.isPrototypeOf(Object.prototype);    // true
address.isPrototypeOf({});                  // false
```

## Fundamental Objects

JS defines several *fundamental* object types, which are instances of various built-in constructors:

* `new String()`
* `new Number()`
* `new Boolean()`

These constructors must be used with `new` to construct instances of fundamental objects. Without `new`, these functions perform type coercion instead.

Fundamental object constructors produce object value-types, not primitives:

```js
myName = "Kyle";
typeof myName;                      // "string"

myNickname = new String("getify");
typeof myNickname;                  // "object"
```

A fundamental object instance is a wrapper around the corresponding underlying primitive value.

| WARNING: |
| :--- |
| It's nearly universally regarded as *bad practice* to ever directly instantiate these fundamental objects. The primitive counterparts are generally more predictable, more performant, and offer *auto-boxing* (see "Automatic Objects" section below) whenever the underlying object-wrapper form is needed for property/method access. |

- `Symbol(..)` and `BigInt(..)` are referred to in the specification as "constructors", but are not used with `new`, and the values they produce are primitives.
- There are internal *fundamental objects* for these two types, used for prototype delegation and *auto-boxing*.
- For `null` and `undefined`, there are no `Null()` or `Undefined()` "constructors", no corresponding fundamental objects, and no prototypes.

### Prototypes

Instances of the fundamental object constructors are `[[Prototype]]` linked to their constructors' `prototype` objects:

* `String.prototype`: defines `length` property and string-specific methods like `toUpperCase()`, etc.
* `Number.prototype`: defines number-specific methods like `toPrecision(..)`, `toFixed(..)`, etc.
* `Boolean.prototype`: defines default `toString()` and `valueOf()` methods.
* `Symbol.prototype`: defines `description` (getter), as well as default `toString()` and `valueOf()` methods.
* `BigInt.prototype`: defines default `toString()`, `toLocaleString()`, and `valueOf()` methods.

Direct instances of the built-in constructors have `[[Prototype]]` delegated access to the respective `prototype` properties/methods. Corresponding primitive values also have such delegated access via *auto-boxing*.

### Automatic Objects

Accessing a property or method on a value requires that the value be an object. Since primitives are not objects, JS temporarily converts/wraps a primitive to its fundamental object counterpart[^AutoBoxing] to perform that access.

```js
myName = "Kyle";

myName.length;              // 4

myName.toUpperCase();       // "KYLE"
```

- `myName.length` and `myName.toUpperCase()` work because JS *auto-boxes* the primitive `string` into a wrapper fundamental object — an instance of `new String(..)`.
- The internally created object has access to predefined properties/methods via a `[[Prototype]]` link to `String.prototype`.
- The same applies to `number` (wrapped as `new Number()`) and `boolean` (wrapped as `new Boolean()`).
- `Symbol(..)` and `BigInt(..)` primitive values can also be *auto-boxed* to their internal fundamental object wrapper forms for delegated property/method access.
- Since `null` and `undefined` have no corresponding fundamental objects, there is no *auto-boxing* for these values.

Auto-boxing is a form of implicit coercion: a primitive is temporarily converted to an object (a change in value-type), implied by the property/method access but only happening internally.

## Other Built-in Objects

Additional built-in constructors create further specialized object sub-types:

* `new Date(..)`
* `new Error(..)`
* `new Map(..)`, `new Set(..)`, `new WeakMap(..)`, `new WeakSet(..)` — keyed collections
* `new Int8Array(..)`, `new Uint32Array(..)`, etc — indexed, typed-array collections
* `new ArrayBuffer(..)`, `new SharedArrayBuffer(..)`, etc — structured data collections

## Arrays

Arrays are objects specialized to behave as numerically indexed collections, as opposed to named-property collections like plain objects.

Literal form:

```js
favoriteNumbers = [ 3, 12, 42 ];

favoriteNumbers[2];                 // 42
```

Equivalent imperative construction:

```js
favoriteNumbers = new Array();
favoriteNumbers[0] = 3;
favoriteNumbers[1] = 12;
favoriteNumbers[2] = 42;
```

Arrays are `[[Prototype]]` linked to `Array.prototype`, giving delegated access to array-oriented methods:

```js
favoriteNumbers.map(v => v * 2);
// [ 6, 24, 84 ]

favoriteNumbers.includes(42);       // true
```

`Array.prototype` methods fall into three categories:

- **Mutating** (modifies array in place): `push(..)`, `pop(..)`, `sort(..)`, etc.
- **Non-mutating** (returns new array, original intact): `concat(..)`, `map(..)`, `slice(..)`, etc.
- **Computed result** (returns non-array value): `indexOf(..)`, `includes(..)`, etc.

## Regular Expressions

// TODO

## Functions

// TODO

## Proposed: Records/Tuples

At the time of this writing, a (stage-2) proposal[^RecordsTuplesProposal] exists to add Records and Tuples to JS.

**Records:**
- Similar to plain objects but immutable (sealed, read-only).
- Treated as primitive values for assignment and equality comparison (unlike objects).
- Syntax: `#{ }` (a `#` before the `{ }` delimiter).
- Can only contain primitive values (including other records and tuples).

**Tuples:**
- Same relationship to arrays as records have to plain objects.
- Syntax: `#[ ]` (a `#` before the `[ ]` delimiters).

Despite looking like objects/arrays, Records and Tuples are primitive (non-object) values.

[^FundamentalObjects]: "20 Fundamental Objects", ECMAScript 2022 Language Specification; https://262.ecma-international.org/13.0/#sec-fundamental-objects ; Accessed August 2022

[^AutoBoxing]: "6.2.4.6 PutValue(V,W)", Step 5.a, ECMAScript 2022 Language Specification; https://262.ecma-international.org/13.0/#sec-putvalue ; Accessed August 2022

[^RecordsTuplesProposal]: "JavaScript Records & Tuples Proposal"; Robin Ricard, Rick Button, Nicolò Ribaudo; https://github.com/tc39/proposal-record-tuple ; Accessed August 2022
