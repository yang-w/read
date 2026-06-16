**CHAPTER 5**

### Unsoundness and the any Type

Type systems were traditionally binary affairs: either a language had a fully static type

system or a fully dynamic one. TypeScript blurs the line, because its type system is

optional and gradual. You’re free to add types to parts of your program but not others.

This is essential for migrating existing JavaScript codebases to TypeScript bit by bit

(Chapter 10). Key to this is the any type, which effectively disables type checking for

parts of your code. It is both powerful and prone to abuse. Learning to use any wisely

is essential for writing effective TypeScript. This chapter walks you through how to

limit the downsides of any while still retaining its benefits.

The any type is just the most extreme example of the more general problem of

unsoundness: when a symbol’s static type does not match its runtime type. Even if you

eliminate all the anys from your code, you may still fall into soundness traps. Item 48

presents a few of these and shows you how to avoid them.

### Item 43: Use the Narrowest Possible Scope for any Types

Consider this code:

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
##### 185


If you somehow know that this call to eatSalad is OK, the best way forward is to

adjust your types so that TypeScript understands that, too. (An arugula pizza with

parmesan and lemon is kind of like a salad!) But if, for whatever reason, you can’t do

that, you can use any to force TypeScript to accept this code in two ways:

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
Of these, the second form is vastly preferable. Why? Because the any type is scoped to

a single expression in a function argument. It has no effect outside this argument or

this line. When code after the eatSalad call references pizza, its type is still Pizza,

and it can still trigger type errors; whereas in the first example, its type is any for its

entire lifetime until it goes out of scope at the end of the function. This means that

the pizza.slice() call is completely unchecked. A spelling mistake or incorrect

parameter type will pass the type checker but throw an exception when you run it.

It would also have been bad to make eatSalad accept an any type. While this would

have left pizza with a Pizza type in eatDinner, it would have prevented type check‐

ing on this parameter for all calls to eatSalad in your program, not just this one.

The stakes become significantly higher if you return pizza from eatDinner. Look

what happens:

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
An any return type is “contagious” in that it can spread throughout a codebase. As a

result of our changes to eatDinner1, an any type has quietly appeared in spiceItUp.

This would not have happened with the more narrowly scoped any in eatDinner2.

**186 | Chapter 5: Unsoundness and the any Type**


This is a good reason to consider including explicit return type annotations, even

when the return type can be inferred. It prevents an any type from inadvertently

“escaping.” You’d have to explicitly write any. See Item 18 for more on the pros and

cons of annotating return types. There are a few functions in the standard library that

return an any type, notably JSON.parse. These are quite dangerous! Item 71 explores

ways to protect yourself.

We used any here to suppress an error that we believed to be incorrect. Another way

to do this is with @ts-ignore or @ts-expect-error:

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
These silence an error on the next line, leaving the type of pizza unchanged. Of these

two forms, @ts-expect-error is preferable because if the error goes away later (per‐

haps the signature of eatSalad changed), TypeScript will tell you, and you’ll be able

to remove the directive.

Because they’re explicitly scoped to one line, @ts-ignore and @ts-expect-error

aren’t “contagious” in the way that any can be. Still, try not to lean too heavily on

these directives: the type checker usually has a good reason to complain and, if the

error on the next line changes to something more problematic, you’ll have prevented

TypeScript from letting you know. And if a second error appears on the same line,

you’ll never find out about it.

You may also run into situations where you get a type error for just one property in a

larger object:

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
```
Item 43: Use the Narrowest Possible Scope for any Types | 187
```

You can silence errors like this by throwing an as any around the whole config

object:

```
const config: Config = {
a: 1,
b: 2,
c: {
key: value
}
} as any ; // Don't do this!
```
But this has the side effect of disabling type checking for the other properties (a and

b) as well. Using a more narrowly scoped any limits the damage:

```
const config: Config = {
a: 1,
b: 2, // These properties are still checked
c: {
key: value as any
}
};
```
If the first example involved limiting the scope of any in time, this is limiting the

scope in space. In both cases the goal is the same: if you must use any, reduce its

scope as much as you possibly can to avoid collateral damage.

If you adopt typescript-eslint’s recommended-type-checked preset, you’ll enable a set

of rules such as no-unsafe-assignment and no-unsafe-return that help to highlight

the spread of any types.

**Things to Remember**

- Make your uses of any as narrowly scoped as possible to avoid undesired loss of
    type safety elsewhere in your code.
- Never return an any type from a function. This will silently lead to the loss of
    type safety for code that calls the function.
- Use as any on individual properties of a larger object instead of the whole object.

### Item 44: Prefer More Precise Variants of any to Plain any

The any type encompasses all values that can be expressed in JavaScript. This is a vast

domain! It includes not just all numbers and strings, but all arrays, objects, regular

expressions, functions, classes, and DOM elements, not to mention null and

undefined. When you use an any type, ask whether you really had something more

specific in mind. Would it be OK to pass in a regular expression or a function?

**188 | Chapter 5: Unsoundness and the any Type**


Often the answer is “no,” in which case you might be able to retain some type safety

by using a more specific type:

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
The latter version, which uses any[] instead of any, is better in three ways:

- The reference to array.length in the function body is type checked.
- The function’s return type is inferred as number instead of any.
- Calls to getLength will be checked to ensure that the parameter is an array:

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
If you expect a parameter to be an array of arrays but don’t care about the type, you

can use any[][].

If you expect some sort of object but don’t know what the values will be, you can use

{[key: string]: any} or Record<string, any>:

```
function hasAKeyThatEndsWithZ(o: Record< string , any >) {
for ( const key in o) {
if (key.endsWith('z')) {
console.log(key, o[key]);
return true ;
}
}
return false ;
}
```
You could also use the object type in this situation, which includes all nonprimitive

types. This is slightly different in that, while you can still enumerate keys, you can’t

