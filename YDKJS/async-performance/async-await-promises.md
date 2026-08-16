# Modern JavaScript: Promises, Async/Await, and the Event Loop

A practical guide to how asynchronous JavaScript works today, why Promises still matter when we have `async`/`await`, and how these concepts are used in real applications.

---

# 1. The Big Picture

Modern asynchronous JavaScript becomes much easier once you understand that these concepts are different layers of the same system:

```text
Event Loop
    ↓
Promises
    ↓
async / await
    ↓
Application Code
```

They are **not competing alternatives**.

A useful mental model is:

```text
Event Loop
=
how JavaScript schedules work over time

Promise
=
an object representing a future result

async
=
makes a function return a Promise

await
=
waits for a Promise inside an async workflow

Promise APIs
=
coordinate multiple asynchronous operations
```

The most important relationship to remember is:

> `async`/`await` does not replace Promises. It is syntax for working with Promises.

---

# 2. Why Asynchronous JavaScript Exists

JavaScript applications constantly perform operations that take time:

- HTTP/API requests
- database queries
- reading files
- timers
- user interactions
- browser APIs
- cloud services
- streams

For example:

```js
const response = fetch("/api/users");
```

The network request might take 300 milliseconds.

JavaScript should not freeze the application while waiting.

Instead:

```text
JavaScript
    |
    | start request
    v
Network ----------------------> Server
    |
    | JavaScript can do
    | other work
    |
    | <----------------------- Response
    |
    v
Continue processing
```

This ability to start something now and react to its result later is the foundation of asynchronous programming.

---

# 3. Synchronous JavaScript

Normal JavaScript executes statements in order.

```js
console.log("A");
console.log("B");
console.log("C");
```

Output:

```text
A
B
C
```

Another example:

```js
function calculate() {
  const x = 10;
  const y = 20;

  return x + y;
}

const result = calculate();

console.log(result);
```

Everything happens immediately.

```text
calculate()
    ↓
10 + 20
    ↓
30
```

The result exists **now**.

Async programming introduces values that may exist **later**.

---

# 4. The Event Loop

JavaScript executes synchronous code one piece at a time.

But the environment around JavaScript can handle things such as:

```text
network requests
timers
UI events
file operations
```

and schedule JavaScript to react when those operations complete.

A simplified mental model is:

```text
                JavaScript
                    |
                    v
                Call Stack
                    |
                    v
                Event Loop
                 /      \
                /        \
             Tasks      Microtasks
               |            |
            timers       Promises
            events       await
            etc.         .then()
```

This is intentionally simplified.

The important idea is:

> JavaScript doesn't need to sit there doing nothing while an external operation is taking place.

---

# 5. Run-to-Completion

Consider:

```js
console.log("A");

setTimeout(() => {
  console.log("B");
}, 0);

console.log("C");
```

Output:

```text
A
C
B
```

You might initially expect:

```text
A
B
C
```

because the timeout is:

```js
0
```

But:

```js
setTimeout(callback, 0);
```

doesn't mean:

> Execute this callback immediately.

It means approximately:

> Schedule this callback to become eligible to run later.

The current JavaScript finishes first:

```text
console.log("A")
console.log("C")

--- current work finishes ---

timer callback

console.log("B")
```

This behavior is often described as **run-to-completion**.

Once the current synchronous JavaScript starts running, another scheduled task doesn't normally jump into the middle of it.

---

# 6. Tasks and Microtasks

Promises introduce another important scheduling mechanism: **microtasks**.

Consider:

```js
console.log("A");

setTimeout(() => {
  console.log("B");
}, 0);

Promise.resolve().then(() => {
  console.log("C");
});

console.log("D");
```

Output:

```text
A
D
C
B
```

Why?

A simplified ordering is:

```text
1. Current synchronous JavaScript
2. Microtasks
3. Later tasks
```

So:

```text
Synchronous
-----------
A
D

Microtask
---------
C

Timer task
----------
B
```

Promise reactions such as:

```js
promise.then(...)
```

run through the microtask mechanism.

`await` is built on Promise behavior as well.

---

# 7. A Promise Is a Future Result

This is the most important Promise mental model.

A normal function:

```js
function getName() {
  return "Alice";
}

const name = getName();
```

returns a value immediately.

```text
getName()
    ↓
"Alice"
```

But an asynchronous operation may not have its result yet.

```js
function getUser() {
  return fetch("/api/user");
}
```

Calling:

```js
const result = getUser();
```

doesn't immediately give us the user.

It gives us a **Promise**.

```text
getUser()
    ↓
 Promise
    ↓
some time passes
    ↓
 user data
```

Think:

> A Promise represents a result that may become available later.

---

# 8. Promise States

A Promise has three states:

```text
             ┌──→ fulfilled
             |
pending ─────+
             |
             └──→ rejected
```

## Pending

The operation hasn't completed yet.

```js
const promise = fetch("/api/user");
```

Initially, that request may still be pending.

## Fulfilled

The operation succeeded.

```js
Promise.resolve("hello");
```

## Rejected

The operation failed.

```js
Promise.reject(
  new Error("Something failed")
);
```

Once a Promise becomes fulfilled or rejected, it is **settled**.

A Promise settles only once.

---

# 9. Creating a Promise

You can manually construct a Promise:

```js
const promise = new Promise((resolve, reject) => {
  // perform some operation

  if (success) {
    resolve("Finished");
  } else {
    reject(new Error("Failed"));
  }
});
```

`resolve()` means the asynchronous operation succeeded.

