<link href="css/style.css" rel="stylesheet"></link>

* [1. Transpiling, Transpile vs Compile, Compile vs Runtime, Build Pipeline](#1-transpiling-transpile-vs-compile-compile-vs-runtime-build-pipeline)
	* [1.5 Compile vs Runtime: A Recurring Pattern](#15-compile-vs-runtime-a-recurring-pattern)
	* [1.6 Build Pipeline](#16-build-pipeline-brwweb)
* [3.10 Lexical Scope, Global vs Local](#310-lexical-scope-global-vs-local)
* [3.10.1 `var` + Hoisting](#3101-var--hoisting)
* [3.10.2 `let`/`const` + TDZ](#3102-letconst--tdz)
* [3.10.3 `catch` Block Scope](#3103-catch-block-scope)
* [4.13.3 The `typeof` and `instanceof` Operator](#4133-the-typeof-and-instanceof-operator)
* [4.13.4 Number](#4134-number)
* [4.13.5 String](#4135-string)
* [4.13.5.1 String Methods](#41351-string-methods)
* [4.13.5.2 Sring Number Operator Coercion](#41352-string-number-operator-coercion)
* [4.13.6 Nullish coalescing and Optional chaining (`undefined`, `null`)](#4136-nullish-coalescing-and-optional-chaining-undefined-null)
* [4.13.7 Template Literals](#4137-template-literals)
* [4.11.1 Assignment with Operation](#4111-assignment-with-operation)
* [8.1 Defining Functions](#81-defining-functions)
* [8.2 Invoking Functions](#82-invoking-functions)
* [8.3 Function Arguments and Parameters](#83-function-arguments-and-parameters)
* [8.8.2 Higher-Order Functions](#882-higher-order-functions)
* [8.6 Closure](#86-closure)
* [8.6.1 Closure in Loops](#861-closure-in-loops)
* [8.6.2 The Closure Lifecycle and Garbage Collection (GC)](#862-the-closure-lifecycle-and-garbage-collection-gc)
* [8.6.3 Module Systems: IIFE, CJS, AMD, UMD, ESM](#863-module-systems-iife-cjs-amd-umd-esm)
* [6.2 Creating Objects](#62-creating-objects)
* [6.10 Extended Object Literal Syntax (更多的object literal的定义方法)](#610-extended-object-literal-syntax)
	* [6.10.1 Shorthand Properties + 6.10.2 Computed Property Names + 6.10.5 Shorthand Methods](#6101-shorthand-properties--6102-computed-property-names--6105-shorthand-methods)
	* [6.10.4 Spread Operator + Rest Parameters](#6104-spread-operator--rest-parameters)
* [3.10.4 Destructuring Assignment](#3104-destructuring-assignment)
* [3.10.5 Object Optional Chaining](#3105-object-optional-chaining)
* [3.10.6 `Object.entries()`](#3106-objectentriesobjarry)
* [5.4.4 for...of](#544-forof)
* [5.4.5 for...in](#545-forin)
	* [5.4.5.1 Object.hasOwn](#5451-objecthasown)
* [5.4.6 for...of vs for...in](#546-forof-vs-forin)
* [6.9 Object Methods](#69-object-methods)
* [7.1 Array and Array-Like](#71-array-and-array-like)
* [7.8 Array Methods](#78-array-methods)
	* [7.8.1 Array Iterator Methods (`forEach`, `map`, `filter`, `find`, `findIndex`, `indexOf`, `lastIndexOf`, `includes `, `every`, `some`, `reduce`)](#781-array-iterator-methods)
	* [7.8.2 Flattening arrays with `flat()`)](#782-flattening-arrays-with-flat)
	* [7.8.3 Adding arrays with `concat()`](#783-adding-arrays-with-concat)
	* [7.8.4 Stacks and Queues with `push()`, `pop()`, `shift()`, and `unshift()`](#784-stacks-and-queues-with-push-pop-shift-and-unshift)
	* [7.8.5 Subarrays with `slice()`, `splice()`](#785-subarrays-with-slice-splice)
	* [7.8.6 Array Sorting Methods (`sort`, `reverse`)](#786-array-sorting-methods-sort-reverse)
	* [7.8.7 Array to String Conversions (`JSON.stringify`, `join`, `toString`)](#787-array-to-string-conversions-jsonstringify-join-tostring)
* [11.1.1 The Set Class](#1111-the-set-class)
* [11.1.2 The Map Class](#1112-the-map-class)
* [9.2 Classes and Constructors](#92-classes-and-constructors)
* [9.3 Classes with the class Keyword](#93-classes-with-the-class-keyword)
* [9.4 Class Lifecycle](#94-class-lifecycle)
* [9.5 Class Members](#95-class-members) 
* [10.1 Event Loop](#101-event-loop)
* [async/await](#asyncawait)
* [Input change debounce](#input-change-debounce)
* [Big data with virtualization](#big-data-with-virtualization)
* [HTML and CSS gotcha](#html-and-css-gotcha)

#### <a name="1-transpiling-transpile-vs-compile-compile-vs-runtime-build-pipeline" id="1-transpiling-transpile-vs-compile-compile-vs-runtime-build-pipeline">1. Transpiling, Transpile vs Compile, Compile vs Runtime, Build Pipeline</a>

### 1.1 Transpiling
- **forwards-compatibility**: 
  - new HTML/CSS in an old browser → browser skips what it doesn't understand, page still works.
  - JS is NOT forwards-compatible — unknown syntax crashes the engine (it's backward-compatible).
- **transpiling**: to run new JS syntax in older browsers, we convert it to equivalent older syntax using Babel
  - in brwweb, Babel checks ES6+ features the target browsers (defined in `.browserslistrc` via `@ebay/browserslist-config`) already support natively, and only transforms what they don't
    - ES6+ timeline:
      - ES2015 (ES6): classes, arrow functions, `let`/`const`, template literals
      - ES2017: `async`/`await`
      - ES2020: optional chaining (`?.`), nullish coalescing (`??`), `BigInt`
      - ES2022: class fields (public/private)

### 1.2 Transpile vs Compile

**Compile** (strict): source → fundamentally different form, not human-readable
- V8: ✅ JS → bytecode (runs on V8's VM)

**Transpile**: source → source, same abstraction level, still human-readable
- Babel: ES6+ → ES5 ✅
- `tsc`: TS → JS ✅ (transpile by strict definition)

`tsc` is called "compile" by convention. The purpose feels similar (a build step that catches errors before anything runs), but the output is plain JS, not a lower-level form.

### 1.4 Compile time vs Runtime — JS vs TypeScript
"Compile time" is overloaded — it means different things in different contexts:

| | "Compile time" | "Runtime" |
|---|---|---|
| **Plain JS** | no static check | V8 executes → crashes → user sees error |
| **TypeScript** | `tsc` catches type errors on your machine | error never reaches user |
- `tsc`: TypeScript compiler (TS → JS)
- **"JS errors appear at runtime"** → V8 is executing code and blows up mid-run
- **"TS catches errors at compile time"** → `tsc` on your machine during dev, before browser sees anything

### <a name="15-compile-vs-runtime-a-recurring-pattern" id="15-compile-vs-runtime-a-recurring-pattern">1.5 Compile vs Runtime: A Recurring Pattern</a>

The same static/dynamic split shows up across JS — one side is a **language-level syntax construct** the parser knows about before any code runs; the other is a **runtime value or function call** resolved only when that line executes.

**Build time vs compile time**: same idea, different tools. "Compile time" = when `tsc` or V8 processes source. "Build time" = when the whole pipeline runs (Babel transpiles, Webpack bundles). Both happen before the browser executes anything — "build time" is just more accurate for Webpack since it bundler rather than compiles.

| Compile / parse time (hoisted — usable before their line) | Runtime (only available when that line executes) |
|---|---|
| Function **declaration** — name + value both registered | Function **expression** — assigned when that line executes |
| `import`/`export` (ESM) - Browser+NodeJS | `require`/`module.exports` (CJS) - NodeJS |
| `var` — name registered (value is `undefined` until line runs) | `let` / `const` — not available at all until line executes (TDZ) |

**Function declaration vs expression:**
```javascript
function awesomeFunction(coolThings) { return amazingStuff; }
// identifier awesomeFunction resolved/linked with function at compile phase, before execution

let awesomeFunction = function(coolThings) { return amazingStuff; };
// identifier awesomeFunction not associated until this line runs at runtime
```

### <a name="16-build-pipeline-brwweb" id="16-build-pipeline-brwweb">1.6 Build pipeline (brwweb)</a>

Webpack:
1. **Transpiles** source files with Babel
2. Parses own **AST** (Abstrct Syntax Tree): resolve imports, tree-shake (drop exports never imported), inject polyfills
3. Outputs bundle.js → shipped to browser

**ESM vs CJS in Webpack**

Webpack parses code into ASTs, walks `import`/`require` to build a dependency graph, and uses AST-level export information to determine what can be safely included or removed during optimization (tree shaking).

| | ESM (`import`) | CJS (`require`) |
|---|---|---|
| Dependency graph building | AST → static `import` bindings → precise dependency graph | AST → `require()` calls → graph built (mostly static for literal paths) |
| Export model | Static bindings — each `export` is a named reference to a specific function — Webpack knows exactly what's used at parse time. (export is per function) | `module.exports` is a plain object, properties resolved at runtime. A consumer could access any property dynamically - Webpack keeps everything (exports is the whole object) |
| Tree-shaking | ✅ unused exports dropped | ❌ conservative, can't always tell |
| Dynamic path | Not allowed | `` require(`./\${name}`) `` bundles entire dir |

See [§8.6.3 Module Systems](#module-systems)

CJS
```javascript
// transform.js
function getViewport() {
  return window.innerWidth;
}
function unusedHelper() {
  console.log("unused");
}
module.exports = {
  getViewport,
  unusedHelper
};

// app.js
const { getViewport } = require("./transform");
getViewport();

// bundle.js — unusedHelper still bundled, Webpack can't tell it's unused
var __webpack_modules__ = {
  "./transform": function(module) {
    function getViewport() { return window.innerWidth; }
    function unusedHelper() { console.log("unused"); } // still included
    module.exports = { getViewport, unusedHelper };
  }
};
const transform = __webpack_require__("./transform");
transform.getViewport();
```

ESM
```javascript
// transform.js
export const COUNT = 0; // 注意也可以export variable
export function getViewport() {
	return window.innerWidth;
}
export function unusedHelper() {
  console.log("unused");
}

// app.js
import { getViewport, COUNT } from "./transform";
console.log(COUNT);
getViewport();

// bundle.js — unusedHelper removed by tree-shaking
var __webpack_modules__ = {
  "./transform": function() {
    function getViewport() { return window.innerWidth; }
    // unusedHelper — completely gone
  }
};
const transform = __webpack_require__("./transform");
transform.getViewport();
```

- **Interop (interoperability)**: Webpack wraps CJS `node_modules` so ESM `import` works against them
- **Output format** (`output.libraryTarget`) is independent of input — can output CJS, UMD, or ESM for older consumers

Browser (V8):
1. Re-parses bundle.js: builds own **AST** → **compiles** to bytecode
2. Executes bytecode → runtime

---

#### <a name="310-lexical-scope-global-vs-local" id="310-lexical-scope-global-vs-local">3.10 Lexical Scope, Global vs Local</a>

- **Global variables** live as long as your application (your window / your web page) lives.
- **Local variables** have short lives. They are created when the function is invoked, and deleted when the function is finished.

**Lexical Scope** defines how variable names are resolved in nested functions (Climbing through the **Scope Chain**). 
- The chain is determined at **compile time** by where declarations are placed in source code; 
- the actual resolution (lookup/resolve) happens at **runtime**.

Ex1.

```javascript
var globalvar = 1; // Global Scope
 
function outer() {
    var outervar = 2; // Scope is within outer()
     
    function inner() {
        var innervar = 3; // Scope is within inner()
        console.log(globalvar); // => 1
        console.log(outervar); // => 2
        console.log(innervar); // => 3
    }
     
    console.log(globalvar); // => 1
    console.log(outervar); // => 2
    console.log(innervar); // => Uncaught ReferenceError: innervar is not defined
}
 
console.log(globalvar); // => 1
console.log(outervar); // => Uncaught ReferenceError: outervar is not defined
console.log(innervar); // => Uncaught ReferenceError: outervar is not defined
```

- var a; <- a define并且init undefined. 但是let a; <- a只define没有init. 要touch必须要init.
- 一旦出了function, local variable就out of scope了, 等同于从没define过, 如果这时<span class="orange">accessing before initialization throws a ReferenceError</span>.
- 区别于`var a; console.log(a);` 这里init as undefined 不是error

**Error type → when it crashes**

| Error type | When | Effect |
|---|---|---|
| `SyntaxError` | Parse/compile phase | Entire script doesn't run |
| `ReferenceError`, `TypeError`, `RangeError` | Runtime | Code up to that line ran; execution stops there |

Ex1. (compile-time evidence)

```javascript
var greeting = "Hello";
console.log(greeting);
greeting = ."Hi"; // SyntaxError: unexpected token .
```
- "Hello" is never printed. failed at compile/parse time

Ex2. (runtime ReferenceError — earlier lines still run)

```javascript
var studentName = "Kyle";
{
  console.log("-- hello --");  // ✅ prints — runtime hasn't hit TDZ yet
  console.log(studentName);    // ❌ ReferenceError: TDZ — let below shadows outer var for whole block
  let studentName = "Suzy";
  console.log(studentName);    // never reached
}
```
- Parse succeeded (no syntax error), so execution begins. `"-- hello --"` prints. TDZ error fires only when that line executes.

**Browser global quirks**

Ex1. Browser global with `id`

```html
<ul id="my-todo-list">
   <li id="first">Write a book</li>
   ..
</ul>
```
```javascript
window.first // <li id="first">Write a book</li>
window["my-todo-list"] // <ul id="my-todo-list">..</ul>
```
- A DOM element with an id attribute automatically creates a global variable referencing it

Ex2. Browser global `window.name`

```javascript
var name = 42;
console.log(typeof name); // string "42"

var num = 42;
console.log(typeof num); // number 42
```
- `window.name` is a built-in global property that always coerces its value to a string

Ex3. `window.x` — only `var`/`function` create global properties

```javascript
var one = 1;
let notOne = 2;
const notTwo = 3;
class notThree {}

console.log(window.one);       // 1
console.log(window.notOne);    // undefined
console.log(window.notTwo);    // undefined
console.log(window.notThree);  // undefined
```
- `window.x` global只能access `var/function`, `let/const/class`都不行

#### <a name="3101-var--hoisting" id="3101-var--hoisting">3.10.1 `var` + Hoisting</a>

- `var` is scoped to the **nearest function block**. Declaration is hoisted to the top of its function scope.

**Hoisting** is JavaScript’s default behavior of moving **declarations** to the top of a function scope (<span class="orange">注意只是hoist到当前function内的top</span>).

- 只针对var和function declaration (let/const存在hoist, 但是不一样, 见 [§3.10.2](#let-const)).
- <span class="orange">Any function declaration will be hoisted at the top first, then variable</span>.
- If you assign a function to a variable (function expression) only the variable part will be hoisted. However if you have a function declaration, the full function will be hoisted.
- JavaScript in strict mode does not allow hoist, 即不允许variables to be used if they are not declared.

> **Note:** function declaration inside a block `{}` — per ES6 spec, it’s block-scoped (hoisted to top of that block, not the enclosing function). Browser engines (V8) partially hoist the name to the outer function scope as `undefined` for backwards compat — the body is only assigned if the block actually executes. Avoid function declarations inside blocks.

Ex1.

```javascript
var foo = "outside"; 
function logIt(){
	console.log(foo); 
	var foo = "inside";
} 
logIt(); // undefined
```
注意logIt里的foo被hoist后, local有了一个新的foo, 所以不会再向上找global的foo, 且local的还没复值, 所以是undefined

<span class="orange">Ex2.</span>

```javascript
var a = 1; 
function b() { 
    a = 10; 
    return; 
    function a() {} 
} 
b(); 
console.log(a);  // 1
```
- function declaration `function a(){}` is hoisted first and <span class="orange">it behaves like `var a = function () {};`</span>. Hence in local scope variable a is created, 所以后来的a=10是reset了这个a, 不是global的a, 所以log时a没变.
- If you didnt have a function named as a, you will see 10 in the log. 因为a=10就是reset了global的a.

<span class="orange">Ex3. `var` + IIFE</span> <span class="orange">注意区别下面三个例子</span>

```javascript
x=1;
(function() {
	x=10;
	var b=2; // 虽然是IIF, 但是b依然是local, function执行完了就out of scope了
})();
console.log(x); // 10
console.log(b); // Uncaught ReferenceError: b is not defined
```

```javascript
x=1;
(function() {
	var x=10; // function里的x是local,function执行完了就out of scope了.和外面的x是两个variable
})();
console.log(x); // 1, 不是10
```

```javascript
x=1;
(function() {
	x=10;
	var x; // 相当于new了一个local x并且hoist了,所以function里的x都和外面的x无关了
})();
console.log(x); // 1, 和上面一样, 不是10
```

<span class="orange">Ex4. Shadowing</span>

```javascript
// 1. primitve pass in as copy
var studentName = "Suzy";
function printStudent(studentName) {
    studentName = studentName.toUpperCase();
    console.log(studentName);
}
printStudent(studentName); // SUZY
console.log(studentName); // Suzy没变

// 2. reference val pass in as ref
var student = { name: "Suzy" };
function printStudentObj(s) {
    s.name = s.name.toUpperCase();
}
printStudentObj(student);
console.log(student.name); // "SUZY"变了
```
- When call `printStudent(studentName)`, the value "Suzy" is copied into the local parameter. Whatever happens to the local studentName inside the function has no effect on the outer one.
  - This is because <span class="orange">strings (and all primitives</span> — numbers, booleans, etc.) <span class="orange">are passed by value in JS. The function gets a copy</span>, not a reference to the original.
- 区别于如果param是reference value, student.name就变了

<span class="orange">Ex5.</span>

```javascript
function setName(obj) {
    obj.name = "Nicholas"; 
    obj = {}; // when obj is overwritten inside func, it becomes a pointer to a local obj, will be destroyed once func finishes
    obj.name = "Greg";
}
var person = new Object();
setName(person);
console.log(person.name);    // "Nicholas", 不是Greg!!
```

#### <a name="3102-letconst--tdz" id="3102-letconst--tdz">3.10.2 `let`/`const` + TDZ</a>

- `let` is scoped to the **nearest enclosing block** `{ }` (can be smaller than a function block)
- 对于`let`, 可以不付初始值, the value will be undefined
- 但是`const`必须付初始值

```javascript
let a; // a is undefined
const b = 0;
```

`const` variable can NOT change through re-assignment or be re-declared, otherwise `TypeError` will be throwed.

- 对于<span class="orange">primitive types</span> (undefined, null, number, string, boolean, symbol), value change is <u>NOT</u> possible.

	```javascript
	const x = 9;
	x++; // TypeError, cannot change value
	x = 9; // TypeError, 即使付同样的值也不行
	```
	
- 对于<span class="orange">reference types</span> (object, array is object), as long as it’s still pointing to the <u>same address</u>, it’s possible to edit the value.
	- Object: 注意下面可以改变x.foo的值, since x is still pointing the same address.
	
		```javascript
		const x = {};
		x.foo = "bar";
		console.log(x); // {foo : "bar"}
		```
	- Array: 与object一样, y始终指向同一个address, 只是address里存的值变了.

		```javascript
		const y = [];
		y.push("foo");
		console.log(y); // ["foo"]
		```

**`let`/`const` hoisting + TDZ**

`let`/`const` ARE hoisted (to the top of their enclosing block), but unlike `var`, they are NOT initialized. From the start of the block until the `let`/`const` line is reached, the variable sits in the **Temporal Dead Zone (TDZ)**. Touching it during TDZ throws `ReferenceError`.

| | `var` | `let`/`const` |
|---|---|---|
| Scope | nearest function | nearest `{ }` block |
| Hoisted | ✅ hoisted + initialized to `undefined` | ✅ hoisted, but **NOT initialized** (TDZ) |
| Access before declaration | `undefined` | `ReferenceError` |

Ex1.
```javascript
function saySomething() {
  var greeting = "Hello";
  {
    greeting = "Howdy";  // refError here (TDZ)
    /**
     * let is hoisted to the top of {} and 
     * initialized HERE at runtime
     */
    let greeting = "Hi"; 
    console.log(greeting);
  }
}
saySomething(); // ReferenceError: Cannot access ‘greeting’ before init
```
- `let greeting` is hoisted to the top of `{}`, so `greeting` resolves to the inner `let` for the entire block — NOT the outer `var`. But it’s uninitialized (TDZ) until execution reaches the `let` line.

Ex2.
```javascript
askQuestion(); // ReferenceError

let studentName = "Suzy";
function askQuestion() {
  console.log(`${ studentName }, do you know?`);
}
```
- 虽然askQuestion()可以在定义之前用, 但是此时`${studentName}`还在TDZ

**Shadowing rules between `let` and `var`**

- 注意`let/const`只会被hoist到{}top VS `var`会被hoist到function top

```javascript
// Ex1: var -> {let} — fine
function something() {
  var special = "JavaScript";
  {
    let special = 42;   // totally fine shadowing
  }
}
// Ex2: {let} -> {var} — SyntaxError
function another() {
  {
    let special = "JavaScript";
    {
      var special = "JavaScript"; // SyntaxError, special has already been defined
    }
  } 
}
// Ex3: {let} -> new function’s var — fine
function another() {
  {
    let special = "JavaScript";
    ajax("https://some.url",function callback(){
      var special = "JavaScript"; // 这是可以的
    });
  }
}
```
- Ex1中同样的name: var -> {let}是合法的
- Ex2里let-> {var} SyntaxError: var attempting to cross a let boundary (var被hoist到function top 和let重叠了)
- Ex3是合法的, 因为var是在一个新的function里

**`let`/`const` vs `var` comparison**

Ex.
```javascript
console.log("globalVar: " + globalVar); // undefined, but visible
console.log("globalLet: " + globalLet); // ReferenceError: a is not defined, *not* visible

var globalVar = "globalVar";
let globalLet = "globalLet";

console.log("globalVar: " + globalVar); // globalVar
console.log("globalLet: " + globalLet); // globalLet

function functionScoped() {
  console.log("functionVar: " + functionVar); // undefined, but visible

  try {
    console.log("functionLet: " + functionLet); // ReferenceError, *not* visible
  } catch (exception) {
    console.log("functionLet: exception");
  }

  var functionVar = "functionVar";
  let functionLet = "functionLet";

  console.log("functionVar: " + functionVar); // functionVar
  console.log("functionLet: " + functionLet); // functionLet
}

function blockScoped() {
  console.log("blockVar: " + blockVar); // undefined, but visible

  try {
    console.log("blockLet: " + blockLet); // ReferenceError, *not* visible
  } catch (exception) {
    console.log("blockLet: exception");
  }

  for (var blockVar = "blockVar", blockIndex = 0; blockIndex < 1; blockIndex++) {
    console.log("blockVar: " + blockVar); // visible here and whole function
  }; //blockVar: blockVar

  for (let blockLet = "blockLet", letIndex = 0; letIndex < 1; letIndex++) {
    console.log("blockLet: " + blockLet); // visible only here
  }; //blockLet: blockLet

  console.log("blockVar: " + blockVar); // blockVar: blockVar

  try {
    console.log("blockLet: " + blockLet); // ReferenceError, *not* visible
  } catch (exception) {
    console.log("blockLet: exception");
  }
}
```

#### <a name="3103-catch-block-scope" id="3103-catch-block-scope">3.10.3 `catch` Block Scope</a>
> YDKJS > Scope & Closures > [ch6](../YDKJS/scope-closures/ch6.md)

```js
try {
    doesntExist();
}
catch (err) {
    console.log(err); // ReferenceError: 'doesntExist' is not defined
    let onlyHere = true;
    var outerVariable = true;
}
console.log(outerVariable);  // true
console.log(err); // ReferenceError: 'err' is not defined
```
- `err` is block-scoped to the `catch` block
- `let` inside `catch` is also block-scoped to `catch`
- `var` inside `catch` still attaches to the outer function/global scope

ES2019: the `catch(err)` declaration is now optional.

```js
try {
    doOptionOne();
}
catch {   // catch-declaration omitted
    doOptionTwoInstead();
}
```

Ex. <span class="orange">注意下面try/catch, throw对结果的影响</span>. 
	
```javascript
const sum = (arry) => {
    let total = 0; // technically不能用let sum=0, 否则就shadow outter sum
      
    try { 
        arry.forEach(num => {
          if(typeof num !== "number") {
                /**
                  * throw没有return, 不是return  throw!!
                  * 1. throw new Error(...), log是Error: ...
                  * 2. throw new TypeError(...), log是TypeError: ...
                  * 3. 也可以直接throw + str, log是Uncaught 3 is not a number.
                  */
                throw new TypeError(`${num} is not a number.`); 
                // 也可以throw new Error(...)
                // throw `${num} is not a number.`;
            }
            total += num;
          }
        });
    } catch (e) {
        // 没有log的话,在console里就看不到是什么error
        console.log(e);
    }
    return total; // 勿忘return
}
console.log(sum([1,2,3])); // 6
console.log(sum(1, 2, 3)); // TypeError: arry.forEach is not a function, 0
console.log(sum([1,"2", 3])); // TypeError: 2 is not a number, 1
```
- 不能用`isNaN(num)`, 必须用<span class="orange">typeof, 切勿忘双引号"number"</span>
  - <span class="orange">`isNaN("2")`,`isNaN("")`都是false</span>
  - `isNaN("a")`是true
- sum(1, 2, 3) throw后会直接进入catch, 并且下一个sum([1,"2", 3])还可以继续. 如果没有try/catch, 一旦throw, 就crash了
- sum(1, 2, 3) throw在了arry.forEach, 直接进入catch, 先log(err),然后再return total=0
- sum([1,"2", 3]) throw在"2"不是num, 直接进入catch, 先log throw的error, 然后再return total, 此时total是1
- 如果let sum = 0 inside sum function, it shadows the outer sum function. 在function里, any attempt to call sum(...) recursively inside would throw:
  ```javascript   
  const sum = (arry) => {
    let sum = 0;       // shadows outer sum
    sum([1, 2, 3]);    // TypeError: sum is not a function
    return sum;
  };
  ```

  - Outside the function, the outer sum is unaffected.

#### <a name="4133-the-typeof-and-instanceof-operator" id="4133-the-typeof-and-instanceof-operator">4.13.3 The `typeof` and `instanceof` Operator</a>

##### **<u>`typeof`</u>**

<span class="orange bold">Primitives </span>are: `undefined`, `null`, `number`, `string`, `boolean`, `symbol`. 他们没有constructor, 不存在instanceof.

All primitive values are **immutable**: can NOT modify, can NOT add props - `TypeError`

Ex1.1

```javascript
const text = "abc";

console.log(text[0]); // a
text[0] = "1"; // Uncaught TypeError: Cannot assign to read only property '0' of string 'abc'

text.isRendered = true; // Uncaught TypeError: Cannot create property 'isRendered' on string 'abc'

// all string values have a read-only `length` property
text.length = 2; // Uncaught TypeError: Cannot assign to read only property 'length' of string 'abc'
```
- str.length is read-only, can NOT modify

Ex1.2

```javascript
let index1 = 1, index2 = index1; 
index1++;
console.log(index1); // 2
console.log(index2); // 1, independent
```
- index1 and index2, each have their own value copy, independent, 区别于reference value: arry, object, etc


Ex2. typeof和primitive

```javascript
function isPrimitive(value) {
  return value === null || 
    (typeof value !== "object" && typeof value !== "function");
}
```

Ex3.

```javascript
typeof 1; // number

const foo = 1;
typeof foo; // number, 还是number, 和var没关系, 看的是foo的value

typeof false; // boolean

typeof NaN; // number

typeof undefined; // undefined
typeof null; // object

typeof []; // object, array is object

typeof { a: 1 }; // object

typeof function a() {}; // function

const func = function() {};
typeof func; // function, 还是function, 和var没关系, 看的是func的value

typeof class A {}; // function, class是function!!
```
- `NaN`是number
- `class`是function

Ex4.

```javascript
// To Boolean
!!"hello"; // true
!!42; // true
!!""; // false
!!0; // false

console.log(Boolean(0)); // false
console.log(new Boolean(0)); // Boolean {false}, 不是boolean是object

typeof Boolean(0); // boolean
typeof new Boolean(0); // object
```
- Anything created with `new` is of type `object`, including `String`, `Boolean`, and `Number`, etc.

##### **<u>`instanceof`</u>**

The `instanceof` operator tests whether the prototype property of a constructor appears anywhere in the prototype chain of an object. 
`a instanceof A`就是看<u>Is `A.prototype` somewhere in a's prototype chain</u>.

Ex1.

```javascript
class A {}
const a = new A();

console.log(typeof a); // object
console.log(typeof A); // function

console.log(a instanceof A); // true
console.log(a instanceof Object) // true
```
- 注意`typeof`和`instanceof`的区别
- a的prototype chain上先有A, 再有Object

  ```
  // a's prototype chain
  a
  ↓ [[Prototype]]
  A.prototype
  ↓ [[Prototype]]
  Object.prototype
  ↓
  null
  ```

#### <a name="4134-number" id="4134-number">4.13.4 Number</a>

```javascript
42 === 42.000; // true

0.1 + 0.2; // 0.30000000000000004, 不是0.3
// Work in cents
10 + 20

0.25 + 0.5; // 0.75, no error, 1/4+1/2
0.1 + 2; // 2.1
```
- if numbers involved are exactly **representable in binary** (integer OR 分母是a power of 2的小数), there is no representation error.
- for money, a common approach is to work in integer cents

**Generate a random number in a range**

```javascript
Math.random(); // [0, 1), 不包括1
```
- `Math.random() * (max - min) + min; // [min, max)`
  - <u>不包括max</u>
  - 返回的是**floating point number**, could happen to be an **integer** as well
- `Math.floor(Math.random() * (max - min)) + min`
  -  **Math.floor**保证了返回的是integer
- `Math.floor(Math.random() * (max - min + 1)) + min; // [min, max]` 
  - <u>包括max</u>
  - 返回的是**integer**

```javascript
// [10, 20), 不包括20
Math.random() * (20 - 10) + 10;
// 15.41961743911229, 也可能是16

// [10, 20), 不包括20
Math.floor(Math.random() * (20-10))+10;
// 13, Math.floor()保证了一定是integer

// [10, 20], 包括20
Math.floor(Math.random() * (20-10 + 1)) + 10;
// 17, Math.floor()保证了一定是integer
```

**Coerce to Number**

```javascript
// returns a number OR NaN
Number(value); // tries to coerce value to a number if it's a valid numeric string, NaN if not

// returns a floating number OR NaN
parseFloat(string); 

// returns an integer or NaN
parseInt(string, radix);
```
- `Number(value)`的value can be any type: string, boolean, etc
  - 区别于parseInt(**string**), parseFloat(**string**), value都是string
- Use `Number()` if value is expected to be a <u>valid numeric string</u>, returns `NaN` if not.
- Check if a value is data type `Number` (excluding `NaN`)

  ```javascript
  typeof value === 'number' && !Number.isNaN(value);

  // NaN never equals
  // need use Number.isNaN(val) check if NaN
  NaN === NaN; // false!!!
  ```

Ex1.1

```javascript
Number("1.234"); // 1.234
parseFloat("1.234"); // 1.234

parseInt("1.234", 10); // 1, preferr with radix
parseInt("1.234"); // 1, default radix to 10

Number("12"); // 12
parseFloat("12"); // 12, 没有12.00
parseInt("12", 10); // 12

Number("-5"); // -5
parseFloat("-5"); // -5
parsreInt("-5", 10); // -5
```
- `Number()` and `parseFloat()` usually **returns the same** if value is a **valid numeric string**
- `parseInt(str, 10)`, if no radix, usually default to 10. Common practice is to explicitly pass 10 when you expect decimal.

Ex1.2

```javascript
parseInt("1.6", 10); // 1, 不是2! 区别于Math.round(1.6) = 2

Math.round(1.6); // 2
Math.round("1.6"); // 2, coerce "1.6" to number first

Math.round(-32.6);   // -33, nearest
```
- `Math.round(number)`
  - input: `Number`
  - Returns a **number** rounded to the **nearest integer** (四舍五入)
- `1.236.toFixed(2); // "1.24"`, 四舍五入+变成string
- 区别于`parseInt(1.6, 10); // 1`, 就是停止在小数点之前, 没有四舍五入

Ex1.3

```javascript
Number("12px"); // NaN
parseFloat("12px"); // 12

Number("12 not a number"); // NaN
parseFloat("12 not a number"); // 12
parseFloat("not a number 12"); // NaN

Number(""); // 0, coerce
parseFloat(""); // NaN

Number(true); // 1, coerce
parseFloat(true); // NaN, true -> "true"

Number(null); // 0
Number(undefined); // NaN
parseFloat(null); // NaN, null -> "null"
parseFloat(undefined); // NaN, undefined -> "undefined"
```
- `Number()` and `parseFloat()` differs when value constains other characters.
  - `Number()` tries to <u>coerce</u> the value into a number
  - `parseFloat()` treats the value more like <u>string</u>. Parses from the beginning and stops when it hits something that isn't part of a number.
  
Ex2.

```javascript
function toHr(timeStr) {
  const [hr, min] = timeStr.split(":").map(Number);
  return Number((hr + min/60).toFixed(2)); // coerce tofixed String to Number
}
console.log(toHr("07:50")); // 7.83, number
```
- Coerce String to Number: `Number("07")` → 7, `Number("30")` → 30
- Implicit coercion: `"30"/60; // 0.5`
- `Number.prototype.toFixed(digits)`
  - `digit`: default = 0
  - returns **string**, **四舍五入**, 所以上面Coerce toFixed的结果回Number
  
  ```javascript
  // JavaScript interprets the . after 12 as part of the number literal, so the parser gets confused.
  12.toFixed(2) // ❌ SyntaxError
  (12).toFixed(2) // "12.00", string, 要把number括起来

  (7.236).toFixed(2); // "7.24", string
  
  const num = 7.236;
  num.toFixed(2); // "7.24", var不用括
  ```

**Rounding Comparison**
| Method | Input Type | Return Type | What it does |
|---|---|---|---|
| `Math.floor(1.6); // 1` <br>`Math.floor(-1.2); // -2, 不是-1!!` | number | number (**integer**) | Rounds **down** to nearest **integer** |
| `Math.round(1.2); // 1`<br>`Math.round(1.6); // 2`<br>`Math.round(-1.2); // -1`<br>`Math.round(-1.6); // -2` | number | number (**integer**) | Rounds to **nearest integer** 四舍五入 |
| `(1.236).toFixed(2); // "1.24"`<br>`(-1.236).toFixed(2); // "-1.24"` | number | **string** | Rounds to 2 decimal places<br>类似 `Math.round()`, 四舍五入，但是返回 string，不要求integer |
| `parseInt("1.236"); // 1` | <u>string</u> | number (integer) | Parses the string and returns an integer, <u>no round</u> |
| `parseFloat("1.236"); // 1.236` | <u>string</u> | number | Parses the string and returns a decimal number, <u>no round</u> |

##### <a name="4135-string" id="4135-string">4.13.5 String</a>

```javascript
String(true);           // "true", 不是"1"
String(42);             // "42"
String(undefined);      // "undefined"
```

##### <a name="41351-string-methods" id="41351-string-methods">4.13.5.1 String Methods</a>

- find in string, same in `arry.indexOf(elem)`, `arry.includes(elem)`
  
  ```javascript
  "abc".indexOf(""); // 0, empty str永远return 0/true
  "abc".indexOf("a"); // 0, 和empty str返回同一个index
  "abc".indexOf("bc"); // 1
  "abc".indexOf("ac"); // -1

  "abc".includes(""); // true, empty str
  "abc".includes("a"); // true
  "abc".includes("ac"); // false

  "abc".startsWith(""); // true, empty str
  "abc".startsWith("ab"); // true
  "abc".startsWith("A"); // false
  ```
- slice, same in `arry.slice(start, end)`, 包括start, **不包括end**

  ```javascript
  "hello world!".slice(2,4); // "ll", 不包括index=4
  ["a", "b", "c", "d"].slice(1, 3); // ["b", "c"], 不包括index=3

  "abc".slice(); // "abc", returns a copy of string
  ["a", "b", "c"].slice(); // ["a", "b", "c"], returns a shallow copy of arry
  ```
- split
  
  ```javascript
  "abc".split(); // ["abc"], returns the string in arry
  // 区别于
  "a bc".split(""); // ['a', ' ', 'b', 'c'], 空格单独一个, 等同于[..."a bc"]
  "07:50".split(":"); // ['07', '50']
  ```
  - 区别于`arry.splice(start, deleteCount, elem1, elem2, ...)`: **in-place**
    
    ```javascript
    const arry = [1,2,3,4,5];
    arry.splice(1,2, "a"); // returns [2,3], the deleted elems
    console.log(arry); // [1, "a", 4,5], 原arry变了

    arry.splice(); // returns []
    // 区别于arry.slice(), which create a shallow copy of arry. arry.splice does nothing
    ```

- string to array

  ```javascript
  [..."abc"]; // ['a', 'b', 'c']

  "abc".split(""); // ['a', 'b', 'c']
  ```

- misc
  ```javascript
  "   abc   ".trim(); // "abc"
  "hello world!".toUpperCase(); // "HELLO WORLD!"
  "aBc".toLowerCase(); // "abc"
  ```

##### <a name="41352-string-number-operator-coercion" id="41352-string-number-operator-coercion">4.13.5.2 String Number Operator Coercion</a>

Basic arithmetic: `+`, `-`, `*`, `/`, `**` (exponent), `%`.

**Coercion**: Arithmetic operators coerce non-numbers to numbers, except `+`: <u>if either operand is a string, `+` performs string concatenation</u>.

```javscript
40 + 2;       // 42
44 - 2;       // 42
21 * 2;       // 42
84 / 2;       // 42
7 ** 2;       // 49
49 % 2;       // 1

40 + "2";     // "402" ← string concatenation
44 - "2";     // 42    ← "2" → 2
21 * "2";     // 42
84 / "2";     // 42
"7" ** "2";   // 49    ← both → numbers
"49" % "2";   // 1

true + "";    // "true"
42 + "";      // "42"
null + "";    // "null"
undefined + ""; // "undefined"
```

#### <a name="4136-nullish-coalescing-and-optional-chaining-undefined-null" id="4136-nullish-coalescing-and-optional-chaining-undefined-null">4.13.6 Nullish coalescing and Optional chaining (`undefined`, `null`)</a>

##### **<u>`??` nullish-coalescing</u>**

nullish coalescing `??` uses the <u>right side</u> only when the left side is **`null`/`undefined`**.

`??` provide a fallback when the result is **`null`/`undefined`**

```javascript
const name = null;
const displayName = name ?? "guest";

console.log(displayName); // "guest"

const count = 0;

console.log(count ?? 10); // 0, 0 won't trigger nullish??
console.log(count || 10); // 10
```
- 区别`??`和`||` 
  - `??` 只**check `null`和`undefined`**, 不包括0, false, empty string, etc
  - `||` check所有!!val, 包括**0, false, ""**, undefined, null

##### **<u>`?.` nullish conditional-chaining</u>**

`?.` safely access something that might be **`null`/`undefined`**, same as nullish `??`

```javascript
const user = {
  profile: null
};
console.log(user?.profile?.name); // undefined

const a = null;
a?.foo; // undefined

const b = "";
b?.length; // 0, empty string won't trigger ?.
```

#### **<u>`null` VS `undefined`</u>**

```javascript
null == undefined; // true, 注意！！
null == 0; // false
null == ""; // false
null == false; // false

if (data == null) {
  // data === null || data === undefined
}

if (data != null) {
  // data !== null && data !== undefined
}
```
- **`null==undefined`**
  - **`if(data!=null)`** 保证了data既不是null也不是undefined (可以是0, "", false)
  - Use **`if(data == null)`** as a clean nullish check (both `null` and `undefined`):

Ex. param default value

```js
function greet(msg = "hello") {
  console.log(msg);
}
greet("hey!"); // hey!
greet(); // hello
greet(undefined); // hello
greet(null); // null, 不是default hello
greet(0); // 0, 不是default hello
```
- **Param default value only triggers when arg is `undefined`** - missing OR is exactly `undefined`. 
  - <u>`null` does not trigger the default</u> — `null` is assigned to the parameter directly.

#### <a name="4137-template-literals" id="4137-template-literals">4.13.7 Template Literals</a>

<u>Newlines in template literals</u> are included literally in the string value.

```javascript
const str = `
hello
world
!`;
console.log(str);
// hello
// world
// !
```
- newline是看string后, hello前面没有newline

#### <a name="4111-assignment-with-operation" id="4111-assignment-with-operation">4.11.1 Assignment with Operation</a>

```javascript
a op= b; // a is evaluated once
a = a op b // a is evaluated twice
```

Ex1.

```javascript
let a = 1; // 必须用let, 否则不能a++ 
console.log(a++); // 1, a++此时还是1
console.log(a); // 2

a= 1;
console.log(++a); // 2, ++a此时已经是2了
console.log(a); // 2
```
- 注意`a++`和`++a`的区别

Ex2.

```javascript
// Ex2.1
const arry = [1,2,3,4]; // arry是ref, 虽然里面变了, 但是ref没变, 可以用const
let index=1; // 必须用let, 因为index++ 
arry[index++] = arry[index++] * 10;
// arry[1++] = arry[2++]*10 -> arry[1] = arry[2]*10 = 3*10
// arry[1++] -> arry[1] and index=2 now, 注意arry[1++]还是arry[1], 然后index变成2
// = arry[2++] * 10 -> arry[2] and index=3 now
console.log(arry); // [1,30,3,4]
console.log(index); // 3

// Ex2.2
// arry = [1,2,3,4]; // ERROR!! const不能reassign. 
// 区别于上面可以改arry里的值. 但是这里相当于改了ref
const arry2 = [1,2,3,4];
index = 1;
arry2[index++] *= 10;
// arry2[1++] *= 10 -> arry2[1] *= 10, index=2, 只evaluate一遍
console.log(arry2); // [1,20,3,4]
console.log(index); // 2

let a=1, b=a++;
console.log(`a = ${a}, b = ${b}`); // a = 2, b = 1, b还是1, a+1
```
- Ex2.1中, arry[index++] evaluate了两次. 区别于Ex2.2, arry2[index++]只evaluate了一次.
- 注意`const`/`let`
  - index是primitive, 要用index++必须let index, 不能const
  - arry是ref, 如果只是改变arry里的elem, 可以const arry, 因为ref没变
    - 但是如果重新arry=[..], 就必须let arry, 因为ref变了

#### <a name="81-defining-functions" id="81-defining-functions">8.1 Defining Functions</a>

四种方法define function: function declaration, function expression, arrow function, nested function.

- Function Declaration
	- `function sum(...args) { ... "this" is window obj ...}`
	-  will be hoisted to the top of block, before var hoisting. <b>Functions are first-class citizens</b>.
	-  <span class="yellowBG">function declaration里的`this`是global window</span>

  ```javascript
  function sortNameByLength(arry) {
    if(arry?.length) {
      const map = {}; // const works, as long as map is not reassigned
      arry.forEach(name => {
        if (map[name.length] === undefined) {
          map[name.length] = [];
        }
        map[name.length].push(name);
      });
      let sorted = []; // can't use const, since sorted is reassigned sorted=[...]
      /**
       * integer-like keys: numeric ascending order;
       * non-integer keys: order not guaranteed
       */
      for (let length in map) { 
        sorted = [
          ...sorted,
          ...map[length].sort() // 勿忘spread
        ]
      }
      return sorted;
    }
    return [];
  }
  console.log(sortNameByLength(["Sally", "Suzy", "Frank", "John", "Jennifer", "Scott"]));
  // [ "John", "Suzy", "Frank", "Sally", "Scott", "Jennifer" ]
  ```
  - 注意map可以是const即使有map.name=foo. 但是<span class="orange">sorted必须是let, 因为后面有sorted=..</span>, 如果只是sorted.push就不影响
  - for...in只在key是int的时候能保证ascending order循环, 其他情况下order不保证 
- Function Expression
	- `const sum = function(...args) {}`
	- function expression can <span class="orange">include names, which can be used in recursive</span>. 注意下例中<span class="orange">factorial is only available within function f</span>.

  ```javascript
  const f = function factorial(x) {
    if (x <= 1) return 1;
    return x * factorial(x-1);
  };
  ```

	- Immediatly Invoking Function Expression (IIFE)

    Ex1.
    ```javascript
    const addCount = (function() {
      let count = 1; // count是private, 只有通过addCount()才能access
      return function() {
        // count没被改变. 必须 count = count+1; return count;
        return count + 1;
      }
    })();
    console.log(addCount()); // 2
    console.log(addCount()); // 还是2, 不是3!
    ```
    - 注意IIFE里必须改变count, 而不是只return count+1;

    Ex2.
    ```javascript
    // Ex2.1 cache is exposed
    var cache = {}; 
    function factorial(x) {
        if (x < 2) return 1;
        if (!(x in cache)) {
            cache[x] = x * factorial(x - 1);
        }
        return cache[x];
    }
    console.log(fab(5)); // 120
    console.log(fab(4)); // 24

    // Ex2.2 hide cache in the scope
    const fab = (function() {
      const cache = {}; // cache run once, can't be access anymore
      return function factorial(x) { // 勿忘return function
        if(!Number.isInteger(n)) return NaN;
        if (x <= 1) return 1;
        if (cache[x] === undefined) {
          cache[x] = x * factorial(x-1);
        }
        return cache[x];
      }
    })();
    console.log(fab(5));
    console.log(fab(4));
    ```
    - 注意上例只测`typeof n === "number"`是不够的，要用`Number.isInteger(n)`
	    
- Arrow Function
	- `const sum = (x, y) => x+y;`
	- arrow function<span class="orange">没有`arguments`</span>
	- <span class="yellowBG">Arrow Functions **do not have their own this**</span>, 所以无法用于calculator.arrowThis(Ex1), 也无法通过apply/call/bind改变scope addArrow.call(obj, 1, 2)(Ex2).
		- Arrow functions inherit "this" based on the scope where the arrow function is defined: <span class="orange">arrow的this取决于进入arrow function之前, where "this" is bind to</span>.

    Ex1.

    ```javascript
    const f1 = () => {
      console.log(arguments); // Uncaught ReferenceError: arguments is not defined
      console.log([...arguments]); // Uncaught ReferenceError: arguments is not defined
    };
    f1(4,5);

    function f2() {
      console.log(arguments); // [4, 5, callee: ƒ, Symbol(Symbol.iterator): ƒ]
      console.log(Array.from(arguments)); // [4, 5]
    }
    f2(4,5); // [4, 5]
    ```  
    - 注意f1的arrow function是没有arguments.
    - 定义f2()时不用写f2(x, y), 直接用arguments
			
    Ex2.

    ```javascript
    let calculator = {
      operand1: 1,
      operand2: 2,
      add() {
          console.log(`add.this = ${this}`); // calculator itself
          this.result = this.operand1 + this.operand2; 
      },
      arrowThis: () => {
          console.log(`arrowThis.this = ${this}`); // this是window
          console.log(this.operand1); // undefined
      },
      scopeTest() {
        console.log(`scopeTest.this = ${this}`); // calculator
        console.log(this === calculator); // true. 注意在calculator.scopeTest()里可以access calculator
        const self = this;
        
        nestedFunc(); // hoisted
        function nestedFunc() {
            console.log(`nestedFunc.this = ${this}`); // window obj
            console.log(`nestedFunc, self = ${self}`); // calculator
            console.log(this === calculator); // false
        }

        // 进入nestedFuncArrow前, this是calculator
        const nestedFuncArrow = () => {
            console.log(`nestedFuncArrow.this = ${this}`); // calculator
        }
        nestedFuncArrow(); // function expression, 没有hoist

        nestedFunc.bind(this)(); // calcultor. 勿忘bind(this)()最后的()才是执行
      }
    };
    calculator.add();
    console.log(calculator.result); // 3
    calculator.arrowThis(); // this是window
    calculator.scopeTest();
    ```
    - calculator.arrowThis是arrow function, arrow function里的this继承的是和calculator同scope的this, 通常是window
    - calculator.scopeTest是普通function, 但是里面nestedFuncArrow的this是calculator, 因为arrow function的this会inherit进入nestedFuncArrow之前的this, 此时是calculator
    - 解决nested function nestedFunc(declaration)的`this`的方法
      - 进入nested function之前`self = this;` 用`self`
      - 换成arrow function, 但是注意nestedFuncArrow要用在定义之后, 因为区别于nestedFunc是function declaration, `const nestedFuncArrow = ...`没有hoist
      - 用bind, 勿忘bind(this)<span class="red">()</span>, 多出来的()是执行
			
    Ex3. 

    ```javascript
    let obj = { num: 10 };
    window.num = 100;

    const add = function(a, b) { 
        console.log(`add.this = ${this}`);
        return this.num+a+b; 
    };

    add(1, 2); // 103, add的this是window.num=100
    console.log(add.call(obj, 1, 2)); // 13, add的this是obj.num=10
      
    const addArrow = (a, b) => {
        console.log(`addArrow.this = ${this}`); // this是window
        return this.num + a + b;
    }
     console.log(addArrow(1, 2)); // 103
    console.log(addArrow.call(obj, 1, 2)); // 还是103, call在arrow function里没有用
    ```
    - <span class="orange">Arrow function is not suitable for `call`, `apply` and `bind` methods</span>, which generally rely on establishing a scope. **Arrow functions establish/inherit "this" based on the scope where the arrow function is defined**.
			
    Ex4. 
    
    ```javascript
    let obj = {
      count: 10,
      doSomethingLater() {
          // setTimeout(func, delay)的func是executes on the window scope
          setTimeout(function() {
              console.log(`setTimeout.this = ${this}`); // window obj
              console.log(this.count); // undefined
          }, 300)
      },
      doSomethingLaterArrow() {
          // 进入setTimeout之前, "this" is bind to "obj"
          setTimeout(() => {
              console.log(`setTimeout.arrowThis = ${this}`); // obj itself
              console.log(this.count); // 10
          }, 300)
      }
    };
    obj.doSomethingLater();
    obj.doSomethingLaterArrow();  
    ```
    - 注意<span class="orange">`setTimeout(func, delay)`的func</span>, by default if there is no set on `this` in the call or with `bind`, <span class="orange">func是executes on the window scope, 即func的this是window obj</span>.

#### <a name="82-invoking-functions" id="82-invoking-functions">8.2 Invoking Functions</a>

Functions can be invoked in 5 ways: as function, as obj.method, as constructor, indireclty thru `apply`/`call`, implicit function invocation: `getter`/`setter`, `toString`, etc.

- Function Invocation: `func(...args)`
	- `func(...args)`
	- inside func(){...this...}, `this` is window obj (non-strict) or `undefined` (strict). <span class="orange">注意下面把this放到function里</span>
	
		```javascript
		"use strict"; // 勿忘双引号

		// return !this 或者 return this !== window
		const isStrict = (function() { return !this; })(); // IIFE
		console.log(`is strict mode = ${isStrict}`);
		```
- Method Invocation
	- `obj.method(...args)`
	- inside obj.method(){...this...}, `this` is obj.
- Constructor Invocation: `const obj = new Object();`
- Indireclty thru `call`/`apply`
- Implicit function invocation: <span class="orange">`getter`/`setter` (accessor properties)</span>, `toString()`, `valueOf()`, etc
	
	```javascript
	let p = {
        x: 2,
        y: 4,
        get result() {
            return this.x + this.y;
        }, // 勿忘逗号
        set result(ratio) { // p.result = val will trigger setter
            this.x = Number((this.x/ratio).toFixed(1));
            this.y = Number((this.y/ratio).toFixed(1));
        }
    };
    console.log(p.result); // 6
    p.result = 10; // setter is triggered
    console.log(p.result); // 0.6000000000000001
	```
  - object可以之间勿忘逗号: get result() {}<span class="orange">,</span>
  - `Number.toFixed(n)`return的是string, 必须Number cast, 否则算result的时候是string相加: `(2/10).toFixed(1) + (4/10).toFixed(1); // "0.20.4"`
  - 6/10结果是0.6000000000000001, floating, 要用`toFixed(n)`变成n位小数, eg: currency saved as cents, then do (priceInCent/100).toFixed(2) => "10.25"

#### <a name="83-function-arguments-and-parameters" id="83-function-arguments-and-parameters">8.3 Function Arguments and Parameters</a>

- Optional Parameters and Defaults

	Ex1. 注意下面两种default的写法
	
	```javascript
	const pushToArray1 = function(num, arry) {
		arry = arry || []; // default to []
		arry.push(num);
		return arry;
	};
	const pushToArray2 = function(num, arry = []) { // default to []
		arry.push(num);
		return arry;
	}
	```
		
	Ex2. 注意下面height的default val用的是前一个param的val
		
	```javascript
	const rect = (width, height=width*2) => ({ width, height });
	rect(1); // { width: 1, height: 2 } 
	rect(1, 3); // { width: 1, height: 3 }. 注意这里pass进height了,  height就不取width*2了
	```
- **Rest** Parameters in function **Definition** and **Spread** Operator in function **Invocation**

	Ex1. Rest parameter in function defintion
	
	```javascript
	function max(...args) {
      return Math.max(...args);
  }
  console.log(max()); // -Infinity, by default对于Math.max
  console.log(max(1, 10, 100, 2, 3, 1000, 4, 5, 6)); // 1000
    
  // 也可以写成
	function max(first = -Infiintiy, ...rest) {
		// first=1, rest是剩下的[10, 100, 2, 3, 1000, 4, 5, 6]
		return Math.max(first, ...rest); // 注意这里要加上first, 因为rest里没有第一个param
	}
	console.log(max(1, 10, 100, 2, 3, 1000, 4, 5, 6)); // 1000
	```
	
	- <span class="orange">注意first = -Infiintiy里的-Infinity只是default value</span>, 如果max没有params, 那么first defaults to -Infinity
	- rest是从第二个param开始的剩下所有params的合集. 如果max()没有params, rest = [], 即空arry;
  - 也可以写成`Math.max.apply(null, arry)`

  	
##### <a name="882-higher-order-functions" id="882-higher-order-functions">8.8.2 Higher-Order Functions</a>

<b>Higher-Order Functions</b> are functions that operate on other functions, either by taking them as arguments **OR** by returning them. In simple words, A <u>Higher-Order function</u> is a function that receives a function as an argument **OR** returns the function as output.

- Take functions as args: `arry.map`, `arry.filter`, `arry.reducue`
- Return a function

  ```javascript
  function foo() {
    return function() {
        console.log("hello");
    };
  }
  foo()(); // hello
  ```

#### <a name="86-closure" id="86-closure">8.6 Closure</a>

A **closure** is <u>a function</u> that can access variables from its outer scope, even after that outer scope has finished executing. 
- An IIFE is one way to create a private scope that closures can capture, but closures do not require IIFEs: 比如下面Ex1.2 return a function inside a function.

Ex1.1

```javascript
let scope = "global";
function checkScope() {
  let scope = "local";

  return (function check() { // IIFE
    return scope;
  })();
}
console.log(checkScope()); // local
```
- checkScope()返回的是scope. IIFE立刻执行了, scope是checkScope里的scope local

Ex1.2

```javascript
let scope = "global";
function checkScope() {
  let scope = "local";

  return function check() {
    return scope;
  };
}
console.log(checkScope()()); // local, 勿忘第二个()才是执行的()
```
- 这里checkScope()<span class="orange">()</span>有两个(). 区别于Ex1.1, 这里checkScope()返回的还是function check
- 虽然checkScope executed的时候, 和checkScope同级的scope是"global", 但是**Functions are executed using the scope they were defined in**, NOT where they are invoked.

Ex2.1.1 keep count private: IIFE + closure (return function)

```javascript
const addOne = (function() {
  let count = 0; // 必须是let 不是const!!
  return function plusOne() {
    count++;
    return count;
  }
})();
console.log(addOne()); // 1
console.log(addOne()); // 2
```

Ex2.1.2 <span class="orange">区别上面的addOne</span>
	
```javascript
const addNo = function() { // 不是IIFE
  let count = 0;
  return function() { // closure
    count++;
    return count; // 如果直接return count++是0, 可以return ++count是1
  };
};
console.log(addNo()()); // 1
console.log(addNo()()); // 1, 还是1!!
```
- 区别于Ex2.1.1的addOne, addNo没有IIFE, 是一个class/function. <span class="orange">每次call得到的是一个新的count</span>, 互相不干扰.

Ex2.1.3

```javascript
function counter() { // 不是IIFE
  let count = 0;
  return {
    add() { // closure
      return ++count;
    },
  };
}
const c1 = counter(), c2 = counter();
console.log(c1.add()); // 1
console.log(c1.add()); // 2
console.log(c2.add()); // 1, c1和c2互不干扰, has its own count
```
- counter和上面2.1.2addNO一样, <span class="orange">但是区别于2.1.1addOne是IIFE</span>
  - 都是function, c1和c2互不干扰
  - return的都是closure, 都可以access outer scope

Ex2.1.4 access count

```javascript
function counter2(n = 0) {
  return {
    get count() {
      return n; // scope chain to param n
    },
    set count(val) {
      try {
        if (val > n) { n = val; }
        else {
          throw new Error(`${val} should be larger than n`);
        }
      } catch (err) {
        console.log(err);
      }
    }
  }
}

const d1 = counter2(3);
console.log(d1.count); // 3
d1.count = 5;
console.log(d1.count); // 5
d1.count = 2; // Error: 2 should be larger than n
```
- 注意这里没有this.n, d1.count返回n是通过scope chain爬到counter2的params
- accessor properties: <span class="orange">getter/setter can only be added to object</span>, not function. 所以下面是return { get, set } 
- 上面的get count和set count是<u>two closures defined in the same scope</u> and share access tot he same private variable.

```javascript
console.log(d1 instanceof  counter2); // false
console.log(d1 instanceof Object); // true
```

- 注意`d1 instanceof counter2; // false`. 因为counter2 return的是一个plain object
- 区别于下面的class

```javascript
class Counter {
  constructor(n) {
    this.n = n;
  }
  // dummy getter and setter. we can use d2.n directly
  get count() {
    return this.n;
  }
  set count(val) {
    this.n = val;
  }
}
const d2 = new Counter(10);
console.log(d2.count); // 10
d2.count = 20;
console.log(d2.count); // 20
console.log(d2 instanceof Counter); // true
```

Ex2.1.5 Singleton, instance只init了一次, return object { function }

```javascript
const Singleton = (function() {
	let instance; // 要用let 不是const
	function createInstance() {
		console.log(`-- in createInstance --`);
		instance = { a: 1 };
	}
	function getInstance() {
		if(instance === undefined) {
			createInstance();
		}
		return instance;
	}

	return { // return一个object
		getInstance
	};
})();
console.log(Singleton.getInstance()); // 会trigger createInstance
console.log(Singleton.getInstance()); // 不再trigger createInstance了
```
- 不是const a = Singleton()!! <span class="orange">Singleton不是一个function</span>, 它return的是一个object
  - 区别于2.1.1, <span class="orange">这里不是return getInstance, 而是return一个object { getInstance }</span>, 所以可以用function名Singleton.getInstance()

### <a name="861-closure-in-loops" id="861-closure-in-loops">8.6.1 Closure in Loops</a>

<b>Closure Scope Chain</b>: Every closure has three scopes (它解释了下面how variables are resolved when it's inside <u>closures in loops</u>)
- Local Scope (Own scope)
- Outer Functions Scope
- Global Scope

Ex1.1 common mistake of closure in loops

```javascript
const funcs = [];
for(var i=0; i<10; ++i) {
    funcs[i] = () => i; // 所有loop share的同一个i
}
console.log(funcs[5]()); // 10. 因为funcs的10个functions都是share的同一个i, 此时i=10
```

- 勿忘最后是funcs[5]<span class="red">()</span>. funcs[5]只是一个function, 没有执行
- 在loop的时候只是create了10个closures<span class="red">但并没有执行</span>, 每一个都是`()=>i`, the same i. 此时i(outer scope)已经是10了.
  - 这里是closure是因为closure的定义: closure是一个function, 可以access outer scope var.
- 如果改成`funcs[i] = (i) => i; // undefined`也不对. funcs[5]其实就是`(i) => i`, `funcs[5]()`执行的时候, 没有传进i, <span class="red">scope chain先找local scope -> param i, which is undefined</span> <span class="orange">除非同时改成</span>`funcs[5](5)`.

<span class="orange">How to fix</span>
- 用`let` / `const` 做for loop, since `let` and `const` are block scoped, each iteration has its own independent binding of i.

```javascript
const funcs = [];
for(let i = 0; i<10; ++i) {
  funcs[i] = () => i;
}
console.log(funcs[5]()); // 5
```
- new var per iteration: 注意<span class="orange">必须let j=i, 如果用var还是一样</span>

```javascript
const funcs = [];
for(let i = 0; i<10; ++i) {
  let j = i; // 不能用var 否则还是10
  funcs[i] = () => j;
}
console.log(funcs[5]()); // 5
```
- Use more closures:  <u>Creates a new lexical environment</u>, in which v refers to the corresponding i when constFunc(i) triggered.

```javascript
function constFunc(v) { // constFunc是一个closure, return的是一个function! 不是return v
  return () => v;
}
let funcs = [];
for(var i=0; i<10; ++i) {
  /**
   * 1. 必须传进i,否则undefined
   * 2. constFunc(5) 就是执行了constFunc, 所以funcs[5]= constFunc(5) = ()=>v
   * 所以funcs[5]()执行的时候就是向上找v -> constFunc(v) -> constFunc(5), 就是5
   */
  funcs[i] = constFunc(i);
}
console.log(funcs[5]()); // 勿忘多出来的()!! funcs[5]即constFunc(5)返回的是一个function
```
	
- 勿忘最后是funcs[5]<span class="red">()</span>. funcs[5]即constFunc(5), 执行了, 返回的是一个function ()=>v;
- `function constFunc(v) { return v; }`也对, 只是最后就是console.log(funcs[5]), <u>没有多余的()</u>. 因为funcs[5]=counstFunc(5), return的已经是v了
- <b>Closure Scope Chain</b>: funcs[5]在loop的时候就已经定义了= constFunc(5)=()=>v, 所以funcs[5]<span class="red">()</span>执行的时候会向上找v<span class="orange">outer scope-> param constFunc(5)的5</span>

Ex1.2 Show help text once focusing on the input box. 

Error: No matter what field you focus on, the message "your name" will always be displayed.

```html
<label for="email">Email:</label>
<input id="email" type="text" placeholder="Email here.." />

<label for="name">Name:</label>
<input id="name" type="text" placeholder="Name here..." />

<p id="help"></p>
```
- 注意lable for的用法

```javascript
// 这么写不好, 只需看懂为什么不对. 而且一般用addEventListener("focus", ...)
const json = [{
	id: "email",
	help: "your email"
	}, {
	id: "name",
	help: "your name"
}];

const help = document.querySelector("#help");
for(var i=0, size=json.length; i<size; ++i) {
    var elem = json[i];
    document.getElementById(elem.id).onfocus = () => {
        help.innerHTML = elem.help;
    }
}
```
- <b>Closure Scope Chain</b>: 当focus callback的时候只有`() => { helper.innerHTML = elem.help; }`. 此时在local scope里没有elem的定义, 所以向上找<span class="orange">outer scope: elem=json[i], 已经是last elem in json</span>, 所以help text是name的help.

How to fix

- 用`let` / `const` 做for loop
- 用forEach

```javascript
const json = {
  email: "your email",
  name: "your name",
};

// document.addEventListener("DOMContentLoaded", ...): fires when HTML is parsed and DOM is ready — images/stylesheets may still be loading
// window.addEventListener("load", ...) fires when everything is loaded — DOM + images + stylesheets + iframes

// need DOMContentLoaded if script is in <head>
// 如果在end of body就不用了
// document.addEventListener("DOMContentLoaded", () => {
document.querySelectorAll("input").forEach(elem => {
  elem.addEventListener("focus", () => handleFocus(elem.id));
  elem.addEventListener("blur", handleBlur);
});

const help = document.querySelector("#help");
function handleFocus(id) {
  help.innerHTML = json[id];
}
function handleBlur() {
  help.innerHTML = "";
}

// if elem.addEventListener("focus", handleFocusEvt)
// evt is the FocusEvent object, evt.target.id gives the element's id
function handleFocusEvt(evt) {
  help.innerHTML = json[evt.target.id];
}
// });

```
| | `document.addEventListener("DOMContentLoaded", ...)` | `window.addEventListener("load", ...)` |
|---|---|---|
| Fires when | HTML parsed, DOM ready | DOM + images + stylesheets + iframes all loaded |

| | `elem.addEventListener("focus", handleFocusEvt)` | `elem.addEventListener("focus", () => handleFocus(elem.id))` |
|---|---|---|
| Handler receives | event object (`evt`) | nothing — arrow ignores it |
| Access element | `evt.target.id` | `elem.id` via **closure** |
| Control over args | browser decides | you decide what to pass |

Ex1.3 `range(start, end)` — closure to curry a function ([YDKJS apB](../ydkjs/get-started/apB.md))

```javascript
function range(start,end) {
    // ..TODO..
}

range(3,3);    // [3]
range(3,8);    // [3,4,5,6,7,8]
range(3,0);    // []

var start3 = range(3);
start3(3);     // [3]
start3(8);     // [3,4,5,6,7,8]
start3(0);     // []
```

Solution:

```javascript
function range(start, end) {
    start = Number(start) || 0;

    if (end === undefined) {
        return function(end) {
            return getRange(start, end);
        };
    } else {
        end = Number(end) || 0;
        return getRange(start, end);
    }

    function getRange(start, end) {
        var ret = [];
        for (let i = start; i <= end; i++) {
            ret.push(i);
        }
        return ret;
    }
}
```

Ex1.4 Define a toggle(..)

```javascript
function toggle(/* .. */) {
    // ..
}

var hello = toggle("hello");
var onOff = toggle("on","off");
var speed = toggle("slow","medium","fast");

hello();      // "hello"
hello();      // "hello"

onOff();      // "on"
onOff();      // "off"
onOff();      // "on"
```

Solution:

```javascript
function toggle(...args) { // 注意这里需要args, 不是下面return function
  let count = 0;

  // 不是return function(...args)!!! 要让它向上找args - toggle(...args)
  // 如果return function(...args) 就是[]了, 因为hello()并没有pass进任何args
  return function() { 
    const toRet = args[count] ?? "";
    count++;
    count = count % args.length;
    return toRet;
  };
}
```
- 注意toggle(...args)但是return function() {} 不需要args!! 如果return function(...args) 就是[]了, 因为hello()并没有pass进任何args

### <a name="862-the-closure-lifecycle-and-garbage-collection-gc" id="862-the-closure-lifecycle-and-garbage-collection-gc">8.6.2 The Closure Lifecycle and Garbage Collection (GC)</a>

Closure can unexpectedly prevent GC of variables, leading to memory leaks. Discard function references when they're no longer needed.

有`addEventListener`就一定要有`removeEventListener`, 否则会有<span class="orange">memory leak</span>. 而且只能一个一个unsubscribe.

Ex. 体会下面的写法有问题

```javascript
const btnHandlers = [];
btn.addEventListener("click", handleCheckout);
btn.addEventListener("focus", handleFocus);

unsubscribeAll();

function handleCheckout() {
  // btnHandlers.push({ action: "click", handler: handleCheckout.name }); - 这是错的, removeEventListener需要real function, 不是function name string!!
  btnHandlers.push({ action: "click", handler: handleCheckout });
}
function handleFocus() {
  btnHandlers.push({ action: "focus", handler: handleFocus.name });
}
function unsubscribeAll() {
  btnHandlers.forEach(listener => {
    btn.removeEventListener(listener.action, listener.handler);
  })
}
```
- btnHandlers.push(...) runs only when the event fires, <span class="red">not when the listener is registered</span>
  - 如果没有click/focus过btn, btnHandlers=[] when unsubscribeAll(). 但是handleCheckout, handleFocus are still <span class="orange">registered on btn but never cleaned up, causing memory leak</span>.
- <span class="orange">removeEventListener needs the actual function reference, not the name string</span>. 
  - <span class="orange">handleCheckout.name</span>是function的name string, not the function itself.

How to fix
```javascript
const eventHandlers = [];

function subscribe(elem, action, handler) {
  eventHandlers.push({ elem, action, handler });
  elem.addEventListener(action, handler);
}
function unsubscribeAll() {
  // 勿忘括号({...}), 不能直接{...} => {}
  eventHandlers.forEach(({ elem, action, handler }) => {
    elem.removeEventListener(action, handler);
  });

  // clear eventHandler
  eventHandlers.length = 0; 
}

subscribe(btn, "click", handleClick);
subscribe(input, "focus", handleFocus);

unsubscribeAll()；
```
- 在register的时候就push进eventHandlers, 而不是等到callback
- 注意eventHandlers.length=0, 这样array会被gc走
- 如果想写btn.subscribe(...)会比较复杂, 得写
```javascript
HTMLElement.prototype.subscribe = function(action, handler) {
  eventHandlers.push({ elem: this, action, handler });
  this.addEventListener(action, handler);
};

btn.subscribe("click", handleClick);
```
- `HTMLElement.prototype.subscribe = (action, handler) => {...}`是错的!! <span class="red">不能用arrow function, 因为arrow function doesn't have their own `this`</span>!! this在arrow里一般都是window. 必须用regular function!!
  - <span class="red">一般来讲, Most event handler callbacks都用**regular function**, 特别是需要this的时候</span>
- Modifying built-in prototypes is bad practice — it can conflict with browser APIs or other libraries

#### <a name="863-module-systems-iife-cjs-amd-umd-esm" id="863-module-systems-iife-cjs-amd-umd-esm">8.6.3 Module Systems: IIFE, CJS, AMD, UMD, ESM</a>
> YDKJS > Scope & Closures > ch8

All solve the same problem: how do files share code? They differ by era and environment.

| Format | Environment | Loading | Syntax | Status |
|---|---|---|---|---|
| IIFE closure | Browser | Manual `<script>` order | `(function(){})()` | Legacy pattern |
| CommonJS (CJS) | Node.js | Sync `require()` | `module.exports` / `require` | Dominant in Node |
| AMD | Browser | Async, needs RequireJS | `define([deps], fn)` | Obsolete |
| ESM | Both | Static, async-capable | `import` / `export` | Modern standard |

**Write ESM everywhere.** Bundlers like Webpack convert it to CJS/UMD for older consumers. The static/dynamic distinction is the same pattern as function declaration vs expression — see [§1.6](#build-pipeline). You'd only encounter CJS writing Node scripts, and UMD/AMD when maintaining old libraries.

ESM singleton — file scope replaces IIFE, `count` is private to the module. ES modules are evaluated **once** regardless of how many files import them.

Ex1.

```javascript
// count.js
let count = 0;

// 都必须有function keyword！！
export function addOne() { count++; return count; } // function declaration
export const addOne = function() { ... }; // function express

export const COUNT = 0;

import { addOne, COUNT } from "./count";
```
- export addOne() {...} <span class="orange">错的!! export必须要有function keyword</span>.
- 除了export function, 也可以export const VAR=1;

##### The Module Pattern with IIFE, CJS and ESM

A **module** = private state + public API. Three things distinguish it from plain objects:
- Hidden state — internal variables are private by default
- Public API — only what you explicitly export is accessible
- Statefulness — the private state persists over time via closure

> **To share private state (singleton) → IIFE.**
> `const S = (function() { const privateVar = ...; return { getVar() {} }; })(); // 注意IIFE立刻执行了(), share same privateVar`
>
> For independent private state per call → factory function.
> `const F = function() { const privateVar = ...; return { getVar() {} }; };`
> `const f1 = F(); f2 = F(); // own privateVar, unrelated`

<span class="orange">除了2.1.2, IIFE, CJS和ESM都是Singleton</span>

Ex2.1.1 IIFE - legacy, Single instance

```javascript
// Single instance, share同一组records
const Student = (function() {
  const records = [
    { id: 14, name: "Kyle", grade: 86 },
    { id: 73, name: "Suzy", grade: 87 },
    { id: 112, name: "Frank", grade: 75 },
    { id: 6, name: "Sarah", grade: 91 }
  ];

  return {
    getName(id) {
      const match = records.find(record => record.id === id);
      return match?.name;
    }
  }
})();

// 不用Student().getName(), Student returns object not function
console.log(Student.getName(73)); 
```
- 这是一个Singleton, 大家share同一个records
- Student<span class="red">不用()</span>, Student本身IIFE后return一个object, 不是function, 可以直接Student.getName

Ex2.1.2 Factory function - legacy, Multiple instance

```javascript
// Multiple instance, records各不相关
const StudentMulti = function() {
  const records = [
    { id: 14, name: "Kyle", grade: 86 },
    { id: 73, name: "Suzy", grade: 87 },
    { id: 112, name: "Frank", grade: 75 },
    { id: 6, name: "Sarah", grade: 91 }
  ];
return {
    getName(id) {
      const match = records.find(record => record.id === id);
      return match?.name;
    }
  };
};

const s1 = StudentMulti(), s2 = StudentMulti();
console.log(s1.getName(73));
console.log(s2.getName(73));
```
- 区别于2.1.1是IIFE, 立即执行了, 可以直接Student.getName. 这里2.1.2没有IIFE, 必须StudentMulti() - 注意<span class="orange">需要(), 执行完后才能StudentMulti().getName</span>
- 区别于2.1.1是Singleton, 这里每一个StudentMulti()都有自己的copy

Ex2.2 CJS - legacy

```javascript
// student.js
const records = [
  { id: 14, name: "Kyle", grade: 86 },
  { id: 73, name: "Suzy", grade: 87 },
  { id: 112, name: "Frank", grade: 75 },
  { id: 6, name: "Sarah", grade: 91 }
];

function getName(id) {
  const match = records.find(record => record.id === id);
  return match?.name;
}

module.exports = {
  getName,
};

// app.js
const { getName } = require("./student.js");
console.log(getName(73));
```
- CJS are file-based, one module per file
- <span class="orange">CJS are singletons</span>: no matter how many times you require(..), you get references to the single shared instance.

Ex2.3 ESM - 用这个

```javascript
const records = [
  { id: 14, name: "Kyle", grade: 86 },
  { id: 73, name: "Suzy", grade: 87 },
  { id: 112, name: "Frank", grade: 75 },
  { id: 6, name: "Sarah", grade: 91 }
];

export function getName(id) {
  const match = records.find(record => record.id === id);
  return match?.name;
}

// app.js
// ranaming import
import { getName as getStudentName } from "./student.js";
console.log(getStudentName(73));

// namespace import, import all export
import * as Student from "./student.js";
console.log(Student.getName(73));
```
- ESM are file-based, one module per file
- <span class="orange">ESM are singletons</span>
- 注意rename和import * as Student from "..." 的写法

---

#### <a name="62-creating-objects" id="62-creating-objects">6.2 Creating Objects</a>

There are three ways to create object. o1, o2, o3 created方式生成的obj是等效的

```javascript
const o = new Object();

const o1 = { x: 1, y: 2, z: [1,2] }; // object literals
const o2 = Object.create(o1); 

// empty o2 without new prop assigned to o2, everything reads from o1
console.log(o2.x); // 1, inherited from o1
o1.x = 3;
console.log(o2.x); // 3, reading from o1
console.log(o2.hasOwnProperty("x")); // false

// creates own property x on o2
o2.x = 10;
console.log(o2.x); // 10
console.log(o1.x); // 3, no affect to o1
o1.x = "new o1";
console.log(o2.x); // 10, o1 and o2 have their own x for each now
console.log(o2.hasOwnProperty("x")); // true

o2.z.push(3);
console.log(o1.z); // [1,2,3] — o2 doesn't have its own z
```
- `object.create(o1)` <span class="orange">creates an empty o2</span> - no own properties at all
- o2 reads x by walking up the prototype chain to o1. So whatever o1.x is, o2.x reflects it
- <span class="orange">unless assigning o2.prop = ... creates an own property on o3</span>

##### `null` vs nullable object `Object.create(null)`

| Feature | `null` | `Object.create(null)` |
|---------|--------|------------------------|
| What is it? | Primitive value representing "no value" | Object with no prototype |
| Type | Primitive | Object |
| `typeof` | `"object"` (historical bug) | `"object"` |
| Can have props? | ❌ No | ✅ Yes |
| Has a prototype? | N/A | ❌ No (`[[Prototype]]` is `null`) |
| Inherits `Object.prototype`? <br> eg: `toString()`, `hasOwnProperty`| ❌ No | ❌ No |

```javascript
null.name = "Alice"; // Uncaught TypeError: Cannot set properties of null (setting 'name')

const obj = Object.create(null);
console.log(typeof obj); // object, behave like an object

obj.name = "Alice"; // nullable object可以set props
console.log(obj.name); // Alice

console.log(obj.toString); // undefined, no inherit from Object.prototype
console.log(obj.hasOwnProperty); // undefined
```
- `Object.create(null)` creates a special kind of object that's useful when you want <u>a clean key-value store without inherited properties</u>.

##### Object key

```javascript
const myObj = {};
myObj[3] = "hello";
myObj["3"] = "world"; // override
console.log(myObj); // {3: 'world'} - same property override

myObj[true] = 100; // "true"
myObj[null] = 200; // "null"
myObj[undefined] = 300; // "undefined"
myObj[{a:1}] = 400; // String({a: 1}) = "[object object]"
console.log(myObj);
// { 3: "world", true: 100, null: 200, undefined: 300, [object Object]: 400 }

const arry = [1,2,3,4];
arry[2]; // 3
arry["2"]; // 3, key是string
```
- { **true**: 100 }, key是string, 但是key没有双引号
- Object **keys** are always **strings**. Non-string keys are coerced.
- Arrays behave as numerically indexed — arry["2"] accesses the same slot as arry[2].

#### <a name="610-extended-object-literal-syntax" id="610-extended-object-literal-syntax">6.10 Extended Object Literal Syntax</a>

##### <a name="6101-shorthand-properties--6102-computed-property-names--6105-shorthand-methods" id="6101-shorthand-properties--6102-computed-property-names--6105-shorthand-methods">6.10.1 Shorthand Properties + 6.10.2 Computed Property Names + 6.10.5 Shorthand Methods</a>

##### Shorthand Properties

```javascript
let x=1, y=2;
let o = { // shorthand
  x, 
  y,
};

const obj = {};
const varKey = "key"
obj[varKey] = "test for key";
obj["prop with space"] = "test for space";
console.log(obj[varKey]);
console.log(obj["prop with space"]);
```

##### Shorthand Methods

```javascript
let square = {
    side: 10,
    area() {
        return this.side * this.side; // 必须用this.side, side is not in scope
    }
}
square.area(); // 100
```
- object里的function必须用this.prop

##### <a name="6104-spread-operator--rest-parameters" id="6104-spread-operator--rest-parameters">6.10.4 Spread Operator + Rest Parameters</a>

##### Spread Syntax

Spread syntax can be used when all elements from an object or array need to be included in a list of some kind. 

> Spread operator可以用于
> - <span class="orange">Spread array to items</span> `Math.max(...nums) // nums=[1,2], Math.max.apply(null, nums)`
> - <span class="orange">Spread object to <key,val> pairs</span> `copy = { ...copy, newProp: 1, }`
> - Convert <span class="orange">array-like</span> to array `nodeArry = [...document.querySelectorAll(img)]`, `[...arguments]` - 也可以用`Array.from(arguments)`
> - <span class="orange">String to array</span> `[...str]`
> - <span class="orange">Set/Map to array</span> `[...set]`

Ex1.
```javascript
arry1.unshift(4, 5); // [4,5, ..arry1]
arry1.unshift(...arry2);  // [...arry2, ...arry1];

Math.max(...nums); // Math.max.apply(null, nums)
```

Ex2. `[...arry]` - Array Shallow Copy

```javascript
let arry1 = [1,2,3];
let arry2 = [...arry1]; // like arry1.slice()
arry1.push(4);
console.log(arry1); // [1,2,3,4]
console.log(arry2); // [1,2,3] arry2依然是[1,2,3]


let a = [[1], [2], [3]];
let b = [...a]; // b = [[1], [2], [3]]  
b.shift().shift(); //  1, 注意返回的是shift出去的: [1].shift()的1
console.log(b); // [[2], [3]], 注意b只剩两个了
console.log(a); //[[], [2], [3]], 注意a的第一个的1没了
```	
- `b.shift().shift()`
  - 是[1].shift(), 不是b连着shift出[1]和[2]
  - b还剩下两个[2]和[3]
- a还是有三个, 只是第一个是[], 区别于b

Ex3.1 `{ ...obj, prop1: "a" }` - Object Shallow Copy

```javascript
const circle = {
  radius: 10,
  style: {
      background: "red"
  }
};
const coloredCircle = {
  ...circle,
  color: "black"
}
console.log(JSON.stringify(coloredCircle)); // {"radius":10,"style":{"background":"red"},"color":"black"}

coloredCircle.radius = 20;
coloredCircle.style.background = "yellow";
// style是shallow copy, circle.style.background也变了, 但是radius没变
console.log(JSON.stringify(circle)); // {"radius":10,"style":{"background":"yellow"}}
```

Ex3.2 Recursive merge (merge source into target) - assume type mismatches fall through to source-wins overwrite (as ref), assume target and source are plain object (not null)

```javascript
const target = { 
  "name": "a", 
  "about": { 
    "items": [{ "name": "MacBook" }] 
  } 
};
const source = { 
  "name": "b", 
  "about": { 
    "name": "brand",
    "items": [{ "name": "Dell" }] 
  } 
};

const shallowCopy = { ...target, ...source };
console.log(JSON.stringify(shallowCopy)); 
// {"name":"b","about":{"name":"brand","items":[{"name":"Dell"}]}}
// 注意source.about overwrites target's about entirly, no merge

// 区别于shallowCopy, 下面的recursiveMerge, object/array都会merge
function recursiveMerge(target, source) {
  Object.keys(source).forEach(key => { // assume target|source are all plain objects
    const targetVal = target[key]; 
    const sourceVal = source[key];

    /** 
     * 不能用targetVal = ... fail at array and primitive (obj works) 
     * (arrays)— [...targetVal, ...sourceVal] creates a new array and assigns it to targetVal. target[key] still points to the old array.
     * 用targetVal.push(...sourceVal)就对了, 此时targetKey|targetVal指向同一个地址
     * (object) - mutate in place, 不需要target[key] = ... 有没有都对
     * (primitive) - targetVal changed but target[key] is unchanged
     * */
    if (Array.isArray(targetVal) && Array.isArray(sourceVal)) {
      target[key] = [...targetVal, ...sourceVal];
    } else if (isPlainObject(targetVal) && isPlainObject(sourceVal)) {
      recursiveMerge(targetVal, sourceVal);
    } else {
      /** 两种情况 
       * 1. target[key]=undefined 
       * 2. target[key]和source[key]都存在但type mismatch
       * */
      target[key] = sourceVal;
    }
  });
  return target; // 勿忘return, recursive才成立
}

// 这里check的是plain object, null不是plain object. 
// null会fail在Object.key上(TypeError) - recursiveMerge(null, null)
function isPlainObject(obj) {
  return !!obj && typeof obj === "object" && !Array.isArray(obj);
}
console.log(JSON.stringify(recursiveMerge(target, source)));
// {"name":"b","about":{"items":[{"name":"MacBook"},{"name":"Dell"}],"name":"brand"}}
```
— `{ ...target, ...source }` is shallow: nested objects are overwritten entirely, not merged. 
- `JSON.stringify(obj)` is recursive stringify, nested obj inside will be stringified as well
- `Object.keys(null)` throw Uncaught **TypeError**: Cannot convert undefined or null to object
- for recursive function, 
  - If the <span class="orange">recursive computes and produces a value, you almost **always need return**</span> (比如这里)
  - If the recursive performs an action, you often don't.

> **Spread copies only own enumerable props/arrow functions — inherited props and prototype methods are not included.**

Ex3.3.1 spread没有inherited props

```javascript
const o1 = { x: 1 };
const o2 = Object.create(o1); // o2是一个empty object
const o3 = { ...o2 };
console.log(o3.x); // undefined
```
- 注意Object.create只是create了一个empty object, o2没有自己的x, unless do o2.x=10

Ex3.3.2 spread没有inherited functions

```javascript
class BaseClass {
  prop = "a"; // 不是prop: "a", 是=不是:, 是;不是,
  foo() {
    return "baseClass";
  }
}
class MyClass extends BaseClass {
  bar() {
    return "myClass: bar";
  }
}
const myClass = new MyClass();
myClass.baz = function() {
  return "myClass: baz";
}

const clone = { ...myClass };
console.log(clone); // {prop: 'a', baz: ƒ}. 注意clone没有foo也没有bar, myClass的foo和bar都是inherited/reference
console.log(JSON.stringify(clone)); // {"prop":"a"}, 区别于直接log, 没有function

console.log(clone.constructor.name); // Object
console.log(clone instanceof MyClass); // false


const clone2 = Object.assign({}, myClass); // = { ...myClass }, 都没有inherited
console.log(clone2); // {prop: 'a', baz: ƒ}, 和spread一样
```
- 注意class里prop的写法prop <span class="red">**=**</span> "test"<span class="red">**;**</span>
- `{ ...myClass }`<span class="orange">只copy myClass自己的props/functions. 每一个const mc = new MyClass()都有自己的prop</span>, mc1.prop="a"并不影响mc2.prop. <span class="orange">区别于foo和bar是inherited</span>, 是reference. 但是arrow function除外, arrow function是自己的prop (见下例)

| | `{ ...target, ...source }` | `Object.assign(target, source)` |
|---|---|---|
| Copy depth | Shallow | Shallow |
| Mutates target | No — new object created | Yes — modifies target in place. Use `Object.assign({}, target, source)` to avoid mutation (legacy, prefer spread) |
| Common use case | Clone / merge without mutation | Merge into existing object |

Ex3.3.3 class里的function VS arrow function

```javascript
class Button {
  handleClick() {
    console.log(this); // this = btn (loses Button instance context)
  }
  handleClickArrow = () => { // 注意是=, 和prop="test"一样
    console.log(this); // this = Button instance, always
  }; // 注意需要; just like prop="a";
}
const btn = document.querySelector("button");
const button = new Button();
btn.addEventListener("click", button.handleClick); // this = btn
btn.addEventListener("click", button.handleClickArrow); // this = button instance

const cloneBtn = { ...button };
console.log(cloneBtn); // { handleClickArrow: ƒ } — arrow field is own prop, handleClick is not
```
- 注意handleClickArrow定义是<b>=</b>和<b>;</b> handleClickArrow <span class="orange">**=**</b></span> ()=>{}<span class="orange">**;**</span> - 和`prop="a";`一样
- arrow function是own prop, 在cloneBtn里
        
##### Rest Parameters

<span class="orange">Rest用于function definition时的params</span>, 因此具体用这个function的时候pass进的params是无所谓多少个的. 区别于<span class="orange">Spead用于trigger function的时候</span>, 只是为了不一个一个写params, 但是function本身定义时能接受的params是定量的, eg: Math.max(...nums).

Ex1. 

```javascript
// Ex1.
function f1(a, b, ...rest) {
	// 这是rest, rest是一个array
}
const arry = [1,2];
f2(...arry); // 这是spread

// Ex2.
function sum(...nums) { // rest
  return nums.reduce((acc, cur) => acc + cur, 0);
}
const arry = [1,2,3];
console.log(sum(...arry)); // 6. spread. 注意不是sum([1,2,3])!!!

// Ex3.
function multiply(multiplier, ...args) { // rest
  return args.map(num => num * multiplier);
}
console.log(multiply(10, 1, 2, 3)); // [10, 20, 30]
```

Ex2. 注意`arguments` to array的方法

```javascript
function sortArguments() { // 这里不用写params
  try {
    return arguments.sort();
  } catch(err) {
    console.log(err);
    
    // -- From arguments to an array --
    let arry1 = Array.prototype.slice.call(arguments);
    // -- or --
    let arry2 = Array.from(arguments);
    // -- or --
    let arry3 = [...arguments];
    
    console.log(arry1.sort()); // [1, 3, 5, 7]
    console.log(arry2.sort()); // [1, 3, 5, 7]
    console.log(arry3.sort());
  }
} 
console.log(sortArguments(5,3,7,1)); // TypeError: arguments.sort is not a function
```
- arguments是array-like, <span class="orange">只支持arguments.length</span>
- array-like不能直接用array的function. transform to array的方法: 
  - `[...arguments]`
  - `Array.from(arguments)`

#### <a name="3104-destructuring-assignment" id="3104-destructuring-assignment">3.10.4 Destructuring Assignment</a>

[MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment#object_destructuring)

The **destructuring assignment** syntax is a JavaScript expression that makes it possible to unpack values from <u>arrays</u>, or properties from <u>objects</u>, into distinct variables.

##### Array Destructuring

```javascript
// Default values
let [c=2, d=5] = [1]; // 不能用const!!
console.log(`c = ${c}, d = ${d}`); // c = 1, d = 5

function f() { return [1, 2, 3]; }
// ignore some value
cosnt [f1, , f3] = f(); // arry[1] is ignored
console.log(`f1 = ${f1}, f3 = ${f3}`); // f1 = 1, f3 = 3

// with ..., spread/rest will group the rest into an array
let [a, ...rest] = [10, 20, 30];
console.log(rest); // [20, 30]

const [start = "a", ...rest] = [..."hello"];
console.log(rest); // ['e', 'l', 'l', 'o'], 注意rest是arry of char, 不是剩余的string
```

##### Object Destructuring

Ex1.

```javascript
const user = {
    id: 42,
    name: "jdoe",
    fullName: {
        fName: "john",
        lName: "doe"
    }
};

const { 
  id: userId, // 注意不是id: "userId"!! 没有双引号
  isVerified = false  // default val
} = user;
console.log(userId, isVerified); // 42 false

function getId({ id }) { return id; }
console.log(getId(user)); // 42

function getFullName({ fullName: { fName, lName } }) { // default {}
  return `${fName} ${lName}`
}
console.log(getFullName(user)); // john doe
```
- Renaming
  - 是冒号不是等号!! 区别于default val { id<span class="orange">**:**</span> userId, isVerified <span class="orange">**=**</span> false, } = user
  - rename没有双引号{ <span class="orange">id: **userId**</span> } = user
- 注意string里的var的写法
```
return `${fName} a ${lName}`; // ``是整个string, 返回john a doe
```

Ex2.1 fallback default in case obj.key不存在

```javascript
let object;
const {
  main: {
    content: {
      title = "defaultTitle", // 等号!! 不是:
    } = {},
  } = {},
} = object || {}; // 这里fallback to {}
console.log(title); // defaultTitle
```
- 注意default都是用=, rename才是:

Ex2.1 Ex1中getFullName param的fallback

```javascript
function getFullName({fullName: { fName, lName }} = {}) {
  return `${fName} ${lName}`;
} 
console.log(getFullName()); // Uncaught TypeError: Cannot read properties of undefined (reading 'fName')

function getFullName({fullName: { fName, lName } = {} } = {}) {
  return `${fName} ${lName}`;
} 
console.log(getFullName()); // undefined undefined
```
- 一个default是不够的 `{fullName: { fName, lName }} = {}`. 如果要fName/lName, 则需要 { fullName: <span class="red">{ fName, lName } = {}</span> } = {}, 否则会undefined.fName -> ERROR
- 此时结果是两个undefined, 不是一个

Ex3.

```javascript
const metadata = {
    title: "metadata",
    translations: [
        {
            locale: "en",
            title: "en_title_metadata",
            rel: {
                a: "en_a",
                b: "en_b"
            }
        },
        {
            locale: "es",
            title: "es_titile_metadata",
            rel: {
                a: "es_a",
                b: "es_b"
            }
        }
    ],
    url: "/en-US/metadata"
};

// 必须有括号({title, rel}) => {}, 否则ERROR
metadata.translations.forEach(({ title, rel } = {}) => { 
  console.log(`title = ${title}, ${JSON.stringify(rel)}`);
});
// title = en_title_metadata, {"a":"en_a","b":"en_b"}
// title = es_titile_metadata, {"a":"es_a","b":"es_b"}
```
- `({title, rel}) => {}`必须有括号!! <span class="red">**(**</span>{...}<span class="red">**)**</span> => {}, 否则ERROR
- 用Template Literals时, 只要没用`${..}`框起来的就是string, 这里在``里要用<span class="red">${</span>JSON.stringify(rel)<span class="red">}</span>
```
console.log(`title = ${title}, ${JSON.stringify(rel)}`)
```

Ex4.1 把from copy进to, 在to的insertAt插入, 插入的是from从fromIndex开始向后数numToCopy个

```javascript
function arryCopy({ from=[], to=[], fromIndex=0, numToCopy=0, insertAt=0 } = {}) {
  // end是fromIndex + numToCopy
  const copy = from.slice(fromIndex, fromIndex + numToCopy);
  to.splice(insertAt, 0, ...copy); // 勿忘deletedCount是0
  return to;
}

let a = [1,2,3,4], b=[5,6,7,8];
// 没有fromIndex, fallback to 0
console.log(arryCopy({ from: a, to: b, numToCopy: 3, insertAt: 2 })); // [5,6,(1,2,3),7,8]
```
- 注意每一个param的default: trigger arryCopy时没有fromIndex, fallback to 0
- `arry.slice(start, end)`
- `arry.splice(start, deleteCount, item1, item2)`
  - 勿忘**deleteCount**. if omits, <span class="orange">fallback to the length of start to end of array</span>
  - `...copy`的应用

Ex4.2 `arry.splice(start, deleteCount, ...items)`的deleteCount

```javascript
function arryCopy({ from=[], to=[], fromIndex=0, numToCopy=0, insertAt=0 } = {}) {
  const copy = from.slice(fromIndex, fromIndex+numToCopy); 
  console.log(copy);
  to.splice(insertAt, ...copy); // 没有deleteCount
  return to;
}
let a = [1,2,3,4], b=[5,6,7,8];
/** 
 * to.splice(2, 1,2,3): 
 * 1 as deleteCount, 7被delete了 -> [5,6, (2,3), 8]
 * */
console.log(arryCopy({ from: a, to: b, numToCopy: 3, insertAt: 2 })); // [5, 6, 2, 3, 8]

a = ["a", "b", "c", "d"], b=[5,6,7,8]; // reset b, splice是in-place
/**
 *  to.splice(2, "a","b","c"): 
 * - "a" as deleteCount -> Number("a") = NaN -> splice treats NaN as 0
 * deleteCount是0 -> [5,6, "b","c", 7,8]
 * */
console.log(arryCopy({ from: a, to: b, numToCopy: 3, insertAt: 2 })); // [5, 6, 'b', 'c', 7, 8]
```
- 注意<span class="orange">splice的deleteCount会用`Number()`coerce</span>. 而且如果coerce是<span class="orange">NaN, splice treat it as 0</span>;

#### <a name="3105-object-optional-chaining" id="3105-object-optional-chaining">3.10.5 Object Optional Chaining</a>
> JS: The Definitive Guide > §4.4.1 | YDKJS > Objects & Classes > ch1

The **optional chaining** operator `?.` accesses a property or calls a method on a value that might be `null` or `undefined`, returning `undefined` instead of throwing.

```javascript
obj?.prop       // undefined if obj is null/undefined
obj?.method()   // undefined if obj is null/undefined
arr?.[i]        // undefined if arr is null/undefined
```

Short-circuits: if the left side is `null`/`undefined`, the right side is **not evaluated**.

```javascript
let user = null;
let name = user?.profile.name;  // undefined
```
- user is null, the right side `.profile.name` is skipped and the whole expression returns undefined. It <u>never tries to access `.profile` at all</u>.

#### <a name="3106-objectentriesobjarry" id="3106-objectentriesobjarry">3.10.6 Object.entries(obj/arry)</a>

[MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/entries)

```Object.entries(obj)```返回的是array of [key, val]  pairs, <u>没有inherited properties</u>.
- 也适用于array: <span class="orange">Object.entries(arry)</span>返回的是arry of [index, val] pairs
- `Object.keys()`, `Object.values()`, and `Object.entries()` all return an <span class="orange">object's **own enumerable**</span> properties
  - Iterate object: <span class="orange">和`for...of`一起</span>, obj本身not iterable.

Ex1. 

```javascript
// key没有双引号, value才有
const obj1 = { a: "aaa", b: 42 };
Object.entries(obj1); // [["a", "aaa"], ["b", 42]], string都是双引号

// 勿忘arrow function的括号!! ([key,val]) => {...}
Object.entries(obj1).forEach(([key, val]) => { 
  console.log(`${key}: ${val}`);
});
// a: aaa
// b: 42
```
- 注意Object.entries(obj1)的结果
- 作为arrow function的param, 和object destructuring一样, array destructuring也要用括号括起来: <span class="red">**(**<span>{ key, val }<span class="red">**)**</span> => {...}, <span class="red">**(**</span>[key, val]<span class="red">**)**</span> => {...}
- template literal里的javascript要用`${...}`, 直接的string不用-这里的冒号

Ex2. Object.entries(arry)

```javascript
const arry = [..."ab"];
// 勿忘destructuring的括号
Object.entries(arry).forEach(([index, val]) => {
  console.log(`${index}: ${val}`);
});
// 0: a
// 1: b
```

#### <a name="544-forof" id="544-forof">5.4.4 for...of</a>

`for...of` iterate **values** from **iterable objects**, <span class="orange">for(const val of arry)</span>
- An object is **iterable** if it has a `Symbol.iterator` method — <span class="red">Arrays, Strings, Sets, and Maps</span>.
- Plain objects are **not** iterable; `for...of` throws a <span class="red">TypeError</span>: obj is not iterable. 
  - To iterate an object, `for...of` + `Object.keys()`, `Object.values()`, or `Object.entries()`.
- `forEach` <u>只能</u>用于array: `[...arguments].forEach(...)`, `Array.from(arguments).forEach(...)`

Ex1. `for...of` + array

```javascript
const arry = [1, 2, 3];
let sum = 0; // 要和const分行写
for (const val of arry) {
    sum += val;
}
```

Ex2. `for...of` + string

```javascript
function getFreq(str) {
  const map = {};
  for(const char of str) {
    if (map[char] === undefined) map[char] = 0;
    map[char]++;
  }
  Object.entries(map).forEach(([char, count]) => {
    console.log(`${char}: ${count}`);
  });
}
getFreq("mississippi");
// m: 1, i: 4, s: 4, p: 2
```

#### <a name="545-forin" id="545-forin">5.4.5 for...in</a>

`for...in` iterate **property names** from **objects**, <span class="orange">for(const key in obj)</span>
- Works with **any object**
- With arrays, `for...in` loops over **index** (as strings): `for(const index in arry) { arry[i] }`
- Loops over **enumerable** property names (keys), including <span class="orange">inherited</span> ones from the prototype chain. 
  - Prefer `Object.keys()` + `for...of` to stay on own properties only.
  - <span class="orange">或者`for...in` + `Object.hasOwn(obj, "someKey")`</span>, 只loop thru non-inherited

  ```javascript
  const obj = { x: 1 };
  "x" in obj         // true, 勿忘双引号!!
  "y" in obj        // false
  "toString" in obj  // true — inherited from Object.prototype
  ```
  - `x in o; // Uncaught ReferenceError: x is not defined`: <span class="orange">勿忘key的双引号</span>

### <a name="5451-objecthasown" id="5451-objecthasown">5.4.5.1 Object.hasOwn</a>

- `Object.hasOwn(obj, "someKey")` (ES2022, **Preferred**) — same as `obj.hasOwnProperty("someKey")`:  
  - Checks own only, no prototype chain. 
  - Safer — static: `hasOwnProperty` lives on `Object.prototype` and can be overridden or shadowed on the object itself

Ex1.

```javascript
const obj = { x: 1 };

console.log(Object.hasOwn(obj, "x")); // true, key勿忘双引号!!
console.log(Object.hasOwn(obj, "toString")); // false, key勿忘双引号!!
```
- key是string, 勿忘双引号!!
- 勿忘 Object.hasOwn(<span class="orange">obj</span>, "somekey")的obj

Ex2. `for...in` + `Obejct.hasOwn` to guard against inherited props:

```javascript
const proto = { x: 1 };
const obj1 = Object.create(proto); // Object.create create的是一个empty object
obj1.b = 2; // 先b后a
obj1.a = 1;

for(const key in obj1) {
  if (Object.hasOwn(obj1, key)) {
    console.log(`${key}: ${obj1[key]}`); // x skip了
  }
}
// b: 2 ← 先b后a
// a: 1

const obj2 = { ...proto, y: 2 }; // 区别于Object.create, spread是shallow copy
console.log(Object.hasOwn(obj2, "x")); // true

const obj3 = Object.assign({}, proto, {y: 2}); // 和spread一样
console.log(Object.hasOwn(obj3, "x")); // true
```
- `for...of`和`for...in` <span class="orange">loop的order都是insert的order, 先b后a</span>
  - `for...in`先loop its own keys, then loop inherited

  ```javascript
  for(const val of Object.values(obj1)) { // x skip了, 只loop its own
    console.log(val); // 2 1 ← insert order
  }

  for(const key in obj1) {
    console.log(key); // b a x ← from prototype
  }
  ```

Ex3. <span class="orange">Polyfill for `Object.hasOwn`</span>:

```javascript
if (!Object.hasOwn) {
  Object.hasOwn = function(obj, key) {
    return Object.prototype.hasOwnProperty.call(obj, key);
  };
}

/**
 * Ex3.1的写法是错的. 他miss了两种情况
 * 1. Object.hasOwn解决了hasOwnProperty被overwrite的情况: Ex3.1.1
 * 2. 对于nullable, Object.hasOwn 和 obj.hasOwnProperty都应该throw
 * Uncaught TypeError: Cannot convert undefined or null to object: Ex3.1.2
 * */
// Ex3.1
if (!Object.hasOwn) {
  Object.hasOwn = (obj, key) => {
    return obj.hasOwnProperty(key); // missing when it's nullable object
  }
}

// Ex3.1.1
const obj1 = {
  x: 1,
  hasOwnProperty() {
    return false;
  }
};
console.log(obj1.hasOwnProperty("x"));  // 永远都是false

// Ex3.1.2
const obj2 = null; // Object.create(null)也一样
console.log(obj2.hasOwnProperty("x")); // Uncaught TypeError: Cannot read properties of null (reading 'hasOwnProperty')
console.log(Object.hasOwn(obj2, "x")); // Uncaught TypeError: Cannot convert undefined or null to object
console.log(Object.prototype.hasOwnProperty.call(obj2, "x")); // Uncaught TypeError: Cannot convert undefined or null to object
```
- 注意polyfill的写法 `if (!Object.hasOwn) { Object.hasOwn = ... }`
- 如果用Ex3.1的写法
  - 对于3.1.1, hasOwnProperty被overwrite了, 永远返回false
  - 对于3.1.2, throw的是Uncaught TypeError: Cannot read properties of null (reading 'hasOwnProperty'). 但是Object.hasOwn要求的是throw Uncaught TypeError: Cannot convert undefined or null to object. 必须要用`Object.prototype.hasOwnProperty.call(null, "x")`才一样

### <a name="546-forof-vs-forin" id="546-forof-vs-forin">5.4.6 for...of vs for...in</a>

| Feature | `for...of` | `for...in` |
|---------|-----------|-----------|
| Iterates over | Values<br> `for(const val of arry)` | Keys (property names)<br> `for(const key in obj)`|
| Requires iterable | ✅ Yes<br> Array, String, Map, Set, etc | ❌ No<br> works with any object |
| Works with plain object (`{}`) | ❌ TypeError<br> `for...of`+`Object.keys()` | ✅ Yes |
| Includes inherited enumerable props | ❌ No | ✅ Yes<br> `for...in`+`Object.hasOwn(obj, "some key")` |
| Ordered Iteration | Integer-like keys ascending (array, string), then string keys in insertion order | Same as `for...of`, <u>then inherited enumerable props</u> |

Ex1. **Array**:

```javascript
const arry = [1, 2, 3];
for (const val of arry) {
    console.log(val); // 1  2  3  (values)
}
for (const index in arry) {
    console.log(index); // "0"  "1"  "2"  (index as strings)
}
```

Ex2. **String**:

```javascript
for (const char of "cat") {
    console.log(char); // "c"  "a"  "t"
}
for (const index in "cat") {
    console.log(index, "cat"[index]); // "0 c"  "1 a"  "2 t"  (index)
}
```
- 注意写法`"cat"[index]`: 双引号的cat, variable的index

Ex3. **Object**:

```javascript
const obj = { x: 1, y: 2 };

for (const key in obj) {
  console.log(key, obj[key]); // "x 1"  "y 2"
}

for (const entry of obj) { 
  // TypeError: obj is not iterable
}

// 注意是 for...of
for(const key of Object.keys(obj)) {
  console.log(`${key}: ${obj[key]}`); // x: 1 y: 2
}
```

#### <a name="69-object-methods" id="69-object-methods">6.9 Object Methods</a>

- Methods defined on **Object constructor**: 
  - **Static** - safer, cannot be override
  - eg: `Object.create()`, `Object.keys()`, `Object.hasOwn()` etc,

- Methods defined on **Object.prototype**
  - `Object.prototype.toString()`: will be invoked when `String(obj)`, 并且如果不override, output永远是"[object Object]"
  - `Object.prototype.toJSON()`: will be invoked when `JSON.stringify()` is called
    - `JSON.stringify(arry)`, works for array
    ```javascript
    const arry = [1,2,3];
    console.log(JSON.stringify(arry)); // '[1,2,3]'
    ```


```javascript
const point1 = { x: 3, y: 4 };
console.log(String(point1)); // [object Object]
console.log(JSON.stringify(point1)) // {"x":3,"y":4}

// override original Object.prototype.method
const point2 = {
  x: 3,
  y: 4,
  toString() {
    return `(${this.x}, ${this.y})`;
  },
  toJSON() {
    return this.toString(); // 勿忘return!! 否则log是undefined
  }
};
console.log(String(point2)); // (3, 4), toString is called
console.log(JSON.stringify(point2)); // "(3, 4)", toJSON is called
```

#### <a id="71-array-and-array-like"></a>7.1 Array and Array-Like

Ex1. `arry.length` 

```javascript
let arry = [];
arry[0] = "a";
arry[1] = "b";
console.log(arry.length); // 2

arry["favoriteFood"] = "pizza"; // not affecting arry.length, but setting a string parameter adds to the underlying object
console.log(arry.length); // 还是2, 不是3

arry[-1] = -1;
console.log(arry.length); // 还是2, negative也不会影响arry.length

console.log(JSON.stringify(arry)); // '["a","b"]', 只有non-negatvie integer加进去的两个
console.log(arry); // ["a", "b", favoriteFood: "pizza", -1: -1], 注意添加的最后两个
```
- 只有arry[key]的key是**non-negtive**且**integer**时才会改变`length`. 否则都是添加到object上了, 类似obj的key.
- `JSON.stringify(arry)`
  - 只return本身arry, eg: ["a", "b"]. 没有index/key.
  - key不是non-negtive integer的, 在`JSON.stingify`时不会show up
- `console.log(arry)`
  - 区别于JSON.stringify, log会看到所有的. 对于不是non-negative integer的index, 会log key: val. eg: <span class="orange">["a", "b", favoriteFood: "pizza", -1: -1]</span>

##### Ways to create Array

- Array literals `const arry = [1,2,3];`
- `...`spread operator on an **iterables**, <span class="orange">spread只能用在可以for index loop的object上!!</span>
  - String / Array-like **iterable** object / Set / Map to Array: `[..."abc"]`, `[...arguments]`, `[...set]`
  - spread的array-like只能是arguments, nodeList. <span class="orange">`{ length: 5 }`也是array-like, 但是不能iterable, 不能spread!</span>
- `Array.from(iterable/array-like, mapFn)`: `Array.from(arguments)`, `Array.from("ab")`, `Array.from({ length: 5 })` - 区别于spread
  - <span class="orange">Array.from(arguments, **(item, index)** => ...)</span> 
    - Array.from有自己的callback, 相较于Array.from().map更efficient, 只loop一次
    - mapFn(item, index): 先item后index

> **Array-like objects** are objects with a **length** property
> - `...`spread只能用于**iterable** array-like objects: arguments, nodeList(可以for index loop), { length: 5 }是不能用的
> - `Array.from`可以用于any array-like objects, `Array.from({ length: 5 })`

  Ex1.1 Array-like: arguments

  ```javascript
  function double() {
    return [...arguments].map(num => num*2);
  }
  console.log(double(2,1,5)); // [4, 2, 10]
  ```
  - 注意arguments的好处在于无所谓params有几个
  
  Ex1.2 Array-like: NodeList

  ```javascript
  const imgs = document.querySelectorAll("img"); // non-live NodeList
  // array才能用filter, 必须[...nodeList]
  const imgsWithUnsecuredUrs = [...imgs].filter(img => img.src.startsWith("http://"));
  const imgsWithLargeSize = [...imgs].filter(img => img.src.includes("s-l1600"));  
  ```
  - `document.querySelectorAll`返回的是nodeList: array-like objects, 不能直接用array的methods, 必须<span class="orange">[...document.querySelectorAll("img")]</span>
    - `document.querySelector`返回的是element object, 不能iterable, 既不能用spread, 也不能用Array.from
  - str.start<span class="orange">**s**</span>With
  - str.include<span class="orange">**s**</span>

  Ex1.3 Array-like: { length: 5 }

  ```javascript
  // Ex2
  const arry1 = Array.from({length: 5}, (elem, index) => elem = index);
  console.log(arry1); // [0, 1, 2, 3, 4]

  const arry2 = Array.from({ length: 5 }).map((num, index) => num = index);
  console.log(arry2); // [0, 1, 2, 3, 4]
  ```
  - `Array.from(items, mapFn)`, `mapFn(elem, index)`: 先elem后index
    - `arry.map((elem, index) => {...})`也是先elem后index
  - { length: 5 }满足了arry-like (有length prop). 
  - `Array.from({length: 5})`返回的是[undefined, undefined, undefined, undefined, undefined]. 
  - 相较于arry2, <u>arry1更efficient只loop了一次</u>: to perform the mapping while the array is being built than it is to build the array and then map it to another new array.
  - `[...{ length: 5 }]; // Uncaught TypeError: {(intermediate value)} is not iterable` - <span class="orange">spread只能用于iterable, plain object is NOT iterable</span>, 和`for...of`一样

  Ex2. Set

  ```javascript
  function removeDup(str) {
    if (!str) return "";
    const set = new Set([...str]); // 用array init set
    return [...set].join(""); // arry.join() default是comma, 这里要用""
  }
  console.log(removeDup("hello world")); // helo wrd
  ```
  - `["a", "b"].join(); // 'a,b'` - <span class="orange">arry.join() default是comma连接</span>
- Use Array constructor
  - `new Array(arrayLength)`

    ```javascript
    const arry = new Array(2);
    console.log(arry.length); // 2
    console.log(arry[0]); // undefined
    ```
  - `new Array(element0, element1, ..., elementN)` - (not common, error prone)

    ```javascript
    const arry1 = new Array("a", "b");

    const arry2 = new Array(2); // 按length处理
    console.log(arry2); // [undefined, undefined], arry.length=2

    const arry3 = new Array(-1); // Uncaught RangeError: Invalid array length
    ```
    - 注意如果pass进的是a **single** argument, 并且that argument is a **number**, 都按arryLength处理. 而且number要处于[0, 2^32-1], 否则会`RangeError`.

#### <a name="78-array-methods" id="78-array-methods">7.8 Array Methods</a>

`arry.forEach`, `for...of`, for...in (avoid, intended for obj)

Return a new array 
`arry.map`, 
`arry.filter` - **Callback returns truthy**:

**Callback returns truthy**:
`arry.find`, `arry.findIndex`, `arry.indexOf`, `arry.lastIndexof`, `arry.includes`: - Return once find
`arry.every`, `arry.some`,

`arry.reduce`, `arry.reduceRight`,

Return a new array
`arry.flat`, `arry.concat`, 

**In-Place**
`arry.push`, `arry.pop`, `arry.shift`, `arry.unshift`,

`arry.slice` - orignal arry remain the same

**In-Place**
`arry.splice`,
`arry.sort`, `arry.reverse`

Array -> String
`arry.join` (join是arry变str, default ',' connect),
`arry.toString` - 1,2,3
`JSON.stringify` - [1,2,3]

- `callbackFn(elem, index, arry )`, <u>先elem后index</u>
- Most of the methods above will **NOT modify the arry on which it is invoked. (<span class="orange">NOT in-place</span>). <b>`concat`, `flat`</b>都是non-inplace, original arry stays the same. <span class="orange">除了</span>以下这几个是<span class="orange">in-place</span>:
	- `push`, `pop`, `shift`, `unshift`
	- `splice`, `fill`, `copyWithin`
	- `sort`, `reverse`
- If the array is <span class="orange">sparse</span>, the function you pass is **not** invoked for nonexistent elements, but the returned array (if there is) will be <u>sparse in the same way</u> as the original array: it will have the same length and the same missing elements.
  - If the iteration method <span class="orange">takes a callback, except `find*`</span>, they generally **skip holes** (`forEach`, `map`, `filter`, `some`, `every`, `reduce`, etc)
  - If the iteration method <span class="orange">doesn't have callback</span> (`for...of`, `values`, `entries`, classic `for` loop), then it generally **visit holes** and treat them as undefined
  - Search methods <b>`find*` visit hole</b> as well

  ```javascript
  // when hole matters: looking for the first undefined
  const arry1 = [1,,3];
  arry1.forEach((num, index) => { // hole不会visit
    if (num === undefined) {
      console.log(`arry1[${index}] is undefined`);
    }
  });
  // no log

  arry1.find((num, index) => { // hole is visited
    if (num === undefined) {
      console.log(`arry1[${index}] is undefined`);
    }
  });
  // arry1[1] is undefined

  // hole VS undefined
  console.log(Object.keys(arry1)); // ['0', '2'], index没有1. 且key都是string不是integer
  const arry2 = [1, undefined, 3];
  console.log(Object.keys(arry2)); // ['0', '1', '2'], index有1
  ```
  - `arry.forEach` skip holes VS `arry.find` visit holes
  - 区别hole和undefined, <span class="orange">undefined不是hole</span>. <u>Arrays are just objects whose indexes are property names</u>.
  - `delete arry[index];`: <span class="orange">creates a hole</span>. 用`arry.splice(index, 1);`保持dense
  - `Object.keys()` 返回的arry的key是string不是integer

- `async/await`
  - If the iteration method <span class="orange">takes a callback</span>, they generally **not async-aware**. eg: `arry.map` doesn't await until promise resolves, but <span class="orange">**returns the promise immediately, skip the rest of lines in current iteration, then continues to the next iteration**</span>.
  - If the iteration method <span class="orange">doesn't have callback</span> (`for...of`, `values`, `entries`, classic `for` loop), `await` will **pause the loop UNTIL the promise resolves, then continue the rest of lines in current iteration, then move to the next loop**.

  Ex1. 
  ```javascript
  const arry = [1,2,3];
  // async写在function expression/declaration前
  const asyncSum = async (a , b) => a + b; // async的位置
  async function sumAsync(a, b) { return a + b; } // async的位置

  let sum = 0;
  arry.forEach(async elem => { // async的位置, 和上面const asyncSum = async (a, b) => ...一样
    sum = await sumAsync(sum, elem); // sumAsync triggered且立刻返回promise, pause跳出当前iteration, 进入下一个iteration
  });
  console.log(`arry.forEach, sum = ${sum}`); // 0, loop没有等await resolve, 直接return了promise
  // ...later, async work finishes


  // 注意IIFE的括号打在async前!!
  (async () => { // 勿忘async!! 这个async是和await Promise.all的await对应
    let sum = 0;
    const promises = arry.map(async (elem) => {
      sum = await sumAsync(sum, elem); // sumAsync triggered且立刻返回promis, pause跳出当前iteration, 进入下一个iteration
    });
    console.log(`arry.map, sum = ${sum}`); // 0
    console.log(promises); // [Promise, Promise, Promise], 没有等resolve
    
    await Promise.all(promises); // async从这里才开始!! 先执行block外的done再回来
    console.log(`arry.map, sum after settle = ${sum}`);
  })();

  console.log("done");

  (async () => { // 勿忘async!!
    await Promise.resolve(); // 跳出async block, 先C再回来
    console.log("B");
  })();
  console.log("C");

  (async () => { // 勿忘async!!
    let sum = 0;
    for (const elem of arry) {
      sum = await sumAsync(sum, elem); // sumAsync triggered, pause跳出async block, 先D再回来
    }
    console.log(`for...of, sum = ${sum}`);
  })();

  console.log("D");

  /** 
   * 注意log顺序!!
   *
   * arry.forEach, sum = 0
   * 
   * arry.map, sum = 0
   * [Promise, Promise, Promise]
   *
   * done
   * 
   * C
   *
   * D
   * 
   * B
   * 
   * arry.map, sum after settle = 3 <- 是3不是6!!
   * 
   * for...of, sum = 6 <- 区别于arry.map, 这才是对的sum=1+2+3
   * */
  ```
  - **async function**() {}, const sumA = **async ()**=> {}` - async都写在function定义前
  - **await所在的block开始必须有async** - 几个await就得有几个async
  - <span class="orange">**(**</span>async ()=>{...}<span class="orange">)()</span> - async的IIFE的括号要打在async之前!!
    - async的IIFE就是直接执行, 直到遇见await才跳出async block
  - <span class="orange">async不是整个block直接跳过</span>, 而是**先sync执行, 直到遇见await才pause跳出**，先执行async block之外的
    - arry.map里的async/await也一样, 虽然callback里的await没有await, 但是也是pause跳出当前async iteration, 进入下一个iteration
  - 注意log <span class="underline-orange">arry.map, sum after settle = 3 <- 不是6=1+2+3</span>! 因为arry.map的3个callbacks start before any of them finishes, and each one reads sum while it is still 0!! 
    - arry.map的3个callback虽然是sequentially triggered, 但是<u>没有await, they all start before any of them finishes</u>. 
    - 和for...of, sum = 6不一样, for...of的3个callback也是sequentially triggered, 但是<span class="underline-orange">每个都有await, the next iteration doesn't begin until the previous one has finished</span>
  - log的顺序!! 先callback log B, 再回到一开始的arry.map, 然后是最后的for...of
    - 理解queue: The **microtask queue** is not a queue of promises, it's a **queue of continuations** (<span class="orange">Queue happens after promise resolve</span> / The continuation is only queued after the awaited promise settles)
    - 这里arry.map的3个callback在当前iteration就立刻trigger了 -> map结束 -> pause在Promise.resolve()的async, 跳出 -> print C,D -> Promise.resolve() is already settled -> print B -> map的await Promise.all resolve

  Ex2. `await` callback in arry.map VS for...of

  ```javascript
  const arry = [1,2,3];
  arry.map(async (elem) => {
    console.log("start", elem);
    await delay(elem); // delay(elem) is triggered first, then pause
    console.log("end", elem);
  });
  ```
  Execution looks like this:

  ```
  start 1
  await ... await delay没有resolve, sync直接return promise
  // delay(1)先triggered
  // 然后pause跳出当前async iteration, 继续map

  start 2
  await ...
  // delay(2)先triggered
  // 然后pause跳出当前async iteration, 继续map

  start 3
  await ...
  // delay(3)先triggered
  // 然后pause跳出当前async iteration

  map returns

  Later:
  end x 的顺序取决于哪一个delay(elem)先执行完, each callback is independent.

  如果
  delay(1) -> resolves after 300 ms
  delay(2) -> resolves after 100 ms
  delay(3) -> resolves after 200 ms
  则output是
  end 2
  end 3
  end 1
  ```

  ```javascript
  (async () => {
    let sum = 0;
    for (const elem of arry) {
      console.log("start", elem);
      await delay(elem);
      console.log("end", elem);
    }
  })();
  console.log("done");
  ```
  Execution looks like this:

  ```
  start 1
  await ... delay(1)先triggered, 然后pause, 跳出整个async block, 

  done

  等delay(1) resolve之后
  end 1
  start 2
  
  await ... delay(2)先triggered, 然后pause, wait until delay(2) resolves
  end 2
  start 3

  await ... delay(3)先triggered, 然后pause, wait until delay(3) resolves
  end 3

  即使
  delay(1) -> resolves after 300 ms
  delay(2) -> resolves after 100 ms
  delay(3) -> resolves after 200 ms
  
  end x的order也不变 - 区别于map!!!
  ```
  - arry.map的await也是await, 虽然直接返回promise没有await resolve, 但是也会<span class="orange">skip following lines in current iteration, 直接进入下一个iteration</span>
  - 区别map和for...of的`await`: `await` pauses the async function it belongs to.
    - <span class="underline-orange">map的callback starts right away, each iteration is an async, waits independently, so completion order depends on which delay resolves first</span>.
    - <span class="underline-orange">for...of is inside one async, each `await` pauses the function and therefore pauses the loop.</span>.

  Ex3. scope
  ```javascript
  let sum = 0;
  (async () => {
    for(const elem of arry) {
      sum = await sumA(sum, elem);
    }
    console.log(`for..of, sum = ${sum}`)
  })();

  (async () => {
    // let sum = 0; // 没有这一行, 两个async share同一个sum. UNPREDICTABLE sum at the end
    const promises = arry.map(async elem => {
      console.log(`map.sum = ${sum}`);
      sum = await sumA(sum, elem);
    });
    await Promise.all(promises);
    console.log(`map, promise.all, sum = ${sum}`);
  })();

  // 3个map.sum = 0
  // for..of, sum = 6
  // map, promise.all, sum = 6!!!
  ```
  - 注意sum是shared, <span class="underline-orange">最后一个log的sum = 6是unpredictable的, 完全取决于上面async callback的sum继续到了哪里</span>
  - `let`是block scope, 但也满足lexical scope, <u>可以跳出当前function向上寻找, 只要在一个大的block里就可以</u>

##### <a name="781-array-iterator-methods" id="781-array-iterator-methods">7.8.1 Array Iterator Methods</a>

##### <span class="white-on-black">forEach(for...of)</span>

```javascript
// Arrow function
arry.forEach((element) => { ... } )
arry.forEach((element, index) => { ... } )
arry.forEach((element, index, array) => { ... } )
```

`forEach`<span class="orange">没有return</span>, 也不改变本身arry, 且<b>无法`break`</b>, 区别于普通for loop和`for...of`. 

<span class="orange">Not In-Place</span>.

适用于只对arry中的每个elem操作, <u>区别于`map`: `map`的意义在于returned arry</u>.

`arry.forEach`和`for...of`一样, 都是<span class="orange">sequential order</span>

Ex1. 区别Ex1.1和Ex1.2

```javascript
// Ex1.1
const arry = [1,2,3];
arry.forEach(num => {
  num = num*2; // num变了, 但不影响本身arry
  console.log(num); // 2, 4, 6
}); 
console.log(arry); // [1, 2, 3], 本身arry没有变

// Ex1.2
const arry = [1,2,3];
arry.forEach((num, index, arry) => {
  arry[index] = num * 2; // modifies array in place
  console.log(num); // 1, 2, 3. num是本身arry里的copy, 没有double
}); 
console.log(arry); // [2, 4, 6], 本身arry变了

// Ex1.3
const arry = [{ a: 1 }, { b: 2 }];
arry.forEach((obj) => {
  obj.c = 3;
});
console.log(arry); // [{ a: 1, c: 3 }, { b: 2, c: 3 }], 这里本身arry变了, 因为elem是object
```

`arry.forEach(elem)`的<span class="orange">elem是本身arry的copy, 对elem的操作不改变原arry</span>
- `forEach`是为了对每个elem操作, 本身arry不变, 不是为了得到一个新的array
- Ex1.1 虽然forEach里num double了, 但是本身arry不变 
- Ex1.2区别于1.1, <span class="orange">用arry[index]改变原arry</span>, num是本身arry的copy, 没有double
- Ex1.3区别于1.1, 本身arry变了, 因为这里的elem是object

Ex2. add/remove elems from array when arry.forEach

```javascript
// Ex2.1
const arry = [1, 2, 3];
arry.forEach(num => {
  console.log(num); // 1, 2, 3
  num = num * 2;
  arry.push(0);
});
console.log(arry); // [1, 2, 3, 0, 0, 0]

// Ex2.2
const arry = [1, 2, 3];
arry.forEach(num => {
  console.log(num); // 1 1 1, 不是1,2,3!!!
  num = num * 2;
  arry.unshift(0);
});
console.log(arry); // [0, 0, 0, 1, 2, 3]
```

- <u>The number of elements to visit is determined <span class="orange">**BEFORE**</span> the callback</u> (同`arry.filter`): 就是index [0~length-1]. 如果arry变了, visit的index是不变的, 只是变成<span class="orange">当前arry的index[0~length-1]</span>. ex1和ex2都只loop了本身arry.length=3次
  - 注意Ex2.1的push, 虽然arry有新的0加入, 但是loop只loop了当前arry的第0个到第length-1=2个: arry[0], arry[1], arry[2]
  - 区别Ex2.2的unshift, 在前面加了3个0, 虽然也只loop了3次, arry[0], arry[1], arry[2], 但是是每次新的arry的index 0,1,2: <u>[1,2,3]的index0</u> = 1 -> <u>[0,1,2,3]的index1</u> = 1 -> <u>[0,0,1,2,3]的index2</u> = 1, 总共3个1

Ex3. flatten arry (`arry.flat(depth)`)

```javascript
function flatten(arry) {
  const flattened = [];
  arry.forEach(elem => {
    if (Array.isArray(elem)) {
      flattened.push(...flatten(elem)); // 勿忘spread, push进的是单个elem, flatten() returned的是一个arry
    } else {
      flattened.push(elem);
    }
  });
  return flattened;
}
const nested = [1, 2, 3, [4, 5, [6, 7], 8, 9]];
flatten(nested); // [1, 2, 3, 4, 5, 6, 7, 8, 9]

nested.flat(Infinity); // [1, 2, 3, 4, 5, 6, 7, 8, 9]
```
- 注意arry.flat(<span class="orange">Infinity</span>)

##### <span class="white-on-black">for...of</span>

`for...of`支持break

```javascript
const arry = [1,,3];
for(const num of arry) {
  if (num === undefined) {
    break;
  }
  console.log(num);
}
// 1
```

##### <span class="white-on-black">map</span>

```javascript
// Arrow function
const newArry = arry.map((element) => { ... } )
newArry = arry.map((element, index) => { ... } )
newArry = arry.map((element, index, array) => { ... } )
```

**Return value**: A new array with each element being the result of the callback function.

<span class="orange">Not In-Place</span>. <u>Original arry stays the same.</u>

> Don't use `map` when you aren't using the returned array. 
> In that case, you should use `forEach` or `for...of`.

##### <span class="white-on-black">filter</span>

```javascript
let filtered = arry.filter((element) => { ...return true/false... } )
filtered = arry.filter((element, index) => { ... } )
filtered = arry.filter((element, index, array) => { ... } )

// Callback function
filtered = arry.filter(callbackFn)
filtered = arry.filter(callbackFn, thisArg)

callbackFn(elem, index, arry)
```

**Return value**: A new array with the elements that pass the test. If no elements pass the test, <u>an empty array will be returned</u>.

<span class="orange">Not In-Place</span>. <u>Original arry stays the same.</u>

`arry.filter`的callbackFn返回的是true/false.

Ex1. Sparse array

```javascript
// To close the gaps in a sparse array
let sparse = [1,,3,,5, undefined];
let dense = sparse.filter(() => true); // 注意callback直接返回true就行
console.log(dense); // [1, 3, 5, undefined], undefined还在

// To close gaps and remove undefined and null elements,
sparse = sparse.filter((elem) => elem !== undefined && elem !== null);
console.log(sparse); //  [1, 3, 5]
```
- `arry.filter` **skips** holes (**not undefined**) in sparse arrays and that its return value is always dense. 

Ex2. callbackFn(elem, index, arry)

```javascript
// Ex2.1
function isBigEnuf(elem) { // callback自动得到elem, index, arry
  return elem > 4;
}
console.log([1,5,7].filter(isBigEnuf)); // [5, 7]

// Ex2.2 additional param for callback
function isBigEnuf2(threshold) {
  // 这个return的function是真正的callback, 自动得到elem, index, arry
  return function(elem) { // 勿忘elem!!
    return elem >= threshold;
  };
}
console.log([1,8,4,3].filter(isBigEnuf2(4))); // [8, 4]
```
- 注意Ex2.2中how to <u>pass in additional params to callback</u>:
  - arry.filter(isBigEnuf2<span class="orange">(4)</span>): `isBigEnfu2(4)`是立即执行了, 返回的才是真的callback, which has access to (elem, index, arry)
  - 区别于Ex2.1的arry.filter(isBigEnuf), 没有括号执行, isBigEnuf就是callback

Ex3.1 Modify array while `filter`.

```javascript
// 本身length<6的是["spray", "limit", "elite"]
const words = ["spray", "limit", "elite", "exuberant", "destruction", "present"];

const modified = words.filter((word, index, arry) => {
    arry[index+1] += " extra";
    return word.length < 6; 
});
console.log(words); // ['spray', 'limit extra', 'elite extra', 'exuberant extra', 'destruction extra', 'present extra', 'undefined extra']
console.log(modified); // ['spray']
```
- 注意原始words多了一个"undefined extra"
- filter的<u>loop次数依然是原始words.length</u>, 虽然filter里的word已经是更新过的word了

Ex3.2 Appending new words while `arry.filter`.

```javascript
// Ex 3.2.1
let words = ["spray", "limit", "elite", "exuberant", "destruction", "present"];

const modified = words.filter((word, _, arry) => { // 注意skip index的写法
  arry.push("new");
  return word.length < 6;
});
console.log(words); // 多了6个new ['spray', 'limit', 'elite', 'exuberant', 'destruction', 'present', 'new', 'new', 'new', 'new', 'new', 'new']
console.log(modified); // ['spray', 'limit', 'elite']

// Ex 3.2.2
words = ["spray", "limit", "elite", "exuberant", "destruction", "present"]; // reset
const filtered = words.filter(word,  => {
  words.unshift("new"); 
  console.log(word); // 6个spray
  return word.length < 6;
});
console.log(words); // 前面多了6个new ['new', 'new', 'new', 'new', 'new', 'new', 'spray', 'limit', 'elite', 'exuberant', 'destruction', 'present']
console.log(filtered); // ['spray', 'spray', 'spray', 'spray', 'spray', 'spray']
```
- 和`arry.forEach`一样, <u>The number of elements to visit is determined <span class="orange">**BEFORE**</span> the callback</u>: 从index [0, length-1]
- Ex3.2.1中虽然push进了6个new, 但是loop只loop了本身words.length(6)次: arry[0 ~ length-1]
- Ex3.2.2是unshift, 区别于3.2.1的push, 依然是visit index[0 ~ length-1], 但是是6个spray
  - unshift("new")并不影响callback的word: arry.filter(word)的word是进入callback之前决定的

Ex3.3 Deleting words while `filter`.	
```javascript
const words = ["spray", "limit", "exuberant", "destruction", "elite", "present"];

const deleted = words.filter((word) => {
  words.pop(); // 也可以直接用words
  return word.length < 6;
});
console.log(words); // ['spray', 'limit', 'exuberant']
console.log(deleted); // ['spray', 'limit']
```
- 因为pop, <u>fitler只进行了三轮</u>, 因为后面三个被pop掉了, 区别于前面的modify和append
- 最终的words只剩3个word
- deleted中没有elite, 因为在第二轮的时候被pop了
    
##### <span class="white-on-black">find and findIndex</span>

```javascript
let foundElem = arry.find((element) => { ...return true/false... } )
foundElem = arry.find((element, index) => { ... } )
foundElem = arry.find((element, index, array) => { ... } )
```

**Return value**: The value of the **first element** in the array that satisfies the provided testing function. `undefined` if not found. <u>Return的不是arry</u>.

`arry.findIndex()` returns -1 if not found.

`find`和`findIndex`的callbackFn<span class="underline-orange">返回的是true/false</span>, 不是found elem!!!

```javascript
let arry = [1,2,3,4];
let found = arry.find(elem => elem%2 === 0);
console.log(found); // 2. 第一个满足条件的是2, iterate就结束了

let foundIndex = arry.findIndex(elem => elem === 2);
console.log(foundIndex); // 1. 第一次找到2是index=1的时候
```

> `arry.includes` | `arry.indexOf` | `arry.find` | `arry.some`
> - 如果只是看某个value是否exist - `arry.includes(val)`
> - 如果要找这个value所在的index - `arry.indexOf(val)`
> - 如果需要find if an element satisfies the provided testing function -  `arry.some()`.
> - 只有在不是单纯的value check, 需要一个testing function的时候, 才用`arry.find`/ `arry.findIndex`


##### <span class="white-on-black">indexOf, lastIndexOf</span>

```javascript
const foundIndex = arry.indexOf(searchElement);
indexOf(searchElement, fromIndex);

const foundIndexFromEnd = arry.lastIndexOf(searchElement)
arry.lastIndexOf(searchElement, fromIndex)
```

**Return value**: The first index of the element in the array, returns -1 if not found.

`indexOf()` compares searchElement to elements of the Array using <b>strict equality `===`</b>.
- <u>indexOf cannot find object</u>: ({ a: 1} !== { a: 1}, unless ref same)
- <u>indexOf cannot find NaN</u>: NaN !== NaN.

```javascript
let arry = [2, 9, 9];
arry.indexOf(9);     // 1
arry.indexOf(7);     // -1

arry.lastIndexOf(9); // 2, 从后面开始找
arry.indexOf(9, 2);  // 2, 从index=2开始找9
```

```javascript
String.prototype.startsWith = String.prototype.startsWith || function(str) {
    return this.indexOf(str) === 0; // this是下面的abc
};
console.log("abc".startsWith("ab")); // true
```

##### <span class="white-on-black">includes</span>

```javascript
arry.includes(searchElement)
arry.includes(searchElement, fromIndex)
```

**Return value**: true/false.

`includes` checks if any <b>element `===` searchElement</b>, except <u>it consider `NaN` to be equal to itself</u>. 

Ex1.

```javascript
const arry = [1, true, 3, NaN];
console.log(arry.includes(true));
console.log(arry.includes(NaN)); // true
console.log(arry.indexOf(NaN)); // -1, 注意和includes的区别
```

Ex2.

```javascript
const obj1 = { a: 1 }, obj2 = { a: 2 };
const arry = [obj1, obj2];

console.log(arry.includes(obj1)); // true
console.log(arry.includes({ a: 1 })); // false, obj不存在===, 除非是同一个
```

##### <span class="white-on-black">every and some</span>

```javascript
// Arrow function
let testResult = arry.every((element) => { ...return true/false... } )
testResult = arry.every((element, index) => { ... } )
testResult = arry.every((element, index, array) => { ... } )

testResult = arry.some((element) => { ... } )
testResult = arry.some((element, index) => { ... } )
testResult = arry.some((element, index, array) => { ... } )
```

**Return value**: Boolean true/false.

The `every()` method tests whether <b>all</b> elements in the array pass the predicates. The `some()` method tests whether <b>at least one</b> element in the array passes the predicates.

Note that both `every()` and `some()` stop iterating array elements as soon as they know what value to return. 

Ex1.

```javascript
const arry = [1, 30, 39, 29, 10, 13];
function isBigEnuf(elem) { return elem > 10; }
console.log(arry.some(isBigEnuf)); // true
console.log(arry.every(isBigEnuf)); // false
```

Ex2. Check if arry2 is a subset of arry1

```javascript
// Ex2.1 ERROR
const isSubset = (arry1, arry2) => {
	return arry2.every(elem => arry1.includes(elem)); // 勿忘return every的结果
};
console.log(`isSubset = ${isSubset([1, 2, 3, 4, 5, 6, 7], [5, 7, 6])}`); // true
console.log(`isSubset = ${isSubset([1, 2, 3, 4, 5, 6, 7], [5, 8, 7])}`); // false
console.log(isSubset([1,2,3], [1,1])); // true -- ERROR

// Ex2.2
function isSubset(arry1, arry2) {
  const map = {};
  arry1.forEach(elem => {
    if (map[elem] === undefined) map[elem] = 0;
    map[elem]++;
  });

  return arry2.every(elem => { // 勿忘return!!
    if (!map[elem]) return false; // map[elem]是undefined或者0, 都是false
    map[elem]--;
    return true; // 勿忘return true!!!
  });
}
console.log(isSubset([1, 2, 3, 4, 5, 6, 7], [5, 7, 6])); // true
console.log(isSubset([1, 2, 3, 4, 5, 6, 7], [5, 8, 7])); // false
console.log(isSubset([1,2,3], [1,1])); // false
```
- 注意Ex2.2中, testing function永远要有return. 
  - return true并不代表every就直接return true了, 只是当前iteration return true, loop continues
  - return false, every就直接结束了

##### <span class="white-on-black">reduce and reduceRight</span>

```javascript
// Arrow function
const sum = arry.reduce((acc, cur) => { ...must return some value... }, initialVal )
arry.reduce((acc, cur, index) => { ... }, initialValue)
arry.reduce((accumulator, currentValue, index, array) => { ... }, initialValue )

// Callback function
arry.reduce(callbackFn)
arry.reduce(callbackFn, initialValue)
```

**Return value**: The single value that results from the reduction, which is the `accumulator`.

`arry.reduce()` can be used anytime when trying to <span class="underline-orange">combine all the elements in an array into a single output value</span> by a reducer function.

- callbackFn / reducerFn <b>MUST</b>  <span class="orange">return some value</span> as the value for `accumulator` in the next round, otherwise, `acc` / final result of `reduce()` will be `undefined`.

- `initialValue`
  - If `initialValue` is provided, then `accumulator` will be equal to `initialValue`, and `currentValue` will be `arry[0]`, `curIndex` will be 0. 
  - If no `initialValue` is provided, then `accumulator` will be `arry[0]`, and `currentValue` will be `arry[1]`, `curIndex` will be 1.	
  - If <u>array is empty</u> and <u>no `initialValue` is provided</u>, <span class="orange">`TypeError` will be thrown</span>.
- If `reduce` is called with only one value, the solo value will be returned <u>without calling callbackFn</u>.
  - Either arry has only one element (regardless of position) but no `initialValue` is provided, 
  - Or if `initialValue` is provided but arry is empty.
	
```javascript
const getMax = (a, b) => Math.max(a, b);

// callbackFn is not invoked
[50].reduce(getMax); // 50
[].reduce(getMax, 50); // 50
try {
  [].reduce(getMax); // TypeError
} catch(err) {
    console.log(err);
}
```

Ex1. Sum / Multiply

```javascript
const arry = [1,2,3,4];
const sum = arry.reduce((acc, cur) => acc+cur);
console.log(sum); // 10

function product(acc, cur) { // callbackFn(acc, cur, index, arry)
  return acc * cur;
}
console.log(arry.reduce(product)); // 24
```
	
Ex2. Sum of values in an object array. 

```javascript
const arry = [{x: 1}, {x: 2}, {x: 3}]
const sum = arry.reduce((acc, cur) => {
  return acc + cur.x; // acc是integer, cur是object
}, 0); // 需要initVal
console.log(sum); // 6
```
- 区别于Ex1, 此时的reducer需要initVal, 否则initialVal=arry[0]是个obj, 没办法加减

Ex3. Counting number of times a string appears in an array 

```javascript
const names = ["Alice", "Bob", "Tiff", "Bruce", "Alice"];
const map = names.reduce((acc, cur) => {
  if (acc[cur] === undefined) acc[cur] = 0;
  acc[cur]++;

  return acc; // 勿忘return!!
}, {});

console.log(map); // {Alice: 2, Bob: 1, Tiff: 1, Bruce: 1}
```
- <span class="orange">勿忘reducer最后要返回acc</span>!!! 否则下次的acc是undefined!!

Ex4. fitler out positive nums and multiply them by 2 Replace 

```javascript
const nums = [-5, 6, 2, 0,];

// Ex4.1
const result1 = nums.filter((elem) => elem > 0).map(elem => elem*2);
console.log(result1); // [12, 4]

// Ex4.2
const result2 = nums.reduce((acc, cur) => {
  if (cur > 0) {
    acc.push(cur*2);
  }
  return acc; // return acc得写在if外!! 即使cur<=0, 也得return acc!!
}, []);
console.log(result2); // [12, 4]
```
- Instead of `arry.filter().map()` - 2 pass, use `reduce` by just one pass
- Ex4.2, 勿忘无论cur是不是positive都要return acc!!

##### <a name="782-flattening-arrays-with-flat" id="782-flattening-arrays-with-flat">7.8.2 Flattening arrays with `flat()`</a>

```javascript
const flattenedArry = arry.flat(); // default depth = 1;
flattened = arry.flat(depth);
flattend = arry.flat(Infinity); // flat所有内部arry
```

**Return value**: A new array with the sub-array elements concatenated into it.

<span class="orange">Not In-Place</span>. <u>Original arry stays the same.</u>
 
- 如果arry里没有nested arry, arry.flat()返回的是本身的arry.
- 如果<u>arry中有empty slot (hole/[])</u>, arry.flat会去掉empty slot.

`depth`: Defaults=1. 表示打开内部depth层[]. `Infinity`表示完全展开.

Ex1.

```javascript
const arry = [1, [2, [3, [4]]]];
console.log(arry.flat()); // [1,2,[3,[4]]]
console.log(arry.flat(1)); // [1,2,[3,[4]]], default就是1

console.log(arry.flat(2)); // [1,2,3,[4]]
console.log(arry.flat(10)); // [1, 2, 3, 4]. 即使depth多了也无所谓
console.log(arry.flat(Infinity)); // [1,2,3,4]
```

`arry.flat` will remove empty slots in arrays, 无论是<u>hole</u>还是<u>empty arry</u>:

Ex2.

```javascript
// remove hole
console.log([1, 2, , 4, 5].flat()); // [1, 2, 4, 5]
// 等同于
[1, 2, , 4, 5].filter(() => true);

// empty arry: 这种情况无法用filter实现
console.log([[], [], 1, 2].flat()); // [1, 2]
// filter无法去掉empty[], 只能去掉hole
console.log([1, 2, , 4, [], 6].filter(() => true)); // [1, 2, 4, [], 6]

// 但是flat只能去掉一层empty arry
console.log([1, 2, , 4, [[]], 6].flat()); // [1, 2, 4, [], 6]
```

Ex3.1 用`reduce` / `concat`做flat(1)

```javascript
const arry = [1, [2, [3, [4]]]];

const flat = arry.reduce((acc, cur) => {
  if (Array.isArray(cur)) {
    acc.push(...cur);
  } else {
    acc.push(cur);
  }
  return acc;
}, []);
console.log(flat); // [1,2,[3,[4]]]

console.log([].concat(...arry)); // // [1,2,[3,[4]]], 和flat一样
/** 
 * a = [1, [2, [3, [4]]]], 思考[].concat(...a)
 * ...a是 1, [2, [3, [4]]] 
 * [].concat(1) = [1]
 * [1].concat([2, [3, [4]]]) = [1, 2, [3, [4]]]
 */
```
- 注意concat的用法!!

Ex3.2 用`reduce`做`flat(depth)`

```javascript
const arry = [1, [2, [3, [4]]]];

function flat(arry, depth = 1) { // 注意default val的写法
  if (depth === 0) return arry; // stop condition

  const flatten = arry.reduce((acc, cur) => {
    if (Array.isArray(cur)) {
      acc.push(...flat(cur, depth - 1));
    } else {
      acc.push(cur);
    }
    return acc;
  }, [])

  return flatten; // 勿忘return!! 大部分的recursive都要return something
}
console.log(flat(arry, 1)); // [1,2,[3,[4]]]
console.log(flat(arry, 2)); // [1,2,3,[4]]
```
		
##### <a name="783-adding-arrays-with-concat" id="783-adding-arrays-with-concat">7.8.3 Adding arrays with `concat()`</a>

```javascript
const newArry = arry.concat(value0, value1, ... , valueN);
```

**Return value**: a new array.

<span class="orange">Not In-Place</span>. <u>Original arry stays the same.</u>

`valueN`: can be values or array.
- If `valueN` is an array, it will be **flatten by one level** then added each to the arry
- If `valueN` is an element, it will be added directly to the arry.

Ex1.

```javascript
console.log([1, 2].concat({ a: 1 }, "hello", [3,4])); // [1,2,{a:1}, "hello", 3, 4], [3,4]先unpack再push

console.log([1].concat([2, 3])); // [1, 2, 3], [2,3]先unpack再push in
console.log([1].concat([[2, 3]])); // [1, [2, 3]] - [[2, 3]] is flattened only one level
```

Ex2.

```javascript
const arry1 = [[1]], arry2 = [2, [3]];
const newArry = arry1.concat(arry2);
console.log(newArry); // [[1], 2, [3]]

arry1.push(4);
console.log(newArry); // [[1], 2, [3]], 此时concat不变

arry1[0].push(5);
console.log(newArry); // [[1, 5], 2, [3]], 注意concat变了 [1,5]
```
- <span class="orange">`arry.concat`是**shallow copy**</span>. [ref to arry1[0], 2, ref to arry2[1]], 所以arry1[0].push(5)改变了newArry

##### <a name="784-stacks-and-queues-with-push-pop-shift-and-unshift" id="784-stacks-and-queues-with-push-pop-shift-and-unshift">7.8.4 Stacks and Queues with `push()`, `pop()`, `shift()`, and `unshift()`</a>

`push`, `pop`, `shift`, `unshift` are all <span class="orange">in-place</span> methods. 并且他们的returned都不是本身的arry, 要么是新的length, 要么是removed element.

- `push()`

	```javascript
	const newLength = arry.push(element0, element1, ... , elementN)

  arry.push(...anotherArry)
	```
	**Return value**: the new length of arry.
	
	```javascript
	const stack = [];
  console.log(stack.push(1,2)); // 2, 返回的是new length
  console.log(stack); // [1,2]
	```

- `pop()`
	
	```javascript
	const popedElem = arry.pop(); 
	```
	**Return value**: The removed element from end of array; `undefined` if arry is empty.
	
- `shift()`
	
	```javascript
	const firstElem = arry.shift();
	```
	**Return value**: The removed element from arry (first element); `undefined` if arry is empty.

- `unshift()`
	
	```javascript	
	const newLength = arry.unshift(element0, element1, ... , elementN);
	```
	**Return value**: The new length of the arry.
	
	Ex.

	```javascript
  let arry = [1, 2, 3];
  arry.unshift(4,5);
  console.log(arry); // [4,5, 1,2,3], (4,5)是被一起加入

  // 区别于
  arry = [1, 2, 3];
  arry.unshift(4);
  arry.unshift(5);
  console.log(arry) // [5,4, 1,2,3], 5在4之前
	```
  - `arry.unshift(elem0, elem1)`, elem0和elem1是<u>一次性一起加入, in the exact same order</u>. 区别于一次一次unshift.
	
##### <a name="785-subarrays-with-slice-splice" id="785-subarrays-with-slice-splice">7.8.5 Subarrays with `slice()`, `splice()`</a>

##### <span class="white-on-black">slice</span>

```javascript
const sliced = arry.slice(start);
arry.slice(start, end); // slice [start, end), end is not included
```

****Return value**: A <b>shallow</b> copy of sliced elements from the original array.

<span class="orange">Not In-Place</span>. <u>Original arry stays the same.</u>

Ex1.

```javascript
const arry = ["a", { b: 1 }, "c", "d", "e"];
console.log(arry.slice()); // shallow copy of arry: ["a", { b: 1 }, "c", "d", "e"]

const sliced = arry.slice(1, 3);
console.log(sliced); // [{b:1}, "c"]
arry[1].b = 2;
console.log(sliced); // [{b:2}, "c"], 注意slice变了, shallow copy
```
- `arry.slice(start, end)`, end是不包括的
- `arry.slice`是shallow copy, sliced中b的value变了, 和concat一样
	
##### <span class="white-on-black">splice</span>

```javascript
arry.splice(); // no-op, delete 0 item, arry不变

/**
 * start is provide, but deleteCount is omitted
 * delete从start到length-1
 * deletedArry类似arry.slice(start), 但是本身arry只剩[0,start)
 * */
const deletedArry = arry.splice(start); 

arry.splice(start, deleteCount, item1, item2, itemN); 
```

**Return value**: An array of deleted elements. If no elements are removed, an empty array is returned.

<span class="orange">In-Place</span>. <u>Original arry will be changed.</u>

Ex1.

```javascript
// Ex1.1
const arry = [1,2,3];
console.log(arry.splice()); // []
console.log(arry); // [1,2,3], 原arry不变

// Ex1.2 start is provided - 区别于1.1
console.log(arry.splice(0)); // [1,2,3], 整个arry从0到end都被delete了
console.log(arry); // [], arry被delete完了

// Ex1.3
const arry = [1,2,3];
console.log(arry.splice(1, undefined)); // [], undefined coerced to 0: delete 0 elem
console.log(arry); // [1,2,3]
```
- 区别1.1和1.2, 如果`<span class="underline-orange">start` is provided but `deleteCount` is omitted, `splice()` will delete everything [start, length-1]</span>
- 区别1.2和1.3, 如果`deleteCount`是undefined不是omit, undefined被coerce as 0 - delete 0 item
- `arry.slice(1)` VS `arry.splice(1)`
  - `arry.slice(1)`得到新arry[2,3], 原arry不变
  - `arry.splice(1)`remove everything after index1, 原arry只剩[1]

Ex2.

```javascript
let arry = [1,2,3,4,5];
const deleted = arry.splice(2);
console.log(deleted); // [3,4,5], 从index2到end都被delete了
console.log(arry); // [1,2]

arry = [1,2,3,4,5];
console.log(arry.splice(2,0,"a","b")); // [], nothing deleted
console.log(arry); // [1,2, "a","b", 3,4,5]

arry = [1,2,3,4,5];
console.log(arry.splice(2,2,["a","b"],"c")); // [3,4]
console.log(arry); // [1,2, ["a","b"],"c", 5]
```

##### <a name="786-array-sorting-methods-sort-reverse" id="786-array-sorting-methods-sort-reverse">7.8.6 Array Sorting Methods (`sort`, `reverse`)</a>

##### <span class="white-on-black">sort</span>

```javascript
arry.sort(); // returns sorted arry, in-place
arry.sort((firstEl, secondEl) => { ... compareFn... } )
arry.sort(compareFn)
```
**Return value**: The orginal array, but sorted.

<span class="orange">In-Place</span>. <u>Original arry will be changed.</u>

If `compareFn` is not supplied, all `non-undefined` array elements are sorted in <u>alphabetical</u>, <u>case-sensitive</u>, <u>ascending</u> order</u>, by <u>converting them to strings</u> and comparing strings in UTF-16 code units order. All `undefined` elements are sorted to the end of the array.

`compareFn` returns a **number**
- number > 0, order will be "b, a".
- number < 0, order will be "a, b".
- number = 0, a and b are considered equal.

Ex1.

```javascript
let arry = [1, 30, 4, 21, 100];
console.log(arry.sort()); // [1,100,21,30,4], string compare
console.log(arry); // [1,100,21,30,4], arry.sort返回的就是本身的arry

arry = [1,30,4,21,100];
console.log(arry.sort((a, b) => a - b)); // [1, 4, 21, 30, 100]
```

Ex2. 

```javascript
let arry = ["ant", "Bug", "cat", "Dog", "Cat"];
console.log(arry.sort()); // ['Bug', 'Cat', 'Dog', 'ant', 'cat']

/** 
 * 不能用return e1<e2;
 * 1. false是0, 不是-1!!!
 * 2. return e1 < e2返回的是true/false: 
 * a<b -> return true -> true=1>0 -> order be ("b","a")
*/
arry = ["ant", "Bug", "cat", "Dog", "Cat"];
console.log(arry.sort((a, b) => {
  // return word1.toLowerCase() - word2.toLowerCase(); // Error, "a"-"b" = NaN
  // 但是string可以比较>,<,=
  const aL = a.toLowerCase(),
  bL = b.toLowerCase();
  if (aL > bL) return 1;
  if (aL < bL) return -1;
  return 0;
})); // ['ant', 'Bug', 'cat', 'Cat', 'Dog']
```
- `str.toLowerCase()`不是in-place, str不变
- <span class="underline-orange">str不能+-*/, 结果都是`NaN`</span>
- 不能`return e1<e2`:
	- <span class="underline-orange">`compareFn`expect的是returned value和0的关系.</span>
	- `false`是0, 不是-1!!!
	- `return e1 < e2`返回的是true/false, 然后再和0比较. true==1, false==0

##### <span class="white-on-black">reverse</span>

```javascript
arry.reverse(); // returns reversed arry, in-place
```

**Return value**: The reversed array.

<span class="orange">In-Place</span>. <u>Original arry will be changed.</u>

##### <a name="787-array-to-string-conversions-jsonstringify-join-tostring" id="787-array-to-string-conversions-jsonstringify-join-tostring">7.8.7 Array to String Conversions (`JSON.stringify`, `join`, `toString`)</a>
##### <span class="white-on-black">JSON.stringify</span>

Object(Array) 都可以用`JSON.stringify(obj/arry)`

```javascript
const arry = ["a", "b", "c"];
console.log(JSON.stringify(arry)); // string ["a","b","c"]
console.log(JSON.parse(JSON.stringify(arry))); // array ['a', 'b', 'c']
```

##### <span class="white-on-black">join</span>

```javascript
const str = arry.join(separator); // default is comma
```

**Return value**: A string with all elements joined by separator. 

<span class="orange">Not In-Place</span>. <u>Original arry stays the same.</u>

- `undefined`, `null` in array will be treated as an empty string when join
- empty array [] will be converted to an <u>empty string</u>.

Ex1. 

```javascript
console.log([].join()); // "", empty string
console.log([null].join()); // "", empty string
console.log(["a",undefined,"c"].join()); // a,,c - undefined is an empty string
console.log(["a",undefined,"c"].join("")); // ac
```

Ex2.

```javascript
const arry = ["a", "b", "c"];
console.log(arry.join()); // a,b,c default是comma
console.log(arry.join("")); // abc
```

Ex3.

```javascript
const arry = new Array(5);
console.log(arry.join("-")); // ----, 4个hyphen
// 5个undefined -> 5个empty string用-连接: 4个hyphen
```
- 是4个hyphen不是5个

##### <span class="white-on-black">toString</span>

Ex1.

```javascript
const arry = [1,2,3];
console.log(JSON.stringify(arry)); // string [1,2,3]
console.log(arry.toString()); // 1,2,3, 有comma没有bracket!!
console.log(arry.join()); // 1,2,3 有comma
```
- `toString`没有bracket, 但是有comma
- 区别于<u>JSON.stringify(arry), 就是array样子的string</u>

Ex2.

```javascript
console.log(["a", "b", "c"].toString()); // "a,b,c"
console.log([1, [2,"c"]].toString()); // 1,2,c, 全部unpack了
```

> - **`Set`** 和 **`Map`** 都是 **iterable objects**
>   - 都可以用`[...]`或`Array.from()`转成array
>   - 都可以用`for...of`/ `forEach`遍历
>     - `for(const elem of set)` | `set.forEach(elem => {...})`
>     - `for (const [key, value] of map)` | `[...map].forEach(([key,val] => {...}))` arry-先key后val, `map.forEach((val, key, map) => {...})` 先val后key
>
>
> |       | Set       | Map       |
> |-------|-----------|-----------|
> | props |`set.size`       |`map.size`         |
> | add   |`set.add(val)`   |`map.set(key, val)`|
> | delete|`set.delete(val)`|`map.delete(key)`  |
> | has   |`set.has(val)`   |`map.has(key)`<br>`map.get(key)`|
> | clear |`set.clear()`    |`map.clear()`      |
> |        |`set.isSubsetOf(superset)`<br> `set.union(otherSet)`<br> `set.intersection(otherSet)`<br>`set.difference(otherSet)`|`[...map.keys()]`<br>`[...map.values()]`<br>`[...map.entries()] = [...map]`   |
>
> - **Set** VS **Array**: 查找
>   - `set.has(value)` O(1)
>   - `arry.includes(value)` O(n)
> - **Map** VS **Object**:
>   - 在用key的频繁查找(`map.has(key)`, `map.get(key)`)以及用key的插入/删除(`map.set(key,val)`, `map.delete(key)`)时, 相较于Obejct虽然都是O(1), 但是<u>map is optimized for dynamic key-val storage</u>

#### <a name="1111-the-set-class" id="1111-the-set-class">11.1.1 The Set Class</a>

**Set** is a collection of **unique** values. Set is implemented as a <u>hash table</u> (or similar hash-based structure).

**Set** VS **Array**
- `Set` is similar to `Array`, but set is NOT ordered or indexed, you <u>CANNOT</u> visit a set like an array does `arry[1]`. 
- However, <u>set can be iterated in insertion order</u>.
- `set.has(val)`: O(1) **faster** than `arry.includes(val)`: O(n)

##### <u>Constructor</u>

```javascript
new Set(); // empty set
new Set(iterable);
```
- **Iterable**就是可以for loop的, 包括**array**, **string**, **set**, **map**, etc

Ex1. Constructor

```javascript
const set1 = new Set([..."aba"]); // 用arry new
console.log(set1); // Set(2) {'a', 'b'}

const set2 = new Set(["a", "b", "a"]); // 用arry new
console.log(set2); // Set(2) {'a', 'b'}

console.log(typeof set1); // object, 不是set!!
console.log(set1 instanceof Set); // true
console.log(set1 instanceof Object); // true

const set3 = new Set("aba"); // 用string new
console.log(set3); // Set(2) {'a', 'b'}

const set4 = new Set(set1); // 用set new
console.log(set4); // Set(2) {'a', 'b'}, 把set1拆开一一加入set4

const set5 = new Set([1, set1]);
console.log(set5); // Set(2) {1, Set(2) {'a', 'b'}}. 区别于set4, [1,set1]已经是iterable了, 只会unpack一层, 不会继续拆set1了, set1以一个整体加入set5

const set6 = new Set([1, 2]);
console.log(set6); // Set(2) {1, 2}
// 区别于new Set([1,2]): [1,2]是拆开一一加入, 
// 这里set.add([1,2]): [1,2]是以整体一个加入
set6.add([1,2]);
console.log(set6); // Set(3) {1,2, [1,2]}
```
- <b>`typeof`</b> returns <span class="underline-orange">primitive value types (`undefined`, `number`, `string`, `boolean`, `symbol`, etc) and `object`, `function`</span> 
  - `typeof null` is `object`
- `instanceof` 用于**non-primitive values**, checks whether an object <u>inherits from a constructor's prototype chain</u>.
  - 所以set既是instanceof Set 也是instanceof Object
- 注意`new Set(set1)`是把set1拆开一一加入: If an iterable is passed in, all of its elements will be **unpacked by one level** and added to the new Set <u>one by one</u>, not as a whole.
  - `new Set([1,2])`: 是[1,2]拆开一一加入
  - 区别于`new Set([1, [1,2]])`: 只拆一层, [1,2]是以整体加入
  - 区别于`set.add([1,2])`: [1,2]是以一个整体加入

Ex2. Remove dup using `set`

```javascript
/// remove dup from arry
const arry = ["a", "b", "a"];
const unique = [...new Set(arry)];
console.log(unique); // ['a', 'b']

// remove dup from string
const str = "aba";
const unqiueStr = [...new Set(str)].join("");
console.log(unqiueStr); // ab
```
	
##### Instance Properties
`Set.prototype.size`

##### Instance Methods
- `Set.prototype.add(value)`: <u>returns the `Set` object</u> with added value, 所以**可以chain**.
- `Set.prototype.has(value)`: returns `true/false`
	- `set.has(val)` O(1) is musch faster than `arry.includes(val)` O(n), when they have the same length/size.
- `Set.prototype.delete(value)`: returns `true` if `value` was already in `Set`, otherwise `false`
- `Set.prototype.clear()`: no return
- `Set.prototype.isSubsetOf(superset)`
- `Set.prototype.union(otherSet)`: returns a new set
- `Set.prototype.intersection(otherSet)`: 交集
- `Set.prototype.difference(otherSet)`: s1 - s2


###### <u>Value Equality in Set</u>
Set用类似于<b>`===`</b>判断是否unique

Ex1.

```javascript
const set = new Set();
set.add([1]).add([1]); // chain add
console.log(set); // Set(2) {[1], [1]}, 两个[1]都加进去了
console.log(set.has([1])); // false
console.log(set.delete([1])); // false

const arry = [1];
set.add(arry).add(arry);
console.log(set); // Set(3) {[1], [1], [1]}, 只加进了一个[1]
console.log(set.has(arry)); // true, ref compare
console.log(set.delete(arry)); // true
console.log(set); // Set(2) {[1], [1]}
```
- 对于reference values (array, object, functions), 永远不相等, 只能用地址比较
- `undefined`和`null`都可以加入Set. <u>`NaN`是个特例,</u> 虽然`NaN !== NaN`, 但是Set里可以只被加入一次

Ex2.

```javascript
const set = new Set();
set.add(document.body);
console.log(set.has(document.querySelector("body"))); // true
``` 
- `document.body`和`document.querySelector("body")`是一样的

Ex3.

```javascript
3 === 3.0; // true!!

undefined === undefined; // true
null === null; // true, 区别于object永远不等

undefined === null; // false
undefined == null; // true

NaN === NaN; // false, 两个NaN永远不相等
[1] === [1]; // false

const x = [ 1, 2, 3 ];
const y = x;

x === y; // true
x === [ 1, 2, 3 ]; // false
y === [ 1, 2, 3 ]; // false

const a = "10";
const b = "9";
a < b; // true!! string compare, no number coerce
```

Ex4. 

```javascript
const set = new Set();
console.log(set.size); // 0

set.add(1).add(1).add(true); // add chaining
console.log(set); // Set(2) {1, true}
console.log(set.size); // 2

console.log(set.has("1")); // false, ===equal
console.log(set.has(true)); // true

set.add([1,2]);
console.log(set.size); // 3, [1,2]是以一个整体加入
console.log(set.delete([1,2])); // false, ref val永远不等
console.log(set.delete(1)); // true
set.clear();
console.log(set.size); // 0
```
- `set.add(val)` returns the set, can chain `set.add(val).add(val)`
- `set.clear()` has no return

##### Iteration Methods
- `for(const val of set)`
- `Set.prototype.forEach()`
	
	```javascript
	set.forEach((elem) => { ... });
	set.forEach(callbackFn)
	```
	- 区别于<b>`arry.forEach((elem, index) => { ... })`</b>, Set doesn’t have index.
	- 和`arry.forEach()`一样, 都没有return, 都不改变当前arry, 等同于for loop.
	- 和`arry.forEach()`一样, 都<u>无法跳出循环. 区别于for loop</u>.
	- Iterated **in the order of insertion order**

Ex1.

```javascript
// sum
const set = new Set([1,4,2]);
set.add(5);
let sum = 0;
// 1,4,2, 5 in insertion order
for(const val of set) {
    sum += val;
}
console.log(sum); // 12

// product
let product = 1;
set.forEach(val => {
    product = product * val;
  // return product;  // 不用return!!
});
console.log(product); // 40
```
- arrow func不用return!! `set.forEach(val => product*=val)`. 但得`product=product*val`, 不能 val=>product*val, product没复新值
	
	
Ex2. delete obj from set

```javascript
const set = new Set();
set.add({ x: 1, y: 2 }).add({ x: 10, y: 4 });
set.forEach(elem => {
  if (elem.x > 5) {
    set.delete(elem); // 可以delete, 因为指向同一个地址
  }
});
console.log(set); // Set(1) {{ x: 1, y: 2 }}
```
- 注意这里可以delete的原因是elem指向同一个地址
	
```javascript
set.isSubsetOf(superset) 
```
**Returns** `true`/`false`

```javascript
if (!Set.prototype.isSubsetOf) {
  Set.prototype.isSubsetOf = function(superset) {
    if (this.size > superset.size) return false;

    for(const val of this) { // for...of可以跳出循环
      if (!superset.has(val)) return false;
    }
    return true;
  }
}
const s1 = new Set([1,2,3]);
const s2 = new Set([5,1,6,2,3]);
const s3 = new Set([1,3,5]);
console.log(s1.isSubsetOf(s2)) // true
console.log(s1.isSubsetOf(s3)); // false
console.log(s2.isSubsetOf(s3)); // false
```
- 注意如果要用s1.isSubsetOf(s2), 就得写成`Set.prototype.isSubsetOf`
- 必须用`for...of`, 可以随时跳出循环
  - 区别于`forEach`无法跳出, 不会因为return false就跳出, 会一直走到最后return true
  ```javascript
  // ERROR 
  this.forEach((elem) => {
      if(!superset.has(elem)) {
          return false; // return false并不会跳出循环, 只会继续
      }
  });
  return true; // 最终都是return true, 勿论是否循环里有return false
  ```

```javascript
set.union(otherSet)
```

**Returns** a **new** Set object containing elements from both sets.
Original set remain the same.

```javascript
// 3.2.1
Set.prototype.union = Set.prototype.union || function(otherSet) {
  const _union = new Set(this);
  otherSet.forEach(elem => _union.add(elem)); // 不用check if(_union.has(elem)), add直接保证unique才能加进去
  return _union;
}
const s1 = new Set([1,2,3]), s2 = new Set([1,3,5]);
console.log(s1.union(s2)); // Set(4) {1, 2, 3, 5}

// 3.2.2
if (!Set.prototype.union) {
  Set.prototype.union = function(otherSet) {
    // return new Set(this, otherSet); // ERROR!!
    // new Set([this, otherSet])也不对, set变成两个elems, no flatten
    return new Set([...this, ...otherSet]);
  };
}
console.log(s1.union(s2)); // Set(4) {1, 2, 3, 5}
```
- 注意3.2.1不用check _union是否has新的elem, <u>应该直接add(elem), Set本身会保证unique</u>, 和set.delete(elem)类似
- 3.2.2中, 区别于`new Array(elem0, elem1, ..., elemN)`, set只能`new Set(iterable)`
  - <b>`[...set]`</b>spread可以用于set!! 

```javascript
set.intersection(otherSet)
```
**Returns** a **new** Set containing elements in both this set and the other set.

```javascript
Set.prototype.intersection = Set.prototype.intersection || function(otherSet) {
  const [smaller, larger] = this.size <= otherSet.size ? [this, otherSet] : [otherSet, this];  
  
  const _intersect = new Set();
  smaller.forEach(elem => {
    if(larger.has(elem)) { // 不是otherSet, 得是之前得到的larger
      _intersect.add(elem);
    }
  });
  return _intersect;
}
const odds = new Set([1, 3, 5, 7, 9]);
const squares = new Set([1, 4, 9]);
console.log(odds.intersection(squares)); // Set(2) {1, 9}
```

```javascript
set.difference(otherSet)
```
**Returns** a **new** Set of s1有但是s2没有的 (set-otherSet)

```javascript
if (!Set.prototype.difference) {
  Set.prototype.difference = function(otherSet) {
    const diff = new Set(this);
    otherSet.forEach(elem => { // otherSet.forEach比diff.forEach更快, 因为只care delete otherSet的elem
      // if (otherSet.has(elem)) { // no check needed
      diff.delete(elem);
      // }
    });
    return diff;
  }
}
const odds = new Set([1, 3, 5, 7, 9]);
const squares = new Set([1, 4, 9]);
console.log(odds.difference(squares)); // Set(3) {3, 5, 7}
```
- otherSet.forEach更高效, 因为只需尝试删除otherSet的elem
- diff.delete不用check if(otherSet.has), delete包括这一步, 和set.add(elem)类似

#### <a name="1112-the-map-class" id="1112-the-map-class">11.1.2 The Map Class</a>

**Map** is a collection of `[key, value]` pairs, where <u>`key` is unique</u>. **Map** can be <u>iterated in insertion order</u> (后来的update不会改变loop的顺序, 永远根据的是初始insert的顺序)

##### <u>Constructor</u>

```javascript
new Map(); // empty map
new Map(iterable object);
```
区别于`Set`, which can be init with any iterable. `Map` can be init with **iterable object** only (no string). Eg: 
- `[[key1, val1], [key2, val2], ...]`
- `Object.entries(obj)`
- map

Ex1.

```javascript
// arry of [key, val]
const map = new Map([["x", 1], ["y", 2]]);
console.log(map); // Map(2) {'x' => 1, 'y' => 2}

// Object.entries(obj)
const obj = { x: 1, y: 2 };
const map = new Map(Object.entries(obj)); // 等同于new Map([["x", 1], ["y", 2]])
console.log(map.get("x")); // 1, 勿忘key双引号

// map
const copy = new Map(map);
console.log(copy); // Map(2) {'x' => 1, 'y' => 2}

console.log(copy === map); // false, copy并不等于原始的map
```

Ex2.

```javascript
const arry1 = [[1, "a"], [2, "b"]];
const arry2 = [[1, "aa"]];

const map = new Map([...arry1, ...arry2]);
console.log(map.get(1)); // aa
console.log(map.get("1")); // undefined, strictly equal===
```
- `[...arry1, ...arry2]`: [1,"a"]和[1,"aa"]都在, Map后才merge
- 对于相同的key, val取最后一个

##### Instance Properties

```javascript
Map.prototype.size
```

##### Instance Methods

- `Map.prototype.set(key, val)`: <u>returns new Map</u>, <b>可以chain</b>. 和set.add()一样.
- `Map.prototype.get(key)`: return `undefined` if not found.

- `Map.prototype.has(key)`: return `true/false`
	- map.has()很快, though not as fast as indexing an array, no matter how large the map is
	- Map could be represented internally as a <span class="underline-orange">hash table (with O(1) lookup)</span>, a <span class="underline-orange">search tree (with O(log(N)) lookup)</span>, or any other data structure, as long as the complexity is <b>better than O(N), linear</b>, like <u>array.includes() is O(N)</u>.
- `Map.prototype.delete(key)`: returns `true` if key was already in Map, otherwise `false`
- `Map.prototype.clear()`: returns `undefined`

##### <u>Value Equality in Map</u>

Map用类似<b>`===`</b>判断key是否一样, 和Set一样. 
- Any Javascript value can be used as a `key` or a `value` in a Map.
- `undefined`, `null`, `NaN`都可以用作key, 虽然`NaN !== NaN`.
- Reference value (objects, arrays, functions)也可以做key, 但是永远不相等, 只能用地址比较

Ex1.

```javascript
const map = new Map([[undefined, 1], [null, 2], [NaN, 3]]);
console.log(map.get(undefined)); // 1, undefined===undefined
console.log(map.get(null)); // 2, null===null
console.log(map.get(NaN)); // 3, 虽然 NaN !== NaN
console.log(map.get(Number("abc"))); // 3, 和直接map.get(NaN)一样
```
- `undefined === undefined`, `null === null`, 和object不一样
- `NaN`可以做key, 虽然`NaN !== NaN`
- 注意`Number("foo")`返回的是`NaN`, <span class="underline-orange">`m.get(Number("foo"))`和`m.get(NaN)`完全一样</span>

Ex2.

```javascript
// The following way of setting a property does not interact with the Map data structure. 
// It uses the feature of the generic object.
const wrongMap = new Map();
console.log(wrongMap instanceof Map); // true
console.log(wrongMap instanceof Object); // true

wrongMap["a"] = 1;
wrongMap["b"] = 2;
console.log(wrongMap); // Map {a: 1, b: 2, size: 0}

console.log(wrongMap.size); // 0
console.log(wrongMap.has("a")); // false
console.log(wrongMap.delete("a")); // false
```
- 注意上面用`wrongMap[key]=val`的方式set Map的方法并<u>没有interact with the Map data structure, still uses the feature of the generic object</u>: size, has(), delete()都不work
- Map要用`map.set(key, val)` set key/val

Ex3.

```javascript
const map = new Map();
map.set("1", 1).set(1, 2).set(true, 3); // 可以chain
console.log(map); // Map(3) {'1' => 1, 1 => 2, true => 3}
console.log(map.get("1")); // 1

map.set(1, 11);
console.log(map.get(1)); // 11, updated val

for(const [key, val] of map) {
  console.log(key, val);
}
// "1" 1
// 1 11 <- iterate是根据insertion order, 后来update并不会改变顺序
// true 3

console.log(map.delete("one")); // false
console.log(map.delete(1)); // true
console.log(map); // Map(2) {'1' => 1, true => 3}
```
- 注意iteration的顺序, 和后来的update无关. 如果delete后又加回来, 加回来的elem按新elem处理, loop时在最后

Ex4.

```javascript
const arry = [];
const map = new Map();
map.set("ref", arry);

arry.push("a");
console.log(map); // Map(1) {'ref' => ["a"]}, 注意map里的arry的val也变了

map.get("ref").push("b");
console.log(arry); // ['a', 'b'], 注意本身arry的val变了
console.log(map); // Map(1) {'ref' => ["a", "b"]}
```
- 注意map中的arry是ref

##### Iteration Methods

- `for(const [key, val] of map)`
- `map.forEach((value, key, map) => {...})` - 先val后key. 类似arry.forEach((elem, index, arry)), 先val后index

Ex1.

```javascript
const map = new Map([[1, "a"], [2, {}], [3, undefined]]);
map.forEach((val, key) => { // 先val后key!!
  console.log(key, val); // 1 "a", 2 {}, 3 undefined
});

map.forEach(logMapElem);
function logMapElem(val, key, map) { // 先val后key,
  console.log(`map.get(${key}) = ${val}`)
}
// map.get(1) = a
// map.get(2) = [object Object]
// map.get(3) = undefined
```
>- 以下三个返回的都**不是array**, 得用<b>`[...map.keys()]`</b> or <b>`Array.from(map.keys())`</b	>变成array. 
>- 以下三个**都可以用for...of循环**
>- 区别于`Object.keys()`, `Object.values()`, `Object.entries()`返回的都是array
- `Map.prototype.keys()`: returns <u>an iterable object</u> that contains the keys for each element in this map in insertion order.
- `Map.prototype.values()`: returns <u>an iterable object</u> that contains the values for each element in this map in insertion order.
- `Map.prototype.entries()`: returns <u>an iterable objects</u> that contains the `[key, value]` pairs for each element in this map in insertion order.
		
Ex2.

```javascript
const map = new Map();
map.set("0", "foo").set(1, "bar").set({}, "baz");
console.log([...map.keys()]); // ['0', 1, {}]. 注意本身m.keys()不是返回array, 要用[...]变成array
console.log(Array.from(map.values())); // ['foo', 'bar', 'baz']

// [...map]等同于[...map.entries()]
console.log([...map]); // [["0", "foo"], [1, "bar"], [{}, "baz"]]
console.log([...map.entries()]); // [["0", "foo"], [1, "bar"], [{}, "baz"]]

// for [key, val] of map/map.entries()完全一样
for(const [key, val] of map) {
  console.log(key, val); // "0" "foo", 1 "bar", {} "baz"
}
for(const [key, val] of map.entries()) {
  console.log(key, val); // // 和for...of map完全一样
}
/// 注意虽然map.entries()不是array, 但是entry本身是arry
for(const entry of map.entries()) {
  console.log(entry); // ['0', 'foo'], [1, 'bar'], [{}, 'baz']
}
```

- `map.keys()`, `map,values()`, `map.entries()`返回的都**不是array*, 要用<b>`[...iterable]`</b>或者<b>`Array.from(iterable)`</b>变成array
- 注意`[...map]`等同于`[...map.entries()]`
- `for(const [key, val] of map)`和`for(cosnt [key, val] of m.entries())`完全一样
- `for(const entry of m.entries())`, 虽然<u>map.entries()不是array, 但是entry本身是array</u>

Ex3.

```javascript
const map = new Map([["a", 1], ["b", 2]]);

// 用arry.forEach要先把map变成arry
[...map].forEach(([key, val]) => {
  console.log(key, val);
});

// 用arry.forEach要先把map.entries()变成arry
[...map.entries()].forEach(entry => {
  console.log(entry); // ["a", 1], ["b", 2] - entry是array, 先key后val
});

[...map.entries()].forEach(([key, val]) => {
  console.log(key, val); // "a" 1, "b" 2
});

map.forEach((val, key) => { // 区别于上面, 先val后key
  console.log(key, val); // "a" 1, "b" 2
});
```
- 区别于map.forEach是先val后key, [...map]和[...map.entries()]的forEach返回的是[key, val]不是val/key

#### <a name="92-classes-and-constructors" id="92-classes-and-constructors">9.2 Classes and Constructors</a>

##### <u>Constructor-Less Class</u> - Singleton or Factory Function
	
Ex1. range() as a factory function
  
```javascript
function range(from, to) { // range小写, 不用大写
  console.log(this); // Window. 区别于Constructor里的this是constructor本身, eg: Range {}
  // 必须有这句!! 否则range1.includes() is not a function
  const r = Object.create(range.methods); // 所有range的objects都会inherit range.methods里的properties
  r.from = from;
  r.to = to;
  return r;  // 勿忘return
}
range.methods = { 
  includes(x) {
      return x >= this.from && x <= this.to; // this指向range自己, 所以有this.from/to
  },  // comma separate
  toString() {
      return `[${this.from}, ${this.to}]`;
  }
};
const range1 = range(1, 3), range2 = range(6, 10); // range1和range2互不干扰
console.log(range1.toString()); // [1, 3]
console.log(range1.includes(2)); // true
console.log(range2.toString()); // [6, 10]
console.log(range2.includes(5)); // false

console.log(range1 instanceof range); // false, range没有constructor
console.log(range.methods.isPrototypeOf(range1)); // true
```
- `obj.toString()`返回'[object Object]'
  - `function a() {}; a.toString();`返回'function a() {}'
- Singleton和Factory Function都需要export/return, 区别于Constructor/Class用this, 不需要return.
  - Singleton
    ```javascript
    // logger.js - Singleton
    class Logger {
      log(msg) { // 没有return
        console.log(msg)
      }
    }
    // Every component gets the same logger object.
    const logger = new Logger(); // class用new
    // export default logger; // 两种写法
    export { logger };

    // component1.js
    import { logger } from "./logger";
    logger.log("hello");
    // component2.js
    import { logger } from "./logger";
    logger.log("hello");
    ```
    - component1 and component2 share the same logger
  - Factory Function
    ```javascript
    // createLogger.js
    function createLogger(name) {
      return {
        name,
        log(msg) {
          console.log(`${name}, ${msg}`);
        }
      };
    }

    // component1.js
    const logger1 = createLogger("logger1"); 
    logger1.log("hello"); // logger1, hello
    // component2.js
    const logger2 = createLogger("logger2");
    logger2.log("world"); // logger2, world
    ```
    - logger1 and logger2 are independent, having its own name and log(msg).
- range()是一个普通function, 所有<u>function里的this都是window</u>. 区别于Constructor/Class里的this是Range {}.
- <span class="underline-orange">必须有`const r = Object.create(range.methods)`!!</span> 否则无法用r1.includes()/toString()
  - range.methods: 首先range是一个function, 所以是一个object. methods是range的一个property, 所以可以access this.from/to
  - <span class="underline-orange">range.methods里的function的`this`是object本身</span>, 和class类似, 区别于本身function range(){}里的`this`是window
- 注意range1和range2的from/to互不干扰, range()里定义的props都是unshared, 和constructor一样. 只有range.methods里的东西才share, 类似prototype.
- 注意<u>用factory function init的object `instanceof`返回false. 这种constructor-less的要用`isPrototypeOf`</u>

##### <u>Constructor / Class</u> with `new` to invoke

Ex2. Range as Class

```javascript
class Range { // Range后没有(), 直接{}, params从constructor传进去
  constructor(from, to) {
    this.from = from;
    this.to = to;
  } // method之间不用comma断开
  includes(val) {
    return val >= this.from && val <= this.to;
  }
  toString() {
    return `[${this.from}, ${this.to}]`;
  }
}

// Constructor用new invoke, 区别于factory/普通function
const range = new Range(1, 3);
console.log(range.toString()); // [1, 3]
console.log(range); // true

// 以下两种是equivalent的
console.log(range instanceof Range); // true. 区别于上面的factory function
console.log(Range.prototype.isPrototypeOf(range)); // true

console.log(typeof range); // object!! 区别于Range/class {}
console.log(typeof Range); // function
console.log(typeof class {}); // function

console.log(Range instanceof Object); // true, 判断Range是否inherit from Object.prototype
console.log(Range instanceof Function); // true
```
- class A {}, A后没有()
- <u>class的method没有comma, 区别于object</u>
- class A {}的最后也不用comma
- `class` is a special function (`typeof`)
- Range constructor里, no need to create/return object, <u>it just uses `this`</u>.
- Constructor用new invoke, 区别于singleton / factory function

#### <a name="93-classes-with-the-class-keyword" id="93-classes-with-the-class-keyword">9.3 Classes with the class Keyword</a>

区别于function declaration, classes <u>MUST be defined before</u> they can be constructed. Following will throw `ReferenceError`
```javascript
const range = new Range(); // ReferenceError
class Range {}
```

<span class="white-on-black">Constructor</span>

A constructor can use `super` keyword to call the constructor of the super class.
	
Ex1.
	
```javascript
class Rect {
  constructor(width, height) {
    this.width = width;
    this.height = height;
  }
  toString() {
    return `[${this.width}, ${this.height}]`;
  }
}
class FilledRect extends Rect {
  constructor(width, height, color) {
    super(width, height); // 不用return super()
    this.color = color;
  }
  // 如果没有这个override, filled call的就是Rect.toString
  toString() {
    return `${super.toString()} ${this.color}`; // 用super call Rect.toString()
  }
}
const rect = new Rect(3, 4);
console.log(rect.toString()); // [3, 4]

const filled = new FilledRect(10, 2, "red");
console.log(filled.toString()); // [10, 2] red
```
- 在FilledRect里用Rect的methods: `super`
  - `super`写在constructor里: `super(w, h)` 且没有return
    - `super()` MUST be called first, before you can use `this`.
  - `super`call Rect的methods: `super.toString()`
- 如果FilledRect没有toString, filled.toString call的就是Rect.toString
	
Ex2.
	
```javascript
class Range {
  constructor(from, to) {
    this.from = from;
    this.to = to;
  }
  toString() {
    return `[${this.from}, ${this.to}]`;
  }
}
class Span extends Range {
  constructor(start, length) {
    if (length >= 0) {
      super(start, start+length); // 没有return
    } else {
      super(start+length, start);
    }
  }
}
const span1 = new Span(3, 4);
console.log(span1.toString()); // [3, 7], 用的Range.toString, 没有override
const span2 = new Span(10, -2);
console.log(span2.toString()); // [8, 10]
```
- 区别于Range需要的是(from, to), Span pass的是(start, length). 通过`super`把(start, length)变回Range需要的(from, to)

#### <a name="94-class-lifecycle" id="94-class-lifecycle">9.4 Class Lifecycle</a>

Class lifecycle includes **class evaluation**, **instance construction**, and **method invocation**;

Ex. 注意log顺序

```javascript
class MyClass {
  static f1 = console.log(`static f1 called`);
  static {
    console.log(this); // class MyClass
    console.log(`static block #1 called`);
  }
  static f2 = console.log(`static f2 called`);
  static {
    console.log(`static block #2 called`);
  }
  static f() {
    console.log(`static method f called`)
  }
  constructor() {
    console.log(this); // MyClass instance under construction
    console.log(`constructor called`);
  }
  instanceProp1 = console.log(`instanceProp1 called`);
  instanceProp2 = "instance prop 2";
}
/**
 * 在不new MyClass()的情况下, 会有如下log in order
  * static f1 called - print immediately during evaluation
  * class MyClass {...}
  * static block #1 called
  * static f2 called
  * static block #2 called
  * 
  * static f()没有进 - 区别于f1/f2, which is a value, executed during evaluation
  */
		
const myClass = new MyClass();
/**
 * new MyClass()之后会有如下log in order
 * instanceProp1 called - 和f1/f2一样, print when evaluate
 * 
 * instanceProp2只是init了, 没有log
 * 
 * MyClass instance
 * constructor called
 */
console.log(myClass.instanceProp2); // instance prop 2
console.log(MyClass.f2); // undefined, 因为static f2没有return
MyClass.f(); // static method f called. 区别于f2是var, 没有log
```
- `static f()`: 除非直接call MyClass.f(), 否则不会执行. 
  - 区别于`static f1`, `static f2`都是var, executed during evaluation
  - 以及`static {}`也是直接执行
- 注意static的`this`是class MyClass, 是class本身. 区别于constructor/instance method的`this`是MyClass的instance under construction.
<br>

- **Class evaluation** 
  - Happens at JavaScript <u>runtime</u>.
  - Triggered when execution reaches the `class` declaration.
  - **Run once**, regardless of how many instances are created.

  ```javascript
  class Rect { // evaluated here
  }
  ```

  ##### <u>Created during class evaluation</u>

  | Category | Member | Per Instance? | Lives on / Behavior |
  |----------|--------|:-------:|---------------------|
  | **Static** | `static field`<br>`static method()` | ❌<br> One per Class| Class constructor (`Rect`) |
  | | static private:<br> `static #field`<br>`static #method()` | ❌ | Class constructor (`Rect`) |
  | | `static { ... }` | N/A | Executes immediately during class evaluation |
  | **Instance Method** | `method()` | ❌<br> shared across instances | `Rect.prototype` |
  | | `#method()` | ❌<br> shared across instances | but only accessible inside the class |

- **Instance construction** (every `new`)
  - <u>Instance fields</u> are initialized **before** the constructor body.
  - Every `new` creates <u>a fresh copy of instance fields</u>.
  ```javascript
  const rect = new Rect(); // triggered by new
  ```

  ##### <u>Construction order</u>
  - Create a new object.
  - link new object to Rect.prototype.
  - <u>Initialize instance fields</u>.
  - <u>Run the constructor body</u>.
  - Return the instance.

  ##### <u>Created during construction</u>

  | Member | Example | Per instance? |
  |--------|---------|:-------------:|
  | Instance fields | **Public:** `width`, `name = "Rect"`<br>**Private:** `#width`, `#name = "Rect"` | ✅ |
  | **Arrow function field** | `handleClick = () => {}`<br><br>**Note:** An arrow function is **NOT** an instance method. It's an <u>instance field whose value is a function</u>, so a **new function per instance**. | ✅ |

  <u>**Subclass construction**</u>
  For subclass, construction starts from **parent** class then to **subclass**.

  ```javascript
  class Rect {
    static count = 0;
    width = 0; height = 0;

    constructor(width, height) {
      this.width = width; this.height = height;
      Rect.count++;
    }
  }
  class FilledRect extends Rect {
    static defaultColor = "red"; 
    name = "Filled";

    constructor(width, height, color) {
      super(width, height); // 没有return
      this.color = color;
    }
  }
  const filledRect = new FilledRect(3, 4, "green");
  ```
  `const filledRect = new FilledRect(...)`顺序是
  - Run FilledRect constructor, <u>**NOT** FilledRect instance fields</u>
    - `super()`
      - Rect instance fields
      - Rect constructor 
  - Back to FilledRect
    - **FilledRect instance fields** (name="Filled")
      - FilledRect instance fields are created **after** Rect super() done.
    - Rest of FilledRect constructor (this.color=color)
  <br>
  
  Ex1. `evt.target` VS `this`
  ```html
  <button>
    <span>Click me</span>
  </button>
  ```

  ```javascript
  class Rect {
    mount() {
      document.querySelector("button")
        .addEventListener("click", this.handleClick); // 勿忘this.handleClick的this
    }
    handleClick(evt) {
      console.log(this); // button
      console.log(evt.target); // <span>Click me</span>, the element that actually triggered the event
      console.log(evt.target.value); // undefined
      console.log(evt.target.textContent); // Click me
    }
  }
  ```
  - <span class="underline-orange">**`this`** is the element the listener is attached to</span> (button)
  - `evt.target` is <span class="underline-orange">the element actually triggered the event</span>
    - <span class="yellowBG">`evt.target.value` VS `evt.target.textContent`</span>

    | Property      | Used for  | Common elements       |
    | ------------- | ------ | ------------------------ |
    | `value`       | Current user input or control value | `<input id="name" name="name" type="text" value="Alice" />`<br> `<textarea id="msg" name="msg" placeholder="type some...">Hello</textarea>`<br> `<select id="color"><option value="red">Red</option><option value="green" selected>Green</option></select>` |
    | `textContent` | The text inside an element. | `<div>`, `<span>`, `<p>`, `<button>`, etc.            |


  Ex2. arrow function `this` 

  ```javascript
  // Ex2.1
  class Rect {
    width = 0;
    height;

    constructor(width, height) {
        this.width = width;
        this.height = height;
    }

    mount() {
        document.querySelector("button")
          .addEventListener("click",
            () => this.handleClick()
          );
        // OR
        document.querySelector("button")
          .addEventListener("click",
            this.handleClick.bind(this)
          );
    }

    handleClick() {
        console.log(this.width); // rect.width
    }
  }
  const rect = new Rect(100, 50);
  rect.mount();
  ```
  - these two are the same

    ```javascript
    // lexical this
    () => this.handleClick()

    // explicitly bound this
    this.handleClick.bind(this)
    ```
  - 对于`() => this.handleClick()`
    - `rect.mount()` -> inside mount, `this === caller rect`
    - `() => this.handleClick()` -> arrow function `this` is determined by surrounding lexcial scope, here `this === rect`, 所以handleClick的this.width = rect.width
  - 但他们有共同的问题: <u>Every call to `bind()` creates a new function, same as arrow function</u>, **listener can NOT be removed**

    ```javascript
    mount() {
      button.addEventListener(
        "click",
        this.handleClick.bind(this)
      );
    }

    unmount() {
      button.removeEventListener(
        "click",
        this.handleClick.bind(this) // DIFFERENT function!
      );
    }
    ```

  ```javascript
  // Ex2.2
  class Rect {
    width = 0;
    height;
    // Arrow function, instance field, instance construction time
    handleClick = () => console.log(this.width); // rect.width

    constructor(width, height) {
      this.width = width;
      this.height = height;
    }

    mount() {
      document.querySelector("button")
        .addEventListener("click", this.handleClick);
    }

    unmount() {
      document.querySelector("button")
        .removeEventListener("click", this.handleClick);
    }
  }
  ```

  This avoids writing:

  ```javascript
  class Rect {
    constructor(width, height) {
      this.width = width; this.height = height;

      // Bind once during construction
      this.handleClick = this.handleClick.bind(this);
    }

    mount() {
      document.querySelector("button")
        .addEventListener("click", this.handleClick);
    }

    unmount() {
      document.querySelector("button")
        .removeEventListener("click", this.handleClick);
    }

    // instance method
    handleClick() { console.log(this.width); } //如果没有前面的bind, 这里的this是button
  }
  ```
  - mount() and unmount() both use the exact same reference: `this.handleClick`, 所以listner can be successfully removed.
  - arrow function的`this`是where it's defined - during instance construction time - rect
  - 如果用handleClick没有constructor里的`bind`, `this`是button, 不是rect
  - <span class="underline-orange">this.handleClick.bind是在constructor里, 不是mount!</span>

- **Method invocation (`this`)**

  ```javascript
  rect.toString();
  Rect.create();
  ```

  ##### <u>`this` behavior</u>

  | Member | `this` |
  |--------|--------|
  | **Regular method** <br> (object / class) | Determined by the caller <br> (Regular method does **NOT** have `this`) |
  | **Static method** (class) | Refers to the class (`Rect`) |
  | **Arrow function** | Defined by surrounding lexical scope when the arrow is created
  | | └─ Inside a regular method → `this` is the method's `this`, determined by **caller**. |
  | | └─ Class instance field → `this` is class instance - captures `this` during instance construction |

  Ex1.1 Normal instance method ❌

  ```javascript
  class Rect {
    constructor(width) {
      this.width = width;
    }
    getWidth() {
      return this.width;
    }
  }

  const rect = new Rect(2);
  const fn = rect.getWidth; // not Rect.getWidth!!
  fn(); // TypeError: Cannot read properties of undefined (reading 'width') 
  // crash the whole app
  ```
  - fn = **rect**.getWidth, 不是<u>Rect</u>.getWidth, getWidth是instance method
  - `getWidth()` is a regular function, which does **not** have `this`
    - `rect.getWidth()` will set `this` to rect in `getWidth`
    - after `fn` points to rect.getWidth, the <u>caller rect is lost when invoke</u>, so `this` is undefined.
      - it <u>crashes the whole app (TypeError)</u>
  
  <br>

  Ex1.2 Arrow function field ✅

  ```javascript
  class Rect {
    width = 10;
    handleClick = () => console.log(this.width);

    constructor(width, height) {
      this.width = width;
      this.height = height;
    }

    mount() {
      document.querySelector("button")
        .addEventListener("click", this.handleClick); // 勿忘this.handleClick的this
    }
  }

  const rect = new Rect(2, 3);
  const arrow = rect.handleClick;
  arrow(); // 2
  ```
  - Arrow function `this` is determined by surroundinng lexical scope when it's created. 
    - `handleClick` is an instance field, created during instance construction - `this` is Rect instance - rect.
  - Each instance gets its own `handleClick` function.

  <br>

  Ex1.3 Normal instance method + .bind(this) ✅
  ```javascript
  class Rect {
    width = 10;

    constructor(width, height) {
      this.width = width;
      this.height = height;
      // 没有这句的话, this.handleClick是shared across instances
      // 但有了这句, this.handleClick就是每个instance有自己的copy
      this.handleClick = this.handleClick.bind(this);
    }

    mount() {
      document.querySelector("button")
        .addEventListener("click", this.handleClick);
    }

    handleClick() {
      console.log(this.width);
    }

    unmount() {
      document.querySelector("button")
        .removeEventListener("click", this.handleClick);
    }

  }

  const rect = new Rect(2, 3);
  const bindClick = rect.handleClick;
  bindClick(); // 2
  ```
  - `bind()` returns a **new function** with `this` permanently bound.
  - The original prototype method handleClick is still shared.
  - The bound function becomes an own property of each instance, similar to an arrow function field.

**<u>`Function.prototype.bind()`</u>**

```javascript
func.bind(thisArg, arg1, arg2, ..., argN)
```

Ex2.1 Bind `this`

```javascript
const module = {
  x: 81,
  init(x) {
    this.x = x;
  },
  getX() {
    return this.x;
  },
};

console.log(module.getX()); // 81

const getXCopy = module.getX;
console.log(getXCopy()); // TypeError: Cannot read properties of undefined (reading 'x') 
// crash app, or window.x in non-strict mode

const boundGetX = module.getX.bind(module);
console.log(boundGetX()); // 81, bind需要extra ()

console.log(getXCopy.call(module)); // 81, call不需要extra ()

const initCopy = module.init;
initCopy.bind(module)(3); 
// or
initCopy.call(module, 3);

console.log(module.x); // 3
```
- same as Ex1.1中的getWidth, getX is a <u>regular function WO `this`</u>, `this` is determined by caller
  - `module.getX()`的getX的`this`是caller 'module'
  - after `getXCopy` points to module.getX, the <u>caller 'module' is lost when invoke</u>, so `this` is undefined.
    - TypeError and <u>crash the app</u>
  - bind creates a new function with `this`=module
- same as `module.init`, initCopy lost module as the caller
  - initCopy.**bind**(module)**(3)** // extra () for bind to execute
  - initCopy.**call(module, 3)**; // no extra ()

  ```javacript
  fun.call(thisArg, arg1, ..., argN) // 直接执行, no extra ()
  ```

Ex2.2 Partial application

```javascript
function sum(x, y) {
  return x + y;
}
const sumOne = sum.bind(null, 1); // thisArg=null, x=1
console.log(sumOne(2)); // 3 = 1+2
```
- sum/sumOne doesn't need `this`, so `thisArg` is `null`.

**<u>`setTimeout`</u>**

```javascript
setTimeout(callback, delay)
```

Ex2.3 

```javascript
const person = {
  fName: "alice",
  getFName() {
    console.log(this.fName);
  }
};
person.getFName(); // alice
setTimeout(person.getFName, 1000); // undefined
/**
 * person.getFName is passed as a function value
 * The connection to person is lost because only the function is passed.
 * when callback triggered, since it's not invoked as person.getName(), `this` is no longer person.
 * /
```

- `getFName()` is a regular function, `this` is determined by caller
  - `person.getFName()`, `this` = caller = person
  - the callback in `setTimeout`: 
    - only the function value of person.getFName is passed
    - caller 'person' is lost when invoke - `this` is no longer person
-  `setTimeout(person.getFName, 1000)` VS Ex2.1的`console.log(getXCopy())`
    - in setTimeout, person.getFName is <u>triggered by browser, `this` is `window` in browser env</u> -  `undefined`, not TypeError.
    - getXCopy is a plain function call, <u>triggered by Javacript, in strict mode, `this===undefined`</u>, 所以TypeError, cannot visit x of undefined, crash the app.

✅ To fix: with `bind()`

```javascript
setTimeout(person.getFName.bind(person), 1000); // alice
```

✅ To fix: with an arrow callback

```javascript
setTimeout(() => person.getFName(), 1000); // alice
```
- arrow function is the callback, 虽然是在global下执行的, 但是执行的是person.getFName(), where caller=person. 
  - 区别于callback直接是person.getFName - the function value of person.getFName, caller 'person' is lost.

❌ Doesn't work (arrow function in person)

```javascript
// 2.3.1
const person = {
  fName: "alice",
  getFName: () => {
    console.log(this.fName)
  }
};
person.getFName();// undefined
```
> **Object does NOT create lexical scopes**.
> Only functions, modules, and blocks create lexical scopes.

JavaScript is conceptually doing this:

```javascript
const getName = () => {
  console.log(this.name);
};

const person = {
  name: "Alice",
  getName,
};
```
- The arrow function captures `this` from the surrounding module/global scope, **not** from `person`. here `this === window`

✅ To fix: using class

```javascript
// 2.3.2
class Person {
  fName = "alice";

  getFName = () => {
    console.log(this.fName)
  }
};
const person = new Person();
person.getFName(); // alice
```
- The arrow is created during instance construction, where `this === person`

✅ To fix: using arrow functions inside methods

```javascript
// 2.3.3
const person = {
  fName: "alice",
  getFNameLater() {
    setTimeout(() => console.log(this.fName), 1000);
  }
}
person.getFNameLater(); // alice after 1000ms
```
- `person.getFNameLater()` sets `this === person`.
- The arrow function is created inside `getFNameLater()`, so it captures `this` is person

❌ Doesn't work (compare with 2.3.3)

```javascript
// 2.3.4
const person = {
  fName: "alice",
  getFNameLater() {
    setTimeout(console.log(this.fName), 1000);
  }
};
person.getFNameLater(); // alice printed out right away
```
- the first arg in `setTimeout` is not a function, when evaluating
  - it prints 'alice' immediately and returns `undefined`
    - similar to `static f1 = console.log(...)` VS `static f() { console.log(...)}`, f1 will be executed immediatly, but function f won't be executed unless explicitly call MyClass.f() 
  - so it's actually doing `setTimeout(undefined, 1000);`
- 区别于2.3.3`setTimeout(()=>console.log(this.fName),1000)`
  - first arg is a function, cannot be executed
  - setTimeout stores that function and calls it later


#### <a name="95-class-members" id="95-class-members">9.5 Class Members</a>

A `class` usually has these kinds of members:

| Member | When created | Copies | Inheritance |
|--------|--------------|--------|-------------|
| **Instance fields** | During `new` (*instance construction*) | One copy per instance | Each subclass instance gets **its own copy** of inherited instance fields. |
| **Instance methods** | During *class evaluation* | Shared by all instances | Subclasses **share parent's** methods unless overriden. |
| ↳ **Getters / Setters**<br>`get name()`<br>`set name(val)` | Used on property (public most, private rarely), **NOT instance field**<br>Usually instance methods | Shared by all instances | Subclasses **share parent's** methods unless overriden. |
| **Static fields** | Run once during *class evaluation* | One copy per class | Subclasses **share parent's** unless overriden.  |
| **Static methods** | Run once during *class evaluation* | One copy per class | Subclasses **share parent's** unless overriden. |

Members can also be **private** by prefixing them with `#`:
- **Private instance fields**: Belong to **each** instance, and can only be used inside the class body.
  - <u>Private field必须**先**declare in class body</u>, 不能直接在constructor 里首次定义
  ```javascript
  class Foo {
    #count; // 先declare
    constructor() {
      this.#count = 0; // 后使用this.#count
    }
  }
  ```
  - 和instance fields一样, each **subclass** has its **own copy of parent's private fields**
    - 但是**Private field can NOT be accessed in subclass**:
      - ❌ `this.#baseProp`
      - if **subclass needs access**, need <u>expose in BaseClass</u> thru public method `getBaseProp() { return this.#baseProp}` `setBaseProp(val){...}`
  - **Private field不能被删除**:
    - ❌ `delete this.#privateProp`
- Private instance methods, including private `get #name() {}`/`set #name(val) {}` (not common), <u>不用先declare</u>
- Static private fields / methods (not common): Accessible only within the class body and belong to the class itself.

Ex1.1

```javascript
class Rect {
  // static field: Rect.count
  static count = 0; // static前面没有const

  // instance fields: one copy per object
  width = 0;
  height = 0;

  constructor(width, height) {
    this.width = width;
    this.height = height;

    Rect.count++; // 要用Rect.count, 不是this.count
  }

  // instance method: object level, 不是static
  area() {
    return this.width * this.height;
  }

  toString() {
    return `${this.constructor.name}(${this.width} x ${this.height}`;
  }

  // static methods前面都没有function, 不是static function someFunc!!! 
  // static method: class level, Rect.compareByArea
  static compareByArea(r1, r2) {
    return r1.area() - r2.area();
  }

  // static factory method, class level
  static createSquare(size) {
    return new this(size, size); // 用this new, 勿忘return
  }

  // static, class level
  static fromJSON(str) {
    try {
      const { width, height } = JSON.parse(str);
      return new this(width, height); // 用this new
    } catch { // catch后没有(err)
      throw new Error(`fromJSON: json parse failed`);
    }
  }
}

const r1 = new Rect(3, 4);
const r2 = Rect.createSquare(5);
const r3 = Rect.fromJSON('{"width": 10, "height": 2}');

console.log(r1.area()); // 12
console.log(r1.toString()); // Rect(3 x 4)
console.log(r3.toString());  // Rect(10 x 2)

console.log(Rect.count); // 3

const rects = [r1, r2, r3];
rects.sort(Rect.compareByArea); // pass进sort function
console.log(rects); // [3,4], [10,2], [5,5]

console.log(Rect.compareByArea(r1, r2)); // -13=12-25
```
- instance field
  - 要不要把property写成instance field取决于if it's part of every instance's structure. It <u>makes the class easier to read because the fields at the top act like a concise declaration of the object's shape</u>
    - width, height of Rect - instance field
    - an optional field, a temp variable used during construction or computation - not instance field
  - **<s>const</s>** width = 0; 直接写field, 没有const
- static field `Rect.count`:
  - shared by class, 只有一个copy
  - static **<s>const</s>** count=0; 没有const, 直接field
  - often used for data dont' want to be replicated across instances
    - **cache** (`User.cache`)
    - **config** (`ApiClient.basePath`)
- static method: shared by class
  - static **<s>function</s>** someFunc(){}, <u>和`static width=0`一样, 没有function</u>
  - Static methods are often used to create 
    - **utility function** (`Rect.fromJSON`)
    - **sort function** (`Rect.compareByArea`)
    - **factory method** (`Rect.createSquare`) 
    - <u>database related operation</u> (search/save/delete entires form db, eg: `Article.delete({ id: 123 }`)
- area()是object level, 和当前object有关, 所以不是static

Ex1.2 subclass

```javascript
class FilledRect extends Rect {
  static defaultColor = "red";
  name = "Filled";

  constructor(width, height, color=FilledRect.defaultColor) {
    super(width, height); // 没有return
    this.color = color;
  }

  toString() { // override, otherwise will refer to super.toString
    return `${super.toString()}, color=${this.color}`;
  }
}
console.log(FilledRect.count); // 3, refer的Rect.count

const filled = FilledRect.createSquare(6);
console.log(filled.toString()); // FilledRect: [6, 6], color=red. 虽然super.toString(), 但是this.constructor.name变成了FilledRect. color是FilledRect.defaultColor
console.log(FilledRect.count); // 4
console.log(Rect.count); // 4, 新new的FilledRect改变了Rect.count

const fr1 = new FilledRect(3,4,"green");
console.log(fr1.toString()); // FilledRect(3 x 4), green
console.log(fr1.area()); // 12, 用的Rect.prototype.area()

const fr2 = new FilledRect();
console.log(fr2.toString()); // FilledRect(undefined x undefined), red

console.log(Object.hasOwn(fr1, "width")); // true

// "Inheritance" Is Sharing, Not Copying
console.log(Object.hasOwn(fr1, "count")); // false
console.log(Object.hasOwn(Rect, "count")); // true
console.log(Object.hasOwn(FilledRect, "count")); // false

console.log(Object.hasOwn(Rect, "createSquare")); // true
console.log(Object.hasOwn(fr1, "createSquare")); // false

// instance methods are shared across instance, 并不属于某个instance
// 是"area", 不是"area()"
console.log(Object.hasOwn(Rect.prototype, "area")); // true
console.log(Object.hasOwn(FilledRect.prototype, "area")); // false
console.log(Object.hasOwn(fr1, "area")); // false

console.log(Object.hasOwn(fr1, "toString")); // false, 注意!!
// 区别于area, FilledRect没有override area, 所以FilledRect.prototype没有自己的area
console.log(Object.hasOwn(FilledRect.prototype, "toString")); // true
console.log(Object.hasOwn(Rect.prototype, "toString")); // true
```
> 只有**instance fields (public+private)**, subclass会有自己的copy
> 其他都是inherit: **Inheritance Is Sharing, Not Copying**
> - inherited **instance methods**, no copy, unless overriden
> - inherited **static members** fields / methods, no copy, unless overriden
- **Subclass instance** does **NOT** have its own copy of inherited **instance methods**, unless overridden. Instance methods are inherited through the prototype chain. 
  - 即使overridden, 也是属于FilledRect.prototype, 而不是instance本身
  - fr1.area()用的是Rect.prototype.area()
  - fr1.toString()虽然用的super.toString(), 但是this.contructor.name还是变成了FilledRect
  - FilledRect虽然override了toString, 但是toString是属于FilledRect.prototype的, 并不属于某个instance 
    - `Object.hasOwn(FilledRect.prototype, "toString"); // true`
    - `Object.hasOwn(fr1, "toString"); // false`
    - `Object.hasOwn(Rect.prototype, "area"); // true`
    - `Object.hasOwn(FilledRect.prototype, "area"); // false`
    - `Object.hasOwn(fr1, "area"); // false`
- **Subclass** does **NOT** have its own copy of inherited **static members**, unless overridden. Static fields/methods are inherited through the constructor (class) prototype chain. 
  - `FilledRect.count`: FilledRect没有自己的static count, it's reading from `Rect.count` - There is only one `count`, on `Rect` - 所以<u>new FilledRect改变了Rect.count</u>
  - static member属于class本身, 不属于某个instance 
    - `Object.hasOwn(Rect, "count") // true`
    - `Object.hasOwn(FilledRect, "count") // false`
    - `Object.hasOwn(fr1, "count") // false`
    - `Object.hasOwn(Rect, "createSquare")); //true`
    - `Object.hasOwn(fr1, "createSquare") // false` 
- Each **subclass instance** gets **its own copy** of parent <u>instance fields</u> when `super()` runs, 和上面不一样
  - when excution reaches `class FilledRect extends Rect {}`,
    - create static members: `defaultColor` on `FilledRect`
      - no `count` created, it resolves to `Rect.count` thru class prototype chain
    - create its own instance methods if any
  - when `const fr2 = new FilledRect()`
    - create a new instance and link it to `FilledRect.prototype`
    - run `FilledRect` constructor()的super(), <u>**NOT** FilledRect instance fields</u> (name="filled")
      - `super(width, height)`
        - <u>initializes `Rect`'s instance fields</u> on r2 (width, height) - fr2 gets its own copy of width, height
        - run `Rect` constructor()
      - back to `FilledRect`
        - create instance field name="filled" - Rect super都run完了才create
        - rest of FilledRect constructor (this.color=color)
    - 注意fr2.toSting()得到的是FilledRect(undefined x undefined), red
      - super(width, height)时width,height都是undefined
      - 但是FilledRect的constructor, color有defaultColor red

Ex1.3 Neither class has a constructor

```javascript
class Rect {
  static count = 0;
}
class FilledRect extends Rect {}
```
- JavaScript automatically inserts `constructor()` with `super()` in subclass. it's same as

  ```javascript
  class Rectangle {
    static count = 0;
    constructor() {}
  }

  class FilledRectangle extends Rectangle {
    constructor(...args) {
      super(...args);
    }
  }
  ```

Ex1.4

```javascript
class Point2d {
  x = 0;
  y = 0;
  constructor(x = 0, y) {
    this.x = x; this.y = y;
  }
  toString() {
    return `(${this.x}, ${this.y})`;
  }
}
class Point3d extends Point2d {
  z = this.y * 2; // by now, super(x, y) already done, 可以用this.y

  constructor(x, y, z) {
    super(x, y);
    this.z = z;
  }
  
  toString() {
    return `${super.toString()}, z = ${this.z}`;
  }
}
const p1 = new Point3d(2, 1, 3);
console.log(p1.toString()); // (2, 1), z = 3
const p2 = new Point3d();
console.log(p2.toString()); // (0, undefined), z = undefined
```
- Point3d没有constructor, javascript会auto inject constructor() { super()}
- 对于Point3d, when `new`
  - run super(x, y) **first**
    - create Point2d instance fields (x=0, y=0)
    - Point2d constructor
  - back to Point3d
    - 此时才**create instance field** z=this.y*2
      - for p1, 经过super(2,1), 此时this.x=2, this.y=1 -> z=2
      - for p2, 经过super(), 此时this.x=0, this.y=undefined -> **this.z=NaN**
    - rest of constructor
      - for p1, this.z=z=3
      - for p2, this.z=undefined

Ex1.5 when to use `super`

```javascript
class Point2d {
  getID() {
    return "2d";
  }
}
class Point3d extends Point2d {
  getID() {
    return "3d";
  }
  print1() {
    console.log(this.getID());
  }
  print2() {
    console.log(super.getID()); // shouldn't use super here.
  }
}
const p = new Point3d();
p.print1(); // 3d
p.print2(); // 2d
```
- use `super.someFunc` only when <u>overriding a method and want to reuse the parent's implementation</u>
  - eg: FilledRect.toString()
  - 如果不是override, 用`this.someFunc`, 即使subclass没有, 也可以通过prototype chain读到

Ex2. getter / setter

```javascript
class User {
  #name = ""; // private也没有const/function, 和static一样

  constructor(name) {
    this.name = name; // name setter called, 不是this.#name=name!!
  }

  get name() {
    return this.#name; // name getter won't be called
  }

  set name(value) {
    value = value.trim(); // 可以用value=value, value不是const, 是local var, 可以覆盖

    if (!value) {
      throw new Error("Name cannot be empty.");
    }

    this.#name = value; // name setter won't be called
  }

  get displayName() {
    return this.#name.toUpperCase(); // name getter won't be called
  }
}

const u1 = new User("   Alice ");
console.log(u1.name); // Alice
console.log(u1.displayName); // ALICE

u1.displayName = "hello";
console.log(u1.displayName); // ALICE, 没变成hello

u1.name = " Bob ";
console.log(u1.name); // Bob

// u1.#name; // SytaxError, the whole js crash, nothing runs

const u2 = new User("  "); // Uncaught Error: Name cannot be empty.
console.log("end"); // 没有走到这一步!
```
- 对于property, 它可以either是instance field, or是getter/setter (function name)
  
  ```javascript
  class A {
    x = 0;
    set x(v) {}   // ❌ SyntaxError, x不能既是instance field, 又是function name
  }
  class B {
    #x = 0;
    constructor(x) { 
      this.x = x; // setter called, x是property
    }
    set x(val) {} // ✅ #x和x不一样
  }
  ```
- `getter`/`setter`既可用于public prop (common), 也可用于private prop (rarely)

  ```javascript
  class Person {
    #name = ""; // #name是instance field, 要先declare后面才能用this.#name

    get #upperName() { // no need decalre #upperName outisde or in constructor 
        return this.#name.toUpperCase();
    }
    set #upperName(value) {
        this.#name = value.trim();
    }
  }
  ```
  - 区别于private instance field要declare before use. <u>private getter/setter是instance method, 不需要declare</u>
  - private getter/setter很少用到, 因为无法在class外visit
- `getter`/`setter`用于当value needs logic, eg: validation, computed values, etc
- private field `#name`用于当需要hide internal implementation
- <span class="underline-orange">constructor里是 **`this.name`** = value, 不是this.#name</span>
  - `this.#name=value`不会trigger name setter
    - 在constructor里, use public prop (`this.name = val`) so setter(validation) is reused.
    - 在`setter`/`getter`里: 用the backing field (`this.#name`) to avoid recursion(如果setter里再用this.name=..., name的setter又会被recursive call).
- 注意只有getter没有setter的`displayName`是read only, 无法赋值 (赋值不报错,但是没用)
- 注意`u1.#name`会crash整个app (**SyntaxError** happens at **compile time**)
- 对于u2, 如果想print end

  ```javascript
  try {
    const u2 = new User("  "); // Uncaught Error: Name cannot be empty.
  } catch(err) {
    console.log(err);
  }
  console.log("end"); // 没有走到这一步!
  /**
  * Error: Name cannot be empty.
      at set name (test.js:33:13)
      at new User (test.js:22:15)
      at test.js:53:14
  * end - code继续了
  */
  ```

Ex3. static method用于cache

```javascript
class User {
  // 不需要private, 如果有subclass, 也可以用
  static cache = new Map(); // User.cache

  constructor(id, name) {
    this.id = id;
    this.name = name;

    // 不是在这里User.cache.set(..). 
    // cache是为了findById更快, 所以在findById里set
  }

  static findById(id) { // class level, not instance
    // 1. Check cache
    if (User.cache.has(id)) { // 要用User.cache, 不是直接cache.has(id)
      console.log("Cache hit");
      return User.cache.get(id);
    }

    console.log("Cache miss");

    // 2. Query database (pretend)
    const row = fakeDB.find(({id: userId}) => userId === id);

    // 3. Not found
    if (!row) {
      return null;
    }

    // 4. Create object, 不能直接User.cache.set(id, row)!! 要先把value变成User type
    const user = new this(row.id, row.name);

    // 5. Save to cache
    User.cache.set(id, user);

    return user; // return user不是row
  }
}

const fakeDatabase = [
  { id: 1, name: "Alice" },
  { id: 2, name: "Bob" }
];

const u1 = User.findById(1); // Cache miss
const u2 = User.findById(1); // Cache hit

console.log(u1 === u2); // true
console.log(u1); // User {id: 1, name: 'Alice'}

console.log(User.findById(99)); // Cache miss + null
```
- `cache`和`findById`都是static, 都是class level, 和individual instance没有关心
- `cache`不需要private, subclass也可以用
- `User.cache`是为了findById更快, <u>不是在constructor里set</u>, 而应该在findById里, <u>在db找到后set</u>, 所以下次可以直接从cache里get, 而不用再去db找了(expensive)
- in static method, 一般都`new this(...)`而不是`new User(...)`. 这样如果User有subclass, this会指向subclass, 而不是User
- `fakeDB.find(({id: userId}) => userId === id)`
  - 勿忘<span class="orange">**(**</span>{ id }<span class="orange">**)**</span> => {...} 括号
  - cast id to userId {id: **userId**}

Ex4. static method用于config

```javascript
class ApiClient {
  static baseUrl = "https://api.example.com"; // class level
  static timeout = 5000; // class level

  constructor(apiKey) {
    this.apiKey = apiKey;
  }

  request(path) {
    console.log(
      `${ApiClient.baseUrl}${path} (timeout=${ApiClient.timeout}ms)`
    );
  }
}

const client = new ApiClient("key1");
client.request("/users"); // https://api.example.com/users (timeout=5000ms)

ApiClient.baseUrl = "https://staging.example.com";
client.request("/users"); // https://staging.example.com/users (timeout=5000ms), uses new baseUrl
```
- static field是可以在class外改的: `ApiClient.baseUrl="https://fasdfa"`;

Ex5.

```javascript
class CalendarItem {
  static #count = 0; // count必须static, 因为用来做id, 勿论new哪一个subclass, count+1
  // #count是private, in case it's used outside class body as CalendarItem.count=100, messed up with id

  // private instance field
  #id;
  #complete = false; 
  // subclass有自己的copy, 但是不能reminder.#id or this.#id in Reminder class body
  // 但是可以通过inherited CalendarItem的public instance method 
  // isComplete()/markComplete() visit和update

  constructor() {
    // 不要用new.target.name === "CalendarItem": 
    // in case className changed after minification
    // 不能用new.target.name === this.constructor.name: 
    // new Reminder(), this.constructor.name = Reminder, 但我们要check against CalendarItem
    // 要先throw error, 写在#count++, this.#id之前
    if (new.target === CalendarItem) {
      throw new Error("CalendarItem is abstract and cannot be instantiated directly.");
    }

    CalendarItem.#count++;
    this.#id = CalendarItem.#count;
  }

  // 不能用get #id() {..}, outside class body和subclass都用不了
  // 必须public, subclass才能用
  getID() {
    return this.#id;
  }

  getTimeString(dateTime) {
    if (dateTime instanceof Date) {
      return dateTime.toUTCString();
    } 
    return "No date or date not valid";
  }

  // 如果写成get #complete(){}, class body外无法得到是否complete
  isComplete() {
    return this.#complete;
  }
  markComplete() {
    this.#complete = true;
  }

  summary() {
    if (this.isComplete()) {
      return `${this.constructor.name}: ${this.getID()} complete.`;
    }
    throw new Error("Subclasses must implement summary().");
  }
}
class Reminder extends CalendarItem {
  desc = "";
  startDateTime = null;

  constructor(desc, startDateTime) {
    super();
    this.desc = desc;
    this.startDateTime = startDateTime;
  }

  summary() {
    // 不能直接this.#complete, subclass不能直接访问parent的private field
    if (this.isComplete()) {
      return super.summary(); // 勿忘return
    }
    // this.constructor.name will change after minification
    // Reminder有从CalendarItem得到的#id, 但是无法直接访问
    // 和#complete一样, 必须用this.getID()访问
    return `${this.constructor.name}: ${this.getID()}: ${this.desc} at ${this.getTimeString(this.startDateTime)}`
  }
}

class Meeting extends CalendarItem {
  desc = "";
  startDateTime = null;
  endDateTime = null;

  constructor(desc, startDateTime, endDateTime) {
    super();
    this.desc = desc;
    this.startDateTime = startDateTime;
    this.endDateTime = endDateTime;
  }
  summary() {
    if (this.isComplete()) {
      return super.summary();
    }
    return `${this.constructor.name}: ${this.getID()}: ${this.desc} from ${this.getTimeString(this.startDateTime)} to ${this.getTimeString(this.endDateTime)}`;
  }
}

const callMyParents = new Reminder(
  "Call my parents",
  new Date() // Sun Aug 09 2026 15:10:18 GMT-0700 (Pacific Daylight Time)
);
console.log(callMyParents.summary()); // Reminder: 1: Call my parents at Sun, 09 Aug 2026 22:12:22 GMT
callMyParents.markComplete();
console.log(callMyParents.summary()); // Reminder: 1 complete.

const interview = new Meeting(
  "Job Interview: ABC Tech",
  new Date("2026-05-24T11:00:00Z"),
  new Date("2026-05-24T12:00:00Z")
);
console.log(interview.summary()); // Meeting: 2: Job Interview: ABC Tech from Sun, 24 May 2026 11:00:00 GMT to Sun, 24 May 2026 12:00:00 GMT
interview.markComplete();
console.log(interview.summary()); // Meeting: 2 complete.

console.log(callMyParents instanceof Reminder); // true
console.log(callMyParents instanceof CalendarItem); // true
console.log(interview instanceof Meeting); // true
```
- **`new.target`** returns <u>constructor function</u>

  ```javascript
  new.target === CalendarItem

  // similar to
  const obj1 = { a: 1 };
  const obj2 = obj1;
  obj1 === obj2;
  ```
  - `new.target`和`calendarItem`类似于obj1和obj2, 比的是refer to的function
  - 不能用`new.target.name === "CalendarItem"`
    - code minify后, className变成class A {...}, failed
  - 不能用`new.target.name === this.constructor.name`
    - `new Reminder(...)`, this.constructor.name=Reminder, 而我们要check against的是CalendarItem
- `static #count=0`
  - 必须static: inherited, new subclass的时候才能count+1, 才能做id
  - 必须 **`#count`**: in case outside class, `CalendarItem.count=100`, messed up with id
- CalendarItem的`#id`, `#complete`
  - 虽然是CalendarItem的private field, 但是each subclass instance (reminder, meeting) has its **own copy** of `#id`, `#complete`
  - 但是因为private
    - ❌ `reminder.#id`
    - or inside `class Reminder { ❌ this.#id }`
  - Only **code inside CalendarItem** may touch `#id`/`#complete`.
  - If **subclasses need access**, expose it through CalendarItem public methods like getID(), isComplete(), or markComplete()
- `Date`
  - UTC string: `2026-05-24T11:00:00Z`
    - `T` separates the date and time.
    - `Z` means UTC.
  - `new Date()` returns <u>now</u>: "Sun Aug 09 2026 15:10:18 GMT-0700 (Pacific Daylight Time)" as a `Date` object
  - `date.toUTCString()` vs `date.toISOString()`
    ```javascript
    const d = new Date("2026-05-24T11:00:00Z");

    console.log(d.toISOString()); // 2026-05-24T11:00:00.000Z
    console.log(d.toUTCString()); // Sun, 24 May 2026 11:00:00 GMT
    ```
    - `toISOString()` → machine-readable, standardized, best for storage and communication.
    - `toUTCString()` → human-readable, best for display or debugging.

### <a name="#101-event-loop" id="#101-event-loop">10.1 Event Loop</a>

**Call Stack** | **Microtask Queue**
- The **call stack** is where JavaScript is currently executing code.
  - All JavaScript code eventually runs on the call stack, whether it comes from synchronous code, a microtask, or a task.
  - The call stack is **LIFO**: when a function calls another function, the new function is pushed onto the top of the stack. When it finishes, it is popped off.
- The **microtask queue** holds callbacks that should run as soon as the current task finishes and the call stack is empty.
  - Eg: `Promise.then()`, `queueMicrotask()`, and code that resumes after `await`.

**Not** all <u>async scheduling</u> will be pushed into <u>microtask queue</u>. 

| | Microtask Queue | Task |
|---|---|---|
| Promise `.then()` | ✅ | |
| `await` continuation | ✅ | |
| `queueMicrotask()` | ✅ | |
| `setTimeout()`, `setInterval()` | | ✅ |
| Browser/DOM event callback (click, change, input, etc) | | ✅ |

**Event Loop**
1. Execute the current task on the <span class="orange">call stack</span>.
2. When the call stack becomes empty, drain the **entire** <span class="orange">microtask queue</span>.
3. Process the **next task** (eg, a `setTimeout` callback).
4. Repeat.

```text
          JavaScript Event Loop

        ┌──────────────────────────┐
        │      Current task        │
        │  synchronous JS runs     │
        └────────────┬─────────────┘
                     ↓
        ┌──────────────────────────┐
        │     Microtask queue      │
        │ Promise.then()           │
        │ queueMicrotask()         │
        │ await continuation       │
        └────────────┬─────────────┘
                     ↓
              drain ALL microtasks
                     ↓
        ┌──────────────────────────────────┐
        │       Next task                  │
        │ setTimeout callback              |
        | setInterval callback             │ 
        │ browser/DOM event callback       │
        │ (click, change, input, etc)      │
        └──────────────────────────────────┘
                     │
                     └──────────► Repeat
```

Ex1.

```javascript
console.log("A");

setTimeout(() => console.log("B"), 0);

Promise.resolve().then(() => console.log("C"));

console.log("D");

// A, synchronous
// D, synchronous
// C, microtask queue
// B, another task
```

Ex2. `async`/`await` + `setTimeout`, **microtask queue**

```javascript
const arry = [1, 2, 3];

(async () => {
  for (const elem of arry) {
    console.log("start", elem);
    await Promise.resolve();
    console.log("end", elem);
  }
})();

setTimeout(() => {
  console.log("timeout");
}, 0);

console.log("done");

// start 1

// done - 注意log顺序

// end 1
// start 2

// end 2
// start 3

// end 3

// timeout - 注意timeout是所有for loop结束才print的
```
- 注意<span class="underline-orange">timeout是等到所有for loop结束才print</span>. 因为JavaScript's **event loop** always does this:
  - Run all synchronous code (call stack).
  - Drain one microtask queue **completely**.
  - Then run next task (like setTimeout).
  - Repeat.

**Visual timeline**

```
Call Stack
----------
start 1
await -- pause
setTimeout scheduled, 看见setTimeout并不执行,只是schedule
done
---
call stack now is empty

Microtask Queue
---------------
resume async (1)
↓
end 1
start 2
await
↓
resume async (2)
↓
end 2
start 3
await
↓
resume async (3)
↓
end 3

Task Queue
---------------
timeout
```
- `await` continuations are microtasks.
- `setTimeout` callback is another task queue.
- The <span class="underline-orange">event loop always finishes all pending microtasks before running the next task queue</span>.

### <a name="#102-promise" id="#102-promise">10.2 Promise</a>

```javascript
function getUser() {
  return fetch("/api/user");
}
console.log("A");
console.log(getUser());
console.log("B");

// A
// Promise { <pending> } 
// or 
// if resolved: Promise { <fulfilled>: Response }
// B
```
- `fetch()` <u>doesnt' block anything. it immediately starts the request and returns a Promise</u>. JavaScript continues executing other code.
- `fetch()` always return a **Promise**, either pending / fullfilled / rejected. it will NEVER be `A Response B`

A Promise has three states: **pending** / **fullfilled** / **rejected**. Once a Promise becomes fulfilled or rejected, it is **settled**.

A Promise settles only once.

### <a name="#1021-creating-a-promise" id="#1021-creating-a-promise">10.2.1 Creating a Promise</a>

- `new Promise((resolve, reject) => { ... })`

  ```
  resolve  // function: "mark this Promise successful", no return
  reject   // function: "mark this Promise failed", no return
  ```

  ```javascript
  const promise = new Promise((resolve, reject) => {
    // Promise is currently pending
    // perform some operation

    if (success) {
      resolve("success"); // tell the Promise: it succeeded
    } else {
      reject(new Error("failed")); // tell the Promise: it failed
    }
  });
  ```
- `Promise.resolve()` / `Promise.reject()`

  ```javascript
  const p1 = Promise.resolve("hello");
  console.log(p1); // Promise {<fulfilled>: 'hello'}

  const p2 = Promise.reject("oops");
  console.log(p2); // Promise {<rejected>: 'hello'}
  ```

  These are roughly equivalent:
  
  ```javascript
  const p1 = new Promise((resolve) => {
    resolve("hello");
  });
  console.log(p1); // Promise {<fulfilled>: 'hello'}

  const p2 = new Promise((_, reject) => { // 注意"_"代替resolve, 因为没有用
    reject("oops");
  });
  console.log(p2); // Promise {<rejected>: 'oops'}
  ```

  - new Promise(**(resolve, reject)** => {...}): order matters, needs to be <u>resolve first, then reject</u>
    
    ```javascript
    // technically this works as well, apple=resolve, banana=reject 
    new Promise((apple, banana) => {
      banana("oops");
    });
    ```
  - `resolve(val)` / `reject(val)` - it doesn't return anything. 区别于`Promise.resolve(val)` / `Promise.reject(val)` - returns a settled promise.

The key difference btw these two
- `new Promise((resolve, reject) => ...)`: You control WHEN it resolves/rejects
- `Promise.resolve(value)` / `Promise.reject(error)`: It's already resolved/rejected


### <a name="asyncawait" id="asyncawait">async/await</a>

```javascript
async function task1() {
  console.log('task1 start');
  await task2();
  console.log('task1 end');
}

async function task2() {
  console.log('task2 start');
  await Promise.resolve();
  console.log('task2 end');
}

task1();
console.log('outside');
```

log will be

```sql
task1 start
task2 start
outside
task2 end
task1 end
```

JavaScript uses an event loop and a mircrotask queue to handle asynchronous behavior.
- task1() starts and hits await task2(), task1 suspends
- event loop picks up next task - task2 is called immediately
- Inside task2, execution continues until its own await. At that point, task2 suspends and returns a Promise (still pending).
  - `await Promise.resolve()` will always resolve in the next microtask, not immediately in the current call stack. and will wait until the current synchronous code to finish before jumping back
- That Promise is returned up to task1, which is also awaiting it. So now task1 suspends as well, because it’s waiting for the result of task2.
- log outside

### <a name="input-change-debounce" id="input-change-debounce">input change debounce</a>

[debounce/throttle](./debounce.html)

- pair `debounce` with `input` event
  - `input` fires every time the value of the input changes
  - `change` fires only after input loses focus or the user confirms the edit (e.g., pressing Enter in a text box).

For search boxes or filtering UIs, you want to react as the user types, but not on every keystroke — hence `debounced` and  `input` is the perfect combo.

- for `debounce`, only the most recent action triggers the callback. eg: user types in "abc" and pauses, `debounce` shouldn't be triggered when "a"/"ab" is in, but only when "abc" is done. so we need `clearTimeout` to cancel previous schedule.

```javascript
// without clearTimeout
function debounce(callback, delay) {
    return function(...args) {
        setTimeout(() => callback(...args), delay);
    };
}

const log = debounce(console.log, 500);
log("A"); // schedules "A"
log("B"); // schedules "B"
log("C"); // schedules "C"
// result: prints A, B, C — all after 500ms (BAD for debounce)

// with clearTimeout
function debounce(callback, delay) {
    let id;
    return function(...args) {
        clearTimeout(id); // cancel any previous timer
        id = setTimeout(() => callback(...args), delay); // schedule a new one
    };
}

const log = debounce(console.log, 500);
log("A");
log("B");
log("C");
// result: only "C" prints (GOOD for debounce)
```

- `setTimeout(fnRef, delay)` expects a function reference, not a function call

```javascript
setTimeout(callback(...args), delay); 
// This calls callback(...args) immediately — instead of scheduling it to run later

setTimeout(() => callback(...args), delay);
// giving setTimeout the arrow function to call later
```
### <a name="big-data-with-virtualization" id="big-data-with-virtualization">Big data with virtualization</a>

The scrolling list that only renders a subset of items (recycling a fixed pool of rows) — is called <b>virtualization</b> or <b>windowing</b> or <b>DOM virtualization</b>, not "Virtual DOM".

The <b>Virtual DOM</b> (used by frameworks like React, Vue, etc.) is something completely different:
- It's a JavaScript data structure (a lightweight object tree) that represents what the DOM should look like.
- The framework compares (diffs) the new virtual tree against the previous one, then updates the real DOM minimally.
- Developers don't directly touch the DOM — the framework handles it.

To render 100,000 rows smoothly by windowing (only mounting the items in view):
- Total height: we compute totalRows * ROW_HEIGHT but don’t render all rows.
- Visible window: based on scrollTop, we calculate startIndex/endIndex.
- Spacers: paddingTop and paddingBottom visually position the windowed items correctly.
- Overscan: renders a few rows outside the viewport to avoid flicker during fast scrolls.

[big-data-list.html](./big-data-list.html)

textNode, innerText, innerhtml

Immediately Invoked Function Expression (IIFE), and it’s mainly about scoping and isolation

```javascript
let pool = []; // becomes window.pool

(function () {
    const pool = []; // private
})();
```

- whatever inside IIFE runs right away, once, when the file loads
- creates its own local scope, self-contain, avoids polluting the global namespace, unless explicitly attach to `window`
- like a mini-module, not accessible from `window.pool`

Don't cache rendered nodes
- Keeping thousands of detached nodes in memory can be heavier than re-creating a few dozen visible ones.
- You have to manage state carefully (e.g., clear event listeners, avoid leaks).
- The browser is already good at creating/destroying lightweight elements quickly.

Instead, recycles a pool of DOM nodes and renders only the visible window. Uses `transform: translateY(...)` to move nodes (cheap for the browser), `requestAnimationFrame` to throttle scroll updates, and supports `OVERSCAN` for smoothness.


### <a name="html-and-css-gotcha" id="html-and-css-gotcha">HTML and CSS gotcha</a>

- flexbox: left with fixed width, right takes up rest of space

  ```html
  <div class="parent">
      <div class="left">left</div>
      <div class="right">right</div>
  </div>
  ```
  ```css
  .parent {
      display: flex;
      gap: 10px;
      justify-content: center; /* center horizontally */
      align-items: center;     /* center vertically */
  }
  .left {
      width: 50px;
      flex: 0 0 auto; // no shrink/grow, fixed width
  }
  .right {
      flex: 1 1 auto; // take the rest of space
      min-width: 0;
  }
  ```

- IntersectionObserver: `item.isIntersecting` means whether target is overlapping with viewport
  - on page load: mag is fully visible inside viewport -> `item.isIntersecting = true`
  - when scrolls and mag is out of viewport -> `item.isIntersecting = false`

  ```javascript
  onMount() {
      const initStickyObserver = () => {
          const refinementRoot = document.getElementById('brw-refinement-root');

          // sticky when refinement is out of viewport
          if (refinementRoot) {
              const observer = new IntersectionObserver(([item]) => {
                  this.state.isSticky = !item.isIntersecting;
              });

              observer.observe(refinementRoot);
          }
      };

      if (this.isMiniVersion) {
          if (document.readyState === 'complete') {
              initStickyObserver();
          } else {
              window.addEventListener('load', initStickyObserver);
          }
      }
  }
  ```


