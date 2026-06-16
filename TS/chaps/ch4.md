**CHAPTER 4**

### Type Design

### Item 29: Prefer Types That Always Represent Valid States

**The core rule:** Types that can represent both valid and invalid states lead to confusing, bug-prone code. Design types that can only represent valid states.

**Bad example — mixed state with implicit relationships:**

```
interface State {
pageText: string ;
isLoading: boolean ;
error?: string ;
}
```

Problems with this design:
- `isLoading` and `error` can both be set simultaneously — an invalid state
- `renderPage` has to guess which to display; there's not enough information
- `changePage` is easy to get wrong: forget to clear `isLoading` on error, forget to clear `error` on new load, race conditions if the user navigates again while loading

```
async function changePage(state: State, newPage: string ) {
state.isLoading = true ;
try {
const response = await fetch(getUrlForPage(newPage));
if (!response.ok) {
throw new Error(`Unable to load ${newPage}: ${response.statusText}`);
}
const text = await response.text();
state.isLoading = false ;
state.pageText = text;
} catch (e) {
state.error = '' + e;
// Bug: isLoading never set to false; previous error not cleared
}
}
```

**Good example — tagged union (discriminated union) enforces valid states only:**

```
interface RequestPending {
state: 'pending';
}
interface RequestError {
state: 'error';
error: string ;
}
interface RequestSuccess {
state: 'ok';
pageText: string ;
}
type RequestState = RequestPending | RequestError | RequestSuccess;
```

```
interface State {
currentPage: string ;
requests: {[page: string ]: RequestState};
}
```

Now `renderPage` and `changePage` are straightforward because every request is in exactly one state:

```
function renderPage(state: State) {
const {currentPage} = state;
const requestState = state.requests[currentPage];
switch (requestState.state) {
case 'pending':
return `Loading ${currentPage}...`;
case 'error':
return `Error! Unable to load ${currentPage}: ${requestState.error}`;
case 'ok':
return `<h1>${currentPage}</h1>\n${requestState.pageText}`;
}
}
```

```
async function changePage(state: State, newPage: string ) {
state.requests[newPage] = {state: 'pending'};
state.currentPage = newPage;
try {
const response = await fetch(getUrlForPage(newPage));
if (!response.ok) {
throw new Error(`Unable to load ${newPage}: ${response.statusText}`);
}
const pageText = await response.text();
state.requests[newPage] = {state: 'ok', pageText};
} catch (e) {
state.requests[newPage] = {state: 'error', error: '' + e};
}
}
```

**Corollary — bad input type makes a function impossible to implement correctly:**

```
interface CockpitControls {
/** Angle of the left side stick in degrees, 0 = neutral, + = forward */
leftSideStick: number ;
/** Angle of the right side stick in degrees, 0 = neutral, + = forward */
rightSideStick: number ;
}
```

There is no correct implementation of `getStickSetting(controls: CockpitControls)` — when both sticks are non-zero the function has no good answer. The type itself is flawed because it allows conflicting inputs that can never be reconciled safely.

The correct model eliminates the ambiguity entirely:

```
interface CockpitControls {
/** Angle of the stick in degrees, 0 = neutral, + = forward */
stickAngle: number ;
}
```

**Things to Remember**

- Types that represent both valid and invalid states are likely to lead to confusing and error-prone code.
- Prefer types that only represent valid states. Even if they are longer or harder to express, they will save you time and pain in the end!

### Item 30: Be Liberal in What You Accept and Strict in What You Produce

