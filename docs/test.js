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

function debounce(callback, delay) {
  return function(...args) {
    setTimeout(() => {
      callback(...args)
    }, delay)
  }
}

const log = debounce(console.log, 1000);
log("A");
log("B");
log("C");

// function debounce(callback, delay) {
//   let timeoutId;

//   return function(...args) {
//     clearTimeout(timeoutId);

//     timeoutId = setTimeout(() => {
//       callback(...args)
//     }, delay)
//   }
// }

// const log = debounce(console.log, 1000);
// log("A");
// log("B");
// log("C");



