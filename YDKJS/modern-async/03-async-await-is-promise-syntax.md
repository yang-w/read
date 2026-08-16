# Chapter 3 — Async/Await Is Promise Syntax

## What `await` consumes

`await` works naturally with Promises:

```js
async function loadUser() {
  const response = await fetch("/api/user");
  return response.json();
}
```

The function returns a Promise to its caller.

```js
const promise = loadUser();
```

So `async`/`await` is compositional: one async function can be consumed by another.

## `.then()` and `await` are not rival technologies

Promise chain:

```js
getUser()
  .then(user => getOrders(user.id))
  .then(orders => renderOrders(orders))
  .catch(error => renderError(error));
```

Async/await:

```js
async function render() {
  try {
    const user = await getUser();
    const orders = await getOrders(user.id);

    renderOrders(orders);
  } catch (error) {
    renderError(error);
  }
}
```

The second often maps more naturally to application control flow.

## When `.then()` can still be cleaner

A small transformation may not need an `async` wrapper:

```js
function getUserData() {
  return fetch("/api/user")
    .then(response => response.json());
}
```

There is no senior-level rule that says every Promise must be awaited.

Use the expression that makes control flow clearest.

## `await` and rejection

A rejected awaited Promise behaves like a thrown exception at the await point.

```js
async function load() {
  try {
    const user = await getUser();
    return user;
  } catch (error) {
    console.error(error);
  }
}
```

## Catch errors where you can add value

Avoid:

```js
async function loadUser() {
  try {
    return await getUser();
  } catch (error) {
    throw error;
  }
}
```

Prefer:

```js
function loadUser() {
  return getUser();
}
```

or catch where you can recover, annotate, log meaningfully, show UI, or choose a fallback.

## `finally` for lifecycle cleanup

```js
async function saveProfile() {
  setSaving(true);

  try {
    await save();
    showSuccess();
  } catch (error) {
    showError(error);
  } finally {
    setSaving(false);
  }
}
```

`finally` is ideal for state that must be restored regardless of outcome.

## Avoid unnecessary `return await`

Often:

```js
async function getUser() {
  return getUserFromApi();
}
```

is sufficient.

But `return await` can be useful when the current function needs to observe the rejection locally, such as inside `try/catch`:

```js
async function getUser() {
  try {
    return await getUserFromApi();
  } catch (error) {
    throw new UserLoadError("Unable to load user", {
      cause: error,
    });
  }
}
```

## Think in dependency graphs

Instead of asking "where should I put `await`?", ask:

> What values depend on what other values?

```js
const user = await getUser();
const orders = await getOrders(user.id);
```

This dependency is real.

But this may be accidental:

```js
const profile = await getProfile();
const featureFlags = await getFeatureFlags();
```

If neither depends on the other, you may have created a waterfall.

That leads directly to concurrency.
