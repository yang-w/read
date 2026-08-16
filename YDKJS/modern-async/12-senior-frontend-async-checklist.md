# Chapter 12 — Senior Frontend Async Checklist

Use this during design and code review.

## Scheduling

- What executes synchronously before the first `await`?
- What continuation is created by each `await`?
- Could microtask ordering matter?
- Is synchronous work blocking the main thread?

## Dependencies

- Does this operation actually depend on the previous result?
- Are we creating an accidental request waterfall?
- Could independent work begin earlier?

## Promise composition

- Should this be `Promise.all()`?
- Is partial failure acceptable (`allSettled`)?
- Do we want first success (`any`) or first settlement (`race`)?
- Are we assuming `race()` cancels losing work?

## Cancellation

- Can this operation become obsolete?
- Does the underlying API support `AbortSignal`?
- Is the signal propagated through service layers?
- Who owns cancellation?

## Race conditions

- Can multiple instances of this workflow overlap?
- Can an older result overwrite newer state?
- Is the intended policy latest-wins, first-wins, ordered, or all-results?
- Are mutations idempotent or versioned?

## Collections

- Is a loop intentionally sequential?
- Is `Promise.all()` creating unsafe unlimited concurrency?
- Is someone using `forEach(async ...)` and assuming it waits?
- Would streaming/async iteration be better than loading everything?

## Errors

- Who owns this error?
- Are we swallowing a failure accidentally?
- Does this layer add useful context?
- Is retry safe and appropriate?
- Does cleanup belong in `finally`?
- Are cancellation and failure being distinguished appropriately?

## API design

Prefer:

```js
const result = await operation(options);
```

over APIs that unnecessarily own your continuation.

Expose important semantics:

```js
operation({
  signal,
  // other meaningful options
});
```

## Performance

- Is the network actually the bottleneck?
- What synchronous work happens after resolution?
- Is there a waterfall?
- Is concurrency bounded appropriately?
- Are we blocking rendering?
- Are repeated requests deduplicated/cached where appropriate?

## The five-sentence mental model

1. A **Promise** represents one eventual settlement.
2. An **async function returns a Promise**.
3. `await` suspends that function's continuation; it does not block the whole runtime.
4. Promise combinators coordinate multiple asynchronous results.
5. Senior async design is mostly about **dependencies, ownership, cancellation, failure domains, concurrency, and stale work**.

## Final example

```js
async function loadProductExperience(
  productId,
  { signal } = {}
) {
  const product = await getProduct(productId, {
    signal,
  });

  const [inventory, reviews] = await Promise.all([
    getInventory(product.id, { signal }),
    getReviews(product.id, { signal }),
  ]);

  const optionalResults = await Promise.allSettled([
    getRecommendations(product.category, { signal }),
    getRecentlyViewed({ signal }),
  ]);

  return {
    product,
    inventory,
    reviews,
    recommendations:
      optionalResults[0].status === "fulfilled"
        ? optionalResults[0].value
        : [],
    recentlyViewed:
      optionalResults[1].status === "fulfilled"
        ? optionalResults[1].value
        : [],
  };
}
```

When reviewing this code, don't merely ask whether the syntax is correct. Ask:

```text
Which dependencies are real?
Which work can overlap?
Which failures should fail the page?
What becomes stale?
Who cancels it?
What if the user navigates?
What if requests finish out of order?
What happens under slow network conditions?
What happens if there are thousands of items?
```

Those are the questions that turn async syntax knowledge into senior-level frontend engineering.