access the values of any of them:

```
function hasAKeyThatEndsWithZ(o: object) {
for ( const key in o) {
if (key.endsWith('z')) {
console.log(key, o[key]);
```
```
Item 44: Prefer More Precise Variants of any to Plain any | 189
```

```
// ~~~~~~ Element implicitly has an 'any' type
// because type '{}' has no index signature
return true ;
}
}
return false ;
}
```
Iterating over object types is particularly tricky in TypeScript. Item 60 goes into much

more detail about how to work around this particular issue.

Avoid using any if you expect a function type. You have several options here depend‐

ing on how specific you want to get:

```
type Fn0 = () => any ; // any function callable with no params
type Fn1 = (arg: any ) => any ; // With one param
type FnN = (...args: any []) => any ; // With any number of params
// same as "Function" type
```
All of these are more precise than any and hence preferable to it. Note the use of

any[] as the type for the rest parameter in the last example. any would also work here

but would be less precise:

```
const numArgsBad = (...args: any ) => args.length;
// ^? const numArgsBad: (...args: any) => any
const numArgsBetter = (...args: any []) => args.length;
// ^? const numArgsBetter: (...args: any[]) => number
```
Note the differing return types. Rest parameters are perhaps the most common use of

the any[] type.

If you want an array but don’t care about the type of the elements, you may be able to

use unknown[] instead of any[]. This is preferable because it is safer. See Item 46 for

more on the unknown type.

**Things to Remember**

- When you use any, think about whether any JavaScript value is truly permissible.
- Prefer more precise forms of any such as any[] or {[id: string]: any} or
    () => any if they more accurately model your data.

### Item 45: Hide Unsafe Type Assertions in Well-Typed Functions

In an ideal world, your functions have exactly the type signatures you want and their

implementations (also in TypeScript) pass the type checker, contain no type

assertions or any types, and don’t fall into any other soundness traps (Item 48).

Fortunately, this is the case for most functions you’ll write. But this is the chapter on

**190 | Chapter 5: Unsoundness and the any Type**


any and unsoundness, so you won’t be surprised to hear that things aren’t always

ideal.

If you have to choose between a safe, assertion-free function implementation and the

type signature that you want, choose the type signature. It’s the public API of your

function, and it’s visible to the rest of your code and your users. The function’s imple‐

mentation is a detail that’s hidden from your users. Your assertions and any types will

be hidden from view there. Much better to have an unsafe (but well-tested) imple‐

mentation than to adopt a type signature that makes life hard for your users.

To see how this might come up, consider this code that fetches information about

mountain peaks:

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
The checkedFetchJSON wrapper provides two services here. First, it checks whether

the fetch succeeded and throws (thus rejecting the Promise) if it did not. Second, it

gives the JSON response an unknown type (Item 46) which is safer than the any type

that you’d get by default.

Unfortunately, there’s a type error because unknown is not assignable to MountainPeak.

If you want to avoid type assertions or any types in your fetchPeak implementation,

you’ll have to change the return type to match:

```
export async function fetchPeak(peakId: string ): Promise< unknown > {
return checkedFetchJSON(`/api/mountain-peaks/${peakId}`); // ok
}
```
```
Item 45: Hide Unsafe Type Assertions in Well-Typed Functions | 191
```

This passes the type checker and contains no unsafe assertions (good!), but this

comes at a significant cost. The fetchPeak function is now extremely hard to use:

```
const sevenPeaks = [
'aconcagua', 'denali', 'elbrus', 'everest', 'kilimanjaro', 'vinson', 'wilhelm'
];
async function getPeaksByHeight(): Promise<MountainPeak[]> {
const peaks = await Promise.all(sevenPeaks.map(fetchPeak));
return peaks.toSorted(
// ~~~ Type 'unknown' is not assignable to type 'MountainPeak'.
(a, b) => b.elevationMeters - a.elevationMeters
// ~ ~ 'b' and 'a' are of type 'unknown'
);
}
```
Any code that calls it will likely have to use a type assertion:

```
async function getPeaksByDate(): Promise<MountainPeak[]> {
const peaks = await Promise.all(sevenPeaks.map(fetchPeak)) as MountainPeak[];
return peaks.toSorted((a, b) => b.firstAscentYear - a.firstAscentYear);
}
```
This will result in type assertions scattered throughout your code whenever you call

fetchPeak. This is duplicative, tedious, and introduces the possibility that you’ll

assert different types in different places.

Rather than changing the return type of fetchPeak to placate the type checker, a bet‐

ter approach would be to keep the type signature as it was and add an assertion in the

function body:

```
export async function fetchPeak(peakId: string ): Promise<MountainPeak> {
return checkedFetchJSON(
`/api/mountain-peaks/${peakId}`,
) as Promise<MountainPeak>;
}
```
With the type assertion hidden away in the function implementation, calling code can

be written cleanly without any knowledge of our unsafe secret:

```
async function getPeaksByContinent(): Promise<MountainPeak[]> {
const peaks = await Promise.all(sevenPeaks.map(fetchPeak)); // no assertion!
return peaks.toSorted((a, b) => a.continent.localeCompare(b.continent));
}
```
By localizing the type assertion, we’ve also made it easier to increase its safety. Here’s a

version that checks at least some of the shape of the response:

```
export async function fetchPeak(peakId: string ): Promise<MountainPeak> {
const maybePeak = checkedFetchJSON(`/api/mountain-peaks/${peakId}`);
if (
!maybePeak ||
typeof maybePeak !== 'object' ||
!('firstAscentYear' in maybePeak)
```
**192 | Chapter 5: Unsoundness and the any Type**


##### ) {

```
throw new Error(`Invalid mountain peak: ${JSON.stringify(maybePeak)}`);
}
return checkedFetchJSON(
`/api/mountain-peaks/${peakId}`,
) as Promise<MountainPeak>;
}
```
You’re unlikely to do this sort of shape checking at every single call site, but it’s easy