```js
resolve(value);
```

`reject()` means it failed.

```js
reject(error);
```

Example:

```js
function delay(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}
```

Usage:

```js
delay(1000).then(() => {
  console.log("One second passed");
});
```

However, in modern application code you often **consume Promises more often than you manually create them**.

Many APIs already return Promises.

For example:

```js
fetch(url);
```

returns a Promise.

---

# 10. Consuming Promises with `.then()`

A Promise can be consumed using `.then()`.

```js
getUser().then(user => {
  console.log(user);
});
```

Errors can be handled with `.catch()`:

```js
getUser()
  .then(user => {
    console.log(user);
  })
  .catch(error => {
    console.error(error);
  });
```

Cleanup can be performed with `.finally()`:

```js
getUser()
  .then(user => {
    console.log(user);
  })
  .catch(error => {
    console.error(error);
  })
  .finally(() => {
    console.log("Finished");
  });
```

---

# 11. Promise Chaining

`.then()` itself returns another Promise.

That lets asynchronous operations be chained.

```js
getUser()
  .then(user => {
    return getOrders(user.id);
  })
  .then(orders => {
    return getOrderDetails(orders[0].id);
  })
  .then(order => {
    console.log(order);
  })
  .catch(error => {
    console.error(error);
  });
```

Conceptually:

```text
getUser()
    ↓
 user
    ↓
getOrders(user.id)
    ↓
 orders
    ↓
getOrderDetails(...)
    ↓
 order
```

An important rule:

> If the next step depends on an asynchronous operation inside `.then()`, return its Promise.

Correct:

```js
getUser()
  .then(user => {
    return getOrders(user.id);
  })
  .then(orders => {
    console.log(orders);
  });
```

Incorrect:

```js
getUser()
  .then(user => {
    getOrders(user.id);
  })
  .then(orders => {
    console.log(orders);
  });
```

The second version doesn't return the `getOrders()` Promise.

---

# 12. Why Async/Await Exists

Promise chains work, but larger workflows can become harder to read.

For example:

```js
getUser()
  .then(user => {
    return getOrders(user.id);
  })
  .then(orders => {
    return createInvoice(orders);
  })
  .then(invoice => {
    console.log(invoice);
  })
  .catch(error => {
    console.error(error);
  });
```

Modern JavaScript allows us to express the same Promise-based workflow using `async`/`await`.

```js
async function run() {
  try {
    const user = await getUser();
    const orders = await getOrders(user.id);
    const invoice = await createInvoice(orders);

    console.log(invoice);
  } catch (error) {
    console.error(error);
  }
}
```

This looks much more like ordinary synchronous code.

But underneath:

> We are still working with Promises.

---

# 13. Async/Await Does Not Replace Promises

This distinction is fundamental.

```text
Promise
=
the underlying representation
of an asynchronous result

async / await
=
syntax for working with
Promise-based asynchronous results
```

Suppose:

```js
function getUser() {
  return fetch("/api/user");
}
```

`getUser()` returns a Promise.

We can consume it using `.then()`:

```js
getUser().then(response => {
  console.log(response);
});
```

Or using `await`:

```js
async function loadUser() {
  const response = await getUser();

  console.log(response);
}
```

Same Promise.

Different syntax.

---

# 14. What `async` Actually Does

This is one of the most important rules in modern JavaScript:

> An `async` function always returns a Promise.

Consider:

```js
async function getNumber() {
  return 42;
}
```

Calling:

```js
const result = getNumber();
```

doesn't directly return:

```text
42
```

It returns a Promise.

```js
console.log(result instanceof Promise);
// true
```

Conceptually:

```js
async function getNumber() {
  return 42;
}
```

behaves roughly like:

```js
function getNumber() {
  return Promise.resolve(42);
}
```

Therefore:

```js
const number = await getNumber();

console.log(number);
// 42
```

Or:

```js
getNumber().then(number => {
  console.log(number);
});
```

---

# 15. What `await` Actually Does

Consider:

```js
async function loadUser() {
  const user = await getUser();

  console.log(user);
}
```

A misleading mental model would be:

```text
STOP EVERYTHING

wait...

wait...

wait...

continue
```

That's not what happens.

A better model is:

```text
loadUser()
    |
    v
getUser()
    |
    v
Promise pending
    |
    +---------------------------+
    |                           |
loadUser pauses          other work can run
    |                           |
    +---------------------------+
    |
Promise settles
    |
    v
loadUser continues
```

So:

> `await` pauses the continuation of the current async function. It does not freeze the entire JavaScript runtime.

---

# 16. Await and the Event Loop

Consider:

```js
console.log("1");

async function example() {
  console.log("2");

  await Promise.resolve();

  console.log("3");
}

example();

console.log("4");
```

Output:

```text
1
2
4
3
```

Why?

First:

```js
console.log("1");
```

prints:

```text
1
```

Then:

```js
example();
```

starts executing immediately.

So:

```js
console.log("2");
```

prints:

```text
2
```

Then:

```js
await Promise.resolve();
```

causes the rest of the async function to continue asynchronously.

The outer synchronous code continues:

```js
console.log("4");
```

prints:

```text
4
```

Then the async continuation runs:

```js
console.log("3");
```

So:

```text
1
2
4
3
```

A useful visualization:

```text
current JavaScript
------------------

1
2

await
 |
 +---- pause continuation

4

current work finished
        |
        v

Promise microtask
-----------------

3
```

---

# 17. Why We Still Need Promises

