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

const searchParams = new URLSearchParams({
  name: "iphone & ipad",
  sorted: true,
});

const url = `/api/search?${searchParams}`;
console.log(url);
console.log(searchParams.get("sorted"));
console.log(searchParams.get("name"));

console.log(searchParams.toString());


