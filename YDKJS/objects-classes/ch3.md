# You Don't Know JS Yet: Objects & Classes - 2nd Edition
# Chapter 3: Classy Objects

The class-design pattern entails defining a *type of thing* (class), including data (members) and behaviors (methods), and then creating one or more concrete *instances* of this class definition as actual objects. Class-orientation also allows declaring relationships between classes through "inheritance", to derive "subclasses" that mix-n-match and redefine behaviors.

- Prior to ES6, JS developers mimicked class-orientation using plain functions, objects, and `[[Prototype]]` — so-called "prototypal classes".
- ES6 introduced `class` and `extends` keywords for declarative class-oriented design.
- At ES6, `class` was almost entirely syntactic sugar; it has since grown into its own feature mechanism with dedicated syntax far surpassing pre-ES6 prototypal class capabilities.
- Under the hood, `class` still wires up objects through the existing `[[Prototype]]` mechanism. `class` is not a separate language pillar — it sits on top of `[[Prototype]]`.

## Keep It `class`y

`class` defines either a declaration or expression for a class. As a declaration:

```js
class Point2d {
    // ..
}
```

As an expression (named or anonymous):

```js
// named class expression
const pointClass = class Point2d {
    // ..
};

// anonymous class expression
const anotherClass = class {
    // ..
};
```

The contents of a `class` body typically include one or more method definitions:

```js
class Point2d {
    setX(x) {
        // ..
    }
    setY(y) {
        // ..
    }
}
```

- Methods are defined without the `function` keyword.
- No `,` or `;` separators between method definitions.

| NOTE: |
| :--- |
| Inside a `class` block, all code runs in strict-mode even without the `"use strict"` pragma present in the file or its functions. In particular, this impacts the `this` behavior for function calls, as explained in Chapter 4. |

### The Constructor

- Every class has a `constructor` method; if omitted, a default empty constructor is assumed.
- The constructor is invoked any time a `new` instance of the class is created.

```js
class Point2d {
    constructor() {
        console.log("Here's your new instance!");
    }
}

var point = new Point2d();
// Here's your new instance!
```

JS defines the constructor as a function named after the class (`Point2d`), not literally `constructor`:

```js
typeof Point2d;       // "function"
```

Class constructor functions behave differently from regular functions:

```js
Point2d.toString();
// class Point2d {
//   ..
// }

Point2d();
// TypeError: Class constructor Point2d cannot
// be invoked without 'new'

Point2d.call({});
// TypeError: Class constructor Point2d cannot
// be invoked without 'new'
```

Multiple independent instances can be created:

```js
var one = new Point2d();
var two = new Point2d();
var three = new Point2d();
```

| NOTE: |
| :--- |
| Each of the `one`, `two`, and `three` objects have a `[[Prototype]]` linkage to the `Point2d.prototype` object (see Chapter 2). In this code, `Point2d` is both a `class` definition and the constructor function of the same name. |

Properties added to one instance do not exist on other instances:

```js
one.value = 42;

two.value;      // undefined
three.value;    // undefined
```

### Class Methods

```js
class Point2d {
    constructor() {
        console.log("Here's your new instance!");
    }
    setX(x) {
        console.log(`Setting x to: ${x}`);
        // ..
    }
}

var point = new Point2d();

point.setX(3);
// Setting x to: 3
```

- Each class method is added to the `prototype` object of the constructor function — not directly on the instance.
- `setX(..)` exists as `Point2d.prototype.setX`. The `point.setX(..)` reference traverses the `[[Prototype]]` chain to find the method.
- Class methods should only be invoked via an instance. `Point2d.setX(..)` doesn't work because there is no such property. Invoking `Point2d.prototype.setX(..)` is possible but not proper in standard class-oriented coding.

## Class Instance `this`

In the constructor and any methods, `this` refers to the current instance. Use `this.` to add or access properties on the current instance:

```js
class Point2d {
    constructor(x,y) {
        // add properties to the current instance
        this.x = x;
        this.y = y;
    }
    toString() {
        // access the properties from the current instance
        console.log(`(${this.x},${this.y})`);
    }
}

var point = new Point2d(3,4);

point.x;                // 3
point.y;                // 4

point.toString();       // (3,4)
```