If `async`/`await` is easier to read, why don't we just forget Promises?

Because `await` works **on Promises**, and Promise APIs provide powerful ways to coordinate multiple asynchronous operations.

For example:

```js
const user = await getUser();
const products = await getProducts();
```

works.

But if those operations are independent, it may unnecessarily execute them sequentially.

Instead:

```js
const [user, products] = await Promise.all([
  getUser(),
  getProducts(),
]);
```

Notice:

```js
await Promise.all(...)
```

We are using both.

A useful rule:

> Use `async`/`await` to express the workflow.

> Use Promise APIs to compose and coordinate asynchronous operations.

---

# 18. Real-World Example: Fetching Data

One of the most common uses of `async`/`await` is HTTP requests.

```js
async function getUser(id) {
  const response = await fetch(`/api/users/${id}`);

  const user = await response.json();

  return user;
}
```

Usage:

```js
const user = await getUser(123);

console.log(user.name);
```

A more realistic version should check the HTTP status:

```js
async function getUser(id) {
  const response = await fetch(`/api/users/${id}`);

  if (!response.ok) {
    throw new Error(
      `Request failed: ${response.status}`
    );
  }

  return response.json();
}
```

This matters because `fetch()` does not normally reject merely because the server returned:

```text
404
500
503
```

Those are still HTTP responses.

Check:

```js
response.ok
```

when appropriate.

---

# 19. Error Handling with `try/catch`

One major advantage of `async`/`await` is normal-looking error handling.

```js
async function loadUser() {
  try {
    const user = await getUser();

    console.log(user);
  } catch (error) {
    console.error("Unable to load user:", error);
  }
}
```

If `getUser()` returns a rejected Promise, `await` behaves like an exception at that point.

That means:

```js
try {
  const user = await getUser();
} catch (error) {
  // rejected Promise arrives here
}
```

This makes complex workflows easier to reason about.

---

# 20. Don't Catch Errors Without a Reason

This is usually unnecessary:

```js
async function loadUser() {
  try {
    return await getUser();
  } catch (error) {
    throw error;
  }
}
```

You're catching the error just to immediately throw it again.

Usually:

```js
async function loadUser() {
  return getUser();
}
```

is enough.

Catch errors when you can actually do something useful:

- display an error
- retry
- use fallback data
- add useful logging
- translate the error
- recover from the problem

---

# 21. `finally`

`finally` executes whether the operation succeeds or fails.

A common frontend example:

```js
async function saveProfile() {
  showLoadingSpinner();

  try {
    await saveUser();

    showSuccessMessage();
  } catch (error) {
    showErrorMessage(error);
  } finally {
    hideLoadingSpinner();
  }
}
```

Execution:

```text
show spinner
     |
     v
save
   /   \
  /     \
success failure
  \     /
   \   /
    \ /
 hide spinner
```

`finally` is useful for:

- hiding loading indicators
- resetting UI state
- closing resources
- cleanup

---

# 22. Sequential Async Operations

Consider:

```js
const user = await getUser();
const orders = await getOrders(user.id);
```

The second operation depends on:

```js
user.id
```

So sequential execution is correct.

```text
getUser()
    |
    v
  user
    |
    v
getOrders(user.id)
    |
    v
 orders
```

Another example:

```js
const order = await createOrder();
const payment = await chargeOrder(order.id);
const receipt = await createReceipt(payment.id);
```

Each step requires the previous result.

Sequential `await` is exactly what we want.

---

# 23. Accidental Sequential Execution

Now consider:

```js
const user = await getUser();
const products = await getProducts();
```

Suppose:

```text
getUser()       = 1 second
getProducts()   = 1 second
```

Execution:

```text
getUser
██████████

          getProducts
          ██████████
```

Total:

```text
~2 seconds
```

But what if the operations are independent?

There is no reason for the second one to wait.

---

# 24. Concurrent Async Operations

Start both operations together:

```js
const [user, products] = await Promise.all([
  getUser(),
  getProducts(),
]);
```

Now:

```text
getUser
██████████

getProducts
██████████
```

Total:

```text
~1 second
```

This distinction is one of the most important skills in modern async programming:

> Determine whether operations are dependent or independent.

Dependent:

```text
A
↓
B
↓
C
```

Use sequential `await`.

Independent:

```text
A ───┐
B ───┼──→ continue
C ───┘
```

Consider concurrent execution.

---

# 25. `Promise.all()`

Use `Promise.all()` when:

> All operations must succeed before continuing.

Example:

```js
const [user, orders, notifications] =
  await Promise.all([
    getUser(),
    getOrders(),
    getNotifications(),
  ]);
```

Conceptually:

```text
getUser()          ───────┐
                         |
getOrders()        ───────┼──→ Promise.all()
                         |
getNotifications() ───────┘
                              |
                              v
                   [user, orders, notifications]
```

If all fulfill:

```text
user          ✓
orders        ✓
notifications ✓

Promise.all() ✓
```

If one rejects:

```text
user          ✓
orders        X
notifications ✓

Promise.all() X
```

`Promise.all()` has fail-fast behavior.

---

# 26. Real Example: Product Page

Imagine an e-commerce product page needs:

```text
product
reviews
inventory
recommendations
```

If all of those requests can run independently:

```js
async function loadProductPage(productId) {
  const [
    product,
    reviews,
    inventory,
    recommendations,
  ] = await Promise.all([
    getProduct(productId),
    getReviews(productId),
    getInventory(productId),
    getRecommendations(productId),
  ]);

  return {
    product,
    reviews,
    inventory,
    recommendations,
  };
}
```

