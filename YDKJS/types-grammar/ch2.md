# You Don't Know JS Yet: Types & Grammar - 2nd Edition
# Chapter 2: Primitive Behaviors

## Primitive Immutability

All primitive values are immutable — nothing in a JS program can modify a primitive value's contents.

```js
myAge = 42;

// later:

myAge = 43;
```

`myAge = 43` doesn't change the value `42`. It reassigns a different value `43` to `myAge`, completely replacing `42`.

Operations create new values; they do not modify the original:

```js
42 + 1;             // 43

"Hello" + "!";      // "Hello!"
```

Even strings — which look like arrays of characters — are immutable:

```js
greeting = "Hello.";

greeting[5] = "!";

console.log(greeting);      // Hello.
```

| WARNING: |
| :--- |
| In non-strict mode, assigning to a read-only property (like `greeting[5] = ..`) silently fails. In strict-mode, the disallowed assignment will throw an exception. |

- `const` does not create immutable values — it prevents reassignment of the variable (immutable binding), not the value itself.
- A property marked `writable: false` only prevents property reassignment; it does not affect the immutability of the value itself.

### Primitives With Properties?

Properties cannot be added to any primitive values:

```js
greeting = "Hello.";

greeting.isRendered = true;

greeting.isRendered;        // undefined
```

This assignment silently fails (even in strict-mode).

- Property access is **not allowed** on `null` and `undefined`.
- Properties **can** be accessed on all other primitive values.

For example, all string values have a read-only `length` property:

```js
greeting = "Hello.";

greeting.length;            // 6
```

| NOTE: |
| :--- |
| For most standard characters, one character = one code-point = one code-unit. However, extended Unicode characters above code-point `65535` are stored as two code-units (surrogate halves), so `length` counts `2` for each such character, even though it visually prints as one symbol. |

Non-nullish primitive values also have standard built-in methods:

```js
greeting = "Hello.";

greeting.toString();    // "Hello." <-- redundant
greeting.valueOf();     // "Hello."
```

| NOTE: |
| :--- |
| Property/method accesses on primitive values are facilitated by an implicit coercive behavior called *auto-boxing*. Covered in "Automatic Objects" in Chapter 3. |

## Primitive Assignments

Any assignment of a primitive value from one variable to another is a *value-copy*:

```js
myAge = 42;

yourAge = myAge;        // assigned by value-copy

myAge;                  // 42
yourAge;                // 42
```

`myAge` and `yourAge` each have their own copy of `42`. Reassigning one does not affect the other:

```js
myAge++;            // sort of like: myAge = myAge + 1

myAge;              // 43
yourAge;            // 42 <-- unchanged
```

| NOTE: |
| :--- |
| Inside the JS engine, it *may* be the case that only one `42` value exists in memory, with both variables pointing to it. Since primitive values are immutable, there's no danger in sharing. But from a developer perspective, `myAge` and `yourAge` act as if they have their own copy. |

## String Behaviors

### String Character Access

Though strings are not arrays, JS allows `[ .. ]` array-style access of a character at a numeric (`0`-based) index:

```js
greeting = "Hello!";

greeting[4];            // "o"
```

If the value between `[ .. ]` is not a number, it's implicitly coerced to its whole/integer numeric representation:

```js
greeting["4"];          // "o"
```

If the value resolves to a number outside `0` - `length - 1` (or `NaN`), or is not a `number` type, the access is treated as a property access with the string-equivalent property name. If that fails, the result is `undefined`.

### Character Iteration

Strings are iterables. Characters (code-units) can be iterated individually via `...`, `for..of`, and `Array.from(..)`:

```js
myName = "Kyle";

for (let char of myName) {
    console.log(char);
}
// K
// y
// l
// e

chars = [ ...myName ];
chars;
// [ "K", "y", "l", "e" ]
```

Iterability is provided by the method at `Symbol.iterator`:

```js
myName = "Kyle";
it = myName[Symbol.iterator]();

it.next();      // { value: "K", done: false }
it.next();      // { value: "y", done: false }
it.next();      // { value: "l", done: false }
it.next();      // { value: "e", done: false }
it.next();      // { value: undefined, done: true }
```