**Robustness principle (Postel's Law):** Be conservative in what you produce, liberal in what you accept. Applied to TypeScript: input parameter types can be broad (unions, optional fields); return types should be precise.

**Problem — broad return type forces callers into type gymnastics:**

```
declare function setCamera(camera: CameraOptions): void ;
declare function viewportForBounds(bounds: LngLatBounds): CameraOptions;
```

```
interface CameraOptions {
center?: LngLat;
zoom?: number ;
bearing?: number ;
pitch?: number ;
}
type LngLat =
{ lng: number ; lat: number ; } |
{ lon: number ; lat: number ; } |
[ number , number ];
```

```
type LngLatBounds =
{northeast: LngLat, southwest: LngLat} |
[LngLat, LngLat] |
[ number , number , number , number ];
```

`LngLatBounds` has 19 possible forms (3 × 3 + 3 × 3 + 1). When `viewportForBounds` returns `CameraOptions`, the caller can't safely destructure it:

```
function focusOnFeature(f: Feature) {
const bounds = calculateBoundingBox(f); // helper function
const camera = viewportForBounds(bounds);
setCamera(camera);
const {center: {lat, lng}, zoom} = camera;
// ~~~ Property 'lat' does not exist on type ...
// ~~~ Property 'lng' does not exist on type ...
zoom;
// ^? const zoom: number | undefined
window.location.search = `?v=@${lat},${lng}z${zoom}`;
}
```

**Fix — distinguish a canonical form (for return) from a loose form (for input):**

```
interface LngLat { lng: number ; lat: number ; };
type LngLatLike = LngLat | { lon: number ; lat: number ; } | [ number , number ];
```

```
interface Camera {
center: LngLat;
zoom: number ;
bearing: number ;
pitch: number ;
}
interface CameraOptions extends Omit<Partial<Camera>, 'center'> {
center?: LngLatLike;
}
type LngLatBounds =
{northeast: LngLatLike, southwest: LngLatLike} |
[LngLatLike, LngLatLike] |
[ number , number , number , number ];
```

```
declare function setCamera(camera: CameraOptions): void ;
declare function viewportForBounds(bounds: LngLatBounds): Camera;
```

Note: `CameraOptions extends Omit<Partial<Camera>, 'center'>` rather than `Partial<Camera>` because `LngLatLike` is a *supertype* of `LngLat`, not a subtype — you can't just substitute it directly.

Now `focusOnFeature` passes the type checker and `zoom` is `number`, not `number | undefined`:

```
function focusOnFeature(f: Feature) {
const bounds = calculateBoundingBox(f);
const camera = viewportForBounds(bounds);
setCamera(camera);
const {center: {lat, lng}, zoom} = camera; // OK
// ^? const zoom: number
window.location.search = `?v=@${lat},${lng}z${zoom}`;
}
```

**Broadening parameter types with `Iterable<T>`:**

If a function only needs to iterate, `Iterable<T>` is broader than `T[]` or `ArrayLike<T>` and also accepts generator expressions:

```
function sum(xs: Iterable< number >): number {
let sum = 0;
for ( const x of xs) {
sum += x;
}
return sum;
}
```

```
function * range(limit: number ) {
for ( let i = 0; i < limit; i++) {
yield i;
}
}
const zeroToNine = range(10);
// ^? const zeroToNine: Generator<number, void, unknown>
const fortyFive = sum(zeroToNine); // ok, result is 45
```

**Things to Remember**

- Input types tend to be broader than output types. Optional properties and union types are more common in parameter types than return types.
- Avoid broad return types since these will be awkward for clients to use.
- To reuse types between parameters and return types, introduce a canonical form (for return types) and a looser form (for parameters).
- Use `Iterable<T>` instead of `T[]` if you only need to iterate over your function parameter.

### Item 31: Don't Repeat Type Information in Documentation

**Anti-pattern — comments that duplicate what the type signature already says:**

```
/**
* Returns a string with the foreground color.
* Takes zero or one arguments. With no arguments, returns the
* standard foreground color. With one argument, returns the foreground color
* for a particular page.
*/
function getForegroundColor(page?: string ) {
return page === 'login'? {r: 127, g: 127, b: 127} : {r: 0, g: 0, b: 0};
}
```

Problems:
- Claims the function returns a `string` — it actually returns `{r, g, b}`
- Explains the zero-or-one argument behavior, which is already encoded in `page?: string`
- Comment is longer than the function itself

Type annotations are enforced by the compiler and stay in sync. Comments are not. If the return type changes, the comment will be wrong.

**Better:**

```
/** Get the foreground color for the application or a specific page. */
function getForegroundColor(page?: string ): Color {
// ...
}
```

Use `@param` JSDoc annotations if you need to describe specific parameters.

**Anti-pattern — commenting mutation behavior instead of enforcing it:**

```
/** Sort the strings by numeric value (i.e. "2" < "10"). Does not modify nums. */
function sortNumerically(nums: string []): string [] {
return nums.sort((a, b) => Number(a) - Number(b));
}
```

The comment claims no mutation, but `sort` mutates in place. Use `readonly` to enforce the contract:

```
/** Sort the strings by numeric value (i.e. "2" < "10"). */
function sortNumerically(nums: readonly string []): string [] {
return nums.sort((a, b) => Number(a) - Number(b));
// ~~~~ ~ ~ Property 'sort' does not exist on 'readonly string[]'.
}
```

Correct implementation:

```
/** Sort the strings by numeric value (i.e. "2" < "10"). */
function sortNumerically(nums: readonly string []): string [] {
return nums.toSorted((a, b) => Number(a) - Number(b)); // ok
}
```

**Variable naming:** Avoid encoding the type in the name (e.g., `ageNum` → just `age`). Exception: units that aren't obvious from the type — `timeMs` and `temperatureC` are clearer than `time` and `temperature`.

**Things to Remember**

- Avoid repeating type information in comments and variable names. In the best case it is duplicative of type declarations, and in the worst case it will lead to conflicting information.
- Declare parameters `readonly` rather than saying that you don't mutate them.
- Consider including units in variable names if they aren't clear from the type (e.g., `timeMs` or `temperatureC`).

### Item 32: Avoid Including null or undefined in Type Aliases

**Problem — nullable type aliases obscure intent:**

```
type User = { id: string ; name: string ; } | null ;
```

When reading `user: User`, it's not obvious the value might be `null`. Readers assume `User` represents a user.

**Preferred — express nullability at the use site:**

```
interface User {
id: string ;
name: string ;
}

function getCommentsForUser(comments: readonly Comment[], user: User | null ) {
return comments.filter(comment => comment.userId === user?.id);
}
```

`User | null` is explicit, concise, and universally recognizable. If you must name it, use `NullableUser` — but that's still less clear than writing `User | null` inline.

**The rule applies to the top level of a type alias only.** Nullable values inside object properties are fine:

```
type BirthdayMap = {
[name: string ]: Date | undefined ;
};
```

But not this:

```
type BirthdayMap = {
[name: string ]: Date | undefined ;
} | null ;
```

**Things to Remember**

- Avoid defining type aliases that include `null` or `undefined`.

### Item 33: Push Null Values to the Perimeter of Your Types

**The problem — implicit relationships between nullable values:**

When variable A being non-null implies variable B is also non-null (and vice versa), but the types don't capture that relationship, you get bugs and spurious null checks everywhere.

**Bad example:**

```
// @strictNullChecks: false
function extent(nums: Iterable< number >) {
let min, max;
for ( const num of nums) {
if (!min) {
min = num;
max = num;
} else {
min = Math.min(min, num);
max = Math.max(max, num);
}
}
return [min, max];
}
```

Bugs:
- `extent([0, 1, 2])` returns `[1, 2]` instead of `[0, 2]` — zero is falsy
- Empty input returns `[undefined, undefined]`
- `min` and `max` are always null/non-null together, but that's invisible to the type system

With `strictNullChecks`:

```
function extent(nums: Iterable< number >) {
let min, max;
for ( const num of nums) {
if (!min) {
min = num;
max = num;
} else {
min = Math.min(min, num);
max = Math.max(max, num);
// ~~~ Argument of type 'number | undefined' is not
// assignable to parameter of type 'number'
}
}
return [min, max];
}
```

Return type is now `(number | undefined)[]`, causing errors at call sites:

```
const [min, max] = extent([0, 1, 2]);
const span = max - min;
// ~~~ ~~~ Object is possibly 'undefined'
```

**Fix — group related nulls into a single object:**

```
function extent(nums: Iterable< number >) {
let minMax: [ number , number ] | null = null ;
for ( const num of nums) {
if (!minMax) {
minMax = [num, num];
} else {
const [oldMin, oldMax] = minMax;
minMax = [Math.min(num, oldMin), Math.max(num, oldMax)];
}
}
return minMax;
}
```

Return type is `[number, number] | null`. Callers use either a non-null assertion or a single check:

```
const [min, max] = extent([0, 1, 2])!;
const span = max - min; // OK
```

```
const range = extent([0, 1, 2]);
if (range) {
const [min, max] = range;
const span = max - min; // OK
}
```

**Bad class design — multiple nullable properties that are coupled:**

```
class UserPosts {
user: UserInfo | null ;
posts: Post[] | null ;

constructor () {
this .user = null ;
this .posts = null ;
}

async init(userId: string ) {
return Promise.all([
async () => this .user = await fetchUser(userId),
async () => this .posts = await fetchPostsForUser(userId)
]);
}

getUserName() {
// ...?
}
}
```

At any point `user` and `posts` can be in four combinations of null/non-null. Every method must deal with this complexity.

**Fix — construct the object only when all data is ready:**

```
class UserPosts {
user: UserInfo;
posts: Post[];

constructor (user: UserInfo, posts: Post[]) {
this .user = user;
this .posts = posts;
}

static async init(userId: string ): Promise<UserPosts> {
const [user, posts] = await Promise.all([
fetchUser(userId),
fetchPostsForUser(userId)
]);
return new UserPosts(user, posts);
}

getUserName() {
return this .user.name;
}
}
```

**Don't replace nullable properties with Promises.** That forces all methods async and tends to make class usage more confusing, not less.

**Things to Remember**

- Avoid designs in which one value being null or not null is implicitly related to another value being null or not null.
- Push null values to the perimeter of your API by making larger objects either null or fully non-null. This will make code clearer both for human readers and for the type checker.
- Consider creating a fully non-null class and constructing it when all values are available.

### Item 34: Prefer Unions of Interfaces to Interfaces with Unions

**Problem — properties with union types hide invalid state combinations:**

```
interface Layer {
layout: FillLayout | LineLayout | PointLayout;
paint: FillPaint | LinePaint | PointPaint;
}
```

This allows `FillLayout` paired with `LinePaint` — an invalid combination. The type doesn't enforce that layout and paint match.

**Fix — union of specific interfaces:**

```
interface FillLayer {
layout: FillLayout;
paint: FillPaint;
}
interface LineLayer {
layout: LineLayout;
paint: LinePaint;
}
interface PointLayer {
layout: PointLayout;
paint: PointPaint;
}
type Layer = FillLayer | LineLayer | PointLayer;
```

**Tagged union (discriminated union) — add a tag property for runtime narrowing:**

```
interface FillLayer {
type : 'fill';
layout: FillLayout;
paint: FillPaint;
}
interface LineLayer {
type : 'line';
layout: LineLayout;
paint: LinePaint;
}
interface PointLayer {
type : 'paint';
layout: PointLayout;
paint: PointPaint;
}
type Layer = FillLayer | LineLayer | PointLayer;
```

TypeScript narrows the type inside each branch:

```
function drawLayer(layer: Layer) {
if (layer. type === 'fill') {
const {paint} = layer;
// ^? const paint: FillPaint
const {layout} = layer;
// ^? const layout: FillLayout
} else if (layer. type === 'line') {
const {paint} = layer;
// ^? const paint: LinePaint
const {layout} = layer;
// ^? const layout: LineLayout
} else {
const {paint} = layer;
// ^? const paint: PointPaint
const {layout} = layer;
// ^? const layout: PointLayout
}
}
```

**Applying the same pattern to optional properties that are coupled:**

```
interface Person {
name: string ;
// These will either both be present or not be present
placeOfBirth?: string ;
dateOfBirth?: Date;
}
```

The comment signals a problem: these two fields are always present or absent together, but the type doesn't encode that.

Option 1 — nest them in a single optional object:

```
interface Person {
name: string ;
birth?: {
place: string ;
date: Date;
}
}
```

TypeScript now errors if only one field is provided:

```
const alanT: Person = {
name: 'Alan Turing',
birth: {
// ~~~~ Property 'date' is missing in type
// '{ place: string; }' but required in type
// '{ place: string; date: Date; }'
place: 'London'
}
}
```

Callers only need a single check:

```
function eulogize(person: Person ) {
console.log(person.name);
const {birth} = person;
if (birth) {
console.log(`was born on ${birth.date} in ${birth.place}.`);
}
}
```

Option 2 — union of interfaces (when the structure is outside your control):

```
interface Name {
name: string ;
}
```

```
interface PersonWithBirth extends Name {
placeOfBirth: string ;
dateOfBirth: Date;
}
```

```
type Person = Name | PersonWithBirth;
```

```
function eulogize(person: Person ) {
if ('placeOfBirth' in person) {
person
// ^? (parameter) person: PersonWithBirth
const {dateOfBirth} = person; // OK
// ^? const dateOfBirth: Date
}
}
```

**Things to Remember**

- Interfaces with multiple properties that are union types are often a mistake because they obscure the relationships between these properties.
- Unions of interfaces are more precise and can be understood by TypeScript.
- Use tagged unions to facilitate control flow analysis. Because they are so well supported, this pattern is ubiquitous in TypeScript code.
- Consider whether multiple optional properties could be grouped to more accurately model your data.

### Item 35: Prefer More Precise Alternatives to String Types

**Problem — overly broad `string` types mask errors:**

```
interface Album {
artist: string ;
title: string ;
releaseDate: string ; // YYYY-MM-DD
recordingType: string ; // E.g., "live" or "studio"
}
```

```
const kindOfBlue: Album = {
artist: 'Miles Davis',
title: 'Kind of Blue',
releaseDate: 'August 17th, 1959', // Oops!
recordingType: 'Studio', // Oops!
}; // OK — no error!
```

Swapping arguments of the same type is also silently accepted:

```
function recordRelease(title: string , date: string ) { /* ... */ }
recordRelease(kindOfBlue.releaseDate, kindOfBlue.title); // OK, should be error
```

**Fix — use narrower types:**

```
type RecordingType = 'studio' | 'live';
```

```
interface Album {
artist: string ;
title: string ;
releaseDate: Date;
recordingType: RecordingType;
}
```

Now TypeScript catches the invalid value:

```
const kindOfBlue: Album = {
artist: 'Miles Davis',
title: 'Kind of Blue',
releaseDate: new Date('1959-08-17'),
recordingType: 'Studio'
// ~~~~~~~~~~~~ Type '"Studio"' is not assignable to type 'RecordingType'
};
```

**Additional advantages of named union types:**
- Meaning travels with the type, not just inside the interface definition
- Documentation can be attached directly to the type

```
/** What type of environment was this recording made in? */
type RecordingType = 'live' | 'studio';
```

**Using `keyof T` to constrain property-key parameters:**

Naive approach — too broad:

```
function pluck(records: any [], key: string ): any [] {
return records.map(r => r[key]);
}
```

Better — introduce a generic type parameter:

```
function pluck<T>(records: T[], key: string ): any [] {
return records.map(r => r[key]);
// ~~~~~~ Element implicitly has an 'any' type
// because type '{}' has no index signature
}
```

TypeScript complains: `string` is too broad. Use `keyof T`:

```
function pluck<T>(records: T[], key: keyof T) {
return records.map(r => r[key]);
}
```

Inferred return type is `T[keyof T][]` — still too broad when a single key is passed:

```
const releaseDates = pluck(albums, 'releaseDate');
// ^? const releaseDates: (string | Date)[]
```

Should be `Date[]`. Fix with a second type parameter:

```
function pluck<T, K extends keyof T>(records: T[], key: K): T[K][] {
return records.map(r => r[key]);
}
```

```
const dates = pluck(albums, 'releaseDate');
// ^? const dates: Date[]
const artists = pluck(albums, 'artist');
// ^? const artists: string[]
const types = pluck(albums, 'recordingType');
// ^? const types: RecordingType[]
const mix = pluck(albums, Math.random() < 0.5? 'releaseDate' : 'artist');
// ^? const mix: (string | Date)[]
const badDates = pluck(albums, 'recordingDate');
// ~~~~~~~~~~~~~~~
// Argument of type '"recordingDate"' is not assignable to parameter of type ...
```

**Things to Remember**

- Avoid "stringly typed" code. Prefer more appropriate types where not every string is a possibility.
- Prefer a union of string literal types to `string` if that more accurately describes the domain of a variable. You'll get stricter type checking and improve the development experience.
- Prefer `keyof T` to `string` for function parameters that are expected to be properties of an object.

### Item 36: Use a Distinct Type for Special Values

**Problem — in-domain special values bypass the type checker:**

```
function splitAround<T>(vals: readonly T[], val: T): [T[], T[]] {
const index = vals.indexOf(val);
return [vals.slice(0, index), vals.slice(index+1)];
}
```

When `val` is not found, `indexOf` returns `-1`. Since `-1` is a `number`, TypeScript doesn't flag anything. But `-1` in `slice` means "count from the end," and `-1 + 1 = 0`, so:

```
> splitAround([1, 2, 3, 4, 5], 6)
[ [ 1, 2, 3, 4 ], [ 1, 2, 3, 4, 5 ] ]
```

**Fix — wrap `indexOf` to return `number | null`:**

```
function safeIndexOf<T>(vals: readonly T[], val: T): number | null {
const index = vals.indexOf(val);
return index === -1? null : index;
}
```

Now `splitAround` gets type errors that force you to handle the missing case:

```
function splitAround<T>(vals: readonly T[], val: T): [T[], T[]] {
const index = safeIndexOf(vals, val);
return [vals.slice(0, index), vals.slice(index+1)];
// ~~~~~ ~~~~~ 'index' is possibly 'null'
}
```

Handle it explicitly:

```
function splitAround<T>(vals: readonly T[], val: T): [T[], T[]] {
const index = safeIndexOf(vals, val);
if (index === null ) {
return [[...vals], []];
}
return [vals.slice(0, index), vals.slice(index+1)]; // ok
}
```

**Why in-domain special values (like `-1`, `0`, `""`) are dangerous:**

Using `-1` as a sentinel inside a `number` field is analogous to disabling `strictNullChecks`: TypeScript treats the sentinel and valid values identically, so it can't catch missed checks.

```
interface Product {
title: string ;
/** Price of the product in dollars, or -1 if price is unknown */
priceDollars: number ;
}
```

Code that computes with `priceDollars` will silently use `-1` as if it were a real price. Prefer:

- `number | null` — TypeScript forces you to check before using
- A tagged union — if `null`/`undefined` semantics aren't clear (e.g., "pending" vs. "error" are different; don't both map to `null`)

