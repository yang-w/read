**CHAPTER 2**

### TypeScript's Type System

### Item 6: Use Your Editor to Interrogate and Explore the Type System

When you install TypeScript, you get two executables:

- `tsc` — the TypeScript compiler
- `tsserver` — the TypeScript standalone server, which provides language services: autocomplete, inspection, navigation, refactoring

**What the editor shows you:**

- Hover over a symbol to see its inferred type (e.g., `num` inferred as `number` from `10`)
- Hover over a function name to see its inferred return type
- Watch a variable's type change inside a conditional branch (narrowing)
- Inspect individual properties in an object to see their inferred types
- Hover over a method name in a chain to see inferred generic types mid-chain

**Type error example** — `typeof null === "object"` gotcha:

```
function getElement(elOrId: string | HTMLElement | null ): HTMLElement {
if ( typeof elOrId === 'object') {
return elOrId;
// ~~~ Type 'HTMLElement | null' is not assignable to type 'HTMLElement'
} else if (elOrId === null ) {
return document.body;
}
elOrId
// ^? (parameter) elOrId: string
return document.getElementById(elOrId);
// ~~~ Type 'HTMLElement | null' is not assignable to type 'HTMLElement'
}
```

Fix — check `null` first, then `typeof`:

```
function getElement(elOrId: string |HTMLElement| null ): HTMLElement {
if (elOrId === null ) {
return document.body;
} else if ( typeof elOrId === 'object') {
return elOrId;
// ^? (parameter) elOrId: HTMLElement
}
const el = document.getElementById(elOrId);
// ^? (parameter) elOrId: string
if (!el) {
throw new Error(`No such element ${elOrId}`);
}
return el;
// ^? const el: HTMLElement
}
```

**Refactoring tools:**

- Rename a symbol (F2 in VS Code) — scope-aware, only renames the correct variable among shadowed names
- Rename/move a file — updates all imports automatically
- Move a symbol into a new file

**Go to Definition** navigates into type declaration files (e.g., `lib.dom.d.ts`):

```
declare function fetch(
input: RequestInfo | URL, init?: RequestInit
): Promise<Response>;
```

```
type RequestInfo = Request | string ;
```

```
interface RequestInit {
body?: BodyInit | null ;
cache?: RequestCache;
credentials?: RequestCredentials;
headers?: HeadersInit;
// ...
}
```

Type declarations show how a library is modeled and help debug errors.

**Things to Remember**

- Take advantage of the TypeScript language services by using an editor that supports them.
- Use your editor to build an intuition for how the type system works and how TypeScript infers types.
- Familiarize yourself with TypeScript's refactoring tools, e.g., renaming symbols and files.
- Know how to jump into type declaration files to see how they model behavior.

### Item 7: Think of Types as Sets of Values

A **type** is a set of possible values — its **domain**.

**Type hierarchy by domain size:**

| Type | Domain |
|------|--------|
| `never` | Empty set — no values assignable |
| Literal type (`'A'`, `12`) | Single-element set |
| Union of literals (`'A' \| 'B'`) | Multi-element finite set |
| `number`, `string` | Infinite set |
| `unknown` | All JavaScript values (top type) |

```
const x: never = 12;
// ~ Type 'number' is not assignable to type 'never'.
```

```
type A = 'A';
type B = 'B';
type Twelve = 12;
type AB = 'A' | 'B';
type AB12 = 'A' | 'B' | 12;
```

**"Assignable to" means "subset of":**

```
const a: AB = 'A'; // OK, value 'A' is a member of the set {'A', 'B'}
const c: AB = 'C';
// ~ Type '"C"' is not assignable to type 'AB'
```

```
// OK, {"A", "B"} is a subset of {"A", "B"}:
const ab: AB = Math.random() < 0.5? 'A' : 'B';
const ab12: AB12 = ab; // OK, {"A", "B"} is a subset of {"A", "B", 12}
```

```
declare let twelve: AB12;
const back: AB = twelve;
// ~~~~ Type 'AB12' is not assignable to type 'AB'
// Type '12' is not assignable to type 'AB'
```

**Intersection (`&`) — values must satisfy both interfaces:**

```
interface Person {
name: string ;
}
interface Lifespan {
birth: Date;
death?: Date;
}
type PersonSpan = Person & Lifespan;
```

- Counter-intuitive: `Person & Lifespan` is NOT `never` — it contains objects that have all properties of both
- The intersection of the _value sets_ is non-empty even though the _property sets_ don't overlap
- General rule: values in an intersection type contain the **union** of properties from each constituent

**`keyof` of union vs. intersection:**

```
type K = keyof (Person | Lifespan);
// ^? type K = never
```

```
// These are relationships, not TypeScript code:
keyof (A&B) = ( keyof A) | ( keyof B)
keyof (A|B) = ( keyof A) & ( keyof B)
```

`keyof` of a union is `never` because TypeScript can't know which keys are present on every possible value.

**`extends` means "subset of":**

```
interface Person {
name: string ;
}
interface PersonSpan extends Person {
birth: Date;
death?: Date;
}
```

You can narrow a property type in a subtype as long as it's still assignable to the base:

```
interface NullyStudent {
name: string ;
ageYears: number | null ;
}
interface Student extends NullyStudent {
ageYears: number ; // OK — number is assignable to number | null
}
```

```
interface StringyStudent extends NullyStudent {
// ~~~~~~~~~~~~~~
// Interface 'StringyStudent' incorrectly extends interface 'NullyStudent'.
ageYears: number | string ; // Error — string is not assignable to number | null
}
```