### Length Computation

`length` always counts the number of **code-units**, not code-points and not graphemes.

- One standard character = one code-unit → `length` is intuitive
- Extended Unicode characters (code-point > `65535`) = two code-units (surrogate pair) → `length` counts `2`
- Grapheme clusters (multiple code-points rendering as one visual character) → `length` counts each code-unit separately

**Normalize first** to compose decomposed code-units where possible:

```js
favoriteItem = "teléfono";
favoriteItem.length;            // 9 -- uh oh!

favoriteItem = favoriteItem.normalize("NFC");
favoriteItem.length;            // 8 -- phew!
```

**Surrogate pairs** still count double after normalization:

```js
// "☎" === "☎"
oldTelephone = "☎";
oldTelephone.length;            // 1

// "📱" === "\u{1F4F1}" === "📱"
cellphone = "📱";
cellphone.length;               // 2 -- oops!
```

**Fix for surrogate pairs**: use spread iteration, which returns each combined character from a surrogate pair:

```js
cellphone = "📱";
cellphone.length;               // 2 -- oops!
[ ...cellphone ].length;        // 1 -- phew!
```

**Grapheme clusters** are not fixed by iteration:

```js
// "👎🏾" = "\u{1F44E}\u{1F3FE}"
thumbsDown = "👎🏾";

thumbsDown.length;              // 4 -- oops!
[ ...thumbsDown ].length;       // 2 -- oops!
```

Two distinct code-points that together render as one visual symbol. Getting a reliable grapheme count requires a dedicated library or platform-level Unicode rendering logic.

### Internationalization (i18n) and Localization (l10n)

A JS program defaults to a locale/language according to the environment. The active locale affects sorting, comparisons, formatting, and more.

- Strings may be LTR or RTL depending on content.
- Methods use logical descriptors ("start", "end") rather than directional ones ("left", "right").

Hebrew and Arabic are RTL languages. Characters are stored in logical order (position `0` = first logical character), and the rendering layer handles RTL display:

```js
hebrewHello = "\u{5e9}\u{5dc}\u{5d5}\u{5dd}";

console.log(hebrewHello);                       // שלום
```

```js
arabicHello = "\u{631}\u{62d}\u{628}\u{627}";

console.log(arabicHello);                       // رحبا

console.log(arabicHello[0]);                    // ر
```

Force a specific locale for comparisons using `Intl.Collator`:

```js
germanStringSorter = new Intl.Collator("de");

listOfGermanWords = [ /* .. */ ];

germanStringSorter.compare("Hallo","Welt");
// -1 (or negative number)

// examples adapted from MDN:
//
germanStringSorter.compare("Z","z");
// 1 (or positive number)

caseFirstSorter = new Intl.Collator("de",{ caseFirst: "upper", });
caseFirstSorter.compare("Z","z");
// -1 (or negative number)
```

Segment multi-word strings using `Intl.Segmenter`:

```js
arabicHelloWorld = "\u{645}\u{631}\u{62d}\u{628}\u{627} \
\u{628}\u{627}\u{644}\u{639}\u{627}\u{644}\u{645}";

console.log(arabicHelloWorld);      // مرحبا بالعالم

arabicSegmenter = new Intl.Segmenter("ar",{ granularity: "word" });

for (
    let { segment: word, isWordLike } of
    arabicSegmenter.segment(arabicHelloWorld)
) {
    if (isWordLike) {
        console.log(word);
    }
}
// مرحبا
//لعالم
```

### String Comparison

Both equality and relational string comparisons are case-sensitive. To make case-insensitive comparisons, normalize casing with `toUpperCase()` or `toLowerCase()` first.

#### String Equality

`===` (strict equality) checks type first, then performs per-code-unit comparison from start to end:

```js
"my name" === "my n\x61me";               // true

"my name" !== String.raw`my n\x61me`;     // true
```

##### Coercive Equality

`==` (loose equality) coerces operands to matching types, then delegates to `===`:

- If both operands are already strings, `==` and `===` behave identically.
- If types differ, `==` *prefers* numeric comparison — coercing both operands to numbers.

```js
// actual string equality check (via === internally):
"42" == "42";           // true

// numeric (not string!) equality check:
42 == "42";             // true
```

| NOTE: |
| :--- |
| The common claim that `==` compares values while `===` compares values and types is inaccurate. Both operators are type-aware. If types match, both do the same thing. If types differ, `==` coerces until they match; `===` returns `false` immediately. |

##### *Really* Strict Equality

`Object.is(..)` returns `true` only if both arguments are exactly identical — no exceptions:

```js
Object.is("42",42);             // false

Object.is("42","\x34\x32");     // true
```

Reserve `Object.is(..)` for the corner cases where `===` has surprising behavior (namely `NaN` and `-0`).

#### String Relational Comparisons

`<`, `<=`, `>`, `>=` compare strings **lexicographically** (dictionary order):

```js
"hello" < "world";          // true
```

- These operators are numerically coercive — any non-string operand is coerced to a number.
- If both operands are strings, lexicographic comparison is used.
- Numeric-looking strings are compared lexicographically, not numerically:

```js
"100" < "11";               // true
```

`"100"` sorts before `"11"` because `"0"` < `"1"` at position 1.

`<=` and `>=` are shorthand for a compound check:

```js
"hello" <= "hello";                             // true
("hello" < "hello") || ("hello" == "hello");    // true

"hello" >= "hello";                             // true
("hello" > "hello") || ("hello" == "hello");    // true
```

| NOTE: |
| :--- |
| JS defines `>` and `>=` by reversing arguments to their less-than complements: `x > y` is treated as `y <= x`, and `x >= y` is treated as `y < x`. |

##### Locale-Aware Relational Comparisons

`localeCompare(..)` forces a specific locale for comparisons:

```js
"hello".localeCompare("world");
// -1 (or negative number)

"world".localeCompare("hello","en");
// 1 (or positive number)

"hello".localeCompare("hello","en",{ ignorePunctuation: true });
// 0

// examples from MDN:
//
// in German, ä sorts before z
"ä".localeCompare("z","de");
// -1 (or negative number) // a negative value

// in Swedish, ä sorts after z
"ä".localeCompare("z","sv");
// 1 (or positive number)
```

The optional second and third arguments control locale via the `Intl.Collator` API.

Sorting an array of strings with `localeCompare(..)`:

```js
studentNames = [
    "Lisa",
    "Kyle",
    "Jason"
];

// Array::sort() mutates the array in place
studentNames.sort(function alphabetizeNames(name1,name2){
    return name1.localeCompare(name2);
});

studentNames;
// [ "Jason", "Kyle", "Lisa" ]
```

More performant approach when sorting many strings — use `Intl.Collator` directly:

```js
studentNames = [
    "Lisa",
    "Kyle",
    "Jason"
];

nameSorter = new Intl.Collator("en");

// Array::sort() mutates the array in place
studentNames.sort(nameSorter.compare);

studentNames;
// [ "Jason", "Kyle", "Lisa" ]
```

### String Concatenation

The `+` operator concatenates strings if either operand is a string (including empty string `""`):

```js
greeting = "Hello, " + "Kyle!";

greeting;               // Hello, Kyle!
```

Non-string operands are coerced to their string representation:

```js
userCount = 7;

status = "There are " + userCount + " users online";

status;         // There are 7 users online
```

Template literals are the preferred approach for string interpolation:

```js
userCount = 7;

status = `There are ${userCount} users online`;

status;         // There are 7 users online
```

Other options (`"one".concat("two","three")` and `[ "one", "two", "three" ].join("")`) are preferable only when the number of strings to concatenate depends on runtime conditions. For fixed content, use template literals.

### String Value Methods

* `charAt(..)`: produces a new string value at the numeric index, similar to `[ .. ]`; unlike `[ .. ]`, the result is always a string — either the character at position `0` (if a valid number outside the indices range), or `""` (if missing/invalid index)

* `at(..)`: similar to `charAt(..)`, but negative indices count backwards from the end of the string

