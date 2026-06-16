### Item 72: Prefer ECMAScript Features to TypeScript Features

TypeScript's governing principle: TC39 defines the runtime, while TypeScript innovates solely in the type space.

A few older features predate this decision and don't fit the pattern of the rest of the language. Avoid them to keep the TypeScript/JavaScript relationship clear, ensure compatibility with alternative compilers, and avoid future standards-alignment breakage.

**Enums**

```
enum Flavor {
Vanilla = 0,
Chocolate = 1,
Strawberry = 2,
}
```
```
let flavor = Flavor.Chocolate;
// ^? let flavor: Flavor
```
```
Flavor // Autocomplete shows: Vanilla, Chocolate, Strawberry
Flavor[0] // Value is "Vanilla"
```

Enum variants and their behaviors:

- **Number-valued enum** (like `Flavor` above): The `number` type is assignable to this, so it's not very safe. Designed this way to support bit flag structures.
- **String-valued enum**: Offers type safety and more informative runtime values. But unlike every other type in TypeScript, it is **not structurally typed** (nominally typed).
- **`const enum`**: Goes away completely at runtime. The compiler rewrites `Flavor.Chocolate` as `1`. Still has divergent behaviors between string and number variants.
- **`const enum` with `preserveConstEnums`**: Emits runtime code for `const enum`, just like a regular enum.

String-valued enums are nominally typed — a particular surprise since every other type uses structural typing:

```
enum Flavor {
Vanilla = 'vanilla',
Chocolate = 'chocolate',
Strawberry = 'strawberry',
}
```
```
let favoriteFlavor = Flavor.Chocolate; // Type is Flavor
favoriteFlavor = 'strawberry';
// ~~~~~~~~~~~ Type '"strawberry"' is not assignable to type 'Flavor'
```

This creates divergent behavior for library consumers. A `Flavor` at runtime is a string, so JavaScript callers can pass a string literal directly:

```
scoop('vanilla'); // OK in JavaScript
```

But TypeScript callers get an error and must import and use the enum:

```
scoop('vanilla');
// ~~~~~~~~~ '"vanilla"' is not assignable to parameter of type 'Flavor'
```
```
import {Flavor} from 'ice-cream';
scoop(Flavor.Vanilla); // OK
```

**Preferred alternative — union of literal types:**

```
type Flavor = 'vanilla' | 'chocolate' | 'strawberry';
```
```
let favoriteFlavor: Flavor = 'chocolate'; // OK
favoriteFlavor = 'americone dream';
// ~~~~~~~~~~~ Type '"americone dream"' is not assignable to type 'Flavor'
```

- Provides the same safety as a string enum
- Structurally typed (consistent with the rest of TypeScript)
- Translates directly to JavaScript (no code generation)
- Provides editor autocomplete

Prefer string values over numeric enums. Numeric enums lack the expected safety and produce opaque values (`{"flavor": 1}` vs `{"flavor": "chocolate"}`).

**Parameter Properties**

Standard class with constructor assignment:

```
class Person {
name: string ;
constructor (name: string ) {
this .name = name;
}
}
```

TypeScript's compact parameter property syntax:

```
class Person {
constructor ( public name: string ) {}
}
```

Issues with parameter properties:

- They generate code when compiled to JavaScript (one of the few constructs that do so — enums are another). Compilation usually just erases types.
- The parameter only appears in generated code, so the source looks like it has unused parameters.
- Mixing parameter and nonparameter properties hides class design:

```
class Person {
first: string ;
last: string ;
constructor ( public name: string ) {
[ this .first, this .last] = name.split(' ');
}
}
```

This class has three properties (`first`, `last`, `name`), but only two are listed before the constructor, making the class structure hard to read.

If a class has only parameter properties and no methods, consider using an interface with object literals instead. Structural typing makes them interchangeable:

```
class PersonClass {
constructor ( public name: string ) {}
}
const p: Person Class = { name: 'Jed Bartlet' }; // OK
```
```
interface Person {
name: string ;
}
const jed: Person = new PersonClass('Jed Bartlet'); // also OK
```

