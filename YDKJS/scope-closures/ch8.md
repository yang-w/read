# You Don't Know JS Yet: Scope & Closures - 2nd Edition
# Chapter 8: The Module Pattern

## Encapsulation and Least Exposure (POLE)

- **Encapsulation**: bundling data and behavior that serve a common purpose, with control over visibility of private vs. public details.
- Visibility control in JS is implemented through lexical scope mechanics.
- **POLE (Principle of Least Exposure)**: guard against scope over-exposure by making things private by default; only expose what is necessary as a public API.

## What Is a Module?

A module is a collection of related data and functions characterized by:

- A division between hidden *private* details and *public* accessible details (the "public API")
- **Statefulness**: it maintains information over time, with functionality to access and update that information

To get a better sense of what a module is, compare module characteristics to useful code patterns that aren't quite modules.

### Namespaces (Stateless Grouping)

Grouping related functions together *without data* is a **namespace**, not a module — it lacks the stateful encapsulation a module implies.

```js
// namespace, not module
var Utils = {
    cancelEvt(evt) {
        evt.preventDefault();
        evt.stopPropagation();
        evt.stopImmediatePropagation();
    },
    wait(ms) {
        return new Promise(function c(res){
            setTimeout(res,ms);
        });
    },
    isValidEmail(email) {
        return /[^@]+@[^@.]+\.[^@.]+/.test(email);
    }
};
```

### Data Structures (Stateful Grouping)

Bundling data and stateful functions together *without visibility control* is a **data structure**, not a module — it lacks the POLE aspect of encapsulation.

```js
// data structure, not module
var Student = {
    records: [
        { id: 14, name: "Kyle", grade: 86 },
        { id: 73, name: "Suzy", grade: 87 },
        { id: 112, name: "Frank", grade: 75 },
        { id: 6, name: "Sarah", grade: 91 }
    ],
    getName(studentID) {
        var student = this.records.find(
            student => student.id == studentID
        );
        return student.name;
    }
};

Student.getName(73);
// Suzy
```

`records` is publicly accessible data, not hidden behind a public API — so `Student` is not a module.

### Modules (Stateful Access Control)

A module requires grouping, state, *and* access control through visibility (private vs. public).

**Classic module** (also called the "revealing module"):

```js
var Student = (function defineStudent(){
    var records = [
        { id: 14, name: "Kyle", grade: 86 },
        { id: 73, name: "Suzy", grade: 87 },
        { id: 112, name: "Frank", grade: 75 },
        { id: 6, name: "Sarah", grade: 91 }
    ];

    var publicAPI = {
        getName
    };

    return publicAPI;

    // ************************

    function getName(studentID) {
        var student = records.find(
            student => student.id == studentID
        );
        return student.name;
    }
})();

Student.getName(73);   // Suzy
```

How it works:

- `defineStudent()` is an IIFE that executes once and returns the `publicAPI` object.
- `getName(..)` is exposed on the public API; `records` stays private.
- `Student.getName(..)` invokes the inner function, which retains access to `records` via **closure**.
- All variables and functions defined inside the outer module function are *private by default*; only properties added to the returned object are exported.
- Using an IIFE produces a **singleton** — a single shared instance.

#### Module Factory (Multiple Instances)

To support multiple instances, define the module as a regular function (a "module factory") instead of an IIFE:

```js
// factory function, not singleton IIFE
function defineStudent() {
    var records = [
        { id: 14, name: "Kyle", grade: 86 },
        { id: 73, name: "Suzy", grade: 87 },
        { id: 112, name: "Frank", grade: 75 },
        { id: 6, name: "Sarah", grade: 91 }
    ];

    var publicAPI = {
        getName
    };

    return publicAPI;

    // ************************

    function getName(studentID) {
        var student = records.find(
            student => student.id == studentID
        );
        return student.name;
    }
}

var fullTime = defineStudent();
fullTime.getName(73);            // Suzy
```

Each call to `defineStudent()` produces a new module instance with its own inner scope and closure over `records`.

