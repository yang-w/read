### Unsoundness and the any Type

### Item 43: Use the Narrowest Possible Scope for any Types

```
declare function getPizza(): Pizza;
function eatSalad(salad: Salad) { /* ... */ }
```
```
function eatDinner() {
const pizza = getPizza();
eatSalad(pizza);
// ~~~~~
// Argument of type 'Pizza' is not assignable to parameter of type 'Salad'
pizza.slice();
}
```

Two ways to suppress the error with `any`:

```
function eatDinner1() {
const pizza: any = getPizza(); // Don't do this
eatSalad(pizza); // ok
pizza.slice(); // This call is unchecked!
}
```
```
function eatDinner2() {
const pizza = getPizza();
eatSalad(pizza as any ); // This is preferable
pizza.slice(); // this is safe
}
```

- The second form is vastly preferable: the `any` is scoped to a single expression in a function argument.
- In `eatDinner1`, `pizza` has type `any` for its entire lifetime — `pizza.slice()` is completely unchecked.
- In `eatDinner2`, after the `eatSalad` call, `pizza` still has type `Pizza` and can trigger type errors.

**`any` is contagious when returned from functions:**

```
function eatDinner1() {
const pizza: any = getPizza();
eatSalad(pizza);
pizza.slice();
return pizza; // unsafe pizza!
}
```
```
function spiceItUp() {
const pizza = eatDinner1();
// ^? const pizza: any
pizza.addRedPepperFlakes(); // This call is also unchecked!
}
```

- An `any` return type spreads silently to callers.
- Adding an explicit return type annotation prevents `any` from inadvertently "escaping."

**Using `@ts-ignore` / `@ts-expect-error` instead:**

```
function eatDinner1() {
const pizza = getPizza();
// @ts-ignore
eatSalad(pizza);
pizza.slice();
}
```
```
function eatDinner2() {
const pizza = getPizza();
// @ts-expect-error
eatSalad(pizza);
pizza.slice();
}
```

- Both silence the error on the next line without changing `pizza`'s type.
- `@ts-expect-error` is preferable: if the error disappears later, TypeScript will alert you so you can remove the directive.
- Neither is "contagious" like `any`, but don't over-rely on them — a second error on the same line will go undetected.

**Narrowing `any` in space (object properties):**

```
const config: Config = {
a: 1,
b: 2,
c: {
key: value
// ~~~ Property ... missing in type 'Bar' but required in type 'Foo'
}
};
```

Wrong — disables type checking for `a` and `b` too:
```
const config: Config = {
a: 1,
b: 2,
c: {
key: value
}
} as any ; // Don't do this!
```

Correct — only suppresses the specific property:
```
const config: Config = {
a: 1,
b: 2, // These properties are still checked
c: {
key: value as any
}
};
```

**Things to Remember**

- Make your uses of `any` as narrowly scoped as possible to avoid undesired loss of type safety elsewhere in your code.
- Never return an `any` type from a function. This will silently lead to the loss of type safety for code that calls the function.
- Use `as any` on individual properties of a larger object instead of the whole object.

### Item 44: Prefer More Precise Variants of any to Plain any

`any` encompasses all JavaScript values: numbers, strings, arrays, objects, regexes, functions, classes, DOM elements, `null`, `undefined`. When you reach for `any`, ask whether something more specific would work.

```
function getLengthBad(array: any ) { // Don't do this!
return array.length;
}
```
```
function getLength(array: any []) { // This is better
return array.length;
}
```

`any[]` over `any` gives three improvements:
- `array.length` in the body is type checked.
- Return type is inferred as `number` instead of `any`.
- Call sites are checked to ensure the argument is an array:

```
getLengthBad(/123/); // No error, returns undefined
getLength(/123/);
// ~~~~~
// Argument of type 'RegExp' is not assignable to parameter of type 'any[]'.
```
```
getLengthBad( null ); // No error, throws at runtime
getLength( null );
// ~~~~
// Argument of type 'null' is not assignable to parameter of type 'any[]'.
```

**More precise alternatives:**

| Use case | Type |
|---|---|
| Array of arrays, unknown element type | `any[][]` |
| Object with unknown values | `{[key: string]: any}` or `Record<string, any>` |
| Object (nonprimitive, can enumerate keys but not access values) | `object` |
| Any callable, no params | `() => any` |
| Any callable, one param | `(arg: any) => any` |
| Any callable, any params | `(...args: any[]) => any` (same as `Function`) |

