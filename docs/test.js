"use strict";

document.querySelector("button").addEventListener("click", handleClick);
function handleClick(evt) {
  console.log(this);
  console.log(evt.target.value);
  console.log(evt.target.textContent);
}

document.querySelector("select").addEventListener("change", handleChange);
function handleChange(evt) {
  console.log(this); // <select>
  console.log(evt.target); // <select>
  console.log(evt.target.value);
  console.log(this.value);
}

console.log(`-----------------`);

const users = [user1, user2, user3];

async function updateUser(userId) {
  // update user
}

// concurrent
(async () => {
  await Promise.all(
    // map returns an array of promises
    // not Promise.all([...]) - no need []
    users.map(user => updateUser(user?.id))
  );
})();

<a name="78-array-methods" id="78-array-methods">7.8 Array Methods</a>
- If the iteration method <span class="orange">takes a callback</span>, they generally **not async-aware**. eg: `arry.map` doesn't await until promise resolves, but <span class="orange">**returns the promise immediately, skip the rest of lines in current iteration, then continues to the next iteration**</span>.
  - If the iteration method <span class="orange">doesn't have callback</span> (`for...of`, `values`, `entries`, classic `for` loop), `await` will **pause the loop UNTIL the promise resolves, then continue the rest of lines in current iteration, then move to the next loop**.

// sequential loop
(async () => {
  // forEach doesn't wait
  users.forEach(async user => {
    await updateUser(user?.id);
  });
  console.log("finished");
  
  // use this
  for (const user of users) {
    await updateUser(user?.id);
  }
  console.log("finished");
})();


const users = await Promise.all(ids.map(id => fetchUser(id)));

// bounded concurrency
// limit how many requests hit a server at once.
const batchSize = 10;
(async () => {
  for (let i = 0; i < users.length; i += batchSize) {
    const batch = users.slice(i, i + batchSize);

    await Promise.all(
      batch.map(user => updateUser(user?.id))
    );
  }
})();

// worker pool / concurrency limiter
async function updateUsersWithLimit(users, limit) {
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < users.length) {
      const index = nextIndex++;
      const user = users[index];

      await updateUser(user.id);
    }
  }

  // Start 3 workers
  await Promise.all(
    Array.from({ length: limit }, () => worker())
  );
}

(async () => {
  await updateUsersWithLimit(users, 3);
})();







  



