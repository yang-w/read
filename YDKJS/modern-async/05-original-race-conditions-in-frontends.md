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

  // response.json() returns a promise, needs await if need manipulate data inside function
  return response.json(); 
}
const data = await search("iphone");
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
  // Instead of letting the old request finish, cancel it when a new search starts.
  controller?.abort();
  controller = new AbortController();

  try {
    const response = await fetch(
      `/api/search?q=${encodeURIComponent(query)}`,
      { signal: controller.signal }
    );

    const results = await response.json();

    render(results);
  } catch (error) {
    if (error.name === "AbortError") {
      // Old request was intentionally cancelled.
      return;
    }

    throw error;
  }
}
```
Now obsolete work can be aborted if the underlying API supports it.
For a search UI, cancellation is often desirable because you don't need the old request anymore.

## Strategy 3: both cancellation and request identity

Cancellation doesn't eliminate the need to think about stale results in every architecture. Not every async operation is cancellable, and cancellation can race with completion.
For example, imagine:

```
old request finishes
        ↓
abort() happens just after
```
The old request may already have completed. Cancellation can't undo something that already happened.
That's why a robust architecture may use both cancellation and request identity:

```javascript
let controller;
let latestRequestId = 0;

async function performSearch(query) {
  controller?.abort();

  const requestId = ++latestRequestId;

  controller = new AbortController();

  try {
    const response = await fetch(
      `/api/search?q=${encodeURIComponent(query)}`,
      {
        signal: controller.signal,
      }
    );

    const results = await response.json();

    if (requestId !== latestRequestId) {
      return;
    }

    render(results);
  } catch (error) {
    if (error.name === "AbortError") {
      return;
    }

    throw error;
  }
}
```
Now you have two protections:

```
AbortController
    ↓
try to stop obsolete work

requestId
    ↓
don't commit stale results
```

## Strategy 4: model desired semantics explicitly

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
// expecting final state to be "Alicia"
```

If both are in flight, which state should the UI/server end with?

Imagine the network behaves like this:

```
saveName("Alice")   ────────────────► finishes at 2s
saveName("Alicia")  ─────► finishes at 1s
```
The second request finishes first. Then:
1. "Alicia" gets saved
2. "Alice" gets saved later

Final server state: "Alice"
That's wrong from the user's perspective.

Potential approaches:
- **Assign Request IDs**

  ```javascript
  let latestRequestId = 0;

  async function saveName(name) {
    const requestId = ++latestRequestId;

    const result = await api.saveName(name);

    if (requestId !== latestRequestId) {
      return;
    }

    updateUI(result);
  }
  ```
  Alice   → requestId 1, Alicia  → requestId 2. 
  If Alice finishes after Alicia:

  ```
  Alice:
  requestId       = 1
  latestRequestId = 2

  1 !== 2
  → ignore
  ```
  So the UI won't be overwritten by the stale response.
  But

  > - Request ID does not necessarily protect the server. (Server might end up with "Alice")
  > - Request IDs are often a client-side stale-result protection, not a complete data-consistency solution.
- **Serialize Mutations**
  If the operations must happen in order, don't allow them to be in flight simultaneously.

  **Serialization**: Only allow the operations to execute one at a time, in order.

  ```javascript
  async function publishDocument() {
    const metadata = await uploadMetadata(); // A

    const file = await uploadFile(metadata.id); // B

    const published = await publish(file.id); // C

    return published;
  }
  ```
  - This is serialized execution: A must execute before B

  **Queue**
  Now imagine multiple callers submit A/B/C but they must execute in order

  ```javascript
  saveName("Alice");
  saveName("Alicia");
  saveName("Bob");
  ```
  There is no single function awaiting the previous operation.
  So you need shared state:

  ```javascript
  let saveQueue = Promise.resolve();
  ```

  Then
  ```javascript
  function saveName(name) {
    saveQueue = saveQueue
      .catch(error => {
        console.error("Previous mutation failed:", error);
      })
      .then(() => api.saveName(name));

    return saveQueue;
  }
  ```

  Another ver

  ```javascript
  let saveQueue = Promise.resolve();

  function saveName(name) {
    const next = saveQueue.then(() => {
      return api.saveName(name);
    });

    saveQueue = next.catch(() => {
      // intentionally empty
      // Convert a rejected Promise into a fulfilled Promise so the queue can continue.
    });

    return next;
  }
  ```
  Now callers can submit mutations independently:

  Usage:

  ```javacript
  saveName("A").catch(error => {
    console.error("A failed:", error);
  });
  saveName("B").then(() => {
    console.log("B finishes");
  });
  saveName("C");
  ```

  ```
  call 1 → A
  call 2 → B
  call 3 → C
  ```
  but actual execution is A -> B -> C

  ```
  Promise.resolve()
    .then(() => api.saveName("A"))
    .then(() => api.saveName("B"))
  ```

  If A failed, B still should happen.

  Suppose

  ```javascript
  async function apiSaveName(name) {
    if (name === "A") {
      throw new Error("Save A failed");
    }
  }
  ```

  ```
  A
  ↓
  throw Error("Save A failed")
  ↓
  catch()
  ↓
  B
  ```

  it prints (preferred, with stacktrace):

  ```
  Previous mutation failed: Error: Save A failed
    at api.saveName (...)
    at ...
  ```
  or use `console.error("Previous mutation failed:", error.message);` to get

  ```
  Previous mutation failed: Error: Save A failed
  ```

  But there's a tradeoff:
  ```
  + predictable ordering
  - slower
  ```
  Serialization is often appropriate for mutations where order has semantic meaning.
  Imagine a document editor.
  User actions:

  ```
  rename document → "A"
  rename document → "AB"
  rename document → "ABC"
  ```
  Maybe you don't want these updates racing.
  Or a sequence of:
  ```
  add item
  remove item
  update item
  ```
  where operation order matters.
  You might serialize them.
  But for some mutations, serialization is unnecessarily slow. 
  That's where the next strategies matter.
