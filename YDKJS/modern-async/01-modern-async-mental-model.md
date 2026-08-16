# Chapter 1 — The Modern Async Mental Model

## What this chapter is for

At senior frontend level, knowing the syntax of `async` and `await` is not enough. You need to predict **when code can run**, recognize scheduling bugs, and understand why a supposedly "async" application can still freeze the UI.

The useful mental model is:

```text
synchronous JavaScript
        ↓
current execution finishes
        ↓
microtasks are drained
        ↓
browser/runtime gets another opportunity
        ↓
next task
```

This is deliberately simplified, but it is much more useful than thinking "`await` waits."

## Run-to-completion

A normal JavaScript execution segment runs to completion before another scheduled task interrupts it.

```js
console.log("A");

setTimeout(() => {
  console.log("B");
}, 0);

console.log("C");
```

Output:

```text
A
C
B
```

`setTimeout(..., 0)` does not mean "run now." It means the callback becomes eligible for a later task.

## Tasks and microtasks

Promise reactions use the microtask queue.

```js
console.log("A");

setTimeout(() => console.log("B"), 0);

Promise.resolve().then(() => console.log("C"));

queueMicrotask(() => console.log("D"));

console.log("E");
```

Output:

```text
A
E
C
D
B
```

A useful approximation:

```text
current task
  ├─ synchronous code
  └─ drain microtasks
        ├─ Promise reactions
        ├─ await continuations
        └─ queueMicrotask callbacks

next task
  └─ timer/event/etc.
```

## `await` is a scheduling boundary

```js
async function example() {
  console.log("1");

  await Promise.resolve();

  console.log("2");
}

console.log("A");
example();
console.log("B");
```

Output:

```text
A
1
B
2
```

The function executes synchronously until it reaches `await`. Its continuation is scheduled asynchronously.

Do not mentally translate this:

```js
const result = await request();
```

into:

```text
block JavaScript until request finishes
```

Think:

```text
start/request async work
        ↓
suspend this function's continuation
        ↓
other JavaScript/browser work can happen
        ↓
Promise settles
        ↓
schedule continuation
        ↓
resume function
```

## Async does not mean another thread

This still blocks the main thread:

```js
async function calculate() {
  expensiveSynchronousCalculation();
}
```

So does this:

```js
async function calculate() {
  await expensiveSynchronousCalculation();
}
```

`async` does not move synchronous CPU work elsewhere.

For CPU-heavy frontend work, investigate mechanisms such as Web Workers rather than expecting `await` to create parallelism.

## Senior-level implication: microtask starvation

Microtasks are normally drained before the runtime moves to another task. Continuously generating microtasks can delay rendering and other task processing.

```js
function keepGoing() {
  queueMicrotask(keepGoing);
}

keepGoing();
```

This is pathological, but the principle matters: "asynchronous" does not automatically mean "friendly to the browser."

## What to be able to answer

After this chapter, you should be able to explain:

- why a zero-delay timer is not immediate;
- why Promise callbacks commonly execute before timer callbacks;
- why code before the first `await` executes synchronously;
- why code after `await` is a continuation;
- why `async` does not solve CPU blocking;
- why scheduling details matter for rendering and race conditions.
