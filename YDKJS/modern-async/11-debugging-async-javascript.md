# Chapter 11 — Debugging Async JavaScript

## First question: what is the actual order?

When async code behaves strangely, write down:

```text
1. what runs synchronously?
2. what Promise is created?
3. where does execution suspend?
4. what can happen while suspended?
5. what event settles the Promise?
6. what state may have changed before continuation?
```

This is often more useful than staring at `await`.

## Missing `await`

```js
const user = getUser();

console.log(user.name);
```

If `getUser()` is async, `user` is a Promise.

Inspect function contracts rather than guessing from names.

## Forgotten Promise

```js
saveData();
navigateAway();
```

Was fire-and-forget intentional?

If the operation matters:

```js
await saveData();
navigateAway();
```

If fire-and-forget is intentional, make ownership/error handling explicit.

## Unhandled rejection

```js
async function run() {
  throw new Error("boom");
}

run();
```

The returned Promise rejects. If nobody observes it, you can get an unhandled rejection.

At boundaries, decide who owns failures.

## Race debugging

Given:

```js
const result = await request(id);
setState(result);
```

log or inspect:

```text
request identity
start time
finish time
current route/query/version
whether result was still relevant
```

Races often look like random network failures but are actually stale commits.

## Network waterfall debugging

Use browser network tooling to ask:

- Did request B truly depend on A?
- Why did it start later?
- Was JavaScript waiting unnecessarily?
- Was data fetching split across layers/components?
- Was a cache lookup blocking network startup?
- Did rendering delay the request?

## Async stack traces

Modern developer tools often preserve useful async stack context. Read the entire chain rather than only the final callback frame.

## Reproduce timing bugs

Artificial latency can expose races hidden by fast local development.

Useful tests include:

- slow network;
- failed request;
- response reordering;
- rapid navigation;
- repeated clicks;
- cancellation;
- component unmount/remount;
- cache hit vs cache miss.

Senior async debugging means deliberately testing unfavorable timing, not only the happy path.