#### Classic Module Definition

Requirements for a classic module:

- There must be an outer scope, typically from a module factory function running at least once.
- The module's inner scope must have at least one piece of hidden information that represents state for the module.
- The module must return on its public API a reference to at least one function that has closure over the hidden module state (so that this state is actually preserved).

## Node CommonJS Modules

CommonJS modules are **file-based** — one module per file.

```js
module.exports.getName = getName;

// ************************

var records = [
    { id: 14, name: "Kyle", grade: 86 },
    { id: 73, name: "Suzy", grade: 87 },
    { id: 112, name: "Frank", grade: 75 },
    { id: 6, name: "Sarah", grade: 91 }
];

function getName(studentID) {
    var student = records.find(
        student => student.id == studentID
    );
    return student.name;
}
```

Key behaviors:

- Identifiers at the top-level scope of the file are *private by default* (not in the global scope).
- To expose something publicly, add a property to `module.exports`. Always use `module.exports`, not the bare `exports` alias.
- CommonJS modules behave as **singletons**: no matter how many times you `require(..)` the same module, you get references to the single shared instance.

**Replacing the exports object** (avoid this pattern — causes issues with circular dependencies):

```js
// defining a new object for the API
module.exports = {
    // ..exports..
};
```

**Safer alternative** using `Object.assign` (shallow copy onto the existing object, not a replacement):

```js
Object.assign(module.exports,{
   // .. exports ..
});
```

**Importing a CommonJS module:**

```js
var Student = require("/path/to/student.js");

Student.getName(73);
// Suzy
```

**Importing only part of the API:**

```js
var getName = require("/path/to/student.js").getName;

// or alternately:

var { getName } = require("/path/to/student.js");
```

| NOTE: |
| :--- |
| In Node `require("student")` statements, non-absolute paths (`"student"`) assume a ".js" file extension and search "node_modules". |

The publicly exported methods hold **closures** over internal module details — that's how singleton state is maintained across the program's lifetime.

## Modern ES Modules (ESM)

ESM shares similarities with CommonJS:

- File-based; one module per file.
- Module instances are singletons.
- Everything is private by default.
- ESM files are **always strict-mode** — no `"use strict"` pragma needed, and there is no way to define an ESM as non-strict-mode.

ESM uses `export` instead of `module.exports`, and `import` instead of `require(..)`.

```js
export { getName };

// ************************

var records = [
    { id: 14, name: "Kyle", grade: 86 },
    { id: 73, name: "Suzy", grade: 87 },
    { id: 112, name: "Frank", grade: 75 },
    { id: 6, name: "Sarah", grade: 91 }
];

function getName(studentID) {
    var student = records.find(
        student => student.id == studentID
    );
    return student.name;
}
```

- `export` statements can appear anywhere in the file but must be at the **top-level scope** — not inside any block or function.

**Export variations:**

```js
export function getName(studentID) {
    // ..
}
```

This is still a `function` declaration (function-hoisted throughout the module scope) that also happens to be exported.

```js
export default function getName(studentID) {
    // ..
}
```

**Default export**: shorthand for consumers who only need this single API member. Non-`default` exports are called **named exports**.

**Import variations:**

Named import — imports only specifically named members, adds them to the top-level scope of the current module:

```js
import { getName } from "/path/to/students.js";

getName(73);   // Suzy
```

Named import with rename using `as`:

```js
import { getName as getStudentName }
   from "/path/to/students.js";

getStudentName(73);
// Suzy
```

Default import (no `{ }` around the binding):

```js
import getName from "/path/to/students.js";

getName(73);   // Suzy
```

Mixing default import with named imports:

```js
import { default as getName, /* .. others .. */ }
   from "/path/to/students.js";

getName(73);   // Suzy
```

Namespace import — imports everything (default and named) under a single namespace identifier:

```js
import * as Student from "/path/to/students.js";

Student.getName(73);   // Suzy
```

- `import` must also be used only at the **top level** of an ESM, outside any blocks or functions.
