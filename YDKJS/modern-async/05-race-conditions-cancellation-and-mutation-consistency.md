# Chapter 5 — Race Conditions, Cancellation, and Mutation Consistency

This chapter is organized by **use case → problem → fixes**.

---

## 1. Search / Autocomplete

### The Problem

Autocomplete is a classic **read** race.

A **read** means the frontend is retrieving data rather than intentionally changing server state. Easy examples:

```text
GET /api/search?q=iphone
GET /api/products/123
GET /api/users/alice
GET /api/recommendations
```



The user types:

```text
i
ip
iph
ipho
iphone
```

A naive implementation could start a request for every keystroke:

```text
search("i")
search("ip")
search("iph")
search("ipho")
search("iphone")
```

The problem is that network completion order is not guaranteed.

For example:

```text
request("iph")      ----------------------> response
request("iphone")       --------> response
```

The newer `"iphone"` request finishes first.

Then the older `"iph"` request finishes later.

If both update the UI:

```js
const results = await search(query);
render(results);
```

the old `"iph"` result can overwrite the newer `"iphone"` result.

There are **three separate problems** here:

```text
1. We may be starting too many searches.
2. An old search may still be running after it becomes obsolete.
3. An old result may arrive after the new result.
```

These need different fixes.

---

### Fixes

#### Fix 1 — Debounce Before Starting the Search

For autocomplete, **debounce** is usually the first optimization.

Debounce means:

> Wait until the user stops typing for a short period before starting the search.

Instead of:

```text
i       → request
ip      → request
iph     → request
ipho    → request
iphone  → request
```

we get:

```text
i
ip
iph
ipho
iphone
       ↓
   300ms silence
       ↓
search("iphone")
```

A simple debounce:

```js
function debounce(fn, wait) {
  let timer;

  return (...args) => {
    clearTimeout(timer);

    timer = setTimeout(() => {
      fn(...args);
    }, wait);
  };
}
```

Then connect it to an input:

```html
<input
  id="search"
  type="search"
  placeholder="Search products..."
/>
```

```js
const searchInput = document.querySelector("#search");

const debouncedSearch = debounce(
  query => performSearch(query),
  300
);

searchInput.addEventListener("input", event => {
  debouncedSearch(event.target.value);
});
```

### When debounce is a good fit

Use debounce when you care about the **final state after activity stops**:

- autocomplete;
- search;
- filtering;
- validation after typing;
- autosave after typing pauses.

---

#### Fix 2 — Cancel an Obsolete In-Flight Search

Debounce prevents many requests from starting.

But what if a search is **already in flight** when a newer search begins?

Example:

```text
search("iphone")
       |
       | request still running
       |
user changes query
       |
       v
search("iphone 17")
```

If the old search is no longer useful, cancellation can stop it when the underlying API supports cancellation.

### `AbortController`

```js
let searchController;

async function performSearch(query) {
  searchController?.abort();

  searchController = new AbortController();

  try {
    const response = await fetch(
      `/api/search?q=${encodeURIComponent(query)}`,
      {
        signal: searchController.signal,
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const results = await response.json();

    renderSearchResults(results);
  } catch (error) {
    if (error.name === "AbortError") {
      return;
    }

    console.error("Search failed:", error);
  }
}
```

The flow is:

```text
old search
    |
    | still running
    |
new search starts
    |
    +── controller.abort()
    |
    +── new controller
    |
    +── new fetch
```

### Why `AbortController` works

```js
const controller = new AbortController();

fetch("/api/search", {
  signal: controller.signal,
});
```

connects the fetch to the controller.

Later:

```js
controller.abort();
```

signals cancellation.

The important distinction is:

```text
stop caring about a Promise
        ≠
stop the underlying operation
```

A Promise represents an eventual outcome. Cancellation is a separate capability of the underlying API.

---

#### Fix 3 — Ignore Stale Results with Request Identity

Cancellation is useful, but cancellation does not guarantee an old operation cannot finish.

For example, an old request may finish just before `abort()` happens.

You can also protect the UI with a request ID:

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

Suppose:

```text
"iph"     → requestId 1
"iphone"  → requestId 2
```

If `"iphone"` finishes first:

```text
2 === latestRequestId
→ render
```

If `"iph"` finishes later:

```text
1 !== latestRequestId
→ ignore
```

This does **not** cancel the old request.

It prevents stale work from committing to the current UI.

---