`object` vs `Record<string, any>`:
```
function hasAKeyThatEndsWithZ(o: object) {
for ( const key in o) {
if (key.endsWith('z')) {
console.log(key, o[key]);
// ~~~~~~ Element implicitly has an 'any' type
// because type '{}' has no index signature
return true ;
}
}
return false ;
}
```
With `object` you can enumerate keys but cannot access values by index.

**Rest parameters — `any[]` vs `any`:**
```
const numArgsBad = (...args: any ) => args.length;
// ^? const numArgsBad: (...args: any) => any
const numArgsBetter = (...args: any []) => args.length;
// ^? const numArgsBetter: (...args: any[]) => number
```
`any[]` gives a typed return; `any` does not. Prefer `unknown[]` over `any[]` when you don't care about element type — it is safer.

**Things to Remember**

- When you use `any`, think about whether any JavaScript value is truly permissible.
- Prefer more precise forms of `any` such as `any[]` or `{[id: string]: any}` or `() => any` if they more accurately model your data.

### Item 45: Hide Unsafe Type Assertions in Well-Typed Functions

**Core rule:** If you have to choose between a safe, assertion-free implementation and the type signature you want, choose the type signature. The function's implementation is a hidden detail; the signature is the public API.

**Problem: returning `unknown` forces assertions on every caller**

```
interface MountainPeak {
name: string ;
continent: string ;
elevationMeters: number ;
firstAscentYear: number ;
}
```
```
async function checkedFetchJSON(url: string ): Promise< unknown > {
const response = await fetch(url);
if (!response.ok) {
throw new Error(`Unable to fetch! ${response.statusText}`);
}
return response.json();
}
```
```
export async function fetchPeak(peakId: string ): Promise<MountainPeak> {
return checkedFetchJSON(`/api/mountain-peaks/${peakId}`);
// ~~~~~ Type 'unknown' is not assignable to type 'MountainPeak'.
}
```

Changing return type to `Promise<unknown>` passes the checker but scatters assertions across call sites:
```
async function getPeaksByDate(): Promise<MountainPeak[]> {
const peaks = await Promise.all(sevenPeaks.map(fetchPeak)) as MountainPeak[];
return peaks.toSorted((a, b) => b.firstAscentYear - a.firstAscentYear);
}
```

**Solution: hide the assertion inside the function body**

```
export async function fetchPeak(peakId: string ): Promise<MountainPeak> {
return checkedFetchJSON(
`/api/mountain-peaks/${peakId}`,
) as Promise<MountainPeak>;
}
```

Callers are now clean:
```
async function getPeaksByContinent(): Promise<MountainPeak[]> {
const peaks = await Promise.all(sevenPeaks.map(fetchPeak)); // no assertion!
return peaks.toSorted((a, b) => a.continent.localeCompare(b.continent));
}
```

Localizing the assertion makes it easier to add validation:
```
export async function fetchPeak(peakId: string ): Promise<MountainPeak> {
const maybePeak = checkedFetchJSON(`/api/mountain-peaks/${peakId}`);
if (
!maybePeak ||
typeof maybePeak !== 'object' ||
!('firstAscentYear' in maybePeak)
) {
throw new Error(`Invalid mountain peak: ${JSON.stringify(maybePeak)}`);
}
return checkedFetchJSON(
`/api/mountain-peaks/${peakId}`,
) as Promise<MountainPeak>;
}
```

**Alternative: single overload hides the implementation signature**

```
export async function fetchPeak(peakId: string ): Promise<MountainPeak>;
export async function fetchPeak(peakId: string ): Promise< unknown > {
return checkedFetchJSON(`/api/mountain-peaks/${peakId}`); // OK
}
```
```
const denali = fetchPeak('denali');
// ^? const denali: Promise<MountainPeak>
```
TypeScript checks that the two signatures are compatible, but this is not fundamentally safer than a type assertion.

**When the type checker can't follow your logic:**

```
function shallowObjectEqual(a: object, b: object): boolean {
for ( const [k, aVal] of Object.entries(a)) {
if (!(k in b) || aVal !== b[k]) {
// ~~~~ Element implicitly has an 'any' type
// because type '{}' has no index signature
return false ;
}
}
return Object.keys(a).length === Object.keys(b).length;
}
```

