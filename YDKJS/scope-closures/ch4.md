# You Don't Know JS Yet: Scope & Closures - 2nd Edition
# Chapter 4: Around the Global Scope

## Why Global Scope?

Multiple JS files get stitched together in a single runtime context in three main ways:

1. **ES modules (not transpiled):** Files are loaded individually. Modules cooperate exclusively through `import`/`export` — no shared outer scope needed.

2. **Bundler (concatenated into one file) with a wrapping scope:** All pieces are wrapped in a shared enclosing scope (wrapper function, UMD, etc.). Modules register themselves as local variables in that shared scope:

    ```js
    (function wrappingOuterScope(){
        var moduleOne = (function one(){
            // ..
        })();

        var moduleTwo = (function two(){
            // ..

            function callModuleOne() {
                moduleOne.someMethod();
            }

            // ..
        })();
    })();
    ```

    `wrappingOuterScope()` acts as an "application-wide scope" — not the real global scope, but a stand-in for it.

3. **No wrapping scope (separate `<script>` tags or unbundled files):** The global scope is the only shared resource between files. Top-level variable declarations become global variables:

    ```js
    var moduleOne = (function one(){
        // ..
    })();
    var moduleTwo = (function two(){
        // ..

        function callModuleOne() {
            moduleOne.someMethod();
        }

        // ..
    })();
    ```

    This is equivalent to loading separate files:

    module1.js:

    ```js
    var moduleOne = (function one(){
        // ..
    })();
    ```

    module2.js:

    ```js
    var moduleTwo = (function two(){
        // ..

        function callModuleOne() {
            moduleOne.someMethod();
        }

        // ..
    })();
    ```

The global scope is also where built-ins live:

- JS built-ins:
    - primitives: `undefined`, `null`, `Infinity`, `NaN`
    - natives: `Date()`, `Object()`, `String()`, etc.
    - global functions: `eval()`, `parseInt()`, etc.
    - namespaces: `Math`, `Atomics`, `JSON`
    - friends of JS: `Intl`, `WebAssembly`

- Host environment built-ins:
    - `console` (and its methods)
    - the DOM (`window`, `document`, etc)
    - timers (`setTimeout(..)`, etc)
    - web platform APIs: `navigator`, `history`, geolocation, WebRTC, etc.

| NOTE: |
| :--- |
| Node also exposes several elements "globally," but they're technically not in the `global` scope: `require()`, `__dirname`, `module`, `URL`, and so on. |

## Where Exactly is this Global Scope?

### Browser "Window"

In a browser, top-level `var` and `function` declarations in a standalone `.js` file become properties on the global object (`window`):

```js
var studentName = "Kyle";

function hello() {
    console.log(`Hello, ${ studentName }!`);
}

hello();
// Hello, Kyle!
```

```js
var studentName = "Kyle";

function hello() {
    console.log(`Hello, ${ window.studentName }!`);
}

window.hello();
// Hello, Kyle!
```

#### Globals Shadowing Globals

A global object property can be shadowed by a global variable within the global scope itself:

```js
window.something = 42;

let something = "Kyle";

console.log(something);
// Kyle

console.log(window.something);
// 42
```

- `let` adds a `something` global variable but **not** a global object property.
- The `something` lexical identifier shadows the `something` global object property.
- This creates a divergence between the global object and the global scope — a source of confusion.

**Rule:** Use `var` for globals. Reserve `let` and `const` for block scopes.

#### DOM Globals

A DOM element with an `id` attribute automatically creates a global variable referencing it:

```text
<ul id="my-todo-list">
   <li id="first">Write a book</li>
   ..
</ul>
```

```js
first;
// <li id="first">..</li>

window["my-todo-list"];
// <ul id="my-todo-list">..</ul>
```

- If the `id` value is a valid lexical name (like `first`), a lexical variable is created.
- If not (like `my-todo-list`), it's only accessible via `window[..]`.
- This is a legacy browser behavior retained for backwards compatibility.