* `charCodeAt(..)`: returns the numeric code-unit at the specified index

* `codePointAt(..)`: returns the whole code-point starting at the specified index; if a surrogate pair is found there, the whole character (code-point) is returned

* `substr(..)` / `substring(..)` / `slice(..)`: produces a new string value representing a range of characters from the original string; differ in how the range's start/end indices are specified

* `toUpperCase()`: produces a new string value with all uppercase characters

* `toLowerCase()`: produces a new string value with all lowercase characters

* `toLocaleUpperCase()` / `toLocaleLowerCase()`: uses locale mappings for case operations

* `concat(..)`: produces a new string value that's the concatenation of the original string and all string arguments passed in

* `indexOf(..)`: searches for a string value in the original string, optionally starting from a position; returns `0`-based index if found, `-1` if not

* `lastIndexOf(..)`: like `indexOf(..)` but searches from the end of the string

* `includes(..)`: similar to `indexOf(..)` but returns a boolean

* `search(..)`: similar to `indexOf(..)` but with regular-expression matching

* `trimStart()` / `trimEnd()` / `trim()`: produces a new string with whitespace trimmed from the start, end, or both

* `repeat(..)`: produces a new string with the original repeated the specified number of times

* `split(..)`: produces an array of string values split at the specified string or regular-expression boundaries

* `padStart(..)` / `padEnd(..)`: produces a new string with padding applied to start or end so the result is at least of a specified length; default padding is `" "` but can be overridden

* `startsWith(..)` / `endsWith(..)`: checks the start or end of the original string for the string argument; returns a boolean

* `match(..)` / `matchAll(..)`: returns an array-like regular-expression matching result against the original string

* `replace(..)`: returns a new string with one or more matching occurrences replaced

* `normalize(..)`: produces a new string with Unicode normalization applied

* `localCompare(..)`: compares two strings according to the current locale; returns a negative number if the original comes before the argument lexicographically, a positive number if after, and `0` if identical

* `anchor()`, `big()`, `blink()`, `bold()`, `fixed()`, `fontcolor()`, `fontsize()`, `italics()`, `link()`, `small()`, `strike()`, `sub()`, and `sup()`: historically used to generate HTML string snippets; now deprecated and should be avoided

| WARNING: |
| :--- |
| Many methods above rely on position indices. If an extended Unicode character is present and takes up two code-unit slots, it counts as two index positions. Failing to account for *decomposed* code-units, surrogate pairs, and grapheme clusters is a common source of bugs in JS string handling. |

String methods can be called directly on a literal or on a variable holding a string value. They produce new string values (since strings are immutable):

```js
"all these letters".toUpperCase();      // ALL THESE LETTERS

greeting = "Hello!";
greeting.repeat(2);                     // Hello!Hello!
greeting;                               // Hello!
```

### Static `String` Helpers

* `String.fromCharCode(..)` / `String.fromCodePoint(..)`: produce a string from one or more arguments representing code-units (`fromCharCode(..)`) or whole code-points (`fromCodePoint(..)`)

* `String.raw(..)`: a default template-tag function that allows interpolation on a template literal but prevents character escape sequences from being parsed — they remain as raw input characters

The `String(..)` function (no `new` keyword) explicitly coerces most values to their string equivalent:

```js
String(true);           // "true"
String(42);             // "42"
String(Infinity);       // "Infinity"
String(undefined);      // "undefined"
```

## Number Behaviors

### Floating Point Imprecision

JS numbers use IEEE-754 double-precision floating point — a format shared by the majority of programming languages. Not all operations and values can fit neatly into IEEE-754 representations:

```js
point3a = 0.1 + 0.2;
point3b = 0.3;

point3a;                        // 0.30000000000000004
point3b;                        // 0.3

point3a === point3b;            // false <-- oops!
```

The operation `0.1 + 0.2` produces floating-point error (drift). The respective bit representations:

```
// 0.30000000000000004
00111111110100110011001100110011
00110011001100110011001100110100

// 0.3
00111111110100110011001100110011
00110011001100110011001100110011
```

