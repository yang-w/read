# You Don't Know JS Yet: Types & Grammar - 2nd Edition
# Chapter 4: Coercing Values

| NOTE: |
| :--- |
| Work in progress |

**Coercion** = any type conversion in JS, whether explicit or implicit.

## Abstracts

JS defines *abstract operations* that dictate internal conversion from one value-type to another. These are conceptual — they can't be called directly; they're activated implicitly by statements/expressions in your program.

### ToBoolean

All values are either *truthy* or *falsy*. `ToBoolean()` is activated whenever a non-boolean appears in a boolean context (`if`, `for`, `while`, `? :`, `&&`, `||`).

**Falsy values** (coerce to `false`):
```
ToBoolean(undefined);               // false
ToBoolean(null);                    // false
ToBoolean("");                      // false
ToBoolean(0);                       // false
ToBoolean(-0);                      // false
ToBoolean(0n);                      // false
ToBoolean(NaN);                     // false
```

**Everything else is truthy** — including `"   "` (whitespace string), `[]`, and `{}`:
```
ToBoolean("hello");                 // true
ToBoolean(42);                      // true
ToBoolean([ 1, 2, 3 ]);             // true
ToBoolean({ a: 1 });                // true
```

| WARNING: |
| :--- |
| `document.all` is a legacy "falsy object" — it's defined but behaves as `undefined` (coerces to `false`). This is a narrow browser exception. |

### ToPrimitive

Any non-primitive can be reduced to a primitive via `ToPrimitive()` (specifically `OrdinaryToPrimitive()`). A *hint* (`"string"` or `"number"`) controls which method is tried first:

- `"string"` hint → tries `toString()` then `valueOf()`
- `"number"` hint (default) → tries `valueOf()` then `toString()`

If the method returns the hinted type, done. If not, tries the other method. If neither produces a primitive, falls back to `ToString()` or `ToNumber()`.

```
ToPrimitive({ a: 1 },"string");          // "[object Object]"
ToPrimitive({ a: 1 },"number");          // NaN
```

### ToString

Coerces a value to a string:

```
ToString(42.0);                 // "42"
ToString(-3);                   // "-3"
ToString(Infinity);             // "Infinity"
ToString(NaN);                  // "NaN"
ToString(42n);                  // "42"
ToString(true);                 // "true"
ToString(false);                // "false"
ToString(null);                 // "null"
ToString(undefined);            // "undefined"
```

Counter-intuitive cases:
```
ToString(Number.MAX_VALUE);     // "1.7976931348623157e+308"
ToString(-0);                   // "0"   <-- not "-0"
ToString(Symbol("ok"));         // TypeError exception thrown
```

| WARNING: |
| :--- |
| `String(Symbol("ok"))` works (explicit coercion of symbols is allowed), but `ToString(Symbol(..))` throws. `String(..)` is not merely an alias for `ToString()`. |

#### Default `toString()`

When `ToString()` is called on an object, it delegates to `ToPrimitive()` with `"string"` hint, which invokes the object's `toString()` method:

```
ToString(new String("abc"));        // "abc"
ToString(new Number(42));           // "42"
ToString({ a: 1 });                 // "[object Object]"
ToString([ 1, 2, 3 ]);              // "1,2,3"
```

### ToNumber

Coerces a value to a number:

```
ToNumber("42");                     // 42
ToNumber("-3");                     // -3
ToNumber("1.2300");                 // 1.23
ToNumber("   8.0    ");             // 8
ToNumber("123px");                  // NaN
ToNumber("hello");                  // NaN

ToNumber(true);                     // 1
ToNumber(false);                    // 0
ToNumber(null);                     // 0
ToNumber(undefined);                // NaN
```

Surprising cases:
```
ToNumber("");                       // 0   <-- not NaN!
ToNumber("       ");                // 0   <-- not NaN!
```

Exceptions (not `NaN`, but actual throws):
```
ToNumber(42n);                      // TypeError
ToNumber(Symbol("42"));             // TypeError
```

| WARNING: |
| :--- |
| `Number(42n)` works (explicit), whereas `ToNumber(42n)` throws. `Number(..)` is not merely an alias for `ToNumber()`. |

#### Other Abstract Numeric Conversions