**Namespaces and Triple-Slash Imports**

TypeScript's legacy module system used a `module` keyword and triple-slash imports. `namespace` was later added as a synonym:

```
// other.ts
namespace foo {
export function bar() {}
}
```
```
// index.ts
/// <reference path="other.ts"/>
foo.bar();
```

Outside of type declaration files, triple-slash imports and the `module` keyword are historical curiosities. Use ECMAScript 2015-style `import` and `export` instead.

**experimentalDecorators**

Standard ECMAScript decorators (stage 3, 2023) require no flags:

```
class Greeter {
greeting: string ;
constructor (message: string ) {
this .greeting = message;
}
@logged // <-- this is the decorator
greet() {
return `Hello, ${ this .greeting}`;
}
}
```
```
function logged(originalFn: any , context: ClassMethodDecoratorContext) {
return function ( this : any , ...args: any []) {
console.log(`Calling ${String(context.name)}`);
return originalFn.call( this , ...args);
};
}
```
```
console.log( new Greeter('Dave').greet());
// Logs:
// Calling greet
// Hello, Dave
```

- If `experimentalDecorators` is set in `tsconfig.json`, you are using nonstandard decorators.
- If possible, turn this off. You may be forced to keep it by a framework until it adopts the latest standard.
- If using `experimentalDecorators`, avoid writing new nonstandard decorators — you'll eventually need to migrate them.
- Avoid decorators that change a method's type signature.

**Member Visibility Modifiers (Private, Protected, and Public)**

TypeScript's `private` is a type-system construct only — it is erased at runtime:

```
class Diary {
private secret = 'cheated on my English test';
}
```
```
const diary = new Diary();
diary.secret
// ~~~~~~ Property 'secret' is private and only accessible within ... 'Diary'
```

At runtime, the compiled JavaScript exposes the field:

```
class Diary {
constructor() {
this .secret = 'cheated on my English test';
}
}
const diary = new Diary();
diary.secret;
```

TypeScript's `private` can be bypassed even within TypeScript:

```
const diary = new Diary();
(diary as any ).secret // OK
```
```
console.log(Object.entries(diary));
// logs [["secret", "cheated on my English test"]]
```

**ECMAScript private fields (`#`)** are enforced both by the type checker and at runtime:

```
class PasswordChecker {
#passwordHash: number ;

constructor (passwordHash: number ) {
this .#passwordHash = passwordHash;
}

checkPassword(password: string ) {
return hash(password) === this .#passwordHash;
}
}
```
```
const checker = new PasswordChecker(hash('s3cret'));
checker.#passwordHash
// ~~~~~~~~~~~~~ Property '#passwordHash' is not accessible outside class
// 'PasswordChecker' because it has a private identifier.
checker.checkPassword('secret'); // Returns false
checker.checkPassword('s3cret'); // Returns true
```

- `#private` fields are not accessible from outside the class and are not enumerable.
- Even for targets that don't natively support private fields (ES2021 or earlier), a fallback implementation keeps data private.
- Use ECMAScript `#` private fields instead of TypeScript's `private`.
- `public` is the default visibility — no need to annotate it explicitly.
- `protected` implies inheritance; prefer composition over inheritance, making practical uses of `protected` rare.
- `readonly` as a field modifier is a type-level construct and is fine to use. A field may be both `#private` and `readonly`.

**Things to Remember**

- By and large, you can convert TypeScript to JavaScript by removing all the types from your code.
- Enums, parameter properties, triple-slash imports, experimental decorators, and member visibility modifiers are historical exceptions to this rule.
- To keep TypeScript's role in your codebase as clear as possible and to avoid future compatibility issues, avoid nonstandard features.

### Item 73: Use Source Maps to Debug TypeScript

When you run TypeScript code, you're actually running the JavaScript the TypeScript compiler generates. Debuggers work on the executing code and don't know about any source-to-source translation. Source maps solve this: they map positions and symbols in generated files back to the original source.

