**CHAPTER 7**

### TypeScript Recipes

As the TypeScript community has grown, developers have come up with more and

more tricks for solving specific problems. Some of these “recipes” leverage Type‐

Script’s type checker to catch new categories of mistakes, such as values getting out of

sync or nonexhaustive conditionals. Others are tricks for modeling patterns that

TypeScript struggles with on its own: iterating over objects, filtering null values from

Arrays, or modeling variadic functions.

By applying the recipes in this chapter, you’ll help TypeScript catch more real prob‐

lems with fewer false positives. If you enjoy these, you’ll find many more recipes in

Stefan Baumgartner’s TypeScript Cookbook.

### Item 59: Use Never Types to Perform Exhaustiveness Checking

Static type analysis is a great way to find places where you do something that you

shouldn’t. When you assign the wrong type of value, reference a nonexistent property,

or call a function with the wrong number of arguments, you’ll get a type error.

But there are also errors of omission: times when you should do something but you

don’t. While TypeScript won’t always catch these on its own, there’s a popular trick

that can be used to convert a missing case in a switch or if statement into a type

error. This is known as “exhaustiveness checking.” Let’s see how it works.

Suppose you’re building a drawing program, perhaps using the HTML <canvas> ele‐

ment. You might define the set of shapes you can draw using a tagged union:

##### 261


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
You can draw these using built-in canvas methods:

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
So far, so good. Now you decide to add a third shape:

```
interface Line {
type : 'line';
start: Coord;
end: Coord;
}
type Shape = Box | Circle | Line;
```
There are no type errors, but this change has introduced a bug: drawShape will

silently ignore any line shapes. This is an error of omission. How can we get Type‐

Script to catch this kind of mistake?

If you look at the type of shape after an exhaustive switch statement, there’s a clue:

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
**262 | Chapter 7: TypeScript Recipes**


Recall from Item 7 that the never type is a “bottom” type whose domain is the empty

set. When we’ve covered all the possible types of Shape, this is all that’s left. If we

missed a case, then the type would be something other than never:

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
No value is assignable to the never type, and we can use this to turn an omission into

a type error:

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
We’ll get into the details of assertUnreachable momentarily, but first let’s fix the