- Non-function properties added to a class instance (usually via the constructor) are called *members*.
- Executable functions defined on the class are called *methods*.

### Public Fields

Instead of imperatively adding members via `this.` in the constructor, classes can declaratively define *fields* in the `class` body:

```js
class Point2d {
    // these are public fields
    x = 0
    y = 0

    constructor(x,y) {
        // set properties (fields) on the current instance
        this.x = x;
        this.y = y;
    }
    toString() {
        // access the properties from the current instance
        console.log(`(${this.x},${this.y})`);
    }
}
```

- Public fields can have a value initialization, but that's not required.
- If you don't initialize a field in the class definition, initialize it in the constructor.

Fields can reference each other via `this.` access:

```js
class Point3d {
    // these are public fields
    x
    y = 4
    z = this.y * 5

    // ..
}
```

| TIP: |
| :--- |
| You can mostly think of public field declarations as if they appear at the top of the `constructor(..)`, each prefixed with an implied `this.` that you get to omit in the declarative `class` body form. But, there's a catch! See "That's Super!" later for more information about it. |

Field names can be computed (like computed property names):

```js
var coordName = "x";

class Point2d {
    // computed public field
    [coordName.toUpperCase()] = 42

    // ..
}

var point = new Point2d(3,4);

point.x;        // 3
point.y;        // 4

point.X;        // 42
```

#### Avoid This

Defining arrow functions as class fields is an anti-pattern:

```js
class Point2d {
    x = null
    y = null
    getDoubleX = () => this.x * 2

    constructor(x,y) {
        this.x = x;
        this.y = y;
    }
    toString() { /* .. */ }
}

var point = new Point2d(3,4);

point.getDoubleX();    // 6
```

The equivalent expanded form shows the problem:

```js
class Point2d {
    constructor(x,y) {
        this.x = null;
        this.y = null;
        this.getDoubleX = () => this.x * 2;

        this.x = x;
        this.y = y;
    }
    toString() { /* .. */ }
}

var point = new Point2d(3,4);

point.getDoubleX();    // 6
```

The issue — `getDoubleX` becomes an **own property** on every instance, not a shared prototype method:

```js
Object.hasOwn(point,"x");               // true -- good
Object.hasOwn(point,"toString");        // false -- good
Object.hasOwn(point,"getDoubleX");      // true -- oops :(
```

- A new function property is created **for each instance** rather than once on `prototype`. This is wasteful in performance and memory.
- It breaks the shared prototypal method model that makes `class` and `this`-aware methods useful.
- If you want functions statically fixed to a particular context without dynamicism, use **closure** — not `class` with arrow field methods.

Do not attach `=>` arrow functions as instance properties in place of dynamic prototypal class methods.

## Class Extension

The `extends` keyword defines an inheritance relationship between two classes:

```js
class Point2d {
    x = 3
    y = 4

    getX() {
        return this.x;
    }
}

class Point3d extends Point2d {
    x = 21
    y = 10
    z = 5

    printDoubleX() {
        console.log(`double x: ${this.getX() * 2}`);
    }
}

var point = new Point2d();

point.getX();                   // 3

var anotherPoint = new Point3d();

anotherPoint.getX();            // 21
anotherPoint.printDoubleX();    // double x: 42
```

- `Point3d extends Point2d` makes `Point3d` a subclass (derived class / child class).
- The same `x` property inherited from `Point2d` is re-initialized to `21` in `Point3d`.
- When `anotherPoint.printDoubleX()` calls `this.getX()`, `this` points at the instance (`anotherPoint`), so `this.x` resolves to `21`.

### Extending Expressions

// TODO: cover `class Foo extends ..` where `..` is an expression, not a class-name

### Overriding Methods

A subclass can override (redefine) an inherited method:

```js
class Point2d {
    x = 3
    y = 4

    getX() {
        return this.x;
    }
}

class Point3d extends Point2d {
    x = 21
    y = 10
    z = 5

    getX() {
        return this.x * 2;
    }
    printX() {
        console.log(`double x: ${this.getX()}`);
    }
}

var point = new Point3d();

point.printX();       // double x: 42
```

To access an inherited method from a subclass even after overriding it, use `super` instead of `this`:

```js
class Point2d {
    x = 3
    y = 4

    getX() {
        return this.x;
    }
}

class Point3d extends Point2d {
    x = 21
    y = 10
    z = 5

    getX() {
        return this.x * 2;
    }
    printX() {
        console.log(`x: ${super.getX()}`);
    }
}

var point = new Point3d();

point.printX();       // x: 21
```

The ability for methods of the same name at different levels of the inheritance hierarchy to exhibit different behavior when accessed directly or via `super` is called *method polymorphism*.

### That's Super!

A subclass constructor **must** manually invoke the inherited base class constructor via `super(..)`:

```js
class Point2d {
    x
    y
    constructor(x,y) {
        this.x = x;
        this.y = y;
    }
}

class Point3d extends Point2d {
    z
    constructor(x,y,z) {
        super(x,y);
        this.z = z;
    }
    toString() {
        console.log(`(${this.x},${this.y},${this.z})`);
    }
}

var point = new Point3d(3,4,5);

point.toString();       // (3,4,5)
```

| WARNING: |
| :--- |
| An explicitly defined subclass constructor *must* call `super(..)` to run the inherited class's initialization, and that must occur before the subclass constructor makes any references to `this` or finishes/returns. Otherwise, a runtime exception will be thrown when that subclass constructor is invoked (via `new`). If you omit the subclass constructor, the default constructor automatically -- thankfully! -- invokes `super()` for you. |

Field initializations in a subclass with an explicit constructor run **between** the `super(..)` call and subsequent code — not at the top of the constructor:

```js
class Point2d {
    x
    y
    constructor(x,y) {
        console.log("Running Point2d(..) constructor");
        this.x = x;
        this.y = y;
    }
}

class Point3d extends Point2d {
    z = console.log("Initializing field 'z'")

    constructor(x,y,z) {
        console.log("Running Point3d(..) constructor");
        super(x,y);

        console.log(`Setting instance property 'z' to ${z}`);
        this.z = z;
    }
    toString() {
        console.log(`(${this.x},${this.y},${this.z})`);
    }
}

var point = new Point3d(3,4,5);
// Running Point3d(..) constructor
// Running Point2d(..) constructor
// Initializing field 'z'
// Setting instance property 'z' to 5
```

The `z = ..` field initialization happens immediately after `super(x,y)`, before anything else in the constructor body.

#### Which Class?

Use the `new.target` pseudo-property to determine if a constructor is being called directly or via a subclass `super()`:

```js
class Point2d {
    // ..

    constructor(x,y) {
        if (new.target === Point2d) {
            console.log("Constructing 'Point2d' instance");
        }
    }

    // ..
}

class Point3d extends Point2d {
    // ..

    constructor(x,y,z) {
        super(x,y);

        if (new.target === Point3d) {
            console.log("Constructing 'Point3d' instance");
        }
    }

    // ..
}

var point = new Point2d(3,4);
// Constructing 'Point2d' instance

var anotherPoint = new Point3d(3,4,5);
// Constructing 'Point3d' instance
```

### But Which Kind Of Instance?

Use the `instanceof` operator to introspect whether an object is an instance of a specific class:

```js
class Point2d { /* .. */ }
class Point3d extends Point2d { /* .. */ }

var point = new Point2d(3,4);

point instanceof Point2d;           // true
point instanceof Point3d;           // false

var anotherPoint = new Point3d(3,4,5);

anotherPoint instanceof Point2d;    // true
anotherPoint instanceof Point3d;    // true
```

`anotherPoint instanceof Point2d` is `true` because `instanceof` traverses the entire `[[Prototype]]` chain:

```
Point2d.prototype
        /       \
       /         \
      /           \
  point   Point3d.prototype
                    \
                     \
                      \
                    anotherPoint
```

The equivalent check using `isPrototypeOf(..)` (inherited from `Object.prototype`):

```js
Point2d.prototype.isPrototypeOf(point);             // true
Point3d.prototype.isPrototypeOf(point);             // false

Point2d.prototype.isPrototypeOf(anotherPoint);      // true
Point3d.prototype.isPrototypeOf(anotherPoint);      // true
```

To check if an object was *only and directly* created by a specific class, check the instance's `constructor` property:

```js
point.constructor === Point2d;          // true
point.constructor === Point3d;          // false

anotherPoint.constructor === Point2d;   // false
anotherPoint.constructor === Point3d;   // true
```

| NOTE: |
| :--- |
| The `constructor` property shown here is *not* actually present on (owned) the `point` or `anotherPoint` instance objects. So where does it come from!? It's on each object's `[[Prototype]]` linked prototype object: `Point2d.prototype.constructor === Point2d` and `Point3d.prototype.constructor === Point3d`. |

### "Inheritance" Is Sharing, Not Copying

Inspecting the `anotherPoint` object shows it only has the `x`, `y`, and `z` properties — not the `toString()` method:

```js
Object.hasOwn(anotherPoint,"x");                       // true
Object.hasOwn(anotherPoint,"y");                       // true
Object.hasOwn(anotherPoint,"z");                       // true

Object.hasOwn(anotherPoint,"toString");                // false
```

`toString()` lives on the prototype object:

```js
Object.hasOwn(Point3d.prototype,"toString");    // true
```

- Methods are not copied down to instances or subclasses — they stay on the prototype object and are **shared** via `[[Prototype]]` linkage.
- `class` syntax does not change this underlying mechanic; JS is wiring up objects along a `[[Prototype]]` chain.

## Static Class Behavior

Three locations for data or behavior in a class:
1. On the constructor's `prototype` (methods — shared by all instances)
2. On the instance (members — per-instance)
3. On the constructor function itself (statics — independent of instances)

Use the `static` keyword to define static properties and functions:

```js
class Point2d {
    // class statics
    static origin = new Point2d(0,0)
    static distance(point1,point2) {
        return Math.sqrt(
            ((point2.x - point1.x) ** 2) +
            ((point2.y - point1.y) ** 2)
        );
    }

    // instance members and methods
    x
    y
    constructor(x,y) {
        this.x = x;
        this.y = y;
    }
    toString() {
        return `(${this.x},${this.y})`;
    }
}

console.log(`Starting point: ${Point2d.origin}`);
// Starting point: (0,0)

var next = new Point2d(3,4);
console.log(`Next point: ${next}`);
// Next point: (3,4)

console.log(`Distance: ${
    Point2d.distance( Point2d.origin, next )
}`);
// Distance: 5
```

| NOTE: |
| :--- |
| Don't forget that when you use the `class` syntax, the name `Point2d` is actually the name of a constructor function that JS defines. So `Point2d.origin` is just a regular property access on that function object. That's what I meant at the top of this section when I referred to a third location for storing *things* related to classes; in JS, `static`s are stored as properties on the constructor function. Take care not to confuse those with properties stored on the constructor's `prototype` (methods) and properties stored on the instance (members). |

### Static Property Initializations

In a static initialization (`static whatever = ..`), `this` refers to the class itself (the constructor), not an instance:

```js
class Point2d {
    // class statics
    static originX = 0
    static originY = 0
    static origin = new this(this.originX,this.originY)

    // ..
}
```

| WARNING: |
| :--- |
| I don't recommend actually doing the `new this(..)` trick I've illustrated here. That's just for illustration purposes. The code would read more cleanly with `new Point2d(this.originX,this.originY)`, so prefer that approach. |

Key behaviors of static initializations:
- Unlike public field initializations (which only run on `new`), class static initializations run **immediately** after the `class` has been defined.
- Order of static initializations matters; statements evaluate one at a time.
- Static properties do not have to be initialized (default: `undefined`), but it's much more common to do so.

As of ES2022, a `static` block supports more sophisticated initialization of statics:

```js
class Point2d {
    // class statics
    static origin = new Point2d(0,0)
    static distance(point1,point2) {
        return Math.sqrt(
            ((point2.x - point1.x) ** 2) +
            ((point2.y - point1.y) ** 2)
        );
    }

    // static initialization block (as of ES2022)
    static {
        let outerPoint = new Point2d(6,8);
        this.maxDistance = this.distance(
            this.origin,
            outerPoint
        );
    }

    // ..
}

Point2d.maxDistance;        // 10
```

- `let outerPoint = ..` is a normal block-scoped declaration, localized to the static block.
- Static initialization blocks are also useful for `try..catch` around expression computations.