Enable source maps in `tsconfig.json`:

```
{
"compilerOptions" : {
"sourceMap" : true
}
}
```

Running `tsc` then generates two output files per `.ts` file: a `.js` file and a `.js.map` file. With the map file in place, the original `.ts` file appears in browser debuggers, and you can set breakpoints and inspect variables in it.

**Why source maps matter — async/await example:**

TypeScript rewriting `async`/`await` as a state machine for older browser targets produces JavaScript that bears little resemblance to the original source, making direct JavaScript debugging impractical. Source maps restore the original TypeScript view.

**Debugging Node.js with source maps:**

```
// bedtime.ts
async function sleep(ms: number ) {
return new Promise< void >(resolve => setTimeout(resolve, ms));
}
```
```
async function main() {
console.log('Good night!');
await sleep(1000);
console.log('Morning already!?');
}
```
```
main();
```

Compile with `sourceMap` enabled, then run with `--inspect-brk`:

```
$ tsc bedtime.ts
$ node --inspect-brk bedtime.js
Debugger listening on ws://127.0.0.1:9229/587c380b-fdb4-48df-8c09-a83f36d8a2e7
For help, see: https://nodejs.org/en/docs/inspector
```

Then navigate to `chrome://inspect` in Chrome to select and inspect the remote target. The `--inspect-brk` flag pauses execution at the very beginning, giving you time to switch to the TypeScript view and set breakpoints.

`debugger` statements in JavaScript are another way to set a precise breakpoint.

**Source map caveats:**

- **Bundlers/minifiers**: If used alongside TypeScript, ensure the source map maps all the way back to the original TypeScript sources, not just the generated JavaScript. If your bundler has built-in TypeScript support, this typically works automatically.
- **Production**: If your JS file references a source map, the browser only loads it when the debugger is open — no performance impact. Inline source maps are always downloaded, so avoid them in production. Source maps may contain a copy of your original source code — don't publish them unless intentional.

**Declaration maps:**

If you generate `.d.ts` files (`declaration` option), set `declarationMap` to also generate `.d.ts.map` files. These map type declarations back to the original source and improve language services like "Go to Definition," especially with project references.

**Things to Remember**

- Don't debug generated JavaScript. Use source maps to debug your TypeScript code at runtime.
- Make sure that your source maps are mapped all the way through to the code that you run.
- Know how to debug Node.js code written in TypeScript.
- Depending on your settings, your source maps might contain an inline copy of your original code. Don't publish them unless you know what you're doing!

### Item 74: Know How to Reconstruct Types at Runtime

TypeScript types are erased at runtime. When you need type information at runtime (e.g., for input validation), you must reconstruct it through other means.

**The problem — manual validation duplicates type definitions:**

```
interface CreateComment {
postId: string ;
title: string ;
body: string ;
}
```
```
app.post('/comment', (request, response) => {
const {body} = request;
if (
!body ||
typeof body !== 'object' ||
Object.keys(body).length !== 3 ||
!('postId' in body) || typeof body.postId !== 'string' ||
!('title' in body) || typeof body.title !== 'string' ||
!('body' in body) || typeof body.body !== 'string'
) {
return response.status(400).send('Invalid request');
}
const comment = body as CreateComment;
// ... application validation and logic ...
return response.status(200).send('ok');
});
```

This validation duplicates the type and must be kept in sync manually. Three approaches to solve this:

**Generate the Types from Another Source**

If your API is specified in GraphQL, OpenAPI, or another schema format, use that as the single source of truth and generate both TypeScript types and validation code from it.

- Use `json-schema-to-typescript` to generate TypeScript types from OpenAPI/JSON Schema.
- Use a JSON Schema validator like `Ajv` to validate requests.
- Downside: adds a build step that must run whenever the schema changes.
- Upside: no new sources of truth — preferred when you already have a schema.

**Define Types with a Runtime Library**

