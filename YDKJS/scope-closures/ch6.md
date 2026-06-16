# You Don't Know JS Yet: Scope & Closures - 2nd Edition
# Chapter 6: Limiting Scope Exposure

## Least Exposure

**Principle of Least Privilege (POLP)** / **Principle of Least Exposure (POLE)**: components should function with least privilege, least access, least exposure.

Applied to scoping: declare variables in as small and deeply nested scopes as possible. Default to exposing the bare minimum necessary.

Three hazards from over-exposing variables via scope:

* **Naming Collisions**: a common identifier shared across scope causes unexpected overwrites. Example: a global `i` loop index mutated by a nested loop in another function.

* **Unexpected Behavior**: exposing *private* variables allows other code to use them in unintended ways, violating assumptions (e.g., an array expected to contain only numbers gets booleans/strings added).

* **Unintended Dependency**: other code depending on your private details creates a refactoring hazard — you can no longer change internal structure without risking breakage elsewhere.

```js
function diff(x,y) {
    if (x > y) {
        let tmp = x;
        x = y;
        y = tmp;
    }

    return y - x;
}

diff(3,7);      // 4
diff(7,5);      // 2
```

`tmp` is block-scoped with `let` to the `if` block — it has no reason to exist outside that block.

## Hiding in Plain (Function) Scope

`var` and `function` declarations can be hidden by wrapping a `function` scope around them.

Problem with naive caching — `cache` leaks to outer/global scope:

```js
var cache = {};

function factorial(x) {
    if (x < 2) return 1;
    if (!(x in cache)) {
        cache[x] = x * factorial(x - 1);
    }
    return cache[x];
}

factorial(6);
// 720

cache;
// {
//     "2": 2,
//     "3": 6,
//     "4": 24,
//     "5": 120,
//     "6": 720
// }

factorial(7);
// 5040
```

`cache` must survive multiple calls, so it can't live inside `factorial(..)`. Fix: add a middle scope.

Using a named function to create a hiding scope:

```js
// outer/global scope

function hideTheCache() {
    // "middle scope", where we hide `cache`
    var cache = {};

    return factorial;

    // **********************

    function factorial(x) {
        // inner scope
        if (x < 2) return 1;
        if (!(x in cache)) {
            cache[x] = x * factorial(x - 1);
        }
        return cache[x];
    }
}

var factorial = hideTheCache();

factorial(6);
// 720

factorial(7);
// 5040
```

Better: use a function expression so the name stays in its own scope (not the outer scope), avoiding name collisions:

```js
var factorial = (function hideTheCache() {
    var cache = {};

    function factorial(x) {
        if (x < 2) return 1;
        if (!(x in cache)) {
            cache[x] = x * factorial(x - 1);
        }
        return cache[x];
    }

    return factorial;
})();

factorial(6);
// 720

factorial(7);
// 5040
```

// functions are objects, so you can attach properties to them directly. factorial[n]
  is just storing a cache on the function itself, same as any object.
function factorial(n) {                                                                
// 只测typeof n === "number"是不够的                                                       
if(!Number.isInteger(n) || n <= 0) return NaN;                                             
// 也可以写成 if(n in factorial), 因为是key                                                
if(factorial[n] !== undefined) return factorial[n];                                        
// 这里不是n*factorial[n-1]!! 得是factorial(n-1), 再次invoke function                      
factorial[n] = n * factorial(n-1);                                                         
// 不能return factorial[n] = n * factorial(n-1)                                            
// 要写成两步, return的时候不能有等号                                                      
return factorial[n];                                                                       
}   

Because `hideTheCache(..)` is a **function expression**, its name identifier is scoped to the function expression itself — not to the outer/global scope. Multiple such expressions can use the same name without collision.

### Invoking Function Expressions Immediately

The `(function(){ .. })()` pattern is an **Immediately Invoked Function Expression (IIFE)**.

- Can be named or anonymous
- Can be standalone or part of a larger statement
- The outer `( .. )` wrapping is **required** for standalone IIFEs to distinguish it as an expression, not a declaration; optional when the IIFE is already in expression position

Standalone IIFE:

```js
// outer scope

(function(){
    // inner hidden scope
})();

// more outer scope
```

#### Function Boundaries

An IIFE introduces a full function boundary, which changes behavior of:

- `return` — now returns from the IIFE, not the enclosing function
- `this` — non-arrow IIFEs rebind `this`
- `break` / `continue` — cannot cross an IIFE boundary to control an outer loop or block

If the code you need to scope contains `return`, `this`, `break`, or `continue`, use a block scope instead of an IIFE.

## Scoping with Blocks

Any `{ .. }` curly-brace pair that is a statement **can** act as a block, but a block only becomes a scope if it contains `let` or `const` declarations.