error by covering the missing case:

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
```
```
Item 59: Use Never Types to Perform Exhaustiveness Checking | 263
```

```
default :
assertUnreachable(shape); // ok
}
}
```
It’s important to leave the assertUnreachable call in place, even if it is, as the name

suggests, unreachable. It protects you from future errors of omission should you

introduce additional shapes.

Why throw an exception in assertUnreachable? Isn’t this code unreachable? That

may be the case for well-typed TypeScript, but it’s always possible that drawShape will

be called from JavaScript, or with an any or other unsound type (Item 48). Throwing

an exception protects us from surprise values at runtime, not just during type

checking.

The exhaustiveness check was especially helpful for drawShape because it didn’t have

a return value. It was only run for side effects. If your function does return a value,

then annotating the return type gives you some protection against missing cases:

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
If we’d omitted the return type annotation, TypeScript would have inferred it as

number | undefined rather than producing an error. It’s likely that this would have

produced errors elsewhere in your code, where you call getArea, but it’s better to get

errors close to where the mistake was made. As Item 18 explained, it’s a good idea to

add a return type annotation to any function with multiple returns.

(You’ll only get this error when strictNullChecks is set, since otherwise, undefined

is part of the number type. This is a great reason to use strictNullChecks!)

As the error says, if undefined is a legitimate return value, then this check won’t pro‐

tect you. Even when a function returns a value, it can be a good idea to do exhaustive‐

ness checking.

That’s why we added never as the return type for assertUnreachable earlier. Since

never is assignable to all other types, you can safely return it, regardless of the return

type of the function:

```
function getArea(shape: Shape): number {
switch (shape. type ) {
```
**264 | Chapter 7: TypeScript Recipes**


```
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
The assertUnreachable pattern is common in TypeScript code and you may run

into other variations on it, either using a direct assignment to never:

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
or using the satisfies operator:

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
All of these patterns work in the same way. Use whichever one you like best.

With some cleverness, the same trick can be extended to make sure you handle all

pairs of two types, i.e., the cross-product. For example, say you write some code to

play “rock, paper, scissors”:

```
type Play = 'rock' | 'paper' | 'scissors';
```
```
function shoot(a: Play, b: Play) {
if (a === b) {
console.log('draw');
} else if (
(a === 'rock' && b === 'scissors') ||
(a === 'paper' && b === 'rock')
```
```
Item 59: Use Never Types to Perform Exhaustiveness Checking | 265
```

##### ) {

```
console.log('A wins');
} else {
console.log('B wins');
}
}
```
Unfortunately, we’ve missed a case. If A plays scissors on B’s paper, then, much to

player A’s surprise, this function will report that B has won. We can use a template

literal type (Item 54) and exhaustiveness checking to force ourselves to cover every

possible case explicitly:

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
By default, `${a},${b}` would have a type of string. `${Play},${Play}` is a sub‐

type of string consisting of the nine possible pairs of plays separated by a comma.

We can apply the usual exhaustiveness checking trick to make sure we’ve covered all

nine. In this case, we missed one and it resulted in a type error. The error even

included the combination we missed! As before, add the missing case and leave the

assertion in place in case you ever add an additional possible play.

While it comes up less frequently than straightforward exhaustiveness checking, this

technique is occasionally helpful for modeling transitions between states.

**266 | Chapter 7: TypeScript Recipes**


The typescript-eslint rule switch-exhaustiveness-check can also be used for

exhaustiveness checking. Whereas assertUnreachable is opt-in, the linter rule is

opt-out. If you enable it, you may find that some of your switch statements were not

intended to be exhaustive, or that they are exhaustive for reasons that are hard to cap‐

ture in the type system. And you can use assertUnreachable in other situations that

are intended to be exhaustive, such as if statements. But you may find some bugs,

too, so the linter rule is worth a try!

Errors of omission are just as important as errors of commission. Use never types

and the assertUnreachable trick to let TypeScript help you avoid them.

**Things to Remember**

- Use an assignment to the never type to ensure that all possible values of a type
    are handled (an “exhaustiveness check”).
- Add a return type annotation to functions that return from multiple branches.
    You may still want an explicit exhaustiveness check, however.
- Consider using template literal types to ensure that every combination of two or
    more types is handled.

### Item 60: Know How to Iterate Over Objects

This code runs fine, and yet TypeScript flags an error in it. Why?

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
Inspecting the obj and k symbols gives a clue:

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
```
Item 60: Know How to Iterate Over Objects | 267
```

```
1 Symbols can also be object keys but they are not enumerable.
```
The type of k is string, but you’re trying to index into an object whose type only has

three specific keys: 'one', 'two', and 'three'. There are strings other than these

three, so this has to fail.

Using a type assertion to get a narrower type for k fixes the issue:

```
for ( const kStr in obj) {
const k = kStr as keyof typeof obj;
// ^? const k: "one" | "two" | "three"
const v = obj[k]; // OK
}
```
So the real question is: why is the type of k in the first example inferred as string

rather than "one" | "two" | "three"?

To understand, let’s look at a slightly different example:

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
It’s the same error as before. And you can “fix” it using the same sort of type assertion

(k as keyof ABC). But in this case TypeScript is right to complain. Here’s why:

```
const x = {a: 'a', b: 'b', c: 2, d: new Date()};
foo(x); // OK
```
The function foo can be called with any value assignable to ABC, not just a value with

'a', 'b', and 'c' properties. It’s entirely possible that the value will have other prop‐

erties, too (see Item 4 for a refresher on why). To allow for this, TypeScript gives k the

only type it can be confident of, namely, string.^1

Using a type assertion to keyof ABC would have another downside here:

```
function foo(abc: ABC) {
for ( const kStr in abc) {
let k = kStr as keyof ABC;
// ^? let k: keyof ABC (equivalent to "a" | "b" | "c")
```
**268 | Chapter 7: TypeScript Recipes**


```
2 The typings for utility functions like Lodash’s _.forEach and may provide more precise types for k and v, but
these are unsound for the reasons mentioned in this item.
```
```
const v = abc[k];
// ^? const v: string | number
}
}
```
If "a" | "b" | "c" is too narrow for k, then string | number is certainly too nar‐

row for v. In the preceding example, one of the values is a Date, but it could be any‐

thing. This could lead to chaos at runtime. As Item 9 explained, type assertions

should always make you nervous because TypeScript might be on to something. (Sur‐

prisingly, TypeScript will let you declare let k: keyof ABC above this for-in loop

and use k as the iterator, but this is no safer than a type assertion and is less explicit.)

So what if you just want to iterate over the object’s keys and values without type

errors? Object.entries lets you iterate over both simultaneously:

```
function foo(abc: ABC) {
for ( const [k, v] of Object.entries(abc)) {
// ^? const k: string
console.log(v);
// ^? const v: any
}
}
```
While these types may be hard to work with, they are at least honest!^2

Another reason that TypeScript infers string in for-in loops is prototype pollution.

This is a security issue where properties defined on Object.prototype are inherited

by all other objects. These inherited properties will be enumerated by a for-in loop,

so string is a safer choice. (Object.entries excludes inherited properties.)

A safe way to get more precise types is to explicitly list the keys you’re interested in:

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
If your intention is to cover all the keys in ABC, you’ll need some way to keep the keys

array in sync with the type.

```
Item 60: Know How to Iterate Over Objects | 269
```

While iterating over objects comes with many hazards, iterating over a Map does not:

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
Maps are easier to iterate over because they don’t have the same structural behavior as

objects: you’ll never put a number value in a Map<string, string> without using a

type assertion or going through an any type. But they can be less convenient to work

with if your data is coming via JSON or from another API that’s already designed to

use objects. Item 16 has an example of how replacing an object type with a Map can

improve the type safety of your code.

If you want to iterate over the keys and values in an immutable object, you can use an

explicit type assertion on the key in a for-in loop. To safely iterate over an object that

could have additional properties, use Object.entries. It’s always safe, though the key

and value types are more difficult to work with. And consider whether a Map might be

an appropriate alternative.

**Things to Remember**

- Be aware that any objects your function receives as parameters might have addi‐
    tional keys.
- Use Object.entries to iterate over the keys and values of any object.
- Use a for-in loop with an explicit type assertion to iterate objects when you
    know exactly what the keys will be.
- Consider Map as an alternative to objects since it’s easier to iterate over.

### Item 61: Use Record Types to Keep Values in Sync

Suppose you’re writing a UI component for drawing scatter plots. It has a few differ‐

ent types of properties that control its display and behavior:

```
interface ScatterProps {
// The data
xs: number [];
ys: number [];
```
**270 | Chapter 7: TypeScript Recipes**


```
// Display
xRange: [ number , number ];
yRange: [ number , number ];
color: string ;
```
```
// Events
onClick?: (x: number , y: number , index: number ) => void ;
}
```
To avoid unnecessary work, you’d like to redraw the chart only when you need to.

Changing data or display properties will require a redraw, but changing the event

handler will not.

Here’s one way you might implement this optimization:

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
(See Item 60 for an explanation of the keyof assertion in this loop. This assertion is

safe because we don’t care about the value types, only whether they are equal.)

What happens when you or a coworker add a new property? The shouldUpdate func‐

tion will redraw the chart whenever it changes. You might call this the conservative or

“fail open” approach. The upside is that the chart will always look right. The down‐

side is that it might be drawn too often.

A “fail closed” approach might look like this:

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
```
Item 61: Use Record Types to Keep Values in Sync | 271
```

With this approach there won’t be any unnecessary redraws, but there might be some

necessary draws that get dropped. An important principle in optimization is to “first,

do no harm.” We shouldn’t sacrifice correct behavior for the sake of performance.

Neither approach is ideal. What you’d really like is to force your coworker or future

self to make a decision when adding the new property. You might try adding a

comment:

```
interface ScatterProps {
xs: number [];
ys: number [];
// ...
onClick?: (x: number , y: number , index: number ) => void ;
```
```
// Note: if you add a property here, update shouldUpdate!
}
```
But do you really expect this to work? It would be better if the type checker could

enforce this for you.

If you set it up the right way, it can. The key is to use a Record type with the right set

of keys:

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
The keyof ScatterProps annotation tells the type checker that REQUIRES_UPDATE

should have all the same properties as ScatterProps. Critically, these are all required

properties.

Now if in the future you add a new property to ScatterProps:

**272 | Chapter 7: TypeScript Recipes**


```
interface ScatterProps {
// ...
onDoubleClick?: () => void ;
}
```
then this will produce an error in the definition of REQUIRES_UPDATE:

```
const REQUIRES_UPDATE: Record< keyof ScatterProps, boolean > = {
// ~~~~~~~~~~~~~~~ Property 'onDoubleClick' is missing in type ...
// ...
};
```
This will certainly force the issue! Deleting or renaming a property will cause a simi‐

lar error. This is excess property checking (Item 11) at work, and it lets us enforce

that the object has exactly the set of properties we want, no more, no less. TypeScript

has given us a third choice in the classic fail open/fail closed dilemma, namely “just

fail.”

It’s important that we used an object with boolean values here. Had we used an array:

```
const PROPS_REQUIRING_UPDATE: ( keyof ScatterProps)[] = [
'xs',
'ys',
// ...
];
```
then we would have been forced into the same fail open/fail closed choice.

Records and mapped types are ideal if you want one object to have exactly the same

properties as another. Here we used it to avoid the classic fail open/fail closed

dilemma, but there are many other applications, for example, requiring that every

property in your application’s state have a corresponding URL parameter.

**Things to Remember**

- Recognize the fail open versus fail closed dilemma.
- Use Record types to keep related values and types synchronized.
- Consider using Record types to force choices when adding new properties to an
    interface.

### Item 62: Use Rest Parameters and Tuple Types to Model Variadic Functions

Sometimes you’d like to have a function take a different number of arguments,

depending on a TypeScript type.

To see how this might happen, imagine that you have an interface that describes the

query parameters that different routes in a web app can accept:

```
Item 62: Use Rest Parameters and Tuple Types to Model Variadic Functions | 273
```

```
interface RouteQueryParams {
'/': null ,
'/search': { query: string ; language?: string ; }
// ...
}
```
This says that the root page (/) does not take any query parameters, whereas

the /search page takes a query param and an optional language param.

You can define a function to construct a URL for a route:

```
function buildURL(route: keyof RouteQueryParams, params?: any ) {
return route + (params? `?${ new URLSearchParams(params)}` : '');
}
```
```
console.log(buildURL('/search', {query: 'do a barrel roll', language: 'en'}))
console.log(buildURL('/'))
```
This builds the URLs you’d expect:

```
/search?query=do+a+barrel+roll&language=en
/
```
Unfortunately, it’s not very safe thanks to that any on the second parameter. You’re

free to construct a URL for any route with whatever search parameters you like:

```
buildURL('/', {query: 'recursion'}); // should be an error (no params for root)
buildURL('/search'); // should be an error (missing params)
```
Here’s a safer version:

```
function buildURL<Path extends keyof RouteQueryParams>(
route: Path,
params: RouteQueryParams[Path]
) {
return route + (params? `?${ new URLSearchParams(params)}` : '');
}
```
We’ve made the function generic in the route, which can usually be inferred, and

made the parameter type depend on this route.

This new type signature works perfectly for the /search route:

```
buildURL('/search', {query: 'do a barrel roll'})
buildURL('/search', {query: 'do a barrel roll', language: 'en'})
buildURL('/search', {})
// ~~ Property 'query' is missing in type '{}'
```
For the root page, however, you need to pass an additional null parameter:

```
buildURL('/', {query: 'recursion'}); // error, good!
// ~~~~~~~~~~~~~~~~~~~~ Argument of type '{ query: string; }' is
// not assignable to parameter of type 'null'
buildURL('/', null ); // ok
```
**274 | Chapter 7: TypeScript Recipes**


```
buildURL('/'); // we'd like this to be allowed
// ~~~~~ Expected 2 arguments, but got 1.
```
Writing an extra null isn’t the end of the world, of course, but it is a nuisance and the

old API with its optional parameter looked nicer. We could make the second parame‐

ter optional with the new version, but this should only be allowed when the route

doesn’t take any search parameters. In other words, we want the function to take a

variable number of arguments, depending on an inferred type.

The trick to doing this is to use a conditional type (Item 52) and rest parameters:

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
If the query parameter type extends null, then this looks like: (route:

Path, ...args: []), which is a one-parameter function. If it doesn’t, then it looks

like (route: Path, ...args: [params: ...]), which is a two-parameter function.

This works exactly as you’d hope:

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
When you inspect the call sites, it really looks like there are two different functions,

depending on the route. The rest parameter is an implementation detail that’s hidden

from the user. TypeScript has even picked up the name of the second parameter

(params) from the label on the tuple element:

```
buildURL('/');
// ^? function buildURL<"/">(route: "/"): string
buildURL('/search', {query: 'do a barrel roll'})
// ^? function buildURL<"/search">(
// route: "/search", params: { query: string; language?: string; }
// ): string
```
```
Item 62: Use Rest Parameters and Tuple Types to Model Variadic Functions | 275
```

If you fail to include this label, your users will see a more generic parameter name like

args_0.

This is the most general technique for modeling variadic functions. You could also

use overload signatures to achieve a similar effect, but this would result in code dupli‐

cation and, as Item 52 explained, conditional types handle unions more naturally

than overloads.

Sometimes the number or type of parameters to a function depends on a TypeScript

type. When this happens, you can model it using rest parameters with a tuple type.

**Things to Remember**

- Use rest parameters and tuple types to model functions whose signature depends
    on the type of an argument.
- Use conditional types to model relationships between the type of one parameter
    and the number and type of the remaining parameters.
- Remember to label the elements of your tuple types to get meaningful parameter
    names at call sites.

### Item 63: Use Optional Never Properties to Model Exclusive Or

In ordinary speech, “or” means “exclusive or.” Only programmers and logicians use

an inclusive or.

In TypeScript, it’s easy to get mixed up between these two:

```
interface ThingOne {
shirtColor: string ;
}
interface ThingTwo {
hairColor: string ;
}
type Thing = ThingOne | ThingTwo;
```
We usually read the last line as “type Thing is a ThingOne or ThingTwo.” But just like

JavaScript’s runtime or (||), TypeScript’s type-level or (|) is an inclusive or. There’s no

reason a thing can’t be both a ThingOne and a ThingTwo:

```
const bothThings = {
shirtColor: 'red',
hairColor: 'blue',
};
const thing1: ThingOne = bothThings; // ok
const thing2: ThingTwo = bothThings; // ok
```
**276 | Chapter 7: TypeScript Recipes**


Why does this work? It’s because TypeScript has a structural type system (Item 4).

Both the ThingOne and ThingTwo types allow additional properties that aren’t

declared in their interface, though, as Item 11 explains, this is sometimes obscured by

excess property checking.

So what if you really do want an exclusive or? What if you want to keep your

ThingOnes and ThingTwos separate? How can you model that?

The standard trick is to use an optional _never_ type in your interface to disallow a

property:

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
Now none of the assignments from before pass the type checker:

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
This works because no value is assignable to a never type. But because the property is

optional, there’s exactly one way out: not having that property.

This isn’t just useful for unions. Recall from Item 4 that structural typing isn’t a good

model for two- and three-dimensional vectors. You can use an optional never to

directly disallow a z property on a 2D vector:

```
interface Vector2D {
x: number ;
y: number ;
z?: never ;
}
```
With this type, you’ll get an error if you accidentally pass a three-dimensional vector

to a function like norm that expects a two-dimensional vector:

```
Item 63: Use Optional Never Properties to Model Exclusive Or | 277
```

```
function norm(v: Vector2D) {
return Math.sqrt(v.x ** 2 + v.y ** 2);
}
const v = {x: 3, y: 4, z: 5};
const d = norm(v);
// ~ Types of property 'z' are incompatible.
```
This wouldn’t be an error without the z?: never because the call is structurally valid,

even though it’s semantically incorrect. We’ll look at another approach to fixing the

Vector2D problem, brands, in Item 64.

You can also use a tagged union (Item 34) to achieve an exclusive or:

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
A string can’t be both 'one' and 'two', so there’s no overlap between these types.

This means there’s no distinction between inclusive and exclusive or. This is one of

many great reasons to use tagged unions when you can.

Rather than adding optional never properties by hand, it’s possible to define a generic

exclusive or (XOR) helper:

```
type XOR<T1, T2> =
(T1 & {[k in Exclude< keyof T2, keyof T1>]?: never }) |
(T2 & {[k in Exclude< keyof T1, keyof T2>]?: never });
```
You can use this to construct ExclusiveThing directly from the interfaces at the

start of this item:

```
type ExclusiveThing = XOR<ThingOne, ThingTwo>;
const allThings: ExclusiveThing = {
// ~~~~~~~~~ Types of property 'hairColor' are incompatible.
shirtColor: 'red',
hairColor: 'blue',
};
```
While tagged unions are a more common way to create exclusive types in TypeScript,

the optional never trick can be helpful in situations where you either can’t or don’t

want to add an explicit tag.

**278 | Chapter 7: TypeScript Recipes**


**Things to Remember**

- In TypeScript, “or” is “inclusive or”: A | B means either A, B, or both.
- Consider the “both” possibility in your code, and either handle it or disallow it.
- Use tagged unions to model exclusive or where it’s convenient. Consider using
    optional never properties where it isn’t.

### Item 64: Consider Brands for Nominal Typing

Item 4 discussed structural typing and how it can sometimes lead to surprising

results:

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
What if you’d like calculateNorm to reject 3D vectors? This goes against the struc‐

tural typing model of TypeScript but is certainly more mathematically correct.

Item 63 showed how you can specifically prevent a z field using an optional never

property. This is a purely type-level fix. It doesn’t require you to change the values at

runtime.

You can also prevent types from being assignable to one another by adding a “tag” to

the value at runtime:

```
interface Vector2D {
type : '2d';
x: number ;
y: number ;
}
```
Here the type property serves as the “tag.” This pattern is particularly common with

union types. Item 34 explored “tagged unions” in more detail and they are certainly

one way to mitigate this problem. They do have a few downsides, however. They add

runtime overhead, changing what was previously a very simple type with only

numeric properties into one with a mix of strings and numbers. Moreover, you can

only add an explicit tag like this to object types.

```
Item 64: Consider Brands for Nominal Typing | 279
```

Interestingly, you can get many of the same benefits as explicit tags while operating

only in the type system. In this context, tags are typically known as “brands” (think

cows, not Coca-Cola). This types-only approach removes runtime overhead and also

lets you brand built-in types like string or number where you can’t attach additional

properties. This is known as nominal typing, as opposed to TypeScript’s usual struc‐

tural typing. With nominal typing, a value is a Vector2D because you say it is, not

because it has the right shape.

Let’s see how this works using filesystem paths. What if you have a function that

operates on the filesystem and requires an absolute (as opposed to a relative) path?

This is easy to check at runtime (does the path start with “/”?), but not so easy in the

type system.

Here’s an approach with brands:

```
type AbsolutePath = string & {_brand: 'abs'};
function listAbsolutePath(path: AbsolutePath) {
// ...
}
function isAbsolutePath(path: string ): path is AbsolutePath {
return path.startsWith('/');
}
```
You can’t construct an object that is a string and has a _brand property. This is

purely a game with the type system. (If you think you can assign properties to a

string, Item 10 will explain why you’re mistaken.)

If you have a string path that could be either absolute or relative, you can check

using the type guard, which will refine its type:

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
This is helpful documentation about which functions expect absolute or relative

paths, and which type of path each variable holds. It is not an ironclad guarantee:

path as AbsolutePath will succeed for any string. But if you avoid these sorts of

assertions, then the only way to get an AbsolutePath is to be given one or to check,

which is exactly what you want.

You can also brand number types—for example, to attach units:

```
type Meters = number & {_brand: 'meters'};
type Seconds = number & {_brand: 'seconds'};
```
**280 | Chapter 7: TypeScript Recipes**


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
This can be awkward in practice, however, since arithmetic operations make the

numbers forget their brands:

```
const tenKm = oneKm * 10;
// ^? const tenKm: number
const v = oneKm / oneMin;
// ^? const v: number
```
If your code involves lots of numbers with mixed units, though, this may still be an

attractive approach to documenting the expected types of numeric parameters.

There are other techniques for branding types. You may encounter code that uses pri‐

vate fields to brand classes or an intersection with TypeScript string-based enums,

which are nominally typed (Item 72).

Another common technique is to use a unique symbol type:

```
declare const brand: unique symbol;
export type Meters = number & {[brand]: 'meters'};
```
The advantage of this technique is that, since the brand symbol isn’t exported, users

will have to use a type assertion or helper function to get a value with a Meters type.

They can’t use the brand directly or create another type that’s compatible with it.

Regardless of how you construct them, brands can be used to model many properties

that cannot be expressed within the type system. For example, using binary search to

find an element in a list:

```
function binarySearch<T>(xs: T[], x: T): boolean {
let low = 0, high = xs.length - 1;
while (high >= low) {
const mid = low + Math.floor((high - low) / 2);
const v = xs[mid];
if (v === x) return true ;
[low, high] = x > v? [mid + 1, high] : [low, mid - 1];
}
return false ;
}
```
This works if the list is sorted, but will result in false negatives if it is not. You can’t

represent a sorted list in TypeScript’s type system. But you can create a brand:

```
type SortedList<T> = T[] & {_brand: 'sorted'};
```
```
function isSorted<T>(xs: T[]): xs is SortedList<T> {
```
```
Item 64: Consider Brands for Nominal Typing | 281
```

```
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
To call this version of binarySearch, you either need to be given a SortedList (i.e.,

have proof that the list is sorted) or prove that it’s sorted yourself using isSorted. The

linear scan isn’t great, but at least you’ll be safe!

This is a helpful perspective to have on the type checker in general. To call a method

on an object, for instance, you either need to be given a non-null object or prove that

it’s non-null yourself with a conditional. This is analogous to the two ways of getting

a SortedList: you can either be given one, or prove that the list is sorted yourself.

**Things to Remember**

- With nominal typing, a value has a type because you say it has a type, not because
    it has the same shape as that type.
- Consider attaching brands to distinguish primitive and object types that are
    semantically distinct but structurally identical.
- Be familiar with the various techniques for branding: properties on object types,
    string-based enums, private fields, and unique symbols.

**282 | Chapter 7: TypeScript Recipes**


