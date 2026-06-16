**CHAPTER 7**

### TypeScript Recipes

### Item 59: Use Never Types to Perform Exhaustiveness Checking

Exhaustiveness checking converts a missing case in a switch or if statement into a type error.

Suppose you define a tagged union for shapes:

```
type Coord = [x: number , y: number ];
interface Box {
type : 'box';
topLeft: Coord;
size: Coord;
}
interface Circle {
type : 'circle';
center: Coord;
radius: number ;
}
type Shape = Box | Circle;
```

```
function drawShape(shape: Shape, context: CanvasRenderingContext2D) {
switch (shape. type ) {
case 'box':
context.rect(...shape.topLeft, ...shape.size);
break ;
case 'circle':
context.arc(...shape.center, shape.radius, 0, 2 * Math.PI);
break ;
}
}
```

After adding a third variant:

```
interface Line {
type : 'line';
start: Coord;
end: Coord;
}
type Shape = Box | Circle | Line;
```

`drawShape` silently ignores `Line` shapes — an error of omission. TypeScript won't catch this on its own.

**How exhaustiveness checking works:** After an exhaustive switch, the type of `shape` in `default` narrows to `never`:

```
function processShape(shape: Shape) {
switch (shape. type ) {
case 'box': break ;
case 'circle': break ;
case 'line': break ;
default :
shape
// ^? (parameter) shape: never
}
}
```

If a case is missed, the type is something other than `never`:

```
function processShape(shape: Shape) {
switch (shape. type ) {
case 'box': break ;
case 'circle': break ;
// (forgot 'line')
default :
shape
// ^? (parameter) shape: Line
}
}
```

Since no value is assignable to `never`, you can turn the omission into a type error:

```
function assertUnreachable(value: never ): never {
throw new Error(`Missed a case! ${value}`);
}
```

```
function drawShape(shape: Shape, context: CanvasRenderingContext2D) {
switch (shape. type ) {
case 'box':
context.rect(...shape.topLeft, ...shape.size);
break ;
case 'circle':
context.arc(...shape.center, shape.radius, 0, 2 * Math.PI);
break ;
default :
assertUnreachable(shape);
// ~~~~~
// ... type 'Line' is not assignable to parameter of type 'never'.
}
}
```

After adding the missing case:

```
function drawShape(shape: Shape, context: CanvasRenderingContext2D) {
switch (shape. type ) {
case 'box':
context.rect(...shape.topLeft, ...shape.size);
break ;
case 'circle':
context.arc(...shape.center, shape.radius, 0, 2 * Math.PI);
break ;
case 'line':
context.moveTo(...shape.start);
context.lineTo(...shape.end);
break ;
default :
assertUnreachable(shape); // ok
}
}
```

- Leave the `assertUnreachable` call in place even when all cases are covered — it protects against future omissions.
- `assertUnreachable` throws at runtime because `drawShape` can be called from JavaScript or with `any`/unsound types.

**Functions with return values:** Annotating the return type provides some protection:

```
function getArea(shape: Shape): number {
// ~~~~~~ Function lacks ending return statement and
// return type does not include 'undefined'.
switch (shape. type ) {
case 'box':
const [width, height] = shape.size;
return width * height;
case 'circle':
return Math.PI * shape.radius ** 2;
}
}
```

Without the return type annotation, TypeScript infers `number | undefined` instead of producing an error. Since `never` is assignable to all types, you can also return `assertUnreachable` safely:

```
function getArea(shape: Shape): number {
switch (shape. type ) {
case 'box':
const [width, height] = shape.size;
return width * height;
case 'circle':
return Math.PI * shape.radius ** 2;
case 'line':
return 0;
default :
return assertUnreachable(shape); // ok
}
}
```

**Alternative patterns for exhaustiveness checking:**

Direct assignment to `never`:
```
function processShape(shape: Shape) {
switch (shape. type ) {
case 'box': break ;
case 'circle': break ;
default :
const exhaustiveCheck: never = shape;
// ~~~~~~~~~~~~~~~ Type 'Line' is not assignable to type 'never'.
throw new Error(`Missed a case: ${exhaustiveCheck}`);
}
}
```

Using `satisfies`:
```
function processShape(shape: Shape) {
switch (shape. type ) {
case 'box': break ;
case 'circle': break ;
default :
shape satisfies never
// ~~~~~~~~~ Type 'Line' does not satisfy the expected type 'never'.
throw new Error(`Missed a case: ${shape}`);
}
}
```