- `ToNumeric()` — activates `ToPrimitive()` then delegates to `ToNumber()` unless value is already `bigint`
- Subset operations: `ToIntegerOrInfinity()`, `ToInt32()`, `ToUint32()`, `ToInt16()`, `ToUint16()`, `ToInt8()`, `ToUint8()`, `ToUint8Clamp()`
- BigInt operations: `ToBigInt()`, `StringToBigInt()`, `ToBigInt64()`, `ToBigUint64()`

#### Default `valueOf()`

When `ToNumber()` is called on an object, it delegates to `ToPrimitive()` with `"number"` hint, invoking `valueOf()`:

```
ToNumber(new String("abc"));        // NaN
ToNumber(new Number(42));           // 42
ToNumber({ a: 1 });                 // NaN
ToNumber([ 1, 2, 3 ]);              // NaN
ToNumber([]);                       // 0
```

### Equality Comparison

#### SameValue()

Strictest equality — no coercion, no special cases:

```
SameValue("hello","\x68ello");          // true
SameValue(NaN,NaN);                     // true
SameValue(0,-0);                        // false   <-- distinguishes -0
SameValue([1,2,3],[1,2,3]);             // false   (different references)
```

Used by `Object.is()`.

#### SameValueZero()

Same as `SameValue()` but treats `0` and `-0` as equal:

```
SameValueZero(0,-0);                    // true
```

Used by `Array.prototype.includes()`, `Set.prototype.has()`, `Map.prototype.has()`.

#### IsStrictlyEqual() — `===`

- Returns `false` immediately if types differ
- For same types, delegates to `Number:equal()` or `BigInt:equal()`

Key difference from `SameValue()`:
```
Number:SameValue(0,-0);             // false
Number:equal(0,-0);                 // true   <-- === treats 0 == -0

Number:SameValue(NaN,NaN);          // true
Number:equal(NaN,NaN);              // false  <-- === treats NaN != NaN
```

| WARNING: |
| :--- |
| `===` is not as strict as `SameValue()` — it lies about `-0` and `NaN`. Use `Object.is()` for the strictest equality. |

#### IsLooselyEqual() — `==`

- If types match → delegates to `IsStrictlyEqual()` (identical behavior)
- If types differ → coerces to match, preferring `number`/`bigint`:

  1. `null` == `undefined` → `true` (only to each other, nothing else)
  2. `number` vs `string` → coerce string to number
  3. `bigint` vs `string` → coerce string to bigint
  4. `boolean` → coerce to number first
  5. non-primitive → `ToPrimitive()` (default hint: `"number"`)

  Steps recurse until types match, then delegates to `IsStrictlyEqual()`.

### Relational Comparison — `IsLessThan()`

There is no `IsGreaterThan()`; instead `IsLessThan()` takes a `LeftFirst` flag to reverse operand order. Like `==`, it is coercive (coerces types to match, prefers numeric).

#### String Comparison

Both values are strings → compared by code-unit (character) values, lexicographically:

```
IsLessThan("a","b", true );        // true
IsLessThan("101","12", true );     // true  <-- "1" < "1"... wait, "10" < "12" at second char
IsLessThan("🐔","🥚", true );      // true
```

Even digit strings are compared as characters, not numbers — `"101" < "12"` because `"0"` < `"2"` at index 1.

#### Numeric Comparison

Delegates to `Number:lessThan()` or `BigInt:lessThan()`:

```
IsLessThan(41,42, true );         // true
IsLessThan(-0,0, true );          // false
IsLessThan(NaN,1, true );         // false   <-- NaN comparisons always false
IsLessThan(41n,42n, true );       // true
```

## Concrete Coercions

### To Boolean

Ways to activate `ToBoolean()`:

**`Boolean(..)`** — most explicit:
```js
Boolean("hello");               // true
Boolean(42);                    // true
Boolean("");                    // false
Boolean(0);                     // false
```

**`!!`** — double negation (two uses of unary `!`):
```js
!!"hello";                      // true
!!42;                           // true
!!"";                           // false
!!0;                            // false
```

**Implicit** — `if`, `? :`, `for`/`while`, `&&`, `||` all activate `ToBoolean()` on non-boolean operands:
```js
if (specialNumber) { /* ToBoolean(specialNumber) */ }
```