### Static Inheritance

Class statics are inherited by subclasses, can be overridden, and `super` can be used for base class static references:

```js
class Point2d {
    static origin = /* .. */
    static distance(x,y) { /* .. */ }

    static {
        // ..
        this.maxDistance = /* .. */;
    }

    // ..
}

class Point3d extends Point2d {
    // class statics
    static origin = new Point3d(
        // here, `this.origin` references wouldn't
        // work (self-referential), so we use
        // `super.origin` references instead
        super.origin.x, super.origin.y, 0
    )
    static distance(point1,point2) {
        // here, super.distance(..) is Point2d.distance(..),
        // if we needed to invoke it

        return Math.sqrt(
            ((point2.x - point1.x) ** 2) +
            ((point2.y - point1.y) ** 2) +
            ((point2.z - point1.z) ** 2)
        );
    }

    // instance members/methods
    z
    constructor(x,y,z) {
        super(x,y);     // <-- don't forget this line!
        this.z = z;
    }
    toString() {
        return `(${this.x},${this.y},${this.z})`;
    }
}

Point2d.maxDistance;        // 10
Point3d.maxDistance;        // 10
```

| TIP: |
| :--- |
| Remember: any time you define a subclass constructor, you'll need to call `super(..)` in it, usually as the first statement. I find that all too easy to forget. |

- Static "inheritance" is **not** a copy — it's sharing via the `[[Prototype]]` chain.
- The constructor function `Point3d()` has its `[[Prototype]]` linkage changed from `Function.prototype` to `Point2d`, which is what allows `Point3d.maxDistance` to delegate to `Point2d.maxDistance`.
- Static inheritance was one specific feature introduced in ES6 that was *not* emulable with pre-ES6 prototypal-class code.

## Private Class Behavior

As of ES2022, `class` supports private fields (instance members), private methods, and private static properties/functions.

### Private Members/Methods

Private fields and methods use the `#` prefix syntax:

```js
class Point2d {
    // statics
    static samePoint(point1,point2) {
        return point1.#ID === point2.#ID;
    }

    // privates
    #ID = null
    #assignID() {
        this.#ID = Math.round(Math.random() * 1e9);
    }

    // publics
    x
    y
    constructor(x,y) {
        this.#assignID();
        this.x = x;
        this.y = y;
    }
}

var one = new Point2d(3,4);
var two = new Point2d(3,4);

Point2d.samePoint(one,two);         // false
Point2d.samePoint(one,one);         // true
```

Rules for private fields/methods:
- The `#whatever` syntax (including `this.#whatever`) is only valid inside `class` bodies — syntax error if used outside.
- Private fields **must** be declared in the `class` body; you cannot dynamically add a private member in the constructor via `this.#whatever = ..` if `#whatever` is not declared in the class body.
- Private fields can be re-assigned but cannot be `delete`d from an instance (unlike public fields).
- Private members/methods are private **only to the class they're defined in** and are **not** inherited by subclasses.

#### Subclassing + Privates

Inherited methods that access privates from their own base class work correctly, even when invoked from a subclass:

```js
class Point2d { /* .. */ }

class Point3d extends Point2d {
    z
    constructor(x,y,z) {
        super(x,y);
        this.z = z;
    }
}

var one = new Point3d(3,4,5);
```

The `super(x,y)` call invokes the base class constructor which accesses `Point2d`'s private `#assignID()` — no exception is thrown, even though `Point3d` cannot directly access `#ID` or `#assignID()`.

Inherited static functions also work:

```js
Point2d.samePoint(one,one);         // true
Point3d.samePoint(one,one);         // true
```

```js
Point2d.samePoint === Point3d.samePoint;
```

The inherited function reference is the exact same function (not a copy).

However, a subclass **cannot** directly access privates from the base class:

```js
class Point2d { /* .. */ }

class Point3d extends Point2d {
    z
    constructor(x,y,z) {
        super(x,y);
        this.z = z;

        console.log(this.#ID);      // will throw!
    }
}
```

| WARNING: |
| :--- |
| Notice that this snippet throws an early static syntax error at the time of defining the `Point3d` class, before ever even getting a chance to create an instance of the class. The same exception would be thrown if the reference was `super.#ID` instead of `this.#ID`. |