enough to do with the type assertion in one place. (If you find yourself writing this

sort of validation code often, Item 74 introduces some more systematic approaches

for validating TypeScript types at runtime. All these approaches hide type assertions

in well-typed functions!)

Another way to hide a type assertion is by providing a single overload of the function:

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
In this case, the overload presents a different type signature to callers of the function

than the one used in the implementation. There is some safety here: TypeScript will

check that the two signatures are compatible. But this isn’t fundamentally any differ‐

ent than a type assertion, and you’d still be well served to do some kind of data

validation.

You might also find yourself pushed into using a type assertion because TypeScript’s

type checker can’t follow along with your code. For example, this function checks if

two objects are shallowly equal to each other:

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
It’s a bit surprising that TypeScript complains about the b[k] access despite your hav‐

ing just checked that k in b is true. But it does, so you’ll need to resort to either @ts-

expect-error or an any type.

```
Item 45: Hide Unsafe Type Assertions in Well-Typed Functions | 193
```

This would be the wrong way to fix the type error:

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
By changing b’s type to any, we allow code that will crash at runtime:

```
shallowObjectEqual({x: 1}, null )
// ~~~~ Type 'null' is not assignable to type 'object'.
shallowObjectEqualBad({x: 1}, null ); // ok, throws at runtime
```
Better to hide the any type inside the function implementation:

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
This any is narrowly scoped (Item 43), does not affect the type signature of the func‐

tion, and even includes a comment explaining why it’s valid. This is a fine use of an

any type and a type assertion. Your code is correct, the type signature is clear, and

your users will be none the wiser.

You should unit test all your code, of course, but this is especially true when it uses

type assertions. Since you’ve told TypeScript to trust you, everything’s OK, and the

burden of proof is on you to show that. Comments explaining why a type assertion is

valid are helpful, but thorough tests are an even better demonstration of correctness.

**Things to Remember**

- Sometimes unsafe type assertions and any types are necessary or expedient.
    When you need to use one, hide it inside a function with a correct signature.
- Don’t compromise a function’s type signature to fix type errors in the implemen‐
    tation.
- Make sure you explain why your type assertions are valid, and unit test your code
    thoroughly.

**194 | Chapter 5: Unsoundness and the any Type**


### Item 46: Use unknown Instead of any for Values with an Unknown Type

Suppose you want to write a YAML parser (YAML can represent the same set of val‐

ues as JSON but allows a superset of JSON’s syntax). What should the return type of

your parseYAML method be? It’s tempting to make it any (like JSON.parse):

```
function parseYAML(yaml: string ): any {
// ...
}
```
But this flies in the face of Item 43’s advice to avoid “contagious” any types, specifi‐

cally by not returning them from functions. (Item 71 will explore how to “fix”

JSON.parse so that it doesn’t return any.)

Ideally, you’d like your users to immediately assign the result to another type:

```
interface Book {
name: string ;
author: string ;
}
const book: Book = parseYAML(`
name: Wuthering Heights
author: Emily Brontë
`);
```
Without the type annotation, though, the book variable would quietly get an any type,

thwarting type checking wherever it’s used:

```
const book = parseYAML(`
name: Jane Eyre
author: Charlotte Brontë
`);
console.log(book.title); // No error, logs "undefined" at runtime
book('read'); // No error, throws "book is not a function" at runtime
```
A safer alternative would be to have parseYAML return an unknown type:

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
```
Item 46: Use unknown Instead of any for Values with an Unknown Type | 195
```

```
1 With the exception of never.
```
To understand the unknown type, it helps to think about any in terms of assignability.

The power and danger of any come from two properties:

- All types are assignable to the any type.
- The any type is assignable to all other types.^1

If we “think of types as sets of values” (Item 7), the first property means that any is a

supertype of all other types, while the second means that it is a subtype. This is

strange! It means that any doesn’t fit into the type system, since a set can’t simultane‐

ously be both a subset and a superset of all other sets. This is the source of any’s

power but also the reason it’s problematic. Since the type checker is set based, the use

of any effectively disables it.

The unknown type is an alternative to any that does fit into the type system. It has the

first property (any type is assignable to unknown) but not the second (unknown is only

assignable to unknown and, of course, any). It’s known as a “top” type since it’s at the

top of the type hierarchy. The never type is the opposite: it has the second property

(can be assigned to any other type) but not the first (no other type can be assigned to

never). It’s known as a “bottom” type.

Attempting to access a property on a value with the unknown type is an error. So is

attempting to call it or do arithmetic with it. You can’t do much of anything with

unknown, which is exactly the point. The errors about an unknown type will encourage

you to pick something more specific:

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
These errors are more sensible. Since unknown is not assignable to other types, you’ll

need a type assertion. But it is also appropriate: we really do know more about the

type of the resulting object than TypeScript does.

unknown is appropriate whenever you know that there will be a value but you either

don’t know or don’t care about its type. The result of parseYAML is one example, but

there are others. In the GeoJSON spec, for example, the properties property of a fea‐

ture is a grab bag of anything JSON serializable. So unknown makes sense:

**196 | Chapter 5: Unsoundness and the any Type**


```
interface Feature {
id?: string | number ;
geometry: Geometry;
properties: unknown ;
}
```
If you write a function to check if an array has fewer than 10 elements, you don’t par‐

ticularly care about the type of the elements. So unknown makes sense here, too:

```
function isSmallArray(arr: readonly unknown []): boolean {
return arr.length < 10;
}
```
As you’ve seen, you can get a more specific type from unknown using a type assertion.

But this isn’t the only way. An instanceof check will do:

```
function processValue(value: unknown ) {
if (value instanceof Date) {
value
// ^? (parameter) value: Date
}
}
```
You can also use a user-defined type guard:

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
TypeScript requires quite a bit of proof to narrow an unknown type: in order to avoid