Wrong fix — changes `b`'s type to `any`, allowing `null` at call sites:
```
function shallowObjectEqualBad(a: object, b: any ): boolean {
for ( const [k, aVal] of Object.entries(a)) {
if (!(k in b) || aVal !== b[k]) { // ok
return false ;
}
}
return Object.keys(a).length === Object.keys(b).length;
}
```
```
shallowObjectEqual({x: 1}, null )
// ~~~~ Type 'null' is not assignable to type 'object'.
shallowObjectEqualBad({x: 1}, null ); // ok, throws at runtime
```

Correct fix — narrow `any` inside the implementation, keep the signature safe:
```
function shallowObjectEqualGood(a: object, b: object): boolean {
for ( const [k, aVal] of Object.entries(a)) {
if (!(k in b) || aVal !== (b as any )[k]) {
// `(b as any)[k]` is OK because we've just checked `k in b`
return false ;
}
}
return Object.keys(a).length === Object.keys(b).length;
}
```

**Things to Remember**

- Sometimes unsafe type assertions and `any` types are necessary or expedient. When you need to use one, hide it inside a function with a correct signature.
- Don't compromise a function's type signature to fix type errors in the implementation.
- Make sure you explain why your type assertions are valid, and unit test your code thoroughly.

### Item 46: Use unknown Instead of any for Values with an Unknown Type

**The problem with returning `any`:**

```
function parseYAML(yaml: string ): any {
// ...
}
```

Without an explicit type annotation at the call site, the result gets a silent `any` type:
```
const book = parseYAML(`
name: Jane Eyre
author: Charlotte Brontë
`);
console.log(book.title); // No error, logs "undefined" at runtime
book('read'); // No error, throws "book is not a function" at runtime
```

**Use `unknown` instead:**

```
function safeParseYAML(yaml: string ): unknown {
return parseYAML(yaml);
}
const book = safeParseYAML(`
name: The Tenant of Wildfell Hall
author: Anne Brontë
`);
console.log(book.title);
// ~~~~ 'book' is of type 'unknown'
book("read");
// Error: 'book' is of type 'unknown'
```

**`any` vs `unknown` assignability:**

| Property | `any` | `unknown` | `never` |
|---|---|---|---|
| All types assignable to it | yes (top) | yes (top) | no |
| Assignable to all other types | yes | no | yes (bottom) |

- `any` violates the type system — it's simultaneously top and bottom, which disables the type checker.
- `unknown` is a proper top type: everything is assignable to it, but it is only assignable to `unknown` and `any`.
- `never` is the bottom type: nothing is assignable to it, but it is assignable to everything.

**Narrowing `unknown`:**

```
const book = safeParseYAML(`
name: Villette
author: Charlotte Brontë
`) as Book;
console.log(book.title);
// ~~~~~ Property 'title' does not exist on type 'Book'
book('read');
// Error: This expression is not callable
```

Via `instanceof`:
```
function processValue(value: unknown ) {
if (value instanceof Date) {
value
// ^? (parameter) value: Date
}
}
```

Via user-defined type guard:
```
function isBook(value: unknown ): value is Book {
return (
typeof (value) === 'object' && value !== null &&
'name' in value && 'author' in value
);
}
function processValue(value: unknown ) {
if (isBook(value)) {
value;
// ^? (parameter) value: Book
}
}
```
Note: must check `typeof value === 'object'` and non-null before `in` checks (because `typeof null === 'object'`). A user-defined type guard is no safer than a type assertion — nothing verifies the implementation.

**When `unknown` is appropriate:**
- Parse results (`parseYAML`, `JSON.parse`) — you have a value but don't know its type.
- GeoJSON `properties` field — grab bag of anything JSON-serializable:

```
interface Feature {
id?: string | number ;
geometry: Geometry;
properties: unknown ;
}
```

- Functions that don't care about element type:

```
function isSmallArray(arr: readonly unknown []): boolean {
return arr.length < 10;
}
```

**Avoid return-only type parameters (looks generic, acts like an assertion):**

```
function safeParseYAML<T>(yaml: string ): T {
return parseYAML(yaml);
}
```
This is functionally identical to a type assertion — no safer, just different syntax. Prefer returning `unknown` and letting callers assert or narrow.

**`unknown` in double assertions:**

```
declare const foo: Foo;
let barAny = foo as any as Bar;
let barUnk = foo as unknown as Bar;
```
Functionally equivalent; the `unknown` version is less alarming.

**Broad types compared:**