This is a very common modern application pattern.

---

# 27. `Promise.allSettled()`

Sometimes you want every operation to finish even when some fail.

Use:

```js
Promise.allSettled()
```

Example:

```js
const results = await Promise.allSettled([
  loadMessages(),
  loadRecommendations(),
  loadAnalytics(),
]);
```

Possible result:

```js
[
  {
    status: "fulfilled",
    value: messages,
  },
  {
    status: "rejected",
    reason: new Error("Service unavailable"),
  },
  {
    status: "fulfilled",
    value: analytics,
  },
]
```

Use this when:

> Partial failure is acceptable.

For example, perhaps a dashboard can still display if recommendations fail.

```text
messages        ✓
recommendations X
analytics       ✓

dashboard can still render
```

---

# 28. `Promise.any()`

Use `Promise.any()` when:

> I want the first successful result.

Example:

```js
const result = await Promise.any([
  requestServerA(),
  requestServerB(),
  requestServerC(),
]);
```

Suppose:

```text
Server A ───── X

Server B ────────── ✓

Server C ─────────────── ✓
```

Server B wins.

The failure from Server A doesn't immediately fail `Promise.any()`.

If every Promise rejects, `Promise.any()` rejects with an `AggregateError`.

---

# 29. `Promise.race()`

Use `Promise.race()` when:

> I want whichever Promise settles first.

Settled means:

```text
fulfilled
OR
rejected
```

Example:

```js
const result = await Promise.race([
  requestA(),
  requestB(),
]);
```

Suppose:

```text
requestA ───── X

requestB ───────────── ✓
```

The race rejects because A settled first.

That's different from `Promise.any()`.

```text
Promise.any()
=
first success

Promise.race()
=
first settlement
```

---

# 30. Promise Combinator Cheat Sheet

| API | Meaning |
|---|---|
| `Promise.all()` | All must succeed |
| `Promise.allSettled()` | Wait for every outcome |
| `Promise.any()` | First success wins |
| `Promise.race()` | First settlement wins |

Mental shortcuts:

```text
all
=
I need everything.
```

```text
allSettled
=
Tell me what happened to everything.
```

```text
any
=
Give me anything that works.
```

```text
race
=
Give me whatever finishes first.
```

---

# 31. Mixing Async/Await and Promise APIs

Modern code commonly looks like:

```js
async function loadDashboard() {
  const user = await getUser();

  const [orders, recommendations] =
    await Promise.all([
      getOrders(user.id),
      getRecommendations(user.id),
    ]);

  return {
    user,
    orders,
    recommendations,
  };
}
```

Notice:

```text
async function
      |
     await
      |
 Promise.all()
   /      \
Promise  Promise
```

This is why asking:

> Should I use Promises or async/await?

is usually the wrong question.

The answer is often:

> Both.

---

# 32. Async Loops

Suppose:

```js
const users = [user1, user2, user3];
```

You want to update each user.

You have two major choices.

---

# 33. Sequential Loop

```js
for (const user of users) {
  await updateUser(user);
}
```

Execution:

```text
user1
██████

      user2
      ██████

            user3
            ██████
```

Use this when:

- order matters
- operations depend on previous results
- an API requires serialized requests
- you're intentionally limiting load

---

# 34. Concurrent Array Processing

If every operation is independent:

```js
await Promise.all(
  users.map(user => updateUser(user))
);
```

Execution:

```text
user1 ███████

user2 ██████████

user3 █████
```

They can progress concurrently.

This can be dramatically faster.

---

# 35. Don't Use `forEach(async ...)` When You Need to Wait

A common mistake:

```js
users.forEach(async user => {
  await updateUser(user);
});

console.log("Finished");
```

The problem is that `forEach()` doesn't wait for the Promises returned by its callback.

So:

```text
Finished
```

may print before the updates finish.

Use sequential execution:

```js
for (const user of users) {
  await updateUser(user);
}

console.log("Finished");
```

Or concurrent execution:

```js
await Promise.all(
  users.map(user => updateUser(user))
);

console.log("Finished");
```

---

# 36. `map(async ...)` Returns Promises

Consider:

```js
const users = ids.map(async id => {
  return getUser(id);
});
```

You might expect:

```js
[
  user1,
  user2,
  user3
]
```

But you actually get something conceptually like:

```js
[
  Promise,
  Promise,
  Promise
]
```

Why?

Because:

> An `async` function always returns a Promise.

Usually you want:

```js
const users = await Promise.all(
  ids.map(async id => {
    return getUser(id);
  })
);
```

And because `getUser()` already returns a Promise, this can usually be simplified:

```js
const users = await Promise.all(
  ids.map(id => getUser(id))
);
```

---

# 37. Concurrency Should Be Intentional

This may be dangerous:

```js
await Promise.all(
  products.map(product => updateProduct(product))
);
```

if:

```text
products.length === 100000
```

You could attempt to launch 100,000 operations.

That may overwhelm:

- your server
- your database
- a third-party API
- network connections
- memory
- browser resources

Real systems often use **bounded concurrency**.

Conceptually:

```text
100,000 jobs

but only 10 running at once

██████████

when one finishes:

██████████

when another finishes:

██████████

...
```

Libraries, worker pools, queues, and concurrency limiters are often used for this.

The important lesson:

> Concurrent does not mean unlimited.

---

# 38. Cancellation

Promises represent results, but that doesn't automatically mean the underlying work can be cancelled.