errors on the in checks, you first have to demonstrate that val is an object type and

that it is non-null (since typeof null === 'object'). As with any user-defined type

guard, remember that it’s no safer than a type assertion. Nothing checks that you’ve

implemented the guard correctly or kept it in sync with your type. (Item 74 discusses

solutions to this conundrum.)

You’ll sometimes see a type parameter used instead of unknown. You could have

declared the safeParseYAML function this way:

```
function safeParseYAML<T>(yaml: string ): T {
return parseYAML(yaml);
}
```
```
Item 46: Use unknown Instead of any for Values with an Unknown Type | 197
```

This is generally considered bad style in TypeScript, however. It looks different than a

type assertion, but it is no safer and is functionally the same. Better to just return

unknown and force your users to use an assertion, or narrow to the type they want.

This is a common example of an unnecessary use of generics, which is the subject of

Item 51.

unknown can also be used instead of any in “double assertions”:

```
declare const foo: Foo;
let barAny = foo as any as Bar;
let barUnk = foo as unknown as Bar;
```
These are functionally equivalent, but the unknown version prevents the visceral reac‐

tion you and your coworkers might have at seeing as any.

As a final note, you may see code that uses object or {} in a similar way to how

unknown has been described in this item. They are also broad types but are slightly

narrower than unknown:

- The {} type consists of all values except null and undefined.
- The Object type (capital “O”) is the nearly the same as {}. Strings, numbers, boo‐
    leans, and other primitives are assignable to Object.
- The object type (lowercase “o”) consists of all nonprimitive types. This doesn’t
    include true or 12 or "foo", but does include objects, arrays, and functions.

It’s quite rare that you really want to permit any value except null and undefined, so

unknown is generally preferable to {} or Object.

**Things to Remember**

- The unknown type is a type-safe alternative to any. Use it when you know you
    have a value but do not know or do not care what its type is.
- Use unknown to force your users to use a type assertion or other form of
    narrowing.
- Avoid return-only type parameters, which can create a false sense of security.
- Understand the difference between {}, object, and unknown.

### Item 47: Prefer Type-Safe Approaches to Monkey Patching

One of the most famous features of JavaScript is that its objects and classes are “open”

in the sense that you can add arbitrary properties to them. This is occasionally used

to create global variables on web pages by assigning to window or document:

**198 | Chapter 5: Unsoundness and the any Type**


```
window.monkey = 'Tamarin';
document.monkey = 'Howler';
```
or to attach data to DOM elements:

```
const el = document.getElementById('colobus');
el.home = 'tree';
```
Adding properties to built-in objects at runtime is known as “monkey patching” and

is particularly common with code that uses jQuery or D3.

You can even attach properties to the prototypes of built-ins, with sometimes surpris‐

ing results:

```
> RegExp.prototype.monkey = 'Capuchin'
'Capuchin'
> /123/.monkey
'Capuchin'
```
These approaches are generally not good designs. When you attach data to window or

a DOM node, you are essentially turning it into a global variable. This makes it easy

to inadvertently introduce dependencies between far-flung parts of your program,

and means that you have to think about side effects whenever you call a function.

Outside of strict mode, JavaScript makes it very easy to introduce global variables:

just drop the let, var, or const from an assignment.

Adding TypeScript introduces another problem: while the type checker knows about

built-in properties of Document and HTMLElement, it certainly doesn’t know about the

ones you’ve added:

```
document.monkey = 'Tamarin';
// ~~~~~~ Property 'monkey' does not exist on type 'Document'
```
The most straightforward way to fix this error is with an any assertion:

```
(document as any ).monkey = 'Tamarin'; // OK
```
This satisfies the type checker, but, as should be no surprise by now, it has some

downsides. As with any use of any, you lose type safety and language services:

```
(document as any ).monky = 'Tamarin'; // Also OK, misspelled
(document as any ).monkey = /Tamarin/; // Also OK, wrong type
```
The best solution is to move your data out of window, document, or the DOM. But if

you can’t (perhaps you’re using a library that requires it or are in the process of

migrating a JavaScript application), then the monkey patch is part of your environ‐

ment (Item 76) and you should model it with TypeScript. There’s no perfect way to do

this, but as any sets a low bar for safety and developer experience, and there are ways

to do considerably better.

```
Item 47: Prefer Type-Safe Approaches to Monkey Patching | 199
```

Imagine you’re building a web application and you have an object with information

about the currently logged-in user. You fetch this on page load via an API and store it

as a global variable for convenient access throughout your code:

```
interface User {
name: string ;
}
```
```
document.addEventListener("DOMContentLoaded", async () => {
const response = await fetch('/api/users/current-user');
const user = ( await response.json()) as User;
window.user = user;
// ~~~~ Property 'user' does not exist
// on type 'Window & typeof globalThis'.
});
```
```
// ... elsewhere ...
export function greetUser() {
alert(`Hello ${window.user.name}!`);
// ~~~~ Property 'user' does not exist on type Window...
}
```
The type errors arise because TypeScript doesn’t know about our patch to the global

object. Rather than writing (window as any), one option is to use an augmentation,

one of the special abilities of interface (Item 13):

```
declare global {
interface Window {
/** The currently logged-in user */
user: User;
}
}
```
This tells TypeScript that Window has another property that it didn’t know about from

the built-in DOM types. With the augmentation in place, our code passes the type

checker:

```
document.addEventListener("DOMContentLoaded", async () => {
const response = await fetch('/api/users/current-user');
const user = ( await response.json()) as User;
window.user = user; // OK
});
```
```
// ... elsewhere ...
export function greetUser() {
alert(`Hello ${window.user.name}!`); // OK
}
```
**200 | Chapter 5: Unsoundness and the any Type**