| Type | Includes |
|---|---|
| `{}` | All values except `null` and `undefined` |
| `Object` (capital O) | Nearly the same as `{}`; primitives assignable |
| `object` (lowercase o) | All nonprimitive types (objects, arrays, functions); no primitives |
| `unknown` | All values |

`unknown` is generally preferable to `{}` or `Object` when you want to accept any value.

**Things to Remember**

- The `unknown` type is a type-safe alternative to `any`. Use it when you know you have a value but do not know or do not care what its type is.
- Use `unknown` to force your users to use a type assertion or other form of narrowing.
- Avoid return-only type parameters, which can create a false sense of security.
- Understand the difference between `{}`, `object`, and `unknown`.

### Item 47: Prefer Type-Safe Approaches to Monkey Patching

Monkey patching = adding arbitrary properties to built-in objects (`window`, `document`, DOM elements, prototypes) at runtime. TypeScript doesn't know about these additions:

```
document.monkey = 'Tamarin';
// ~~~~~~ Property 'monkey' does not exist on type 'Document'
```

The quick fix with `any` loses type safety:
```
(document as any ).monkey = 'Tamarin'; // OK
(document as any ).monky = 'Tamarin'; // Also OK, misspelled
(document as any ).monkey = /Tamarin/; // Also OK, wrong type
```

**Option 1: Interface augmentation**

```
declare global {
interface Window {
/** The currently logged-in user */
user: User;
}
}
```

```
document.addEventListener("DOMContentLoaded", async () => {
const response = await fetch('/api/users/current-user');
const user = ( await response.json()) as User;
window.user = user; // OK
});
```
```
export function greetUser() {
alert(`Hello ${window.user.name}!`); // OK
}
```

Benefits over `any`:
- Type safety — misspellings and wrong-type assignments are flagged.
- Documentation can be attached to the property.
- Autocomplete and other language services work.
- Explicit record of what the patch is.

Drawback — runtime timing: if `user` might not be set yet, model that:
```
declare global {
interface Window {
/** The currently logged-in user */
user: User | undefined ;
}
}
```
```
export function greetUser() {
alert(`Hello ${window.user.name}!`);
// ~~~~~~~~~~~ 'window.user' is possibly 'undefined'.
}
```

Augmentation applies **globally** — it can't be scoped to specific pages or modules.

**Option 2: Narrower type assertion with a custom type**

```
type MyWindow = ( typeof window) & {
/** The currently logged-in user */
user: User | undefined ;
}
```
```
document.addEventListener("DOMContentLoaded", async () => {
const response = await fetch('/api/users/current-user');
const user = ( await response.json()) as User;
(window as MyWindow).user = user; // OK
});
```
```
export function greetUser() {
alert(`Hello ${(window as MyWindow).user.name}!`);
// ~~~~~~~~~~~~~~~~~~~~~~~~~ Object is possibly 'undefined'.
}
```

- No global modification of `Window` — `MyWindow` is only in scope where imported.
- TypeScript accepts the assertion because `Window` and `MyWindow` share properties.
- Downside: must write `(window as MyWindow)` at every access point.

**Things to Remember**

- Prefer structured code to storing data in globals or on the DOM.
- If you must store data on built-in types, use one of the type-safe approaches (augmentation or asserting a custom interface).
- Understand the scoping issues of augmentations. Include `undefined` if that's a possibility at runtime.

### Item 48: Avoid Soundness Traps

**Definition:** A type system is "sound" if every symbol's static type is guaranteed to be compatible with its runtime value (i.e., the runtime value stays in the domain of the static type).

- Soundness is about accuracy, not precision. `number` is a sound type for `Math.random()` even though a more precise type would be `[0, 1)`.
- TypeScript is **not** sound by design — it trades soundness for convenience and JavaScript interoperability.

**any**

```
function logNumber(x: number ) {
console.log(x.toFixed(1)); // x is a string at runtime
// ^? (parameter) x: number
}
const num: any = 'forty two';
logNumber(num); // no error
```
No type errors, but throws at runtime. Fix: limit or eliminate `any`; use `unknown` as a safer alternative.

**Type Assertions**

```
function logNumber(x: number ) {
console.log(x.toFixed(1));
}
const hour = ( new Date()).getHours() || null ;
// ^? const hour: number | null
logNumber(hour);
// ~~~~ ... Type 'null' is not assignable to type 'number'.
logNumber(hour as number ); // type checks, but might blow up at runtime
```

Fix: replace assertions with conditionals that narrow the type:
```
if (hour !== null ) {
logNumber(hour); // ok
// ^? const hour: number
}
```