**`extends` in generic constraints also means "subset of":**

```
function getKey<K extends string >(val: any , key: K) {
// ...
}
```

Valid `K`: string literal types, unions of string literals, template literal types, `string` itself. Not `number`:

```
getKey({}, 'x'); // OK, 'x' extends string
getKey({}, Math.random() < 0.5? 'a' : 'b'); // OK, 'a'|'b' extends string
getKey({}, document.title); // OK, string extends string
getKey({}, 12);
// ~~ Type 'number' is not assignable to parameter of type 'string'
```

**Arrays and tuples:**

```
const list = [1, 2];
// ^? const list: number[]
const tuple: [ number , number ] = list;
// ~~~~~ Type 'number[]' is not assignable to type '[number, number]'
// Target requires 2 element(s) but source may have fewer
```

```
const triple: [ number , number , number ] = [1, 2, 3];
const double : [ number , number ] = triple;
// ~~~~~~ '[number, number, number]' is not assignable to '[number, number]'
// Source has 3 element(s) but target allows only 2.
```

TypeScript models `[number, number]` as `{0: number, 1: number, length: 2}` — the explicit `length` is what prevents triple from being assigned to pair.

**`readonly` caveat — same domain, different capabilities:**

```
interface Lockbox {
code: number ;
}
interface ReadonlyLockbox {
readonly code: number ;
}
```

These have the same domain (same assignable values), but differ in what operations are allowed:

```
const box: Lockbox = { code: 4216 };
const robox: ReadonlyLockbox = { code: 3625 };
box.code = 1234; // ok
robox.code = 1234;
// ~~~~ Cannot assign to 'code' because it is a read-only property.
```

**`Exclude` utility:**

```
type T = Exclude< string |Date, string | number >;
// ^? type T = Date
type NonZeroNums = Exclude< number , 0>;
// ^? type NonZeroNums = number  // can't subtract non-literal from infinite set
```

**TypeScript / set theory correspondence:**

| TypeScript term | Set term |
|-----------------|----------|
| `never` | ∅ (empty set) |
| Literal type | Single element set |
| Value assignable to `T` | Value ∈ T (member of) |
| `T1` assignable to `T2` | T1 ⊆ T2 (subset of) |
| `T1 extends T2` | T1 ⊆ T2 (subset of) |
| `T1 \| T2` | T1 ∪ T2 (union) |
| `T1 & T2` | T1 ∩ T2 (intersection) |
| `unknown` | Universal set |

**Things to Remember**

