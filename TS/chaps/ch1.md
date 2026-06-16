### Getting to Know TypeScript

### Item 1: Understand the Relationship Between TypeScript and JavaScript

- TypeScript is a syntactic superset of JavaScript: any JavaScript program without syntax errors is also a valid TypeScript program.
- TypeScript files use `.ts` (or `.tsx`) extensions; `.js` files are already valid TypeScript.
- All JavaScript programs are TypeScript programs, but not all TypeScript programs are JavaScript programs — TypeScript adds type annotation syntax that JavaScript does not understand.

Running TypeScript-annotated code directly through a JavaScript runtime errors:

```
function greet(who: string) {
^

SyntaxError: Unexpected token :
```

TypeScript's type checker works even without annotations, via type inference:

```
let city = 'new york city';
console.log(city.toUppercase());
// ~~~~~~~~~~~ Property 'toUppercase' does not exist on type
// 'string'. Did you mean 'toUpperCase'?
```

Type annotations tell TypeScript your intent, enabling it to distinguish correct from incorrect code. Without annotations, the checker may guess wrong:

```
const states = [
  {name: 'Alabama', capitol: 'Montgomery'},
  {name: 'Alaska', capitol: 'Juneau'},
  {name: 'Arizona', capitol: 'Phoenix'},
  // ...
];
for (const state of states) {
  console.log(state.capital);
  // ~~~~~~~ Property 'capital' does not exist on type
  // '{ name: string; capitol: string; }'.
  // Did you mean 'capitol'?
}
```

Fixing with an explicit type annotation gives the correct error:

```
interface State {
  name: string;
  capital: string;
}
const states: State[] = [
  {name: 'Alabama', capitol: 'Montgomery'},
  // ~~~~~~~
  {name: 'Alaska', capitol: 'Juneau'},
  // ~~~~~~~
  {name: 'Arizona', capitol: 'Phoenix'},
  // ~~~~~~~ Object literal may only specify known properties,
  // but 'capitol' does not exist in type 'State'.
  // Did you mean to write 'capital'?
  // ...
];
for (const state of states) {
  console.log(state.capital);
}
```

TypeScript's type system models JavaScript's runtime behavior:

```
const x = 2 + '3'; // OK
// ^? const x: string
const y = '2' + 3; // OK
// ^? const y: string
```

TypeScript draws the line at constructs it considers likely errors, even if they don't throw at runtime:

```
const a = null + 7; // Evaluates to 7 in JS
// ~~~~ The value 'null' cannot be used here.
const b = [] + 12; // Evaluates to '12' in JS
// ~~~~~~~ Operator '+' cannot be applied to types ...
alert('Hello', 'TypeScript'); // alerts "Hello"
// ~~~~~~~~~~~~ Expected 0-1 arguments, but got 2
```

Type-checking does not guarantee no runtime errors. TypeScript's type system is intentionally **unsound**:

```
const names = ['Alice', 'Bob'];
console.log(names[2].toUpperCase());
// TypeError: Cannot read properties of undefined (reading 'toUpperCase')
```

The static type and the actual runtime type can diverge. TypeScript was never intended to be sound.

**Things to Remember**

- TypeScript is a superset of JavaScript: all JavaScript programs are syntactically valid TypeScript programs, but not all TypeScript programs are valid JavaScript programs.
- TypeScript adds a static type system that models JavaScript's runtime behavior and tries to spot code that will throw exceptions at runtime.
- It is possible for code to pass the type checker but still throw at runtime.
- TypeScript disallows some legal but questionable JavaScript constructs such as calling functions with the wrong number of arguments.
- Type annotations tell TypeScript your intent and help it distinguish correct and incorrect code.

### Item 2: Know Which TypeScript Options You're Using

TypeScript compiler options can be set via command line:

```
$ tsc --noImplicitAny program.ts
```

or via `tsconfig.json` (preferred — ensures consistent behavior across tools and teammates):