**Object and Array Lookups**

Even in strict mode, TypeScript does no bounds checking on array or index-signature lookups:

```
const xs = [0, 1, 2];
// ^? const xs: number[]
const x = xs[3];
// ^? const x: number  (undefined at runtime)
```
```
console.log(x.toFixed(1));
// TypeError: Cannot read properties of undefined (reading 'toFixed')
```

```
type IdToName = { [id: string ]: string };
const ids: IdToName = {'007': 'James Bond'};
const agent = ids['008']; // undefined at runtime.
// ^? const agent: string
```

Options:
- Enable `noUncheckedIndexedAccess` — catches invalid accesses but also flags valid ones:
```
const xs = [1, 2, 3];
alert(xs[3].toFixed(1)); // invalid code
// ~~~~~ Object is possibly 'undefined'.
alert(xs[2].toFixed(1)); // valid code
// ~~~~~ Object is possibly 'undefined'.
```
`noUncheckedIndexedAccess` does understand `for-of` and `.map()` (no false positives there):
```
const xs = [1, 2, 3];
for ( const x of xs) {
console.log(x.toFixed(1)); // OK
}
const squares = xs.map(x => x * x); // also OK
```

- Manually add `undefined` to the value type (scoped, no smart for-of handling):
```
const xs: ( number | undefined )[] = [1, 2, 3];
alert(xs[3].toFixed(1));
// ~~~~~ Object is possibly 'undefined'.
```
```
type IdToName = { [id: string ]: string | undefined };
const ids: IdToName = {'007': 'James Bond'};
const agent = ids['008'];
// ^? const agent: string | undefined
alert(agent.toUpperCase());
// ~~~~~ 'agent' is possibly 'undefined'.
```

**Inaccurate Type Definitions**

Type declarations for a library are a giant type assertion — nothing guarantees they match runtime behavior. Examples:
- Historic `React.FC` bug: accepted `children` even when logically wrong.
- `String.prototype.replace` callback parameters — offset position depends on the number of capture groups, which TypeScript can't know statically, so parameters get `any`.
- `Object.assign` is incorrectly typed for historical reasons.

Fix: file a bug or PR (DefinitelyTyped turnaround is usually a week or less). Workaround: augmentation or type assertion.

**Bivariance in Class Hierarchies**

Functions are:
- **Covariant** in return types: a subtype can return a narrower type.
- **Contravariant** in parameter types: a subtype should accept a wider type.

```
declare function f(): number | string ;
const f1: () => number | string | boolean = f; // OK
const f2: () => number = f;
// ~~ Type '() => string | number' is not assignable to type '() => number'.
```

```
declare function f(x: number | string ): void ;
const f1: (x: number | string | boolean ) => void = f;
// ~~ Type 'string | number | boolean' is not assignable to type 'string | number'.
const f2: (x: number ) => void = f; // OK
```

TypeScript models **class methods as bivariant** (either direction is valid), which is unsound:
```
class Parent {
foo(x: number | string ) {}
bar(x: number ) {}
}
class Child extends Parent {
foo(x: number ) {} // OK
bar(x: number | string ) {} // OK
}
```
```
class FooChild extends Parent {
foo(x: number ) {
console.log(x.toFixed());
}
}
const p: Parent = new FooChild();
p.foo('string'); // No type error, crashes at runtime
```

`strictFunctionTypes` (introduced in TS 2.6) fixes standalone function types but not class methods. When changing a method signature on a class in a hierarchy, manually check the same method on parent/child classes.

**TypeScript's Inaccurate Model of Variance for Objects and Arrays**

```
function addFoxOrHen(animals: Animal[]) {
animals.push(Math.random() > 0.5? new Fox() : new Hen());
}
```
```
const henhouse: Hen[] = [ new Hen()];
addFoxOrHen(henhouse); // oh no, a fox in the henhouse!
```

`Hen[]` is assignable to `Animal[]`, but mutating via `push` is unsafe. Fix: mark parameters `readonly`:
```
function addFoxOrHen(animals: readonly Animal[]) {
animals.push(Math.random() > 0.5? new Fox() : new Hen());
// ~~~~ Property 'push' does not exist on type 'readonly Animal[]'.
}
```

Or rewrite to avoid mutation:
```
function foxOrHen(): Animal {
return Math.random() > 0.5? new Fox() : new Hen();
}
```
```
const henhouse: Hen[] = [ new Hen(), foxOrHen()];
// ~~~~~~~~~~ error, yay! Chickens are safe.
// Type 'Animal' is missing the following properties from type 'Hen': ...
```