```js
{
    // not necessarily a scope (yet)

    // ..

    // now we know the block needs to be a scope
    let thisIsNowAScope = true;

    for (let i = 0; i < 5; i++) {
        // this is also a scope, activated each
        // iteration
        if (i % 2 == 0) {
            // this is just a block, not a scope
            console.log(i);
        }
    }
}
// 0 2 4
```

`{ .. }` pairs that do **not** create blocks or scopes:

* Object literals — `{ .. }` delimits key-value lists, not a scope
* `class` body — `{ .. }` is not a block or scope
* `function` body — `{ .. }` is a function scope, not a block
* `switch` statement — the `{ .. }` around `case` clauses is not a block/scope

Explicit block scope inside an `if`:

```js
if (somethingHappened) {
    // this is a block, but not a scope

    {
        // this is both a block and an
        // explicit scope
        let msg = somethingHappened.message();
        notifyOthers(msg);
    }

    // ..

    recoverFromSomething();
}
```

`msg` is scoped tightly to the inner `{ .. }` block where it's needed; it doesn't need to exist for the rest of the `if` block.

POLE + TDZ: if you find a `let` declaration in the middle of a scope, that's a signal the variable should live in an inner explicit block scope to reduce TDZ exposure.

```js
function getNextMonthStart(dateStr) {
    var nextMonth, year;

    {
        let curMonth;
        [ , year, curMonth ] = dateStr.match(
                /(\d{4})-(\d{2})-\d{2}/
            ) || [];
        nextMonth = (Number(curMonth) % 12) + 1;
    }

    if (nextMonth == 1) {
        year++;
    }

    return `${ year }-${
            String(nextMonth).padStart(2,"0")
        }-01`;
}
getNextMonthStart("2019-12-25");   // 2020-01-01
```

Scopes in this example:
1. Outer/global scope: `getNextMonthStart`
2. Function scope: `dateStr` (param), `nextMonth`, `year`
3. Inner block scope: `curMonth`

`curMonth` is only needed for the first two statements — block-scoping it prevents over-exposure.

Larger example with multiple explicit block scopes:

```js
function sortNamesByLength(names) {
    var buckets = [];

    for (let firstName of names) {
        if (buckets[firstName.length] == null) {
            buckets[firstName.length] = [];
        }
        buckets[firstName.length].push(firstName);
    }

    // a block to narrow the scope
    {
        let sortedNames = [];

        for (let bucket of buckets) {
            if (bucket) {
                // sort each bucket alphanumerically
                bucket.sort();

                // append the sorted names to our
                // running list
                sortedNames = [
                    ...sortedNames,
                    ...bucket
                ];
            }
        }

        return sortedNames;
    }
}

sortNamesByLength([
    "Sally",
    "Suzy",
    "Frank",
    "John",
    "Jennifer",
    "Scott"
]);
// [ "John", "Suzy", "Frank", "Sally",
//   "Scott", "Jennifer" ]
```

`sortedNames` is only needed in the second half of the function — the explicit inner block prevents over-exposure.

### `var` *and* `let`

`var` semantically signals "this variable belongs to the whole function." `let` signals block scope.

`var` attaches to the nearest enclosing **function** scope, even when written inside a block:

```js
function diff(x,y) {
    if (x > y) {
        var tmp = x;    // `tmp` is function-scoped
        x = y;
        y = tmp;
    }

    return y - x;
}
```

`tmp` is function-scoped to `diff(..)` even though it's declared inside the `if` block.

Decision rule:
- Use `let` when the variable belongs to a block scope
- Use `var` when the variable belongs to the whole function scope — the visual distinction makes intent explicit

| WARNING: |
| :--- |
| My recommendation to use both `var` *and* `let` is clearly controversial and contradicts the majority. It's far more common to hear assertions like, "var is broken, let fixes it" and, "never use var, let is the replacement." Those opinions are valid, but they're merely opinions, just like mine. `var` is not factually broken or deprecated; it has worked since early JS and it will continue to work as long as JS is around. |

### Where To `let`?

Decision process: ask "What is the most minimal scope exposure that's sufficient for this variable?"

- If block scope is sufficient → use `let`
- If the variable is needed across the whole function → use `var`

