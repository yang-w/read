# Chapter 6 — Cancellation and AbortSignal

## Promise settlement is not cancellation

A Promise tells you about an eventual outcome. It does not inherently provide a universal way to stop the underlying work.

This is critical:

```text
stop caring about a Promise
        ≠
stop the underlying operation
```

## `AbortController`

Modern browser APIs commonly accept an `AbortSignal`.

```js
const controller = new AbortController();

const responsePromise = fetch("/api/products", {
  signal: controller.signal,
});
```

Cancel:

```js
controller.abort();
```

## Handling cancellation

```js
async function load(signal) {
  try {
    const response = await fetch("/api/data", {
      signal,
    });

    return response.json();
  } catch (error) {
    if (error.name === "AbortError") {
      return;
    }

    throw error;
  }
}
```

Be careful about treating cancellation as an application error. Often it means:

> This result is no longer needed.

## Search example

```js
let controller;

async function search(query) {
  controller?.abort();
  controller = new AbortController();

  try {
    const response = await fetch(
      `/api/search?q=${encodeURIComponent(query)}`,
      {
        signal: controller.signal,
      }
    );

    return await response.json();
  } catch (error) {
    if (error.name === "AbortError") {
      return null;
    }

    throw error;
  }
}
```

## Propagate signals through layers

Bad abstraction:

```js
async function getUser(id) {
  return fetch(`/api/users/${id}`);
}
```

if callers need cancellation but cannot provide a signal.

Better:

```js
async function getUser(id, { signal } = {}) {
  const response = await fetch(
    `/api/users/${id}`,
    { signal }
  );

  return response.json();
}
```

Now cancellation is part of the operation's contract.

## Timeout signals

Where supported:

```js
const response = await fetch("/api/data", {
  signal: AbortSignal.timeout(5000),
});
```

Check the environments you support.

## Why `Promise.race()` isn't cancellation

```js
await Promise.race([
  slowRequest(),
  timeout(),
]);
```

If `timeout()` wins, `slowRequest()` may continue.

You changed which Promise result you observe. You did not necessarily stop the operation.

## Cancellation architecture

For senior frontend systems, think about cancellation as part of ownership:

```text
component/page/task starts operation
            |
            v
        owns signal
            |
            v
passes signal through service layers
            |
            v
underlying cancellable APIs
```

When the owner no longer needs the operation, it aborts the signal.
