# You Don't Know JS Yet: Scope & Closures - 2nd Edition
# Chapter 3: The Scope Chain

The connections between scopes that are nested within other scopes is called the scope chain, which determines the path along which variables can be accessed. The chain is directed, meaning the lookup moves upward/outward only.

## "Lookup" Is (Mostly) Conceptual

In Chapter 2, the runtime access of a variable is described as a "lookup," where the *Engine* starts by asking the current scope's *Scope Manager* if it knows about an identifier/variable, then proceeds upward/outward through the chain of nested scopes (toward the global scope) until found. The lookup stops at the first matching named declaration in a scope bucket.

In practice, the color of a marble's bucket (what scope a variable originates from) is *usually determined* during the initial compilation processing. Because lexical scope is finalized at compile time, a marble's color will not change based on anything that can happen later during runtime.

- The marble's color is known from compilation and is immutable.
- This information is stored with (or accessible from) each variable's entry in the AST.
- The *Engine* does not need to do a runtime lookup through scopes to determine which scope bucket a variable comes from — that information is already known.
- Avoiding runtime lookups is a key optimization benefit of lexical scope.

**When the color is NOT known at compile time:**

Consider a reference to a variable that isn't declared in any lexically available scopes in the current file. Each file is its own separate program from JS's compilation perspective. If no declaration is found, that's not necessarily an error — another file in the runtime may declare that variable in the shared global scope.

- Any reference to an initially *undeclared* variable is left as an uncolored marble during that file's compilation.
- The color cannot be determined until other relevant file(s) have been compiled and the application runtime commences.
- That deferred lookup will eventually resolve the color to whichever scope the variable is found in (likely the global scope).
- This lookup is only needed once per variable at most — nothing at runtime can later change that marble's color.

## Shadowing

A single scope cannot have two or more variables with the same name; such multiple references would be assumed as just one variable. To maintain two or more variables of the same name, you must use separate (often nested) scopes.

Consider:

```js
var studentName = "Suzy";

function printStudent(studentName) {
    studentName = studentName.toUpperCase();
    console.log(studentName);
}

printStudent("Frank");
// FRANK

printStudent(studentName);
// SUZY

console.log(studentName);
// Suzy
```

- `studentName` on line 1 (`var studentName = ..`) creates a RED(1) marble (global scope).
- `studentName` on line 3 (the parameter) creates a BLUE(2) marble (function scope).
- All three `studentName` references inside `printStudent(..)` are BLUE(2) — the lookup finds the parameter first and stops.

This is *shadowing*: the BLUE(2) `studentName` (parameter) shadows the RED(1) `studentName` (global). The re-assignment of `studentName` inside the function affects only the BLUE(2) parameter, not the RED(1) global.

From the shadowing scope inward/downward (through any nested scopes), it's lexically impossible to reference the shadowed (outer) variable by its identifier name.

### Global Unshadowing Trick

It *is* possible to access a global variable from a scope where that variable has been shadowed — but not through a typical lexical identifier reference.

In the global scope (RED(1)), `var` declarations and `function` declarations also expose themselves as properties (of the same name) on the *global object* (e.g., `window` in a browser environment).

```js
var studentName = "Suzy";

function printStudent(studentName) {
    console.log(studentName);
    console.log(window.studentName);
}

printStudent("Frank");
// "Frank"
// "Suzy"
```

- `window.studentName` accesses the global `studentName` as a property on the global object.
- `window.studentName` is a mirror of the global `studentName` variable, not a separate snapshot copy. Changes to one are reflected in the other in either direction — it behaves like a getter/setter on the actual variable.
- You can also *add* a variable to the global scope by creating/setting a property on the global object.

| WARNING: |
| :--- |
| Remember: just because you *can* doesn't mean you *should*. Don't shadow a global variable that you need to access, and conversely, avoid using this trick to access a global variable that you've shadowed. And definitely don't confuse readers of your code by creating global variables as `window` properties instead of with formal declarations! |

This trick only works for:
- Accessing a **global scope** variable (not a shadowed variable from a nested scope).
- Variables declared with `var` or `function` — other forms of global scope declarations do not create mirrored global object properties:

```js
var one = 1;
let notOne = 2;
const notTwo = 3;
class notThree {}

console.log(window.one);       // 1
console.log(window.notOne);    // undefined
console.log(window.notTwo);    // undefined
console.log(window.notThree);  // undefined
```