For `&&` and `||`: the lefthand value is coerced to boolean for the decision, but the *result* of the operator is the pre-coercion value (not a boolean):
```js
// || returns left if left is truthy, otherwise right
isLoggedIn = user.sessionID || req.cookie["Session-ID"];

// && returns left if left is falsy, otherwise right
isAdmin = isLoggedIn && ("admin" in user.permissions);
```

| NOTE: |
| :--- |
| `isLoggedIn` and `isAdmin` here will likely not be actual booleans — they'll be whatever values the expressions return. |

### To String

**`String(..)`** — explicit, handles symbols:
```js
String(true);                   // "true"
String(42);                     // "42"
String(-0);                     // "0"
String(Infinity);               // "Infinity"
String(null);                   // "null"
String(undefined);              // "undefined"
String(Symbol("ok"));           // "Symbol(ok)"   <-- works, unlike ToString()
String([1,2,3]);                // "1,2,3"
String(x => x + 1);             // "x => x + 1"
```

**`.toString()` method** — via auto-boxing on primitives:
```js
true.toString();                // "true"
42..toString();                 // "42"
Symbol("ok").toString();        // "Symbol(ok)"
[1,2,3].toString();             // "1,2,3"
({ a: 1 }).toString();          // "[object Object]"
```

**`+ ""`** — implicit string coercion (Brendan Eich-endorsed idiom):
```js
true + "";                      // "true"
42 + "";                        // "42"
null + "";                      // "null"
undefined + "";                 // "undefined"
```

| WARNING: |
| :--- |
| `String(x)` and `x + ""` are NOT equivalent. `String(..)` uses `"string"` hint for `ToPrimitive()`, invoking `toString()` first. `x + ""` uses default hint (like `"number"`), invoking `valueOf()` first. Also: `Symbol("ok") + ""` throws (implicit symbol coercion disallowed), but `String(Symbol("ok"))` works. |

### To Number

**`Number(..)`** and **`BigInt(..)`**:
```js
Number("42");                   // 42
Number("-3.141596");            // -3.141596
Number("-0");                   // -0
Number("123px");                // NaN

BigInt("42");                   // 42n
BigInt("-0");                   // 0n
BigInt("123px");                // SyntaxError

Number("42n");                  // NaN
BigInt("42n");                  // SyntaxError

Number("0b101010");             // 42   (binary literal strings work)
BigInt("0b101010");             // 42n

Number(true);                   // 1
Number(false);                  // 0
BigInt(true);                   // 1n
BigInt(false);                  // 0n

Number(42n);                    // 42
BigInt(42);                     // 42n
```

**Unary `+`** — common but not identical to `Number(..)`:
```js
+"42";                          // 42
+"0b101010";                    // 42
+42n;                           // TypeError  <-- implicit coercion of bigint disallowed
```

`Number(42n)` works but `+42n` throws — JS treats unary `+` on bigint as implicit coercion (disallowed), while `Number(..)` is explicit (allowed).

#### Mathematical Operations

Math operators (`-`, `*`, `/`, `%`, `**`) coerce operands to numbers. `x - 0` is a common safe idiom for coercing `x` to a number:

| WARNING: |
| :--- |
| `x + 0` is not safe — `+` is overloaded for string concatenation if either operand is a string. Use `x - 0` instead. |

Failed coercions produce `NaN`, which propagates through all further math operations.

#### Bitwise Operations

Bitwise operators (`|`, `&`, `^`, `>>`, `<<`, `>>>`) clamp values to 32-bit integers. `x | 0` is a common idiom to coerce `x` to an integer number.

#### Property Access

Object property keys are always strings (or symbols). Non-string keys are coerced:

```js
myObj = {};
myObj[3] = "hello";
myObj["3"] = "world";
console.log(myObj);             // {3: 'world'}  -- same property!
```

Other types coerced to strings as property keys:
```js
myObj[true] = 100;
myObj[null] = 200;
myObj[undefined] = 300;
myObj[{a:1}] = 400;
console.log(myObj);
// {3: 'world', true: 100, null: 200, undefined: 300, [object Object]: 400}
```

Arrays behave as numerically indexed — `myArr["3"]` accesses the same slot as `myArr[3]`.

### To Primitive

When an operator receives an object, `ToPrimitive()` is activated to coerce it to a primitive.

