**CHAPTER 3**

### Type Inference and Control Flow Analysis

- A variable has a type **at a location** in code, not a single fixed type for its lifetime.
- The process by which a variable's type changes based on surrounding code is **control flow analysis**.

---

### Item 18: Avoid Cluttering Your Code with Inferable Types

**Rule:** Don't annotate types that TypeScript can infer.

Don't write:

```
let x: number = 12;
```
Instead, just write:

```
let x = 12;
```

TypeScript infers more complex objects too — prefer the inferred form:

```
const person = {
name: 'Sojourner Truth',
born: {
where: 'Swartekill, NY',
when: 'c.1797',
},
died: {
where: 'Battle Creek, MI',
when: 'Nov. 26, 1883'
}
};
```

Return types are also inferred from inputs and operations:

```
function square(nums: number []) {
return nums.map(x => x * x);
}
const squares = square([1, 2, 3, 4]);
// ^? const squares: number[]
```

**Explicit annotations can reduce precision:**

```
const axis1: string = 'x';
// ^? const axis1: string
const axis2 = 'y';
// ^? const axis2: "y"
```

`"y"` is more precise. The explicit `string` annotation loses type information.

**Refactoring hazard with redundant annotations:**

```
interface Product {
id: string ;
name: string ;
price: number ;
}
```

```
function logProduct(product: Product) {
const id: number = product.id;
// ~~ Type 'string' is not assignable to type 'number'
const name: string = product.name;
const price: number = product.price;
console.log(id, name, price);
}
```

If `id` changes from `number` to `string` in `Product`, the explicit annotations break. Without them, no error — the code just works. Better:

```
function logProduct(product: Product) {
const {id, name, price} = product;
console.log(id, name, price);
}
```

Note: you can't put type annotations directly inside destructuring — they would be interpreted as renaming directives in value space.

**When to still annotate parameters:** TypeScript doesn't infer parameter types from usage. Annotations are required unless:
- There's a default value: `function parseNumber(str: string, base=10)` — `base` inferred as `number`
- The function is a callback for a typed library:

```
// Don't do this:
app.get('/health', (request: express.Request, response: express.Response) => {
response.send('OK');
});
```

```
// Do this:
app.get('/health', (request, response) => {
// ^? (parameter) request: Request<...>
response.send('OK');
// ^? (parameter) response: Response<...>
});
```

**When to annotate object literals:** Enables excess property checking and reports errors at the definition site rather than the use site.

Without annotation — error surfaces at call site, potentially far from where the mistake was made:

```
const furby = {
name: 'Furby',
id: 630509430963,
price: 35,
};
logProduct(furby);
// ~~~~~ Argument ... is not assignable to parameter of type 'Product'
// Types of property 'id' are incompatible
// Type 'number' is not assignable to type 'string'
```

With annotation — error surfaces immediately at definition:

```
const furby: Product = {
name: 'Furby',
id: 630509430963,
// ~~ Type 'number' is not assignable to type 'string'
price: 35,
};
logProduct(furby);
```

**When to annotate return types:**

- When a function has multiple return statements — ensures all branches return the same type.
- For public API functions — prevents implementation errors from leaking to callers.

Example: without return type annotation, this implementation bug shows up at the call site:

```
const cache: {[ticker: string ]: number } = {};
function getQuote(ticker: string ) {
if (ticker in cache) {
return cache[ticker];
}
return fetch(`https://quotes.example.com/?q=${ticker}`)
.then(response => response.json())
.then(quote => {
cache[ticker] = quote;
return quote as number ;
});
}
```

```
getQuote;
// ^? function getQuote(ticker: string): number | Promise<number>
```

The cached path returns `number` synchronously — should be `Promise.resolve(cache[ticker])`. The bug is reported at the call site:

```
getQuote('MSFT').then(considerBuying);
// ~~~~ Property 'then' does not exist on type
// 'number | Promise<number>'
```

With the annotation, the error is caught inside `getQuote`:

```
const cache: {[ticker: string ]: number } = {};
function getQuote(ticker: string ): Promise< number > {
if (ticker in cache) {
return cache[ticker];
// ~~~ Type 'number' is not assignable to type 'Promise<number>'
}
// ...
}
```

- When you want to use a named return type (rather than a structurally inferred one):

```
interface Vector2D { x: number ; y: number ; }
function add(a: Vector2D, b: Vector2D) {
return { x: a.x + b.x , y: a.y + b.y };
}
```

TypeScript infers `{ x: number; y: number; }`, not `Vector2D`. If you annotate, the named type appears in editor hints and documentation associations.

**Things to Remember**

- Avoid writing type annotations when TypeScript can infer the same type.
- Ideal TypeScript code has type annotations in function/method signatures but not on local variables in their bodies.
- Consider using explicit annotations for object literals to enable excess property checking and ensure errors are reported close to where they occur.
- Don't annotate function return types unless the function has multiple returns, is part of a public API, or you want it to return a named type.

---

### Item 19: Use Different Variables for Different Types

**Core rule:** A variable's value can change, but its type generally does not.

In JavaScript, reusing a variable with different types is fine:

```
let productId = "12-34-56";
fetchProduct(productId); // Expects a string
```

```
productId = 123456;
fetchProductBySerialNumber(productId); // Expects a number
```

In TypeScript, this produces two errors:

```
let productId = "12-34-56";
fetchProduct(productId);
```

```
productId = 123456;
// ~~~~~~ Type 'number' is not assignable to type 'string'
fetchProductBySerialNumber(productId);
// ~~~~~~~~~
// Argument of type 'string' is not assignable to parameter of type 'number'
```

TypeScript inferred `productId` as `string` from its initializer. A union type fixes the errors but creates friction everywhere the variable is used:

```
let productId: string | number = "12-34-56";
fetchProduct(productId);
```

```
productId = 123456; // OK
fetchProductBySerialNumber(productId); // OK
```

**Better solution — introduce a new variable:**

```
const productId = "12-34-56";
fetchProduct(productId);
```

```
const serial = 123456; // OK
fetchProductBySerialNumber(serial); // OK
```

Benefits:
- Disentangles two unrelated concepts (ID and serial number).
- Allows more specific variable names.
- Improves type inference — no annotations needed.
- Results in simpler types (`string` and `number`, not `string|number`).
- Allows `const` instead of `let`, making variables easier to reason about.

**Shadowed variables** (not the same issue):

```
const productId = "12-34-56";
fetchProduct(productId);
```

##### {

```
const productId = 123456; // OK
fetchProductBySerialNumber(productId); // OK
}
```

These are two distinct variables that happen to share a name. TypeScript handles this correctly, but human readers may be confused. Most teams disallow this with linter rules (e.g., `eslint`'s `no-shadow`).

**Things to Remember**

- While a variable's value can change, its type generally does not.
- To avoid confusion, both for human readers and for the type checker, avoid reusing variables for differently typed values.

---

### Item 20: Understand How a Variable Gets Its Type

**Widening:** When TypeScript initializes a variable with a constant and no explicit type, it infers a set of possible values — widening from the literal.

Example of widening causing a type error:

```
interface Vector3 { x: number ; y: number ; z: number ; }
function getComponent(vector: Vector3, axis: 'x' | 'y' | 'z') {
return vector[axis];
}
```

```
let x = 'x';
let vec = {x: 10, y: 20, z: 30};
getComponent(vec, x);
// ~ Argument of type 'string' is not assignable
// to parameter of type '"x" | "y" | "z"'
```

`x` is widened to `string` (not `"x"`), which doesn't satisfy `'x' | 'y' | 'z'`.

**Widening ambiguity — many possible types for one literal:**

```
const mixed = ['x', 1];
```

TypeScript must choose from: `('x' | 1)[]`, `['x', 1]`, `[string, number]`, `readonly [string, number]`, `(string|number)[]`, `readonly (string|number)[]`, `[any, any]`, `any[]`. It guesses `(string|number)[]`.

**General widening rule for primitives with `let`:** `"x"` → `string`, `39` → `number`, `true` → `boolean`.

**For objects — "best common type":** Each property is treated as though assigned with `let`:

```
const obj = {
x: 1,
};
obj.x = 3; // OK
obj.x = '3';
// ~ Type 'string' is not assignable to type 'number'
obj.y = 4;
// ~ Property 'y' does not exist on type '{ x: number; }'
obj.z = 5;
// ~ Property 'z' does not exist on type '{ x: number; }'
obj.name = 'Pythagoras';
// ~~~~ Property 'name' does not exist on type '{ x: number; }'
```

**Ways to control widening:**

**1. `const`** — narrows a primitive to its literal type:

```
const x = 'x';
// ^? const x: "x"
let vec = {x: 10, y: 20, z: 30};
getComponent(vec, x); // OK
```

**2. Explicit type annotation:**

```
const obj: { x: string | number } = { x: 1 };
// ^? const obj: { x: string | number; }
```

**3. `as const` assertion** — infers the narrowest possible type (no widening), makes all properties `readonly`:

```
const obj1 = { x: 1, y: 2 };
// ^? const obj1: { x: number; y: number; }
```

```
const obj2 = { x: 1 as const , y: 2 };
// ^? const obj2: { x: 1; y: number; }
```

```
const obj3 = { x: 1, y: 2 } as const ;
// ^? const obj3: { readonly x: 1; readonly y: 2; }
```

With arrays, `as const` infers a tuple:

```
const arr1 = [1, 2, 3];
// ^? const arr1: number[]
const arr2 = [1, 2, 3] as const ;
// ^? const arr2: readonly [1, 2, 3]
```

`as const` is not the same as a type assertion (`as T`). It doesn't compromise type safety.

**4. Helper function `tuple`** — infers a tuple type but still widens element types to their base types:

```
function tuple<T extends unknown []>(...elements: T) { return elements; }
```

```
const arr3 = tuple(1, 2, 3);
// ^? const arr3: [number, number, number]
const mix = tuple(4, 'five', true );
// ^? const mix: [number, string, boolean]
```

**5. `Object.freeze`** — introduces `readonly` similarly to `as const`, but enforced at runtime (shallow):

```
const frozenArray = Object.freeze([1, 2, 3]);
// ^? const frozenArray: readonly number[]
const frozenObj = Object.freeze({x: 1, y: 2});
// ^? const frozenObj: Readonly<{ x: 1; y: 2; }>
```

Unlike `as const`, `Object.freeze` is a shallow freeze (not deep `readonly`).

**6. `satisfies` operator** — validates against a type while preserving the narrower inferred type:

```
type Point = [ number , number ];
const capitals1 = { ny: [-73.7562, 42.6526], ca: [-121.4944, 38.5816] };
// ^? const capitals1: { ny: number[]; ca: number[]; }
```

```
const capitals2 = {
ny: [-73.7562, 42.6526], ca: [-121.4944, 38.5816]
} satisfies Record< string , Point>;
capitals2
// ^? const capitals2: { ny: [number, number]; ca: [number, number]; }
```

With a type annotation, you lose the precise keys:

```
const capitals3: Record< string , Point> = capitals2;
capitals3.pr; // undefined at runtime
// ^? Point
capitals2.pr;
// ~~ Property 'pr' does not exist on type '{ ny: ...; ca: ...; }'
```

`satisfies` reports errors at definition (unlike `as const` which reports at use):

```
const capitalsBad = {
ny: [-73.7562, 42.6526, 148],
// ~~ Type '[number, number, number]' is not assignable to type 'Point'.
ca: [-121.4944, 38.5816, 26],
// ~~ Type '[number, number, number]' is not assignable to type 'Point'.
} satisfies Record< string , Point>;
```

**Things to Remember**

- Understand how TypeScript infers a type from a literal by widening it.
- Familiarize yourself with the ways you can affect this behavior: `const`, type annotations, context, helper functions, `as const`, and `satisfies`.

---

### Item 21: Create Objects All at Once

**Rule:** Prefer building objects in a single expression rather than piecemeal.

Building an object incrementally produces errors:

```
const pt = {};
// ^? const pt: {}
pt.x = 3;
// ~ Property 'x' does not exist on type '{}'
pt.y = 4;
// ~ Property 'y' does not exist on type '{}'
```

The type is fixed as `{}` at initialization. Using an interface doesn't help either:

```
interface Point { x: number ; y: number ; }
const pt: Point = {};
// ~~ Type '{}' is missing the following properties from type 'Point': x, y
pt.x = 3;
pt.y = 4;
```

A type assertion avoids the immediate error but loses safety — TypeScript won't check that all required properties are assigned before use:

```
const pt = {} as Point;
// ^? const pt: Point
pt.x = 3;
pt.y = 4; // OK
```

**Best solution — define all at once:**

```
const pt: Point = {
x: 3,
y: 4,
};
```

**Combining objects — use spread syntax, not `Object.assign`:**

```
const pt = {x: 3, y: 4};
const id = {name: 'Pythagoras'};
const namedPoint = {};
Object.assign(namedPoint, pt, id);
namedPoint.name;
// ~~~~ Property 'name' does not exist on type '{}'
```

```
const namedPoint = {...pt, ...id};
// ^? const namedPoint: { name: string; x: number; y: number; }
namedPoint.name; // OK
// ^? (property) name: string
```

**Building field by field with spread** — use a new variable on each step so each gets a new type:

```
const pt0 = {};
const pt1 = {...pt0, x: 3};
const pt: Point = {...pt1, y: 4}; // OK
```

**Conditionally adding properties** — spread `{}` or any falsy value (adds no properties):

```
declare let hasMiddle: boolean ;
const firstLast = {first: 'Harry', last: 'Truman'};
const president = {...firstLast, ...(hasMiddle? {middle: 'S'} : {})};
// ^? const president: {
// middle?: string;
// first: string;
// last: string;
// }
// or: const president = {...firstLast, ...(hasMiddle && {middle: 'S'})};
```

Multiple conditional fields become optional:

```
declare let hasDates: boolean ;
const nameTitle = {name: 'Khufu', title: 'Pharaoh'};
const pharaoh = { ...nameTitle, ...(hasDates && {start: -2589, end: -2566})};
// ^? const pharaoh: {
// start?: number;
// end?: number;
// name: string;
// title: string;
// }
```

Destructuring from an optional field gives `number | undefined`:

```
const {start} = pharaoh;
// ^? const start: number | undefined
```

**Things to Remember**

- Prefer to build objects all at once rather than piecemeal.
- Use multiple objects and object spread syntax (`{...a, ...b}`) to add properties in a type-safe way.
- Know how to conditionally add properties to an object.

---

### Item 22: Understand Type Narrowing

**Narrowing (refinement):** TypeScript moves from a broad type to a more specific one based on control flow. This is control flow analysis.

**Null check:**

```
const elem = document.getElementById('what-time-is-it');
// ^? const elem: HTMLElement | null
if (elem) {
elem.innerHTML = 'Party Time'.blink();
// ^? const elem: HTMLElement
} else {
elem
// ^? const elem: null
alert('No element #what-time-is-it');
}
```

**Throw/return narrows for the rest of the block:**

```
const elem = document.getElementById('what-time-is-it');
// ^? const elem: HTMLElement | null
if (!elem) throw new Error('Unable to find #what-time-is-it');
elem.innerHTML = 'Party Time'.blink();
// ^? const elem: HTMLElement
```

**`instanceof`:**

```
function contains(text: string , search: string | RegExp) {
if (search instanceof RegExp) {
return !!search.exec(text);
// ^? (parameter) search: RegExp
}
return text.includes(search);
// ^? (parameter) search: string
}
```

**Property check with `in`:**

```
interface Apple { isGoodForBaking: boolean ; }
interface Orange { numSlices: number ; }
function pickFruit(fruit: Apple | Orange) {
if ('isGoodForBaking' in fruit) {
fruit
// ^? (parameter) fruit: Apple
} else {
fruit
// ^? (parameter) fruit: Orange
}
fruit
// ^? (parameter) fruit: Apple | Orange
}
```

**`Array.isArray`:**

```
function contains(text: string , terms: string | string []) {
const termList = Array.isArray(terms)? terms : [terms];
// ^? const termList: string[]
// ...
}
```

**Common narrowing pitfalls:**

`typeof null === "object"` in JavaScript — this check does NOT exclude null:

```
const elem = document.getElementById('what-time-is-it');
// ^? const elem: HTMLElement | null
if ( typeof elem === 'object') {
elem;
// ^? const elem: HTMLElement | null
}
```

Falsy check doesn't exclude `0` or `""`:

```
function maybeLogX(x?: number | string | null ) {
if (!x) {
console.log(x);
// ^? (parameter) x: string | number | null | undefined
}
}
```

**Tagged/discriminated unions** — explicit `type` field enables exhaustive narrowing via `switch`:

```
interface UploadEvent { type : 'upload'; filename: string ; contents: string }
interface DownloadEvent { type : 'download'; filename: string ; }
type AppEvent = UploadEvent | DownloadEvent;
```

```
function handleEvent(e: AppEvent) {
switch (e. type ) {
case 'download':
console.log('Download', e.filename);
// ^? (parameter) e: DownloadEvent
break ;
case 'upload':
console.log('Upload', e.filename, e.contents.length, 'bytes');
// ^? (parameter) e: UploadEvent
break ;
}
}
```

**User-defined type guards (type predicates):**

```
function isInputElement(el: Element): el is HTMLInputElement {
return 'value' in el;
}
```

```
function getElementContent(el: HTMLElement) {
if (isInputElement(el)) {
return el.value;
// ^? (parameter) el: HTMLInputElement
}
return el.textContent;
// ^? (parameter) el: HTMLElement
}
```

Type guards also work with `Array.filter`:

```
const formEls = document.querySelectorAll('.my-form *');
const formInputEls = [...formEls].filter(isInputElement);
// ^? const formInputEls: HTMLInputElement[]
```

**Warning:** User-defined type guards are no safer than a type assertion — the body is not verified against the predicate. There's nothing checking that `'value' in el` truly implies `HTMLInputElement`.

**Reworking code to help narrowing — `Map.has` + `Map.get`:**

TypeScript doesn't understand the relationship between `has` and `get`. This produces a type error:

```
const nameToNickname = new Map< string , string >();
declare let yourName: string ;
let nameToUse: string ;
if (nameToNickname.has(yourName)) {
nameToUse = nameToNickname.get(yourName);
// ~~~~~~ Type 'string | undefined' is not assignable to type 'string'.
} else {
nameToUse = yourName;
}
```

Fix — use the result of `get` directly:

```
const nickname = nameToNickname.get(yourName);
let nameToUse: string ;
if (nickname !== undefined ) {
nameToUse = nickname;
} else {
nameToUse = yourName;
}
```

Or more concisely with nullish coalescing:

```
const nameToUse = nameToNickname.get(yourName) ?? yourName;
```

**Narrowing doesn't persist across callbacks:**

```
function logLaterIfNumber(obj: { value: string | number }) {
if ( typeof obj.value === "number") {
setTimeout(() => console.log(obj.value.toFixed()));
// ~~~~~~~
// Property 'toFixed' does not exist on type 'string | number'.
}
}
```

The refinement is lost in the callback because by the time it runs, `obj.value` may have changed:

```
const obj: { value: string | number } = { value: 123 };
logLaterIfNumber(obj);
obj.value = 'Cookie Monster';
```

TypeScript is correct to warn here — this throws at runtime.

**Things to Remember**

- Understand how TypeScript narrows types based on conditionals and other types of control flow.
- Use tagged/discriminated unions and user-defined type guards to help the process of narrowing.
- Think about whether code can be refactored to let TypeScript follow along more easily.

---

### Item 23: Be Consistent in Your Use of Aliases

**Aliasing:** When you create a new name for a value, both names point to the same underlying object.

```
const place = {name: 'New York', latLng: [41.6868, -74.2692]};
const loc = place.latLng;
```

```
> loc[0] = 0;
0
> place.latLng
[ 0, -74.2692 ]
```

**Aliases break control flow analysis:**

```
interface Coordinate {
x: number ;
y: number ;
}
```

```
interface BoundingBox {
x: [ number , number ];
y: [ number , number ];
```

##### }

```
interface Polygon {
exterior: Coordinate[];
holes: Coordinate[][];
bbox?: BoundingBox;
}
```

This works fine (TypeScript narrows `polygon.bbox` in the `if` block):

```
function isPointInPolygon(polygon: Polygon, pt: Coordinate) {
if (polygon.bbox) {
if (pt.x < polygon.bbox.x[0] || pt.x > polygon.bbox.x[1] ||
pt.y < polygon.bbox.y[0] || pt.y > polygon.bbox.y[1]) {
return false ;
}
}
// ... more complex check
}
```

This breaks — `box` is an alias for `polygon.bbox`, but the property check on `polygon.bbox` doesn't narrow `box`:

```
function isPointInPolygon(polygon: Polygon, pt: Coordinate) {
const box = polygon.bbox;
if (polygon.bbox) {
if (pt.x < box.x[0] || pt.x > box.x[1] ||
// ~~~ ~~~ 'box' is possibly 'undefined'
pt.y < box.y[0] || pt.y > box.y[1]) {
// ~~~ ~~~ 'box' is possibly 'undefined'
return false ;
}
}
// ...
}
```

Inspecting types confirms the issue:

```
function isPointInPolygon(polygon: Polygon, pt: Coordinate) {
polygon.bbox
// ^? (property) Polygon.bbox?: BoundingBox | undefined
const box = polygon.bbox;
// ^? const box: BoundingBox | undefined
if (polygon.bbox) {
console.log(polygon.bbox);
// ^? (property) Polygon.bbox?: BoundingBox
console.log(box);
// ^? const box: BoundingBox | undefined
}
}
```

**Golden rule: if you introduce an alias, use it consistently.**

Fix — check `box` instead of `polygon.bbox`:

```
function isPointInPolygon(polygon: Polygon, pt: Coordinate) {
const box = polygon.bbox;
if (box) {
if (pt.x < box.x[0] || pt.x > box.x[1] ||
pt.y < box.y[0] || pt.y > box.y[1]) { // OK
return false ;
}
}
// ...
}
```

**Best pattern — destructuring** eliminates the aliasing problem and keeps a single name:

```
function isPointInPolygon(polygon: Polygon, pt: Coordinate) {
const {bbox} = polygon;
if (bbox) {
const {x, y} = bbox;
if (pt.x < x[0] || pt.x > x[1] || pt.y < y[0] || pt.y > y[1]) {
return false ;
}
}
// ...
}
```

**Aliasing can cause runtime divergence too:**

```
const {bbox} = polygon;
if (!bbox) {
calculatePolygonBbox(polygon); // Fills in polygon.bbox
// Now polygon.bbox and bbox refer to different values!
}
```

**Function calls can invalidate property refinements:**

```
function expandABit(p: Polygon) { /* ... */ }
```

```
polygon.bbox
// ^? (property) Polygon.bbox?: BoundingBox | undefined
if (polygon.bbox) {
polygon.bbox
// ^? (property) Polygon.bbox?: BoundingBox
expandABit(polygon);
polygon.bbox
// ^? (property) Polygon.bbox?: BoundingBox
}
```

TypeScript assumes the function does not invalidate type refinements (a pragmatic trade-off). Trust refinements on local variables more than on properties.

**Things to Remember**

- Aliasing can prevent TypeScript from narrowing types. If you create an alias for a variable, use it consistently.
- Be aware of how function calls can invalidate type refinements on properties. Trust refinements on local variables more than on properties.

---

### Item 24: Understand How Context Is Used in Type Inference

TypeScript infers types based not just on values but also on the **context** in which a value is used. Factoring a value out into a variable separates it from its context, which can cause unexpected type errors.

**String literal types:**

```
type Language = 'JavaScript' | 'TypeScript' | 'Python';
function setLanguage(language: Language) { /* ... */ }
```

```
setLanguage('JavaScript'); // OK
```

```
let language = 'JavaScript';
setLanguage(language);
// ~~~~~~~~ Argument of type 'string' is not assignable
// to parameter of type 'Language'
```

Inline, TypeScript uses the function signature to validate `'JavaScript'`. Factored out, TypeScript infers `language` as `string` at assignment time — no context available.

Two fixes:
- Type annotation: `let language: Language = 'JavaScript';`
- `const`: `const language = 'JavaScript';` — type narrows to `"JavaScript"`, which is assignable to `Language`.

Note: TypeScript determines a variable's type when it is first introduced, not from how it's eventually used.

**Tuple Types**

```
// Parameter is a (latitude, longitude) pair.
function panTo(where: [ number , number ]) { /* ... */ }
```

```
panTo([10, 20]); // OK
```

```
const loc = [10, 20];
// ^? const loc: number[]
panTo(loc);
// ~~~ Argument of type 'number[]' is not assignable to
// parameter of type '[number, number]'
```

Inline, `[10, 20]` is assignable to `[number, number]`. Factored out, TypeScript infers `number[]` (array of unknown length).

Fixes:
- Type annotation: `const loc: [number, number] = [10, 20];`
- `as const`: `const loc = [10, 20] as const;` — but this infers `readonly [10, 20]`, which requires the parameter to be `readonly`:

```
const loc = [10, 20] as const ;
// ^? const loc: readonly [10, 20]
panTo(loc);
// ~~~ The type 'readonly [10, 20]' is 'readonly'
// and cannot be assigned to the mutable type '[number, number]'
```

```
function panTo(where: readonly [ number , number ]) { /* ... */ }
const loc = [10, 20] as const ;
panTo(loc); // OK
```

Downside of `as const`: errors surface at the call site, not the definition, which can be confusing:

```
const loc = [10, 20, 30] as const ; // error is really here.
panTo(loc);
// ~~~ Argument of type 'readonly [10, 20, 30]' is not assignable to
// parameter of type 'readonly [number, number]'
// Source has 3 element(s) but target allows only 2.
```

**Objects**

Same problem when factoring out an object containing string literals:

```
type Language = 'JavaScript' | 'TypeScript' | 'Python';
interface GovernedLanguage {
language: Language;
organization: string ;
}
```

```
function complain(language: GovernedLanguage) { /* ... */ }
```

```
complain({ language: 'TypeScript', organization: 'Microsoft' }); // OK
```

```
const ts = {
language: 'TypeScript',
organization: 'Microsoft',
};
complain(ts);
// ~~ Argument of type '{ language: string; organization: string; }'
// is not assignable to parameter of type 'GovernedLanguage'
// Types of property 'language' are incompatible
// Type 'string' is not assignable to type 'Language'
```

Fix: add a type annotation (`const ts: GovernedLanguage = ...`), use `as const`, or use `satisfies`.

**Callbacks**

When a callback is passed inline, TypeScript infers its parameter types from context:

```
function callWithRandomNumbers(fn: (n1: number , n2: number ) => void ) {
fn(Math.random(), Math.random());
}
```

```
callWithRandomNumbers((a, b) => {
// ^? (parameter) a: number
console.log(a + b);
// ^? (parameter) b: number
});
```

Factoring the callback into a variable loses the context:

```
const fn = (a, b) => {
// ~ Parameter 'a' implicitly has an 'any' type
// ~ Parameter 'b' implicitly has an 'any' type
console.log(a + b);
}
callWithRandomNumbers(fn);
```

Fix — add parameter type annotations, or apply a type declaration to the whole function expression.

**Things to Remember**

- Be aware of how context is used in type inference.
- If factoring out a variable introduces a type error, maybe add a type annotation.
- If the variable is truly a constant, use a `const` assertion (`as const`). But be aware that this may result in errors surfacing at use, rather than definition.
- Prefer inlining values where it's practical to reduce the need for type annotations.

---

### Item 25: Understand Evolving Types

**Exception to the rule:** Variables initialized to `null`, `undefined`, or `[]` (empty array) can have evolving types — their type expands as values are pushed or assigned.

```
function range(start: number , limit: number ) {
const nums = [];
// ^? const nums: any[]
for ( let i = start; i < limit; i++) {
nums.push(i);
// ^? const nums: any[]
}
return nums;
// ^? const nums: number[]
}
```

`nums` starts as `any[]`, evolves to `number[]` after `number` values are pushed.

**Evolving through multiple types:**

```
const result = [];
// ^? const result: any[]
result.push('a');
result
// ^? const result: string[]
result.push(1);
result
// ^? const result: (string | number)[]
```

**Evolving with conditionals (simple value):**

```
let value;
// ^? let value: any
if (Math.random() < 0.5) {
value = /hello/;
value
// ^? let value: RegExp
} else {
value = 12;
value
// ^? let value: number
}
value
// ^? let value: number | RegExp
```

Note: the evolving type is only updated after assignment. Inspecting the type on the assignment line still shows `any` or `any[]`.

**Evolving from `null` in try/catch:**

```
let value = null ;
// ^? let value: any
try {
value = doSomethingRiskyAndReturnANumber();
value
// ^? let value: number
} catch (e) {
console.warn('alas!');
}
value
// ^? let value: number | null
```

**Reading an evolving type before it's set produces an error:**

```
function range(start: number , limit: number ) {
const nums = [];
// ~~~~ Variable 'nums' implicitly has type 'any[]' in some
// locations where its type cannot be determined
if (start === limit) {
return nums;
// ~~~~ Variable 'nums' implicitly has an 'any[]' type
}
for ( let i = start; i < limit; i++) {
nums.push(i);
}
return nums;
}
```

**Evolving types do NOT work through function calls:**

```
function makeSquares(start: number , limit: number ) {
const nums = [];
// ~~~~ Variable 'nums' implicitly has type 'any[]' in some locations
range(start, limit).forEach(i => {
nums.push(i * i);
});
return nums;
// ~~~~ Variable 'nums' implicitly has an 'any[]' type
}
```

`forEach` (with an arrow function callback) prevents inference evolution. Prefer `for-of` loops or `map`/`flatMap` to avoid this. `map` transforms the array in a single statement, avoiding evolving types entirely.

**Things to Remember**

- While TypeScript types typically only refine, the types of values initialized to `null`, `undefined`, or `[]` are allowed to evolve.
- Recognize and understand this construct where it occurs, and use it to reduce the need for type annotations in your own code.
- For better error checking, consider providing an explicit type annotation instead of using evolving types.

---

### Item 26: Use Functional Constructs and Libraries to Help Types Flow

**Rule:** Functional constructs (`map`, `filter`, `reduce`, `flat`) and libraries like Lodash carry correct types through their operations automatically. Hand-rolled loops do not.

**Example: CSV parsing**

Imperative and reduce-based approaches both produce the same error in TypeScript:

```
const rowsImperative = rawRows.slice(1).map(rowStr => {
const row = {};
rowStr.split(',').forEach((val, j) => {
row[headers[j]] = val;
// ~~~~~~~~~~~~ No index signature with a parameter of
// type 'string' was found on type '{}'
});
return row;
});
const rowsFunctional = rawRows.slice(1)
.map((rowStr) =>
rowStr
.split(",")
.reduce(
(row, val, i) => ((row[headers[i]] = val), row),
// ~~~~~~~~~~~~~~~ No index signature with a parameter of
// type 'string' was found on type '{}'
{}
)
);
```

Both require adding a type annotation: `{[column: string]: string}` or `Record<string, string>`.

Lodash's `zipObject` passes the type checker with no annotation:

```
import _ from 'lodash';
const rows = rawRows.slice(1)
.map(rowStr => _.zipObject(headers, rowStr.split(',')));
rowsLodash
// ^? const rowsLodash: _.Dictionary<string>[]
```

`Dictionary<string>` = `{[key: string]: string}` = `Record<string, string>`.

**Example: flattening a roster**

Loop approach requires an explicit annotation:

```
let allPlayers = [];
// ~~~~~~~~~~ Variable 'allPlayers' implicitly has type 'any[]'
// in some locations where its type cannot be determined
for ( const players of Object.values(rosters)) {
allPlayers = allPlayers.concat(players);
// ~~~~~~~~~~ Variable 'allPlayers' implicitly has an 'any[]' type
}
```

Note: `concat` does not trigger the evolving array behavior from Item 25.

With annotation:

```
let allPlayers: BasketballPlayer[] = [];
for ( const players of Object.values(rosters)) {
allPlayers = allPlayers.concat(players); // OK
}
```

With `Array.prototype.flat` — no annotation needed, `const` instead of `let`:

```
const allPlayers = Object.values(rosters).flat(); // OK
// ^? const allPlayers: BasketballPlayer[]
```

**Lodash chain example — highest-paid players per team:**

Without Lodash — requires explicit type annotation:

```
const teamToPlayers: {[team: string ]: BasketballPlayer[]} = {};
for ( const player of allPlayers) {
const {team} = player;
teamToPlayers[team] = teamToPlayers[team] || [];
teamToPlayers[team].push(player);
}
```

```
for ( const players of Object.values(teamToPlayers)) {
players.sort((a, b) => b.salary - a.salary);
}
```

```
const bestPaid = Object.values(teamToPlayers).map(players => players[0]);
bestPaid.sort((playerA, playerB) => playerB.salary - playerA.salary);
console.log(bestPaid);
```

With Lodash chain — half the lines, only one non-null assertion:

```
const bestPaid = _(allPlayers)
.groupBy(player => player.team)
.mapValues(players => _.maxBy(players, p => p.salary)!)
.values()
.sortBy(p => -p.salary)
.value();
console.log(bestPaid.slice(0, 10));
// ^? const bestPaid: BasketballPlayer[]
```

Lodash "chain" pattern: `_(v).a().b().c().value()` instead of `_.c(_.b(_.a(v)))`. You can inspect each step in the chain and its type is always correct.

**Things to Remember**

- Use built-in functional constructs and those in utility libraries like Lodash instead of hand-rolled constructs to improve type flow, increase legibility, and reduce the need for explicit type annotations.

---

### Item 27: Use async Functions Instead of Callbacks to Improve Type Flow

**Callback pattern — "pyramid of doom":**

```
declare function fetchURL(
url: string , callback: (response: string ) => void
): void ;
```

```
fetchURL(url1, function (response1) {
fetchURL(url2, function (response2) {
fetchURL(url3, function (response3) {
// ...
console.log(1);
});
console.log(2);
});
console.log(3);
});
console.log(4);
```

```
// Logs:
// 4
// 3
// 2
// 1
```

Execution order is the reverse of code order. Error handling and concurrent requests are difficult.

**Promise pattern:**

```
const page1Promise = fetch(url1);
page1Promise.then(response1 => {
return fetch(url2);
}).then(response2 => {
return fetch(url3);
}).then(response3 => {
// ...
}). catch (error => {
// ...
});
```

**async/await:**

```
async function fetchPages() {
try {
const response1 = await fetch(url1);
const response2 = await fetch(url2);
const response3 = await fetch(url3);
// ...
} catch (e) {
// ...
}
}
```

`await` pauses execution until the Promise resolves. A rejected Promise throws an exception, enabling standard `try/catch`. Promise rejections in TypeScript are untyped.

TypeScript compiles async/await down to any target (including ES5).

**Type flow advantage — `Promise.all`:**

Types of destructured responses are inferred automatically:

```
async function fetchPages() {
const [response1, response2, response3] = await Promise.all([
fetch(url1), fetch(url2), fetch(url3)
]);
// ...
}
```

Equivalent callback code requires manual type annotations and more machinery.

**`Promise.race` type inference:**

```
function timeout(timeoutMs: number ): Promise< never > {
return new Promise((resolve, reject) => {
setTimeout(() => reject('timeout'), timeoutMs);
});
}
```

```
async function fetchWithTimeout(url: string , timeoutMs: number ) {
return Promise.race([fetch(url), timeout(timeoutMs)]);
}
```

Return type inferred as `Promise<Response>`. `Promise.race` returns the union of its input types: `Promise<Response | never>`. Union with `never` is a no-op, so the result simplifies to `Promise<Response>`.

**async enforces consistent sync/async behavior:**

Mixing sync and async in a callback-based function causes bugs:

```
// Don't do this!
const _cache: {[url: string ]: string } = {};
function fetchWithCache(url: string , callback: (text: string ) => void ) {
if (url in _cache) {
callback(_cache[url]);
} else {
fetchURL(url, text => {
_cache[url] = text;
callback(text);
});
}
}
```

```
let requestStatus: 'loading' | 'success' | 'error';
function getUser(userId: string ) {
fetchWithCache(`/user/${userId}`, profile => {
requestStatus = 'success';
});
requestStatus = 'loading';
}
```

If the URL is cached, `callback` fires synchronously — `requestStatus` ends as `'loading'` instead of `'success'`.

async version enforces consistent behavior:

```
const _cache: {[url: string ]: string } = {};
async function fetchWithCache(url: string ) {
if (url in _cache) {
return _cache[url];
}
const response = await fetch(url);
const text = await response.text();
_cache[url] = text;
return text;
}
```

```
let requestStatus: 'loading' | 'success' | 'error';
async function getUser(userId: string ) {
requestStatus = 'loading';
const profile = await fetchWithCache(`/user/${userId}`);
requestStatus = 'success';
}
```

**async always returns a Promise:**

```
async function getNumber() { return 42; }
// ^? function getNumber(): Promise<number>
```

```
const getNumber = async () => 42;
// ^? const getNumber: () => Promise<number>
```

Returning a Promise from an async function does NOT double-wrap it:

```
async function getJSON(url: string ) {
const response = await fetch(url);
const jsonPromise = response.json();
return jsonPromise;
// ^? const jsonPromise: Promise<any>
}
getJSON
// ^? function getJSON(url: string): Promise<any>
```

**Things to Remember**

- Prefer Promises to callbacks for better composability and type flow.
- Prefer async and await to raw Promises when possible. They produce more concise, straightforward code and eliminate whole classes of errors.
- If a function returns a Promise, declare it async.

---

### Item 28: Use Classes and Currying to Create New Inference Sites

**Problem:** TypeScript type inference is all-or-nothing for type parameters — either all are inferred from usage, or all must be specified explicitly. There's no partial inference.

**Motivating example:**

```
export interface SeedAPI {
'/seeds': Seed[];
'/seed/apple': Seed;
'/seed/strawberry': Seed;
// ...
}
```

```
declare function fetchAPI<
API, Path extends keyof API
>(path: Path): Promise<API[Path]>;
```

Desired usage — specify `API` explicitly, infer `Path` from the argument:

```
fetchAPI<SeedAPI>('/seed/strawberry');
// ~~~~~~~ Expected 2 type arguments, but got 1.
```

This fails because TypeScript requires either all or no type arguments. Specifying both is repetitive:

```
const berry = fetchAPI<SeedAPI, '/seed/strawberry'>('/seed/strawberry'); // ok
// ^? const berry: Promise<Seed>
```

**Solution 1: Classes**

Classes capture types at construction and infer method type parameters separately:

```
declare class ApiFetcher<API> {
fetch<Path extends keyof API>(path: Path): Promise<API[Path]>;
}
```

```
const fetcher = new ApiFetcher<SeedAPI>();
const berry = await fetcher.fetch('/seed/strawberry'); // OK
// ^? const berry: Seed
```

```
fetcher.fetch('/seed/chicken');
// ~~~~~~~~~~~~~~~
// Argument of type '"/seed/chicken"' is not assignable to type 'keyof SeedAPI'
```

```
const seed: Seed = await fetcher.fetch('/seeds');
// ~~~~ Seed[] is not assignable to Seed
```

`API` is bound at `new ApiFetcher<SeedAPI>()`. `Path` is inferred at each `fetch` call. Particularly effective when multiple methods all require the same type parameter.

**Solution 2: Currying**

A function that returns a function creates two separate inference sites:

```
declare function fetchAPI<API>():
<Path extends keyof API>(path: Path) => Promise<API[Path]>;
```

```
const berry = await fetchAPI<SeedAPI>()('/seed/strawberry'); // OK
// ^? const berry: Seed
```

```
fetchAPI<SeedAPI>()('/seed/chicken');
// ~~~~~~~~~~~~~~~
// Argument of type '"/seed/chicken"' is not assignable to type 'keyof SeedAPI'
```

```
const seed: Seed = await fetchAPI<SeedAPI>()('/seeds');
// ~~~~ Seed[] is not assignable to Seed
```

Using an intermediate variable reduces repetition:

```
const fetchSeedAPI = fetchAPI<SeedAPI>();
const berry = await fetchSeedAPI('/seed/strawberry');
// ^? const berry: Seed
```

The currying approach as an object (nearly identical to the class approach, minus `new`):

```
declare function apiFetcher<API>(): {
fetch<Path extends keyof API>(path: Path): Promise<API[Path]>;
}
```

```
const fetcher = apiFetcher<SeedAPI>();
fetcher.fetch('/seed/strawberry'); // ok
```

**Advantage of currying over classes: local type aliases**

Currying creates a scope for local type aliases, which can simplify complex type expressions:

```
function fetchAPI<API>() {
type Routes = keyof API & string ; // local type alias
```

```
return <Path extends Routes>(
path: Path
): Promise<API[Path]> => fetch(path).then(r => r.json());
}
```

This is not possible with a class declaration alone — only an implementation body introduces a scope.

**Things to Remember**

- For functions with multiple type parameters, inference is all or nothing: either all type parameters are inferred or all must be specified explicitly.
- To get partial inference, use either classes or currying to create a new inference site.
- Prefer the currying approach if you'd like to create a local type alias.