Only the last 2 bits differ (`00` vs `11`), but that's enough for inequality. This behavior is **not unique to JS** — any IEEE-754 conforming language will behave identically.

#### Epsilon Threshold

`Number.EPSILON` is the smallest difference JS can represent between `1` and the next value greater than `1` (approximately `2.2E-16`, or `2^-52`):

```js
Number.EPSILON;                 // 2.220446049250313e-16
```

A commonly recommended (but flawed) approach uses `Number.EPSILON` as a tolerance threshold:

```js
function safeNumberEquals(a,b) {
    return Math.abs(a - b) < Number.EPSILON;
}

point3a = 0.1 + 0.2;
point3b = 0.3;

// are these safely "equal"?
safeNumberEquals(point3a,point3b);      // true
```

| WARNING: |
| :--- |
| This approach is **not safe**. `Number.EPSILON` only works as a threshold for certain small numbers/operations. For others, it's far too small and yields false negatives: |

```js
point3a = 10.1 + 0.2;
point3b = 10.3;

safeNumberEquals(point3a,point3b);      // false :(
```

You could scale `Number.EPSILON` by some factor, but the right factor is a manual judgment call based on the magnitude of values in your program — there is no universal, automatic threshold.

| TIP: |
| :--- |
| To avoid floating-point issues: scale all numbers up to whole integers (or bigints) while performing math, and only deal with decimal values when outputting a final result. If that's not practical, use an arbitrary precision decimal emulation library and avoid `number` values entirely. |

### Numeric Comparison

Number values are compared using the same `==`, `===`, `<`, `<=`, `>`, `>=` operators. Floating-point imprecision affects equality comparisons — the exact binary contents are what's compared.

#### Numeric Equality

When both operand types are the same, `==` and `===` behave identically:

```js
42 == 42;                   // true
42 === 42;                  // true

42 == 43;                   // false
42 === 43;                  // false

Object.is(42,42);           // true
Object.is(42,43);           // false
```

`==` prefers numeric comparison when operand types differ:

```js
// numeric (not string!) comparison
42 == "42";                 // true
```

`"42"` is coerced to `42`, not vice versa.

JS doesn't distinguish between `42`, `42.0`, and `42.000000`:

```js
42 == 42.0;                 // true
42.0 == 42.00000;           // true
42.00 === 42.000;           // true
```

**Two exceptions** where `==` and `===` behave unexpectedly:

```js
NaN === NaN;                // false -- ugh!
-0 === 0;                   // true -- ugh!
```

- `NaN` is never equal to itself with `==` or `===`.
- `-0` is always equal to `0` with `==` or `===`.

Use `Object.is(..)` for reliable equality checks involving `NaN` and `-0`. For `NaN` specifically, `Number.isNaN(..)` also works.

#### Numeric Relational Comparisons

```js
41 < 42;                    // true

0.1 + 0.2 > 0.3;            // true (ugh, IEEE-754)
```

- `<` and `>` are coercive — non-number values are coerced to numbers, unless both operands are already strings.
- There are no strict relational comparison operators.
- To avoid coercion, ensure both operands are numbers.

### Mathematical Operators

Basic arithmetic operators: `+` (addition), `-` (subtraction), `*` (multiplication), `/` (division), `**` (exponentiation), `%` (modulo/division remainder). Assignment forms: `+=`, `-=`, `*=`, `/=`, `**=`, `%=`.

| NOTE: |
| :--- |
| The `+` operator is overloaded: if either operand is a string, the result is string concatenation (coercing the other operand to a string if necessary). If neither operand is a string, the result is numeric addition. |

Non-number operands are coerced to numbers:

```js
40 + 2;                 // 42
44 - 2;                 // 42
21 * 2;                 // 42
84 / 2;                 // 42
7 ** 2;                 // 49
49 % 2;                 // 1

40 + "2";               // "402" (string concatenation)
44 - "2";               // 42 (because "2" is coerced to 2)
21 * "2";               // 42 (..ditto..)
84 / "2";               // 42 (..ditto..)
"7" ** "2";             // 49 (both operands are coerced to numbers)
"49" % "2";             // 1 (..ditto..)
```