- Think of types as sets of values (the type's domain). These sets can either be finite (e.g., `boolean` or literal types) or infinite (e.g., `number` or `string`).
- TypeScript types form intersecting sets (a Venn diagram) rather than a strict hierarchy. Two types can overlap without either being a subtype of the other.
- Remember that an object can still belong to a type even if it has additional properties that were not mentioned in the type declaration.
- Type operations apply to a set's domain. The domain of `A | B` is the union of the domains of `A` and `B`.
- Think of "extends," "assignable to," and "subtype of" as synonyms for "subset of."

#### Item 8: Know How to Tell Whether a Symbol Is in the Type Space or Value Space

Every TypeScript symbol lives in exactly one of two spaces:

- **Type space** — erased at compile time; only exists during type checking
- **Value space** — present at runtime

**Same name, two spaces:**

```
interface Cylinder {
radius: number ;
height: number ;
}

const Cylinder = (radius: number , height: number ) => ({radius, height});
```

`interface Cylinder` → type space. `const Cylinder` → value space. These are completely independent.

**`instanceof` uses the value-space symbol:**

```
function calculateVolume(shape: unknown ) {
if (shape instanceof Cylinder) {
shape.radius
// ~~~~~~ Property 'radius' does not exist on type '{}'
}
}
```

`instanceof` is a JS runtime operator — `instanceof Cylinder` checks against the function value, not the interface type.

**`class` and `enum` introduce both a type and a value.** With a class:

```
class Cylinder {
radius: number ;
height: number ;
constructor (radius: number , height: number ) {
this .radius = radius;
this .height = height;
}
}

function calculateVolume(shape: unknown ) {
if (shape instanceof Cylinder) {
shape
// ^? (parameter) shape: Cylinder
shape.radius
// ^? (property) Cylinder.radius: number
}
}
```

**Alternating spaces in a single statement:**

```
interface Person {
first: string ;
last: string ;
}
const jane: Person = { first: 'Jane', last: 'Jacobs' };
// ―――― ――――――――――――――――――――――――――――――――― Values
// ―――――― Type
```

```
function email(to: Person , subject: string , body: string ): Response {
// ――――― ―― ――――――― ―――― Values
// ―――――― ―――――― ―――――― ―――――――― Types
// ...
}
```

**`typeof` — different meaning in each space:**

```
type T1 = typeof jane;
// ^? type T1 = Person
type T2 = typeof email;
// ^? type T2 = (to: Person, subject: string, body: string) => Response
```

```
const v1 = typeof jane; // Value is "object"
const v2 = typeof email; // Value is "function"
```

In value space, `typeof` returns one of eight strings: `"string"`, `"number"`, `"boolean"`, `"undefined"`, `"object"`, `"function"`, `"symbol"`, `"bigint"`.

**Property access in type space — must use bracket notation:**

```
const first: Person ['first'] = jane['first']; // Or jane.first
// ――――― ――――――――――――― Values
// ―――――― ――――――― Types
```

`obj['field']` and `obj.field` are equivalent in value space, but only `obj['field']` works in type space. You can use union types or primitives as the index:

```
type PersonEl = Person['first' | 'last'];
// ^? type PersonEl = string
type Tuple = [ string , number , Date];
type TupleEl = Tuple[ number ];
// ^? type TupleEl = string | number | Date
```

**Operators and keywords with dual meanings:**

| Construct | Value space | Type space |
|-----------|-------------|------------|
| `typeof` | Runtime type string | TypeScript type of a value |
| `&` / `\|` | Bitwise AND/OR | Intersection / union |
| `const` | Introduce variable | (use `as const` for const contexts) |
| `as const` | — | Changes inferred type to narrowest literal |
| `extends` | Subclass (`class A extends B`) | Subtype (`interface A extends B`) or generic constraint |
| `in` | `for...in` loop | Mapped type |
| `!` | Logical NOT (`!x`) | Non-null assertion (`x!`) |
| `this` | JS `this` keyword | Polymorphic `this` type |

**Destructuring gotcha — types and values mixed up:**

```
// WRONG: Person and string are interpreted as variable names
function email({
to: Person ,
// ~~~~~~ Binding element 'Person' implicitly has an 'any' type
subject: string ,
// ~~~~~~ Binding element 'string' implicitly has an 'any' type
body: string
// ~~~~~~ Binding element 'string' implicitly has an 'any' type
}) { /* ... */ }
```

```
// CORRECT: separate the destructuring from the type annotation
function email(
{to, subject, body}: {to: Person , subject: string , body: string }
) {
// ...
}
```

**Things to Remember**

- Know how to tell whether you're in type space or value space while reading a TypeScript expression. Use the TypeScript playground to build an intuition for this.
- Every value has a static type, but this is only accessible in type space. Type space constructs such as `type` and `interface` are erased and are not accessible in value space.
- Some constructs, such as `class` or `enum`, introduce both a type and a value.
- `typeof`, `this`, and many other operators and keywords have different meanings in type space and value space.

### Item 9: Prefer Type Annotations to Type Assertions

**Two ways to assign a typed value — very different behavior:**

```
interface Person { name: string };

const alice: Person = { name: 'Alice' };  // type annotation
// ^? const alice: Person
const bob = { name: 'Bob' } as Person;   // type assertion
// ^? const bob: Person
```

**Type annotation** verifies the value conforms to the type. **Type assertion** tells TypeScript to trust you over its inference.

**Annotation catches errors; assertion silences them:**

```
const alice: Person = {};
// ~~~~~ Property 'name' is missing in type '{}' but required in type 'Person'
const bob = {} as Person; // No error
```

```
const alice: Person = {
name: 'Alice',
occupation: 'TypeScript developer'
// ~~~~~~~~~ Object literal may only specify known properties,
// and 'occupation' does not exist in type 'Person'
};
const bob = {
name: 'Bob',
occupation: 'JavaScript developer'
} as Person; // No error
```

Excess property checking (Item 11) is bypassed by assertions.

**Old syntax** — `<Person>{}` is equivalent to `{} as Person` but breaks in `.tsx` files (interpreted as a JSX tag).

**Annotating arrow function return types:**

```
// Tempting but unsafe:
const people = ['alice', 'bob', 'jan'].map(
name => ({name} as Person)
); // Type is Person[]

// This would not error:
const people = ['alice', 'bob', 'jan'].map(name => ({} as Person));
// No error
```

```
// Correct: annotate the return type of the arrow function
const people = ['alice', 'bob', 'jan'].map(
(name): Person => ({name})
); // Type is Person[]
```

Note: `(name): Person` — infer `name`'s type, return type is `Person`. NOT `(name: Person)` — that annotates the parameter, not the return type.

Alternatively, annotate the outer variable:

```
const people: Person [] = ['alice', 'bob', 'jan'].map(name => ({name})); // OK
```

**When assertions are appropriate** — when you know more than TypeScript does from context:

```
document.querySelector('#myButton')?.addEventListener('click', e => {
e.currentTarget
// ^? (property) Event.currentTarget: EventTarget | null
// currentTarget is #myButton is a button element
const button = e.currentTarget as HTMLButtonElement;
// ^? const button: HTMLButtonElement
});
```

TypeScript can't know the DOM structure of your page.

**Non-null assertion (`!`):**

```
const elNull = document.getElementById('foo');
// ^? const elNull: HTMLElement | null
const el = document.getElementById('foo') as HTMLElement;
// ^? const el: HTMLElement
const el = document.getElementById('foo')!;
// ^? const el: HTMLElement  (same effect, shorter)
```

- `!` as suffix = non-null assertion; erased at runtime
- `?.` (optional chaining) = runtime null check — safer, but different semantics
- `a!.b` compiles to `a.b` and throws if null; `a?.b` short-circuits to `undefined`

**Assertion limits — types must have non-empty intersection:**

```
interface Person { name: string ; }
const body = document.body;
const el = body as Person;
// ~~~~~~~~~~~~~~
// Conversion of type 'HTMLElement' to type 'Person' may be a mistake because
// neither type sufficiently overlaps with the other. If this was intentional,
// convert the expression to 'unknown' first.
```

Escape hatch via `unknown` (every type is a subtype of `unknown`):

```
const el = document.body as unknown as Person; // OK
```

**`as const` is not a type assertion** — it's a "const context" that narrows inferred types to their most precise literal types. Safe to use.

**Things to Remember**

- Prefer type annotations (`: Type`) to type assertions (`as Type`).
- Know how to annotate the return type of an arrow function.
- Use type assertions and non-null assertions only when you know something about types that TypeScript does not.
- When you use a type assertion, include a comment explaining why it's valid.

#### Item 10: Avoid Object Wrapper Types (String, Number, Boolean, Symbol, BigInt)

**JavaScript primitives vs. object wrappers:**

JavaScript has 7 primitive types: `string`, `number`, `boolean`, `null`, `undefined`, `symbol`, `bigint`. Primitives are immutable and have no methods — but JavaScript auto-wraps them in object types to enable method calls:

```
> 'primitive'.charAt(3)
'm'
```

Under the hood: JS wraps `'primitive'` in a `String` object, calls `.charAt()`, then discards the wrapper.

**Wrapper objects are not equal to primitives or each other:**

```
> "hello" === new String("hello")
false
> new String("hello") === new String("hello")
false
```

**Properties assigned to primitives disappear:**

```
> x = "hello"
'hello'
> x.language = 'English'
'English'
> x.language
undefined
```

The property is set on a temporary `String` wrapper object that's immediately discarded.

**TypeScript primitive vs. wrapper types:**

| Primitive | Wrapper (avoid) |
|-----------|-----------------|
| `string` | `String` |
| `number` | `Number` |
| `boolean` | `Boolean` |
| `symbol` | `Symbol` |
| `bigint` | `BigInt` |

**Using wrapper types breaks assignability:**

```
function isGreeting(phrase: String) {
return ['hello', 'good day'].includes(phrase);
// ~~~~~~
// Argument of type 'String' is not assignable to parameter of type 'string'.
// 'string' is a primitive, but 'String' is a wrapper object.
// Prefer using 'string' when possible.
}
```

- `string` is assignable to `String` (primitive can be widened to wrapper)
- `String` is NOT assignable to `string` (wrapper cannot be used where primitive expected)

**Misleading annotations with capital letters:**

```
const s: String = "primitive";
const n: Number = 12;
const b: Boolean = true ;
```

These work at the type level but are misleading and redundant. Stick with lowercase primitives.

**`BigInt` and `Symbol` without `new`** create primitives (not wrappers):

```
> typeof BigInt(1234)
'bigint'
> typeof Symbol('sym')
'symbol'
```

You can also write `123n` to create a `bigint` literal directly.

The `ban-types` rule in `typescript-eslint` (enabled by `@typescript-eslint/recommended`) prohibits object wrapper types.

**Things to Remember**

- Avoid TypeScript object wrapper types. Use the primitive types instead: `string` instead of `String`, `number` instead of `Number`, `boolean` instead of `Boolean`, `symbol` instead of `Symbol`, and `bigint` instead of `BigInt`.
- Understand how object wrapper types are used to provide methods on primitive values. Avoid instantiating them or using them directly, with the exception of `Symbol` and `BigInt`.

### Item 11: Distinguish Excess Property Checking from Type Checking

**Structural typing allows extra properties:**

```
interface Room {
numDoors: number ;
ceilingHeightFt: number ;
}
const r: Room = {
numDoors: 1,
ceilingHeightFt: 10,
elephant: 'present',
// ~~~~~~~ Object literal may only specify known properties,
// and 'elephant' does not exist in type 'Room'
};
```

But this is allowed:

```
const obj = {
numDoors: 1,
ceilingHeightFt: 10,
elephant: 'present',
};
const r: Room = obj; // OK
```

The error in the first case is **excess property checking** — a separate, additional check that only applies to **object literals** assigned to a typed variable/parameter.

**Why this matters — typo detection:**

```
interface Options {
title: string ;
darkMode?: boolean ;
}
function createWindow(options: Options) { /* ... */ }
createWindow({
title: 'Spider Solitaire',
darkmode: true
// ~~~~~~~ Object literal may only specify known properties,
// but 'darkmode' does not exist in type 'Options'.
// Did you mean to write 'darkMode'?
});
```

Without excess property checking, this would silently pass — `Options` is structurally broad enough to accept objects with extra properties (e.g., `document` and `new HTMLAnchorElement()` are assignable to `Options`).

**When excess property checking triggers:**

- Object literal assigned directly to a typed variable
- Object literal passed directly as a function argument
- Object literal as the return value of a function with a declared return type

**When it does NOT trigger:**

- Intermediate variable without type annotation (object is no longer "fresh")
- Type assertions

```
const intermediate = { darkmode: true , title: 'Ski Free' };
const o: Options = intermediate; // OK — no excess property checking

const o = { darkmode: true , title: 'MS Hearts' } as Options; // OK — assertion bypasses it
```

**Suppressing with an index signature:**

```
interface Options {
darkMode?: boolean ;
[otherOptions: string ]: unknown ;
}
const o: Options = { darkmode: true }; // OK
```

**Weak type check** — applies to types with only optional properties ("weak types"):

```
interface LineChartOptions {
logscale?: boolean ;
invertedYAxis?: boolean ;
areaChart?: boolean ;
}
function setOptions(options: LineChartOptions) { /* ... */ }

const opts = { logScale: true };
setOptions(opts);
// ~~~~ Type '{ logScale: boolean; }' has no properties in common
// with type 'LineChartOptions'
```

- Unlike excess property checking, weak type checking is NOT bypassed by intermediate variables
- It applies during all assignability checks for weak types
- "Weak type" is a TypeScript technical term for interfaces with only optional properties

**Things to Remember**

- When you assign an object literal to a variable with a known type or pass it as an argument to a function, it undergoes excess property checking.
- Excess property checking is an effective way to find errors, but it is distinct from the usual structural assignability checks done by the TypeScript type checker. Conflating these processes will make it harder for you to build a mental model of assignability. TypeScript types are not "closed."
- Be aware of the limits of excess property checking: introducing an intermediate variable will remove these checks.
- A "weak type" is an object type with only optional properties. For these types, assignability checks require at least one matching property.

### Item 12: Apply Types to Entire Function Expressions When Possible

**Function statement vs. expression:**

```
function rollDice1(sides: number ): number { /* ... */ } // Statement
const rollDice2 = function (sides: number ): number { /* ... */ }; // Expression
const rollDice3 = (sides: number ): number => { /* ... */ }; // Also expression
```

**Typing an entire function expression at once:**

```
type DiceRollFn = (sides: number ) => number ;
const rollDice: DiceRollFn = sides => { /* ... */ };
```

TypeScript infers the type of `sides` from the function type — no need to annotate parameters.

**Reducing repetition with a shared function type:**

```
// Verbose — repeated type annotations:
function add(a: number , b: number ) { return a + b; }
function sub(a: number , b: number ) { return a - b; }
function mul(a: number , b: number ) { return a * b; }
function div(a: number , b: number ) { return a / b; }
```

```
// Better — single function type:
type BinaryFn = (a: number , b: number ) => number ;
const add: BinaryFn = (a, b) => a + b;
const sub: BinaryFn = (a, b) => a - b;
const mul: BinaryFn = (a, b) => a * b;
const div: BinaryFn = (a, b) => a / b;
```

**Matching another function's signature with `typeof`:**

```
const checkedFetch: typeof fetch = async (input, init) => {
const response = await fetch(input, init);
if (!response.ok) {
throw new Error(`Request failed: ${response.status}`);
}
return response;
}
```

- Parameters `input` and `init` are inferred from `typeof fetch`
- Return type is enforced — if you write `return new Error(...)` instead of `throw`, TypeScript catches the mismatch:

```
const checkedFetch: typeof fetch = async (input, init) => {
// ~~~~~~~~~~~~
// 'Promise<Response | HTTPError>' is not assignable to 'Promise<Response>'
const response = await fetch(input, init);
if (!response.ok) {
return new Error('Request failed: ' + response.status); // should be throw
}
return response;
}
```

**Matching parameter types but changing return type — use `Parameters`:**

```
async function fetchANumber(
...args: Parameters< typeof fetch>
): Promise< number > {
const response = await checkedFetch(...args);
const num = Number( await response.text());
if (isNaN(num)) {
throw new Error(`Response was not a number.`);
}
return num;
}
```

The editor shows the actual `fetch` parameter names (not `args`):

```
fetchANumber
// ^? function fetchANumber(
// input: RequestInfo | URL, init?: RequestInit | undefined
// ): Promise<number>
```

**Things to Remember**

- Consider applying type annotations to entire function expressions, rather than to their parameters and return type.
- If you're writing the same type signature repeatedly, factor out a function type or look for an existing one.
- If you're a library author, provide types for common callbacks.
- Use `typeof fn` to match the signature of another function, or `Parameters` and a rest parameter if you need to change the return type.

### Item 13: Know the Differences Between type and interface

**Both can represent the same object type:**

```
type TState = {
name: string ;
capital: string ;
};

interface IState {
name: string ;
capital: string ;
}
```

**Similarities:**

- Both support index signatures: `{ [key: string]: string }`
- Both can define function types (though `type` syntax is more concise):

```
type TFn = (x: number ) => string ;
interface IFn {
(x: number ): string ;
}
```

- Both can be generic
- Both can extend each other (with a caveat — see below)
- Both can be implemented by a class
- Both can be recursive

**Differences — what only `type` can do:**

- **Union types**: `type AorB = 'a' | 'b'` — no equivalent with `interface`
- **Tuple/array types** — more natural syntax:

```
type Pair = [a: number , b: number ];
type StringList = string [];
type NamedNums = [ string , ... number []];
```

- **Mapped types** and **conditional types**
- **Intersection of union types**:

```
type NamedVariable = (Input | Output) & { name: string };
// Cannot be expressed with interface
```

**`interface extends` gives more error checking than `type &`:**

```
interface Person {
name: string ;
age: string ;
}

type TPerson = Person & { age: number ; }; // no error, but age is never (string & number)

interface IPerson extends Person {
// ~~~~~~~ Interface 'IPerson' incorrectly extends interface 'Person'.
// Types of property 'age' are incompatible.
// Type 'number' is not assignable to type 'string'.
age: number ;
}
```

Prefer `extends` with interfaces for stricter checking when extending.

**Differences — what only `interface` can do:**

**Declaration merging** — two `interface` declarations with the same name in the same file are merged:

```
interface IState {
name: string ;
capital: string ;
}
interface IState {
population: number ;
}
const wyoming: IState = {
name: 'Wyoming',
capital: 'Cheyenne',
population: 578_000
}; // OK
```

This is how TypeScript models JavaScript version differences in `lib.es5.d.ts` vs `lib.es2015.core.d.ts` — the `Array` interface is augmented per target version.

**Interface names appear consistently in error messages.** Type aliases may be inlined in error messages and `.d.ts` output:

- A `type` alias can be inlined when generating `.d.ts` files (TypeScript replaces the name with the structure)
- An `interface` always keeps its name — if it's out of scope when generating `.d.ts`, TypeScript reports an error

**Caveat on `interface extends type`:** An interface can only extend object types that could have been defined with `interface`. You can't `extend` a union type — use `type` and `&` instead.

**Which to use:**

- For complex types (union, mapped, conditional, tuple): must use `type`
- For objects in a new project without established style: prefer `interface`
  - More consistent name in error messages
  - Better checks when extending
  - Supports declaration merging (needed for `.d.ts` files)
- The TypeScript handbook: "use `interface` until you need to use features from `type`"
- Enforce consistency with `typescript-eslint`'s `consistent-type-definitions` rule

**Things to Remember**

- Understand the differences and similarities between `type` and `interface`.
- Know how to write the same types using either syntax.
- Be aware of declaration merging for `interface` and type inlining for `type`.
- For projects without an established style, prefer `interface` to `type` for object types.

### Item 14: Use readonly to Avoid Errors Associated with Mutation

**Mutation bug example:**

```
function printTriangles(n: number ) {
const nums = [];
for ( let i = 0; i < n; i++) {
nums.push(i);
console.log(arraySum(nums));
}
}
```

```
function arraySum(arr: number []) {
let sum = 0, num;
while ((num = arr.pop()) !== undefined ) {
sum += num;
}
return sum;
}
```

`arraySum` empties the array as a side effect. TypeScript doesn't catch this without `readonly`. Output is `0 1 2 3 4` instead of `0 1 3 6 10`.

**`readonly` on a property:**

```
interface PartlyMutableName {
readonly first: string ;
last: string ;
}

const jackie: PartlyMutableName = { first: 'Jacqueline', last: 'Kennedy' };
jackie.last = 'Onassis'; // OK
jackie.first = 'Jacky';
// ~~~~~ Cannot assign to 'first' because it is a read-only property.
```

**`Readonly<T>` utility type** — makes all properties readonly:

```
interface FullyMutableName {
first: string ;
last: string ;
}
type FullyImmutableName = Readonly<FullyMutableName>;
// ^? type FullyImmutableName = {
// readonly first: string;
// readonly last: string;
// }
```

**Caveat 1 — `readonly` and `Readonly<T>` are shallow:**

```
interface Outer {
inner: {
x: number ;
}
}
const obj: Readonly<Outer> = { inner: { x: 0 }};
obj.inner = { x: 1 };
// ~~~~~ Cannot assign to 'inner' because it is a read-only property
obj.inner.x = 1; // OK — x is not readonly
```

`Readonly<Outer>` makes `inner` readonly (can't reassign the reference) but does NOT make `x` readonly. No built-in deep readonly — use a library like `ts-essentials` (`DeepReadonly`).

**Caveat 2 — `Readonly` only affects properties, not methods:**

```
const date: Readonly<Date> = new Date();
date.setFullYear(2037); // OK, but mutates date!
```

Methods that mutate the underlying object are not removed by `Readonly`.

**`readonly T[]` vs `T[]`:**

- `Array<T>` has mutating methods (`pop`, `shift`, etc.) and a mutable index
- `ReadonlyArray<T>` omits mutating methods, has `readonly length` and `readonly [n: number]: T`
- `T[]` is a subtype of `readonly T[]` (mutable is more capable)
- You can assign `T[]` to `readonly T[]`, but not vice versa:

```
const a: number [] = [1, 2, 3];
const b: readonly number [] = a;  // OK
const c: number [] = b;
// ~ Type 'readonly number[]' is 'readonly' and cannot be
// assigned to the mutable type 'number[]'
```

**Fixing the arraySum example:**

```
// Step 1: try passing a readonly view — but arraySum takes mutable array
console.log(arraySum(nums as readonly number []));
// ~~~~~~~~~~~~~~~~~~~~~~~~~
// The type 'readonly number[]' is 'readonly' and cannot be
// assigned to the mutable type 'number[]'.
```

```
// Step 2: change arraySum to accept readonly array — catches the pop() bug
function arraySum(arr: readonly number []) {
let sum = 0, num;
while ((num = arr.pop()) !== undefined ) {
// ~~~ 'pop' does not exist on type 'readonly number[]'
sum += num;
}
return sum;
}
```

```
// Step 3: fix the implementation
function arraySum(arr: readonly number []) {
let sum = 0;
for ( const num of arr) {
sum += num;
}
return sum;
}
```

**When you give a parameter a `readonly` type:**

- TypeScript checks that the parameter isn't mutated in the function body
- Callers can pass `readonly` arrays or `Readonly` objects
- Callers know the function won't mutate their data

**`readonly` vs `const`:**

- `const` prevents **reassignment** of the variable binding
- `readonly` prevents **mutation** of the value's properties / elements
- You can still reassign a `readonly` parameter (it's like `let`, not `const`) — callers don't see reassignments, but they would see mutations

**`readonly` is contagious** — marking one function `readonly` often requires marking callers and callees too. For third-party libraries where you can't change declarations, use a type assertion (`param as number[]`) or patch the declarations.

**Things to Remember**

- If your function does not modify its parameters, declare them `readonly` (arrays) or `Readonly` (object types). This makes the function's contract clearer and prevents inadvertent mutations in its implementation.
- Understand that `readonly` and `Readonly` are shallow, and that `Readonly` only affects properties, not methods.
- Use `readonly` to prevent errors with mutation and to find the places in your code where mutations occur.
- Understand the difference between `const` and `readonly`: the former prevents reassignment, the latter prevents mutation.

### Item 15: Use Type Operations and Generic Types to Avoid Repeating Yourself

**The DRY principle applies to types.** Repeated type declarations diverge just like repeated code.

**Techniques to reduce type duplication:**

**1. Name the type:**

```
// Before:
function distance(a: {x: number , y: number }, b: {x: number , y: number }) { /* ... */ }

// After:
interface Point2D {
x: number ;
y: number ;
}
function distance(a: Point2D, b: Point2D) { /* ... */ }
```

**2. Factor out a function type:**

```
type HTTPFunction = (url: string , opts: Options) => Promise<Response>;
const get: HTTPFunction = (url, opts) => { /* ... */ };
const post: HTTPFunction = (url, opts) => { /* ... */ };
```

**3. Extend the interface:**

```
interface Person {
firstName: string ;
lastName: string ;
}
interface PersonWithBirthDate extends Person {
birth: Date;
}
```

**4. Factor out a base interface for shared fields:**

```
interface Vertebrate {
weightGrams: number ;
color: string ;
isNocturnal: boolean ;
}
interface Bird extends Vertebrate {
wingspanCm: number ;
}
interface Mammal extends Vertebrate {
eatsGardenPlants: boolean ;
}
```

**5. Index into a type to avoid duplicating property types:**

```
interface State {
userId: string ;
pageTitle: string ;
recentFiles: string [];
pageContents: string ;
}

// Instead of repeating types:
interface TopNavState {
userId: State['userId'];
pageTitle: State['pageTitle'];
recentFiles: State['recentFiles'];
};
```

**6. Mapped type (and `Pick`):**

```
type TopNavState = {
[K in 'userId' | 'pageTitle' | 'recentFiles']: State[K]
};
```

```
// Standard library equivalent:
type Pick<T, K> = { [k in K]: T[k] };
type TopNavState = Pick<State, 'userId' | 'pageTitle' | 'recentFiles'>;
```

**7. Extract tag type from a tagged union:**

```
interface SaveAction { type : 'save'; }
interface LoadAction { type : 'load'; }
type Action = SaveAction | LoadAction;

type ActionType = Action['type'];
// ^? type ActionType = "save" | "load"
```

Note: `Pick<Action, 'type'>` gives `{ type: "save" | "load" }` (an object), not the bare union.

**8. `Partial<T>` for optional-all-fields pattern:**

```
type OptionsUpdate = {[k in keyof Options]?: Options[k]};
// equivalent to:
// Partial<Options>
```

```
class UIWidget {
constructor (init: Options) { /* ... */ }
update(options: Partial<Options>) { /* ... */ }
}
```

**9. Mapped type with key renaming (`as` clause):**

```
interface ShortToLong {
q: 'search';
n: 'numberOfResults';
}
type LongToShort = { [k in keyof ShortToLong as ShortToLong[k]]: k };
// ^? type LongToShort = { search: "q"; numberOfResults: "n"; }
```

**Homomorphic mapped types** — when the index is `K in keyof T`, modifiers (`readonly`, `?`) and TSDoc are preserved:

```
interface Customer {
/** How the customer would like to be addressed. */
title?: string ;
/** Complete name as entered in the system. */
readonly name: string ;
}

type PickTitle = Pick<Customer, 'title'>;
// ^? type PickTitle = { title?: string; }
type PickName = Pick<Customer, 'name'>;
// ^? type PickName = { readonly name: string; }
type ManualName = { [K in 'name']: Customer[K]; };
// ^? type ManualName = { name: string; }  — NOT homomorphic, modifiers lost
```

Homomorphic mapped types also allow primitive types to pass through:

```
type PartialNumber = Partial< number >;
// ^? type PartialNumber = number
```

**10. `typeof` to derive a type from a value:**

```
const INIT_OPTIONS = {
width: 640,
height: 480,
color: '#00FF00',
label: 'VGA',
};
type Options = typeof INIT_OPTIONS;
```

Use when the value is the single source of truth (e.g., a schema). Be careful: it's usually better to define the type first and have the value conform to it.

**11. `ReturnType` to capture a function's return type:**

```
type UserInfo = ReturnType< typeof getUserInfo>;
```

Operates on the function's type (`typeof getUserInfo`), not the function value.

**Avoid premature abstraction** — shared shape does not always mean shared semantics:

```
// Don't do this!
interface NamedAndIdentified {
id: number ;
name: string ;
}
interface Product extends NamedAndIdentified {
priceDollars: number ;
}
interface Customer extends NamedAndIdentified {
address: string ;
}
```

`Product.id` and `Customer.id` may evolve independently. If it's hard to name the abstraction (here, `NamedAndIdentified` just describes structure), it may not be a useful one. "Duplication is far cheaper than the wrong abstraction."

**Things to Remember**

- The DRY (don't repeat yourself) principle applies to types as much as it applies to logic.
- Name types rather than repeating them. Use `extends` to avoid repeating fields in interfaces.
- Build an understanding of the tools provided by TypeScript to map between types. These include `keyof`, `typeof`, indexing, and mapped types.
- Generic types are the equivalent of functions for types. Use them to map between types instead of repeating type-level operations.
- Familiarize yourself with generic types defined in the standard library, such as `Pick`, `Partial`, and `ReturnType`.
- Avoid over-application of DRY: make sure the properties and types you're sharing are really the same thing.

### Item 16: Prefer More Precise Alternatives to Index Signatures

**Index signature syntax:**

```
type Rocket = {[property: string ]: string };
```

Three parts:
1. **Key name** (`property`) — documentation only, not used by the type checker
2. **Key type** — must be a subtype of `string | number | symbol` (use `string` or a string subtype; avoid `number` — see Item 17)
3. **Value type** — can be anything

**Drawbacks of index signatures:**

- Any key is accepted, including typos (`Name` instead of `name`)
- No keys are required (`{}` is valid)
- Cannot have distinct types for different keys
- No autocomplete — TypeScript doesn't know which keys are valid

**When to use more precise types instead:**

```
// Index signature — too loose:
type Rocket = {[property: string ]: string };

// Interface — precise:
interface Rocket {
name: string ;
variant: string ;
thrust_kN: number ;  // can be a different type
}
```

**Appropriate use case — truly dynamic data:**

```
function parseCSV(input: string ): {[columnName: string ]: string }[] {
const lines = input.split('\n');
const [headerLine, ...rows] = lines;
const headers = headerLine.split(',');
return rows.map(rowStr => {
const row: {[columnName: string ]: string } = {};
rowStr.split(',').forEach((cell, i) => {
row[headers[i]] = cell;
});
return row;
});
}
```

When column names aren't known at compile time, an index signature is appropriate. Callers who know the shape can assert:

```
const products = parseCSV(csvData) as unknown [] as ProductRow[];
```

Guard against missing keys by using `string | undefined` as the value type, or enable `noUncheckedIndexedAccess`.

**Prefer `Map` for truly dynamic data:**

```
function parseCSVMap(input: string ): Map< string , string >[] { /* ... */ }

const thrust_kN = superHeavy.get('thrust_kN');
// ^? const thrust_kN: string | undefined  — always includes undefined
```

`Map` also avoids prototype chain gotchas. Downside: need explicit parsing to get typed objects:

```
function parseRocket(map: Map< string , string >): Rocket {
const name = map.get('name');
const variant = map.get('variant');
const thrust_kN = Number(map.get('thrust_kN'));
if (!name || !variant || isNaN(thrust_kN)) {
throw new Error(`Invalid rocket: ${map}`);
}
return {name, variant, thrust_kN};
}
```

This validates the shape on load rather than at point of use.

**Constrained alternatives when keys are limited:**

```
interface Row1 { [column: string ]: number } // Too broad
interface Row2 { a: number ; b?: number ; c?: number ; d?: number } // Better
type Row3 =
| { a: number ; }
| { a: number ; b: number ; }
| { a: number ; b: number ; c: number ; }
| { a: number ; b: number ; c: number ; d: number }; // Most precise
```

**`Record<K, V>` for constrained key types:**

```
type Vec3D = Record<'x' | 'y'' | 'z', number >;
// ^? type Vec3D = {
// x: number;
// y: number;
// z: number;
// }
```

`Record` is a built-in wrapper around a mapped type.

**Index signature to allow extra properties (disabling excess property checking):**

```
interface ButtonProps {
title: string ;
onClick: () => void ;
[otherProps: string ]: unknown ;
}
```

Now arbitrary extra props are allowed, while `title` and `onClick` retain their specific types.

**Things to Remember**

- Understand the drawbacks of index signatures: much like `any`, they erode type safety and reduce the value of language services.
- Prefer more precise types to index signatures when possible: interfaces, `Map`, Records, mapped types, or index signatures with a constrained key space.

### Item 17: Avoid Numeric Index Signatures

**JavaScript object keys are always strings (or symbols):**

```
> { 1: 2, 3: 4}
{ '1': 2, '3': 4 }
```

Numbers used as property names are converted to strings at runtime.

**Arrays use string keys internally:**

```
> x = [1, 2, 3]
> x['1']
2
> Object.keys(x)
[ '0', '1', '2' ]
```

**TypeScript's `Array<T>` uses a numeric index signature — this is a fiction:**

```
interface Array<T> {
// ...
[n: number ]: T;
}
```

This is not real (keys are strings at runtime), but it's a helpful fiction that catches bugs:

```
const xs = [1, 2, 3];
const x0 = xs[0]; // OK
const x1 = xs['1']; // stringified numeric constants are also OK

const inputEl = document.getElementsByTagName('input')[0];
const xN = xs[inputEl.value];
// ~~~~~~~~~~~~~ Index expression is not of type 'number'.
```

**Pattern: numeric index means what goes in is a `number`, but what comes out is a `string`:**

```
const keys = Object.keys(xs);
// ^? const keys: string[]
```

**When you want a numeric-indexed type — use `Array`, tuple, `ArrayLike`, or `Iterable`:**

```
// ArrayLike — just length and numeric index, allows NodeList etc.:
function checkedAccess<T>(xs: ArrayLike<T>, i: number ): T {
if (i >= 0 && i < xs.length) {
return xs[i];
}
throw new Error(`Attempt to access ${i} which is past end of array.`)
}
```

```
// ArrayLike can be satisfied with string keys (since keys are strings at runtime):
const tupleLike: ArrayLike< string > = {
'0': 'A',
'1': 'B',
length: 2,
}; // OK
```

- Use `noUncheckedIndexedAccess` for safe array access (Item 48)
- Use `Iterable` if you just need something you can iterate over (allows generators)
- Avoid defining `number` index signatures in your own types

**Things to Remember**

- Understand that arrays are objects, so their keys are strings, not numbers. `number` as an index signature is a purely TypeScript construct designed to help catch bugs.
- Prefer `Array`, tuple, `ArrayLike`, or `Iterable` types to using `number` in an index signature yourself.
