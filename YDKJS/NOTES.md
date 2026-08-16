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
- [x] [§7.1 Array and Array-Like](../docs/guide.md#71-array-and-array-like)
- [x] [§7.8 Array Methods](../docs/guide.md#78-array-methods)
  - [x][§7.8.1 Iterator Methods](../docs/guide.md#781-array-iterator-methods)
  - [x][§7.8.2 flat()](../docs/guide.md#782-flattening-arrays-with-flat)
  - [x][§7.8.3 concat()](../docs/guide.md#783-adding-arrays-with-concat)
  - [x][§7.8.4 push / pop / shift / unshift](../docs/guide.md#784-stacks-and-queues-with-push-pop-shift-and-unshift)
  - [x][§7.8.5 slice / splice](../docs/guide.md#785-subarrays-with-slice-splice)
  - [x][§7.8.6 sort / reverse](../docs/guide.md#786-array-sorting-methods-sort-reverse)
  - [x][§7.8.7 Array → String](../docs/guide.md#787-array-to-string-conversions-jsonstringify-join-tostring)
- [x] [§11.1.1 The Set Class](../docs/guide.md#1111-the-set-class)
- [x] [§11.1.2 The Map Class](../docs/guide.md#1112-the-map-class)
- [x] [§9.2 Classes and Constructors](../docs/guide.md#92-classes-and-constructors) 
  — [x] [§9.3 class keyword](../docs/guide.md#93-classes-with-the-class-keyword) 
  — [x] [§9.4 Class Lifecycle](../docs/guide.md#94-class-lifecycle) 
  - [x] [§9.5 Class Members](../docs/guide.md#95-class-members) 
  - [x] [public fields](objects-classes/ch3.md#public-fields)
  - [x] [static](objects-classes/ch3.md#static-class-behavior)
  - [x] [private #](objects-classes/ch3.md#private-class-behavior)
  - [x][4-rule this](objects-classes/ch4.md#this-is-it)
  - [x][arrow lexical this](objects-classes/ch4.md#an-arrow-points-somewhere)
- [x] [§8.8.2 Higher-Order Functions](../docs/guide.md#882-higher-order-functions)

### Book 4: Types & Grammar
- [x] [§4.13.3 `typeof` and `instanceof`](../docs/guide.md#4133-the-typeof-and-instanceof-operator)
  - [x][ch1.md — Primitive Values](types-grammar/ch1.md)
- [x] [§4.11.1 Assignment with Operation](../docs/guide.md#4111-assignment-with-operation)
  - [x][ch2.md — Primitive Behaviors](types-grammar/ch2.md)
- [x] [ch3.md — Object Values](types-grammar/ch3.md)
- [x] [ch4.md — Coercing Values](types-grammar/ch4.md)

### Book 5: Async
- [ ] [ch1. The Modern Async Mental Model](modern-async/01-modern-async-mental-model.md)
- [ ] [ch2. Promises as the Async Primitive](modern-async/02-promises-as-the-async-primitive.md)
- [ ] [ch3. Async/Await Is Promise Syntax](modern-async/03-async-await-is-promise-syntax.md)
- [ ] [ch4. Concurrency and Promise Combinators](modern-async/04-concurrency-and-promise-combinators.md)
- [ ] [ch5. Race Conditions in Frontend Applications](modern-async/05-race-conditions-in-frontends.md)
- [ ] [ch6. Cancellation and AbortSignal](modern-async/06-cancellation-and-abortsignal.md)
- [ ] [ch7. Async Collections and Streams](modern-async/07-async-collections-and-streams.md)
- [ ] [ch8. Error Architecture](modern-async/08-error-architecture.md)
- [ ] [ch9. Frontend Application Patterns](modern-async/09-frontend-application-patterns.md)
- [ ] [ch10. Performance and Senior-Level Async Design](modern-async/10-performance-and-async-design.md)
- [ ] [ch11. Debugging Async JavaScript](modern-async/11-debugging-async-javascript.md)
- [ ] [ch12. Senior Frontend Async Checklist](modern-async/12-senior-frontend-async-checklist.md)
- [ ] [async/await](../docs/guide.md#asyncawait)
- [ ] [Async/Await & Promises](async-performance/async-await-promises.md)

### Book 6: ES.Next & Beyond
- [ ] [ch1.md — (stub, check back later)](es-next-beyond/ch1.md)

### Misc
- [ ] [Input change debounce](../docs/guide.md#input-change-debounce)
- [ ] [Big data with virtualization](../docs/guide.md#big-data-with-virtualization)
- [ ] [HTML and CSS gotcha](../docs/guide.md#html-and-css-gotcha)

---

## Notes by Chapter

<!-- Detailed notes go into docs/guide.md -->
