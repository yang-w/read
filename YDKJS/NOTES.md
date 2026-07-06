# YDKJS Reading Notes

## Progress

### Book 1: Get Started
- [x] [foreword.md](get-started/foreword.md)
- [x] [preface.md](preface.md)
- [x] [ch1.md — What Is JavaScript?](get-started/ch1.md)
  - [x] [§1. Transpiling, Build Pipeline, Compile vs Runtime](../docs/guide.md#1-transpiling-transpile-vs-compile-compile-vs-runtime-build-pipeline)
- [x] [ch2.md — Surveying JS](get-started/ch2.md)
- [x] [apB.md — Practice, Practice, Practice!](get-started/apB.md)

### Book 2: Scope & Closures
- [x] [ch1.md — What's the Scope?](scope-closures/ch1.md)
- [x] [§3.10 Lexical Scope, Global vs Local](../docs/guide.md#310-lexical-scope-global-vs-local)
  - [ch3.md — The Scope Chain](scope-closures/ch3.md)
- [x] [ch4.md — Around the Global Scope](scope-closures/ch4.md)
- [x] [§3.10.1 `var` + Hoisting](../docs/guide.md#3101-var-hoisting) — [§3.10.2 `let`/`const` + TDZ](../docs/guide.md#3102-letconst-tdz)
  - [TDZ](scope-closures/ch5.md#uninitialized-variables-aka-tdz)
- [x] [§3.10.3 `catch` Block Scope](../docs/guide.md#3103-catch-block-scope)
- [x] [ch6.md — Limiting Scope Exposure](scope-closures/ch6.md)
- [x] [§8.1 Defining Functions](../docs/guide.md#81-defining-functions)
- [x] [§8.2 Invoking Functions](../docs/guide.md#82-invoking-functions)
- [x] [§8.3 Function Arguments and Parameters](../docs/guide.md#83-function-arguments-and-parameters)
- [x] ~~[§8.4 Functions as Values](../docs/guide.md#func-val)~~
- [x] [§8.6 Closure](../docs/guide.md#86-closure)
- [x] [§8.6.1 Closure in Loops](../docs/guide.md#861-closure-in-loops)
  - [x] [loop closure](scope-closures/ch7.md#live-link-not-a-snapshot)
- [x] [§8.6.2 The Closure Lifecycle and Garbage Collection (GC)](../docs/guide.md#862-the-closure-lifecycle-and-garbage-collection-gc)
- [x] [§8.6.3 Module Systems: IIFE, CJS, AMD, UMD, ESM](../docs/guide.md#863-module-systems-iife-cjs-amd-umd-esm)
  - [x] [ch8.md — The Module Pattern](scope-closures/ch8.md)
- [ ] [apB.md — Practice](scope-closures/apB.md) - prime, calculator

### Book 3: Objects & Classes
- [x] [§6.2 Creating Objects](../docs/guide.md#62-creating-objects) — [§6.10 Extended Object Literal Syntax](../docs/guide.md#610-extended-object-literal-syntax) — [§3.10.4 Destructuring](../docs/guide.md#3104-destructuring-assignment)
  - [x] [§3.10.5 Object Optional Chaining](../docs/guide.md#3105-object-optional-chaining)
- [x] [§3.10.6 Object.entries()](../docs/guide.md#3106-objectentriesobjarry)
- [x] [§5.4.4 for...of](../docs/guide.md#544-forof)
- [x] [§5.4.5 for...in](../docs/guide.md#545-forin)
  - [x] [§5.4.5.1 Object.hasOwn](../docs/guide.md#5451-objecthasown)
    - [x][hasOwnProperty](objects-classes/ch1.md#better-existence-check)
- [x] [§5.4.6 for...of vs for...in](../docs/guide.md#546-forof-vs-forin)
- [x] [§6.9 Object Methods](../docs/guide.md#69-object-methods)
  - [x] [ch2.md — How Objects Work](objects-classes/ch2.md)
- [ ] [§7.1 Creating Arrays](../docs/guide.md#71-creating-arrays-arrayof-arrayfrom)
- [ ] [§7.8 Array Methods](../docs/guide.md#78-array-methods)
  - [§7.8.1 Iterator Methods](../docs/guide.md#781-array-iterator-methods)
  - [§7.8.2 flat() / flatMap()](../docs/guide.md#782-flattening-arrays-with-flat-and-flatmap)
  - [§7.8.3 concat()](../docs/guide.md#783-adding-arrays-with-concat)
  - [§7.8.4 push / pop / shift / unshift](../docs/guide.md#784-stacks-and-queues-with-push-pop-shift-and-unshift)
  - [§7.8.5 slice / splice / fill / copyWithin](../docs/guide.md#785-subarrays-with-slice-splice-fill-and-copywithin)
  - [§7.8.6 sort / reverse](../docs/guide.md#786-array-sorting-methods-sort-reverse)
  - [§7.8.7 Array → String](../docs/guide.md#787-array-to-string-conversions-jsonstringify-join-tostring)
- [ ] [§7.9 Array-Like Objects](../docs/guide.md#79-array-like-objects)
- [ ] [§11.1.1 The Set Class](../docs/guide.md#1111-the-set-class)
- [ ] [§11.1.2 The Map Class](../docs/guide.md#1112-the-map-class)
- [ ] [§9.2 Classes and Constructors](../docs/guide.md#92-classes-and-constructors) — [§9.3 class keyword](../docs/guide.md#93-classes-with-the-class-keyword) — [§9.4 Add Methods](../docs/guide.md#94-adding-methods-to-existing-classes) — [§9.5 Subclasses](../docs/guide.md#95-subclasses)
  - [public fields](objects-classes/ch3.md#public-fields)
  - [static](objects-classes/ch3.md#static-class-behavior)
  - [private #](objects-classes/ch3.md#private-class-behavior)
- [ ] [§8.7 Function Properties, Methods, Constructor](../docs/guide.md#87-function-properties-methods-and-constructor)
  - [4-rule this](objects-classes/ch4.md#this-is-it)
  - [arrow lexical this](objects-classes/ch4.md#an-arrow-points-somewhere)
- [ ] [§8.8.2 Higher-Order Functions](../docs/guide.md#882-higher-order-functions)

### Book 4: Types & Grammar
- [ ] [§4.13.3 `typeof` and `instanceof`](../docs/guide.md#4133-the-typeof-and-instanceof-operator)
  - [ch1.md — Primitive Values](types-grammar/ch1.md)
- [ ] [§4.11.1 Assignment with Operation](../docs/guide.md#4111-assignment-with-operation)
  - [ch2.md — Primitive Behaviors](types-grammar/ch2.md)
- [ ] [ch3.md — Object Values](types-grammar/ch3.md)
- [ ] [ch4.md — Coercing Values](types-grammar/ch4.md)

### Book 5: Sync & Async
- [ ] [async/await](../docs/guide.md#asyncawait)
- [ ] [ch1.md — (stub, check back later)](sync-async/ch1.md)

### Book 6: ES.Next & Beyond
- [ ] [ch1.md — (stub, check back later)](es-next-beyond/ch1.md)

### Misc
- [ ] [Input change debounce](../docs/guide.md#input-change-debounce)
- [ ] [Big data with virtualization](../docs/guide.md#big-data-with-virtualization)
- [ ] [HTML and CSS gotcha](../docs/guide.md#html-and-css-gotcha)

---

## Notes by Chapter

<!-- Detailed notes go into docs/guide.md -->