```
{
  "compilerOptions": {
    "noImplicitAny": true
  }
}
```

Create a config file with `tsc --init`.

**noImplicitAny**

Controls what TypeScript does when it cannot determine the type of a variable.

With `noImplicitAny` off, untyped parameters are silently given type `any`:

```
function add(a, b) {
  return a + b;
}
// inferred as: function add(a: any, b: any): any
```

With `noImplicitAny` on, this becomes an error:

```
function add(a, b) {
// ~ Parameter 'a' implicitly has an 'any' type
// ~ Parameter 'b' implicitly has an 'any' type
  return a + b;
}
```

Fix by providing explicit types:

```
function add(a: number, b: number) {
  return a + b;
}
```

- Turn on `noImplicitAny` for new projects.
- Leaving it off is only appropriate when transitioning a JavaScript project to TypeScript, and even then only temporarily.

**strictNullChecks**

Controls whether `null` and `undefined` are permissible values in every type.

With `strictNullChecks` off:

```
const x: number = null; // OK, null is a valid number
```

With `strictNullChecks` on:

```
const x: number = null;
// ~ Type 'null' is not assignable to type 'number'
```

To allow `null`, make it explicit:

```
const x: number | null = null;
```

To handle possibly-null values, use narrowing or a non-null assertion:

```
const statusEl = document.getElementById('status');
statusEl.textContent = 'Ready';
// ~~~~~ 'statusEl' is possibly 'null'.

if (statusEl) {
  statusEl.textContent = 'Ready'; // OK, null has been excluded
}
statusEl!.textContent = 'Ready'; // OK, we've asserted that el is non-null
```

- `if (statusEl)` is narrowing/refining a type (Item 22).
- `!` is a non-null assertion (Item 9 explains when to use it).

**Other Options**

- `strict` enables `noImplicitAny`, `strictNullChecks`, `noImplicitThis`, `strictFunctionTypes`, and more — aim to enable this.
- `tsc --init` creates a project in strict mode by default.

`noUncheckedIndexedAccess` (stricter than strict) catches array/object access bugs:

```
const tenses = ['past', 'present', 'future'];
tenses[3].toUpperCase();
// ~~~~~~ Object is possibly 'undefined'.
```

Tradeoff: valid accesses are also flagged:

```
tenses[0].toUpperCase();
// ~~~~~~ Object is possibly 'undefined'.
```

**Things to Remember**

- The TypeScript compiler includes several settings that affect core aspects of the language.
- Configure TypeScript using `tsconfig.json` rather than command-line options.
- Turn on `noImplicitAny` unless you are transitioning a JavaScript project to TypeScript.
- Use `strictNullChecks` to prevent "undefined is not an object"-style runtime errors.
- Aim to enable `strict` to get the most thorough checking that TypeScript can offer.

### Item 3: Understand That Code Generation Is Independent of Types

`tsc` does two independent things:

- Transpiles TypeScript/JavaScript to an older JavaScript version.
- Checks code for type errors.

These two behaviors are entirely independent. Types cannot affect the JavaScript that TypeScript emits, and therefore cannot affect runtime behavior.

**You Cannot Check TypeScript Types at Runtime**

```
interface Square {
  width: number;
}
interface Rectangle extends Square {
  height: number;
}
type Shape = Square | Rectangle;

function calculateArea(shape: Shape) {
  if (shape instanceof Rectangle) {
    // ~~~~~~~~~ 'Rectangle' only refers to a type,
    // but is being used as a value here
    return shape.height * shape.width;
    // ~~~~~~ Property 'height' does not exist on type 'Shape'
  } else {
    return shape.width * shape.width;
  }
}
```

TypeScript types are **erasable** — interfaces, types, and annotations are removed at compile time. The generated JavaScript has no reference to `Rectangle`, making `instanceof Rectangle` fail.

Solutions:

1. Property check (works at runtime, also narrows the type):