### Complete Example — Debounce + Search + Cancellation + Request Identity

For autocomplete, a robust mental model is:

```text
input
  ↓
debounce
  ↓
cancel previous request
  ↓
start latest request
  ↓
ignore stale result if necessary
  ↓
render
```

In code:

```js
let searchController;
let latestRequestId = 0;

function debounce(fn, wait) {
  let timer;

  return (...args) => {
    clearTimeout(timer);

    timer = setTimeout(() => {
      fn(...args);
    }, wait);
  };
}

async function performSearch(query) {
  const requestId = ++latestRequestId;

  searchController?.abort();
  searchController = new AbortController();

  try {
    const response = await fetch(
      `/api/search?q=${encodeURIComponent(query)}`,
      {
        signal: searchController.signal,
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const results = await response.json();

    // Safety guard: don't commit stale results.
    if (requestId !== latestRequestId) {
      return;
    }

    renderSearchResults(results);
  } catch (error) {
    if (error.name === "AbortError") {
      return;
    }

    console.error("Search failed:", error);
  }
}

const debouncedSearch = debounce(
  performSearch,
  300
);

document
  .querySelector("#search")
  .addEventListener("input", event => {
    debouncedSearch(event.target.value);
  });
```

The mechanisms have different jobs:

```text
debounce
→ reduce unnecessary requests

AbortController
→ cancel obsolete in-flight requests

requestId
→ prevent stale results from committing
```

Also note:

> A search `GET` is normally designed to be idempotent, but that is a separate concept. Idempotency asks what happens if an operation is repeated. Cancellation asks whether obsolete work should continue.

---

---

## 2. Component-Owned Page Data

### The Problem

A component starts a read, but its effect/component lifecycle can end before the request finishes.

### Fix — Abort During Lifecycle Cleanup

Sometimes a React component starts its own request.

```tsx
useEffect(() => {
  const controller = new AbortController();

  async function loadProducts() {
    try {
      const response = await fetch("/api/products", {
        signal: controller.signal,
      });

      const products = await response.json();

      setProducts(products);
    } catch (error) {
      if (error.name === "AbortError") {
        return;
      }

      setError(error);
    }
  }

  loadProducts();

  return () => {
    controller.abort();
  };
}, []);
```

The important part:

```tsx
return () => {
  controller.abort();
};
```

is the **`useEffect` cleanup function**.

It is not the component's JSX return.

The lifecycle is:

```text
component/effect becomes active
        ↓
start request
        ↓
component/effect is cleaned up
        ↓
controller.abort()
```

This makes sense when the component owns the request.

---

---

## 3. Router-Owned Route Data

### The Problem

A route loader may still be loading data for an old navigation when the user navigates to another route or route parameter.

### Fix — Let the Router/Navigation Own the Request Lifecycle

Your application may instead use route loaders.

For example:

```text
/usr/:username
```

matches:

```text
/usr/alice
/usr/bob
/usr/charlie
```

A route component might look like:

```tsx
export default function ProfilePage() {
  const {
    profile,
    tabs,
  } = useLoaderData<typeof loader>();

  return (
    <div className="profile-page">
      <h1>{profile.username}</h1>
    </div>
  );
}
```

The component is not fetching the data here.

The flow is:

```text
URL/navigation
      ↓
router
      ↓
loader
      ↓
API/data work
      ↓
loader result
      ↓
useLoaderData()
      ↓
ProfilePage renders
```

Now imagine:

```text
current route:
/usr/alice
```

The router starts loading Alice.

Before it finishes, the user clicks a link to:

```text
/usr/bob
```

The navigation changes:

```text
/usr/alice
    |
    +---- loader/request A ---------------->

user clicks /usr/bob

/usr/bob
    |
    +---- loader/request B -------------->
```

A router/data-loading system can associate cancellation with the **navigation lifecycle** and invalidate obsolete work from the old navigation.

The ownership distinction is:

```text
component fetch
→ component/effect owns the request

route loader
→ router/navigation system owns the request
```

Your actual router/framework determines exactly how cancellation is exposed.

---

### Supporting Fix — Propagate `AbortSignal` Through Service Layers

If a route, page, or task owns cancellation, service functions should allow the signal to pass through.

Less flexible:

```js
async function getUser(id) {
  return fetch(`/api/users/${id}`);
}
```

More flexible:

```js
async function getUser(id, { signal } = {}) {
  const response = await fetch(
    `/api/users/${id}`,
    { signal }
  );

  return response.json();
}
```

Usage:

```js
const controller = new AbortController();

getUser(123, {
  signal: controller.signal,
});

// Later:
controller.abort();
```

Architecture:

```text
page / route / task
        ↓
owns controller
        ↓
passes signal
        ↓
service
        ↓
fetch()
```

Cancellation becomes part of the operation's contract.

---

### Supporting Fix — Timeout Long-Running Reads

Where supported:

```js
const response = await fetch("/api/data", {
  signal: AbortSignal.timeout(5000),
});
```

Conceptually:

```text
request
  |
  +── finishes before 5s → success
  |
  +── exceeds 5s → abort
```

---

### Important — `Promise.race()` Is Not Cancellation

This:

```js
await Promise.race([
  slowRequest(),
  timeout(),
]);
```

does not necessarily cancel `slowRequest()` if `timeout()` wins.

```text
Promise.race()
→ chooses which Promise result you observe

AbortController
→ can tell a cancellable operation to stop
```

These are separate concepts.

---

---

## 4. Autosave / Successive Editor Snapshots

### The Problem

A mutation race requires more care because the operation may change server state.

Suppose an editor produces successive snapshots:

```js
A = { name: "Alice" };

B = { name: "Alicia" };

C = {
  name: "Alicia",
  phone: "555-1234",
};
```

For autosave, these may simply mean:

```text
A = old desired state
B = newer desired state
C = latest desired state
```

In that case, you usually do **not** want:

```text
A → B → C
```

You often want:

```text
A ignored
B ignored
C saved
```

A common solution is:

```text
debounce
+
cancellation when safe
+
latest-result protection
```

This is different from a queue because old snapshots may have no independent business meaning.

---

### Fix — Latest-State-Wins

For snapshots where only the newest desired state matters:

```text
debounce
+
cancel obsolete work when safe
+
request identity / relevance protection
```

Do not automatically queue every intermediate snapshot.

---

## 5. Meaningful Ordered Commands

### The Problem

Now consider:

```text
ADD_ITEM
REMOVE_ITEM
APPLY_DISCOUNT
```

These are not snapshots.

They are distinct commands.

Discarding one can change the meaning of later operations.

You may need:

```text
ADD_ITEM
    ↓
REMOVE_ITEM
    ↓
APPLY_DISCOUNT
```

This is where **serialization** can be appropriate.

---

### Fix 1 — Serialize Inside One Workflow

Serialization means:

> B must not execute until A finishes.

Inside one workflow, plain `await` is enough:

```js
async function workflow() {
  const a = await doA();

  const b = await doB(a);

  return b;
}
```

Execution:

```text
A
↓
B
```

If B depends on the result of A, this is usually the clearest solution.

---

### Fix 2 — Queue Work Submitted by Independent Callers

Now imagine an autosave/command system, offline queue, or ordered mutation pipeline where multiple callers can submit operations independently:

```js
enqueueSave(updateA);
enqueueSave(updateB);
enqueueSave(updateC);
```

Nobody is doing:

```js
await A;
await B;
await C;
```

in one central workflow.

You need a shared queue to preserve order.

---

#### Promise Queue

```js
let saveQueue = Promise.resolve();

function enqueueSave(update) {
  const next = saveQueue.then(() => {
    return api.saveDocument(update);
  });

  // Recover only the internal scheduling chain.
  // This keeps future work from being blocked by one failure.
  saveQueue = next.catch(() => {});

  // Expose the real outcome of THIS save to the caller.
  return next;
}
```

The two Promises have different responsibilities:

```text
next
→ this particular save's actual success/failure

saveQueue
→ the internal tail used to schedule future saves
```

Example:

```js
enqueueSave("A").catch(error => {
  console.error("A failed:", error);
});

enqueueSave("B").then(() => {
  console.log("B finished");
});
```

If A fails:

```text
A
↓
X Error("Save A failed")
↓
caller receives A's rejection

internal queue catch
↓
queue recovers
↓
B can run
```

The empty internal catch:

```js
saveQueue = next.catch(() => {});
```

is intentional. Its purpose is **queue recovery**, not error reporting.

---

#### Why `next` Exists

You could technically write:

```js
saveQueue = saveQueue.then(() => {
  return api.saveDocument(update);
});
```

but then the caller has no Promise representing **this particular operation**.

With:

```js
const next = saveQueue.then(() => {
  return api.saveDocument(update);
});

saveQueue = next.catch(() => {});

return next;
```

you have:

```text
next
→ Promise for THIS operation

saveQueue
→ Promise for FUTURE scheduling
```

That allows:

```js
await enqueueSave(update);
```

or:

```js
enqueueSave(update).catch(handleError);
```

while the internal queue remains usable after a failure.

---

---

## 6. Duplicate or Retried Mutations

### The Problem

Ask:

> What happens if the same logical mutation is sent twice?

This is the question behind idempotency.

### Idempotent operations

These are commonly designed to be idempotent:

```http
GET /users/123
```

```http
PUT /users/123
{
  "name": "Alice"
}
```

```http
DELETE /users/123
```

The exact HTTP response can differ on a repeat, but the intended final resource state is the same.

### Non-idempotent example

A typical:

```http
POST /orders
```

may create:

```text
request 1 → Order #100
request 2 → Order #101
```

Repeating the operation changes the result.

---

### Fix — Prefer Idempotent Mutation Semantics

Suppose:

```js
await api.toggleFavorite(productId);
```

Starting from:

```text
favorite = false
```

First call:

```text
false → true
```

Second call:

```text
true → false
```

A duplicate request or retry can therefore reverse the result.

### Fix: explicit desired state

```js
await api.setFavorite(productId, true);
```

Now:

```text
false → true
true  → true
true  → true
```

Repeated `setFavorite(true)` requests converge to the same intended state.

This does not prevent:

```text
setFavorite(true)
setFavorite(false)
```

from racing. Those are different desired states.

---

---

## 7. Creating an Order Safely Across Retries

### The Problem and Fix — Idempotency Key

Suppose:

```js
await createOrder(cart);
```

The frontend sends:

```http
POST /orders
```

The server creates the order, but the response is lost.

Frontend sees:

```text
timeout
```

and retries.

Without an idempotency key:

```text
POST /orders → Order #5001
POST /orders → Order #5002
```

Potential duplicate order.

### Fix: Idempotency Key

Generate one key for **one logical checkout attempt**:

```js
async function createOrder(cart) {
  const idempotencyKey = crypto.randomUUID();

  return sendOrder(cart, idempotencyKey);
}

async function sendOrder(cart, idempotencyKey) {
  const response = await fetch("/api/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Idempotency-Key": idempotencyKey,
    },
    body: JSON.stringify(cart),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return response.json();
}
```

If the same logical operation is retried, reuse the same key:

```text
checkout attempt
      |
      v
key = abc123
      |
      +---- request fails/response lost
      |
      +---- retry with SAME key
```

Conceptually, the backend keeps durable knowledge equivalent to:

```text
abc123 → already processed → Order #5001
```

First request:

```text
abc123
→ not seen
→ create Order #5001
→ store the key/result
```

Retry:

```text
abc123
→ already seen
→ do not create another order
→ return the existing result
```

The backend may use a database, cache, or another durable store rather than a literal JavaScript `Map`.

---

---

## 8. Multiple Clients Editing the Same Resource

### The Problem and Fix — Optimistic Concurrency / Versioning

Optimistic concurrency/versioning solves a different problem:

> What if another client changed the resource after I loaded it?

This can happen with:

- two users;
- two tabs;
- two devices;
- another service/client.

Server returns:

```json
{
  "id": 123,
  "name": "Alice",
  "version": 7
}
```

Two clients both read version 7:

```text
SERVER
Alice / version 7
   /              \
  /                \
User A             User B
version 7          version 7
```

User A updates first:

```js
await api.updateUser({
  id: 123,
  name: "Alicia",
  version: 7,
});
```

Server accepts it and increments the resource:

```text
Alicia / version 8
```

User B still has version 7 and tries:

```js
try {
  await api.updateUser({
    id: 123,
    name: "Alice Smith",
    version: 7,
  });
} catch (error) {
  if (error.status === 409) {
    // Reload, reconcile, or ask the user to resolve the conflict.
  } else {
    throw error;
  }
}
```

Server sees:

```text
incoming version = 7
current version  = 8
```

and rejects the stale update.

The frontend passes the version, but the **server must enforce the rule**.

---

---

# Decision Map

### Search/autocomplete

```text
Problem:
too many requests + obsolete in-flight requests
      ↓
Fix:
debounce
+
AbortController
+
request identity as a final stale-result guard
```