TypeScript cannot derive runtime values from static types, but going the other direction is straightforward via `typeof`:

```
const val = { postId: '123', title: 'First', body: 'That is all'};
type ValType = typeof val;
// ^? type ValType = { postId: string; title: string; body: string; }
```

Libraries like Zod define types as runtime constructs; static types are derived from those:

```
import { z } from 'zod';
```
```
// runtime value for type validation
const createCommentSchema = z.object({
postId: z. string (),
title: z. string (),
body: z. string (),
});
```
```
// static type
type CreateComment = z. infer < typeof createCommentSchema>;
// ^? type CreateComment = { postId: string; title: string; body: string; }
```
```
app.post('/comment', (request, response) => {
const {body} = request;
try {
const comment = createCommentSchema.parse(body);
// ^? const comment: { postId: string; title: string; body: string; }
// ... application validation and logic ...
return response.status(200).send('ok');
} catch (e) {
return response.status(400).send('Invalid request');
}
});
```

`createCommentSchema` is the single source of truth; both the static type and validation are derived from it.

Downsides:
- Two ways to define types: Zod's syntax (`z.object`) and TypeScript's (`interface`).
- Runtime type systems are contagious: any type referenced by a Zod schema must also be defined as a runtime type, making it hard to interoperate with external types or generated types.

Advantages:
- Zod can express constraints TypeScript cannot, e.g., "valid email address" or "integer."
- No additional build step — everything stays in TypeScript.

**Generate Runtime Values from Your Types**

Reverse the approach: generate a runtime value (e.g., JSON Schema) from your TypeScript types using `typescript-json-schema`.

Put types in `api.ts`:

```
// api.ts
export interface CreateComment {
postId: string ;
title: string ;
body: string ;
}
```

Generate JSON Schema:

```
$ npx typescript-json-schema api.ts '*' > api.schema.json
```

Result (`api.schema.json`):

```
{
"$schema" : "http://json-schema.org/draft-07/schema#",
"definitions" : {
"CreateComment" : {
"type" : "object",
"properties" : {
"body" : { "type" : "string" },
"postId" : { "type" : "string" },
"title" : { "type" : "string" }
}
}
}
}
```

Load and validate at runtime using Ajv (enable `resolveJsonModule` in tsconfig):

```
import Ajv from 'ajv';
```
```
import apiSchema from './api.schema.json';
import {CreateComment} from './api';
```
```
const ajv = new Ajv();
```
```
app.post('/comment', (request, response) => {
const {body} = request;
if (!ajv.validate(apiSchema.definitions.CreateComment, body)) {
return response.status(400).send('Invalid request');
}
const comment = body as CreateComment;
// ... application validation and logic ...
return response.status(200).send('ok');
});
```

Advantage: Use all TypeScript tooling to define types; no second type-definition syntax. API types can reference `@types` or other external sources.

Downside: New tool and build step — `api.schema.json` must be regenerated whenever `api.ts` changes. Enforce synchronization in CI.

**Choosing an approach:**

- If types are already expressed in another schema (OpenAPI, etc.) — use that as the single source of truth.
- If you need to reference types only defined in TypeScript (from libraries, generated code) — use `typescript-json-schema`.
- Otherwise — choose between introducing a build step (generate from types) or a second type-definition system (Zod).

**Things to Remember**

- TypeScript types are erased before your code is run. You can't access them at runtime without additional tooling.
- Know your options for runtime types: using a distinct runtime type system (such as Zod), generating TypeScript types from values (json-schema-to-typescript), and generating values from your TypeScript types (typescript-json-schema).
- If you have another specification for your types (e.g., a schema), use that as the source of truth.
- If you need to reference external TypeScript types, use typescript-json-schema or an equivalent.
- Otherwise, weigh whether you prefer another build step or another system for specifying types.

### Item 75: Understand the DOM Hierarchy

(Applies only when writing TypeScript for a browser environment.)

**The DOM type hierarchy**

```
const p = document.getElementsByTagName('p')[0];
p instanceof HTMLParagraphElement
// true
```