```
function calculateArea(shape: Shape) {
  if ('height' in shape) {
    return shape.width * shape.height;
    // ^? (parameter) shape: Rectangle
  } else {
    return shape.width * shape.width;
  }
}
```

2. Tagged/discriminated union (explicit `kind` field):

```
interface Square {
  kind: 'square';
  width: number;
}
interface Rectangle {
  kind: 'rectangle';
  height: number;
  width: number;
}
type Shape = Square | Rectangle;

function calculateArea(shape: Shape) {
  if (shape.kind === 'rectangle') {
    return shape.width * shape.height;
    // ^? (parameter) shape: Rectangle
  } else {
    return shape.width * shape.width;
    // ^? (parameter) shape: Square
  }
}
```

3. Use `class` instead of `interface` — `class` introduces both a type and a runtime value:

```
class Square {
  width: number;
  constructor(width: number) {
    this.width = width;
  }
}
class Rectangle extends Square {
  height: number;
  constructor(width: number, height: number) {
    super(width);
    this.height = height;
  }
}
type Shape = Square | Rectangle;

function calculateArea(shape: Shape) {
  if (shape instanceof Rectangle) {
    return shape.width * shape.height;
    // ^? (parameter) shape: Rectangle
  } else {
    return shape.width * shape.width;
    // ^? (parameter) shape: Square
  }
}
```

`class Rectangle` introduces both a type and a constructor value. In `type Shape = Square | Rectangle`, `Rectangle` is the type. In `shape instanceof Rectangle`, `Rectangle` is the value (constructor function).

**Code with Type Errors Can Produce Output**

```
$ cat test.ts
let x = 'hello';
x = 1234;
$ tsc test.ts
test.ts:2:1 - error TS2322: Type '1234' is not assignable to type 'string'

2 x = 1234;
  ~

$ cat test.js
var x = 'hello';
x = 1234;
```

TypeScript errors are like warnings — they don't stop code generation. To prevent output on errors, use `noEmitOnError` in `tsconfig.json`.

> **Compiling and Type Checking**: Saying TypeScript "doesn't compile" when it has errors is inaccurate. Code generation is "compiling." TypeScript will produce output even with errors. The correct phrasing is that the code "has errors" or "doesn't type check."

**Type Operations Cannot Affect Runtime Values**

`as number` is a type assertion — it does nothing at runtime:

```
function asNumber(val: number | string): number {
  return val as number;
}
```

Generated JavaScript:

```
function asNumber(val) {
  return val;
}
```

No conversion happens. To actually convert the value, use a JavaScript runtime construct:

```
function asNumber(val: number | string): number {
  return Number(val);
}
```

**Runtime Types May Not Be the Same as Declared Types**

```
function setLightSwitch(value: boolean) {
  switch (value) {
    case true:
      turnLightOn();
      break;
    case false:
      turnLightOff();
      break;
    default:
      console.log(`I'm afraid I can't do that.`);
  }
}
```

The `default` branch can be reached at runtime even though `boolean` is the declared type. At runtime, `boolean` is erased. A caller could pass `"ON"` from JavaScript, or a network API could return a string even when declared as `boolean`:

```
interface LightApiResponse {
  lightSwitchValue: boolean;
}
async function setLight() {
  const response = await fetch('/light');
  const result: LightApiResponse = await response.json();
  setLightSwitch(result.lightSwitchValue);
}
```

Nothing enforces that the API response actually matches `LightApiResponse`.

**You Cannot Overload a Function Based on TypeScript Types**

True function overloading (multiple implementations differing only by parameter types) is not possible:

```
function add(a: number, b: number) { return a + b; }
// ~~~ Duplicate function implementation
function add(a: string, b: string) { return a + b; }
// ~~~ Duplicate function implementation
```

TypeScript overloads operate at the type level only — multiple type signatures with a single implementation:

```
function add(a: number, b: number): number;
function add(a: string, b: string): string;

function add(a: any, b: any) {
  return a + b;
}

const three = add(1, 2);
// ^? const three: number
const twelve = add('1', '2');
// ^? const twelve: string
```

