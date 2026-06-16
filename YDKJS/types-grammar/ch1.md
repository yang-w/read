# You Don't Know JS Yet: Types & Grammar - 2nd Edition
# Chapter 1: Primitive Values

## Value Types

JS doesn't apply types to variables or properties — values themselves have types ("value types").

The language provides seven built-in, primitive (non-object) value types: [^PrimitiveValues]

* `undefined`
* `null`
* `boolean`
* `number`
* `bigint`
* `symbol`
* `string`

### Type-Of

`typeof` always returns a `string` representing the value-type:

```js
typeof true;            // "boolean"

typeof 42;              // "number"

typeof 42n;             // "bigint"

typeof Symbol("42");    // "symbol"
```

When used against a variable, `typeof` reports the type of *the value in the variable*:

```js
greeting = "Hello";
typeof greeting;        // "string"
```

JS variables themselves don't have types — they hold any arbitrary value, which itself has a value-type.

### Non-objects?

Primitives are values that *are not allowed to have properties*; only objects are allowed such.

```js
myName = "Kyle";

myName.nickname = "getify";

console.log(myName.nickname);           // undefined
```

In strict-mode, the same property assignment throws instead of silently failing:

```js
"use strict";

myName = "Kyle";

myName.nickname = "getify";
// TypeError: Cannot create property 'nickname'
// on string 'Kyle'
```

Non-strict mode silently ignores the violation (strict-mode was added in ES5.1, 15+ years after the language launched, so the change had to be opt-in to avoid breaking existing code).

| TIP: |
| :--- |
| This particular distinction seems to be contradicted by expressions like `"hello".length`; even in strict-mode, it returns the expected value `5`. So it certainly *seems* like the string has a `length` property! But, as just previously mentioned, the correct explanation is *auto-boxing*; we'll cover the topic in "Automatic Objects" in Chapter 3. |

## Empty Values

`null` and `undefined` both represent emptiness or absence of value.

`null` has an unexpected `typeof` result — a legacy bug that cannot be changed without breaking existing code:

```js
typeof null;            // "object"
```

`undefined` is reported for explicit `undefined` values and for any seemingly missing value:

```js
typeof undefined;               // "undefined"

var whatever;

typeof whatever;                // "undefined"
typeof nonExistent;             // "undefined"

whatever = {};
typeof whatever.missingProp;    // "undefined"

whatever = [];
typeof whatever[10];            // "undefined"
```

| NOTE: |
| :--- |
| The `typeof nonExistent` expression is referring to an undeclared variable `nonExistent`. Normally, accessing an undeclared variable reference would cause an exception, but the `typeof` operator is afforded the special ability to safely access even non-existent identifiers and calmly return `"undefined"` instead of throwing an exception. |

Each "empty" type has exactly one value of the same name: `null` is the only value in `null`, and `undefined` is the only value in `undefined`.

### Null'ish

`null` and `undefined` are both considered *nullish* — representing general emptiness or absence of a meaningful value.

JS provides several mechanisms for treating both nullish values as interchangeable:

**`==` (coercive equality):** treats `null` and `undefined` as coercively equal to each other, but to no other values:

```js
if (greeting == null) {
    // greeting is nullish/empty
}
```

**`??` (nullish-coalescing):** returns the left-hand value if non-nullish, otherwise returns the right-hand value:

```js
who = myName ?? "User";

// equivalent to:
who = (myName != null) ? myName : "User";
```

**`?.` (nullish conditional-chaining):** checks the left-side value; if nullish, stops and returns `undefined`; otherwise performs the property access and continues:

```js
record = {
    shippingAddress: {
        street: "123 JS Lane",
        city: "Browserville",
        state: "XY"
    }
};

console.log( record?.shippingAddress?.street );
// 123 JS Lane

console.log( record?.billingAddress?.street );
// undefined
```

- `record?.` means: "check `record` for nullish before `.` property access"
- `billingAddress?.` means: "check `billingAddress` for nullish before `.` property access"