**Things to Remember**

- Avoid special values that are assignable to regular values in a type. They will reduce TypeScript's ability to find bugs in your code.
- Prefer `null` or `undefined` as a special value instead of `0`, `-1`, or `""`.
- Consider using a tagged union rather than `null` or `undefined` if the meaning of those values isn't clear.

### Item 37: Limit the Use of Optional Properties

**Problem — optional properties prevent TypeScript from catching omissions:**

```
type UnitSystem = 'metric' | 'imperial';
interface FormattedValue {
value: number ;
units: string ;
/** default is imperial */
unitSystem?: UnitSystem;
}
```

```
interface AppConfig {
darkMode: boolean ;
// ... other settings ...
/** default is imperial */
unitSystem?: UnitSystem;
}
```

```
function formatHike({miles, hours}: Hike, config: AppConfig) {
const { unitSystem } = config;
const distanceDisplay = formatValue({
value: miles, units: 'miles', unitSystem
});
const paceDisplay = formatValue({
value: miles / hours, units: 'mph' // forgot unitSystem, oops!
});
return `${distanceDisplay} at ${paceDisplay}`;
}
```

The missing `unitSystem` in the second call is a bug, but TypeScript can't flag it because the property is optional. Metric users get inconsistent units. Every callsite has this potential for omission.