#### Existence Check

Use the `in` keyword for an "ergonomic brand check" to determine if a private field exists on an object without risking an exception:

```js
class Point2d {
    // statics
    static samePoint(point1,point2) {
        // "ergonomic brand checks"
        if (#ID in point1 && #ID in point2) {
            return point1.#ID === point2.#ID;
        }
        return false;
    }

    // privates
    #ID = null
    #assignID() {
        this.#ID = Math.round(Math.random() * 1e9);
    }

    // publics
    x
    y
    constructor(x,y) {
        this.#assignID();
        this.x = x;
        this.y = y;
    }
}

var one = new Point2d(3,4);
var two = new Point2d(3,4);

Point2d.samePoint(one,two);         // false
Point2d.samePoint(one,one);         // true
```

`#privateField in someObject` returns a boolean and does not throw if the field is not found.

#### Exfiltration

Private members/methods can be exfiltrated (extracted) from a class instance:

```js
var id, func;

class Point2d {
    // privates
    #ID = null
    #assignID() {
        this.#ID = Math.round(Math.random() * 1e9);
    }

    // publics
    x
    y
    constructor(x,y) {
        this.#assignID();
        this.x = x;
        this.y = y;

        // exfiltration
        id = this.#ID;
        func = this.#assignID;
    }
}

var point = new Point2d(3,4);

id;                     // 7392851012 (...for example)

func;                   // function #assignID() { .. }
func.call(point,42);

func.call({},100);
// TypeError: Cannot write private member #ID to an
// object whose class did not declare it
```

Be careful when passing private methods as callbacks — nothing prevents accidental privacy disclosure.

### Private Statics

Static properties and functions can also be marked private with `#`:

```js
class Point2d {
    static #errorMsg = "Out of bounds."
    static #printError() {
        console.log(`Error: ${this.#errorMsg}`);
    }

    // publics
    x
    y
    constructor(x,y) {
        if (x > 100 || y > 100) {
            Point2d.#printError();
        }
        this.x = x;
        this.y = y;
    }
}

var one = new Point2d(30,400);
// Error: Out of bounds.
```

- In a private static function, `this` references the class (`Point2d`), not an instance.
- Private statics are not inherited by subclasses, just as private instance members/methods are not.

#### Gotcha: Subclassing With Static Privates and `this`

Inherited instance methods can access privates from their base class via `this.#whatever`:

```js
class Point2d {
    // ..

    getID() {
        return this.#ID;
    }

    // ..
}

class Point3d extends Point2d {
    // ..

    printID() {
        console.log(`ID: ${this.getID()}`);
    }
}

var point = new Point3d(3,4,5);
point.printID();
// ID: ..
```

However, **inherited public static functions cannot access private statics via `this.`**:

```js
class Point2d {
    static #errorMsg = "Out of bounds."
    static printError() {
        console.log(`Error: ${this.#errorMsg}`);
    }

    // ..
}

class Point3d extends Point2d {
    // ..
}

Point2d.printError();
// Error: Out of bounds.

Point3d.printError === Point2d.printError;
// true

Point3d.printError();
// TypeError: Cannot read private member #errorMsg
// from an object whose class did not declare it
```

**Fix**: use the class name directly instead of `this.` to access private statics:

```js
class Point2d {
    static #errorMsg = "Out of bounds."
    static printError() {
        // the fixed reference vvvvvv
        console.log(`Error: ${Point2d.#errorMsg}`);
    }

    // ..
}

class Point3d extends Point2d {
    // ..
}

Point2d.printError();
// Error: Out of bounds.

