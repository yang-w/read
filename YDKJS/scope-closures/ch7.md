# You Don't Know JS Yet: Scope & Closures - 2nd Edition
# Chapter 7: Using Closures

Closure builds on the *least exposure* principle (POLE): for variables we need to use over time, instead of placing them in larger outer scopes, we can encapsulate (more narrowly scope) them but still preserve access from inside functions, for broader use. Functions *remember* these referenced scoped variables via closure.

## See the Closure

- Closure is a behavior of functions and only functions. Objects and classes do not have closure (though their methods might).
- For closure to be observable, a function must be invoked in a **different branch of the scope chain** from where it was originally defined. A function executing in the same scope it was defined does not exhibit closure.

```js
// outer/global scope: RED(1)

function lookupStudent(studentID) {
    // function scope: BLUE(2)

    var students = [
        { id: 14, name: "Kyle" },
        { id: 73, name: "Suzy" },
        { id: 112, name: "Frank" },
        { id: 6, name: "Sarah" }
    ];

    return function greetStudent(greeting){
        // function scope: GREEN(3)

        var student = students.find(
            student => student.id == studentID
        );

        return `${ greeting }, ${ student.name }!`;
    };
}

var chosenStudents = [
    lookupStudent(6),
    lookupStudent(112)
];

// accessing the function's name:
chosenStudents[0].name;
// greetStudent

chosenStudents[0]("Hello");
// Hello, Sarah!

chosenStudents[1]("Howdy");
// Howdy, Frank!
```

After `lookupStudent(..)` completes, its inner variables would normally be GC'd. But `greetStudent(..)` references both `students` and `studentID` from the enclosing scope — each of those references is a *closure*. Closure allows `greetStudent(..)` to continue accessing those outer variables even after the outer scope is finished.

### Pointed Closure

Arrow functions still create a scope. The `student => student.id == studentID` arrow function creates a fourth scope (ORANGE(4)) inside `greetStudent(..)`:

```js
var student = students.find(
    student =>
        // function scope: ORANGE(4)
        student.id == studentID
);
```

- The BLUE(2) `studentID` reference is inside ORANGE(4), not GREEN(3).
- The `student` parameter of the arrow function is ORANGE(4), shadowing the GREEN(3) `student`.
- The arrow function holds the closure over `studentID`, not `greetStudent(..)`.

### Adding Up Closures

```js
function adder(num1) {
    return function addTo(num2){
        return num1 + num2;
    };
}

var add10To = adder(10);
var add42To = adder(42);

add10To(15);    // 25
add42To(9);     // 51
```

- Closure is associated with an **instance** of a function, not its single lexical definition.
- Every time `adder(..)` runs, a *new* `addTo(..)` function instance is created, and for each new instance, a new closure.
- `add10To` and `add42To` each close over their own separate `num1` instance.
- Even though closure is based on lexical scope (handled at compile time), closure is observed as a **runtime characteristic** of function instances.

### Live Link, Not a Snapshot

Closure is a **live link** to the full variable itself — not a snapshot of a value. The closed-over variable can be read and re-assigned as long as the function reference exists.

```js
function makeCounter() {
    var count = 0;

    return function getCurrent() {
        count = count + 1;
        return count;
    };
}

var hits = makeCounter();

// later

hits();     // 1

// later

hits();     // 2
hits();     // 3
```

The enclosing scope of a closure does not need to be a function — any outer scope works:

```js
var hits;
{   // an outer scope (but not a function)
    let count = 0;
    hits = function getCurrent(){
        count = count + 1;
        return count;
    };
}
hits();     // 1
hits();     // 2
hits();     // 3
```

| NOTE: |
| :--- |
| `getCurrent()` is defined as a `function` expression instead of a `function` declaration because of the dangerous quirks of FiB (Chapter 6). |

**Common mistake — treating closure as value-oriented:**

```js
var studentName = "Frank";

var greeting = function hello() {
    // we are closing over `studentName`,
    // not "Frank"
    console.log(
        `Hello, ${ studentName }!`
    );
}

// later

studentName = "Suzy";

// later

greeting();
// Hello, Suzy!
```