`HTMLParagraphElement` is a subtype of `HTMLElement`, which is a subtype of `Element`, which is a subtype of `Node`, which is a subtype of `EventTarget`. These are JavaScript runtime values, not just TypeScript types.

| Type | Examples |
|------|---------|
| `EventTarget` | `window`, `XMLHttpRequest` |
| `Node` | `document`, `Text`, `Comment` |
| `Element` | `HTMLElement`s, `SVGElement`s |
| `HTMLElement` | `<i>`, `<b>` |
| `HTMLButtonElement` | `<button>` |

**Type-specific behaviors:**

- **`EventTarget`**: Most general type. Can only add/remove event listeners and dispatch events. No `classList`, no coordinate properties.
- **`Node`**: Includes text fragments and comments, not just `Element`s. `children` returns `HTMLCollection` (only child `Element`s); `childNodes` returns `NodeList` (includes text fragments and comments).
- **`Element`**: Includes both `HTMLElement` and `SVGElement` hierarchies. For non-SVG/MathML pages, all `Element`s are `HTMLElement`s.
- **Specialized `HTMLElement` subclasses**: `HTMLImageElement` has `src`; `HTMLInputElement` has `value`. Reading these properties requires a type specific enough to have them.

**Why TypeScript flags errors in DOM code:**

```
function handleDrag(eDown: Event) {
const targetEl = eDown.currentTarget;
targetEl.classList.add('dragging');
// ~~~~~ 'targetEl' is possibly 'null'
// ~~~~~~~~~ Property 'classList' does not exist on type 'EventTarget'
const dragStart = [
eDown.clientX, eDown.clientY
// ~~~~~~~ ~~~~~~~ Property '...' does not exist on 'Event'
];
// ...
}
```

- `currentTarget` is typed as `EventTarget | null` — it could be `window` or `XMLHttpRequest`, neither of which has `classList`.
- `clientX`/`clientY` exist only on `MouseEvent`, not on the generic `Event` type.
- `currentTarget` is the element the listener was registered on; `target` is the element where the event originated — they can differ.

**Getting specific types from DOM APIs:**

```
const p = document.getElementsByTagName('p')[0];
// ^? const p: HTMLParagraphElement
const button = document.createElement('button');
// ^? const button: HTMLButtonElement
const div = document.querySelector('div');
// ^? const div: HTMLDivElement | null
```

`document.getElementById` returns the less specific `HTMLElement | null`:

```
const div = document.getElementById('my-div');
// ^? const div: HTMLElement | null
```

When you know more than TypeScript, a type assertion is appropriate:

```
document.getElementById('my-div') as HTMLDivElement;
```

Or use a runtime check:

```
const div = document.getElementById('my-div');
if (div instanceof HTMLDivElement) {
console.log(div);
// ^? const div: HTMLDivElement
}
```

With `strictNullChecks`, handle the null case with an `if` check or non-null assertion (`!`):

```
const div = document.getElementById('my-div')!;
// ^? const div: HTMLElement
```

**Event hierarchy:**

`lib.dom.d.ts` defines 54+ subtypes of `Event`. Key types:
- `UIEvent`: Any user interface event
- `MouseEvent`: Mouse-triggered events (has `clientX`, `clientY`)
- `TouchEvent`: Touch events on mobile
- `KeyboardEvent`: Key presses

**Fixed version of the drag example — inlining the handler gives TypeScript more context:**

```
function addDragHandler(el: HTMLElement) {
el.addEventListener('mousedown', eDown => {
const dragStart = [eDown.clientX, eDown.clientY];
const handleUp = (eUp: MouseEvent) => {
el.classList.remove('dragging');
el.removeEventListener('mouseup', handleUp);
const dragEnd = [eUp.clientX, eUp.clientY];
console.log('dx, dy = ', [0, 1].map(i => dragEnd[i] - dragStart[i]));
}
el.addEventListener('mouseup', handleUp);
});
}
```
```
const surfaceEl = document.getElementById('surface');
if (surfaceEl) {
addDragHandler(surfaceEl);
}
```