**Problem — optional properties require scattered default logic:**

```
declare let config: AppConfig;
const unitSystem = config.unitSystem ?? 'imperial';
```

Every place that reads an optional property must supply a default. Different developers may use different defaults, causing inconsistency.

**Fix — split into an input type and a normalized type:**

```
interface InputAppConfig {
darkMode: boolean ;
// ... other settings ...
/** default is imperial */
unitSystem?: UnitSystem;
}
interface AppConfig extends InputAppConfig {
unitSystem: UnitSystem; // required
}
```

Or equivalently use `Required<InputAppConfig>`.

Normalize at the boundary:

```
function normalizeAppConfig(inputConfig: InputAppConfig): AppConfig {
return {
...inputConfig,
unitSystem: inputConfig.unitSystem ?? 'imperial',
};
}
```

Benefits:
1. Backward compatibility without spreading `??` logic throughout the codebase
2. Default values applied in exactly one place
3. Type system prevents using an `InputAppConfig` where an `AppConfig` is expected

**Combinatorial explosion — N optional properties create 2^N combinations.** Most combinations may be nonsensical. If properties are mutually exclusive, model them with a tagged union instead.

**When optional properties are appropriate:**
- Describing existing APIs or maintaining backward compatibility
- Truly optional data (e.g., `middleName` on `Person`)
- Very large configs where filling in all defaults is prohibitively expensive