For APIs that support it, modern JavaScript commonly uses:

```text
AbortController
AbortSignal
```

Example:

```js
const controller = new AbortController();

const responsePromise = fetch("/api/search", {
  signal: controller.signal,
});
```

Cancel:

```js
controller.abort();
```

The signal tells `fetch()` that the underlying operation should be aborted.

---

# 39. Real Example: Search-As-You-Type

Imagine someone types:

```text
i
ip
iph
ipho
iphone
```

Without cancellation, you might have requests for all of them.

Older responses could even arrive after newer ones.

A useful pattern:

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

    if (!response.ok) {
      throw new Error(
        `HTTP ${response.status}`
      );
    }

    return await response.json();
  } catch (error) {
    if (error.name === "AbortError") {
      return;
    }

    throw error;
  }
}
```

Now:

```text
"iph"
   |
   +---- request starts

"ipho"
   |
   +---- abort "iph"
   |
   +---- new request starts

"iphone"
   |
   +---- abort "ipho"
   |
   +---- new request starts
```

This is useful for:

- autocomplete
- live search
- filtering
- navigation
- rapidly changing UI state

---

# 40. Timeouts

Modern environments may support timeout-based abort signals:

```js
const response = await fetch("/api/data", {
  signal: AbortSignal.timeout(5000),
});
```

Conceptually:

```text
request
   |
   ├── finishes before 5s
   |        |
   |        v
   |      success
   |
   └── exceeds 5s
            |
            v
          abort
```

Check runtime/browser compatibility when targeting older environments.

---

# 41. `Promise.race()` Does Not Cancel Losing Work

Suppose:

```js
await Promise.race([
  slowRequest(),
  timeout(),
]);
```

If:

```text
timeout()
```

wins, that does **not necessarily stop**:

```text
slowRequest()
```

The operation may continue in the background.

Important distinction:

```text
Promise result ignored
        ≠
underlying work cancelled
```

Actual cancellation requires support from the underlying operation.

For `fetch()`, that's commonly `AbortSignal`.

---

# 42. Retry Pattern

Some failures are temporary.

A simple retry helper:

```js
async function retry(fn, attempts = 3) {
  let lastError;

  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
}
```

Usage:

```js
const user = await retry(
  () => fetchUser(),
  3
);
```

Conceptually:

```text
attempt 1
    X

attempt 2
    X

attempt 3
    ✓
```

Real production retry systems may also include:

- exponential backoff
- jitter
- maximum elapsed time
- retryable error detection
- cancellation

Don't blindly retry every failure.

For example:

```text
400 Bad Request
```

usually indicates a problem with the request itself.

Sending the exact same invalid request three more times probably won't help.

---

# 43. Real Example: Backend Service

Imagine:

```text
GET /api/dashboard
```

The endpoint needs:

```text
user
orders
recommendations
```

But `orders` and `recommendations` require the user.

```js
async function getDashboard(userId) {
  const user = await getUser(userId);

  const [orders, recommendations] =
    await Promise.all([
      getOrders(user.id),
      getRecommendations(user.id),
    ]);

  return {
    user,
    orders,
    recommendations,
  };
}
```

Execution:

```text
              getUser()
                  |
                  v
                user
                  |
             +----+----+
             |         |
             v         v
         getOrders   getRecommendations
             |         |
             +----+----+
                  |
                  v
               return
```

This demonstrates an extremely common real-world pattern:

```text
sequential dependency
+
concurrent independent work
```

---

# 44. Real Example: Frontend Save Button

A common UI workflow:

```js
async function handleSave() {
  saveButton.disabled = true;

  try {
    const result = await saveProfile();

    showMessage("Profile saved");

    return result;
  } catch (error) {
    showMessage("Unable to save profile");
  } finally {
    saveButton.disabled = false;
  }
}
```

Conceptually:

```text
user clicks save
       |
       v
disable button
       |
       v
await saveProfile()
      / \
     /   \
success   failure
   |         |
message    error
     \       /
      \     /
       \   /
    enable button
```

This pattern appears constantly in frontend applications.

---

# 45. Real Example: Dependent API Requests

Imagine:

```text
username
   ↓
user
   ↓
repositories
   ↓
repository details
```

Code:

```js
async function loadProfile(username) {
  const user = await getUser(username);

  const repos = await getRepositories(user.id);

  const details = await Promise.all(
    repos.map(repo =>
      getRepositoryDetails(repo.id)
    )
  );

  return {
    user,
    repos: details,
  };
}
```

Notice both styles.

Sequential:

```js
const user = await getUser(username);

const repos = await getRepositories(user.id);
```

because:

```text
repositories require user.id
```

Concurrent:

```js
const details = await Promise.all(
  repos.map(repo =>
    getRepositoryDetails(repo.id)
  )
);
```

because each repository detail request can be independent.

---

# 46. Real Example: Checkout Workflow

Checkout systems naturally contain dependencies.

```js
async function checkout() {
  const cart = await getCart();

  validateCart(cart);

  const payment = await chargePayment(cart);

  const order = await createOrder(
    cart,
    payment
  );

  await sendConfirmation(order);

  return order;
}
```

Execution:

```text
get cart
   |
   v
validate
   |
   v
payment
   |
   v
create order
   |
   v
confirmation
```

Sequential `await` makes sense because the steps depend on each other.

---

# 47. When Should I Use `async`/`await`?

Use `async`/`await` for most application-level asynchronous workflows.

It is especially useful for:

## Dependent operations

```js
const user = await getUser();

