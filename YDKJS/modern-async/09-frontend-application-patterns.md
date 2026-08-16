# Chapter 9 — Frontend Application Patterns

## Pattern 1: required + optional page data

```js
async function loadProductPage(productId, { signal } = {}) {
  const product = await getProduct(productId, { signal });

  const [inventory, reviews] = await Promise.all([
    getInventory(product.id, { signal }),
    getReviews(product.id, { signal }),
  ]);

  const [recommendations] = await Promise.allSettled([
    getRecommendations(product.category, { signal }),
  ]);

  return {
    product,
    inventory,
    reviews,
    recommendations:
      recommendations.status === "fulfilled"
        ? recommendations.value
        : [],
  };
}
```

This models different failure domains instead of treating every request identically.

## Pattern 2: form submission

```js
async function submitForm(values) {
  setSubmitting(true);

  try {
    const result = await api.save(values);
    showSuccess(result);
  } catch (error) {
    showSubmissionError(error);
  } finally {
    setSubmitting(false);
  }
}
```

Questions to ask:

- Can the user submit twice?
- Should duplicate submissions be disabled, deduplicated, or idempotent?
- What happens if navigation occurs during submission?
- Is retry safe?

## Pattern 3: search

```js
let controller;

async function search(query) {
  controller?.abort();
  controller = new AbortController();

  const response = await fetch(
    `/api/search?q=${encodeURIComponent(query)}`,
    { signal: controller.signal }
  );

  return response.json();
}
```

Cancellation handles obsolete work. You may still need debouncing depending on product behavior.

## Pattern 4: request deduplication

If multiple consumers request the same resource simultaneously, consider sharing the in-flight Promise.

```js
const inflight = new Map();

function getUser(id) {
  if (inflight.has(id)) {
    return inflight.get(id);
  }

  const promise = fetchUser(id)
    .finally(() => {
      inflight.delete(id);
    });

  inflight.set(id, promise);

  return promise;
}
```

Now simultaneous consumers can share one request.

Production implementations need to think about cancellation ownership and caching separately.

## Pattern 5: optimistic UI

Optimistic UI intentionally separates:

```text
desired local state
        |
        v
immediate UI update
        |
        v
server mutation
       / \
      /   \
 success  failure
           |
           v
       rollback/reconcile
```

Example:

```js
async function toggleFavorite(item) {
  const previous = item.favorite;

  updateLocalFavorite(item.id, !previous);

  try {
    await saveFavorite(item.id, !previous);
  } catch (error) {
    updateLocalFavorite(item.id, previous);
    throw error;
  }
}
```

Now add concurrency: what if the user toggles twice before the first request finishes? That requires explicit mutation ordering/version semantics.

## Pattern 6: avoid waterfalls

Potential waterfall:

```js
const config = await getConfig();
const user = await getUser();
const flags = await getFlags();
```

If these are independent:

```js
const [config, user, flags] = await Promise.all([
  getConfig(),
  getUser(),
  getFlags(),
]);
```

Waterfalls often hide across component/service boundaries, not just adjacent lines.