**Things to Remember**

- The DOM has a type hierarchy that you can usually ignore while writing JavaScript. But these types become more important in TypeScript. Understanding them will help you write TypeScript for the browser.
- Know the differences between Node, Element, HTMLElement, and EventTarget, as well as those between Event and MouseEvent.
- Either use a specific enough type for DOM elements and Events in your code or give TypeScript the context to infer it.

### Item 76: Create an Accurate Model of Your Environment

TypeScript needs a static model of your runtime environment to catch errors. The more accurate the model, the more effective the type checking.

**Modeling the browser environment:**

```
{
"compilerOptions" : {
"lib" : ["dom", "es2021"]
}
}
```

- `"dom"`: includes browser type declarations.
- `"es2021"`: TypeScript enforces that only features available in the ES2021 standard are used. Using newer features (e.g., `array.toSorted()`) results in a type error.
- Alternative: install `@types/web` for more version control over DOM types.

**Modeling global variables added by other scripts:**

```
// user-info-global.d.ts
interface UserInfo {
name: string ;
accountId: string ;
}

declare global {
interface Window {
userInfo: UserInfo;
}
}
```

**Modeling third-party libraries:**

```
$ npm install --save-dev @types/google.analytics @types/jquery
```

The `@types` package version must match the library version used on the page. Version mismatches cause spurious errors or missed real ones.

**Modeling non-JS imports (e.g., webpack CSS/image imports):**

```
import sunrisePath from './images/beautiful-sunrise.jpg';
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Cannot find module './images/beautiful-sunrise.jpg' or its type declarations.
```

Fix with a declaration file:

```
// webpack-imports.d.ts
declare module '*.jpg' {
const src: string ;
export default src;
}
```

**Modeling multiple environments (client/server/test):**

Use multiple `tsconfig.json` files with project references (discussed in Item 78) to model distinct environments separately.

For Node.js: install the `@types/node` version that matches your runtime Node.js version to ensure only available library features are used.

**Things to Remember**

- Your code runs in a particular environment. TypeScript will do a better job of checking your code if you create an accurate static model of that environment.
- Model global variables and libraries that are loaded onto a web page along with your code.
- Match versions between type declarations and the libraries and runtime environment that you use.
- Use multiple tsconfig.json files and project references to model distinct environments within a single project (for example client and server).

#### Item 77: Understand the Relationship Between Type Checking and Unit Testing

Unit tests and type checking are complementary, not redundant, forms of program verification.

**What each catches:**

- **Unit tests**: demonstrate correct behavior on particular inputs — a lower bound on correctness. Can only test a finite sample of the infinite input space.
- **Type checking**: proves that a whole class of errors is absent (e.g., returning the wrong type) — an upper bound on incorrectness. Checked for all possible inputs.

**Example — type checking catches what tests miss:**

```
function add(a: number , b: number ): number {
if (isNaN(a) || isNaN(b)) {
return 'Not a number!';
// ~~~ Type 'string' is not assignable to type 'number'.
}
return (a|0) + (b|0);
}
```

Type checking catches the wrong return type. But this escapes:

```
function add(a: number , b: number ): number {
return a - b; // oops!
}
```

Any unit test where `b` is non-zero catches this; the type checker cannot.

**Don't write unit tests for type-invalid inputs:**

```
test('out-of-domain add', () => {
expect(add( null , null )).toEqual(0);
// ~~~~ Type 'null' is not assignable to parameter of type 'number'.
expect(add( null , 12)).toEqual(12);
// ~~~~ Type 'null' is not assignable to parameter of type 'number'.
expect(add( undefined , null )).toBe( NaN );
// ~~~~~~~~~ Type 'undefined' is not assignable to parameter of ...
expect(add('ab', 'cd')).toEqual('abcd');
// ~~~~ Type 'string' is not assignable to parameter of type 'number'.
});
```