**Things to Remember**

- Optional properties can prevent the type checker from finding bugs and can lead to repeated and possibly inconsistent code for filling in default values.
- Think twice before adding an optional property to an interface. Consider whether you could make it required instead.
- Consider creating distinct types for un-normalized input data and normalized data for use in your code.
- Avoid a combinatorial explosion of options.

### Item 38: Avoid Repeated Parameters of the Same Type

**Problem — same-type positional parameters are silently swappable:**

```
function drawRect(x: number , y: number , w: number , h: number , opacity: number ) {
// ...
}
```

`drawRect(25, 50, 75, 100, 1)` is ambiguous at the call site; swapping arguments produces no type error.

**Fix 1 — use distinct named types:**

```
interface Point {
x: number ;
y: number ;
}
interface Dimension {
width: number ;
height: number ;
}
function drawRect(topLeft: Point, size: Dimension, opacity: number ) {
// ...
}
```

Passing two `Point`s is now a type error:

```
drawRect({x: 25, y: 50}, {x: 75, y: 100}, 1.0);
// ~
// Argument ... is not assignable to parameter of type 'Dimension'.
```

**Fix 2 — combine into a single options object:**

```
interface DrawRectParams extends Point, Dimension {
opacity: number ;
}
function drawRect(params: DrawRectParams) { /* ... */ }
```