Point3d.printError();
// Error: Out of bounds.  <-- phew, it works now!
```

If public static functions are being inherited, use the class name to access any private statics instead of `this.` references.

## Class Example

```js
class CalendarItem {
    static #UNSET = Symbol("unset")
    static #isUnset(v) {
        return v === this.#UNSET;
    }
    static #error(num) {
        return this[`ERROR_${num}`];
    }
    static {
        for (let [idx,msg] of [
            "ID is already set.",
            "ID is unset.",
            "Don't instantiate 'CalendarItem' directly.",
        ].entries()) {
            this[`ERROR_${(idx+1)*100}`] = msg;
        }
    }
    static isSameItem(item1,item2) {
        if (#ID in item1 && #ID in item2) {
            return item1.#ID === item2.#ID;
        }
        else {
            return false;
        }
    }

    #ID = CalendarItem.#UNSET
    #setID(id) {
        if (CalendarItem.#isUnset(this.#ID)) {
            this.#ID = id;
        }
        else {
            throw new Error(CalendarItem.#error(100));
        }
    }

    description = null
    startDateTime = null

    constructor() {
        if (new.target !== CalendarItem) {
            let id = Math.round(Math.random() * 1e9);
            this.#setID(id);
        }
        else {
            throw new Error(CalendarItem.#error(300));
        }
    }
    getID() {
        if (!CalendarItem.#isUnset(this.#ID)) {
            return this.#ID;
        }
        else {
            throw new Error(CalendarItem.#error(200));
        }
    }
    getDateTimeStr() {
        if (this.startDateTime instanceof Date) {
            return this.startDateTime.toUTCString();
        }
    }
    summary() {
        console.log(`(${
            this.getID()
        }) ${
            this.description
        } at ${
            this.getDateTimeStr()
        }`);
    }
}

class Reminder extends CalendarItem {
    #complete = false;  // <-- no ASI, semicolon needed

    [Symbol.toStringTag] = "Reminder"
    constructor(description,startDateTime) {
        super();

        this.description = description;
        this.startDateTime = startDateTime;
    }
    isComplete() {
        return !!this.#complete;
    }
    markComplete() {
        this.#complete = true;
    }
    summary() {
        if (this.isComplete()) {
            console.log(`(${this.getID()}) Complete.`);
        }
        else {
            super.summary();
        }
    }
}

class Meeting extends CalendarItem {
    #getEndDateTimeStr() {
        if (this.endDateTime instanceof Date) {
            return this.endDateTime.toUTCString();
        }
    }

    endDateTime = null;  // <-- no ASI, semicolon needed

    [Symbol.toStringTag] = "Meeting"
    constructor(description,startDateTime,endDateTime) {
        super();

        this.description = description;
        this.startDateTime = startDateTime;
        this.endDateTime = endDateTime;
    }
    getDateTimeStr() {
        return `${
            super.getDateTimeStr()
        } - ${
            this.#getEndDateTimeStr()
        }`;
    }
}
```

| NOTE: |
| :--- |
| One question you may have: why didn't I move the repeated logic of `description` and `startDateTime` setting from both subclass constructors into the single base constructor? This is a nuanced point, but it's not my intention that `CalendarItem` ever be directly instantiated; it's what in class-oriented terms we refer to as an "abstract class". That's why I'm using `new.target` to throw an error if the `CalendarItem` class is ever directly instantiated! So I don't want to imply by signature that the `CalendarItem(..)` constructor should ever be directly used. |

```js
var callMyParents = new Reminder(
    "Call my parents to say hi",
    new Date("July 7, 2022 11:00:00 UTC")
);
callMyParents.toString();
// [object Reminder]
callMyParents.summary();
// (586380912) Call my parents to say hi at
// Thu, 07 Jul 2022 11:00:00 GMT
callMyParents.markComplete();
callMyParents.summary();
// (586380912) Complete.
callMyParents instanceof Reminder;
// true
callMyParents instanceof CalendarItem;
// true
callMyParents instanceof Meeting;
// false


var interview = new Meeting(
    "Job Interview: ABC Tech",
    new Date("June 23, 2022 08:30:00 UTC"),
    new Date("June 23, 2022 09:15:00 UTC")
);
interview.toString();
// [object Meeting]
interview.summary();
// (994337604) Job Interview: ABC Tech at Thu,
// 23 Jun 2022 08:30:00 GMT - Thu, 23 Jun 2022
// 09:15:00 GMT
interview instanceof Meeting;
// true
interview instanceof CalendarItem;
// true
interview instanceof Reminder;
// false


Reminder.isSameItem(callMyParents,callMyParents);
// true
Meeting.isSameItem(callMyParents,interview);
// false
```

[^POLP]: "Principle of Least Privilege", Wikipedia; https://en.wikipedia.org/wiki/Principle_of_least_privilege ; Accessed July 2022