```js
spyObject = {
    toString() {
        console.log("toString() invoked!");
        return "10";
    },
    valueOf() {
        console.log("valueOf() invoked!");
        return 42;
    },
};

String(spyObject);
// toString() invoked!
// "10"

spyObject + "";
// valueOf() invoked!
// "42"   <-- valueOf returns 42 (number), then coerced to string "42"

Number(spyObject);
// valueOf() invoked!
// 42

+spyObject;
// valueOf() invoked!
// 42
```

`String(..)` uses `"string"` hint → `toString()` first. `+ ""` and `Number(..)` use `"number"` hint → `valueOf()` first.

If `valueOf()` returns a bigint:
```js
spyObject2 = { valueOf() { return 42n; } };

Number(spyObject2);     // 42    (explicit bigint→number allowed)
+spyObject2;            // TypeError  (implicit disallowed)
```

#### No Primitive Found?

If both `toString()` and `valueOf()` return non-primitives, a TypeError is thrown:

```js
spyObject4 = {
    toString() { return []; },
    valueOf() { return {}; }
};

String(spyObject4);     // TypeError: Cannot convert object to primitive value
Number(spyObject4);     // TypeError: Cannot convert object to primitive value
```

Always return an actual primitive from at least one of `toString()` / `valueOf()`!

#### Object To Boolean

`ToBoolean()` does NOT invoke `ToPrimitive()` for objects — it just does a table lookup. All normal objects are truthy:

```js
Boolean(spyObject);     // true   -- toString/valueOf NOT invoked
!spyObject;             // false
if (spyObject) { }      // runs
```

#### Unboxing: Wrapper To Primitive

Boxed/wrapped primitives unbox via `ToPrimitive()`:

```js
hello = new String("hello");
String(hello);                  // "hello"
hello + "";                     // "hello"

fortyOne = new Number(41);
Number(fortyOne);               // 41
fortyOne + 1;                   // 42
```

| WARNING: |
| :--- |
| `new Boolean(false)` is truthy — `Boolean(new Boolean(false))` returns `true`! `ToBoolean()` doesn't call `ToPrimitive()` on objects, so the wrapper's inner `false` value is irrelevant. |

#### Overriding Default `toString()`

Set `Symbol.toStringTag` to customize the default `toString()` output:

```js
spyObject5b = { [Symbol.toStringTag]: "my-spy-object" };
String(spyObject5b);        // "[object my-spy-object]"

spyObject5c = {
    get [Symbol.toStringTag]() { return `myValue:${this.myValue}`; },
    myValue: 42
};
String(spyObject5c);        // "[object myValue:42]"
```

#### Overriding `ToPrimitive`

Set `Symbol.toPrimitive` to a function to fully replace `ToPrimitive()`. The `hint` argument is `"string"`, `"number"`, or `"default"`:

```js
spyObject6 = {
    [Symbol.toPrimitive](hint) {
        console.log(`toPrimitive(${hint}) invoked!`);
        return 25;
    },
    toString() { return "10"; },
    valueOf() { return 42; },
};

String(spyObject6);     // toPrimitive(string) → "25"   (not "10")
spyObject6 + "";        // toPrimitive(default) → "25"  (not "42")
Number(spyObject6);     // toPrimitive(number) → 25     (not 42)
+spyObject6;            // toPrimitive(number) → 25
```

When `Symbol.toPrimitive` is defined, `toString()` and `valueOf()` are NOT automatically invoked. Must return a primitive or TypeError is thrown.

### Equality

#### SameValue() — `Object.is()`

No coercion at all. Strictest comparison:

```js
Object.is(42,42);                   // true
Object.is(-0,-0);                   // true
Object.is(NaN,NaN);                 // true
Object.is(0,-0);                    // false
```

#### SameValueZero() — `includes()`, `has()`

Treats `0` and `-0` as equal:

```js
[ 1, 2, NaN ].includes(NaN);        // true
[ 1, 2, -0 ].includes(0);           // true   <-- gotcha!
(new Set([ 1, 2, 0 ])).has(-0);     // true   <-- gotcha!
(new Map([[ 0, "ok" ]])).has(-0);   // true   <-- gotcha!
```

`indexOf()` uses `IsStrictlyEqual()` instead — so it cannot find `NaN`:

```js
[ 1, 2, NaN ].indexOf(NaN);         // -1
```

