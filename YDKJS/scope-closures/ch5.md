# You Don't Know JS Yet: Scope & Closures - 2nd Edition
# Chapter 5: The (Not So) Secret Lifecycle of Variables

## When Can I Use a Variable?

Every identifier is *created* at the beginning of the scope it belongs to, every time that scope is entered.

**Hoisting** — a variable is visible from the beginning of its enclosing scope, even though its declaration appears further down in the scope.

```js
greeting();
// Hello!

function greeting() {
    console.log("Hello!");
}
```

- `function` declarations are **hoisted and auto-initialized to their function reference** — this is *function hoisting*. That's why the function can be called anywhere in the scope.
- Both *function hoisting* and `var`-flavored *variable hoisting* attach to the nearest enclosing **function scope** (or global scope), not a block scope.

| NOTE: |
| :--- |
| Declarations with `let` and `const` still hoist, but attach to their enclosing block rather than an enclosing function as with `var` and `function` declarations. |

### Hoisting: Declaration vs. Expression

*Function hoisting* only applies to formal `function` declarations, not to `function` expression assignments.

```js
greeting();
// TypeError

var greeting = function greeting() {
    console.log("Hello!");
};
```

- The error is a `TypeError` (not a `ReferenceError`) — JS found `greeting` in scope, but it holds `undefined` at that moment, not a function.
- `var` variables are hoisted **and auto-initialized to `undefined`**. The function reference assignment doesn't happen until that line executes at runtime.

Key distinction:
- `function` declaration → hoisted + auto-initialized to the function reference
- `var` variable → hoisted + auto-initialized to `undefined`; any assignment happens at runtime

### Variable Hoisting

```js
greeting = "Hello!";
console.log(greeting);
// Hello!

var greeting = "Howdy!";
```

Works because:
- The identifier is hoisted
- It is automatically initialized to `undefined` from the top of the scope, so the assignment on line 1 is valid

## Hoisting: Yet Another Metaphor

The "hoisting as code re-arrangement" metaphor — that the JS engine rewrites the program to move declarations to the top — is inaccurate.

What actually happens: hoisting is a **compile-time operation** that generates runtime instructions to automatically register a variable at the beginning of its scope, each time that scope is entered. No source code is reordered.

The metaphor (re-arranged form) is still useful as a mental model:

```js
var greeting;           // hoisted declaration
greeting = "Hello!";    // the original line 1
console.log(greeting);  // Hello!
greeting = "Howdy!";    // `var` is gone!
```

Function declarations are "hoisted first" in the metaphor, then variables:

```js
function greeting() {
    console.log(`Hello ${ studentName }!`);
}
var studentName;

studentName = "Suzy";
greeting();
// Hello Suzy!
```

| WARNING: |
| :--- |
| Incorrect or incomplete mental models often still seem sufficient because they can occasionally lead to accidental right answers. But in the long run it's harder to accurately analyze and predict outcomes if your thinking isn't particularly aligned with how the JS engine works. |

## Re-declaration?

```js
var studentName = "Frank";
console.log(studentName);
// Frank

var studentName;
console.log(studentName);   // Frank (not undefined!)
```

A second `var` declaration of the same identifier in the same scope is a **no-op**. Hoisting already registered it; there is nothing to re-declare.

`var studentName;` is NOT the same as `var studentName = undefined;`:

```js
var studentName = "Frank";
console.log(studentName);   // Frank

var studentName;
console.log(studentName);   // Frank <--- still!

// explicit initialization:
var studentName = undefined;
console.log(studentName);   // undefined <--- see!?
```

Re-declaration across a function and variable of the same name:

```js
var greeting;

function greeting() {
    console.log("Hello!");
}

// basically, a no-op
var greeting;

typeof greeting;        // "function"

var greeting = "Hello!";

typeof greeting;        // "string"
```

- First `var greeting` registers the identifier; auto-initialized to `undefined`.
- `function greeting` does not re-register but *function hoisting* overrides auto-initialization to the function reference.
- Second `var greeting` is a no-op.
- Explicit assignment `= "Hello!"` changes the value to a string.

**`let` and `const` disallow re-declaration entirely:**

```js
let studentName = "Frank";
let studentName = "Suzy";   // SyntaxError
```

Any mix of `let` and `var` with the same identifier also throws:

```js
var studentName = "Frank";
let studentName = "Suzy";   // SyntaxError
```

```js
let studentName = "Frank";
var studentName = "Suzy";   // SyntaxError
```

The only way to "re-declare" is with `var` for all declarations.

### Constants?

`const` requires initialization at declaration:

```js
const empty;   // SyntaxError
```

`const` variables cannot be re-assigned:

```js
const studentName = "Frank";
console.log(studentName);
// Frank

studentName = "Suzy";   // TypeError
```

| WARNING: |
| :--- |
| The error thrown when re-assigning `studentName` is a `TypeError`, not a `SyntaxError`. Syntax errors stop execution before it starts. Type errors arise during execution — `"Frank"` is printed before the re-assignment throws. |

`const` disallows "re-declaration" for a technical reason: any `const` "re-declaration" would necessarily be a re-assignment, which is already forbidden.

```js
const studentName = "Frank";
const studentName = "Suzy";   // obviously an error
```

### Loops

Scope rules (including `let` re-declaration errors) are applied *per scope instance*. Each loop iteration is its own new scope instance.