const orders = await getOrders(user.id);
```

## Error handling

```js
try {
  await saveData();
} catch (error) {
  handleError(error);
}
```

## Conditional async logic

```js
const user = await getUser();

if (user.isAdmin) {
  await loadAdminDashboard();
} else {
  await loadUserDashboard();
}
```

## Loops

```js
for (const job of jobs) {
  await processJob(job);
}
```

## Complex workflows

```js
async function processOrder() {
  const order = await getOrder();
  const payment = await getPayment(order);
  const shipment = await createShipment(order);

  return {
    order,
    payment,
    shipment,
  };
}
```

---

# 48. When Should I Use Promise APIs?

Use Promise APIs when you need to **compose or coordinate asynchronous operations**.

For example:

```js
const [user, products] = await Promise.all([
  getUser(),
  getProducts(),
]);
```

Other common examples:

```js
await Promise.all(...);
```

```js
await Promise.allSettled(...);
```

```js
await Promise.any(...);
```

```js
await Promise.race(...);
```

So:

```text
async/await
=
workflow

Promise APIs
=
composition and coordination
```

They work together.

---

# 49. When Is `.then()` Still Useful?

`.then()` is not obsolete.

For small Promise transformations, it can still be perfectly readable.

Example:

```js
const userPromise = fetch("/api/user")
  .then(response => response.json());
```

Or:

```js
function getUser() {
  return fetch("/api/user")
    .then(response => response.json());
}
```

You could also write:

```js
async function getUser() {
  const response = await fetch("/api/user");

  return response.json();
}
```

Both are valid.

Use whichever makes the operation easiest to understand.

For larger workflows with:

```text
conditions
loops
multiple dependent operations
try/catch
cleanup
```

`async`/`await` is usually easier to read.

---

# 50. Don't Wrap Existing Promises Unnecessarily

Avoid this:

```js
function getUser() {
  return new Promise((resolve, reject) => {
    fetch("/api/user")
      .then(resolve)
      .catch(reject);
  });
}
```

`fetch()` already returns a Promise.

Just return it:

```js
function getUser() {
  return fetch("/api/user");
}
```

Or if additional async logic is necessary:

```js
async function getUser() {
  const response = await fetch("/api/user");

  return response.json();
}
```

A useful rule:

> Don't use `new Promise()` simply because you're writing asynchronous code.

Usually use it when adapting a genuinely callback/event-based operation into Promise form or when implementing a Promise-producing abstraction yourself.

---

# 51. Async Functions Compose Naturally

Small async functions:

```js
async function getUser() {
  // ...
}

async function getOrders(userId) {
  // ...
}

async function getRecommendations(userId) {
  // ...
}
```

can be composed into larger workflows:

```js
async function buildDashboard() {
  const user = await getUser();

  const [orders, recommendations] =
    await Promise.all([
      getOrders(user.id),
      getRecommendations(user.id),
    ]);

  return {
    user,
    orders,
    recommendations,
  };
}
```

Then another function can await the whole thing:

```js
async function renderApp() {
  const dashboard = await buildDashboard();

  render(dashboard);
}
```

Think:

```text
low-level async operation
          |
          v
    async function
          |
          v
    async function
          |
          v
    async function
          |
          v
    application
```

Each layer can hide lower-level asynchronous complexity.

---

# 52. Async Iteration

A Promise usually represents:

```text
one future result
```

Sometimes you have:

```text
many future results arriving over time
```

JavaScript supports async iterators for this.

Example:

```js
async function* generateNumbers() {
  for (let i = 1; i <= 3; i++) {
    await delay(1000);

    yield i;
  }
}
```

Consume it:

```js
for await (const number of generateNumbers()) {
  console.log(number);
}
```

Conceptually:

```text
1 second → 1

1 second → 2

