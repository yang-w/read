# Chapter 10 — Performance and Senior-Level Async Design

## Async does not guarantee responsiveness

A Promise-heavy app can still have terrible responsiveness if it performs long synchronous work.

```js
async function loadAndProcess() {
  const data = await fetchData();

  expensiveTransform(data); // can block UI
}
```

The network part is asynchronous. The transform may not be.

## Avoid accidental waterfalls

Waterfall:

```text
request A ─────>
               request B ─────>
                                  request C ─────>
```

Concurrent:

```text
request A ───────>
request B ───────────>
request C ─────>
```

Before optimizing code syntax, inspect the actual dependency graph.

## Start work before awaiting when appropriate

Instead of:

```js
const a = await getA();
const b = await getB();
```

you can explicitly start both:

```js
const aPromise = getA();
const bPromise = getB();

const a = await aPromise;
const b = await bPromise;
```

Usually `Promise.all()` communicates the intent better:

```js
const [a, b] = await Promise.all([
  getA(),
  getB(),
]);
```

## Concurrency limits

Unlimited concurrency can create:

- request bursts;
- server overload;
- memory pressure;
- rate-limit failures;
- worse tail latency.

A concurrency limit is often more performant than "everything at once."

## Main-thread budgeting

Senior frontend async design includes asking:

> What happens after the Promise resolves?

Parsing, normalization, sorting, rendering, and state reconciliation can dominate the actual request time.

Measure:

- network timing;
- long tasks;
- JavaScript execution;
- rendering;
- layout/paint;
- memory;
- request waterfalls.

## Microtasks and rendering

A large chain of immediately resolving Promises can monopolize microtask processing.

Don't assume:

```text
Promise = yielding to rendering
```

If you need to intentionally cooperate with browser rendering, understand which scheduling primitive you're using and why.

## Choose abstraction boundaries carefully

Good async API:

```js
async function getProductPageData(id, { signal } = {}) {
  // hides orchestration details
}
```

The caller should not need to know every low-level request unless it needs control over them.

But don't hide important semantics such as:

- cancellation;
- retries;
- caching;
- consistency;
- partial failure;
- mutation ordering.

An abstraction that hides behavior the caller must reason about is not a useful abstraction.