`greeting()` is closed over the variable `studentName`, not its value at the time of definition. It reflects the current value of the variable at invocation time.

**Classic loop mistake:**

```js
var keeps = [];

for (var i = 0; i < 3; i++) {
    keeps[i] = function keepI(){
        // closure over `i`
        return i;
    };
}

keeps[0]();   // 3 -- WHY!?
keeps[1]();   // 3
keeps[2]();   // 3
```

`var i` is a single variable shared across all iterations. All three functions close over the same `i`, which is `3` by the time the loop ends.

**Fix 1 — new variable per iteration with `let j = i`:**

```js
var keeps = [];

for (var i = 0; i < 3; i++) {
    // new `j` created each iteration, which gets
    // a copy of the value of `i` at this moment
    let j = i;

    // the `i` here isn't being closed over, so
    // it's fine to immediately use its current
    // value in each loop iteration
    keeps[i] = function keepEachJ(){
        // close over `j`, not `i`!
        return j;
    };
}
keeps[0]();   // 0
keeps[1]();   // 1
keeps[2]();   // 2
```

**Fix 2 — `let` in the `for` loop declaration (creates a new `i` per iteration):**

```js
var keeps = [];

for (let i = 0; i < 3; i++) {
    // the `let i` gives us a new `i` for
    // each iteration, automatically!
    keeps[i] = function keepEachI(){
        return i;
    };
}
keeps[0]();   // 0
keeps[1]();   // 1
keeps[2]();   // 2
```

### Common Closures: Ajax and Events

```js
function lookupStudentRecord(studentID) {
    ajax(
        `https://some.api/student/${ studentID }`,
        function onRecord(record) {
            console.log(
                `${ record.name } (${ studentID })`
            );
        }
    );
}

lookupStudentRecord(114);
// Frank (114)
```

`onRecord(..)` is invoked asynchronously, long after `lookupStudentRecord(..)` has completed. `studentID` remains accessible via closure.

```js
function listenForClicks(btn,label) {
    btn.addEventListener("click",function onClick(){
        console.log(
            `The ${ label } button was clicked!`
        );
    });
}

var submitBtn = document.getElementById("submit-btn");

listenForClicks(submitBtn,"Checkout");
```

`label` is closed over by `onClick(..)`. When the button is clicked, `label` still exists via closure.

### What If I Can't See It?

Closure is only meaningful when it is **observable**. Several patterns look like closure but are not:

**Lexical scope (not closure) — function invoked in same scope where variables are defined:**

```js
function say(myName) {
    var greeting = "Hello";
    output();

    function output() {
        console.log(
            `${ greeting }, ${ myName }!`
        );
    }
}

say("Kyle");
// Hello, Kyle!
```

**Global variables — not observable as closure because they're always accessible everywhere:**

```js
var students = [
    { id: 14, name: "Kyle" },
    { id: 73, name: "Suzy" },
    { id: 112, name: "Frank" },
    { id: 6, name: "Sarah" }
];

function getFirstStudent() {
    return function firstStudent(){
        return students[0].name;
    };
}

var student = getFirstStudent();

student();
// Kyle
```

**Variables present but never accessed — no closure:**

```js
function lookupStudent(studentID) {
    return function nobody(){
        var msg = "Nobody's here yet.";
        console.log(msg);
    };
}

var student = lookupStudent(112);

student();
// Nobody's here yet.
```

`nobody()` never references `studentID`, so no closure is created over it. The engine can GC `studentID` after `lookupStudent(..)` finishes.

**Inner function never invoked — closure not observed:**

```js
function greetStudent(studentName) {
    return function greeting(){
        console.log(
            `Hello, ${ studentName }!`
        );
    };
}

greetStudent("Kyle");