The first two signatures are erased at compile time; only the implementation remains in the JavaScript output.

**TypeScript Types Have No Effect on Runtime Performance**

- Types and type operations are erased at compile time — zero runtime overhead.
- Build-time overhead exists (type checking). Use "transpile only" mode to skip type checking if needed.
- Emitting downleveled code (e.g., targeting ES5 with generators) may incur overhead versus native implementations, but this is independent of types.

**Things to Remember**

- Code generation is independent of the type system. This means that TypeScript types cannot affect the runtime behavior of your code.
- It is possible for a program with type errors to produce code ("compile").
- TypeScript types are not available at runtime. To query a type at runtime, you need some way to reconstruct it. Tagged unions and property checking are common ways to do this.
- Some constructs, such as `class`, introduce both a TypeScript type and a value that is available at runtime.
- Because they are erased as part of compilation, TypeScript types cannot affect the runtime performance of your code.

### Item 4: Get Comfortable with Structural Typing

TypeScript uses a **structural type system** to model JavaScript's duck typing: a value is compatible with a type if it has all the required properties, regardless of how it was created.

```
interface Vector2D {
  x: number;
  y: number;
}

function calculateLength(v: Vector2D) {
  return Math.sqrt(v.x ** 2 + v.y ** 2);
}

interface NamedVector {
  name: string;
  x: number;
  y: number;
}

const v: NamedVector = { x: 3, y: 4, name: 'Pythagoras' };
calculateLength(v); // OK, result is 5
```

`NamedVector` is structurally compatible with `Vector2D` — no explicit relationship required.

**Structural typing can cause bugs:**

```
interface Vector3D {
  x: number;
  y: number;
  z: number;
}

function normalize(v: Vector3D) {
  const length = calculateLength(v);
  return {
    x: v.x / length,
    y: v.y / length,
    z: v.z / length,
  };
}
```

```
> normalize({x: 3, y: 4, z: 5})
{ x: 0.6, y: 0.8, z: 1 }
```

The result has length ~1.4, not 1. `calculateLength` only uses `x` and `y`, ignoring `z`. TypeScript does not flag this — `Vector3D` is structurally compatible with `Vector2D`.

**Types are "open" (not sealed/closed/precise):**

```
function calculateLengthL1(v: Vector3D) {
  let length = 0;
  for (const axis of Object.keys(v)) {
    const coord = v[axis];
    // ~~~~~~~ Element implicitly has an 'any' type because ...
    // 'string' can't be used to index type 'Vector3D'
    length += Math.abs(coord);
  }
  return length;
}
```

This is a correct error — `v` could have extra properties at runtime:

```
const vec3D = {x: 3, y: 4, z: 1, address: '123 Broadway'};
calculateLengthL1(vec3D); // OK, returns NaN
```

Since `v` could have any properties, `axis` is `string`, and `v[axis]` is not guaranteed to be a number. The correct implementation avoids iteration:

```
function calculateLengthL1(v: Vector3D) {
  return Math.abs(v.x) + Math.abs(v.y) + Math.abs(v.z);
}
```

**Classes follow structural typing rules too:**

```
class SmallNumContainer {
  num: number;
  constructor(num: number) {
    if (num < 0 || num >= 10) {
      throw new Error(`You gave me ${num} but I want something 0-9.`)
    }
    this.num = num;
  }
}

const a = new SmallNumContainer(5);
const b: SmallNumContainer = { num: 2024 }; // OK!
```

`b` is assignable because its structure matches. The constructor's validation logic never runs. Unlike C++ or Java, TypeScript does not guarantee a class parameter was actually constructed via that class's constructor.

**Structural typing enables easy mocking in tests:**

Instead of coupling to a concrete type:

```
interface Author {
  first: string;
  last: string;
}
function getAuthors(database: PostgresDB): Author[] {
  const authorRows = database.runQuery(`SELECT first, last FROM authors`);
  return authorRows.map(row => ({first: row[0], last: row[1]}));
}
```