Variables (no matter how they're declared) that exist in any scope other than global are completely inaccessible from a scope where they've been shadowed:

```js
var special = 42;

function lookingFor(special) {
    // The identifier `special` (parameter) in this
    // scope is shadowed inside keepLooking(), and
    // is thus inaccessible from that scope.

    function keepLooking() {
        var special = 3.141592;
        console.log(special);
        console.log(window.special);
    }

    keepLooking();
}

lookingFor(112358132134);
// 3.141592
// 42
```

The global RED(1) `special` is shadowed by the BLUE(2) `special` (parameter), and the BLUE(2) `special` is itself shadowed by the GREEN(3) `special` inside `keepLooking()`. `window.special` can still access RED(1), but there is no way to access the BLUE(2) `special` (value `112358132134`) from inside `keepLooking()`.

### Copying Is Not Accessing

```js
var special = 42;

function lookingFor(special) {
    var another = {
        special: special
    };

    function keepLooking() {
        var special = 3.141592;
        console.log(special);
        console.log(another.special);  // Ooo, tricky!
        console.log(window.special);
    }

    keepLooking();
}

lookingFor(112358132134);
// 3.141592
// 112358132134
// 42
```

`another.special` holds a *copy* of the value of the BLUE(2) `special` parameter at the moment of assignment — it does not mean `keepLooking()` can lexically access the parameter `special` itself.

- Shadowing still applies — you cannot reassign the BLUE(2) `special` parameter from inside `keepLooking()`.
- Using object/array references instead of primitive copies does not change this: mutating the contents of an object value via a reference copy is **not** the same as lexically accessing the variable itself. You still cannot reassign the BLUE(2) `special` parameter.

### Illegal Shadowing

Not all combinations of declaration shadowing are allowed. `let` can shadow `var`, but `var` cannot shadow `let`:

```js
function something() {
    var special = "JavaScript";

    {
        let special = 42;   // totally fine shadowing

        // ..
    }
}

function another() {
    // ..

    {
        let special = "JavaScript";

        {
            var special = "JavaScript";
            // ^^^ Syntax Error

            // ..
        }
    }
}
```

- In `something()`, `let special` inside the block shadows the outer `var special` — this is allowed.
- In `another()`, `var special` tries to declare a function-wide `special` that would "cross the boundary" of (hop over) the `let special` in the enclosing block — this is a `SyntaxError`.
- The error message ("special has already been defined") is slightly misleading; the real issue is the `var` attempting to cross a `let` boundary.

That boundary-crossing prohibition stops at each function boundary, so this variant raises no exception:

```js
function another() {
    // ..

    {
        let special = "JavaScript";

        ajax("https://some.url",function callback(){
            // totally fine shadowing
            var special = "JavaScript";

            // ..
        });
    }
}
```

**Summary:** `let` (in an inner scope) can always shadow an outer scope's `var`. `var` (in an inner scope) can only shadow an outer scope's `let` if there is a function boundary in between.

## Function Name Scope

A `function` declaration creates an identifier in the enclosing scope:

```js
function askQuestion() {
    // ..
}
```

A `function` expression assigns to a variable in the enclosing scope, but the function itself does not hoist:

```js
var askQuestion = function(){
    // ..
};
```

For a **named function expression**, the name identifier behaves differently from a declaration:

```js
var askQuestion = function ofTheTeacher() {
    console.log(ofTheTeacher);
};

askQuestion();
// function ofTheTeacher()...

console.log(ofTheTeacher);
// ReferenceError: ofTheTeacher is not defined
```

| NOTE: |
| :--- |
| Actually, `ofTheTeacher` is not exactly *in the scope of the function*. Appendix A, "Implied Scopes" will explain further. |

`ofTheTeacher` is declared **inside the function itself**, not in the outer/enclosing scope. It is also **read-only**:

```js
var askQuestion = function ofTheTeacher() {
    "use strict";
    ofTheTeacher = 42;   // TypeError

    //..
};

askQuestion();
// TypeError
```

- In strict mode, assigning to the read-only name identifier throws a `TypeError`.
- In non-strict mode, the assignment fails silently with no exception.

A `function` expression with a name identifier is a "named function expression." One without a name identifier is an "anonymous function expression" — it has no name identifier that affects either scope.

## Arrow Functions

ES6 arrow function syntax:

```js
var askQuestion = () => {
    // ..
};
```

- The `=>` arrow function doesn't require the word `function`.
- `( .. )` around the parameter list is optional in some simple cases.
- `{ .. }` around the function body is optional in some cases; when omitted, the expression value is returned implicitly without `return`.

Arrow functions are **lexically anonymous** — they have no directly related identifier that references the function. An assignment creates an inferred name, but that is not the same as being non-anonymous:

```js
var askQuestion = () => {
    // ..
};

askQuestion.name;   // askQuestion
```

Arrow function form variations:

```js
() => 42;

id => id.toUpperCase();

(id,name) => ({ id, name });

(...args) => {
    return args[args.length - 1];
};
```

**Arrow functions and lexical scope:** Arrow functions follow the same lexical scope rules as `function` functions. Other than being anonymous (and having no declarative form), `=>` arrow functions have the same lexical scope rules as `function` functions do. An arrow function, with or without `{ .. }` around its body, still creates a separate, inner nested bucket of scope. Variable declarations inside this nested scope bucket behave the same as in a `function` scope.

## Backing Out

- When a function (declaration or expression) is defined, a new scope is created.
- Scopes nested inside one another form the scope chain — the natural hierarchy throughout a program.
- The scope chain controls variable access, directionally oriented upward and outward.
- Each new scope offers a clean slate to hold its own set of variables.
- When a variable name is repeated at different levels of the scope chain, shadowing occurs, which prevents access to the outer variable from that point inward.
