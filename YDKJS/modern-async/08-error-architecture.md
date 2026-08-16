# Chapter 8 — Error Architecture

## Rejection and throwing meet at `await`

```js
async function load() {
  try {
    const result = await mightReject();
    return result;
  } catch (error) {
    // rejection arrives here
  }
}
```

This makes Promise rejection integrate naturally with normal `try/catch`.

## Catch at useful boundaries

Low-level function:

```js
async function fetchUser(id, { signal } = {}) {
  const response = await fetch(`/api/users/${id}`, {
    signal,
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return response.json();
}
```

Feature boundary:

```js
async function loadProfile(id, options) {
  try {
    return await fetchUser(id, options);
  } catch (error) {
    throw new ProfileLoadError(
      `Unable to load profile ${id}`,
      { cause: error }
    );
  }
}
```

UI boundary:

```js
try {
  const profile = await loadProfile(id);
  render(profile);
} catch (error) {
  renderProfileError(error);
}
```

Each layer adds context or handles a concern.

## Don't swallow failures accidentally

Dangerous:

```js
async function save() {
  try {
    await saveToServer();
  } catch (error) {
    console.error(error);
  }
}
```

The caller now sees a fulfilled Promise even though saving failed.

Sometimes that's intentional. Often it isn't.

If the caller needs to know:

```js
async function save() {
  try {
    await saveToServer();
  } catch (error) {
    console.error(error);
    throw error;
  }
}
```

## Partial failure

Suppose a page has required and optional data.

```js
const product = await getProduct(id);

const optional = await Promise.allSettled([
  getRecommendations(id),
  getRecentlyViewed(),
]);
```

Don't force optional failures into the same failure domain as required data unless the product requirements say they belong there.

## Retry selectively

Simple example:

```js
async function retry(fn, attempts = 3) {
  let lastError;

  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
}
```

Production retry policy should consider:

- whether the operation is idempotent;
- HTTP status/error category;
- exponential backoff;
- jitter;
- cancellation;
- total time budget;
- server retry hints.

Blindly retrying a bad request or non-idempotent mutation can make things worse.

## Cleanup

```js
setLoading(true);

try {
  await performOperation();
} finally {
  setLoading(false);
}
```

Use `finally` for cleanup that belongs to the lifecycle of the operation, not for hiding errors.