To use strict `SameValue()` equality when searching arrays, use `find()` / `findIndex()` with `Object.is()`:

```js
vals = [ 0, 1, 2, -0, NaN ];
vals.find(v => Object.is(v,-0));        // -0
vals.find(v => Object.is(v,NaN));       // NaN
vals.findIndex(v => Object.is(v,-0));   // 3
vals.findIndex(v => Object.is(v,NaN));  // 4
```

#### `==` vs `===`

Both operators are type-sensitive:
- `===` → returns `false` immediately if types differ
- `==` → if types differ, coerces until they match (prefers `number`), then behaves like `===`

If types already match, `==` and `===` are **identical**. There is no difference.

```js
myObj = { a: 1 };
anotherObj = myObj;
myObj == anotherObj;                // true
myObj === anotherObj;               // true
```

When types differ, `==` coerces:
```js
42 == "42";                         // true   ("42" → 42)
```

#### Nullish Coercion with `==`

`null` and `undefined` are only coercively equal to each other, not to any other value:

```js
null == undefined;              // true
null == 0;                      // false
null == "";                     // false
null == false;                  // false
```

Practical usage:
```js
if (someData == null) {
    // true if someData is null OR undefined
}

if (someData != null) {
    // true if someData is neither null nor undefined
}
```

#### `==` Boolean Gotcha

**Never use `== true` or `== false`.** The `==` algorithm does NOT activate `ToBoolean()` — it coerces booleans to numbers instead:

```js
// isLoggedIn = "yes"

if (isLoggedIn) { }             // passes ("yes" is truthy)

if (isLoggedIn == true) { }
// (1) "yes" == true
// (2) "yes" == 1
// (3) NaN == 1
// (4) NaN === 1  →  false  ← DOES NOT PASS!
```

The same trap with `"true"`:
```js
"true" == true
// → "true" == 1 → NaN == 1 → false
```

Safe `boolean` comparisons: use `if (isLoggedIn)` — this actually invokes `ToBoolean()`. Avoid `== true` / `== false` entirely.

Also a gotcha: `[]` is truthy, but:
```js
if ([] == false) { }    // this runs!
// [] → "" → 0 == false → 0 == 0 → true
```

## Coercion Corner Cases

### Strings

```js
String([ 1, 2, 3 ]);                // "1,2,3"   -- no brackets
String([]);                         // ""         -- empty, no way to tell it was an array
String([ null, undefined ]);        // ","         -- null/undefined disappear in arrays!
String({});                         // "[object Object]"
String({ a: 1 });                   // "[object Object]"
```

### Numbers

```js
Number("");                         // 0    -- should be NaN!
Number("       ");                  // 0    -- whitespace stripped, same as ""
Number([]);                         // 0    -- [] → "" → 0
Number("NaN");                      // NaN  -- not recognized as a number
Number("Infinity");                 // Infinity
Number("infinity");                 // NaN  -- case-sensitive!
Number(false);                      // 0
Number(true);                       // 1
```

The root of many coercion surprises: `Number("") === 0`.

### Coercion Absurdity

```js
[] == ![];   // true
```

How:
1. `[] == ![]`
2. `[] == false`      (`![]` → `!true` → `false`)
3. `"" == false`      (`[]` → `""` via `String([])`)
4. `0 == false`       (`""` → `0` via `Number("")`)
5. `0 == 0`           (`false` → `0`)
6. `0 === 0`  →  `true`

The culprits are `String([]) === ""` and `Number("") === 0`, not `==` itself.

## Type-Aware Equality: `==` vs `===`

Summary of when to use each:

| Situation | Use |
|---|---|
| Types are unknown / can't be determined | `===` (safe fallback) |
| Types are known and **match** | `==` (shorter, identical behavior) |
| Types are known and **don't match**, and you want equality to be possible | `==` (only `==` can coerce) |
| Types are known and **don't match**, and you use `===` | Always returns `false` — pointless |

Key insight: `==` and `===` behave **identically** when types are the same. Using `===` when you already know the types match adds no safety and may mislead readers.

**Never use `== true` or `== false`** — use truthiness checks (`if (x)`) instead, which actually invoke `ToBoolean()`.

Use `== null` as a clean nullish check (both `null` and `undefined`):

```js
if (x == null) { }    // equivalent to: x === null || x === undefined
```
