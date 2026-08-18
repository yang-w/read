# Chapter 4 — Concurrency and Promise Combinators

## Sequential vs concurrent

Sequential:

```js
const user = await getUser();
const products = await getProducts();
```

If independent, the second operation starts unnecessarily late.

Concurrent:

```js
const [user, products] = await Promise.all([
  getUser(),
  getProducts(),
]);
```

The senior-level skill is not memorizing `Promise.all()`. It is identifying **true dependencies**.

## `Promise.all()` — all required

```js
const [product, inventory, reviews] = await Promise.all([
  getProduct(id),
  getInventory(id),
  getReviews(id),
]);
```

Use when all results are required.

If one rejects, the aggregate Promise rejects.

Important: rejection does not magically cancel the remaining underlying operations.

## `Promise.allSettled()` — every outcome matters

```js
const results = await Promise.allSettled([
  loadRecommendations(),
  loadReviews(),
  loadRecentlyViewed(),
]);
```

Useful when optional UI regions can fail independently.

```js
for (const result of results) {
  if (result.status === "fulfilled") {
    // result.value
  } else {
    // result.reason
  }
}
```

## `Promise.any()` — first success

```js
const data = await Promise.any([
  requestReplicaA(),
  requestReplicaB(),
  requestReplicaC(),
]);
```

Rejections are tolerated until all inputs reject.

Use when multiple alternatives can provide equivalent success.

## `Promise.race()` — first settlement

```js
const result = await Promise.race([
  requestA(),
  requestB(),
]);
```

The first fulfillment **or rejection** determines the result.

Do not confuse `race()` with "first successful result"; that's `any()`.

## Promise combinator table

| API | Resolves when | Rejects when | Typical use |
|---|---|---|---|
| `Promise.all()` | all fulfill | first rejection | required independent work |
| `Promise.allSettled()` | all settle | aggregate itself doesn't reject due to an input rejection | partial/optional work |
| `Promise.any()` | first fulfillment | all reject | redundant sources |
| `Promise.race()` | first settlement if fulfillment | first settlement if rejection | first outcome / orchestration |

## Dependency graph example

Suppose a page needs:

1. user;
2. orders for that user;
3. recommendations for that user;
4. order details for every order.

```js
async function loadPage(userId) {
  try {
    const user = await getUser(userId);

    const [orders, recommendations] = await Promise.all([
      getOrders(user.id),
      getRecommendations(user.id),
    ]);

    const orderDetails = await Promise.all(
      orders.map(order => getOrderDetails(order.id))
    );

    return {
      user,
      orders: orderDetails,
      recommendations,
    };
  } catch (error) {
    console.error("Failed to load page:", error);

    // Either handle it here, or rethrow it
    throw error;
  }
}
```
Suppose:

```javascript
async function getRecommendations() {
  throw new Error("Recommendation API failed");
}
```
Then this:

```javascript
const [orders, recommendations] = await Promise.all([
  getOrders(user.id),
  getRecommendations(user.id),
]);
```

causes Promise.all() to reject.
Because you're awaiting that Promise, the rejection behaves like a thrown error:

```javascript
try {
  await Promise.all([
    getOrders(user.id),
    getRecommendations(user.id),
  ]);
} catch (error) {
  // lands here
  console.log(error.message);
  // "Recommendation API failed"
}
```
The shape is:

```text
getUser
   |
   +-------------------+
   |                   |
getOrders      getRecommendations
   |
   +----+----+----+
   |    |    |    |
 detail detail detail ...
```

## Bounded concurrency

This can be dangerous:

```js
await Promise.all(
  tenThousandItems.map(processItem)
);
```

Concurrency is not free.

Potential constraints:

- browser connection limits;
- backend capacity;
- rate limits;
- memory;
- database pressure;
- CPU usage;
- third-party quotas.

At scale, use a concurrency limiter, queue, batching strategy, or worker pool.

> "Can run concurrently" does not mean "should all start simultaneously."