| WARNING: |
| :--- |
| Some JS developers believe that the newer `?.` is superior to `.`, and should thus almost always be used instead of `.`. I believe that's an unwise perspective. First of all, it's adding extra visual clutter, which should only be done if you're getting benefit from it. Secondly, you should be aware of, and planning for, the emptiness of some value, to justify using `?.`. If you always expect a non-nullish value to be present in some expression, using `?.` to access a property on it is not only unnecessary/wasteful, but also could potentially hide future bugs where your assumption of value-presence had failed but `?.` covered it up. As with most features in JS, use `.` where it's most appropriate, and use `?.` where it's most appropriate. Never substitute one when the other is more appropriate. |

The `?.[` form is used with bracket-style access (not `?[`):

```js
record?.["shipping" + "Address"]?.state;    // XY
```

The `?.(` "optional-call" form conditionally invokes a function if the value is non-nullish:

```js
// instead of:
//   if (someFunc) someFunc(42);
//
// or:
//   someFunc && someFunc(42);

someFunc?.(42);
```

| WARNING: |
| :--- |
| `?.(` only checks that the value is non-nullish before invoking — it does *not* check that the value is a callable function. If it's some other non-nullish but non-function value, execution will still fail with a `TypeError`. |

### Distinct'ish

`null` and `undefined` *are* actually distinct types and will trigger different behavior in the language. Key example — parameter defaults:

```js
function greet(msg = "Hello") {
    console.log(msg);
}

greet();            // Hello
greet(undefined);   // Hello
greet("Hi");        // Hi

greet(null);        // null
```

A parameter default (`= ..`) only triggers when the argument is missing *or* is exactly `undefined`. Passing `null` does not trigger the default — `null` is assigned to the parameter directly.

## Boolean Values

The `boolean` type contains exactly two values: `false` and `true`.

Boolean values drive all decision making in a JS program:

```js
if (isLoggedIn) {
    // do something
}

while (!isComplete) {
    // keep going
}
```

The `!` operator negates/flips a boolean: `false` becomes `true`, and `true` becomes `false`.

## String Values

The `string` type contains any value which is a collection of one or more characters, delimited by quote characters.