- **Optimistic Concurrency Control / Versioning**
  the server gives the client the current version. For example, `GET`:

  ```
  GET /api/users/123
  ```
  Response:

  ```json
  {
    "id": 123,
    "name": "Alice",
    "version": 7
  }
  ```
  Now the user changes the name:

  ```javascript
  await api.updateUser({
    id: user.id,
    name: "Alicia",
    version: user.version,
  });
  ```

  The request effectively says: Update user 123 to Alicia, but only if the resource is still version 7.

  What if another client changed it?

  ```
  Frontend A has version 7
  Frontend B has version 7
  ```

  A changes it:

  ```
  A → "Alicia", version 7
  ```
  Server accepts it:

  ```
  server version 7
        ↓
  update
        ↓
  server version 8
  ```
  Now B tries:

  ```
  B → "Bob", version 7
  ```
  Server sees:

  ```
  client version = 7
  server version = 8
  ```
  Mismatch. Server rejects:

  ```
  409 Conflict
  ```

  The frontend:

  ```javascript
  try {
    await api.updateUser({
      id,
      name,
      version,
    });
  } catch (error) {
    if (error.status === 409) {
      // conflict
    } else {
      throw error;
    }
  }
  ```
- **Idempotency and Idempotency keys**

  <u>**Idempotency**</u>
  Idempotnecy is a property of certain operations where running them multiple times produces the exact same result as running them just once. 
  Usually idempotent:
  
  ```
  GET /users/123
  
  PUT /users/123
  {
    "name": "Alice"
  }

  DELETE /users/123

  Search
  GET /search?q=iphone
  ```
  Usually not idempotent:

  ```
  POST /orders

  POST /users/123/favorite (toggle favorite)
  ```
  Send once:
  ```
  Order #1001

  false -> true
  ```
  Send twice:
  ```
  Order #1001
  Order #1002

  false -> true
  true -> false
  ```

  Toggle favirite is NOT idempotent, and can cause bugs
  Suppose:
  
  ```javascript
  async function favorite() {
    await api.toggleFavorite(productId);
  }
  ```
  User clicks twice quickly.

  ```
  start from false

  request #1: toggle
  request #2: toggle
  ```
  Suppose the backend receives them in this order:
  
  ```
  #1 → true
  #2 → false
  ```
  Final state: `false`
  Maybe the user intended the final state to be true, because both clicks were actually caused by duplicate UI handling or a retry.
  Now imagine a retry:

  ```
  toggle request
      ↓
  server processes it (false -> true)
      ↓
  network response lost
      ↓
  frontend retries (UI didn't update, user click favorite again)
      ↓
  toggle AGAIN (true -> false)
  ```
  Now the retry itself reverses the state.
  That's why toggle-like mutations are dangerous to blindly retry.
  
  **`setFavorite(true)`** avoids that particular problem

  ```javascript
  await api.setFavorite(productId, true);
  ```
  Two reqs arrive in either order, the final intended state is still `true`
  So the operation is naturally idempotent.
  
  <u>**Idempotency keys**</u>
  Creating an order is not naturally idempotent.
  The user clicks: Place Order
  Frontend sends:

  ```
  POST /orders
  ```
  Server creates:
  
  ```
  Order #123
  ```

  If reponse gets lost, frontend sees

  ```
  network timeout
  ```
  The frontend doesn't know: "Did the server create the order, or didn't it?" So frontend retries:

  ```
  POST /orders
  ```
  The backend might create:

  ```
  Order #124
  ```
  Now you've charged/created two orders.

  The Fix

  ```javascript
  async function createOrder(cart) {
    const idempotencyKey = crypto.randomUUID();

    try {
      return await sendOrder(cart, idempotencyKey);
    } catch (error) {
      // retry same logical operation with same key
      return sendOrder(cart, idempotencyKey);
    }
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

  ```
  Frontend

  logical checkout attempt
          |
          | key = abc123
          v
  POST /orders
          |
          X response lost
          |
          v
  retry
          |
          | SAME key = abc123
          v
  POST /orders
  ```
  On Backend, it maintains something like: 

  ```
  idempotencyKey → result
  ```
  it is usually more than literally an in-memory Map. It might be a database table, Redis entry, or another persistent store.

  ```
  Backend
            POST /orders
                |
    Idempotency-Key: abc123
                |
                v
      Has abc123 been seen?
          /           \
        no             yes
        |               |
        v               v
  create order     return stored result
        |
        v
    Order #5001

  Store:

  abc123 → Order #5001
  ```
- **Cancel Obsolete** operations when cancellation is semantically safe.
  Suppose the user types: Alice then Alicia, and the first save is no longer useful.
  You might cancel it:

  ```javascript
  controller?.abort();
  controller = new AbortController();

  await saveName("Alicia", {
    signal: controller.signal,
  });
  ```
  This can be appropriate when:
  > The old operation is genuinely obsolete.
  
  But be careful with mutations.
  Imagine: `savePayment();`
  Cancellation can be a dangerous concept.
  You don't necessarily want: the user navigated away, so cancel the payment.
  So cancellation is much more naturally useful for:
  
  - **Search: Autocomplete with debounce**

    ```html
    <input placeholder="Search products..." />
    ```
    
    ```javascript
    let searchController;

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

    const debouncedSearch = debounce(
      performSearch,
      300
    );

    searchInput.addEventListener("input", event => {
      debouncedSearch(event.target.value);
    });
    ```
    User typing

    ```
    i
    ip
    iph
    ipho
    iphone
        |
        | 300ms silence
        v
    performSearch("iphone")
        |
        v
    fetch
    ```
    And if the user starts another search while the request is running:

    ```
    iphone request
       |
       | still running
       |
    new query
          |
          v
    abort iphone request
          |
          v
    start new request
    ```
  - **Data Fetching** for a page
    Suppose a page is fetching: `/products/123`, then the user navigates away - the page no longer needs the request.
    You can give the page an `AbortController`:

    ```javascript
    const controller = new AbortController();

    async function loadProduct() {
      try {
        const response = await fetch(
          "/api/products/123",
          {
            signal: controller.signal,
          }
        );

        return response.json();
      } catch (error) {
        if (error.name === "AbortError") {
          return;
        }

        throw error;
      }
    }
    ```
    When the page no longer owns the request:

    ```javascript
    controller.abort();
    ```
    This is especially useful when your UI framework has lifecycle cleanup.
    Conceptually:

    ```
    page mounts
      ↓
    start request
      ↓
    page unmounts
      ↓
    abort request
    ```
  - **Navigation-related reads** TBD

  - **Preview**: eg: image crop -> Each crop triggers an expensive preview request -> You only care about the newest preview.

  **Reads vs Mutations**
  Read

  ```javascript
  fetchUser();
  fetchRecommendations();
  searchProducts();
  ```
  If an old read becomes irrelevant: ignore / cancel it is often fine.

  Mutation

  ```javascript
  updateUser();
  deleteOrder();
  chargeCard();
  createOrder();
  ```
  You need to think much more carefully. You can't necessarily say: "That operation is old; let's just ignore/cancel it."
  The operation may already have changed the server.

Four different problems often get confused. When people say:
"I have an async race.", they may actually mean different things.
- Problem A — stale UI result
  ```
  old GET finishes after new GET
  ```
  Solution:

  ```
  request identity
  cancellation
  ```
- Problem B — ordering of mutations
  
  ```
  update A
  update B
  ```
  but B must happen after A.
  Solution:

  ```
  serialize
  queue
  ```
- Problem C — conflicting writers

  ```
  Tab A changes data
  Tab B changes same data
  ```
  Solution:

  ```
  server-side versioning
  optimistic concurrency
  conflict detection
  ```
- Problem D — duplicate mutation

  ```
  same mutation sent twice
  ```
  Solution:

  ```
  idempotency
  idempotency keys
  ```

**throttle** VS **debounce**

**Throttle** Good for: Don't run more than once per interval.

```
scroll
resize
mouse movement
dragging
continuous sensor events
```

**Debounce** Good for: Wait until activity stops.

```
search input
autocomplete
autosave after typing stops
filtering
validation after typing
```

Ex. debounce of document autosave

```javascript
let controller;

const saveDraft = debounce(async draft => {
  controller?.abort();
  controller = new AbortController();

  try {
    await api.saveDraft(draft, {
      signal: controller.signal,
    });
  } catch (error) {
    if (error.name === "AbortError") {
      return;
    }

    throw error;
  }
}, 500);
```

Ex. throttle

```javascript
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
const handleScroll = throttle(() => {
  updateScrollPosition(); // assume it's expensive
}, 200);

window.addEventListener("scroll", handleScroll);
```

## Senior review question

Whenever you see:

```js
const result = await request();
setState(result);
```

ask:

> Is this result still relevant when it arrives?

That question catches a large class of frontend async bugs.