Rely on the type checker to prevent invalid calls. There is no expected behavior to demonstrate for inputs that violate the type contract.

**Exception — functions with harmful side effects:**

```
interface User {
id: string ;
name: string ;
memberSince: string ;
}
```
```
declare function updateUserById(
id: string ,
update: Partial<Omit<User, 'id'>> & {id?: never }
): Promise<User>;
```

The type enforces that `id` cannot be updated, but type enforcement only applies within TypeScript. If called from JavaScript with untrusted input, the `id` field could be present. Use `@ts-expect-error` to test this behavior:

```
test('invalid update', () => {
// @ts-expect-error Can't call updateUserById to update an ID.
expect(() => updateUserById('123', {id: '234'})).toReject();
});
```

Write tests for type-invalid inputs when there are security or data corruption concerns.

**Bug discovery cost (earliest to latest):**
1. Type checking — reports bugs directly in your editor at the point of error
2. Unit tests — catch bugs during development
3. Integration tests — automated, but slower feedback
4. Manual QA — expensive
5. Production bug reports — worst case

**Things to Remember**

- Type checking and unit testing are different, complementary techniques for demonstrating program correctness. You want both.
- Unit tests demonstrate correct behavior on particular inputs, while type checking eliminates whole classes of incorrect behaviors.
- Rely on the type checker to check types. Write unit tests for behaviors that can't be checked with types.
- Avoid testing inputs that would be type errors unless there are concerns about security or data corruption.

### Item 78: Pay Attention to Compiler Performance

TypeScript has zero runtime performance impact — types are erased. But it can affect developer tooling performance.

**Two forms of performance issues:**

- **`tsc` (build) performance**: slow type checking in CI, slow `.js`/`.d.ts` artifact generation.
- **`tsserver` (editor) performance**: sluggish editor, slow error appearance/disappearance after code changes.

**Separate Type Checking from Building**

Affects: `tsc` (build) only.

Tools like webpack, vite, and `ts-node` type check by default before bundling/running. Run them in "transpile only" mode to skip checking:

```
$ time ts-node --transpileOnly hello.ts
Hello World!
ts-node --transpileOnly hello.ts 0.12s user 0.02s system 110% cpu 0.123 total
$ time ts-node hello.ts
Hello World!
ts-node hello.ts 1.60s user 0.08s system 255% cpu 0.656 total
```

A trivial program took 1.6s with checking vs 0.12s without. Consider using `swc` as an alternative TypeScript compiler for even larger speedups.

Type checking still happens via `tsserver` in your editor and must be run via `tsc` in CI before committing.

**Prune Unused Dependencies and Dead Code**

Affects: both build and editor performance.

Set `noUnusedLocals` to detect some unused code:

```
function foo() {}
// ~~~ 'foo' is declared but its value is never read.
```
```
export function bar() {}
```

This catches un-exported symbols. For exported symbols that are never imported, use a tool like `knip`, which also reports unused third-party dependencies.

Visualize what TypeScript is compiling with `tsc --listFiles`:

```
$ tsc --listFiles
.../lib/node_modules/typescript/lib/lib.es5.d.ts
.../lib/node_modules/typescript/lib/lib.es2015.d.ts
...
```

Generate a treemap weighted by file size to find bloat:

```
$ tsc --noEmit --listFiles | xargs stat -f "%z %N" | npx webtreemap-cli
```

Common causes: one dependency pulling in hundreds of others, multiple versions of the same library. Update versions to align dependencies.

**Incremental Builds and Project References**

Affects: `tsc` (build) only.

Enable `incremental` to write a `.tsbuildinfo` file on first build and use it to speed up subsequent builds.

**Project references** go further: split your codebase into distinct parts (e.g., `src`/`test`, `client`/`server`), each with its own `tsconfig.json`. Implementation changes to one part that don't affect its public API won't force a rebuild of the other parts.

Example structure:

```
root
├── src
│ ├── fib.ts
│ └── tsconfig.json
├── test
│ ├── fib.test.ts
│ └── tsconfig.json
├── tsconfig-base.json
└── tsconfig.json
```

