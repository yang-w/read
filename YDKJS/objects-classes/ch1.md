# You Don't Know JS Yet: Objects & Classes - 2nd Edition
# Chapter 1: Object Foundations

## Objects As Containers

Objects are collections of key/value pairs. Sub-types of object in JS with specialized behaviors include arrays (numerically indexed) and functions (callable).

| NOTE: |
| :--- |
| Keys are often referred to as "property names", with the pairing of a property name and a value often called a "property". |

Regular JS objects are typically declared with literal syntax:

```js
myObj = {
    // ..
};
```

**Note:** There's an alternate way to create an object (using `myObj = new Object()`), but this is not common or preferred, and is almost never the appropriate way to go about it. Stick with object literal syntax.

`{ .. }` curly brackets are overloaded in JS — they can mean any of the following depending on context:

* delimit values, like object literals
* define object destructuring patterns
* delimit interpolated string expressions, like `` `some ${ getNumber() } thing` ``
* define blocks, like on `if` and `for` loops
* define function bodies

To distinguish: if `{ .. }` appears where a value/expression is valid, it's an object literal; otherwise it's one of the other uses.

## Defining Properties

Inside the object literal curly braces, properties are defined with `propertyName: propertyValue` pairs:

```js
myObj = {
    favoriteNumber: 42,
    isDeveloper: true,
    firstName: "Kyle"
};
```

Values can be literals or computed by expression:

```js
function twenty() { return 20; }

myObj = {
    favoriteNumber: (twenty() + 1) * 2,
};
```

The expression `(twenty() + 1) * 2` is evaluated immediately, with the result (`42`) assigned as the property value.

JS does not have lazy expressions. To defer evaluation, wrap the expression in a function:

```js
function twenty() { return 20; }
function myNumber() { return (twenty() + 1) * 2; }

myObj = {
    favoriteNumber: myNumber   // notice, NOT `myNumber()` as a function call
};
```

`favoriteNumber` holds a function reference, not a numeric value. The function must be explicitly executed to compute the result.

### Looks Like JSON?

Differences between JS object literals and JSON:

1. JSON property names must be quoted with `"` double-quote characters
2. JSON property values must be literals (primitives, objects, or arrays), not arbitrary JS expressions

In JS, property names don't require quotes — though you *can* use them. Characters invalid in identifiers (leading numbers, whitespace) require quotes:

```js
myObj = {
    favoriteNumber: 42,
    isDeveloper: true,
    firstName: "Kyle",
    "2 nicknames": [ "getify", "ydkjs" ]
};
```

JS also allows comments and trailing commas in object/array expressions; JSON does not.

### Property Names

Property names in object literals are almost always treated/coerced as string values. Exception: integer (or "integer-looking") property names:

```js
anotherObj = {
    42:       "<-- this property name will be treated as an integer",
    "41":     "<-- ...and so will this one",

    true:     "<-- this property name will be treated as a string",
    [myObj]:  "<-- ...and so will this one"
};
```

- `42` → treated as an integer property name (index)
- `"41"` → also treated as integer since it *looks like* one
- `true` → becomes the string `"true"`
- `[myObj]` (computed) → coerces the object to string (generally `"[object Object]"`)

| WARNING: |
| :--- |
| If you need to actually use an object as a key/property name, never rely on this computed string coercion; its behavior is surprising and almost certainly not what's expected, so program bugs are likely to occur. Instead, use a more specialized data structure, called a `Map` (added in ES6), where objects used as property "names" are left as-is instead of being coerced to a string value. |

Property names can also be computed at object literal definition time using `[ .. ]` brackets:

```js
anotherObj = {
    ["x" + (21 * 2)]: true
};
```

The expression `"x" + (21 * 2)` is computed immediately, and the result (`"x42"`) is used as the property name.

### Symbols As Property Names

`Symbol` (added in ES6) is a primitive value type often used as a special property name. Created via `Symbol(..)` (**without** `new`), which accepts an optional description string for debugging only:

```js
myPropSymbol = Symbol("optional, developer-friendly description");
```

| NOTE: |
| :--- |
| Symbols are sort of like numbers or strings, except that their value is *opaque* to, and globally unique within, the JS program. In other words, you can create and use symbols, but JS doesn't let you know anything about, or do anything with, the underlying value; that's kept as a hidden implementation detail by the JS engine. |

To define a symbol property name on an object literal, use computed property name syntax:

```js
myPropSymbol = Symbol("optional, developer-friendly description");

anotherObj = {
    [myPropSymbol]: "Hello, symbol!"
};
```

The property name is the actual primitive symbol value, not the description string.

Because symbols are globally unique, there's no chance of accidental property name collision between different parts of a program.

### Concise Properties

When a property name is the same as an in-scope identifier holding the value, you can use the shorthand "concise property" form:

```js
coolFact = "the first person convicted of speeding was going 8 mph";

// verbose:
anotherObj = {
    coolFact: coolFact
};

// concise shorthand:
anotherObj = {
    coolFact   // <-- concise property short-hand
};
```

The property name is `"coolFact"` (string), and the value is whatever `coolFact` holds at that moment.

### Concise Methods

Functions/methods in object literals can be defined in a more concise form:

```js
anotherObj = {
    // standard function property
    greet: function() { console.log("Hello!"); },

    // concise function/method property
    greet2() { console.log("Hello, friend!"); }
};
```

Generator functions also have a concise form:

```js
anotherObj = {
    // instead of:
    //   greet3: function*() { yield "Hello, everyone!"; }

    // concise generator method
    *greet3() { yield "Hello, everyone!"; }
};
```

Concise methods/generators can have quoted or computed names:

```js
anotherObj = {
    "greet-4"() { console.log("Hello, audience!"); },

    // concise computed name
    [ "gr" + "eet 5" ]() { console.log("Hello, audience!"); },

    // concise computed generator name
    *[ "ok, greet 6".toUpperCase() ]() { yield "Hello, audience!"; }
};
```

### Object Spread

The `...` syntax inside an object literal "spreads" the properties (key/value pairs) of another object into the object being defined:

```js
anotherObj = {
    favoriteNumber: 12,

    ...myObj,   // object spread, shallow copies `myObj`

    greeting: "Hello!"
}
```

- Spreading is **shallow**: only top-level properties are copied; values that are object references are copied by reference, not duplicated
- Think of it like a `for` loop doing `=` style assignment from source to target, one property at a time
- Property definitions happen in order (top to bottom): `...myObj` will overwrite `favoriteNumber: 12` if `myObj` has a `favoriteNumber` property; a later `greeting: "Hello!"` will overwrite any `greeting` spread from `myObj`

| NOTE: |
| :--- |
| Object spread only copies *owned* properties that are *enumerable*. It does not duplicate the property's exact characteristics, but rather does a simple assignment-style copy. |

Common use — shallow object duplication:

```js
myObjShallowCopy = { ...myObj };
```

`...` spread can only appear inside `{ .. }` object literals (creating a new object). To copy into an *existing* object, use `Object.assign(..)` instead.

### Deep Object Copy

`...` spread is only suitable for objects holding simple primitive values, not references to other objects.

Standard approaches for deep object duplication:

1. Use a library utility that declares a specific opinion on duplication behavior.
2. `JSON.parse(JSON.stringify(..))` — only works correctly if there are no circular references and no non-JSON-serializable values (e.g., functions).
3. `structuredClone(..)` (provided by environments like the web platform, not a JS language feature):

```js
myObjCopy = structuredClone(myObj);
```

`structuredClone(..)` supports circular references and many more value types than the JSON round-trip trick. Limitations: no support for cloning functions or DOM elements.

## Accessing Properties

Preferred access via the `.` operator:

```js
myObj.favoriteNumber;    // 42
myObj.isDeveloper;       // true
```

When the property name contains characters invalid in identifiers (leading numbers, whitespace), use `[ .. ]` brackets:

```js
myObj["2 nicknames"];    // [ "getify", "ydkjs" ]
```

```js
anotherObj[42];          // "<-- this property name will..."
anotherObj["41"];        // "<-- this property name will..."
```

Numeric property access via `[ .. ]` coerces a string to its numeric equivalent (e.g., `"42"` → `42` numeric property).

Property names accessed via `[ .. ]` can be any arbitrary JS expression:

```js
propName = "41";
anotherObj[propName];
```

```js
function howMany(x) {
    return x + 1;
}

myObj[`${ howMany(1) } nicknames`];   // [ "getify", "ydkjs" ]
```

The expression inside `[ .. ]` is evaluated first; its result is used as the property name.

### Object Entries

`Object.entries(..)` (ES6) returns an array of `[propertyName, value]` tuples for all owned, enumerable properties:

```js
myObj = {
    favoriteNumber: 42,
    isDeveloper: true,
    firstName: "Kyle"
};

Object.entries(myObj);
// [ ["favoriteNumber",42], ["isDeveloper",true], ["firstName","Kyle"] ]
```

`Object.fromEntries(..)` (ES2019) creates a new object from a list of entries:

```js
myObjShallowCopy = Object.fromEntries( Object.entries(myObj) );

// alternate approach to the earlier discussed:
// myObjShallowCopy = { ...myObj };
```

### Destructuring

Object destructuring (ES6) defines a pattern describing an object's structure, then systematically extracts values into separate assignments. The result is not another object but assignments to other targets (variables, etc).

Pre-ES6 "manual destructuring":

```js
myObj = {
    favoriteNumber: 42,
    isDeveloper: true,
    firstName: "Kyle"
};

const favoriteNumber = (
    myObj.favoriteNumber !== undefined ? myObj.favoriteNumber : 42
);
const isDev = myObj.isDeveloper;
const firstName = myObj.firstName;
const lname = (
    myObj.lastName !== undefined ? myObj.lastName : "--missing--"
);
```

Equivalent using declarative object destructuring:

```js
myObj = {
    favoriteNumber: 42,
    isDeveloper: true,
    firstName: "Kyle"
};

const { favoriteNumber = 12 } = myObj;
const {
    isDeveloper: isDev,
    firstName: firstName,
    lastName: lname = "--missing--"
} = myObj;

favoriteNumber;   // 42
isDev;            // true
firstName;        // "Kyle"
lname;            // "--missing--"
```

Key mechanics:
- `{ .. }` on the left-hand side of `=` is a destructuring pattern, not an object definition
- `{ favoriteNumber }` — source property name and target identifier are the same (concise form)
- `= 12` — default value used if the property is missing or holds `undefined`
- `isDeveloper: isDev` — rename: read from `isDeveloper`, assign to `isDev`
- `lastName: lname = "--missing--"` — rename + default value

Destructuring is not inherently a declaration mechanism — it works against existing variables too:

```js
let fave;

// surrounding ( ) are required syntax here,
// when a declarator is not used
({ favoriteNumber: fave } = myObj);

fave;  // 42
```

### Conditional Property Access

"Optional chaining" (ES2020) — the `?.` operator checks the left-hand side for null'ish (`null` or `undefined`). If null'ish, the rest of the expression short-circuits and returns `undefined`. Otherwise, behaves like `.`:

```js
myObj?.favoriteNumber
```

The null'ish check is against `myObj`, not `favoriteNumber`. All non-null'ish values can be safely accessed with `.` even if no matching property exists.

- `?` is on the side where the safety check is performed
- `.` is on the side that is only conditionally evaluated

Typically used in nested access chains:

```js
myObj?.address?.city
```

Equivalent long form:

```js
(myObj != null && myObj.address != null) ? myObj.address.city : undefined
```