The same issue applies to any object mutated by a function, not just arrays. General rule: **avoid mutating function parameters**; declare them `readonly` or `Readonly`.

**Function Calls Don't Invalidate Refinements**

```
interface FunFact {
fact: string ;
author?: string ;
}
```
```
function processFact(fact: FunFact, processor: (fact: FunFact) => void ) {
if (fact.author) {
processor(fact);
console.log(fact.author.blink()); // ok
// ^? (property) FunFact.author?: string
}
}
```
```
processFact(
{fact: 'Peanuts are not actually nuts', author: 'Botanists'},
f => delete f.author
);
// Type checks, but throws `Cannot read property 'blink' of undefined`.
```

`processor(fact)` should invalidate the `fact.author` refinement, but TypeScript doesn't know what the callback does to the object. Fix: pass a `Readonly` version of the object to prevent callbacks from mutating it.

**Assignability and Optional Properties**

Types in TypeScript are not "sealed" — they can have extra properties. Combined with optional properties, this leads to unsoundness:

```
interface Person {
name: string ;
}
interface PossiblyAgedPerson extends Person {
age?: number ;
}
const p1 = { name: "Serena", age: "42 years" };
const p2: Person = p1;
const p3: PossiblyAgedPerson = p2;
console.log(`${p3.name} is ${p3.age?.toFixed(1)} years old.`);
```

- `p1 → p2`: valid — `{name: string; age: string}` is assignable to `Person` (structural typing, extra props OK).
- `p2 → p3`: unsound — `p2` actually has `age: string`, but `PossiblyAgedPerson` declares `age?: number`, so `p3.age?.toFixed(1)` will fail.

Fix: use more specific property names to avoid collisions (e.g., `ageInYears` vs `ageFormatted`).

**Things to Remember**

- "Unsoundness" is when a symbol's value at runtime diverges from its static type. It can lead to crashes and other bad behavior without type errors.
- Be aware of some of the common ways that unsoundness can arise: `any` types, type assertions (`as`, `is`), object and array lookups, and inaccurate type definitions.
- Avoid mutating function parameters as this can lead to unsoundness. Mark them as `readonly` if you don't intend to mutate them.
- Make sure child classes match their parent's method declarations.
- Be aware of how optional properties can lead to unsound types.

### Item 49: Track Your Type Coverage to Prevent Regressions in Type Safety

Even with `noImplicitAny` enabled, `any` types can enter your code through:

- **Explicit `any` types** — `any[]` and `{[key: string]: any}` become plain `any` once you index into them, and the resulting `any` can flow through code.
- **Third-party type declarations** — `@types` packages can introduce `any` silently, even when you've never written `any` yourself.

**Tracking type coverage with `type-coverage`:**

```
$ npx type-coverage
9985 / 10117 98.69%
```

98.69% of symbols have a type other than `any`. A drop in this percentage signals an inadvertent regression.

```
$ npx type-coverage --detail
path/to/code.ts:1:10 getColumnInfo
path/to/module.ts:7:1 pt2
...
```

`--detail` prints every location where an `any` type occurs.

**Common sources `--detail` reveals:**

Stale explicit `any` annotation (the underlying function was updated but the annotation wasn't removed):
```
function getColumnInfo(name: string ): any {
return utils.buildColumnInfo(appState.dataSchema, name); // Returns any
}
```
If `utils.buildColumnInfo` now returns a specific type, the `: any` annotation discards that information.

Untyped module stub:
```
declare module 'my-module';
```
```
import {someMethod, someSymbol} from 'my-module'; // OK
```
```
const pt1 = { x: 1, y: 2 };
// ^? const pt1: { x: number; y: number; }
const pt2 = someMethod(pt1, someSymbol); // OK
// ^? const pt2: any
```
All symbols from the stubbed module have type `any` and spread to callers.

**Ongoing tracking:** Add `type-coverage` as a TypeScript Language Service plugin to highlight `any` types in-editor, or integrate it into CI to detect drops immediately.

**Things to Remember**

- Even with `noImplicitAny` set, `any` types can make their way into your code either through explicit `any`s or third-party type declarations (`@types`).
- Consider tracking how well-typed your program is using a tool like `type-coverage`. This will encourage you to revisit decisions about using `any` and increase type safety over time.