- Delimiters: double-quotes (`"`), single-quotes (`'`), or back-ticks (`` ` ``). The ending delimiter must match the starting delimiter.
- JS does not distinguish a single character as a different type; `"a"` is a string just like `"abc"`.
- Strings have an intrinsic length corresponding to how many code-units they contain.

```js
myName = "Kyle";

myName.length;      // 4
```

### JS Character Encodings

JS uses UTF-16 (related to, but not exactly the same as, UCS-2) for string character encoding.

**Unicode code-points:**
- Range: `0` to `1114111` (`0x10FFFF`)
- Standard notation: `U+` followed by 4-6 hexadecimal digits (e.g., `U+2764` = `❤`)

**BMP (Basic Multilingual Plane):**
- First 65,535 code-points (`U+0000` to `U+FFFF`)
- Fit neatly into a single UTF-16 code unit (16 bits)

**Supplemental/Astral Planes (non-BMP):**
- All code-points above the BMP require 21 bits
- JS stores them as two adjacent 16-bit code units called *surrogate halves* (*surrogate pairs*)
- Example: `🎆` is code-point `U+1F386`, stored as surrogate pair `U+D83C` + `U+DF86`
- The two surrogate halves are only valid/meaningful when paired adjacent to each other
- A single visible character like `🎆` counts as **2** characters for string length

### Escape Sequences

In `"` or `'` delimited strings, `\` introduces character-escape sequences.

**Single-character escape sequences** (recognized after `\`):
- `b`, `f`, `n`, `r`, `t`, `v`, `0`, `'`, `"`, `\`
- `\n` = newline, `\t` = tab, etc.
- Any other character after `\` (except `x` and `u`): the `\` is dropped, leaving the literal character

**Delimiter escaping:**
- `\"` to include `"` inside a `"`-delimited string
- `\'` to include `'` inside a `'`-delimited string
- The opposite delimiter does not need escaping

```js
myTitle = "Kyle Simpson (aka, \"getify\"), former O'Reilly author";

console.log(myTitle);
// Kyle Simpson (aka, "getify"), former O'Reilly author
```

**Backslash literal:** use `\\` to insert a single `\` character:

```js
windowsFontsPath =
    "C:\\Windows\\Fonts\\";

console.log(windowsFontsPath);
// C:\Windows\Fonts\"
```

| TIP: |
| :--- |
| What about four backslashes `\\\\` in a string literal? Well, that's just two `\\` escape sequences next to each other, so it results in two adjacent backslashes (`\\`) in the underlying string value. You might recognize there's an odd/even rule pattern at play. You should thus be able to deciper any odd (`\\\\\`, `\\\\\\\\\`, etc) or even (`\\\\\\`, `\\\\\\\\\\`, etc) number of backslashes in a string literal. |

#### Line Continuation

`\` immediately before an actual newline character (not `\n`) creates a *line continuation* — the newline is omitted from the string value:

```js
greeting = "Hello \
Friends!";

console.log(greeting);
// Hello Friends!
```

Without the escaping `\`, a literal newline inside a `"` or `'` delimited string produces a syntax error.

### Multi-Character Escapes

**Hexadecimal escape sequences:** `\x` followed by exactly two hex digits (`00`–`FF`), encoding ASCII characters (codes 0–255):

```js
copyright = "\xA9";  // or "\xa9"

console.log(copyright);     // ©
```

```js
"a" === "\x61";             // true
```

#### Unicode In Strings

**4-digit Unicode escape sequences:** `\u` followed by exactly four hex digits, encoding any BMP character:

```js
// © = ©, ☺ = ☺
```

**Extended Unicode (curly brace form):** for code-points above `U+FFFF`, wrap hex digits in `{ }`:

```js
myReaction = "\u{1F4A9}";

console.log(myReaction);
// 💩
```

The same character can also be written as an explicit surrogate pair:

```js
myReaction = "💩";

console.log(myReaction);
// 💩
```

All three representations are stored identically and are indistinguishable:

```js
"💩" === "\u{1F4A9}";                // true
"\u{1F4A9}" === "💩";     // true
```

##### Unicode Normalization

Some characters can be represented in multiple ways. The `"é"` character, for example:
- *Composed* form: single code-point `U+00E9` (`é`)
- *Decomposed* form: `"e"` (`U+0065`) + combining tilde (`U+0301`)

```js
eTilde1 = "é";
eTilde2 = "é";
eTilde3 = "é";

console.log(eTilde1);       // é
console.log(eTilde2);       // é
console.log(eTilde3);       // é
```

Visually identical, but internally different — affects `length`, equality, and relational comparison:

```js
eTilde1.length;             // 2
eTilde2.length;             // 1
eTilde3.length;             // 2

eTilde1 === eTilde2;        // false
eTilde1 === eTilde3;        // true
```

A copy-pasted `"é"` may be in either form with no visual indication:

```js
"é" === "é";           // false!!
```

Use `normalize(..)` to canonicalize before comparing or computing length:

```js
eTilde1 = "é";
eTilde2 = "\u{e9}";
eTilde3 = "\u{65}\u{301}";

eTilde1.normalize("NFC") === eTilde2;
eTilde2.normalize("NFD") === eTilde3;
```

- `"NFC"`: combines adjacent code-points into the *composed* code-point
- `"NFD"`: splits a single code-point into its *decomposed* code-points

##### Unicode Grapheme Clusters

Multiple adjacent code-points can cluster into a single visually distinct symbol called a *grapheme* (or *grapheme cluster*). Example — the family emoji `"👩‍👩‍👦‍👦"` is made up of 7 separate code-points:

```js
familyEmoji = "\u{1f469}\u{200d}\u{1f469}\u{200d}\u{1f466}\u{200d}\u{1f466}";

familyEmoji;            // 👩‍👩‍👦‍👦
```

- This is *not* a single registered Unicode code-point — normalization cannot compose these 7 code-points into one
- Unlike surrogate pairs and combining marks, grapheme cluster symbols *can* act as standalone characters, but combine when adjacent
- Significantly affects length computations, comparison, sorting, and other string operations

### Template Literals

Back-tick delimited strings (`` `..` ``):

```js
myName = `Kyle`;
```

All the same character encoding, escape sequence, and length rules apply. Additionally, template literals support expression interpolation via `${ .. }`:

```js
myName = `Kyle`;

greeting = `Hello, ${myName}!`;

console.log(greeting);      // Hello, Kyle!
```

The expression inside `${ .. }` can be any arbitrary JS expression, including another template literal.

**Newlines in template literals** are included literally in the string value — no `\` needed for line continuation:

```js
myPoem = `
Roses are red
Violets are blue
C3PO's a funny robot
and so R2.`;

console.log(myPoem);
//
// Roses are red
// Violets are blue
// C3PO's a funny robot
// and so R2.
```

If you `\` escape the end of a line in a template literal, the newline is omitted (same as `"` / `'` strings).

**Tagged template literals:** a tag function applied before the template literal; the function receives the parsed string literals and interpolated expressions, and may return any value:

```js
price = formatCurrency`The cost is: ${totalCost}`;
```

- Tagged template literals can return any type, not just strings
- Untagged template literals always produce strings

**Restrictions on back-tick strings:**
- Cannot be used for `"use strict"` pragma (silently ignored, accidentally runs in non-strict mode)
- Cannot be used in quoted property names of object literals, destructuring patterns, or `import .. from ..` module-specifier clause

## Number Values

The `number` type represents any numeric value (whole or decimal), stored as 64-bit IEEE-754 double-precision binary floating-point. [^IEEE754]

- `number`s are always decimals — there is no separate integer type
- `42`, `42.0`, and `42.000000` are indistinguishable in JS

```js
Number.isInteger(42);           // true
Number.isInteger(42.0);         // true
Number.isInteger(42.000000);    // true

Number.isInteger(42.0000001);   // false
```

### Parsing vs Coercion

**Parsing-conversion** (`parseInt(..)` / `parseFloat(..)`):** character-by-character left-to-right; stops at the first non-numeric character; only meaningful for string values:

```js
someNumericText = "123.456";

parseInt(someNumericText,10);               // 123
parseFloat(someNumericText);                // 123.456

parseInt("42",10) === parseFloat("42");     // true

parseInt("512px");                          // 512
```

- `parseInt(..)` stops at `.` (not valid for integers)
- `parseFloat(..)` accepts `.` and keeps parsing
- `parseInt(..)` takes an optional `radix` argument (range `2`–`36`): `10` = decimal, `2` = binary, `8` = octal, `16` = hex
- Always specify an explicit `radix` — omitting it causes auto-guessing based on the first character, which leads to subtle bugs
- `parseFloat(..)` always uses radix `10`; no second argument accepted
- If parsing fails on the first character, both return `NaN`

| WARNING: |
| :--- |
| One surprising difference between `parseInt(..)` and `parseFloat(..)` is that `parseInt(..)` will not fully parse scientific notation (e.g., `"1.23e+5"`), instead stopping at the `.` as it's not valid for integers; in fact, even `"1e+5"` stops at the `"e"`. `parseFloat(..)` on the other hand fully parses scientific notation as expected. |

| NOTE: |
| :--- |
| Parsing is only relevant for string values, as it's a character-by-character (left-to-right) operation. It doesn't make sense to parse the contents of a `boolean`, nor to parse the contents of a `number` or a `null`; there's nothing to parse. If you pass anything other than a string value to `parseInt(..)` / `parseFloat(..)`, those utilities first convert that value to a string and then try to parse it. That's almost certainly problematic (leading to bugs) or wasteful -- `parseInt(42)` is silly, and `parseInt(42.3)` is an abuse of `parseInt(..)` to do the job of `Math.floor(..)`. |

**Coercive-conversion** (`Number(..)` / unary `+`):** all-or-nothing — entire string must be numeric, or the result is `NaN`:

```js
someNumericText = "123.456";

Number(someNumericText);        // 123.456
+someNumericText;               // 123.456

Number("512px");                // NaN
+"512px";                       // NaN
```

### Other Numeric Representations

Whole-number literals can be written in binary, octal, or hexadecimal:

```js
// binary
myAge = 0b101010;
myAge;              // 42

// octal
myAge = 0o52;
myAge;              // 42

// hexadecimal
myAge = 0x2a;
myAge;              // 42
```

- Prefixes: `0b` (binary), `0o` (octal), `0x` (hex) — always use lowercase prefix forms (`0O` is visually ambiguous)
- Decimal fractions are not allowed in these forms
- All produce the same underlying numeric value; `toString(..)` converts back to any base:

```js
myAge = 42;

myAge.toString(2);          // "101010"
myAge.toString(8);          // "52"
myAge.toString(16);         // "2a"
myAge.toString(23);         // "1j"
myAge.toString(36);         // "16"
```

Round-tripping with `parseInt(..)`:

```js
myAge = 42;

parseInt(myAge.toString("23"),23);      // 42
```

**Scientific notation:**

```js
myAge = 4.2E1;      // or 4.2e1 or 4.2e+1

myAge;              // 42
```

- `4.2E1` means `4.2 * (10 ** 1)`; exponent sign defaults to `+`
- Negative exponent moves the decimal left: `4.2E-3` → `0.0042`
- JS automatically uses scientific notation in string output for values requiring more than 21 digits of precision:

```js
ratherBigNumber = 123 ** 11;
ratherBigNumber.toString();     // "9.748913698143826e+22"

prettySmallNumber = 123 ** -11;
prettySmallNumber.toString();   // "1.0257553107587752e-23"
```

- Force scientific notation with `toExponential(..)` (optional argument = decimal digits):

```js
plainBoringNumber = 42;

plainBoringNumber.toExponential();      // "4.2e+1"
plainBoringNumber.toExponential(0);     // "4e+1"
plainBoringNumber.toExponential(4);     // "4.2000e+1"
```

**Numeric separator (`_`):** can be inserted anywhere in a numeric literal for readability; JS ignores it:

```js
someBigPowerOf10 = 1_000_000_000;

totalCostInPennies = 123_45;  // vs 12_345
```

### IEEE-754 Bitwise Binary Representations

64-bit IEEE-754 ("double-precision") divides 64 bits into three sections:

- **52 bits** — mantissa/significand (base value)
- **11 bits** — exponent (raise `2` to this power before multiplying)
- **1 bit** — sign of the final value

Bit layout (S = Sign, E = Exponent, M = Mantissa):

```js
SEEEEEEEEEEEMMMMMMMMMMMMMMMMMMMM
MMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM
```

Example — `42` in IEEE-754 bits:

```
// 42:
01000000010001010000000000000000
00000000000000000000000000000000
```

| NOTE: |
| :--- |
| Since only 52 of the 64 bits are actually used to represent the base value, `number` doesn't actually have `2^64` values in it. According to the specification for the `number` type[^NumberType], the number of values is precisely `2^64 - 2^53 + 3`, or about 18 quintillion, split about evenly between positive and negative numbers. |

Decoding `42`:
- Sign bit `0` → positive
- Exponent bits `10000000100` = `1028` in base-10; subtract bias `1023` → effective exponent `5`; `2^5 = 32`
- Mantissa bits `01010000...` → binary decimal `1.0101000...` → base-10 `1.3125`
- `1.3125 * 32 = 42`

| NOTE: |
| :--- |
| If the subtracting `1023` from the exponent value gives a negative (e.g., `-3`), that's still interpreted as `2`'s exponent; raising `2` to negative numbers just produces smaller and smaller values. |

This is called "floating point" because the decimal point *floats* along the bits depending on the exponent value.

### Number Limits

The largest finite `number` value:

```js
Number.MAX_VALUE;           // 1.7976931348623157e+308
```

```js
Number.isInteger(Number.MAX_VALUE);         // true
```

Going above `Number.MAX_VALUE` does not increment — arithmetic overflow produces `Infinity`:

```js
Number.MAX_VALUE === (Number.MAX_VALUE + 1);
// true -- oops!

Number.MAX_VALUE + 1E292;           // Infinity

Number.MAX_VALUE * 1.0000000001;    // Infinity

1 / 1E-309;                         // Infinity
```

```js
Number.isFinite(Number.MAX_VALUE);  // true

Number.isFinite(Infinity);          // false
Number.isFinite(-Infinity);         // false
```

| TIP: |
| :--- |
| The reverse is not true: an arithmetic operation on an infinite value *will never* produce a finite value. |

The smallest representable absolute decimal value (closest to zero, not most negative):

```js
Number.MIN_VALUE;               // 5e-324 <-- usually!
```

Most JS engines expose ~`5E-324` (`~2^-1074`). This is implementation-dependent — do not rely on it for program logic.

### Safe Integer Limits

The largest integer that can be accurately stored in `number` is `2^53 - 1` — far smaller than `Number.MAX_VALUE`:

```js
maxInt = Number.MAX_SAFE_INTEGER;

maxInt;             // 9007199254740991

maxInt + 1;         // 9007199254740992

maxInt + 2;         // 9007199254740992  <-- same result, precision lost!
```

```js
Number.MIN_SAFE_INTEGER;    // -9007199254740991
```

```js
Number.isSafeInteger(2 ** 53);      // false
Number.isSafeInteger(2 ** 53 - 1);  // true
```

### Double Zeros

JS has two zeros: `0` and `-0` (negative zero), mandated by IEEE-754. All floating-point numbers are signed, including zero.

JS hides `-0` in most contexts, but it can be produced and detected:

```js
function isNegZero(v) {
    return v == 0 && (1 / v) == -Infinity;
}

regZero = 0 / 1;
negZero = 0 / -1;

regZero === negZero;        // true -- oops!
Object.is(-0,regZero);      // false -- phew!
Object.is(-0,negZero);      // true

isNegZero(regZero);         // false
isNegZero(negZero);         // true
```

Use case: representing both magnitude (speed) and direction of movement — without signed zero, you can't tell which direction an item was moving when it stopped.

| NOTE: |
| :--- |
| While JS defines a signed zero in the `number` type, there is no corresponding signed zero in the `bigint` number type. As such, `-0n` is just interpreted as `0n`, and the two are indistinguishable. |

### Invalid Number

Invalid mathematical or coercive numeric operations produce `NaN`:

```js
42 / "Kyle";            // NaN

myAge = Number("just a number");
myAge;                  // NaN

+undefined;             // NaN
```

`NaN` is technically a `number` value (numeric operations always produce a `number`). It is the only value in JS that lacks the *identity property* — it is never equal to itself:

```js
NaN === NaN;            // false
```

Correct ways to check for `NaN`:

```js
politicianIQ = "nothing" / Infinity;

Number.isNaN(politicianIQ);         // true

Object.is(NaN,politicianIQ);        // true

[ NaN ].includes(politicianIQ);     // true
```

| WARNING: |
| :--- |
| JS originally provided a global function called `isNaN(..)` for `NaN` checking, but it unfortunately has a long-standing coercion bug. `isNaN("Kyle")` returns `true`, even though the string value `"Kyle"` is most definitely *not* the `NaN` value. This is because the global `isNaN(..)` function forces any non-`number` argument to coerce to a `number` first, before checking for `NaN`. Coercing `"Kyle"` to a `number` produces `NaN`, so now the function sees a `NaN` and returns `true`! This buggy global `isNaN(..)` still exists in JS, but should never be used. When `NaN` checking, always use `Number.isNaN(..)`, `Object.is(..)`, etc. |

## BigInteger Values

`bigint` stores arbitrarily large integers (theoretically unlimited, bounded only by machine memory). Required when values exceed `Number.MAX_SAFE_INTEGER` (`9007199254740991`).

`bigint` literals use the `n` suffix:

```js
myAge = 42n;        // this is a bigint, not a number

myKidsAge = 11;     // this is a number, not a bigint
```

Precise arithmetic above the `number` safe integer limit:

```js
Number.MAX_SAFE_INTEGER;        // 9007199254740991

Number.MAX_SAFE_INTEGER + 2;    // 9007199254740992 -- oops!

myBigInt = 9007199254740991n;

myBigInt + 2n;                  // 9007199254740993n -- phew!

myBigInt ** 2n;                 // 81129638414606663681390495662081n
```

| WARNING: |
| :--- |
| Notice that the `+` operator required `.. + 2n` instead of just `.. + 2`? You cannot mix `number` and `bigint` value-types in the same expression. This restriction is annoying, but it protects your program from invalid mathematical operations that would give non-obvious unexpected results. |

`BigInt(..)` converts a `number` or string to `bigint` (called without `new`):

```js
myAge = 42n;

inc = 1;

myAge += BigInt(inc);

myAge;              // 43n
```

```js
myBigInt = BigInt("12345678901234567890");

myBigInt;                       // 12345678901234567890n
```

- `BigInt(..)` is all-or-nothing: any non-numeric character (including `.` or trailing `n`) throws an exception
- Unlike `parseInt(..)`, it does not parse character-by-character and stop at the first invalid character

## Symbol Values

`symbol` values are opaque, unique, and unguessable — created only with `Symbol(..)` (called without `new`):

```js
secret = Symbol("my secret");
```

The string argument to `Symbol(..)` is an optional descriptive label for debugging only — it is not the symbol value itself. The underlying value is never exposed.

Symbols are guaranteed unique within the program — no duplicate symbol value can ever be created.

**Use case 1 — unique sentinel values:**

```js
EMPTY = Symbol("not set yet");
myNickname = EMPTY;

// later:

if (myNickname == EMPTY) {
    // ..
}
```

**Use case 2 — special (meta-) properties on objects:**

```js
myInfo = {
    name: "Kyle Simpson",
    nickname: "getify",
    age: 42
};

// later:
PRIVATE_ID = Symbol("private unique ID, don't touch!");

myInfo[PRIVATE_ID] = generateID();
```

Symbol properties are publicly visible but treated as set-apart from normal properties. Comparable to:

```js
Object.defineProperty(myInfo,"__private_id_dont_touch",{
    value: generateID(),
    enumerable: false,
});
```

### Well-Known Symbols (WKS)

JS pre-defines a set of *well-known symbols* (WKS) stored as static properties on the `Symbol` function, representing special meta-programming hooks on objects:

```js
myInfo = {
    // ..
};

String(myInfo);         // [object Object]

myInfo[Symbol.toStringTag] = "my-info";
String(myInfo);         // [object my-info]
```

`Symbol.toStringTag` overrides the default string representation of a plain object, replacing `"Object"` with a custom value.

### Global Symbol Registry

For symbols that need to be accessible across multiple files/modules, JS provides a global symbol registry:

```js
// retrieve if already registered,
// otherwise register
PRIVATE_ID = Symbol.for("private-id");

// elsewhere:

privateIDKey = Symbol.keyFor(PRIVATE_ID);
privateIDKey;           // "private-id"

// elsewhere:

// retrieve symbol from registry undeer
// specified key
privateIDSymbol = Symbol.for(privateIDKey);
```

- `Symbol.for(key)`: registers a new symbol under `key` if not already registered; returns the existing symbol if it is
- `Symbol.keyFor(symbol)`: given a symbol, returns the key it's registered under (if any)
- The `key` passed to `Symbol.for(..)` is distinct from the descriptive label passed to `Symbol(..)` — the key must be unique, the label need not be

### Object or Primitive?

Symbols behave as primitives:
- Cannot set properties on them (same as all primitives)
- Auto-boxed to wrapper object for property/method access
- Used as object keys (alongside strings; objects cannot use other objects as keys)
- Some engines implement symbols internally as unique, monotonically incrementing integers

Despite `Symbol()` being listed under "Fundamental Objects" in the specification, the spec's "Terms and Definitions" explicitly lists symbol as a primitive value. [^PrimitiveValues]

[^PrimitiveValues]: "4.4.5 primitive value", ECMAScript 2022 Language Specification; https://tc39.es/ecma262/#sec-primitive-value ; Accessed August 2022

[^UTFUCS]: "JavaScript's internal character encoding: UCS-2 or UTF-16?"; Mathias Bynens; January 20 2012; https://mathiasbynens.be/notes/javascript-encoding ; Accessed July 2022

[^IEEE754]: "IEEE-754"; https://en.wikipedia.org/wiki/IEEE_754 ; Accessed July 2022

[^NumberType]: "6.1.6.1 The Number Type", ECMAScript 2022 Language Specification; https://262.ecma-international.org/13.0/#sec-ecmascript-language-types-number-type ; Accessed August 2022

[^SignedZero]: "Signed Zero", Wikipedia; https://en.wikipedia.org/wiki/Signed_zero ; Accessed August 2022