No check is performed against the right-most property (`city`).

Use `?.` only when a value's null'ish state cannot be predicted/controlled. Prefer specificity — if `myObj` is reliably an object, don't use `?.` on it:

```js
// preferred — only guard where uncertainty exists:
myObj.address?.city
```

For bracket-style access, use `?.[`:

```js
myObj["2 nicknames"]?.[0];   // "getify"
```

| WARNING: |
| :--- |
| There's a third form of this feature, named "optional call", which uses `?.(` as the operator. It's used for performing a non-null'ish check on a property before executing the function value in the property. For example, instead of `myObj.someFunc(42)`, you can do `myObj.someFunc?.(42)`. The `?.(` checks to make sure `myObj.someFunc` is non-null'ish before invoking it (with the `(42)` part). While that may sound like a useful feature, I think this is dangerous enough to warrant complete avoidance of this form/construct.<br><br>My concern is that `?.(` makes it seem as if we're ensuring that the function is "callable" before calling it, when in fact we're only checking if it's non-null'ish. Unlike `?.` which can allow a "safe" `.` access against a non-null'ish value that's also not an object, the `?.(` non-null'ish check isn't similarly "safe". If the property in question has any non-null'ish, non-function value in it, like `true` or `"Hello"`, the `(42)` call part will be invoked and yet throw a JS exception. So in other words, this form is unfortunately masquerading as more "safe" than it actually is, and should thus be avoided in essentially all circumstances. If a property value can ever *not be* a function, do a more fullsome check for its function'ness before trying to invoke it. Don't pretend that `?.(` is doing that for you, or future readers/maintainers of your code (including your future self!) will likely regret it. |

### Accessing Properties On Non-Objects

You can access properties/methods from non-object values:

```js
fave = 42;

fave;              // 42
fave.toString();   // "42"
```

When `.` or `[ .. ]` is used against a non-object, non-null'ish value, JS temporarily coerces it into an object-wrapped representation — a process called **boxing**. For `42`, JS boxes it into a `Number` object, performs the property access, then discards the wrapper.

- `null` and `undefined` can be manually object-ified via `Object(null)` / `Object(undefined)`, but JS does **not** automatically box null'ish values — property access against them will fail.

| NOTE: |
| :--- |
| Boxing has a counterpart: unboxing. For example, the JS engine will take an object wrapper -- like a `Number` object wrapped around `42` -- created with `Number(42)` or `Object(42)` -- and unwrap it to retrieve the underlying primitive `42`, whenever a mathematical operation (like `*` or `-`) encounters such an object. |

## Assigning Properties

Property assignment uses the `=` operator regardless of whether the property already exists:

```js
myObj.favoriteNumber = 123;
```

- If the property doesn't exist: creates and assigns it
- If the property already exists: re-assigns its value

| WARNING: |
| :--- |
| An `=` assignment to a property may fail (silently or throwing an exception), or it may not directly assign the value but instead invoke a *setter* function that performs some operation(s). |

To assign multiple properties at once from another object, use `Object.assign(..)` (ES6):

```js
// shallow copy all (owned and enumerable) properties
// from `myObj` into `anotherObj`
Object.assign(anotherObj,myObj);

Object.assign(
    /*target=*/anotherObj,
    /*source1=*/{
        someProp: "some value",
        anotherProp: 1001,
    },
    /*source2=*/{
        yetAnotherProp: false
    }
);
```

`Object.assign(..)` takes the first argument as target, and subsequent argument(s) as source(s). Copying behavior is identical to object spread.

## Deleting Properties

The only way to remove a property from an object is with the `delete` operator:

```js
anotherObj = {
    counter: 123
};

anotherObj.counter;   // 123

delete anotherObj.counter;

anotherObj.counter;   // undefined
```