```js
var keepGoing = true;
while (keepGoing) {
    let value = Math.random();
    if (value > 0.5) {
        keepGoing = false;
    }
}
```

`value` is declared once per scope instance — no re-declaration error.

With `var` inside a loop:

```js
var keepGoing = true;
while (keepGoing) {
    var value = Math.random();
    if (value > 0.5) {
        keepGoing = false;
    }
}
```

`var` is not block-scoped; it attaches to the enclosing function/global scope. There is only one `value` variable total — no re-declaration.

Useful mental model: mentally erase the `var`/`let`/`const` keyword and check if a re-declaration would occur. These keywords are handled entirely by the compiler.

`for`-loop with `let`:

```js
for (let i = 0; i < 3; i++) {
    let value = i * 10;
    console.log(`${ i }: ${ value }`);
}
// 0: 0
// 1: 10
// 2: 20
```

The loop variable `i` is scoped inside the loop body, not the outer scope. Conceptual expansion:

```js
{
    // a fictional variable for illustration
    let $$i = 0;

    for ( /* nothing */; $$i < 3; $$i++) {
        // here's our actual loop `i`!
        let i = $$i;

        let value = i * 10;
        console.log(`${ i }: ${ value }`);
    }
    // 0: 0
    // 1: 10
    // 2: 20
}
```

`i` and `value` are each declared exactly once per scope instance.

`for..in` and `for..of` with `let`:

```js
for (let index in students) {
    // this is fine
}

for (let student of students) {
    // so is this
}
```

The declared variable is treated as *inside* the loop body — one declaration per iteration.

**`const` in loops:**

`while` loop — fine, `const` runs exactly once per iteration:

```js
var keepGoing = true;
while (keepGoing) {
    const value = Math.random();
    if (value > 0.5) {
        keepGoing = false;
    }
}
```

`for..in` and `for..of` — fine:

```js
for (const index in students) {
    // this is fine
}

for (const student of students) {
    // this is also fine
}
```

Classic `for`-loop with `const` — fails:

```js
for (const i = 0; i < 3; i++) {
    // TypeError after the first iteration
}
```

Why it fails — conceptual expansion:

```js
{
    // a fictional variable for illustration
    const $$i = 0;

    for ( ; $$i < 3; $$i++) {   // $$i++ is RE-ASSIGNMENT — not allowed on const!
        const i = $$i;
        // ..
    }
}
```

The issue is not `i` being re-declared — it's that the loop's increment expression (`$$i++`) constitutes a re-assignment of the conceptual `const` counter variable. **`const` cannot be used with the classic `for`-loop form because of the required re-assignment.**

## Uninitialized Variables (aka, TDZ)

- `var` → hoisted + auto-initialized to `undefined` at the top of the scope
- `let` / `const` → hoisted, but **not** auto-initialized; accessing them before initialization throws a `ReferenceError`

```js
console.log(studentName);
// ReferenceError: Cannot access 'studentName' before initialization

let studentName = "Suzy";
```

Attempting to assign before initialization also throws:

```js
studentName = "Suzy";   // ReferenceError
console.log(studentName);
let studentName;
```

For `let`/`const`, the **only** way to initialize is via the declaration statement:

```js
let studentName = "Suzy";
console.log(studentName);   // Suzy
```

Or with a separate assignment after the bare declaration:

```js
let studentName;
// or: let studentName = undefined;

studentName = "Suzy";
console.log(studentName);
// Suzy
```

| NOTE: |
| :--- |
| `var studentName;` is NOT the same as `var studentName = undefined;` — `var` auto-initializes at the top of scope. But `let studentName;` and `let studentName = undefined;` behave the same, because `let` does not auto-initialize at the top of scope; initialization happens at the declaration statement. |

**Temporal Dead Zone (TDZ)** — the period from entering a scope to the point where the variable's auto-initialization instruction executes. During the TDZ, the variable exists (it was hoisted/registered) but is uninitialized and cannot be accessed in any way.

- `var` has a TDZ of zero length — unobservable.
- `let` and `const` have an observable TDZ.

"Temporal" refers to **time**, not position in code:

```js
askQuestion();
// ReferenceError

let studentName = "Suzy";

function askQuestion() {
    console.log(`${ studentName }, do you know?`);
}
```

Even though `console.log(..)` appears after the `let` declaration positionally, `askQuestion()` is invoked *before* the `let` statement is reached in execution — `studentName` is still in its TDZ.

**`let`/`const` do hoist** — the TDZ misconception that they don't:

```js
var studentName = "Kyle";

{
    console.log(studentName);
    // ReferenceError (TDZ!) — NOT "Kyle"

    // ..

    let studentName = "Suzy";

    console.log(studentName);
    // Suzy
}
```

If `let studentName` didn't hoist, the first `console.log(..)` would access the outer `studentName` and print `"Kyle"`. Instead, it throws a TDZ error — proving the inner `let studentName` **was** hoisted (registered) to the top of the block scope, just not yet initialized.

**Summary of TDZ:**
- `let`/`const` hoist their declarations to the top of their scope (auto-registration)
- Unlike `var`, they defer auto-initialization until the point of the original declaration in code sequencing
- That window of time is the TDZ
- Accessing the variable during the TDZ throws a `ReferenceError`

**How to avoid TDZ errors:** always put `let` and `const` declarations at the top of any scope to shrink the TDZ window to zero.