Define a narrower interface:

```
interface DB {
  runQuery: (sql: string) => any[];
}
function getAuthors(database: DB): Author[] {
  const authorRows = database.runQuery(`SELECT first, last FROM authors`);
  return authorRows.map(row => ({first: row[0], last: row[1]}));
}
```

`PostgresDB` satisfies `DB` structurally — no explicit `implements DB` needed. Tests can pass a simple object:

```
test('getAuthors', () => {
  const authors = getAuthors({
    runQuery(sql: string) {
      return [['Toni', 'Morrison'], ['Maya', 'Angelou']];
    }
  });
  expect(authors).toEqual([
    {first: 'Toni', last: 'Morrison'},
    {first: 'Maya', last: 'Angelou'}
  ]);
});
```

No mocking library needed. TypeScript verifies the test object conforms to `DB`.

**Things to Remember**

- Understand that JavaScript is duck typed and TypeScript uses structural typing to model this: values assignable to your interfaces might have properties beyond those explicitly listed in your type declarations. Types are not "sealed."
- Be aware that classes also follow structural typing rules. You may not have an instance of the class you expect!
- Use structural typing to facilitate unit testing.

### Item 5: Limit Use of the any Type

`any` disables type checking for a symbol:

```
let ageInYears: number;
ageInYears = '12';
// ~~~~~~~ Type 'string' is not assignable to type 'number'.
ageInYears = '12' as any; // OK
```

**There's No Type Safety with any Types**

```
ageInYears += 1; // OK; at runtime, ageInYears is now "121"
```

The declared type says `number`, but `any` allowed a string to be assigned. The type checker is blind to subsequent misuse.

**any Lets You Break Contracts**

```
function calculateAge(birthDate: Date): number {
  // ...
}

let birthDate: any = '1990-01-19';
calculateAge(birthDate); // OK
```

The function contract requires a `Date`, but `any` allows a `string` to be passed without error.

**There Are No Language Services for any Types**

With a typed symbol, editors provide autocomplete and documentation. With `any`, there is no autocomplete.

Renaming also breaks down:

```
interface Person {
  first: string;
  last: string;
}

const formatName = (p: Person) => `${p.first} ${p.last}`;
const formatNameAny = (p: any) => `${p.first} ${p.last}`;
```

Using "Rename Symbol" on `first` → `firstName` updates `formatName` but not `formatNameAny`:

```
interface Person {
  firstName: string;
  last: string;
}
const formatName = (p: Person) => `${p.firstName} ${p.last}`;
const formatNameAny = (p: any) => `${p.first} ${p.last}`;
```

**any Types Mask Bugs When You Refactor Code**

```
interface ComponentProps {
  onSelectItem: (item: any) => void;
}

function renderSelector(props: ComponentProps) { /* ... */ }

let selectedId: number = 0;
function handleSelectItem(item: any) {
  selectedId = item.id;
}

renderSelector({onSelectItem: handleSelectItem});
```

Later, `onSelectItem` is changed to pass an `id: number` instead of the full item:

```
interface ComponentProps {
  onSelectItem: (id: number) => void;
}
```

Everything passes the type checker — but `handleSelectItem` still does `item.id`, which at runtime is `undefined.id` and throws. The `any` type hid the mismatch.

**any Hides Your Type Design**

Using `any` for complex state objects makes the type design implicit and unreadable. Explicit types communicate design intent and enable code review.

**any Undermines Confidence in the Type System**

Runtime errors that TypeScript didn't catch (often due to `any`) erode trust in the type system.

**Things to Remember**

- TypeScript's `any` type allows you to disable most forms of type checking for a symbol.
- The `any` type eliminates type safety, lets you break contracts, harms developer experience, makes refactoring error prone, hides your type design, and undermines confidence in the type system.
- Avoid using `any` when you can!