Pre-ES6 signal pattern — placing `var` inside a block to *semantically* indicate block intent (even though JS didn't enforce it):

```js
function diff(x,y) {
    if (x > y) {
        // `tmp` is still function-scoped, but
        // the placement here semantically
        // signals block-scoping
        var tmp = x;
        x = y;
        y = tmp;
    }

    return y - x;
}
```

Post-ES6: switch such `var` declarations inside blocks to `let` to enforce the semantic signal.

`for` loop iterator: almost always should be `let`:

```js
for (let i = 0; i < 5; i++) {
    // do something
}
```

Exception — if the loop variable is accessed after the loop, switching `var` to `let` breaks it:

```js
for (var i = 0; i < 5; i++) {
    if (checkValue(i)) {
        break;
    }
}

if (i < 5) {
    console.log("The loop stopped early!");
}
```

Fix: use a separate outer-scoped variable for the post-loop check:

```js
var lastI;

for (let i = 0; i < 5; i++) {
    lastI = i;
    if (checkValue(i)) {
        break;
    }
}

if (lastI < 5) {
    console.log("The loop stopped early!");
}
```

`lastI` is needed across the whole scope → `var`. `i` is only needed per iteration → `let`.

### What's the Catch?

The `catch` clause has block-scoped the error variable since ES3 (1999):

```js
try {
    doesntExist();
}
catch (err) {
    console.log(err);
    // ReferenceError: 'doesntExist' is not defined
    // ^^^^ message printed from the caught exception

    let onlyHere = true;
    var outerVariable = true;
}

console.log(outerVariable);     // true

console.log(err);
// ReferenceError: 'err' is not defined
// ^^^^ this is another thrown (uncaught) exception
```

- `err` is block-scoped to the `catch` block
- `let` inside `catch` is also block-scoped to `catch`
- `var` inside `catch` still attaches to the outer function/global scope

ES2019: the `catch` declaration is now optional. When omitted, the `catch` block is no longer a scope (still a block):

```js
try {
    doOptionOne();
}
catch {   // catch-declaration omitted
    doOptionTwoInstead();
}
```

## Function Declarations in Blocks (FiB)

`function` declarations inside blocks have **inconsistent behavior** across JS environments — this is a known source of bugs.

```js
if (false) {
    function ask() {
        console.log("Does this run?");
    }
}
ask();
```

Three possible outcomes depending on the environment:

1. `ReferenceError` — `ask` is block-scoped and not available outside the `if` (per the JS specification)
2. `TypeError` — `ask` identifier exists outside the block but is `undefined` (not initialized, since the `if` didn't run) — **behavior of most browser JS engines (v8/Chrome/Node)**
3. Runs correctly — legacy pre-ES6 behavior

Why engines deviate from spec: browsers had existing FiB behavior before ES6; the JS spec's Appendix B grants an exception for browser-based JS engines (which also applies to Node via v8).

Multiple FiB declarations — behavior is even less predictable:

```js
if (true) {
    function ask() {
        console.log("Am I called?");
    }
}

if (true) {
    function ask() {
        console.log("Or what about me?");
    }
}

for (let i = 0; i < 5; i++) {
    function ask() {
        console.log("Or is it one of these?");
    }
}

ask();

function ask() {
    console.log("Wait, maybe, it's this one?");
}
```

Normal function hoisting would suggest the last `ask()` declaration wins — but with FiB, behavior varies by environment and is not reliable.

**Rule: never place a `function` declaration directly inside any block.** Always place `function` declarations at the top level of a function scope (or the global scope).

Instead of conditionally declaring functions in blocks:

```js
// AVOID:
if (typeof Array.isArray != "undefined") {
    function isArray(a) {
        return Array.isArray(a);
    }
}
else {
    function isArray(a) {
        return Object.prototype.toString.call(a)
            == "[object Array]";
    }
}
```

| WARNING: |
| :--- |
| In addition to the risks of FiB deviations, another problem with conditional-definition of functions is it's harder to debug such a program. If you end up with a bug in the `isArray(..)` function, you first have to figure out *which* `isArray(..)` implementation is actually running! Sometimes, the bug is that the wrong one was applied because the conditional check was incorrect! If you define multiple versions of a function, that program is always harder to reason about and maintain. |

Preferred: move the condition inside a single function declaration:

```js
function isArray(a) {
    if (typeof Array.isArray != "undefined") {
        return Array.isArray(a);
    }
    else {
        return Object.prototype.toString.call(a)
            == "[object Array]";
    }
}
```

If performance is critical, use a **function expression** (not a declaration) inside the block — this is valid and not subject to FiB issues:

```js
var isArray = function isArray(a) {
    return Array.isArray(a);
};

// override the definition, if you must
if (typeof Array.isArray == "undefined") {
    isArray = function isArray(a) {
        return Object.prototype.toString.call(a)
            == "[object Array]";
    };
}
```

`function` **expressions** inside blocks are fine. FiB only applies to `function` **declarations** inside blocks.

[^POLP]: *Principle of Least Privilege*, https://en.wikipedia.org/wiki/Principle_of_least_privilege, 3 March 2020.
