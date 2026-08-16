# Chapter 5 — Race Conditions in Frontend Applications

## Why frontend races are common

Frontend applications react to nondeterministic inputs:

- users typing;
- navigation;
- repeated clicks;
- network latency;
- component lifecycle changes;
- cache hits vs network misses;
- multiple data sources.

The JavaScript thread may be single-threaded while your **logical operations are concurrent**.

## Classic stale-search race

```js
async function search(query) {
  const response = await fetch(
    `/api/search?q=${encodeURIComponent(query)}`
  );

  return response.json();
}
```

The user types:

```text
"iph"
"iphone"
```

Request order:

```text
request("iph")      ----------------------> response
request("iphone")       --------> response
```

The newer request may finish first.

If both blindly update UI:

```js
const results = await search(query);
render(results);
```

the old `"iph"` response may overwrite the newer `"iphone"` UI.

## Strategy 1: request identity

```js
let latestRequestId = 0;

async function performSearch(query) {
  const requestId = ++latestRequestId;

  const results = await search(query);

  if (requestId !== latestRequestId) {
    return;
  }

  render(results);
}
```

This doesn't cancel old work. It prevents stale results from committing.

## Strategy 2: cancellation

```js
let controller;

async function performSearch(query) {
  controller?.abort();
  controller = new AbortController();

  const response = await fetch(
    `/api/search?q=${encodeURIComponent(query)}`,
    { signal: controller.signal }
  );

  const results = await response.json();

  render(results);
}
```

Now obsolete work can be aborted if the underlying API supports it.

## Strategy 3: model desired semantics explicitly

Sometimes "latest wins" is correct.

Sometimes you need:

```text
first wins
all must complete
preserve submission order
deduplicate equivalent requests
ignore duplicate clicks
serialize mutations
```

Do not solve every race with the same technique.

## Mutation races

Two updates:

```js
saveName("Alice");
saveName("Alicia");
```

If both are in flight, which state should the UI/server end with?

The answer is a product/data consistency decision, not merely a JavaScript syntax question.

Potential approaches:

- serialize mutations;
- version requests;
- use optimistic concurrency control;
- make mutations idempotent;
- assign request IDs;
- cancel obsolete operations when cancellation is semantically safe.

## Senior review question

Whenever you see:

```js
const result = await request();
setState(result);
```

ask:

> Is this result still relevant when it arrives?

That question catches a large class of frontend async bugs.