This is an improvement over using any in a few ways:

- You get type safety. The type checker will flag misspellings or assignments of the
    wrong type.
- You can attach documentation to the property (Item 68).
- You get autocomplete and other language services on the property.
- There is a record of precisely what the monkey patch is.

There are a few problems with the augmentation approach. In cases (such as user)

where a global is set while your application is running, there’s no way to introduce the

augmentation only after this has happened. This masks a race condition in our code.

What happens if we call greetUser() before window.user is set?

To avoid issues like this, you may want to include undefined as a possibility on your

global. This will force you to handle the possibility that user isn’t available wherever

you access it:

```
declare global {
interface Window {
/** The currently logged-in user */
user: User | undefined ;
}
}
```
##### // ...

```
export function greetUser() {
alert(`Hello ${window.user.name}!`);
// ~~~~~~~~~~~ 'window.user' is possibly 'undefined'.
}
```
There’s a trade-off here between correctness and convenience.

If your serving infrastructure allows it, another solution for this specific situation

would be to inline the user variable into the HTML of the page:

```
< script type="text/javascript">
window.user = { name: 'Bill Withers' };
</ script >
< script src="your-code.js"></ script >
```
This way you can safely remove the undefined possibility since user has been uncon‐

ditionally set before any of your code runs and there’s no possibility of a race

condition.

Another issue with augmentation is that, as the declare global suggests, it applies

globally. You can’t hide it from other parts of your code or from libraries. If your app

includes multiple pages and user is only available on some of them, the global aug‐

mentation won’t be able to model that accurately.

```
Item 47: Prefer Type-Safe Approaches to Monkey Patching | 201
```

An alternative approach that doesn’t pollute the global scope is to use a narrower type

assertion. Rather than (window as any), we can define another type with our added