- `delete` does **not** directly deallocate memory / trigger GC — it only removes the property
- If the deleted property's value was the only reference to an object, that object becomes eligible for GC
- `delete` on anything other than an object property silently fails (non-strict mode) or throws (strict mode)
- Assigning `undefined` or `null` to a property is distinct from deleting it — the property still exists on the object

## Determining Container Contents

```js
myObj = {
    favoriteNumber: 42,
    coolFact: "the first person convicted of speeding was going 8 mph",
    beardLength: undefined,
    nicknames: [ "getify", "ydkjs" ]
};

"favoriteNumber" in myObj;            // true

myObj.hasOwnProperty("coolFact");     // true
myObj.hasOwnProperty("beardLength");  // true

myObj.nicknames = undefined;
myObj.hasOwnProperty("nicknames");    // true

delete myObj.nicknames;
myObj.hasOwnProperty("nicknames");    // false
```

Key distinction:
- `in` operator: checks the target object **and** its `[[Prototype]]` chain
- `hasOwnProperty(..)`: checks only the target object (does not traverse the prototype chain)

`hasOwnProperty(..)` is a built-in on `Object.prototype`, inherited by all normal objects — accessing it via the object itself carries risk (can be overridden or shadowed).

### Better Existence Check

`Object.hasOwn(..)` (ES2022) is the preferred alternative — a static helper invoked externally rather than via the object's `[[Prototype]]`:

```js
// instead of:
myObj.hasOwnProperty("favoriteNumber")

// we should now prefer:
Object.hasOwn(myObj,"favoriteNumber")
```

Polyfill for environments without `Object.hasOwn(..)`:

```js
// simple polyfill sketch for `Object.hasOwn(..)`
if (!Object.hasOwn) {
    Object.hasOwn = function hasOwn(obj,propName) {
        return Object.prototype.hasOwnProperty.call(obj,propName);
    };
}
```

### Listing All Container Contents

| API | Returns | Notes |
| :--- | :--- | :--- |
| `Object.entries(..)` | Array of `[name, value]` tuples | Owned + enumerable only |
| `Object.keys(..)` | Array of property names | Owned + enumerable only |
| `Object.values(..)` | Array of property values | Owned + enumerable only |
| `Object.getOwnPropertyNames(..)` | Array of property names | Owned, including non-enumerable; excludes Symbol keys |
| `Object.getOwnPropertySymbols(..)` | Array of Symbol property names | Owned Symbols only |

To get all owned contents (enumerable or not, including Symbols): concatenate `Object.getOwnPropertyNames(..)` and `Object.getOwnPropertySymbols(..)`.

None of these APIs traverse the `[[Prototype]]` chain — they only return *owned* properties. The `in` operator and `for..in` loop will traverse the chain; `for..in` lists all enumerable properties (owned and inherited). No built-in API returns the full combined set of owned and inherited contents.

## Temporary Containers

Objects are often used as temporary transport mechanisms to pass or return multiple values:

```js
function formatValues({ one, two, three }) {
    // the actual object passed in as an
    // argument is not accessible, since
    // we destructured it into three
    // separate variables

    one = one.toUpperCase();
    two = `--${two}--`;
    three = three.substring(0,5);

    // this object is only to transport
    // all three values in a single
    // return statement
    return { one, two, three };
}

// destructuring the return value from
// the function, because that returned
// object is just a temporary container
// to transport us multiple values
const { one, two, three } =

    // this object argument is a temporary
    // transport for multiple input values
    formatValues({
       one: "Kyle",
       two: "Simpson",
       three: "getify"
    });

one;     // "KYLE"
two;     // "--Simpson--"
three;   // "getif"
```

The object literal passed into `formatValues(..)` is immediately parameter-destructured. The returned object is also immediately destructured. The objects themselves are never directly referenced — they serve only as temporary value carriers.

[^structuredClone]: "Structured Clone Algorithm", HTML Specification; https://html.spec.whatwg.org/multipage/structured-data.html#structured-cloning ; Accessed July 2022