// nothing else happens
```

The returned function is thrown away without being called, so closure has no observable effect.

### Observable Definition

> Closure is observed when a function uses variable(s) from outer scope(s) even while running in a scope where those variable(s) wouldn't be accessible.

Key requirements:

* Must be a function involved
* Must reference at least one variable from an outer scope
* Must be invoked in a different branch of the scope chain from the variable(s)

## The Closure Lifecycle and Garbage Collection (GC)

- A closure over a variable lasts as long as there is still a reference to the function that holds that closure.
- If ten functions close over the same variable and nine references are discarded, the variable is preserved by the remaining one.
- Once the last function reference is discarded, the closure is gone and the variable can be GC'd.
- Closure can unexpectedly prevent GC of variables, leading to memory leaks. Discard function references when they're no longer needed.

```js
function manageBtnClickEvents(btn) {
    var clickHandlers = [];

    return function listener(cb){
        if (cb) {
            let clickHandler =
                function onClick(evt){
                    console.log("clicked!");
                    cb(evt);
                };
            clickHandlers.push(clickHandler);
            btn.addEventListener(
                "click",
                clickHandler
            );
        }
        else {
            // passing no callback unsubscribes
            // all click handlers
            for (let handler of clickHandlers) {
                btn.removeEventListener(
                    "click",
                    handler
                );
            }

            clickHandlers = [];
        }
    };
}

// var mySubmitBtn = ..
var onSubmit = manageBtnClickEvents(mySubmitBtn);

onSubmit(function checkout(evt){
    // handle checkout
});

onSubmit(function trackAction(evt){
    // log action to analytics
});

// later, unsubscribe all handlers:
onSubmit();
```

`onClick(..)` closes over `cb`. The `checkout()` and `trackAction()` references cannot be GC'd until the handlers are unsubscribed. Calling `onSubmit()` with no argument clears `clickHandlers`, which discards the closures over `cb`.

### Per Variable or Per Scope?

Conceptually, closure is **per variable** — a function closes over only what it explicitly references. But in practice, it is **per scope** at the implementation level, with engines optionally optimizing to trim unused variables.

```js
function manageStudentGrades(studentRecords) {
    var grades = studentRecords.map(getGrade);

    return addGrade;

    // ************************

    function getGrade(record){
        return record.grade;
    }

    function sortAndTrimGradesList() {
        // sort by grades, descending
        grades.sort(function desc(g1,g2){
            return g2 - g1;
        });

        // only keep the top 10 grades
        grades = grades.slice(0,10);
    }

    function addGrade(newGrade) {
        grades.push(newGrade);
        sortAndTrimGradesList();
        return grades;
    }
}

var addNextGrade = manageStudentGrades([
    { id: 14, name: "Kyle", grade: 86 },
    { id: 73, name: "Suzy", grade: 87 },
    { id: 112, name: "Frank", grade: 75 },
    // ..many more records..
    { id: 6, name: "Sarah", grade: 91 }
]);

// later

addNextGrade(81);
addNextGrade(68);
// [ .., .., ... ]
```

- `addGrade(..)` closes over `grades` and `sortAndTrimGradesList`.
- `getGrade` and `studentRecords` are not referenced by any inner function, so per-variable closure logic says they can be GC'd after `manageStudentGrades(..)` completes.
- Modern engines (e.g., V8) confirm this: a debugger breakpoint inside `addGrade(..)` will not show `studentRecords` in the inspector.

**Counter-example with `eval(..)` — forces per-scope closure:**

```js
function storeStudentInfo(id,name,grade) {
    return function getInfo(whichValue){
        // warning:
        //   using `eval(..)` is a bad idea!
        var val = eval(whichValue);
        return val;
    };
}

var info = storeStudentInfo(73,"Suzy",87);

info("name");
// Suzy