```
drawRect({x: 25, y: 50, width: 75, height: 100, opacity: 1.0});
```

**General guideline:** Functions with more than 3–4 parameters should be refactored to take fewer (typescript-eslint's `max-params` rule can enforce this). Same-type parameters are a red flag even with just two.

**Exceptions:**
- Commutative arguments: `max(a, b)`, `isEqual(a, b)` — order doesn't matter
- Arguments with a universally agreed natural order: `slice(start, stop)` — but be careful, "natural" order isn't always obvious

**Things to Remember**

- Avoid writing functions that take consecutive parameters with the same TypeScript type.
- Refactor functions that take many parameters to take fewer parameters with distinct types, or a single object parameter.

### Item 39: Prefer Unifying Types to Modeling Differences

**Problem — maintaining two variants of the same type creates friction:**

Database returns snake_case; TypeScript convention is camelCase:

```
interface StudentTable {
first_name: string ;
last_name: string ;
birth_date: string ;
}
```

```
interface Student {
firstName: string ;
lastName: string ;
birthDate: string ;
}
```

You can derive one from the other using template literal types (`ObjectToCamel<StudentTable>`), but then every boundary between DB and app code requires explicit conversion, and forgetting it is a type error:

```
async function writeStudentToDb(student: Student) {
await writeRowToDb(db, 'students', student);
// ~~~~~~~
// Type 'Student' is not assignable to parameter of type 'StudentTable'.
}
```

```
async function writeStudentToDb(student: Student) {
await writeRowToDb(db, 'students', objectToSnake(student)); // ok
}
```

**Prefer eliminating the difference to modeling it:**
- Adopt snake_case throughout (simpler — no adapter needed, just accept the naming inconsistency)
- Or adopt camelCase throughout with a DB adapter (consistent naming, more setup)

Either way is better than two parallel types requiring constant conversion.

**Caveats:**
- Unification isn't always possible — if the DB and API are outside your control, you need to model both types. Do it systematically with type-level machinery so transformations are caught by the type checker.
- Don't unify types that represent genuinely different things — members of a tagged union should stay separate.

**Things to Remember**

- Having distinct variants of the same type creates cognitive overhead and requires lots of conversion code.
- Rather than modeling slight variations on a type in your code, try to eliminate the variation so that you can unify to a single type.
- Unifying types may require some adjustments to runtime code.
- If the types aren't in your control, you may need to model the variations.
- Don't unify types that aren't representing the same thing.

### Item 40: Prefer Imprecise Types to Inaccurate Types

**The tradeoff:** Increasing type precision is usually good, but imprecise types that are still correct are better than precise types that are wrong. Inaccurate types force users to add type assertions or suppress errors, undermining confidence in the type system.

**Example — GeoJSON coordinate precision:**

```
interface Point {
type : 'Point';
coordinates: number [];
}
```

Attempting to improve precision with a tuple:

```
type GeoPosition = [ number , number ];
interface Point {
type : 'Point';
coordinates: GeoPosition;
}
```

This breaks for valid GeoJSON — positions may have a third element (elevation). The type is now *inaccurate*, not merely imprecise. Users must cast or abandon the declarations.

**Example — Lisp-like expression types at increasing precision levels:**

```
type Expression1 = any ;
type Expression2 = number | string | any [];
```

Level 3 — restrict the first element of call expressions to known function names:

```
type FnName = '+' | '-' | '*' | '/' | '>' | '<' | 'case' | 'rgb';
type CallExpression = [FnName, ... any []];
type Expression3 = number | string | CallExpression;
```

```
const okExpressions: Expression3[] = [
10,
"red",
["+", 10, 5],
["rgb", 255, 128, 64],
["case", [">", 20, 10], "red", "blue"],
];
const invalidExpressions: Expression3[] = [
true ,
// Error: Type 'boolean' is not assignable to type 'Expression3'
["**", 2, 31],
// ~~ Type '"**"' is not assignable to type 'FnName'
["rgb", 255, 0, 127, 0], // Should be an error: too many values
["case", [">", 20, 10], "red", "blue", "green"], // (Too many values)
];
```

Level 4 — enforce argument counts (recursive types):

```
type Expression4 = number | string | CallExpression;
```

```
type CallExpression = MathCall | CaseCall | RGBCall;
```

```
type MathCall = [
'+' | '-' | '/' | '*' | '>' | '<',
Expression4,
Expression4,
];
```

```
interface CaseCall {
0: 'case';
[n: number ]: Expression4;
length: 4 | 6 | 8 | 10 | 12 | 14 | 16; // etc.
}
```

```
type RGBCall = ['rgb', Expression4, Expression4, Expression4];
```

Now all previously missing errors are caught. But error messages become confusing:

```
["rgb", 255, 0, 127, 0],
// ~ Type 'number' is not assignable to type 'undefined'.
["case", [">", 20, 10], "red", "blue", "green"],
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Types of property 'length' are incompatible.
// Type '5' is not assignable to type '4 | 6 | 8 | 10 | 12 | 14 | 16'.
```

And `Expression4` is also *inaccurate*: it requires exactly two args for all math ops, but `+` and `*` can take more, and `-` can take one (negation):

```
const moreOkExpressions: Expression4[] = [
['-', 12],
// ~~~~~~ Type '["-", number]' is not assignable to type 'MathCall'.
// Source has 2 element(s) but target requires 3.
['+', 1, 2, 3],
// ~ Type 'number' is not assignable to type 'undefined'.
['*', 2, 3, 4],
// ~ Type 'number' is not assignable to type 'undefined'.
];
```

The "uncanny valley" effect applies to types: once types look precise, users trust them more — so inaccuracies at higher precision levels cause more damage than at low precision levels.

**Rules of thumb:**
- Going from `any` / very imprecise → somewhat precise: almost always a win
- Going from somewhat precise → very precise: requires careful testing, watch for confusing error messages and broken autocomplete
- If you can't model something accurately, leave it imprecise with `any` or `unknown` rather than modeling it inaccurately

**Things to Remember**

- Avoid the uncanny valley of type safety: complex but inaccurate types are often worse than simpler, less precise types. If you cannot model a type accurately, do not model it inaccurately! Acknowledge the gaps using `any` or `unknown`.
- Pay attention to error messages and autocomplete as you make typings increasingly precise. It's not just about correctness: developer experience matters, too.
- As your types grow more complex, your test suite for them should expand.

### Item 41: Name Types Using the Language of Your Problem Domain

**Bad naming — ambiguous, generic terms:**

```
interface Animal {
name: string ;
endangered: boolean ;
habitat: string ;
}
```

```
const leopard: Animal = {
name: 'Snow Leopard',
endangered: false ,
habitat: 'tundra',
};
```

Problems:
- `name` — scientific name? Common name? Both?
- `endangered: boolean` — does `false` mean "not endangered," "extinct," or something else?
- `habitat: string` — undefined scope; what counts as a habitat?
- Variable is named `leopard` but the `name` field is `"Snow Leopard"` — is the distinction meaningful?

**Better naming — use established domain vocabulary:**

```
interface Animal {
commonName: string ;
genus: string ;
species: string ;
status: ConservationStatus;
climates: KoppenClimate[];
}
type ConservationStatus = 'EX' | 'EW' | 'CR' | 'EN' | 'VU' | 'NT' | 'LC';
type KoppenClimate = |
'Af' | 'Am' | 'As' | 'Aw' |
'BSh' | 'BSk' | 'BWh' | 'BWk' |
'Cfa' | 'Cfb' | 'Cfc' | 'Csa' | 'Csb' | 'Csc' | 'Cwa' | 'Cwb' | 'Cwc' |
'Dfa' | 'Dfb' | 'Dfc' | 'Dfd' |
'Dsa' | 'Dsb' | 'Dsc' | 'Dwa' | 'Dwb' | 'Dwc' | 'Dwd' |
'EF' | 'ET';
const snowLeopard: Animal = {
commonName: 'Snow Leopard',
genus: 'Panthera',
species: 'Uncia',
status: 'VU', // vulnerable
climates: ['ET', 'EF', 'Dfd'], // alpine or subalpine
};
```

Improvements:
- `commonName`, `genus`, `species` — unambiguous, standard biological terms
- `status: ConservationStatus` — uses IUCN's standard classification
- `climates: KoppenClimate[]` — uses the Köppen climate classification; documentation is available online

**Additional naming rules:**

- **Make distinctions meaningful.** Using two different names implies a meaningful difference. If no difference exists, use the same name — synonyms confuse readers of code.
- **Avoid vague names** like `data`, `info`, `thing`, `item`, `object`, `entity`. If `Entity` has a specific domain meaning, fine — but don't use it as a lazy placeholder.
- **Name things for what they are, not what they contain or how they're computed.** `Directory` is better than `INodeList` — it captures the concept, not the implementation. Good names raise the level of abstraction.

These same considerations apply to function parameter names, tuple labels, and index type labels.

**Things to Remember**

- Reuse names from the domain of your problem where possible to increase the readability and level of abstraction of your code. Make sure you use domain terms accurately.
- Avoid using different names for the same thing: make distinctions in names meaningful.
- Avoid vague names like "Info" or "Entity." Name types for what they are, rather than for their shape.

### Item 42: Avoid Types Based on Anecdotal Data

**The problem — hand-written types from sample data miss edge cases:**

```
function calculateBoundingBox(f: GeoJSONFeature): BoundingBox | null {
let box: BoundingBox | null = null ;

const helper = (coords: any []) => {
// ...
};

const {geometry} = f;
if (geometry) {
helper(geometry.coordinates);
}

return box;
}
```

Homegrown type declarations written from observed data:

```
interface GeoJSONFeature {
type : 'Feature';
geometry: GeoJSONGeometry | null ;
properties: unknown ;
}
interface GeoJSONGeometry {
type : 'Point' | 'LineString' | 'Polygon' | 'MultiPolygon';
coordinates: number [] | number [][] | number [][][] | number [][][][];
}
```

This passes the type checker. But it's wrong — the GeoJSON spec also includes `GeometryCollection`, which has no `coordinates` property.

**With official types from DefinitelyTyped:**

```
$ npm install --save-dev @types/geojson
+ @types/geojson@7946.0.14
```

```
import {Feature} from 'geojson';

function calculateBoundingBox(f: Feature): BoundingBox | null {
let box: BoundingBox | null = null ;

const helper = (coords: any []) => {
// ...
};

const {geometry} = f;
if (geometry) {
helper(geometry.coordinates);
// ~~~~~~~~~~~
// Property 'coordinates' does not exist on type 'Geometry'
// Property 'coordinates' does not exist on type 'GeometryCollection'
}

return box;
}
```

The error reveals a real bug: calling `calculateBoundingBox` on a `GeometryCollection` feature would throw at runtime because `GeometryCollection` has no `coordinates` property.

**Fix — handle `GeometryCollection` explicitly:**

Option 1 — throw with a clear error:

```
const {geometry} = f;
if (geometry) {
if (geometry. type === 'GeometryCollection') {
throw new Error('GeometryCollections are not supported.');
}
helper(geometry.coordinates); // OK
}
```

Option 2 — support it properly:

```
const geometryHelper = (g: Geometry) => {
if (g. type === 'GeometryCollection') {
g.geometries.forEach(geometryHelper);
} else {
helper(g.coordinates); // OK
}
}

const {geometry} = f;
if (geometry) {
geometryHelper(geometry);
}
```

**Generating types from schemas:**

For APIs with an OpenAPI schema, extract and generate types rather than writing them by hand:

```
$ jq .components.schemas.CreateCommentRequest schema.json > comment.json
$ npx json-schema-to-typescript comment.json > comment.ts
$ cat comment.ts
// ....
export interface CreateCommentRequest {
body: string;
postId: string;
title: string;
}
```

Generated types reflect the real schema including nullability and required fields. For GraphQL, schema-aware tools generate types from queries directly.

**If no spec is available:** Tools like `quicktype` can infer types from data samples, but be aware that your sample may miss edge cases. Only trust them if your dataset is exhaustive.

**Things to Remember**

- Avoid writing types by hand based on data that you've seen. It's easy to misunderstand a schema or get nullability wrong.
- Prefer types sourced from official clients or the community. If these don't exist, generate TypeScript types from schemas.