```
// tsconfig-base.json
{
"compilerOptions" : {
// other settings
"declaration" : true ,
"composite" : true
}
}
```
```
// tsconfig.json
{
"files" : [],
"references" : [
{ "path" : "./src" },
{ "path" : "./test" }
]
}
```
```
// src/tsconfig.json
{
"extends" : "../tsconfig-base.json",
"compilerOptions" : {
"outDir" : "../dist/src",
"rootDir" : "."
}
}
```
```
// src/fib.ts
export function fib(n: number ): number {
if (n < 2) {
return n;
}
return fib(n - 1) + fib(n - 2);
}
```
```
// test/tsconfig.json
{
"extends" : "../tsconfig-base.json",
"compilerOptions" : {
"outDir" : "../dist/test",
"rootDir" : "."
},
"references" : [
{ "path" : "../src" }
]
}
```
```
// test/fib.test.ts
import {fib} from '../src/fib';
```
```
describe('fib', () => {
it('should handle base cases', () => {
expect(fib(0)).toEqual(0);
expect(fib(1)).toEqual(1);
})

it('should handle larger numbers', () => {
expect(fib(2)).toEqual(1);
expect(fib(3)).toEqual(2);
expect(fib(4)).toEqual(3);
expect(fib(5)).toEqual(5);
expect(fib(16)).toEqual(987);
});
});
```

Key points:
- `src` and `test` tsconfigs inherit a shared base that sets `composite` and `declaration` (to output `.d.ts` files).
- The top-level `tsconfig.json` only contains references to subprojects.
- `test` references `src`, but not the other way around.

Run with `tsc -b` (build mode). After an implementation-only change to `src/fib.ts`:

```
$ tsc -b -v
Project 'src/tsconfig.json' is out of date because output
'dist/src/tsconfig.tsbuildinfo' is older than input 'src/fib.ts'
Building project 'src/tsconfig.json'...
Project 'test/tsconfig.json' is up to date with .d.ts files from its
dependencies
```

The test project is not rebuilt because the `.d.ts` files (the public API) didn't change.

Project reference caveats:
- Requires `declaration: true` — will not work with `noEmit` or when TypeScript is run via a bundler that doesn't emit `.d.ts` files.
- Most useful in large monorepos where first-party code exceeds third-party code in size. Rarely beneficial for small to medium projects.
- Creating too many sub-projects adds overhead. Scope projects to large chunks (e.g., `src`/`test`, `client`/`server`). A separate project per UI component is counterproductive.

**Simplify Your Types**

Affects: both build and editor performance.

Large union types degrade performance. Example — a `Year` type with 1000 members:

```
type Digit = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';
type Year = `2${Digit}${Digit}${Digit}`;
const validYear: Year = '2024';
```
```
const invalidYear: Year = '1999';
// ~~~~~~~~~~~ Type '"1999"' is not assignable to type
// '"2000" | "2001" | "2002" | ... 996 more ... | "2999"'.
```

Every operation on `Year` checks all 1000 members. Prefer `string`, `number`, or a branded type for performance.

Additional type efficiency improvements:
- **Prefer `extends` over intersection (`&`)** for subtyping: TypeScript operates more efficiently with `interface` extension than with intersecting type aliases.
- **Annotate return types explicitly**: saves TypeScript the work of inferring them.
- **Avoid deep recursive types**: they can blow up compile time.

**Things to Remember**

- There are two forms of TypeScript performance issues: build performance (tsc) and editor latency (tsserver). Recognize the symptoms of each and direct your optimizations accordingly.
- Keep type checking separate from your build process.
- Remove dead code and dependencies, and be on guard for code bloat in type dependencies. Use a treemap to visualize what TypeScript is compiling.
- Use incremental builds and project references to reduce the work tsc does between builds.
- Simplify your types: avoid large unions, use interface extension rather than intersection types, and consider annotating function return types.