### Continuous UI events

```text
Problem:
scroll/resize/pointer events fire continuously
      ↓
Fix:
throttle
```

### Obsolete page/component read

```text
Problem:
owner no longer needs the result
      ↓
Fix:
AbortController
```

### Stale read result

```text
Problem:
old result may arrive late
      ↓
Fix:
request identity / version / relevance check
```

### Latest editor snapshot wins

```text
Problem:
A → B → C are successive desired states
      ↓
Fix:
latest-state-wins
+
debounce
+
cancellation when safe
+
request identity/relevance protection
```

### Ordered business commands

```text
Problem:
A must happen before B
      ↓
Fix:
serialize with await
```

### Ordered work submitted by independent callers

```text
Problem:
A, B, C are submitted independently but must execute in order
      ↓
Fix:
queue
(e.g. Promise-chain queue)
```

### Duplicate/retry-safe mutation

```text
Problem:
same logical operation may be repeated
      ↓
Fix:
idempotent API
```

### Non-idempotent create/retry

```text
Problem:
POST/create may be repeated after timeout or retry
      ↓
Fix:
idempotency key
```

### Two clients modify the same resource

```text
Problem:
client has stale state
      ↓
Fix:
optimistic concurrency / versioning
+
server-side conflict detection
```

### Timeout

```text
Problem:
operation should stop after a time budget
      ↓
Fix:
AbortSignal.timeout()
or another cancellation mechanism
```

### `Promise.race()` timeout misconception

```text
Problem:
thinking race cancels the loser
      ↓
Fix:
use actual cancellation such as AbortSignal
```

---

---

# Debounce vs. Throttle

Debounce and throttle control **how often frontend work starts**. They are not themselves race-condition solutions.

The autocomplete example earlier uses **debounce + cancellation + request identity** because each mechanism solves a different problem.

### Debounce

> Wait until activity stops for a period before running.

Typical uses:

- autocomplete/search;
- filtering after typing;
- validation after typing;
- autosave after typing pauses.

```text
events:
i  ip  iph  ipho  iphone
                       |
                  wait 300ms
                       |
                      run
```

```js
function debounce(fn, wait) {
  let timer;

  return (...args) => {
    clearTimeout(timer);

    timer = setTimeout(() => {
      fn(...args);
    }, wait);
  };
}
```

### Throttle

> While activity continues, run at most once per interval.

Typical uses:

- scroll;
- resize;
- pointer/mouse movement;
- dragging;
- other continuous high-frequency events.

```js
function throttle(fn, wait) {
  let lastRun = 0;

  return (...args) => {
    const now = Date.now();

    if (now - lastRun < wait) {
      return;
    }

    lastRun = now;
    fn(...args);
  };
}
```

Full example:

```js
const handleScroll = throttle(() => {
  updateScrollPosition();
}, 200);

window.addEventListener("scroll", handleScroll);
```

If scroll events happen continuously:

```text
events:
████████████████████████████████

throttled work:
█          █          █          █
```

### Quick Comparison

```text
DEBOUNCE
"Wait until activity stops."
→ search/autocomplete
→ validation after typing
→ autosave after typing pauses

THROTTLE
"Run at most once per interval."
→ scroll
→ resize
→ pointer movement
→ dragging
```

| Technique | Behavior | Good examples |
|---|---|---|
| Debounce | Wait for activity to stop, then run | Search, autocomplete, validation, autosave |
| Throttle | Keep running during activity, but no more than once per interval | Scroll, resize, pointer movement, drag |

---

# Senior Review Checklist

For reads:

1. Is this result still relevant when it arrives?
2. Can this operation become obsolete?
3. Should we debounce before starting it?
4. Should we throttle how often it starts?
5. Can we cancel it?
6. Does the API actually support cancellation?
7. Do we need a stale-result guard even if cancellation is used?
8. Who owns the request: component, route, page, or task?

For mutations:

1. Is this a snapshot or a command?
2. Does every operation matter?
3. Does ordering matter?
4. Can an old mutation overwrite a newer state?
5. Is cancellation semantically safe?
6. Can the operation be retried?
7. Is it idempotent?
8. Does it need an idempotency key?
9. Could another tab/client modify the same resource?
10. Does the server enforce version/conflict rules?

The central lesson:

> **`async`/`await` controls asynchronous flow. It does not, by itself, define relevance, cancellation, ordering, idempotency, or data consistency.**

---