property:

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
// ...
export function greetUser() {
alert(`Hello ${(window as MyWindow).user.name}!`);
// ~~~~~~~~~~~~~~~~~~~~~~~~~ Object is possibly 'undefined'.
}
```
TypeScript is OK with the type assertion because Window and MyWindow share proper‐

ties (Item 9). And you get type safety in the assignment. The scope issues are also

more manageable: there’s no global modification of the Window type, just the intro‐

duction of a new type (which is only in scope if you import it).

The downside is that you have to write an assertion (or introduce a new variable)

whenever you reference the monkey-patched property. And you’ll want to enforce

that no one sneaks in a (window as any), perhaps using a linter rule.

But you can take this all as encouragement to refactor into something more struc‐

tured. Monkey patching shouldn’t be too easy!

**Things to Remember**

- Prefer structured code to storing data in globals or on the DOM.
- If you must store data on built-in types, use one of the type-safe approaches (aug‐
    mentation or asserting a custom interface).
- Understand the scoping issues of augmentations. Include undefined if that’s a
    possibility at runtime.

### Item 48: Avoid Soundness Traps

Hang out on the internet much and you’ll hear gripes about how TypeScript isn’t

“sound,” and that this makes it a poor choice of language. This item will explain what

this means and walk you through common sources of unsoundness in TypeScript.

**202 | Chapter 5: Unsoundness and the any Type**


Rest assured, TypeScript is a great language, and it’s never a good idea to listen to

people on the internet!

A language is called “sound” if the static type of every symbol is guaranteed to be

compatible with its runtime value. Using the terminology from Item 7, this means

that every symbol’s runtime value remains in the domain of that symbol’s static type.

Here’s an example of a sound type:

```
const x = Math.random();
// ^? const x: number
```
TypeScript infers a static type of number for x, and this is sound: whatever value

Math.random() returns at runtime, it will be a number. This doesn’t mean that x could

be any number at runtime: a more precise type would be the half-open interval

[0, 1), but TypeScript has no way to express this. number is good enough. Soundness

is more about accuracy than precision.

Here’s an example of unsoundness in TypeScript:

```
const xs = [0, 1, 2];
// ^? const xs: number[]
const x = xs[3];
// ^? const x: number
```
The static type of x is inferred as number, but at runtime its value is undefined, which

is not a number. So this is unsound and can lead to problems at runtime, for example,

if you try to call a method on x:

```
console.log(x.toFixed(1));
```
There are no type errors, but when you run this code it will throw an error:

```
console.log(x.toFixed(1));
^
```
```
TypeError: Cannot read properties of undefined (reading 'toFixed')
```
Unsound types can easily lead to runtime errors, so a sound type system is generally

considered to be a desirable property of a programming language.

Soundness comes with trade-offs, however. It’s easier for less expressive type systems

to achieve soundness. If TypeScript didn’t support generic types, for example, it

would eliminate many of the sources of unsoundness that you’ll read about later. But

generic types are useful! This hypothetical version of TypeScript would have a harder

time modeling JavaScript patterns and would catch fewer bugs.

In other words, there’s a trade-off among a type system’s expressiveness, its sound‐

ness, and its convenience. TypeScript gives you some choices about where you want

to be on this spectrum: by enabling strictNullChecks (Item 2), you accept some

```
Item 48: Avoid Soundness Traps | 203
```

inconvenience (needing to annotate null types and do null checks) in exchange for

increased expressiveness.

As we saw previously, TypeScript as a whole is emphatically not sound. In fact, sound‐

ness is not a design goal of TypeScript at all. Instead, it favors convenience and the

ability to work with existing JavaScript libraries.

Still, unsoundness can lead to crashes, bugs, or even data corruption, and you should

avoid it when you can. Unchecked array accesses are one well-known soundness trap,

but there are many others in TypeScript. The rest of this item will go through some of

the sources of unsoundness in TypeScript and show how you can rework your code

to avoid them.

**any**

If you “put an any on it,” then anything goes. The static types may or may not have

anything to do with real runtime types:

```
function logNumber(x: number ) {
console.log(x.toFixed(1)); // x is a string at runtime
// ^? (parameter) x: number
}
const num: any = 'forty two';
logNumber(num); // no error
```
There are no type errors here, but this code will throw an exception at runtime.

The solution is simple: limit your use of any or, better, don’t use it at all! This chapter

has lots of advice about how to mitigate and avoid the static type disaster that is any,

but the highlights are to limit the scope of any and to use unknown as a safer alterna‐

tive when possible. For built-ins like JSON.parse that return any types, Item 71 shows

you how to use declaration merging to get a safer alternative.

**Type Assertions**

The slightly less offensive cousin of any is the “type assertion.” We’ve already covered

this in Item 9, but here’s a refresher on what this looks like:

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
The as number in the last line is the type assertion, and it makes the error go away.

**204 | Chapter 5: Unsoundness and the any Type**


What can you do about this? You can replace many assertions with conditionals (if

statements or ternary operators):

```
if (hour !== null ) {
logNumber(hour); // ok
// ^? const hour: number
}
```
Within the if block, the static type of hour is narrowed based on the condition, so the

type assertion isn’t needed (see Item 22 for more on narrowing).

Type assertions often come up in the context of input validation. It’s a good idea to

adopt a systematic approach to keeping your TypeScript types and your runtime vali‐

dation logic in sync. Item 74 will walk you through your options.

**Object and Array Lookups**

Even in strict mode, TypeScript doesn’t do any sort of bounds checking on array

lookups. As we saw in the introduction to this item, this can lead directly to unsound‐

ness and runtime errors.

The same can happen when you reference a property on an object with an index type:

```
type IdToName = { [id: string ]: string };
const ids: IdToName = {'007': 'James Bond'};
const agent = ids['008']; // undefined at runtime.
// ^? const agent: string
```
Why does TypeScript allow this sort of code? Because it’s extremely common and

because it’s quite difficult to prove whether any particular index/array access is valid.

If you’d like TypeScript to try, there’s a noUncheckedIndexedAccess option. If you

turn it on, it finds the error in the example from the introduction but also flags per‐

fectly valid code:

```
const xs = [1, 2, 3];
alert(xs[3].toFixed(1)); // invalid code
// ~~~~~ Object is possibly 'undefined'.
alert(xs[2].toFixed(1)); // valid code
// ~~~~~ Object is possibly 'undefined'.
```
This option moves you to a different place on the spectrum of soundness versus con‐

venience: TypeScript is able to catch more errors, but it is less convenient to work

with because it also flags code that’s not an error. noUncheckedIndexedAccess is at

least smart enough to understand some common array constructs:

```
const xs = [1, 2, 3];
for ( const x of xs) {
console.log(x.toFixed(1)); // OK
}
const squares = xs.map(x => x * x); // also OK
```
```
Item 48: Avoid Soundness Traps | 205
```

If you’re concerned about unsafe access to specific arrays or objects, you can explicitly

add undefined to their value types:

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
The advantage of this approach over noUncheckedIndexedAccess is that it lets you

limit the scope (and presumably false positives) of that flag. The disadvantage is that

it lacks the smarts of the flag: the for-of loop will give you errors with this approach.

It also introduces the possibility that you push an undefined onto the array.

Finally, it’s often possible to rework your code to reduce the need for these sorts of

lookups. Rather than passing indices or keys to functions, try to work with the objects

that they refer to.

**Inaccurate Type Definitions**

The type declarations for a JavaScript library are like a giant type assertion: they claim

to statically model the runtime behavior of the library but there’s nothing that guar‐

antees this. (Unless, that is, the library is written in TypeScript, the declarations are

generated by tsc, and the library has no unsound types!)

It’s hard to show a current example here since these kinds of bugs tend to get fixed

once you highlight them, particularly for declarations on DefinitelyTyped (@types).

But a famous historic one was the React.FC definition in @types/react, which made

UI components accept children, even when this didn’t make logical sense.

How do you work around this? The best way is to fix the bug! For types on Definite‐

lyTyped, the turnaround time on this is usually a week or less. If this isn’t an option,

you can work around some issues via augmentation or, in the worst case, a type

assertion.

It’s also worth noting that some functions have types that are just very hard to model

statically. Take a look at the parameter list for String.prototype.replace for a head-

scratching example:

```
'foo'.replace(/f(.)/, (fullMatch, group1, offset, fullString, namedGroups) => {
console.log(fullMatch); // "fo"
console.log(group1); // "o"
console.log(offset); // 0
console.log(fullString); // "foo"
```
**206 | Chapter 5: Unsoundness and the any Type**


```
console.log(namedGroups); // undefined
return fullMatch;
});
```
If you’re interested in the offset parameter, its position will depend on the number

of capture groups (parenthesized expressions) in your regular expression. TypeScript

has no concept of a regex literal type, so there’s no way to determine the number of

capture groups statically. So the callback parameters get an any type.

There are also some functions that are incorrectly typed for historical reasons, e.g.,

Object.assign. If this is causing you trouble, Item 71 has a fix.

Type declarations model more than just JavaScript libraries. They also describe the

environment in which your code runs: the expected JavaScript runtime and other

global environments. Item 76 has more to say about the importance of creating an

accurate model of your environment.

**Bivariance in Class Hierarchies**

Assignability is tricky to think about with function types. It works a bit differently for

the return type and the parameter types. For the return type, assignability works

exactly like any other type:

```
declare function f(): number | string ;
const f1: () => number | string | boolean = f; // OK
const f2: () => number = f;
// ~~ Type '() => string | number' is not assignable to type '() => number'.
// Type 'string | number' is not assignable to type 'number'.
```
This makes sense: if you call a function expecting it to return a number but the func‐

tion could also return a string, then trouble will ensue. We say that functions are

covariant in their return types.

Parameter types go the opposite way:

```
declare function f(x: number | string ): void ;
const f1: (x: number | string | boolean ) => void = f;
// ~~
// Type 'string | number | boolean' is not assignable to type 'string | number'.
const f2: (x: number ) => void = f; // OK
```
This also makes sense: you shouldn’t be able to call a function expecting number|

string with a boolean. Functions are contravariant in their parameter types.

Now let’s see what happens when we apply this to classes:

```
class Parent {
foo(x: number | string ) {}
bar(x: number ) {}
}
class Child extends Parent {
```
```
Item 48: Avoid Soundness Traps | 207
```

```
foo(x: number ) {} // OK
bar(x: number | string ) {} // OK
}
```
Recall from Item 7 that extends on a class or interface can be read as “subtype of.”

But in that case, given what we’ve just learned about function assignability, surely one

of the two methods on Child should be an error. Since functions are contravariant in

their parameter types, the Child foo method should not be assignable to the Parent

foo.

You can adapt this form of unsoundness to get an undetected exception:

```
class FooChild extends Parent {
foo(x: number ) {
console.log(x.toFixed());
}
}
const p: Parent = new FooChild();
p.foo('string'); // No type error, crashes at runtime
```
TypeScript models methods on classes as bivariant: if either the parent or the child

method is assignable to the other, then it’s valid. Historically this was how all function

assignments were modeled. But with strictFunctionTypes, which was introduced in

TypeScript 2.6 way back in 2017, standalone function types are treated more

accurately.

In practice this means that when you’re inheriting from a class, you need to take extra

care to get the method signatures correct. Typically, child classes should have the

exact same method signature as their parents. But they can get out of sync over time

if you change the parent’s signature and expect to get a type error for all child imple‐

mentations. Be on the lookout for this! When you change a method signature on a

class in a hierarchy, check the same method on any parent or child classes.

**TypeScript’s Inaccurate Model of Variance for Objects and Arrays**

This one has been widely discussed online. Here’s the standard example of how it

works:

```
function addFoxOrHen(animals: Animal[]) {
animals.push(Math.random() > 0.5? new Fox() : new Hen());
}
```
```
const henhouse: Hen[] = [ new Hen()];
addFoxOrHen(henhouse); // oh no, a fox in the henhouse!
```
The issue is that it’s only safe to assign Hen[] to Animal[] if you don’t modify

the array. In other words, only readonly Hen[] should be assignable to readonly

Animal[]. TypeScript hasn’t always had readonly, though, and in the early days it

**208 | Chapter 5: Unsoundness and the any Type**


chose to allow this sort of code. Perhaps in the future there will be a new strict

option to handle this source of unsoundness.

What can you do about it? It’s best not to mutate function parameters, which you can

enforce with a readonly annotation (Item 14):

```
function addFoxOrHen(animals: readonly Animal[]) {
animals.push(Math.random() > 0.5? new Fox() : new Hen());
// ~~~~ Property 'push' does not exist on type 'readonly Animal[]'.
}
```
You can dodge the issue entirely by rewriting the initial example so that the function

returns an Animal, rather than adding it to an array:

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
You can run into similar issues with any object mutated by a function, not just arrays.

If you create an alias for your object (Item 23) and mutate it, then you can run into

trouble even without a function call.

While variance can be tricky to think about, the lesson here is straightforward: avoid

mutating function parameters! And to make sure you don’t, declare them readonly

or Readonly.

**Function Calls Don’t Invalidate Refinements**

Here’s some code that doesn’t look too suspicious at first glance (at least from a type

safety perspective):

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
Depending on what processor does, however, the call to blink() might throw at

runtime:

```
Item 48: Avoid Soundness Traps | 209
```

```
processFact(
{fact: 'Peanuts are not actually nuts', author: 'Botanists'},
f => delete f.author
);
// Type checks, but throws `Cannot read property 'blink' of undefined`.
```
The issue is that if (fact.author) refines the type of fact.author from string|

undefined to string. This is sound. However, the call to processor(fact) should

invalidate this refinement. The type of fact.author should revert back to string|

undefined because TypeScript has no way of knowing what the callback will do to

our refined fact.

Why does TypeScript allow this? Because most functions don’t mutate their parame‐

ters, and this sort of pattern is common in JavaScript.

How can you avoid this? Again, don’t mutate your function parameters! You can

enforce that callbacks do this by passing them a Readonly version of the object

(Item 14).

**Assignability and Optional Properties**

It’s important to remember that object types in TypeScript types aren’t “sealed”: they

could have properties other than the ones you’ve declared (Item 4). When combined

with optional properties, this can lead to unsoundness.

Here’s how this might happen:

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
The assignment from p1 to p2 circumvents excess property checking (Item 11). p2 has

a static type of Person. This is sound because the type {name: string; age:

string} is assignable to Person. With structural typing, it’s OK to have extra

properties.

The assignment to p3 is where we lose soundness. If you think of types as being

sealed, without having extra properties, then this assignment should be allowed: a

Person wouldn’t have an age property and, since this property is optional on

PossiblyAgedPerson, that would be OK. But types aren’t sealed and, as happened

here, it’s possible that they have additional properties that are incompatible with the

optional property’s type.

**210 | Chapter 5: Unsoundness and the any Type**


If you run into this issue, it may be because you’ve had a name collision between

overly generic property names (e.g., type). Try choosing more specific property

names. Naming the properties ageInYears and ageFormatted in this example would

have prevented this error.

Unsoundness is just one of the problems with optional properties. Item 37 discusses

other reasons why you should think carefully before adding one.

There are a few other sources of unsoundness in TypeScript, but these are some of the

ones that you’re most likely to come across in practice. Remember, unsoundness isn’t

a flaw in the language. It reflects a choice about where TypeScript wants to be posi‐

tioned along the spectrum of convenience, expressiveness, and safety. If you want to

move to a different point along that spectrum, you have some knobs that let you do

so (e.g., strictNullChecks and noUncheckedIndexedAccess). Otherwise, be aware of

the common patterns that lead to unsoundness and try to avoid them.

**Things to Remember**

- “Unsoundness” is when a symbol’s value at runtime diverges from its static type.
    It can lead to crashes and other bad behavior without type errors.
- Be aware of some of the common ways that unsoundness can arise: any types,
    type assertions (as, is), object and array lookups, and inaccurate type
    definitions.
- Avoid mutating function parameters as this can lead to unsoundness. Mark them
    as read-only if you don’t intend to mutate them.
- Make sure child classes match their parent’s method declarations.
- Be aware of how optional properties can lead to unsound types.

### Item 49: Track Your Type Coverage to Prevent Regressions in Type Safety

You’ve enabled noImplicitAny and added type annotations to all the values that had

implicit any types. Are you safe from the problems associated with any types? The

answer is “no”; any types can still enter your program in two main ways:

Through explicit any types

```
Even if you follow the advice of Items 43 and 44 , making your any types both
narrow and specific, they remain any types. In particular, types like any[] and
{[key: string]: any} become plain anys once you index into them, and the
resulting any types can flow through your code.
```
```
Item 49: Track Your Type Coverage to Prevent Regressions in Type Safety | 211
```

From third-party type declarations

```
This is particularly insidious since any types from an @types declaration file
enter silently: even though you have noImplicitAny enabled and you never
wrote the word “any,” you still have any types flowing through your code.
```
Because of the negative effects any types can have on type safety and developer expe‐

rience (Item 5), it’s a good idea to keep track of the number of them in your codebase.

There are many ways to do this, including the type-coverage package on npm:

```
$ npx type-coverage
9985 / 10117 98.69%
```
This means that, of the 10,117 symbols in this project, 9,985 (98.69%) had a type

other than any or an alias to any. If a change inadvertently introduces an any type and

it flows through your code, you’ll see a corresponding drop in this percentage.

In some ways, this percentage is a way of keeping score on how well you’ve followed

the advice of the other items in this chapter. Using narrowly scoped any will reduce

the number of symbols with any types, and so will using more specific forms like

any[]. Tracking this numerically helps you make sure things only get better over

time.

Even collecting type coverage information once can be informative. Running type-

coverage with the --detail flag will print where every any type occurs in your code:

```
$ npx type-coverage --detail
path/to/code.ts:1:10 getColumnInfo
path/to/module.ts:7:1 pt2
...
```
These are worth investigating because they’re likely to turn up sources of anys that

you hadn’t considered. Let’s look at a few examples.

Explicit any types are often the result of choices you made for expediency earlier on.

Perhaps you were getting a type error that you didn’t want to take the time to sort out.

Maybe the type was one that you hadn’t written out yet. Or you might have just been

in a rush.

Type assertions with any can prevent types from flowing where they otherwise would.

Perhaps you’ve built an application that works with tabular data and needed a single-

parameter function that built up some kind of column description:

```
function getColumnInfo(name: string ): any {
return utils.buildColumnInfo(appState.dataSchema, name); // Returns any
}
```
The utils.buildColumnInfo function returned any at some point. As a reminder,

you added a comment and an explicit : any annotation to the function.

**212 | Chapter 5: Unsoundness and the any Type**


However, in the intervening months you’ve also added a type for ColumnInfo, and

utils.buildColumnInfo no longer returns any. The any annotation is now throwing

away valuable type information. Get rid of it!

Third-party any types can come in a few forms, but the most extreme is when you

give an entire module an any type:

```
declare module 'my-module';
```
Now you can import anything from my-module without error. These symbols all have

any types and will lead to more any types if you pass values through them:

```
import {someMethod, someSymbol} from 'my-module'; // OK
```
```
const pt1 = { x: 1, y: 2 };
// ^? const pt1: { x: number; y: number; }
const pt2 = someMethod(pt1, someSymbol); // OK
// ^? const pt2: any
```
Since the usage looks identical to a well-typed module, it’s easy to forget that you

stubbed out the module. Or maybe a coworker did it and you never knew in the first

place. It’s worth revisiting these from time to time. Maybe there are official type dec‐

larations for the module. Or perhaps after reading Chapter 8 you’ve gained enough

understanding of the module to write types yourself and contribute them back to the

community.

Another common source of anys with third-party declarations is when there’s a bug

in the types. Maybe the declarations didn’t follow the advice of Item 30 and declared a

function to return a union type when in fact it returns something much more spe‐

cific. When you first used the function, this didn’t seem worth fixing so you used an

any assertion. But maybe the declarations have been fixed since then. Or maybe it’s

time to fix them yourself!

If you’d like to continually be aware of the any types in your code, you can set up

type-coverage as a TypeScript Language Service plug-in. This is like having X-ray

vision, letting you see all the any types hiding in plain sight in your code (Figure 5-1).

Figure 5-1. Symbols with an _any_ type highlighted in your editor. None of these would

have been _noImplicitAny_ errors.

```
Item 49: Track Your Type Coverage to Prevent Regressions in Type Safety | 213
```

If you add type-coverage to your continuous integration system, you’ll find out

about surprising drops in type safety as soon as they happen.

The considerations that led you to use an any type may no longer apply. Maybe there’s

a type you can plug in now where previously you used any. Maybe an unsafe type

assertion is no longer necessary. Maybe the bug in the type declarations you were

working around has been fixed. Tracking your type coverage highlights these choices

and encourages you to keep revisiting them.

**Things to Remember**

- Even with noImplicitAny set, any types can make their way into your code either
    through explicit anys or third-party type declarations (@types).
- Consider tracking how well-typed your program is using a tool like type-
    coverage. This will encourage you to revisit decisions about using any and
    increase type safety over time.

**214 | Chapter 5: Unsoundness and the any Type**