**Cross-product exhaustiveness (pairs of types):** Template literal types combined with exhaustiveness checking can enforce coverage of every combination:

```
type Play = 'rock' | 'paper' | 'scissors';
```

```
function shoot(a: Play, b: Play) {
const pair = `${a},${b}` as `${Play},${Play}`; // or: as const
// ^? const pair: "rock,rock" | "rock,paper" | "rock,scissors" |
// "paper,rock" | "paper,paper" | "paper,scissors" |
// "scissors,rock" | "scissors,paper" | "scissors,scissors"
switch (pair) {
case 'rock,rock':
case 'paper,paper':
case 'scissors,scissors':
console.log('draw');
break ;
case 'rock,scissors':
case 'paper,rock':
console.log('A wins');
break ;
case 'rock,paper':
case 'paper,scissors':
case 'scissors,rock':
console.log('B wins');
break ;
default :
assertUnreachable(pair);
// ~~~~ Argument of type "scissors,paper" is not
// assignable to parameter of type 'never'.
}
}
```

- By default, `` `${a},${b}` `` has type `string`; the cast to `` `${Play},${Play}` `` narrows it to the nine specific pair combinations.
- The error message includes the exact missing combination.

The `typescript-eslint` rule `switch-exhaustiveness-check` provides opt-out exhaustiveness checking at the linter level, as opposed to `assertUnreachable` which is opt-in.

**Things to Remember**

- Use an assignment to the `never` type to ensure that all possible values of a type are handled (an "exhaustiveness check").
- Add a return type annotation to functions that return from multiple branches. You may still want an explicit exhaustiveness check, however.
- Consider using template literal types to ensure that every combination of two or more types is handled.

### Item 60: Know How to Iterate Over Objects

```
const obj = {
one: 'uno',
two: 'dos',
three: 'tres',
};
for ( const k in obj) {
const v = obj[k];
// ~~~~~~ Element implicitly has an 'any' type
// because type ... has no index signature
}
```

```
const obj = { one: 'uno', two: 'dos', three: 'tres' };
// ^? const obj: {
// one: string;
// two: string;
// three: string;
// }
for ( const k in obj) {
// ^? const k: string
// ...
}
```

`k` is typed as `string`, but the object only has keys `'one'`, `'two'`, `'three'`. The type system can't guarantee that `k` is one of those three specific keys.

**Fix with a type assertion:**

```
for ( const kStr in obj) {
const k = kStr as keyof typeof obj;
// ^? const k: "one" | "two" | "three"
const v = obj[k]; // OK
}
```

**Why TypeScript doesn't narrow `k` automatically:** Structural typing means a function accepting an `ABC` parameter can receive a value with additional properties:

```
interface ABC {
a: string ;
b: string ;
c: number ;
}
```

```
function foo(abc: ABC) {
for ( const k in abc) {
// ^? const k: string
const v = abc[k];
// ~~~~~~ Element implicitly has an 'any' type
// because type 'ABC' has no index signature
}
}
```

```
const x = {a: 'a', b: 'b', c: 2, d: new Date()};
foo(x); // OK
```

`x` has an extra `d` property of type `Date`. If `k` were narrowed to `keyof ABC`, then `v` would be typed `string | number`, missing the actual `Date` value — unsound.

**Downside of `keyof` assertion:**

```
function foo(abc: ABC) {
for ( const kStr in abc) {
let k = kStr as keyof ABC;
// ^? let k: keyof ABC (equivalent to "a" | "b" | "c")
const v = abc[k];
// ^? const v: string | number
}
}
```

`v` is typed `string | number` but could be a `Date` or anything else — the assertion is unsound.

**`Object.entries` — always safe but less precise:**

```
function foo(abc: ABC) {
for ( const [k, v] of Object.entries(abc)) {
// ^? const k: string
console.log(v);
// ^? const v: any
}
}
```

`Object.entries` also excludes inherited properties (no prototype pollution risk).

**Explicitly listing keys — safe with precise types:**

```
function foo(abc: ABC) {
const keys = ['a', 'b', 'c'] as const ;
for ( const k of keys) {
// ^? const k: "a" | "b" | "c"
const v = abc[k];
// ^? const v: string | number
}
}
```

Requires manual synchronization between the `keys` array and the type.

