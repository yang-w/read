# Chapter 7 — Async Collections and Streams

## Sequential collection processing

```js
for (const item of items) {
  await process(item);
}
```

This is intentionally sequential.

Use when:

- order matters;
- operations depend on earlier operations;
- rate limiting is required;
- processing must be serialized.

## Concurrent collection processing

```js
await Promise.all(
  items.map(item => process(item))
);
```

Use when operations are independent and the concurrency level is safe.

## Why `forEach(async ...)` is dangerous

```js
items.forEach(async item => {
  await process(item);
});

console.log("done");
```

`forEach()` does not await the returned Promises.

`"done"` can execute before processing finishes.

Use:

```js
for (const item of items) {
  await process(item);
}
```

or:

```js
await Promise.all(
  items.map(item => process(item))
);
```

## `map(async ...)` creates Promises

```js
const results = items.map(async item => {
  return process(item);
});
```

`results` is approximately:

```text
Promise[]
```

not resolved values.

Use:

```js
const results = await Promise.all(
  items.map(item => process(item))
);
```

## Async iterables

A Promise represents one eventual settlement.

An async iterable represents values arriving over time.

```js
async function* generate() {
  yield await getFirst();
  yield await getSecond();
  yield await getThird();
}
```

Consume:

```js
for await (const value of generate()) {
  console.log(value);
}
```

## Pagination example

```js
async function* getAllProducts({ signal } = {}) {
  let url = "/api/products";

  while (url) {
    const response = await fetch(url, { signal });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const page = await response.json();

    for (const product of page.items) {
      yield product;
    }

    url = page.nextPage;
  }
}
```

Consumer:

```js
for await (const product of getAllProducts()) {
  renderProduct(product);
}
```

The consumer doesn't need to manage page boundaries.

## Streams vs "load everything"

A senior-level question is:

> Do I actually need the entire result before I can begin useful work?

If not, streaming or async iteration may improve:

- perceived performance;
- memory usage;
- incremental rendering;
- cancellation behavior.

Do not default to `Promise.all()` for datasets that are naturally streams.
