# Chapter 2 — Promises as the Async Primitive

## Promise = eventual result

A Promise represents an eventual outcome:

```text
pending
  ├─ fulfilled(value)
  └─ rejected(reason)
```

Once settled, it cannot settle again.

```js
const promise = fetch("/api/user");
```

`promise` is not the user. It represents the eventual result of the operation.

## Why Promises still matter when we have `async`/`await`

This is the key relationship:

```text
Promise = underlying async value/composition model

async/await = syntax for consuming and producing Promise-based workflows
```

`async`/`await` did **not** replace Promises.

```js
const userPromise = getUser();
```

You can consume the same Promise with `.then()`:

```js
userPromise.then(user => {
  console.log(user);
});
```

or with `await`:

```js
const user = await userPromise;
```

Same Promise system; different expression.

## `async` functions produce Promises

```js
async function getAnswer() {
  return 42;
}

const result = getAnswer();

console.log(result instanceof Promise);
// true
```

Conceptually:

```js
async function getAnswer() {
  return 42;
}
```

resembles:

```js
function getAnswer() {
  return Promise.resolve(42);
}
```

## Chaining is Promise composition

```js
getUser()
  .then(user => getOrders(user.id))
  .then(orders => summarizeOrders(orders))
  .catch(error => reportError(error));
```

Every `.then()` returns a new Promise.

That matters because errors and values flow through a **chain of Promises**, not through one mutable Promise.

## Return your Promise

Wrong:

```js
getUser()
  .then(user => {
    getOrders(user.id);
  })
  .then(orders => {
    // orders is not the result you expected
  });
```

Correct:

```js
getUser()
  .then(user => {
    return getOrders(user.id);
  })
  .then(orders => {
    console.log(orders);
  });
```

Or:

```js
getUser()
  .then(user => getOrders(user.id))
  .then(orders => console.log(orders));
```

## Rejection propagation

```js
fetchUser()
  .then(user => {
    throw new Error("Failed while transforming user");
  })
  .then(() => {
    // skipped
  })
  .catch(error => {
    console.error(error);
  });
```

A thrown exception inside a Promise handler rejects the Promise returned by that handler.

## Why `Promise.resolve()` matters

It normalizes a value into Promise semantics.

```js
const p1 = Promise.resolve(42);
const p2 = Promise.resolve(existingPromise);
```

This is particularly relevant when interoperating with Promise-like values ("thenables").

## Don't create Promises unnecessarily

Bad:

```js
function getUser() {
  return new Promise((resolve, reject) => {
    fetch("/api/user")
      .then(resolve)
      .catch(reject);
  });
}
```

Better:

```js
function getUser() {
  return fetch("/api/user");
}
```

Use `new Promise()` when you actually need to adapt an API or construct an asynchronous abstraction.

## Senior design rule

Prefer APIs that **return a Promise** instead of APIs that accept your business continuation as a callback.

This:

```js
const user = await repository.getUser(id);
```

composes much better than:

```js
repository.getUser(id, user => {
  // continuation controlled here
});
```

Callbacks remain appropriate for repeated events, subscriptions, and low-level APIs. A Promise represents one eventual settlement.