Unary `+` and `-` coerce their single operand to a number:

```js
+42;                    // 42
-42;                    // -42

+"42";                  // 42
-"42";                  // -42
```

JS does not recognize negative numeric literals. `-42` is the unary `-` operator applied to the positive literal `42`. Whitespace (and even newlines) are allowed between a unary operator and its operand:

```js
-42;                    // -42
- 42;                   // -42
-
    42;                 // -42
```

#### Increment and Decrement

`++` (increment) and `--` (decrement) perform their operation and reassign the result. They can appear postfix (after) or prefix (before) the operand:

```js
myAge = 42;

myAge++;
myAge;                  // 43

numberOfHeadHairs--;
```

```js
myAge = 42;

++myAge;
myAge;                  // 43

--numberofHeadHairs;
```

The positional difference (prefix vs. postfix) affects the *returned value of the expression*, not the final reassigned result. The final value of the variable is the same either way; the difference surfaces when the expression's result is used in a larger expression.

### Bitwise Operators

Bitwise operations are not performed against the IEEE-754 bit-pattern. Instead:
1. The operand number is converted to a 32-bit signed integer.
2. The bit operation is performed.
3. The result is converted back to an IEEE-754 number.

* `&` (bitwise AND): `42 & 36 === 32` (i.e., `0b00...101010 & 0b00...100100 === 0b00..100000`)

* `|` (bitwise OR): `42 | 36 === 46` (i.e., `0b00...101010 | 0b00...100100 === 0b00...101110`)

* `^` (bitwise XOR): `42 ^ 36 === 14` (i.e., `0b00...101010 ^ 0b00...100100 === 0b00...001110`)

* `~` (bitwise NOT): `~42 === -43` (i.e., `~0b00...101010 === 0b11...010101`); equivalent in decimal arithmetic: `~x === -(x + 1)`

* `<<` (left shift): `42 << 3 == 336` (i.e., `0b00...101010 << 3 === 0b00...101010000`)

* `>>` (right shift, sign-propagating): `42 >> 3 === 5`; discards bits off the right, copies the sign bit (leftmost) in from the left

* `>>>` (zero-fill right shift / unsigned right shift): same as `>>` but always fills `0` from the left, ignoring the sign; `42 >>> 3 === 5` but `-43 >>> 3 === 536870906`

* `&=`, `|=`, `<<=`, `>>=`, and `>>>=`: perform the bitwise operation and assign the result to the left operand (must be a valid assignment target); note: `~=` does not exist

Common use — truncate a decimal to integer (equivalent to `Math.trunc(..)`):

```js
myGPA = 3.54;

myGPA | 0;              // 3
```

| WARNING: |
| :--- |
| A common misconception is that `| 0` is like `Math.floor(..)`. They agree on positive numbers, but differ on negative numbers: `Math.floor(..)` rounds toward `-Infinity`, while `| 0` merely discards the decimal bits (truncation). |

### Number Value Methods

* `toExponential(..)`: produces a string in scientific notation (e.g., `"4.2e+1"`)

* `toFixed(..)`: produces a non-scientific-notation string with the specified number of decimal places (rounding or zero-padding as necessary)

* `toPrecision(..)`: like `toFixed(..)`, but the argument specifies total significant digits (whole + decimal)

* `toLocaleString(..)`: produces a string representation according to the current locale

```js
myAge = 42;

myAge.toExponential(3);         // "4.200e+1"
```

A `.` immediately after a numeric literal digit (with no existing decimal in the number) is parsed as the start of the decimal portion. Disambiguate with whitespace or wrapping parentheses:

```js
42 .toExponential(3);           // "4.200e+1"

(42).toExponential(3);          // "4.200e+1"
```

The "double-dot" idiom — the first `.` is a decimal, so the second `.` is unambiguously a property access:

```js
42..toExponential(3);           // "4.200e+1"
```

Trailing `.` on a numeric literal is valid syntax:

```js
myAge = 41. + 1.;

myAge;                          // 42
```

`bigint` values cannot have decimals, so a `.` after a bigint literal (with trailing `n`) is always a property access:

```js
42n.toString();                 // 42
```

### Static `Number` Properties

* `Number.EPSILON`: the smallest value possible between `1` and the next highest number

* `Number.NaN`: the same as the global `NaN` — the special invalid number

* `Number.MIN_SAFE_INTEGER` / `Number.MAX_SAFE_INTEGER`: the largest negative and positive integers that can be safely represented (`-2^53 + 1` to `2^53 - 1`)

* `Number.MIN_VALUE` / `Number.MAX_VALUE`: the minimum positive value closest to `0`, and the maximum positive value the `number` type can represent

* `Number.NEGATIVE_INFINITY` / `Number.POSITIVE_INFINITY`: same as global `-Infinity` and `Infinity`

### Static `Number` Helpers

* `Number.isFinite(..)`: returns a boolean — `true` if the value is a `number` that is not `NaN` and not `±Infinity`

* `Number.isInteger(..)` / `Number.isSafeInteger(..)`: both return booleans — whether the value is a whole number with no decimal places, and whether it's within the safe integer range

* `Number.isNaN(..)`: the bug-fixed version of global `isNaN(..)` — reliably identifies the special `NaN` value without coercing the argument first

* `Number.parseFloat(..)` / `Number.parseInt(..)`: parse string values for numeric digits left-to-right until end of string or first non-float (or non-integer) character

### Static `Math` Namespace

```js
Math.PI;                        // 3.141592653589793

// absolute value
Math.abs(-32.6);                // 32.6

// rounding
Math.round(-32.6);              // -33

// min/max selection
Math.min(100,Math.max(0,42));   // 42
```

`Math` is a plain object holding constants and static utilities — unlike `Number`, it cannot be called as a function.

| WARNING: |
| :--- |
| `Math.random()` produces a random floating point value between `0` and `1.0`. Its pseudo-random number generator (PRNG) is **not cryptographically secure** and can be predicted. Prefer `crypto.getRandomValues(..)` (based on a better PRNG), which fills a typed-array with random bits. Using `Math.random()` is universally discouraged. |

### BigInts and Numbers Don't Mix

`number` and `bigint` values cannot be mixed in the same operations:

```js
myAge = 42n;

myAge + 1;                  // TypeError thrown!
myAge += 1;                 // TypeError thrown!

myAge + 1n;                 // 43n
myAge += 1n;                // 43n

myAge++;
myAge;                      // 44n
```

Coerce between types using `BigInt(..)` (no `new`) and `Number(..)` (no `new`):

```js
BigInt(42);                 // 42n

Number(42n);                // 42
```

Coercion has risks — some conversions throw:

```js
BigInt(4.2);                // RangeError thrown!
BigInt(NaN);                // RangeError thrown!
BigInt(Infinity);           // RangeError thrown!

Number(2n ** 1024n);        // Infinity
```

[^TwitterUnicode]: "New update to the Twitter-Text library: Emoji character count"; Andy Piper; Oct 2018; https://twittercommunity.com/t/new-update-to-the-twitter-text-library-emoji-character-count/114607 ; Accessed July 2022

[^INTLAPI]: ECMAScript 2022 Internationalization API Specification; https://402.ecma-international.org/9.0/ ; Accessed August 2022

[^INTLCollator]: "Intl.Collator", MDN; https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Collator ; Accessed August 2022

[^INTLSegmenter]: "Intl.Segmenter", MDN; https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Segmenter ; Accessed August 2022

[^StrictEquality]: "7.2.16 IsStrictlyEqual(x,y)", ECMAScript 2022 Language Specification; https://262.ecma-international.org/13.0/#sec-isstrictlyequal ; Accessed August 2022

[^LooseEquality]: "7.2.15 IsLooselyEqual(x,y)", ECMAScript 2022 Language Specification; https://262.ecma-international.org/13.0/#sec-islooselyequal ; Accessed August 2022

[^EpsilonBad]: "PLEASE don't follow the code recipe in the accepted answer", Stack Overflow; Daniel Scott; July 2019; https://stackoverflow.com/a/56967003/228852 ; Accessed August 2022