1 second → 3
```

Async iteration can be useful for:

- streams
- paginated APIs
- database cursors
- network data
- incremental processing
- large datasets

---

# 53. Real Example: Pagination

Suppose an API returns:

```json
{
  "items": [],
  "nextPage": "/api/products?page=2"
}
```

An async generator can hide the pagination details.

```js
async function* getAllProducts() {
  let url = "/api/products";

  while (url) {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(
        `HTTP ${response.status}`
      );
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
  console.log(product.name);
}
```

The consumer doesn't need to manually manage:

```text
page 1
page 2
page 3
...
```

The async iterator abstracts that away.

---

# 54. Async/Await Does Not Create Threads

This is another important misconception.

Consider:

```js
async function calculate() {
  hugeCalculation();
}
```

Adding:

```text
async
```

doesn't move `hugeCalculation()` onto another CPU thread.

Similarly:

```js
async function calculate() {
  await hugeCalculation();
}
```

doesn't magically turn synchronous CPU-heavy work into non-blocking work.

If:

```js
hugeCalculation();
```

takes five seconds synchronously, it can still block JavaScript for five seconds.

For CPU-intensive work, depending on the environment, you may need:

- Web Workers
- Node.js worker threads
- separate processes
- background job workers

`async`/`await` is primarily about coordinating asynchronous operations, not creating parallel CPU execution.

---

# 55. Concurrency vs Parallelism

These terms are related but different.

## Concurrency

Multiple operations make progress during the same period of time.

For example:

```js
await Promise.all([
  fetchUser(),
  fetchProducts(),
]);
```

The network requests can be in progress concurrently.

## Parallelism

Multiple pieces of computation literally execute at the same instant, often on separate CPU cores or threads.

So:

```text
async
≠
automatically parallel
```

And:

```text
Promise.all()
≠
create CPU threads
```

`Promise.all()` coordinates Promises.

Whether the underlying operations are truly parallel depends on what those operations actually do and what environment is performing them.

---

# 56. Common Mistake: Forgetting `await`

Suppose:

```js
async function getUser() {
  return {
    name: "Alice",
  };
}
```

This:

```js
const user = getUser();

console.log(user.name);
```

doesn't work as expected because:

```text
user
```

is a Promise.

Use:

```js
const user = await getUser();

console.log(user.name);
```

Remember:

> `async` functions always return Promises.

---

# 57. Common Mistake: Unnecessary Sequential Waiting

Potentially slow:

```js
const a = await getA();
const b = await getB();
```

If independent:

```js
const [a, b] = await Promise.all([
  getA(),
  getB(),
]);
```

Don't automatically turn every asynchronous operation into:

```js
await ...
await ...
await ...
await ...
```

Ask whether the operations actually depend on each other.

---

# 58. Common Mistake: `forEach(async ...)`

Avoid when completion matters:

```js
items.forEach(async item => {
  await process(item);
});
```

Sequential:

```js
for (const item of items) {
  await process(item);
}
```

Concurrent:

```js
await Promise.all(
  items.map(item => process(item))
);
```

Choose intentionally.

---

# 59. Common Mistake: Unnecessary `new Promise()`

Avoid:

```js
return new Promise((resolve, reject) => {
  fetch(url)
    .then(resolve)
    .catch(reject);
});
```

Better:

```js
return fetch(url);
```

If something already returns a Promise, usually use that Promise directly.

---

# 60. Common Mistake: Assuming `fetch()` Rejects for Every HTTP Error

This is not sufficient:

```js
const response = await fetch(url);
```

For HTTP errors, check the response:

```js
if (!response.ok) {
  throw new Error(
    `HTTP ${response.status}`
  );
}
```

A `404` or `500` response is still an HTTP response.

---

# 61. Common Mistake: Assuming `Promise.race()` Cancels Work

This:

```js
await Promise.race([
  request(),
  timeout(),
]);
```

doesn't imply:

```text
loser automatically cancelled
```

The losing operation may continue.

Cancellation is a separate concern.

---

# 62. Common Mistake: Unlimited Concurrency

Be careful with:

```js
await Promise.all(
  oneMillionItems.map(processItem)
);
```

You may accidentally start an enormous amount of work simultaneously.

Concurrency should match the capabilities and constraints of:

- your service
- database
- external APIs
- browser
- machine
- network

---

# 63. Practical Decision Tree

When writing asynchronous code:

```text
Do I need to perform asynchronous work?
             |
             v
Does the API already return a Promise?
             |
            yes
             |
             v
Use that Promise directly.
             |
             v
Do I have a workflow with several steps?
             |
            yes
             |
             v
Use async/await.
             |
             v
Does the next operation depend
on the previous result?
          /       \
        yes        no
         |          |
         v          v
      await      Can they run
   sequentially  concurrently?
                     |
                    yes
                     |
                     v
               Promise.all()
```

Then consider failures:

```text
Must every operation succeed?
        |
       yes
        |
        v
Promise.all()
```

```text
Can some operations fail?
        |
       yes
        |
        v
Promise.allSettled()
```

```text
Need first successful result?
        |
        v
Promise.any()
```

```text
Need first settled result?
        |
        v
Promise.race()
```

---

# 64. A More Realistic Modern Example

Imagine a product page.

Requirements:

1. load the product
2. once we know the product, load related data
3. reviews and inventory are required
4. recommendations are optional
5. show loading state
6. handle failures
7. always clean up loading state

```js
async function loadProductPage(productId) {
  showLoading();

  try {
    const product = await getProduct(productId);

    const [reviews, inventory] =
      await Promise.all([
        getReviews(product.id),
        getInventory(product.id),
      ]);

    const [recommendationsResult] =
      await Promise.allSettled([
        getRecommendations(product.category),
      ]);

    const recommendations =
      recommendationsResult.status === "fulfilled"
        ? recommendationsResult.value
        : [];

    return {
      product,
      reviews,
      inventory,
      recommendations,
    };
  } catch (error) {
    showError(error);

    throw error;
  } finally {
    hideLoading();
  }
}
```

This combines:

```text
async function
      |
      +---- await
      |
      +---- sequential dependency
      |
      +---- Promise.all()
      |        |
      |        +---- concurrency
      |
      +---- Promise.allSettled()
      |        |
      |        +---- partial failure
      |
      +---- try/catch
      |
      +---- finally
```

This is representative of how asynchronous JavaScript appears in modern applications.

---

# 65. The Three Layers to Learn

Instead of treating all these APIs as unrelated concepts, learn them in three layers.

## Layer 1 — Event Loop

Answers:

> How does JavaScript schedule work over time?

Learn:

```text
call stack
run-to-completion
event loop
tasks
microtasks
```

---

## Layer 2 — Promises

Answers:

> How does JavaScript represent and coordinate future results?

Learn:

```text
Promise

pending
fulfilled
rejected

.then()
.catch()
.finally()

Promise.all()
Promise.allSettled()
Promise.any()
Promise.race()
```

---

## Layer 3 — Async/Await

Answers:

> How do I write Promise-based application workflows clearly?

Learn:

```js
async function foo() {
  try {
    const value = await somethingAsync();

    return value;
  } catch (error) {
    // handle failure
  }
}
```

The relationship:

```text
              Event Loop
                   |
                   v
                Promise
                   |
                   v
             async / await
                   |
                   v
         Application Workflow
```

---

# 66. What to Learn First

## Level 1 — Foundation

Understand:

```text
Promise
pending
fulfilled
rejected

async function
await

try
catch
finally
```

Practice:

```js
async function load() {
  try {
    const result = await somethingAsync();

    console.log(result);
  } catch (error) {
    console.error(error);
  }
}
```

---

## Level 2 — Concurrency

Understand:

```text
sequential
vs
concurrent
```

Then learn:

```js
Promise.all()
Promise.allSettled()
Promise.any()
Promise.race()
```

Especially practice:

```js
const [a, b] = await Promise.all([
  getA(),
  getB(),
]);
```

---

## Level 3 — Real Application Patterns

Practice:

```text
fetch
dependent requests
parallel requests
timeouts
AbortController
retry
loading states
partial failures
bounded concurrency
```

---

## Level 4 — Advanced

Then study:

```text
event-loop details
tasks
microtasks
async iterators
for await...of
async generators
streams
workers
```

---

# 67. Quick Reference

## Async function

```js
async function foo() {
  return 42;
}
```

Returns:

```text
Promise<42>
```

---

## Await

```js
const result = await somethingAsync();
```

---

## Error handling

```js
try {
  await somethingAsync();
} catch (error) {
  console.error(error);
}
```

---

## Cleanup

```js
try {
  await somethingAsync();
} finally {
  cleanup();
}
```

---

## Sequential dependency

```js
const user = await getUser();

const orders = await getOrders(user.id);
```

---

## Concurrent operations

```js
const [a, b] = await Promise.all([
  getA(),
  getB(),
]);
```

---

## Partial failures

```js
const results = await Promise.allSettled([
  getA(),
  getB(),
]);
```

---

## First successful result

```js
const result = await Promise.any([
  getA(),
  getB(),
]);
```

---

## First settled result

```js
const result = await Promise.race([
  getA(),
  getB(),
]);
```

---

## Sequential loop

```js
for (const item of items) {
  await process(item);
}
```

---

## Concurrent loop

```js
await Promise.all(
  items.map(item => process(item))
);
```

---

## Cancellation

```js
const controller = new AbortController();

const request = fetch(url, {
  signal: controller.signal,
});

controller.abort();
```

---

## Async iteration

```js
for await (const item of asyncIterable) {
  process(item);
}
```

---

# 68. Rules Worth Remembering

1. **A Promise represents a future result.**

2. **A Promise can be pending, fulfilled, or rejected.**

3. **An `async` function always returns a Promise.**

4. **`await` works with Promises; it does not replace them.**

5. **`await` pauses the current async function's continuation, not the entire JavaScript runtime.**

6. **Promise reactions and `await` continuations use microtask scheduling.**

7. **Use `async`/`await` for readable application workflows.**

8. **Use Promise combinators to coordinate multiple asynchronous operations.**

9. **Sequential `await` is correct when operations depend on one another.**

10. **Independent operations can often run concurrently.**

11. **Use `Promise.all()` when all independent operations must succeed.**

12. **Use `Promise.allSettled()` when partial failure is acceptable.**

13. **Use `Promise.any()` when you want the first successful result.**

14. **Use `Promise.race()` when you want the first settled result.**

15. **Don't use `forEach(async ...)` when you need to wait for completion.**

16. **Remember that `map(async ...)` creates an array of Promises.**

17. **Don't unnecessarily wrap existing Promises with `new Promise()`.**

18. **Don't assume `Promise.race()` cancels losing operations.**

19. **Use `AbortSignal` when the underlying operation supports cancellation.**

20. **Don't launch unlimited concurrent operations without considering resource limits.**

21. **`async` does not automatically move CPU-heavy work to another thread.**

22. **Use `try/catch/finally` for meaningful recovery, reporting, and cleanup.**

23. **The most important async design question is whether operations depend on each other or can run concurrently.**

---

# 69. Final Mental Model

When you see:

```js
async function load() {
  const user = await getUser();
}
```

think:

```text
getUser()
    |
    v
returns Promise
    |
    v
await Promise
    |
    v
pause load()
    |
    +--------------------------+
    |                          |
    |                    other JavaScript
    |                       can run
    |                          |
    +--------------------------+
    |
Promise settles
    |
    v
schedule continuation
    |
    v
load() continues
```

When you have independent work:

```js
const [user, products] = await Promise.all([
  getUser(),
  getProducts(),
]);
```

think:

```text
                 getUser()
                     |
                     v
                  Promise
                     \
                      \
                       \
                    Promise.all()
                       /
                      /
                     /
                  Promise
                     ^
                     |
               getProducts()

                     |
                     v
                   await
                     |
                     v
             [user, products]
```

And remember the complete relationship:

```text
                EVENT LOOP
                    |
                    |
             schedules work
                    |
                    v
                 PROMISE
                    |
          represents future result
                    |
          +---------+---------+
          |                   |
      fulfilled            rejected
          |                   |
          +---------+---------+
                    |
                  await
                    |
                    v
           async function resumes
```

The shortest version is:

```text
Event Loop
=
scheduling

Promise
=
future result

async
=
function returns a Promise

await
=
consume a Promise in readable workflow code

Promise.all / allSettled / any / race
=
coordinate multiple Promises
```

If those five ideas are clear, you have the foundation needed to understand modern asynchronous JavaScript.