#### What's in a (Window) Name?

`window.name` is a pre-defined getter/setter on the global object that coerces its value to a string:

```js
var name = 42;

console.log(name, typeof name);
// "42" string
```

- `var name` does **not** shadow `window.name` — the `var` declaration is effectively ignored since the property already exists.
- Assigning `42` to `name` (or `window.name`) produces `"42"` on retrieval because the setter coerces to string.
- `let name` would shadow `window.name` with a separate global variable.

### Web Workers

- Run in a completely separate OS thread from the main JS program.
- No access to the DOM.
- Do not share the global scope with the main JS program.
- The global object reference is `self` (not `window`):

```js
var studentName = "Kyle";
let studentID = 42;

function hello() {
    console.log(`Hello, ${ self.studentName }!`);
}

self.hello();
// Hello, Kyle!

self.studentID;
// undefined
```

- `var` and `function` declarations create mirrored properties on `self`.
- `let`, `const`, `class` declarations do **not** create properties on `self`.

### Developer Tools Console/REPL

- Dev Tools emulate the global scope position but do not strictly adhere to JS spec behavior.
- Observable deviations may occur with:
    - Global scope behavior
    - Hoisting
    - Block-scoping declarators (`let`/`const`) in the outermost scope
- **Not** a suitable environment to verify nuanced JS program behaviors.

### ES Modules (ESM)

Top-level declarations in an ES module are **not** global variables — they are module-scoped:

```js
var studentName = "Kyle";

function hello() {
    console.log(`Hello, ${ studentName }!`);
}

hello();
// Hello, Kyle!

export hello;
```

- `studentName` and `hello` are module-wide, not global.
- No implicit "module-wide scope object" — top-level declarations are not added as properties to any object.
- The module's top-level scope is descended from the global scope (like the module contents were wrapped in a function).
- Global variables (on the global object) are still accessible as lexical identifiers from inside a module.

### Node

Node treats every `.js` file (including the entry point) as a module. The top level of a Node program is **never** the actual global scope.

Node effectively wraps each CommonJS module file in a function before processing:

```js
var studentName = "Kyle";

function hello() {
    console.log(`Hello, ${ studentName }!`);
}

hello();
// Hello, Kyle!

module.exports.hello = hello;
```

Node sees this as (illustrative, not actual):

```js
function Module(module,require,__dirname,...) {
    var studentName = "Kyle";

    function hello() {
        console.log(`Hello, ${ studentName }!`);
    }

    hello();
    // Hello, Kyle!

    module.exports.hello = hello;
}
```

- `studentName` and `hello` are scoped to the module wrapper function, **not** global.
- Node "globals" like `require()`, `__dirname`, `module` are injected as parameters to the module wrapper — they are **not** in the real global scope.
- To create actual global variables in Node, add properties to the `global` object:

```js
global.studentName = "Kyle";

function hello() {
    console.log(`Hello, ${ studentName }!`);
}

hello();
// Hello, Kyle!

module.exports.hello = hello;
```

- `global` is Node-specific, not defined by the JS spec.

## Global This

Summary of global scope object references by environment:

| Environment | Global object reference |
|---|---|
| Browser | `window` |
| Web Worker | `self` |
| Node | `global` |
| ES2020+ (all) | `globalThis` |

Pre-`globalThis` trick to get the global object in non-strict mode:

```js
const theGlobalScopeObject =
    (new Function("return this"))();
```

| NOTE: |
| :--- |
| A function dynamically constructed with `Function()` runs in non-strict mode when invoked normally; its `this` points at the global object. |

Cross-environment polyfill for pre-`globalThis` engines:

```js
const theGlobalScopeObject =
    (typeof globalThis != "undefined") ? globalThis :
    (typeof global != "undefined") ? global :
    (typeof window != "undefined") ? window :
    (typeof self != "undefined") ? self :
    (new Function("return this"))();
```

`globalThis` (ES2020) is the standardized reference to the global scope object, usable across all environments.