info("grade");
// 87
```

Because `eval(..)` can reference any variable dynamically, the engine cannot apply the per-variable optimization — all scope variables are preserved. This is per-scope closure.

**Implication:** The per-variable optimization is optional, not specified behavior. Do not rely on it. If a variable holds a large value and is in a closure scope, manually set it to `null` when done.

**Fix for `manageStudentGrades(..)` — manually discard the large array:**

```js
function manageStudentGrades(studentRecords) {
    var grades = studentRecords.map(getGrade);

    // unset `studentRecords` to prevent unwanted
    // memory retention in the closure
    studentRecords = null;

    return addGrade;
    // ..
}
```

This does not remove `studentRecords` from the closure scope, but ensures the variable no longer holds a reference to the large array, allowing it to be GC'd.

## An Alternative Perspective

Two models for understanding closure:

**Model 1 (observational):** A function carries a hidden link back to its original scope. When the function is passed elsewhere and invoked, it accesses variables through that link.

**Model 2 (implementational):** Function instances stay in place inside their original scope. What gets passed around is only a reference to the function instance. Closure keeps that function instance (and its scope chain) alive as long as any reference to it exists.

```js
// outer/global scope: RED(1)

function adder(num1) {
    // function scope: BLUE(2)

    return function addTo(num2){
        // function scope: GREEN(3)

        return num1 + num2;
    };
}

var add10To = adder(10);
var add42To = adder(42);

add10To(15);    // 25
add42To(9);     // 51
```

- Model 1: `addTo(..)` moves to RED(1) scope but retains a link back to BLUE(2).
- Model 2: `addTo(..)` stays in place inside BLUE(2). `addTo10` and `addTo42` in RED(1) are just references pointing to those in-place instances.

Both models produce the same observable outcomes.

| NOTE: |
| :--- |
| This alternative model affects whether synchronous callbacks are classified as examples of closure. More on this nuance in Appendix A. |

## Why Closure?

**Without closure — handler must re-read DOM attribute on every click:**

```js
var APIendpoints = {
    studentIDs:
        "https://some.api/register-students",
    // ..
};

var data = {
    studentIDs: [ 14, 73, 112, 6 ],
    // ..
};

function makeRequest(evt) {
    var btn = evt.target;
    var recordKind = btn.dataset.kind;
    ajax(
        APIendpoints[recordKind],
        data[recordKind]
    );
}

// <button data-kind="studentIDs">
//    Register Students
// </button>
btn.addEventListener("click",makeRequest);
```

**With closure — `recordKind` read once at setup, remembered by the handler:**

```js
var APIendpoints = {
    studentIDs:
        "https://some.api/register-students",
    // ..
};

var data = {
    studentIDs: [ 14, 73, 112, 6 ],
    // ..
};

function setupButtonHandler(btn) {
    var recordKind = btn.dataset.kind;

    btn.addEventListener(
        "click",
        function makeRequest(evt){
            ajax(
                APIendpoints[recordKind],
                data[recordKind]
            );
        }
    );
}

// <button data-kind="studentIDs">
//    Register Students
// </button>

setupButtonHandler(btn);
```

**Further optimization — look up URL and data once at setup:**

```js
function setupButtonHandler(btn) {
    var recordKind = btn.dataset.kind;
    var requestURL = APIendpoints[recordKind];
    var requestData = data[recordKind];

    btn.addEventListener(
        "click",
        function makeRequest(evt){
            ajax(requestURL,requestData);
        }
    );
}
```

**Partial application pattern — separate the handler factory from setup:**

```js
function defineHandler(requestURL,requestData) {
    return function makeRequest(evt){
        ajax(requestURL,requestData);
    };
}

function setupButtonHandler(btn) {
    var recordKind = btn.dataset.kind;
    var handler = defineHandler(
        APIendpoints[recordKind],
        data[recordKind]
    );
    btn.addEventListener("click",handler);
}
```

`defineHandler(..)` is now reusable and the closure scope is explicitly limited to the two variables needed.

## Closer to Closure

Two models for closure:

* **Observational:** closure is a function instance remembering its outer variables even as that function is passed to and **invoked in** other scopes.
* **Implementational:** closure is a function instance and its scope environment preserved in-place while any references to it are passed around and **invoked from** other scopes.

Benefits:

* **Efficiency:** a function instance remembers previously determined information instead of recomputing it each time.
* **Readability:** scope-exposure is bounded by encapsulating variable(s) inside function instances, while keeping that information accessible for future use. Narrower, more specialized function instances are cleaner to interact with.