**Map iteration — no hazards:**

```
const m = new Map([
// ^? const m: Map<string, string>
['one', 'uno'],
['two', 'dos'],
['three', 'tres'],
]);
for ( const [k, v] of m.entries()) {
// ^? const k: string
console.log(v);
// ^? const v: string
}
```

Maps don't have structural typing issues: you'll never put a wrong-typed value in a `Map<string, string>` without a type assertion.

**Things to Remember**

- Be aware that any objects your function receives as parameters might have additional keys.
- Use `Object.entries` to iterate over the keys and values of any object.
- Use a for-in loop with an explicit type assertion to iterate objects when you know exactly what the keys will be.
- Consider `Map` as an alternative to objects since it's easier to iterate over.

### Item 61: Use Record Types to Keep Values in Sync

```
interface ScatterProps {
// The data
xs: number [];
ys: number [];
// Display
xRange: [ number , number ];
yRange: [ number , number ];
color: string ;
// Events
onClick?: (x: number , y: number , index: number ) => void ;
}
```

**Problem:** When a new property is added to `ScatterProps`, the `shouldUpdate` function may silently handle it incorrectly.

Fail-open (iterates all properties, redraws on any change):
```
function shouldUpdate(
oldProps: ScatterProps,
newProps: ScatterProps
) {
for ( const kStr in oldProps) {
const k = kStr as keyof ScatterProps;
if (oldProps[k] !== newProps[k]) {
if (k !== 'onClick') return true ;
}
}
return false ;
}
```

Fail-closed (only listed properties, may miss new ones):
```
function shouldUpdate(
oldProps: ScatterProps,
newProps: ScatterProps
) {
return (
oldProps.xs !== newProps.xs ||
oldProps.ys !== newProps.ys ||
oldProps.xRange !== newProps.xRange ||
oldProps.yRange !== newProps.yRange ||
oldProps.color !== newProps.color
// (no check for onClick)
);
}
```

**Solution — use `Record<keyof ScatterProps, boolean>` to force explicit handling of every property:**

```
const REQUIRES_UPDATE: Record< keyof ScatterProps, boolean > = {
xs: true ,
ys: true ,
xRange: true ,
yRange: true ,
color: true ,
onClick: false ,
};
```

```
function shouldUpdate(
oldProps: ScatterProps,
newProps: ScatterProps
) {
for ( const kStr in oldProps) {
const k = kStr as keyof ScatterProps;
if (oldProps[k] !== newProps[k] && REQUIRES_UPDATE[k]) {
return true ;
}
}
return false ;
}
```

`Record<keyof ScatterProps, boolean>` requires all properties of `ScatterProps` to be present (they are all required, not optional). Adding a new property to `ScatterProps` now produces an error in `REQUIRES_UPDATE`:

```
interface ScatterProps {
// ...
onDoubleClick?: () => void ;
}
```

```
const REQUIRES_UPDATE: Record< keyof ScatterProps, boolean > = {
// ~~~~~~~~~~~~~~~ Property 'onDoubleClick' is missing in type ...
// ...
};
```

- Deleting or renaming a property causes a similar error (excess property checking enforces exact set of properties).
- Using an array (`(keyof ScatterProps)[]`) instead of a Record brings back the fail-open/fail-closed dilemma.

**Things to Remember**

- Recognize the fail open versus fail closed dilemma.
- Use `Record` types to keep related values and types synchronized.
- Consider using `Record` types to force choices when adding new properties to an interface.

### Item 62: Use Rest Parameters and Tuple Types to Model Variadic Functions

```
interface RouteQueryParams {
'/': null ,
'/search': { query: string ; language?: string ; }
// ...
}
```

Naive implementation with `any`:
```
function buildURL(route: keyof RouteQueryParams, params?: any ) {
return route + (params? `?${ new URLSearchParams(params)}` : '');
}
```

This allows invalid calls:
```
buildURL('/', {query: 'recursion'}); // should be an error (no params for root)
buildURL('/search'); // should be an error (missing params)
```

**Generic version tied to route:**

```
function buildURL<Path extends keyof RouteQueryParams>(
route: Path,
params: RouteQueryParams[Path]
) {
return route + (params? `?${ new URLSearchParams(params)}` : '');
}
```

This correctly rejects bad calls for `/search`, but requires an explicit `null` for routes without params:

```
buildURL('/search', {query: 'do a barrel roll'})
buildURL('/search', {query: 'do a barrel roll', language: 'en'})
buildURL('/search', {})
// ~~ Property 'query' is missing in type '{}'
```

```
buildURL('/', {query: 'recursion'}); // error, good!
// ~~~~~~~~~~~~~~~~~~~~ Argument of type '{ query: string; }' is
// not assignable to parameter of type 'null'
buildURL('/', null ); // ok
buildURL('/'); // we'd like this to be allowed
// ~~~~~ Expected 2 arguments, but got 1.
```

**Variadic solution — conditional type + rest parameters:**

```
function buildURL<Path extends keyof RouteQueryParams>(
route: Path,
...args: (
RouteQueryParams[Path] extends null
? []
: [params: RouteQueryParams[Path]]
)
) {
const params = args? args[0] : null ;
return route + (params? `?${ new URLSearchParams(params)}` : '');
}
```

- If `RouteQueryParams[Path]` extends `null`: function signature becomes `(route: Path, ...args: [])` — one parameter.
- Otherwise: `(route: Path, ...args: [params: ...])` — two parameters.

Now all calls work correctly:

```
buildURL('/search', {query: 'do a barrel roll'})
buildURL('/search', {query: 'do a barrel roll', language: 'en'})
buildURL('/search', {})
// ~~ Property 'query' is missing in type '{}' ...
```

```
buildURL('/', {query: 'recursion'});
// ~~~~~~~~~~~~~~~~~~~~ Expected 1 arguments, but got 2.
buildURL('/', null );
// ~~~~ Expected 1 arguments, but got 2.
buildURL('/'); // ok
```

The inferred signatures at call sites:
```
buildURL('/');
// ^? function buildURL<"/">(route: "/"): string
buildURL('/search', {query: 'do a barrel roll'})
// ^? function buildURL<"/search">(
// route: "/search", params: { query: string; language?: string; }
// ): string
```

- The label on the tuple element (`params:`) is what produces the named parameter at call sites. Without it, users see a generic name like `args_0`.
- Overload signatures can achieve a similar effect but lead to code duplication; conditional types handle unions more naturally.

**Things to Remember**

- Use rest parameters and tuple types to model functions whose signature depends on the type of an argument.
- Use conditional types to model relationships between the type of one parameter and the number and type of the remaining parameters.
- Remember to label the elements of your tuple types to get meaningful parameter names at call sites.

### Item 63: Use Optional Never Properties to Model Exclusive Or

TypeScript's `|` is inclusive or. A value can satisfy both branches simultaneously:

```
interface ThingOne {
shirtColor: string ;
}
interface ThingTwo {
hairColor: string ;
}
type Thing = ThingOne | ThingTwo;
```

```
const bothThings = {
shirtColor: 'red',
hairColor: 'blue',
};
const thing1: ThingOne = bothThings; // ok
const thing2: ThingTwo = bothThings; // ok
```

This works because TypeScript's structural type system allows additional properties not declared in an interface.

**Enforcing exclusive or with optional `never`:**

```
interface OnlyThingOne {
shirtColor: string ;
hairColor?: never ;
}
interface OnlyThingTwo {
hairColor: string ;
shirtColor?: never ;
}
type ExclusiveThing = OnlyThingOne | OnlyThingTwo;
```

```
const thing1: OnlyThingOne = bothThings;
// ~~~~~~ Types of property 'hairColor' are incompatible.
const thing2: OnlyThingTwo = bothThings;
// ~~~~~~ Types of property 'shirtColor' are incompatible.
const allThings: ExclusiveThing = {
// ~~~~~~~~~ Types of property 'hairColor' are incompatible.
shirtColor: 'red',
hairColor: 'blue',
};
```

- No value is assignable to `never`, so having the property at all is an error.
- Making it optional (`?: never`) means the only valid option is not having the property.

**Using optional `never` on non-union types:** Directly disallow a `z` property on a 2D vector:

```
interface Vector2D {
x: number ;
y: number ;
z?: never ;
}
```

```
function norm(v: Vector2D) {
return Math.sqrt(v.x ** 2 + v.y ** 2);
}
const v = {x: 3, y: 4, z: 5};
const d = norm(v);
// ~ Types of property 'z' are incompatible.
```

Without `z?: never`, this call is structurally valid even though semantically incorrect.

**Tagged unions as an alternative:** A string literal type tag can't be both `'one'` and `'two'`, so there's no overlap:

```
interface ThingOneTag {
type : 'one';
shirtColor: string ;
}
interface ThingTwoTag {
type : 'two';
hairColor: string ;
}
type Thing = ThingOneTag | ThingTwoTag;
```

**Generic XOR helper type:**

```
type XOR<T1, T2> =
(T1 & {[k in Exclude< keyof T2, keyof T1>]?: never }) |
(T2 & {[k in Exclude< keyof T1, keyof T2>]?: never });
```

```
type ExclusiveThing = XOR<ThingOne, ThingTwo>;
const allThings: ExclusiveThing = {
// ~~~~~~~~~ Types of property 'hairColor' are incompatible.
shirtColor: 'red',
hairColor: 'blue',
};
```

**Things to Remember**

- In TypeScript, "or" is "inclusive or": `A | B` means either A, B, or both.
- Consider the "both" possibility in your code, and either handle it or disallow it.
- Use tagged unions to model exclusive or where it's convenient. Consider using optional `never` properties where it isn't.

### Item 64: Consider Brands for Nominal Typing

Structural typing lets structurally compatible types be used interchangeably even when they are semantically different:

```
interface Vector2D {
x: number ;
y: number ;
}
function calculateNorm(p: Vector2D) {
return Math.sqrt(p.x ** 2 + p.y ** 2);
}
```

```
calculateNorm({x: 3, y: 4}); // OK, result is 5
const vec3D = {x: 3, y: 4, z: 1};
calculateNorm(vec3D); // OK! result is also 5
```

**Nominal typing with brands:** A brand is a type-level tag that only exists in the type system, with no runtime overhead. It lets you say a value is a certain type because you declare it is, not because of its shape.

**Example — absolute filesystem paths:**

```
type AbsolutePath = string & {_brand: 'abs'};
function listAbsolutePath(path: AbsolutePath) {
// ...
}
function isAbsolutePath(path: string ): path is AbsolutePath {
return path.startsWith('/');
}
```

- `string & {_brand: 'abs'}` is a pure type-system construct; you cannot literally construct such an object.
- Use the type guard to refine a `string` to `AbsolutePath`:

```
function f(path: string ) {
if (isAbsolutePath(path)) {
listAbsolutePath(path);
}
listAbsolutePath(path);
// ~~~~ Argument of type 'string' is not assignable to
// parameter of type 'AbsolutePath'
}
```

- `path as AbsolutePath` is always valid for any string — brands are not ironclad guarantees. Avoid unsafe assertions; get an `AbsolutePath` by being given one or by checking.

**Branding number types for units:**

```
type Meters = number & {_brand: 'meters'};
type Seconds = number & {_brand: 'seconds'};
```

```
const meters = (m: number ) => m as Meters;
const seconds = (s: number ) => s as Seconds;
```

```
const oneKm = meters(1000);
// ^? const oneKm: Meters
const oneMin = seconds(60);
// ^? const oneMin: Seconds
```

Arithmetic operations strip the brand:
```
const tenKm = oneKm * 10;
// ^? const tenKm: number
const v = oneKm / oneMin;
// ^? const v: number
```

**Branding properties that can't be expressed in the type system:**

```
type SortedList<T> = T[] & {_brand: 'sorted'};
```

```
function isSorted<T>(xs: T[]): xs is SortedList<T> {
for ( let i = 0; i < xs.length - 1; i++) {
if (xs[i] > xs[i + 1]) {
return false ;
}
}
return true ;
}
```

```
function binarySearch<T>(xs: SortedList<T>, x: T): boolean {
// ...
}
```

To call `binarySearch`, you must either be given a `SortedList` (proof that the list is sorted) or prove it yourself via `isSorted`.

**Alternative branding techniques:**
- Private fields on classes
- Intersection with TypeScript string-based enums (nominally typed)
- `unique symbol`:

```
declare const brand: unique symbol;
export type Meters = number & {[brand]: 'meters'};
```

The `unique symbol` approach prevents users from constructing a compatible type themselves since the symbol is not exported — they must use a type assertion or helper function.

**Things to Remember**

- With nominal typing, a value has a type because you say it has a type, not because it has the same shape as that type.
- Consider attaching brands to distinguish primitive and object types that are semantically distinct but structurally identical.
- Be familiar with the various techniques for branding: properties on object types, string-based enums, private fields, and `unique symbol`.
