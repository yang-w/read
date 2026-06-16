**CHAPTER 2**

### TypeScript’s Type System

TypeScript can generate JavaScript (Item 3), but the type system is the main event.

This is why you’re using the language!

This chapter walks you through the nuts and bolts of TypeScript’s type system: how to

think about it, how to use it, choices you’ll need to make, and features you should

avoid. TypeScript’s type system is surprisingly powerful and able to express things

you might not expect a type system to be able to. The items in this chapter will give

you a solid foundation to build upon as you write TypeScript and read the rest of this

book.

### Item 6: Use Your Editor to Interrogate and Explore the Type System

When you install TypeScript, you get two executables:

- tsc, the TypeScript compiler
- tsserver, the TypeScript standalone server

You’re much more likely to run the TypeScript compiler directly, but the server is

every bit as important because it provides language services. These include autocom‐

plete, inspection, navigation, and refactoring. You typically use these services through

your editor. If yours isn’t configured to provide them, then you’re missing out! Serv‐

ices like autocomplete are one of the things that make TypeScript such a joy to use.

But beyond convenience, your editor is the best place to build and test your knowl‐

edge of the type system. This will help you build an intuition for when TypeScript is

able to infer types, which is key to writing compact, idiomatic code (see Item 18).

##### 27


The details will vary from editor to editor, but you can generally hover over a symbol

to see what TypeScript considers its type (see Figure 2-1).

Figure 2-1. An editor (VS Code) showing that the inferred type of the _num_ symbol is

_number_.

You didn’t write number here, but TypeScript was able to figure it out based on the

value 10.

You can also inspect functions, as shown in Figure 2-2.

Figure 2-2. Using an editor to reveal the inferred return type for a function.

The noteworthy bit of information is the inferred value for the return type, number. If

this does not match your expectation, you should add a type declaration and track

down the discrepancy (see Item 9).

Seeing what TypeScript thinks a variable’s type is at any given point is essential for

building an intuition around widening (Item 20) and narrowing (Item 22). Watching

the type of a variable change in the branch of a conditional is a tremendous way to

build confidence in the type system (see Figure 2-3).

Figure 2-3. The type of message is _string | null_ outside the branch, but _string_

inside.

You can inspect individual properties in a larger object to see what TypeScript has

inferred about them (see Figure 2-4).

**28 | Chapter 2: TypeScript’s Type System**


Figure 2-4. Inspecting how TypeScript has inferred types in an object.

If your intention was for x to be a tuple type ([number, number]), then a type anno‐

tation will be required.

To see inferred generic types in the middle of a chain of operations, inspect the

method name (as shown in Figure 2-5).

Figure 2-5. Revealing inferred generic types in a chain of method calls.

The Array<string> indicates that TypeScript understands that split produced an

array of strings. While there was little ambiguity in this case, this information can

prove essential in writing and debugging long chains of function calls. TypeScript has

also brought up some helpful documentation for the slice method. Item 68 will

explain how this works.

Seeing type errors in your editor can also be a great way to learn the nuances of the

type system. For example, this function tries to get an HTMLElement by its ID, or

return a default one. TypeScript flags two errors:

```
function getElement(elOrId: string | HTMLElement | null ): HTMLElement {
if ( typeof elOrId === 'object') {
return elOrId;
// ~~~ Type 'HTMLElement | null' is not assignable to type 'HTMLElement'
} else if (elOrId === null ) {
return document.body;
}
elOrId
```
```
Item 6: Use Your Editor to Interrogate and Explore the Type System | 29
```

```
// ^? (parameter) elOrId: string
return document.getElementById(elOrId);
// ~~~ Type 'HTMLElement | null' is not assignable to type 'HTMLElement'
}
```
The intent in the first branch of the if statement was to filter down to just the objects,

namely, the HTMLElements. But oddly enough, in JavaScript typeof null is "object",

so elOrId could still be null in that branch. You can fix this by putting the null

check first. The second error is because document.getElementById can return null,

so you need to handle that case as well, perhaps by throwing an exception:

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
The TypeScript language service also provides refactoring tools. One of the simplest

but most useful of these is renaming a symbol. This is more complicated than find

and replace because the same name might refer to different variables in different

places. In this code, for example, there are three distinct variables all named i:

```
let i = 0;
for ( let i = 0; i < 10; i++) {
console.log(i);
{
let i = 12;
console.log(i);
}
}
console.log(i);
```
In VS Code, if you click an i in the for loop and hit F2, a text box will pop up that

lets you put in a new name (Figure 2-6).

**30 | Chapter 2: TypeScript’s Type System**


Figure 2-6. Renaming a symbol in your editor.

When you apply the refactor, only the references to the i that you renamed will

change:

```
let i = 0;
for ( let x = 0; x < 10; x++) {
console.log(x);
{
let i = 12;
console.log(i);
}
}
console.log(i);
```
If you rename a symbol that’s imported from another module, those imports will also

update. There are many other useful refactors available, such as renaming or moving

a file (which updates all imports) and moving a symbol into a new file. You should

familiarize yourself with these because they can significantly increase your productiv‐

ity while working with large TypeScript projects.

Language services can also help you navigate through both your own code as well as

external libraries and type declarations. Suppose you see a call to the global fetch

function in code and want to learn more about it. Your editor should provide a “Go to

Definition” option. In mine it looks like Figure 2-7.

Figure 2-7. The TypeScript language service provides a “Go to Definition” feature that

should be available in your editor.

```
Item 6: Use Your Editor to Interrogate and Explore the Type System | 31
```

Selecting this option takes you into lib.dom.d.ts, the type declarations that TypeScript

includes for the DOM:

```
declare function fetch(
input: RequestInfo | URL, init?: RequestInit
): Promise<Response>;
```
You can see that fetch returns a Promise and takes two arguments. Clicking through

on RequestInfo brings you here:

```
type RequestInfo = Request | string ;
```
from which you can go to Request:

```
interface Request extends Body {
// ...
}
declare var Request: {
prototype: Request;
new (input: RequestInfo | URL, init?: RequestInit | undefined ): Request;
};
```
Here you can see that the Request type and value are being modeled separately (see

Item 8). You’ve seen RequestInfo already. Clicking through on RequestInit shows

all the options you can use in constructing a Request:

```
interface RequestInit {
body?: BodyInit | null ;
cache?: RequestCache;
credentials?: RequestCredentials;
headers?: HeadersInit;
// ...
}
```
There are many more types you could follow here, but you get the idea. Type declara‐

tions can be challenging to read at first, but they’re an excellent way to see what can

be done with TypeScript, how the library you’re using is modeled, and how you might

debug errors. For much more on type declarations, see Chapter 8.

**Things to Remember**

- Take advantage of the TypeScript language services by using an editor that sup‐
    ports them.
- Use your editor to build an intuition for how the type system works and how
    TypeScript infers types.
- Familiarize yourself with TypeScript’s refactoring tools, e.g., renaming symbols
    and files.
- Know how to jump into type declaration files to see how they model behavior.

**32 | Chapter 2: TypeScript’s Type System**


### Item 7: Think of Types as Sets of Values

At runtime, every variable has a single value chosen from JavaScript’s universe of val‐

ues. There are many possible values, including:

- 42
- null
- undefined
- 'Canada'
- {animal: 'Whale', weight_lbs: 40_000}
- /regex/
- new HTMLButtonElement
- (x, y) => x + y

But before your code runs, when TypeScript is checking it for errors, a variable just

has a type. This is best thought of as a set of possible values. This set is known as the

domain of the type. For instance, you can think of the number type as the set of all

number values. 42 and -37.25 are in it, but 'Canada' is not. Depending on strict

NullChecks, null and undefined may or may not be part of the set.

```
You won’t often see the term “domain” in TypeScript documenta‐
tion or literature, or even elsewhere in this book. Types are spoken
of interchangeably with their sets of values. But in this item, it will
be helpful to have a term to refer specifically to the set of values for
a type, as opposed to the type itself.
```
The smallest set is the empty set, which contains no values. It corresponds to the

never type in TypeScript. Because its domain is empty, no values are assignable to a

variable with a never type:

```
const x: never = 12;
// ~ Type 'number' is not assignable to type 'never'.
```
Because it sits at the bottom of the type hierarchy, never is sometimes called a “bot‐

tom type.”

The next smallest sets are those that contain single values. These correspond to literal

types in TypeScript. (In other languages these are sometimes called “unit types.”)

```
type A = 'A';
type B = 'B';
type Twelve = 12;
```
```
Item 7: Think of Types as Sets of Values | 33
```

To form types with two or three values, you can union literal types:

```
type AB = 'A' | 'B';
type AB12 = 'A' | 'B' | 12;
```
The domain of a union type is the union of the domains of its constituent types, as

shown in Figure 2-8. This is what the “union” in “union type” refers to.

Figure 2-8. Values and types as sets of values. The boxes are values ( _"A"_ , _"B"_ , _12_ ) and

the rounded shapes are types ( _A_ , _B_ , _AB_ , _AB12_ , _Twelve_ ), which include a set of values. One

type is assignable to another if it’s entirely contained within it.

The word “assignable” appears in many TypeScript errors. In the context of sets of

values, it means either “member of ” (for a relationship between a value and a type) or

“subset of ” (for a relationship between two types):

```
const a: AB = 'A'; // OK, value 'A' is a member of the set {'A', 'B'}
const c: AB = 'C';
// ~ Type '"C"' is not assignable to type 'AB'
```
The type "C" is a literal type. Its domain consists of the single value "C". This is not a

subset of the domain of AB (which consists of the values "A" and "B"), so this is an

error. At the end of the day, much of what the type checker is doing is testing whether

one set is a subset of another:

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
The sets for these types are straightforward to reason about because they are finite.

You can compare the elements one by one. But most types that you work with in

practice have infinite domains. Reasoning about these can be harder. You can think of

them as either being built by listing out their elements:

**34 | Chapter 2: TypeScript’s Type System**


```
type Int = 1 | 2 | 3 | 4 | 5 // | ...
```
or by describing their members:

```
interface Identified {
id: string ;
}
```
Think of this interface as a description of the values in the domain of its type. Is the

value an object? Does it have an id property whose value is assignable to string?

Then it’s an Identified.

That’s all it says. As Item 4 explained, TypeScript’s structural typing rules mean that

the value could have other properties, too. It could even be callable! This fact can

sometimes be obscured by excess property checking (see Item 11).

Thinking of types as sets of values helps you reason about operations on them. For

example:

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
The & operator computes the intersection of two types. What sorts of values belong to

the PersonSpan type? On first glance, the Person and Lifespan interfaces have no

properties in common, so you might expect it to be the empty set (i.e., the never

type). But type operations apply to the sets of values (the domain of the type), not to

the properties in the interface. And remember that values with additional properties

still belong to a type. So a value that has the properties of both Person and Lifespan

will belong to the intersection type:

```
const ps: Person Span = {
name: 'Alan Turing',
birth: new Date('1912/06/23'),
death: new Date('1954/06/07'),
}; // OK
```
Of course, a value could have more than those three properties and still belong to the

type! The general rule is that the values in an intersection type contain the union of

properties in each of its constituents.

The intuition about intersecting properties is correct, but for the union of two inter‐

faces, rather than their intersection:

```
type K = keyof (Person | Lifespan);
// ^? type K = never
```
```
Item 7: Think of Types as Sets of Values | 35
```

There are no keys that TypeScript can be certain will be present on a value in the

union type, so keyof for the union must be the empty set (never). Or, more formally:

```
// Disclaimer: these are relationships, not TypeScript code!
keyof (A&B) = ( keyof A) | ( keyof B)
keyof (A|B) = ( keyof A) & ( keyof B)
```
If you can build an intuition for why these equations hold, you’ll have come a long

way toward understanding TypeScript’s type system!

A more idiomatic way to write the PersonSpan type would be with extends:

```
interface Person {
name: string ;
}
interface PersonSpan extends Person {
birth: Date;
death?: Date;
}
```
Thinking of types as sets of values, what does extends mean? Just like “assignable to,”

you can read it as “subset of.” Every value in PersonSpan must have a name property

that is a string. And every value must also have a birth property, so it’s a proper

subset.

While extends is typically used to add fields to an interface, anything matching a

subset of the values of the base type will do. This lets you model more nuanced type

relationships:

```
interface NullyStudent {
name: string ;
ageYears: number | null ;
}
interface Student extends NullyStudent {
ageYears: number ;
}
```
Not every language would let you change the type of ageYears like this, but so long as

it’s assignable to the type in the base type (NullyStudent), TypeScript allows it. This

makes sense when you think about the domains of these two interfaces. If you try

to expand the type of ageYears instead, you’ll get an error:

```
interface StringyStudent extends NullyStudent {
// ~~~~~~~~~~~~~~
// Interface 'StringyStudent' incorrectly extends interface 'NullyStudent'.
ageYears: number | string ;
}
```
**36 | Chapter 2: TypeScript’s Type System**


You might hear the term “subtype.” This is another way of saying that one type’s

domain is a subset of the other’s. Thinking in terms of one-, two-, and three-

dimensional vectors:

```
interface Vector1D { x: number ; }
interface Vector2D extends Vector1D { y: number ; }
interface Vector3D extends Vector2D { z: number ; }
```
You’d say that a Vector3D is a subtype of Vector2D, which is a subtype of Vector1D (in

the context of classes, you’d say “subclass”). This relationship is usually drawn as a

hierarchy, but thinking in terms of sets of values, a Venn diagram is more appropriate

(see Figure 2-9).

Figure 2-9. Two ways of thinking of type relationships: as a hierarchy or as overlapping

sets.

With the Venn diagram, it’s clear that the subset/subtype/assignability relationships

are unchanged if you rewrite the interfaces without extends:

```
interface Vector1D { x: number ; }
interface Vector2D { x: number ; y: number ; }
interface Vector3D { x: number ; y: number ; z: number ; }
```
The sets haven’t changed, so neither has the Venn diagram.

While both interpretations are workable for object types, the set interpretation

becomes much more intuitive when you start thinking about literal types and union

types.

The extends keyword can also appear as a constraint in a generic type, and it also

means “subset of ” in this context (Item 15):

```
function getKey<K extends string >(val: any , key: K) {
// ...
}
```
What does it mean to extend string? If you’re used to thinking in terms of object

inheritance, it’s hard to interpret. You could define a subclass of the object wrapper

type String (Item 10), but that seems inadvisable.

```
Item 7: Think of Types as Sets of Values | 37
```

Thinking in terms of sets, on the other hand, it stands to reason that any type whose

domain is a subset of string will do. This includes string literal types, unions of

string literal types, template literal types (Item 54), and string itself:

```
getKey({}, 'x'); // OK, 'x' extends string
getKey({}, Math.random() < 0.5? 'a' : 'b'); // OK, 'a'|'b' extends string
getKey({}, document.title); // OK, string extends string
getKey({}, 12);
// ~~ Type 'number' is not assignable to parameter of type 'string'
```
“extends” has turned into “assignable” in the last error, but this shouldn’t trip us up

since we know to read both as “subset of.”

The set interpretation also makes more sense when you have types whose relationship

isn’t strictly hierarchical. What’s the relationship between string|number and

string|Date, for instance? Their intersection is non-empty (it’s string), but neither

is a subtype of the other. The relationship between their domains is clear, even though

these types don’t fit into a strict hierarchy (see Figure 2-10).

Figure 2-10. Union types may not fit into a hierarchy but can be thought of in terms of

sets of values.

Thinking of types as sets can also clarify the relationships between arrays and tuples.

For example:

```
const list = [1, 2];
// ^? const list: number[]
const tuple: [ number , number ] = list;
// ~~~~~ Type 'number[]' is not assignable to type '[number, number]'
// Target requires 2 element(s) but source may have fewer
```
Are there lists of numbers that are not pairs of numbers? Sure! The empty list and the

list [1] are examples. It therefore makes sense that number[] is not assignable to

[number, number] since it’s not a subset of it. (The reverse assignment does work.)

Is a triple assignable to a pair? Thinking in terms of structural typing, you might

expect it to be. A pair has 0 and 1 keys, so mightn’t it have others, too, like 2?

```
const triple: [ number , number , number ] = [1, 2, 3];
const double : [ number , number ] = triple;
// ~~~~~~ '[number, number, number]' is not assignable to '[number, number]'
// Source has 3 element(s) but target allows only 2.
```
**38 | Chapter 2: TypeScript’s Type System**


The answer is “no,” and for an interesting reason. Rather than modeling a pair of

numbers as {0: number, 1: number}, TypeScript models it as {0: number, 1:

number, length: 2}. This makes sense—you can check the length of a tuple—and it

precludes this assignment. And that’s probably for the best!

TypeScript is constantly testing for assignability which, as you’ve seen many times

now, is a subset/subtype relationship. Interestingly, TypeScript rarely checks for type

equality. This makes it challenging to write tests for types, which is the subject of

Item 55.

If types are best thought of as sets of values, that means that two types with the same

sets of values are the same. And indeed this is true (with one caveat, explained

below). Unless two types are semantically different and just happen to have the same

domain, there’s no reason to define the same type twice.

At the extreme opposite end of the spectrum from never (the empty type) is unknown.

The domain of this type is all values in JavaScript. Every type is assignable to unknown.

Since it sits on top of the type hierarchy, it’s called a “top type.” Item 46 explains how

to use the unknown type in your own code.

Finally, it’s worth noting that not all sets of values correspond to TypeScript types.

There is no TypeScript type for all the integers, or for all the objects that have x and y

properties but no others. You can sometimes subtract types using Exclude, but only

when it would result in a proper TypeScript type:

```
type T = Exclude< string |Date, string | number >;
// ^? type T = Date
type NonZeroNums = Exclude< number , 0>;
// ^? type NonZeroNums = number
```
Table 2-1 summarizes the correspondence between TypeScript terms and terms from

set theory.

Table 2-1. TypeScript terms and set terms

```
TypeScript term Set term
never ∅ (empty set)
Literal type Single element set
Value assignable to T Value ∈ T (member of)
T1 assignable to T2 T1 ⊆ T2 (subset of)
T1 extends T2 T1 ⊆ T2 (subset of)
T1 | T2 T1 ∪ T2 (union)
T1 & T2 T1 ∩ T2 (intersection)
unknown Universal set
```
```
Item 7: Think of Types as Sets of Values | 39
```

There’s an important caveat to this interpretation: it works best when you think of

values as immutable. For example, what’s the difference between these two types?

```
interface Lockbox {
code: number ;
}
interface ReadonlyLockbox {
readonly code: number ;
}
```
The domain of these two types is precisely the same, but they’re observably different:

```
const box: Lockbox = { code: 4216 };
const robox: ReadonlyLockbox = { code: 3625 };
box.code = 1234; // ok
robox.code = 1234;
// ~~~~ Cannot assign to 'code' because it is a read-only property.
```
For this reason, you’ll sometimes hear a variation on this item’s title: “types are sets of

values and the things you can do with them.” Item 14 has more to say about readonly

but, as a general rule, the type checker is more effective when you work with immuta‐

ble values.

**Things to Remember**

- Think of types as sets of values (the type’s domain). These sets can either be finite
    (e.g., boolean or literal types) or infinite (e.g., number or string).
- TypeScript types form intersecting sets (a Venn diagram) rather than a strict hier‐
    archy. Two types can overlap without either being a subtype of the other.
- Remember that an object can still belong to a type even if it has additional prop‐
    erties that were not mentioned in the type declaration.
- Type operations apply to a set’s domain. The domain of A | B is the union of the
    domains of A and B.
- Think of “extends,” “assignable to,” and “subtype of ” as synonyms for “subset of.”

#### Item 8: Know How to Tell Whether a Symbol Is in the

#### Type Space or Value Space

A symbol in TypeScript exists in one of two spaces:

- Type space
- Value space

**40 | Chapter 2: TypeScript’s Type System**


This can get confusing because the same name can refer to different things depending

on which space it’s in:

```
interface Cylinder {
radius: number ;
height: number ;
}
```
```
const Cylinder = (radius: number , height: number ) => ({radius, height});
```
interface Cylinder introduces a symbol in type space. const Cylinder introduces

a symbol with the same name in value space. They have nothing to do with one

another. Depending on the context, when you write Cylinder, you’ll either be refer‐

ring to the type or the value. Sometimes this can lead to errors:

```
function calculateVolume(shape: unknown ) {
if (shape instanceof Cylinder) {
shape.radius
// ~~~~~~ Property 'radius' does not exist on type '{}'
}
}
```
What’s going on here? You probably intended the instanceof to check whether the

shape was of the Cylinder type. But instanceof is JavaScript’s runtime operator, and

it operates on values. So instanceof Cylinder refers to the function, not the type.

It’s not always obvious at first glance whether a symbol is in type space or value space.

You have to tell from the context in which the symbol occurs. This can get especially

confusing because many type-space constructs look exactly the same as value-space

constructs.

Literal types, for example:

```
type T1 = 'string literal';
const v1 = 'string literal';
type T2 = 123;
const v2 = 123;
```
The symbols after a type or interface are in type space, while those introduced in a

const or let declaration are values.

One of the best ways to build an intuition for the two spaces is through the Type‐

Script playground, which shows you the generated JavaScript for your TypeScript

source. Types are erased during compilation (Item 3), so if a symbol disappears then

it was in type space (see Figure 2-11).

```
Item 8: Know How to Tell Whether a Symbol Is in the Type Space or Value Space | 41
```

Figure 2-11. The TypeScript playground showing generated JavaScript. The symbols on

the first two lines go away, so they were in type space.

Statements in TypeScript can alternate between type space and value space. The sym‐

bols after a type declaration (:) or an assertion (as) are in type space, while every‐

thing after an = in an assignment is in value space. For example:

```
interface Person {
first: string ;
last: string ;
}
const jane: Person = { first: 'Jane', last: 'Jacobs' };
// ―――― ――――――――――――――――――――――――――――――――― Values
// ―――――― Type
```
Function statements, in particular, can alternate repeatedly between the spaces:

```
function email(to: Person , subject: string , body: string ): Response {
// ――――― ―― ――――――― ―――― Values
// ―――――― ―――――― ―――――― ―――――――― Types
// ...
}
```
The class and enum constructs introduce both a type and a value. Returning to the

first example, for instance, Cylinder could have been a class:

```
class Cylinder {
radius: number ;
height: number ;
constructor (radius: number , height: number ) {
this .radius = radius;
this .height = height;
}
}
```
```
function calculateVolume(shape: unknown ) {
if (shape instanceof Cylinder) {
shape
// ^? (parameter) shape: Cylinder
```
**42 | Chapter 2: TypeScript’s Type System**


```
shape.radius
// ^? (property) Cylinder.radius: number
}
}
```
The TypeScript type introduced by a class is based on its shape (its properties and

methods), while the value is the constructor.

There are many operators and keywords that mean different things in a type or value

context. typeof, for instance:

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
In a type context, typeof takes a value and returns its TypeScript type. You can use

these as part of a larger type expression, or use a type statement to give them a name.

In a value context, typeof is JavaScript’s runtime typeof operator. It returns a string

containing the runtime type of the symbol. This is not the same as the TypeScript

type! JavaScript’s runtime type system is much simpler than TypeScript’s static type

system. In contrast to the infinite variety of TypeScript types, JavaScript’s typeof

operator only has eight possible return values: "string", "number", "boolean",

"undefined", "object", "function", "symbol", and "bigint".

The [] property accessor also has an identical-looking equivalent in type space. But

be aware that while obj['field'] and obj.field are equivalent in value space, they

are not in type space. You must use the former to get the type of another type’s

property:

```
const first: Person ['first'] = jane['first']; // Or jane.first
// ――――― ――――――――――――― Values
// ―――――― ――――――― Types
```
Person['first'] is a type here since it appears in a type context (after a :). You can

put any type in the index slot, including union types or primitive types:

```
type PersonEl = Person['first' | 'last'];
// ^? type PersonEl = string
type Tuple = [ string , number , Date];
type TupleEl = Tuple[ number ];
// ^? type TupleEl = string | number | Date
```
See Item 15 for more on type operations and how to map between types.

```
Item 8: Know How to Tell Whether a Symbol Is in the Type Space or Value Space | 43
```

There are many other constructs that have different meanings in the two spaces:

- this in value space is JavaScript’s this keyword (Item 69). As a type, this is the
    TypeScript type of this, aka “polymorphic this.” It’s helpful for implementing
    method chains with subclasses.
- In value space, & and | are bitwise AND and OR. In type space they are the inter‐
    section and union operators.
- In value space, const introduces a new variable, but in type space, as const
    changes the inferred type of a literal or literal expression (Item 20).
- In value space, extends defines a subclass (class A extends B), but in type
    space it defines a subtype (interface A extends B) or a constraint on a generic
    type (Generic<T extends number>).
- In value space, "in" is used in for loops (for (key in object)), while in type
    space it’s used in mapped types (Item 15).
- In value space,! is JavaScript’s logical not operator (!x), but in type space it’s a
    non-null type assertion (x!; see Item 9).

If TypeScript doesn’t seem to understand your code at all, it may be because of confu‐

sion around type and value space. For example, say you change the email function

from earlier to take its arguments in a single object parameter (Item 38 explains why

this is a good idea):

```
function email(options: {to: Person , subject: string , body: string }) {
// ...
}
```
In JavaScript you can use destructuring assignment to create local variables for each

property in the object:

```
function email({to, subject, body}) {
// ...
}
```
If you try to do the same in TypeScript, you get some confusing errors:

```
function email({
to: Person ,
// ~~~~~~ Binding element 'Person' implicitly has an 'any' type
subject: string ,
// ~~~~~~ Binding element 'string' implicitly has an 'any' type
body: string
// ~~~~~~ Binding element 'string' implicitly has an 'any' type
}) { /* ... */ }
```
**44 | Chapter 2: TypeScript’s Type System**


The problem is that Person and string are being interpreted in a value context.

You’re trying to create a variable named Person and two variables named string.

Instead, you should separate the types and values:

```
function email(
{to, subject, body}: {to: Person , subject: string , body: string }
) {
// ...
}
```
This is significantly more verbose, but in practice you may have a named type for the

parameters or be able to infer them from context (Item 24).

While the similar constructs in type and value space can be confusing at first, they’re

eventually useful as a mnemonic once you get the hang of it.

**Things to Remember**

- Know how to tell whether you’re in type space or value space while reading a
    TypeScript expression. Use the TypeScript playground to build an intuition for
    this.
- Every value has a static type, but this is only accessible in type space. Type space
    constructs such as type and interface are erased and are not accessible in value
    space.
- Some constructs, such as class or enum, introduce both a type and a value.
- typeof, this, and many other operators and keywords have different meanings
    in type space and value space.

### Item 9: Prefer Type Annotations to Type Assertions

TypeScript seems to have two ways of assigning a value to a variable and giving it a

type:

```
interface Person { name: string };
```
```
const alice: Person = { name: 'Alice' };
// ^? const alice: Person
const bob = { name: 'Bob' } as Person;
// ^? const bob: Person
```
While these achieve similar ends, they are actually quite different! The first (alice:

Person) adds a type annotation to the variable and ensures that the value conforms to

the type. The latter (as Person) performs a type assertion. This tells TypeScript that,

despite the type it inferred, you know better and would like the type to be Person.

```
Item 9: Prefer Type Annotations to Type Assertions | 45
```

In general, you should prefer type annotations to type assertions. Here’s why:

```
const alice: Person = {};
// ~~~~~ Property 'name' is missing in type '{}' but required in type 'Person'
const bob = {} as Person; // No error
```
The type annotation verifies that the value conforms to the interface. Since it does

not, TypeScript flags an error. The type assertion silences this error by telling the type

checker that, for whatever reason, you know better than it does.

The same thing happens if you specify an additional property:

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
While undeclared properties are valid from a structural typing perspective (Item 4),

they are often mistakes. TypeScript has an additional tool known as excess property

checking that flags extra properties in objects with declared types, but it doesn’t apply

if you use an assertion. Item 11 will have much more to say about excess property

checking.

Because they provide additional safety checks, you should use type annotations

unless you have a specific reason to use a type assertion.

```
You may also see code that looks like const bob = <Person>{}.
This was the original syntax for assertions and is equivalent to {}
as Person. It is less common now because <Person> is interpreted
as a start tag in .tsx files (TypeScript + React).
```
It can be tricky to use a type annotation with arrow functions. What if you wanted to

use the named Person interface in this code?

```
const people = ['alice', 'bob', 'jan'].map(name => ({name}));
// { name: string; }[]... but we want Person[]
```
It’s tempting to use a type assertion here, and it seems to solve the problem:

```
const people = ['alice', 'bob', 'jan'].map(
name => ({name} as Person)
); // Type is Person[]
```
**46 | Chapter 2: TypeScript’s Type System**


But this suffers from all the same issues as a more direct use of type assertions. For

example:

```
const people = ['alice', 'bob', 'jan'].map(name => ({} as Person));
// No error
```
So how do you use a type annotation in this context instead? The most straightfor‐

ward way is to declare a variable in the arrow function:

```
const people = ['alice', 'bob', 'jan'].map(name => {
const person: Person = {name};
return person
}); // Type is Person[]
```
But this introduces considerable noise compared to the original code. A more concise

way is to annotate the return type of the arrow function:

```
const people = ['alice', 'bob', 'jan'].map(
(name): Person => ({name})
); // Type is Person[]
```
This performs all the same checks on the value as the previous version. The parenthe‐

ses are significant here! (name): Person allows the type of name to be inferred and

specifies that the return type should be Person. But (name: Person) would specify

that the type of name is Person while allowing the return type to be inferred, which

would produce an error. See Item 24 for more about how type inference works with

function parameters.

In this case you could have also written the final desired type and let TypeScript

check the validity of the assignment:

```
const people: Person [] = ['alice', 'bob', 'jan'].map(name => ({name})); // OK
```
But in the context of a longer chain of function calls, it may be necessary or desirable

to have the named type in place earlier. And it will help flag errors close to where they

occur.

So when should you use a type assertion? Type assertions make the most sense when

you truly do know more about a type than TypeScript does, typically from context

that isn’t available to the type checker. If you’re working in a browser, for instance,

you may know the type of a DOM element more precisely than TypeScript does:

```
document.querySelector('#myButton')?.addEventListener('click', e => {
e.currentTarget
// ^? (property) Event.currentTarget: EventTarget | null
// currentTarget is #myButton is a button element
const button = e.currentTarget as HTMLButtonElement;
// ^? const button: HTMLButtonElement
});
```
```
Item 9: Prefer Type Annotations to Type Assertions | 47
```

Because TypeScript doesn’t have access to the DOM of your page, it has no way of

knowing that #myButton is a button element. And it doesn’t know that the current

Target of the event should be that same button. Since you have information that

TypeScript does not, a type assertion makes sense here. For more on DOM types, see

Item 75.

When you use a type assertion, it’s a good idea to include an explanation of why it’s

valid in a comment. This provides the missing information for human readers and

will help them evaluate whether the assertion is still justified.

What if a variable’s type includes null but you know from context that this isn’t possi‐

ble? You can use a type assertion to remove null from a type:

```
const elNull = document.getElementById('foo');
// ^? const elNull: HTMLElement | null
const el = document.getElementById('foo') as HTMLElement;
// ^? const el: HTMLElement
```
This sort of type assertion is so common that it gets a special syntax and is known as a

non-null assertion:

```
const el = document.getElementById('foo')!;
// ^? const el: HTMLElement
```
Used as a prefix,! is JavaScript’s logical not operator. But as a suffix,! is interpreted

as a type assertion that the value is non-null. This is an improvement over as because

it allows the non-null part of the type to pass through unaltered.

Still, you should treat! with as much caution as any other assertion: it is erased dur‐

ing compilation, so you should only use it if you have information that the type

checker lacks and can ensure that the value is non-null. If you can’t, you should use a

conditional to check for the null case.

If you’re accessing a property or method on an object that might be null, it can be

convenient to use the “optional chaining” operator, ?.:

```
document.getElementById('foo')?.addEventListener('click', () => {
alert('Hi there!');
});
```
This has some superficial resemblance to !. but it’s quite different. a?.b is a Java‐

Script construct that checks if the object is null (or undefined) at runtime before

continuing to evaluate the expression. a!.b is a type-level construct that compiles to

just a.b. If the object is null at runtime, it will throw an exception. a?.b is safer than

a!.b, but don’t go too crazy with it. If it’s essential for your application to add an

event listener, then you probably want to know if it fails!

Type assertions have their limits: they don’t let you convert between arbitrary types.

The general rule is that you can use a type assertion to convert between A and B if

**48 | Chapter 2: TypeScript’s Type System**


they are “comparable” to one another. Using the set terminology from Item 7, this

means that A and B must have a non-empty intersection. In particular, subtypes are

allowed. HTMLElement is a subtype of HTMLElement | null, so this type assertion is

OK. (The intersection of these types is HTMLElement.) HTMLButtonElement is a sub‐

type of EventTarget, so that is OK, too. And Person is a subtype of {}, so that asser‐

tion is also fine.

But you can’t convert between a Person and an HTMLElement since their intersection

is empty (i.e., the never type):

```
interface Person { name: string ; }
const body = document.body;
const el = body as Person;
// ~~~~~~~~~~~~~~
// Conversion of type 'HTMLElement' to type 'Person' may be a mistake because
// neither type sufficiently overlaps with the other. If this was intentional,
// convert the expression to 'unknown' first.
```
The error suggests an escape hatch, namely, using the unknown type (Item 46). Every

type is a subtype of unknown, so assertions involving unknown are always OK. This lets

you convert between arbitrary types, but at least you’re being explicit that you’re

doing something suspicious!

```
const el = document.body as unknown as Person; // OK
```
Not every type assertion uses the keyword as. Item 22 explains “user-defined type

guards” (is), which allow you to associate some logic with a type assertion to check

whether it’s valid. It’s also possible to use generic type inference to assert a type, but

this is a bad idea since it’s easy to convince yourself that TypeScript is checking your

types when it’s really not. This pattern (“return-only generics”) is explored in Item 51.

Type assertions are sometimes called “casts.” This terminology is misleading, how‐

ever, and is best avoided. In languages like C, a cast can change a value at runtime

(say from an int to a float). Type assertions cannot do this. They are type-level con‐

structs that are erased at runtime. They don’t change a value. Rather, they “assert”

something that is already true about it.

Finally, there’s as const. While this looks like a type assertion, it’s more properly

called a “const context.” While as T should make you suspicious, as const makes

types more precise and is completely safe. Item 24 shows how you can use const con‐

texts to improve type inference.

**Things to Remember**

- Prefer type annotations (: Type) to type assertions (as Type).
- Know how to annotate the return type of an arrow function.

```
Item 9: Prefer Type Annotations to Type Assertions | 49
```

- Use type assertions and non-null assertions only when you know something
    about types that TypeScript does not.
- When you use a type assertion, include a comment explaining why it’s valid.

#### Item 10: Avoid Object Wrapper Types (String, Number,

#### Boolean, Symbol, BigInt)

In addition to objects, JavaScript has seven types of primitive values: strings, num‐

bers, booleans, null, undefined, symbol, and bigint. The first five have been around

since the beginning. The symbol primitive was added in ES2015, and bigint joined

the family with ES2020.

Primitives are distinguished from objects by being immutable and not having meth‐

ods. You might object that strings do have methods:

```
> 'primitive'.charAt(3)
'm'
```
But things are not quite as they seem. There’s actually something surprising and sub‐

tle going on here. While a string primitive does not have methods, JavaScript also

defines a String object type that does. JavaScript freely converts between these types.

When you access a method like charAt on a string primitive, JavaScript wraps it in a

String object, calls the method, and then throws the object away.

You can observe this if you monkey-patch String.prototype (Item 47):

```
// Don't do this!
const originalCharAt = String.prototype.charAt;
String.prototype.charAt = function (pos) {
console.log( this , typeof this , pos);
return originalCharAt.call( this , pos);
};
console.log('primitive'.charAt(3));
```
This produces the following output:

```
[String: 'primitive'] object 3
m
```
The this value in the method is a String object wrapper, not a string primitive. You

can instantiate a String object directly and it will sometimes behave like a string

primitive. But not always. For example, a String object is only ever equal to itself:

```
> "hello" === new String("hello")
false
> new String("hello") === new String("hello")
false
```
**50 | Chapter 2: TypeScript’s Type System**


The implicit conversion to object wrapper types explains an odd phenomenon in

JavaScript—if you assign a property to a primitive, it disappears:

```
> x = "hello"
'hello'
> x.language = 'English'
'English'
> x.language
undefined
```
Now you know the explanation: x is converted to a String instance, the language

property is set on that, and then the object (with its language property) is thrown

away.

There are object wrapper types for the other primitives as well: Number for numbers,

Boolean for booleans, Symbol for symbols, and BigInt for bigints (there are no object

wrappers for null and undefined).

These wrapper types exist as a convenience to provide methods on the primitive val‐

ues and to provide static methods (e.g., String.fromCharCode). But there’s usually no

reason to instantiate them directly.

TypeScript models this distinction by having distinct types for the primitives and

their object wrappers:

- string and String
- number and Number
- boolean and Boolean
- symbol and Symbol
- bigint and BigInt

It’s easy to inadvertently type String (especially if you’re coming from Java or C#),

and it even seems to work, at least initially:

```
function getStringLen(foo: String) {
return foo.length;
}
```
```
getStringLen("hello"); // OK
getStringLen( new String("hello")); // OK
```
But things go awry when you try to pass a String object to a method that expects a

string:

```
function isGreeting(phrase: String) {
return ['hello', 'good day'].includes(phrase);
// ~~~~~~
// Argument of type 'String' is not assignable to parameter of type 'string'.
```
```
Item 10: Avoid Object Wrapper Types (String, Number, Boolean, Symbol, BigInt) | 51
```

```
// 'string' is a primitive, but 'String' is a wrapper object.
// Prefer using 'string' when possible.
}
```
So string is assignable to String, but String is not assignable to string. Confusing?

Follow the advice in the error message and stick with string. All the type declara‐

tions that ship with TypeScript use it, as do the typings for almost all other libraries.

Another way you can wind up with wrapper objects is if you provide an explicit type

annotation with a capital letter:

```
const s: String = "primitive";
const n: Number = 12;
const b: Boolean = true ;
```
This only changes the TypeScript types and, as Item 3 explained, this can’t affect the

runtime values. They are still primitives, not objects. But TypeScript permits these

declarations because the primitive types are assignable to the object wrappers. These

annotations are both misleading and redundant (Item 18). Better to stick with the

primitive types.

As a final note, it’s fine to call BigInt and Symbol without new, since these create

primitives:

```
> typeof BigInt(1234)
'bigint'
> typeof Symbol('sym')
'symbol'
```
These are the BigInt and Symbol values, not the TypeScript types (Item 8). Calling

them results in values of type bigint and symbol. You can construct a bigint directly

by putting an “n” at the end of a numeric literal: 123n.

If you use typescript-eslint in your project, the ban-types rule prohibits the use

of object wrapper types. This is enabled with the @typescript-eslint/recommended

configuration.

**Things to Remember**

- Avoid TypeScript object wrapper types. Use the primitive types instead: string
    instead of String, number instead of Number, boolean instead of Boolean, symbol
    instead of Symbol, and bigint instead of BigInt.
- Understand how object wrapper types are used to provide methods on primitive
    values. Avoid instantiating them or using them directly, with the exception of
    Symbol and BigInt.

**52 | Chapter 2: TypeScript’s Type System**


### Item 11: Distinguish Excess Property Checking from Type Checking

When you assign an object literal to a variable with a declared type, TypeScript makes

sure it has the properties of that type and no others:

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
While it is odd that there’s an elephant property, this error doesn’t make much sense

from a structural typing point of view (Item 4). That constant is assignable to the

Room type, which you can see by introducing an intermediate variable:

```
const obj = {
numDoors: 1,
ceilingHeightFt: 10,
elephant: 'present',
};
const r: Room = obj; // OK
```
The type of obj is inferred as { numDoors: number; ceilingHeightFt: number;

elephant: string }. This type includes a subset of the values in the Room type

because it only permits string elephants, whereas Room would permit any type of ele‐

phant. Hence it is assignable to Room, and the code passes the type checker. (If the

term “subset” is unfamiliar, head over to Item 7 for a refresher.)

So what’s different about these two examples? In the first you’ve triggered a process

known as “excess property checking,” which helps catch an important class of errors

that the structural type system would otherwise miss. But this process has its limits,

and conflating it with regular assignability checks can make it harder to build an intu‐

ition for structural typing. Recognizing excess property checking as a distinct process

will help you build a clearer mental model of TypeScript’s type system.

As Item 1 explained, TypeScript goes beyond trying to flag code that will throw

exceptions at runtime. It also tries to find code that doesn’t do what you intend. Here’s

an example of the latter:

```
interface Options {
title: string ;
darkMode?: boolean ;
```
```
Item 11: Distinguish Excess Property Checking from Type Checking | 53
```

##### }

```
function createWindow(options: Options) {
if (options.darkMode) {
setDarkMode();
}
// ...
}
createWindow({
title: 'Spider Solitaire',
darkmode: true
// ~~~~~~~ Object literal may only specify known properties,
// but 'darkmode' does not exist in type 'Options'.
// Did you mean to write 'darkMode'?
});
```
This code doesn’t throw any sort of error at runtime. But it’s also unlikely to do what

you intended for the exact reason that TypeScript says: it should be darkMode (capital

M), not darkmode.

A purely structural type checker wouldn’t be able to spot this sort of error because the

Options type is incredibly broad: it includes all objects with a title property that’s a

string and any other properties, so long as those don’t include a darkMode property

set to something other than true or false.

It’s easy to forget how expansive TypeScript types can be. Here are a few more values

that are assignable to Options:

```
const o1: Options = document; // OK
const o2: Options = new HTMLAnchorElement(); // OK
```
Both document and instances of HTMLAnchorElement have title properties that are

strings, so these assignments are allowed. Options is a broad type indeed!

Excess property checking tries to rein this in without compromising the fundamen‐

tally structural nature of the type system. It does this by disallowing unknown prop‐

erties on object literals when they’re used in a context with a declared type. (It’s

sometimes called “strict object literal checking” for this reason, or “freshness” because

it applies to freshly created objects.)

This context could be an assignment to a variable with a declared type, a function

argument, or the return value of a function with a declared return type. Neither docu

ment nor new HTMLAnchorElement is an object literal, so they did not trigger excess

property checking. But the {title, darkmode} object is, so it does:

```
const o: Options = { darkmode: true , title: 'Ski Free' };
// ~~~~~~~~ 'darkmode' does not exist in type 'Options'...
```
This explains why using an intermediate variable without a type annotation makes

the error go away:

**54 | Chapter 2: TypeScript’s Type System**


```
const intermediate = { darkmode: true , title: 'Ski Free' };
const o: Options = intermediate; // OK
```
While the righthand side of the first line is an object literal, the righthand side of the

second line (intermediate) is not, so excess property checking does not apply, and

the error goes away.

Excess property checking does not happen when you use a type assertion:

```
const o = { darkmode: true , title: 'MS Hearts' } as Options; // OK
```
This is a good reason to prefer type annotations to assertions (Item 9).

If you don’t want this sort of check, you can tell TypeScript to expect additional prop‐

erties using an index signature:

```
interface Options {
darkMode?: boolean ;
[otherOptions: string ]: unknown ;
}
const o: Options = { darkmode: true }; // OK
```
Item 16 discusses when this is and is not an appropriate way to model your data.

A related check happens for so-called “weak” types, which have only optional

properties:

```
interface LineChartOptions {
logscale?: boolean ;
invertedYAxis?: boolean ;
areaChart?: boolean ;
}
function setOptions(options: LineChartOptions) { /* ... */ }
```
```
const opts = { logScale: true };
setOptions(opts);
// ~~~~ Type '{ logScale: boolean; }' has no properties in common
// with type 'LineChartOptions'
```
From a structural point of view, the LineChartOptions type should include almost all

objects. For “weak” types like this, TypeScript adds another check to make sure that

the value type and declared type have at least one property in common. Much like

excess property checking, this is effective at catching typos and isn’t strictly structural.

But unlike excess property checking, it happens during all assignability checks involv‐

ing weak types. Factoring out an intermediate variable doesn’t bypass this check.

```
In TypeScript, “weak type” is a technical term that specifically
refers to interfaces with only optional properties. It has nothing to
do with the merits of your type, and the opposite of a “weak type”
is not a “strong type,” a term that has no specific meaning in Type‐
Script or programming languages in general.
```
```
Item 11: Distinguish Excess Property Checking from Type Checking | 55
```

Excess property checking is an effective way of catching typos and other mistakes in

property names that would otherwise be allowed by the structural typing system. It’s

particularly useful with types like Options that contain optional fields. But it is also

very limited in scope: it only applies to object literals. Recognize this limitation, and

distinguish between excess property checking and ordinary assignability checking.

This will help you build a mental model of both.

For a concrete example of how excess property checking can catch bugs and open up

new design possibilities, see Item 61.

**Things to Remember**

- When you assign an object literal to a variable with a known type or pass it as an
    argument to a function, it undergoes excess property checking.
- Excess property checking is an effective way to find errors, but it is distinct from
    the usual structural assignability checks done by the TypeScript type checker.
    Conflating these processes will make it harder for you to build a mental model of
    assignability. TypeScript types are not “closed” (Item 4).
- Be aware of the limits of excess property checking: introducing an intermediate
    variable will remove these checks.
- A “weak type” is an object type with only optional properties. For these types,
    assignability checks require at least one matching property.

### Item 12: Apply Types to Entire Function Expressions When Possible

JavaScript (and TypeScript) distinguishes between a function statement and a func‐

tion expression:

```
function rollDice1(sides: number ): number { /* ... */ } // Statement
const rollDice2 = function (sides: number ): number { /* ... */ }; // Expression
const rollDice3 = (sides: number ): number => { /* ... */ }; // Also expression
```
An advantage of function expressions in TypeScript is that you can apply a type dec‐

laration to the entire function at once, rather than specifying the types of the parame‐

ters and return type individually:

```
type DiceRollFn = (sides: number ) => number ;
const rollDice: DiceRollFn = sides => { /* ... */ };
```
If you mouse over sides in your editor, you’ll see that TypeScript knows its type is

number. The function type doesn’t provide much value in such a short example, but

the technique does open up a number of possibilities.

**56 | Chapter 2: TypeScript’s Type System**


One is reducing repetition. If you wanted to write several functions for doing arith‐

metic on numbers, for instance, you could write them like this:

```
function add(a: number , b: number ) { return a + b; }
function sub(a: number , b: number ) { return a - b; }
function mul(a: number , b: number ) { return a * b; }
function div(a: number , b: number ) { return a / b; }
```
or consolidate the repeated function signatures with a single function type:

```
type BinaryFn = (a: number , b: number ) => number ;
const add: BinaryFn = (a, b) => a + b;
const sub: BinaryFn = (a, b) => a - b;
const mul: BinaryFn = (a, b) => a * b;
const div: BinaryFn = (a, b) => a / b;
```
This has fewer type annotations than before, and they’re separated away from the

function implementations. This makes the logic more apparent. You’ve also gained a

check that the return type of all the function expressions is number.

Libraries often provide types for common function signatures. For example, the React

typings provide a MouseEventHandler type that you can apply to an entire function

rather than specifying MouseEvent as a type for the function’s parameter. If you’re a

library author, consider providing type declarations for common callbacks.

Another situation in which you should apply a type to a function expression is to

match the signature of some other function. In a web browser, for example, the fetch

function issues an HTTP request:

```
const response = fetch('/quote?by=Mark+Twain');
// ^? const response: Promise<Response>
```
You extract data from the response via response.json() or response.text():

```
async function getQuote() {
const response = await fetch('/quote?by=Mark+Twain');
const quote = await response.json();
return quote;
}
// {
// "quote": "If you tell the truth, you don't have to remember anything.",
// "source": "notebook",
// "date": "1894"
// }
```
(See Item 27 for more on Promises and async/await.)

There’s a bug here: if the request for /quote fails, the response body is likely to con‐

tain an explanation like “404 Not Found.” This isn’t JSON, so response.json() will

return a rejected Promise with a message about invalid JSON. This obscures the real

error, which was a 404.

```
Item 12: Apply Types to Entire Function Expressions When Possible | 57
```

It’s easy to forget that an error response with fetch does not result in a rejected

Promise. Let’s write a checkedFetch function to do the status check for us. The type

declarations for fetch in lib.dom.d.ts look like this:

```
declare function fetch(
input: RequestInfo, init?: RequestInit,
): Promise<Response>;
```
So you can write checkedFetch like this:

```
async function checkedFetch(input: RequestInfo, init?: RequestInit) {
const response = await fetch(input, init);
if (!response.ok) {
// An exception becomes a rejected Promise in an async function.
throw new Error(`Request failed: ${response.status}`);
}
return response;
}
```
This works, but it can be written more concisely:

```
const checkedFetch: typeof fetch = async (input, init) => {
const response = await fetch(input, init);
if (!response.ok) {
throw new Error(`Request failed: ${response.status}`);
}
return response;
}
```
We’ve changed from a function statement to a function expression and applied a type

(typeof fetch) to the entire function. This allows TypeScript to infer the types of the

input and init parameters.

The type annotation also guarantees that the return type of checkedFetch will be the

same as that of fetch. Had you written return instead of throw, for example, Type‐

Script would have caught the mistake:

```
const checkedFetch: typeof fetch = async (input, init) => {
// ~~~~~~~~~~~~
// 'Promise<Response | HTTPError>' is not assignable to 'Promise<Response>'
// Type 'Response | HTTPError' is not assignable to type 'Response'
const response = await fetch(input, init);
if (!response.ok) {
return new Error('Request failed: ' + response.status);
}
return response;
}
```
The same mistake in the first example would likely have led to an error, but in the

code that called checkedFetch, rather than in the implementation. In addition to

being more concise, typing this entire function expression instead of its parameters

has given you better safety.

**58 | Chapter 2: TypeScript’s Type System**


What if you want to match the parameter types of another function but change the

return type? This is possible using a rest parameter and the built-in Parameters util‐

ity type:

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
If you inspect fetchANumber in your editor, you’ll see that args doesn’t appear at all.

It’s replaced by the parameter names for fetch, which is exactly what you want:

```
fetchANumber
// ^? function fetchANumber(
// input: RequestInfo | URL, init?: RequestInit | undefined
// ): Promise<number>
```
The syntax here is a bit more cumbersome than applying a type to an entire function.

Use your judgment on whether it would be better to just write out the parameter

types. Item 62 will discuss rest parameters in the context of generic types.

While you may or may not be aware of it, you benefit from this technique whenever

you pass a callback to another function. When you use the map or filter method of

an Array, for example, TypeScript is able to infer a type for the callback parameter,

and it applies that type to your function expression. For more on how context is used

in type inference, see Item 24.

When you’re writing a function that has the same type signature as another one, or

writing many functions with the same type signature, consider whether you can apply

a type declaration to entire functions, rather than repeating types of parameters and

return values. The words “many” and “repeating” are important here. Don’t take this

to extremes! You don’t need to factor out a type for every function. For the common

case of a single, standalone function with a distinct type signature, an old-fashioned

function statement is just fine. Use function types when there are many functions

with the same or related type signatures.

**Things to Remember**

- Consider applying type annotations to entire function expressions, rather than to
    their parameters and return type.
- If you’re writing the same type signature repeatedly, factor out a function type or
    look for an existing one.

```
Item 12: Apply Types to Entire Function Expressions When Possible | 59
```

- If you’re a library author, provide types for common callbacks.
- Use typeof fn to match the signature of another function, or Parameters and a
    rest parameter if you need to change the return type.

### Item 13: Know the Differences Between type and interface

If you want to define a named type in TypeScript, you have two options. You can use

a type alias, as shown here:

```
type TState = {
name: string ;
capital: string ;
};
```
or define an interface:

```
interface IState {
name: string ;
capital: string ;
}
```
(You could also use a class, but that is a JavaScript runtime concept that also intro‐

duces a value. See Item 8.)

Which should you use, type or interface? The line between these two options has

become increasingly blurred over the years, to the point that in most situations you

can use either. You should be aware of the distinctions that remain between type and

interface and be consistent about which you use in which situation. But you should

also know how to write the same types using both, so that you’ll be comfortable read‐

ing TypeScript that uses either.

For new code where you need to pick a style, the general rule of thumb is to use

interface where possible, using type either where it’s required (e.g., union types) or

has a cleaner syntax (e.g., function types). We’ll get to the arguments for this toward

the end of this item, but for now let’s explore the similarities and differences between

these two constructs.

```
The examples in this item prefix type names with I or T solely to
indicate how they were defined. You should not do this in your
code! Prefixing interface types with I is common in C#, and this
convention made some inroads in the early days of TypeScript. But
it is considered bad style today because it’s unnecessary, adds little
value, and is not consistently followed in the standard libraries.
```
**60 | Chapter 2: TypeScript’s Type System**


First, the similarities: the two State types are nearly indistinguishable from one

another. If you define an IState or a TState value with an extra property, the errors

you get from excess property checking (Item 11) are character-by-character identical:

```
const wyoming: TState = {
name: 'Wyoming',
capital: 'Cheyenne',
population: 578_000
// ~~~~~~~ Object literal may only specify known properties,
// and 'population' does not exist in type 'TState'
};
```
You can use an index signature with both interface and type:

```
type TDict = { [key: string ]: string };
interface IDict {
[key: string ]: string ;
}
```
You can also define function types with either:

```
type TFn = (x: number ) => string ;
interface IFn {
(x: number ): string ;
}
type TFnAlt = {
(x: number ): string ;
};
```
```
const toStrT: TFn = x => '' + x; // OK
const toStrI: IFn = x => '' + x; // OK
const toStrTAlt: TFnAlt = x => '' + x; // OK
```
The first type alias form (TFn) looks more natural and is more concise for function

types. This is the preferred form and is the one you’re most likely to encounter in type

declarations. The latter two forms reflect the fact that functions in JavaScript are call‐

able objects. They are sometimes useful with overloaded function signatures

(Item 52).

Both type aliases and interfaces can be generic:

```
type TBox<T> = {
value: T;
};
interface IBox<T> {
value: T;
}
```
```
Item 13: Know the Differences Between type and interface | 61
```

An interface can extend a type (with some caveats, explained momentarily), and a

type can extend an interface:

```
interface IStateWithPop extends TState {
population: number ;
}
type TStateWithPop = IState & { population: number ; };
```
Again, these types are identical. The caveat is that an interface can only extend

object types that could have been defined with interface (even if you happened to

define them with type). You can’t extend a union type, for example. If you want to do

that, you’ll need to use type and &.

A class can implement either an interface or a simple type:

```
class StateT implements TState {
name: string = '';
capital: string = '';
}
class StateI implements IState {
name: string = '';
capital: string = '';
}
```
Finally, both type and interface can be recursive (Item 57).

Those are the similarities. What about the differences? You’ve seen one already—

there are union types but no union interfaces:

```
type AorB = 'a' | 'b';
```
An interface can extend some types, but not this one. Extending union types can

sometimes be useful. If you have separate types for Input and Output variables and a

mapping from name to variable:

```
type Input = { /* ... */ };
type Output = { /* ... */ };
interface VariableMap {
[name: string ]: Input | Output;
}
```
then you might want a type that attaches the name to the variable. This would be:

```
type NamedVariable = (Input | Output) & { name: string };
```
This type cannot be expressed with interface. A type is, in general, more capable

than an interface. It can be a union, and it can also take advantage of fancy type-

level features like mapped types (Item 15) and conditional types (Item 52).

**62 | Chapter 2: TypeScript’s Type System**


interface and extends give a bit more error checking than type and &:

```
interface Person {
name: string ;
age: string ;
}
```
```
type TPerson = Person & { age: number ; }; // no error, unusable type
```
```
interface IPerson extends Person {
// ~~~~~~~ Interface 'IPerson' incorrectly extends interface 'Person'.
// Types of property 'age' are incompatible.
// Type 'number' is not assignable to type 'string'.
age: number ;
}
```
It’s fine to change the type of a property in a subtype, so long it’s compatible with the

base type (see Item 7). Generally you want more safety checks, so this is a good rea‐

son to use extends with interfaces.

Type aliases are the natural way to express tuple and array types:

```
type Pair = [a: number , b: number ];
type StringList = string [];
type NamedNums = [ string , ... number []];
```
An interface does have some abilities that a type doesn’t, however. One of these is

that an interface can be augmented. Going back to the State example, you could

have added a population field in another way:

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
This is known as “declaration merging,” and it’s quite surprising if you’ve never seen it

before. This is primarily used with type declaration files (Chapter 8), and if you’re

writing one, you should follow the norms and use interface to support it. The idea

is that there may be gaps in your type declarations that users need to fill, and this is

how they do it. (Item 71 walks you through this process.)

```
Item 13: Know the Differences Between type and interface | 63
```

To understand why this unusual feature is useful, it’s instructive to look at how Type‐

Script itself uses declaration merging to model the different versions of JavaScript’s

standard library. The Array interface, for example, is defined in lib.es5.d.ts:

```
// lib.es5.d.ts
interface Array<T> {
/** Gets or sets the length of the array. */
length: number ;
// ...
[n: number ]: T;
}
```
If you set target to ES5 in your tsconfig.json (Item 2), then this is all you get. This

definition includes all the properties and methods that were available on arrays when

ES5 was published in 2009. But if you target ES2015, TypeScript will also include

lib.es2015.core.d.ts. This includes another declaration of the Array interface:

```
// lib.es2015.core.d.ts
interface Array<T> {
/** Returns the index of the first element in the array where predicate... */
findIndex(
predicate: (value: T, index: number , obj: T[]) => unknown ,
thisArg?: any
): number ;
```
```
// ... also find, fill, copyWithin
}
```
This declaration includes just the four new Array methods that were added in

ES2015: find, findIndex, fill, and copyWithin. They get added to the ES5 Array

interface via declaration merging. The net effect is that you get a single Array type

with exactly the right methods for the version of JavaScript that you’re targeting.

As the name implies, declaration merging makes the most sense in declaration files. It

can happen in user code, but only if the two interfaces are defined in the same

module (i.e., the same .ts file). This prevents accidental collisions with global inter

faces with generic-sounding names like Location and FormData.

Another difference is that TypeScript will always try to refer to an interface by its

name, whereas it takes more liberties replacing a type alias with its underlying defini‐

tion. You’ll sometimes see this in error messages and type display (Item 56) but it can

also affect concrete outputs such as .d.ts files, which TypeScript will emit if you set

declaration: true in your tsconfig.json.

For example, consider this function which returns an object statically typed using a

type alias with a limited scope:

```
export function getHummer() {
type Hummingbird = { name: string ; weightGrams: number ; };
const ruby: Hummingbird = { name: 'Ruby-throated', weightGrams: 3.4 };
```
**64 | Chapter 2: TypeScript’s Type System**


```
1 If you don’t see this error, make sure to set declaration: true set in your tsconfig.json.
```
```
return ruby;
};
```
```
const rubyThroat = getHummer();
// ^? const rubyThroat: Hummingbird
```
It’s interesting that TypeScript reports the type here using an out-of-scope type name

(Hummingbird). Even more interesting is what happens when you generate a .d.ts file

for this code:

```
// get-hummer.d.ts
export declare function getHummer(): {
name: string ;
weightGrams: number ;
};
```
Since there’s no function body in which to define the type alias (this is a type declara‐

tion file), TypeScript has elected to inline the type alias. The name is gone and only

the structure remains. Because the type system is structural (Item 4) this has no effect

on the values assignable to the type. But it does affect the display, and it affects the

generated .d.ts file. In some cases, this inlining behavior can cause duplication of

types extreme enough to affect compiler performance (Item 78).

Here’s what happens if you use an interface instead:

```
export function getHummer() {
// ~~~~~~~~~
// Return type of exported function has or is using private name 'Hummingbird'.
interface Hummingbird { name: string ; weightGrams: number ; };
const bee: Hummingbird = { name: 'Bee Hummingbird', weightGrams: 2.3 };
return bee;
};
```
Because Hummingbird is an interface, TypeScript wants to refer to it by name. But

the name isn’t available in the type declaration file, hence the error.^1 While the inlin‐

ing behavior may initially seem preferable here, it can lead to massive types and, as

Item 67 explains, it’s generally better to export your types anyway. The better solution

here is to keep the interface and make it a top-level export.

Returning to the question at the start of the item, should you use type or interface?

For complex types, you have no choice: you need to use a type alias. And for function

types, tuple types, and array types, the type syntax is more concise and natural than

the interface syntax. But what about simpler object types that can be represented

either way?

```
Item 13: Know the Differences Between type and interface | 65
```

If you’re working in a codebase with an established style, stick with that. You probably

won’t go too wrong.

For a new project without an established style, prefer interface. Your type name will

appear more consistently in error messages and type display, and you’ll get more

checks that you extend other interfaces correctly. Here’s what the official TypeScript

handbook has to say:

```
For the most part, you can choose based on personal preference, and TypeScript will
tell you if it needs something to be the other kind of declaration. If you would like a
heuristic, use interface until you need to use features from type.
```
In other words, use interface when you can and type when you must, or when it’s

more ergonomic. But don’t sweat it too much either way.

You can enforce consistent use of type or interface using typescript-eslint’s

consistent-type-definitions rule, which is part of the stylistic preset (it prefers

interface by default).

**Things to Remember**

- Understand the differences and similarities between type and interface.
- Know how to write the same types using either syntax.
- Be aware of declaration merging for interface and type inlining for type.
- For projects without an established style, prefer interface to type for object
    types.

### Item 14: Use readonly to Avoid Errors Associated with Mutation

Here’s some code to print the triangular numbers (1, 1 + 2 = 3, 1 + 2 + 3 = 6, etc.):

```
function printTriangles(n: number ) {
const nums = [];
for ( let i = 0; i < n; i++) {
nums.push(i);
console.log(arraySum(nums));
}
}
```
(We’ll get to the definition of arraySum shortly.)

This code appears straightforward, if inefficient, but here’s what happens when you

run it:

**66 | Chapter 2: TypeScript’s Type System**


```
> printTriangles(5);
0
1
2
3
4
```
Whoops! Those aren’t the numbers we were expecting. What went wrong? Let’s take a

look at my implementation of arraySum:

```
function arraySum(arr: number []) {
let sum = 0, num;
while ((num = arr.pop()) !== undefined ) {
sum += num;
}
return sum;
}
```
This function does calculate the sum of the numbers in the array. But it also has the

side effect of emptying the array! TypeScript is fine with this, because JavaScript

arrays are mutable. The problem is that printTriangles made an assumption about

arraySum, namely that it doesn’t modify nums.

Mutation is the root cause of many hard-to-find bugs. Mutable is the default in Java‐

Script, but TypeScript’s readonly modifier can help you catch and prevent surprise

mutations. Because it can prevent such a pernicious set of bugs, it’s worth learning

how to use this feature in your own code.

JavaScript primitives are already immutable. There are no methods on string,

number, or boolean that will mutate these values. (You may reassign a variable

declared with let to another primitive, but you are not changing the primitive value

itself.)

As you saw with the destructive arraySum function, arrays (and objects) very much

are mutable. This is where TypeScript’s readonly modifier comes in.

Placed on a property in an object type, readonly prevents assignments to that

property:

```
interface PartlyMutableName {
readonly first: string ;
last: string ;
}
```
```
const jackie: PartlyMutableName = { first: 'Jacqueline', last: 'Kennedy' };
jackie.last = 'Onassis'; // OK
jackie.first = 'Jacky';
// ~~~~~ Cannot assign to 'first' because it is a read-only property.
```
Typically, you’ll want to prevent assignments to all properties on an object. Type‐

Script provides a generic utility type, Readonly<T>, that does just that:

```
Item 14: Use readonly to Avoid Errors Associated with Mutation | 67
```

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
(Focus on the readonlys: the change from interface to type isn’t important here.)

If a function takes an object as a parameter and doesn’t modify it, it’s a good idea to

wrap that type in Readonly to advertise this to callers and enforce it in the

implementation.

There are two important caveats to know about with the readonly property modifier

and Readonly<T>. The first is that they are shallow. Just like a const declaration, a

readonly property cannot be reassigned but it can be mutated:

```
interface Outer {
inner: {
x: number ;
}
}
const obj: Readonly<Outer> = { inner: { x: 0 }};
obj.inner = { x: 1 };
// ~~~~~ Cannot assign to 'inner' because it is a read-only property
obj.inner.x = 1; // OK
```
You can create a type alias and then inspect it in your editor to see exactly what’s hap‐

pening:

```
type T = Readonly<Outer>;
// ^? type T = {
// readonly inner: {
// x: number;
// };
// }
```
The important thing to note is that there’s a readonly modifier on inner but not on

x. There is no built-in support for deep readonly types, but it is possible to write a

generic type to produce them. Getting this right is tricky, so I recommend using a

library rather than rolling your own. The DeepReadonly generic in ts-essentials is

one implementation.

The second caveat about Readonly is that it only affects properties. If you apply it to a

type with methods that mutate the underlying object, it won’t remove them:

```
const date: Readonly<Date> = new Date();
date.setFullYear(2037); // OK, but mutates date!
```
**68 | Chapter 2: TypeScript’s Type System**


If you want both a mutable and immutable version of a class, you’ll generally need to

separate them yourself. A great example of this in the standard library is the Array

and ReadonlyArray interfaces. Here’s what Array<T> looks like (in lib.es5.d.ts):

```
interface Array<T> {
length: number ;
// (non-mutating methods)
toString(): string ;
join(separator?: string ): string ;
// ...
// (mutating methods)
pop(): T | undefined ;
shift(): T | undefined ;
// ...
[n: number ]: T;
}
```
And here’s the corresponding immutable version, ReadonlyArray<T>:

```
interface ReadonlyArray<T> {
readonly length: number ;
// (non-mutating methods)
toString(): string ;
join(separator?: string ): string ;
// ...
readonly [n: number ]: T;
}
```
The key differences are that the mutating methods (such as pop and shift) aren’t

defined on ReadonlyArray, and the two properties, length and the index type ([n:

number]: T), have readonly modifiers. This prevents resizing the array and assigning

to elements in the array. (number as an index type isn’t something you should use in

your own code; see Item 17.)

Since both Array<T> and ReadonlyArray<T> are so common, they get a special syn‐

tax: T[] and readonly T[]. Because T[] is strictly more capable than readonly T[],

it follows that T[] is a subtype of readonly T[]. (It’s easy to get this backwards—

remember Item 7!)

So you can assign a mutable array to a readonly array, but not vice versa:

```
const a: number [] = [1, 2, 3];
const b: readonly number [] = a;
const c: number [] = b;
// ~ Type 'readonly number[]' is 'readonly' and cannot be
// assigned to the mutable type 'number[]'
```
This makes sense: the readonly modifier wouldn’t be much use if you could get rid of

it without even a type assertion.

```
Item 14: Use readonly to Avoid Errors Associated with Mutation | 69
```

Now we have the tools we need to improve the printTriangles and arraySum func‐

tions. If printTriangles wants to prevent arraySum from mutating the nums array, it

can pass it a readonly view:

```
function printTriangles(n: number ) {
const nums = [];
for ( let i = 0; i < n; i++) {
nums.push(i);
console.log(arraySum(nums as readonly number []));
// ~~~~~~~~~~~~~~~~~~~~~~~~~
// The type 'readonly number[]' is 'readonly' and cannot be
// assigned to the mutable type 'number[]'.
}
}
```
We can’t declare that nums is readonly number[] since we still need to mutate it. We

just want to make sure that arraySum doesn’t. Since it’s declared to take a mutable

array, we get a type error.

You can fix this by making it take a readonly array instead. Now we get a type error

in arraySum:

```
function arraySum(arr: readonly number []) {
let sum = 0, num;
while ((num = arr.pop()) !== undefined ) {
// ~~~ 'pop' does not exist on type 'readonly number[]'
sum += num;
}
return sum;
}
```
This error message makes sense in light of the Array and ReadonlyArray interfaces

that we saw earlier. pop exists on Array but not ReadonlyArray.

We can fix the type error in arraySum by not mutating the array:

```
function arraySum(arr: readonly number []) {
let sum = 0;
for ( const num of arr) {
sum += num;
}
return sum;
}
```
Now printTriangles does what you expect:

```
> printTriangles(5)
0
1
3
6
10
```
**70 | Chapter 2: TypeScript’s Type System**


When you give a parameter a read-only type (either readonly for an array or

Readonly for an object type), a few things happen:

- TypeScript checks that the parameter isn’t mutated in the function body.
- You advertise to callers that your function doesn’t mutate the parameter.
- Callers may pass your function a readonly array or Readonly object.

If your function does not mutate its parameters, then you should declare them

readonly. There’s relatively little downside: users will be able to call them with a

broader set of types (Item 30), and inadvertent mutations will be caught.

(Note that you can still reassign readonly parameters. They’re like variables declared

with let rather than const. Reassignment isn’t visible to the function’s caller, whereas

mutation is.)

One problem is that you may need to call functions that haven’t marked their param‐

eters readonly. If these functions don’t mutate their parameters and are in your con‐

trol, make them readonly! readonly tends to be contagious: once you mark one

function with readonly, you’ll also need to mark many of the functions that it calls.

This is a good thing since it leads to clearer contracts and better type safety. But if

you’re calling a function in another library, you may not be able to change its type

declarations. In this case, you’ll have to either resort to a type assertion (param as

number[]) or patch the type declarations (Item 71).

There is often an assumption in JavaScript (and TypeScript) that functions don’t

mutate their parameters unless explicitly noted. But as we’ll see time and again in this

book (particularly Items 31 and 33 ), these sorts of implicit understandings can lead to

trouble with type checking. Better to make them explicit, both for human readers and

for tsc.

**Things to Remember**

- If your function does not modify its parameters, declare them readonly (arrays)
    or Readonly (object types). This makes the function’s contract clearer and pre‐
    vents inadvertent mutations in its implementation.
- Understand that readonly and Readonly are shallow, and that Readonly only
    affects properties, not methods.
- Use readonly to prevent errors with mutation and to find the places in your code
    where mutations occur.
- Understand the difference between const and readonly: the former prevents
    reassignment, the latter prevents mutation.

```
Item 14: Use readonly to Avoid Errors Associated with Mutation | 71
```

### Item 15: Use Type Operations and Generic Types to Avoid Repeating Yourself

This script prints the dimensions, surface areas, and volumes of a few cylinders:

```
console.log(
'Cylinder r=1 × h=1',
'Surface area:', 6.283185 * 1 * 1 + 6.283185 * 1 * 1,
'Volume:', 3.14159 * 1 * 1 * 1
);
console.log(
'Cylinder r=1 × h=2',
'Surface area:', 6.283185 * 1 * 1 + 6.283185 * 2 * 1,
'Volume:', 3.14159 * 1 * 2 * 1
);
console.log(
'Cylinder r=2 × h=1',
'Surface area:', 6.283185 * 2 * 1 + 6.283185 * 2 * 1,
'Volume:', 3.14159 * 2 * 2 * 1
);
```
Is this code uncomfortable to look at? It should be. It’s extremely repetitive, as though

the same line was copied and pasted, then modified. It repeats both values and con‐

stants. This has allowed an error to creep in (did you spot it?).

Much better would be to factor out some functions, a constant, and a loop:

```
type CylinderFn = (r: number , h: number ) => number ;
const surfaceArea: CylinderFn = (r, h) => 2 * Math.PI * r * (r + h);
const volume: CylinderFn = (r, h) => Math.PI * r * r * h;
```
```
for ( const [r, h] of [[1, 1], [1, 2], [2, 1]]) {
console.log(
`Cylinder r=${r} × h=${h}`,
`Surface area: ${surfaceArea(r, h)}`,
`Volume: ${volume(r, h)}`);
}
```
With the formulas written out clearly, the bug is gone (the last example had an r*h

for the surface area instead of an r*r). This is the DRY principle: don’t repeat your‐

self. It’s the closest thing to universal advice that you’ll find in software development.

Yet developers who assiduously avoid repetition in code may not think twice about it

in types:

```
interface Person {
firstName: string ;
lastName: string ;
}
```
```
interface PersonWithBirthDate {
firstName: string ;
```
**72 | Chapter 2: TypeScript’s Type System**


```
lastName: string ;
birth: Date;
}
```
Duplication in types has many of the same problems as duplication in code. What if

you decide to add an optional middleName field to Person? Now Person and Person

WithBirthDate have diverged.

One reason that duplication is more common in types is that the mechanisms for fac‐

toring out shared patterns are less familiar than they are with code: what’s the type

system equivalent of factoring out a helper function? By learning how to map

between types, you can bring the benefits of DRY to your type definitions.

The simplest way to reduce repetition is by naming your types. Rather than writing a

distance function this way:

```
function distance(a: {x: number , y: number }, b: {x: number , y: number }) {
return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}
```
create a name for the type and use it:

```
interface Point2D {
x: number ;
y: number ;
}
function distance(a: Point2D, b: Point2D) { /* ... */ }
```
This is the type system equivalent of factoring out a constant instead of writing it

repeatedly. Duplicated types aren’t always so easy to spot. Sometimes they can be

obscured by syntax.

If several functions share the same type signature, for instance:

```
function get(url: string , opts: Options): Promise<Response> { /* ... */ }
function post(url: string , opts: Options): Promise<Response> { /* ... */ }
```
then you can follow the advice of Item 12 and factor out a named type for this

signature:

```
type HTTPFunction = (url: string , opts: Options) => Promise<Response>;
const get: HTTPFunction = (url, opts) => { /* ... */ };
const post: HTTPFunction = (url, opts) => { /* ... */ };
```
The CylinderFn type from the beginning of this item is another example of this.

What about the Person / PersonWithBirthDate example? You can eliminate the repe‐

tition by making one interface extend the other:

```
interface Person {
firstName: string ;
lastName: string ;
}
```
```
Item 15: Use Type Operations and Generic Types to Avoid Repeating Yourself | 73
```

```
interface PersonWithBirthDate extends Person {
birth: Date;
}
```
Now you only need to write the additional fields. If the two interfaces share a subset

of their fields, then you can factor out a base interface with just these common fields.

For example, rather than defining independent types for birds and mammals:

```
interface Bird {
wingspanCm: number ;
weightGrams: number ;
color: string ;
isNocturnal: boolean ;
}
interface Mammal {
weightGrams: number ;
color: string ;
isNocturnal: boolean ;
eatsGardenPlants: boolean ;
}
```
you might factor out a Vertebrate class with some of the shared properties:

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
Now if you change the base properties or add TSDoc comments to them (Item 68),

the changes will be reflected in both Bird and Mammal. Continuing the analogy with

code duplication, this is akin to writing PI and 2*PI instead of 3.141593 and

6.283185.

You can also use the intersection operator (&) to extend an existing type, though this

is somewhat less common:

```
type PersonWithBirthDate = Person & { birth: Date };
```
This technique is most useful when you want to add some additional properties to a

union type (which you cannot extend). For more on this, see Item 13.

You can also go the other direction. What if you have a type, State, which represents

the state of an entire application, and another, TopNavState, which represents just a

part?

**74 | Chapter 2: TypeScript’s Type System**


```
interface State {
userId: string ;
pageTitle: string ;
recentFiles: string [];
pageContents: string ;
}
interface TopNavState {
userId: string ;
pageTitle: string ;
recentFiles: string [];
// omits pageContents
}
```
Rather than building up State by extending TopNavState, you’d like to define TopNav

State as a subset of the fields in State. This way you can keep a single interface

defining the state for the entire app.

You can remove duplication in the types of the properties by indexing into State:

```
interface TopNavState {
userId: State['userId'];
pageTitle: State['pageTitle'];
recentFiles: State['recentFiles'];
};
```
While it’s longer, this is progress: a change in the type of pageTitle in State will get

reflected in TopNavState. But it’s still repetitive. You can do better with a mapped

type:

```
type TopNavState = {
[K in 'userId' | 'pageTitle' | 'recentFiles']: State[K]
};
```
Mousing over TopNavState shows that this definition is, in fact, exactly the same as

the previous one (see Figure 2-12).

Figure 2-12. Showing the expanded version of a mapped type in your text editor. This is

the same as the initial definition, but with less duplication.

Mapped types are the type system equivalent of looping over the fields in an array.

This particular pattern is so common that it’s part of the standard library, where it’s

called Pick:

```
Item 15: Use Type Operations and Generic Types to Avoid Repeating Yourself | 75
```

```
type Pick<T, K> = { [k in K]: T[k] };
```
(This definition isn’t quite complete. We’ll revisit it in Item 50.) You use it like this:

```
type TopNavState = Pick<State, 'userId' | 'pageTitle' | 'recentFiles'>;
```
Pick is an example of a generic type. Continuing the analogy to removing code dupli‐

cation, using Pick is the equivalent of calling a function. Pick takes two types, T and

K, and returns a third, much as a function might take two values and return a third.

Chapter 6 is all about programming at the type level, and Item 50 explores the idea of

generic types as “functions on types.”

Another form of duplication can arise with tagged unions. What if you want a type

for just the tag?

```
interface SaveAction {
type : 'save';
// ...
}
interface LoadAction {
type : 'load';
// ...
}
type Action = SaveAction | LoadAction;
type ActionType = 'save' | 'load'; // Repeated types!
```
You can define ActionType without repeating yourself by indexing into the Action

union:

```
type ActionType = Action['type'];
// ^? type ActionType = "save" | "load"
```
As you add more types to the Action union, ActionType will incorporate them auto‐

matically. This type is distinct from what you’d get using Pick, which would give you

an interface with a type property:

```
type ActionRecord = Pick<Action, 'type'>;
// ^? type ActionRecord = { type: "save" | "load"; }
```
If you’re defining a class that can be initialized and later updated, the type for the

parameter to the update method might optionally include most of the same parame‐

ters as the constructor:

```
interface Options {
width: number ;
height: number ;
color: string ;
label: string ;
}
interface OptionsUpdate {
width?: number ;
height?: number ;
color?: string ;
```
**76 | Chapter 2: TypeScript’s Type System**


```
label?: string ;
}
class UIWidget {
constructor (init: Options) { /* ... */ }
update(options: OptionsUpdate) { /* ... */ }
}
```
You can construct OptionsUpdate from Options using a mapped type and keyof:

```
type OptionsUpdate = {[k in keyof Options]?: Options[k]};
```
keyof takes a type and gives you a union of the types of its keys:

```
type OptionsKeys = keyof Options;
// ^? type OptionsKeys = keyof Options
// (equivalent to "width" | "height" | "color" | "label")
```
The mapped type ([k in keyof Options]) iterates over these and looks up the cor‐

responding value type in Options. The? makes each property optional. This pattern

is also very common and is included in the standard library as Partial:

```
class UIWidget {
constructor (init: Options) { /* ... */ }
update(options: Partial<Options>) { /* ... */ }
}
```
Mapped types have a few other tricks up their sleeve. You can include an as clause in

them to rename the keys. There are many uses for this, but one is to invert the keys

and values in a mapping:

```
interface ShortToLong {
q: 'search';
n: 'numberOfResults';
}
type LongToShort = { [k in keyof ShortToLong as ShortToLong[k]]: k };
// ^? type LongToShort = { search: "q"; numberOfResults: "n"; }
```
This works particularly well with template literal types, which let you manipulate

string literal types at the type level. These are the subject of Item 54.

If the index clause in your mapped type is of the form K in keyof T or a few variants

on it, then TypeScript treats it as a “homomorphic” mapped type. This means that

modifiers (like readonly and? for optional) and documentation are transferred over

to the new type:

```
interface Customer {
/** How the customer would like to be addressed. */
title?: string ;
/** Complete name as entered in the system. */
readonly name: string ;
}
```
```
type PickTitle = Pick<Customer, 'title'>;
```
```
Item 15: Use Type Operations and Generic Types to Avoid Repeating Yourself | 77
```

```
// ^? type PickTitle = { title?: string; }
type PickName = Pick<Customer, 'name'>;
// ^? type PickName = { readonly name: string; }
type ManualName = { [K in 'name']: Customer[K]; };
// ^? type ManualName = { name: string; }
```
In this case, Pick is a homomorphic mapped type and preserves the optional and

readonly modifiers. The ManualName mapped type does not use a keyof expression,

so it is not homomorphic and it does not transfer modifiers. If you define a value

using one of the homomorphic types, you’ll see that the documentation has been

transferred over as well (Figure 2-13).

Figure 2-13. The TSDoc documentation has been copied over to the homomorphic map‐

ped type.

Another curious behavior of homomorphic mapped types is that they allow primitive

(nonobject) types to pass through unmodified:

```
type PartialNumber = Partial< number >;
// ^? type PartialNumber = number
```
This looks a bit odd, but it can be convenient when you’re building generic types of

your own, as we’ll see in Item 56.

As you define mapped types, think about whether they are homomorphic and

whether you would like them to be.

You may also find yourself wanting to define a type that matches the shape of a value:

```
const INIT_OPTIONS = {
width: 640,
height: 480,
color: '#00FF00',
label: 'VGA',
};
interface Options {
width: number ;
height: number ;
color: string ;
label: string ;
}
```
**78 | Chapter 2: TypeScript’s Type System**


You can do so with typeof:

```
type Options = typeof INIT_OPTIONS;
```
This intentionally looks like JavaScript’s runtime typeof operator, but it operates at

the level of TypeScript types and is much more precise. For more on typeof, see Item

8. Be careful about deriving types from values, however. It’s typically better to define

types first and declare that values are assignable to them. This makes your types more

explicit and less subject to the vagaries of widening (Item 20).

The canonical use case for typeof is if you have a single value that you’d like to be the

source of truth for a type (perhaps it’s some kind of schema or API specification). By

making the value the source of truth, you avoid duplication in defining the type.

Similarly, you may want to create a named type for the inferred return value of a

function or method:

```
function getUserInfo(userId: string ) {
// ...
return {
userId,
name,
age,
height,
weight,
favoriteColor,
};
}
// Return type inferred as { userId: string; name: string; age: number, ... }
```
Doing this directly requires conditional types (see Item 52). But, as we’ve seen before,

the standard library defines generic types for common patterns like this one. In this

case the ReturnType generic does exactly what you want:

```
type UserInfo = ReturnType< typeof getUserInfo>;
```
Note that ReturnType operates on typeof getUserInfo, the function’s type, rather

than getUserInfo, the function’s value. As with typeof, use this technique judi‐

ciously. Don’t get mixed up about your source of truth.

As you factor out repetition in your types, don’t go overboard. Just because two type

declarations share the same characters in source code doesn’t necessarily mean they’re

the same thing. For example, these two types share some common properties:

```
interface Product {
id: number ;
name: string ;
priceDollars: number ;
}
interface Customer {
id: number ;
```
```
Item 15: Use Type Operations and Generic Types to Avoid Repeating Yourself | 79
```

```
2 Sandi Metz, “All the Little Things”, RailsConf 2014.
```
```
name: string ;
address: string ;
}
```
But this wouldn’t be a wise refactor:

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
This is because while the id and name properties happen to have the same name and

type, they’re not referring to the same thing. In the future you might change one id to

be a string but not the other. Or you might split the customer name into firstName

and lastName, which wouldn’t make sense for a product. In this case, factoring out

the common base interface is a premature abstraction which may make it harder for

the two types to evolve independently in the future.

A good rule of thumb is that if it’s hard to name a type (or a function), then it may

not be a useful abstraction. In this case, NamedAndIdentified just describes the struc‐

ture of the type, not what it is. The Vertebrate type from before, on the other hand,

is meaningful on its own. Remember, “duplication is far cheaper than the wrong

abstraction.”^2

Repetition and copy/paste coding are just as bad in type space as they are in value

space. The constructs you use to avoid repetition in type space may be less familiar

than those used for program logic, but they are worth the effort to learn. Don’t repeat

yourself!

**Things to Remember**

- The DRY (don’t repeat yourself ) principle applies to types as much as it applies to
    logic.
- Name types rather than repeating them. Use extends to avoid repeating fields in
    interfaces.

**80 | Chapter 2: TypeScript’s Type System**


- Build an understanding of the tools provided by TypeScript to map between
    types. These include keyof, typeof, indexing, and mapped types.
- Generic types are the equivalent of functions for types. Use them to map between
    types instead of repeating type-level operations.
- Familiarize yourself with generic types defined in the standard library, such as
    Pick, Partial, and ReturnType.
- Avoid over-application of DRY: make sure the properties and types you’re shar‐
    ing are really the same thing.

### Item 16: Prefer More Precise Alternatives to Index Signatures

One of the best features of JavaScript is its convenient syntax for creating objects:

```
const rocket = {
name: 'Falcon 9',
variant: 'Block 5',
thrust: '7,607 kN',
};
```
Objects in JavaScript map string (or symbol) keys to values of any type. TypeScript

lets you represent flexible mappings like this by specifying an index signature on the

type:

```
type Rocket = {[property: string ]: string };
const rocket: Rocket = {
name: 'Falcon 9',
variant: 'v1.0',
thrust: '4,940 kN',
}; // OK
```
The [property: string]: string is the index signature. It specifies three things:

A name for the keys

This is purely for documentation; it is not used by the type checker in any way.

A type for the key

```
This needs to be a subtype of string | number | symbol (aka PropertyKey).
Typically it’s string or a subtype of string such as a union of string literals.
number indexes are best avoided, as you’ll see in Item 17. symbol is rare in appli‐
cation code.
```
A type for the values

This can be anything.

```
Item 16: Prefer More Precise Alternatives to Index Signatures | 81
```

While this code does type check, it has a few downsides:

- It allows any keys, including incorrect ones. Had you written Name instead of
    name, it would have still been a valid Rocket type.
- It doesn’t require any specific keys to be present. {} is also a valid Rocket.
- It cannot have distinct types for different keys. For example, we might want
    thrust to be a number rather than a string.
- TypeScript’s language services can’t help you with types like this. As you’re typing
    name:, there’s no autocomplete because the key could be anything.

In short, index signatures are not very precise. There are almost always better alterna‐

tives to them. In this case, Rocket could be an interface:

```
interface Rocket {
name: string ;
variant: string ;
thrust_kN: number ;
}
const falconHeavy: Rocket = {
name: 'Falcon Heavy',
variant: 'v1',
thrust_kN: 15200,
};
```
Now thrust_kN is a number and TypeScript will check for the presence of all required

fields. All the great language services that TypeScript provides are available: autocom‐

plete, jump to definition, and rename.

What should you use index signatures for? Historically, they were the best way to

model truly dynamic data. This might come from a CSV file, for instance, where you

have a header row and want to represent data rows as objects mapping column names

to values:

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
There’s no way to know in advance what the column names are in such a general set‐

ting, so there’s no way to get a more precise type. If the user of parseCSV knows more

**82 | Chapter 2: TypeScript’s Type System**


about what the columns are in a particular context, they could use an assertion to get

more specific:

```
interface ProductRow {
productId: string ;
name: string ;
price: string ;
}
```
```
declare let csvData: string ;
const products = parseCSV(csvData) as unknown [] as ProductRow[];
```
Of course, there’s no guarantee that the columns at runtime will actually match your

expectation. You can guard against this possibility by changing the value type to

string|undefined or by setting the noUncheckedIndexedAccess compiler option

(see Item 48).

But a better way to model dynamic data is by using a Map type, also known as an asso‐

ciative array. Here’s how you might implement parseCSV using a Map:

```
function parseCSVMap(input: string ): Map< string , string >[] {
const lines = input.split('\n');
const [headerLine, ...rows] = lines;
const headers = headerLine.split(',');
return rows.map(rowStr => {
const row = new Map< string , string >();
rowStr.split(',').forEach((cell, i) => {
row.set(headers[i], cell);
});
return row;
});
}
```
Now the fields have to be accessed using the get method, and the result always

includes undefined as a possibility:

```
const rockets = parseCSVMap(csvData);
const superHeavy = rockets[2];
const thrust_kN = superHeavy.get('thrust_kN'); // 74,500
// ^? const thrust_kN: string | undefined
```
If you want to get an object type out of a Map, you’ll need to write some parsing code:

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
```
Item 16: Prefer More Precise Alternatives to Index Signatures | 83
```

```
const rockets = parseCSVMap(csvData).map(parseRocket);
// ^? const rockets: Rocket[]
```
While this may feel tedious, it does ensure that your data actually has the shape you

expect. This will flag errors when you load your data, rather than at some later point

when you try to use it. This pattern of doing data validation on a broad type

(Map<string, string>) to get a more specific one (Rocket) is common in Type‐

Script. Item 74 will explore more systematic ways of doing runtime type validation.

In addition to being a better model of dynamic data, Maps work around some famous

gotchas involving the prototype chain.

If your type has a limited set of possible fields, don’t model this with an index signa‐

ture. For instance, if you know your data will have keys like A, B, C, D, but you don’t

know how many of them there will be, you could model the type either with optional

fields or a union:

```
interface Row1 { [column: string ]: number } // Too broad
interface Row2 { a: number ; b?: number ; c?: number ; d?: number } // Better
type Row3 =
| { a: number ; }
| { a: number ; b: number ; }
| { a: number ; b: number ; c: number ; }
| { a: number ; b: number ; c: number ; d: number }; // Also better
```
The last form is the most precise, but it may be less convenient to work with. See Item

29 for more on crafting types to disallow invalid states.

If the problem with using an index signature is that string is too broad, then you can

use a Record. This is a generic type that gives you more flexibility in the key type. In

particular, you can pass in subsets of string:

```
type Vec3D = Record<'x' | 'y' | 'z', number >;
// ^? type Vec3D = {
// x: number;
// y: number;
// z: number;
// }
```
Record is a built-in wrapper around a mapped type (Item 15).

Finally, you can use an index type to disable excess property checking (Item 11). For

example, you might define a few known properties on a ButtonProps type but still

want to allow it to have any others:

```
declare function renderAButton(props: ButtonProps): void ;
interface ButtonProps {
title: string ;
onClick: () => void ;
}
```
**84 | Chapter 2: TypeScript’s Type System**


```
renderAButton({
title: 'Roll the dice',
onClick: () => alert(1 + Math.floor(6 * Math.random())),
theme: 'Solarized',
// ~~~~ Object literal may only specify known properties...
});
```
Adding an index signature makes this error go away:

```
interface ButtonProps {
title: string ;
onClick: () => void ;
[otherProps: string ]: unknown ;
}
```
```
renderAButton({
title: 'Roll the dice',
onClick: () => alert(1 + Math.floor(20 * Math.random())),
theme: 'Solarized', // ok
});
```
Crucially, both title and onClick still have the same types as before. Passing a

number as the title will result in a type error.

You can also constrain these additional properties to match a certain pattern. For

example, some web components allow arbitrary properties but only if they start with

"data-". You can model this using an index signature and a template literal type.

Item 54 will show you how.

In conclusion, think twice before you add an index signature to your data type. Is

there a more precise alternative available? Could you use an interface without an

index type? Could you use a Map instead? A mapped type? If nothing else, can you at

least constrain the type of the keys?

**Things to Remember**

- Understand the drawbacks of index signatures: much like any, they erode type
    safety and reduce the value of language services.
- Prefer more precise types to index signatures when possible: interfaces, Map,
    Records, mapped types, or index signatures with a constrained key space.

### Item 17: Avoid Numeric Index Signatures

JavaScript is a famously quirky language. Some of the most notorious quirks involve

implicit type coercions:

```
> "0" == 0
true
```
```
Item 17: Avoid Numeric Index Signatures | 85
```

These can usually be avoided by using === and !== instead of their more coercive

cousins.

JavaScript’s object model also has its quirks, and these are more important to under‐

stand because some of them are modeled by TypeScript’s type system. You’ve already

seen one such quirk in Item 10, which discussed object wrapper types. This item dis‐

cusses another.

What is an object? In JavaScript it’s a collection of key/value pairs. The keys are usu‐

ally strings (in ES2015 and later they can also be symbols). The values can be

anything.

This is more restrictive than what you find in many other languages. JavaScript does

not have a notion of “hashable” objects like you find in Python or Java. If you try to

use a more complex object as a key, it is converted into a string by calling its toString

method:

```
> x = {}
{}
> x[[1, 2, 3]] = 2
2
> x
{ '1,2,3': 2 }
```
In particular, numbers cannot be used as keys. If you try to use a number as a prop‐

erty name, the JavaScript runtime will convert it to a string:

```
> { 1: 2, 3: 4}
{ '1': 2, '3': 4 }
```
So what are arrays, then? They are certainly objects:

```
> typeof []
'object'
```
And yet it’s quite normal to use numeric indices with them:

```
> x = [1, 2, 3]
[ 1, 2, 3 ]
> x[0]
1
```
Are these being converted into strings? In one of the oddest quirks of all, the answer

is “yes.” You can also access the elements of an array using string keys:

```
> x['1']
2
```
If you use Object.keys to list the keys of an array, you get strings back:

```
> Object.keys(x)
[ '0', '1', '2' ]
```
**86 | Chapter 2: TypeScript’s Type System**


TypeScript models this by allowing numeric keys and distinguishing between these

and strings. If you dig into the type declarations for Array ( Item 6), you’ll find this in

lib.es5.d.ts:

```
interface Array<T> {
// ...
[n: number ]: T;
}
```
This is purely a fiction—string keys are accepted at runtime as the ECMAScript stan‐

dard dictates that they must—but it is a helpful one that can catch mistakes:

```
const xs = [1, 2, 3];
const x0 = xs[0]; // OK
const x1 = xs['1']; // stringified numeric constants are also OK
```
```
const inputEl = document.getElementsByTagName('input')[0];
const xN = xs[inputEl.value];
// ~~~~~~~~~~~~~ Index expression is not of type 'number'.
```
In this case, inputEl.valueAsNumber would be more appropriate and would fix the

type error.

While the fiction of numeric keys is helpful, it’s important to remember that it is just

a fiction. Like all aspects of TypeScript’s type system, it is erased at runtime (Item 3).

This means that constructs like Object.keys still return strings:

```
const keys = Object.keys(xs);
// ^? const keys: string[]
```
The pattern here is that a number index signature means that what you put in gener‐

ally has to be a number, but what you get out is a string.

If this sounds confusing, it’s because it is! As a general rule, there’s not much reason to

use number as the index signature of a type. If you want to specify something that will

be indexed using numbers, you probably want to use an Array or tuple type instead.

Using number as an index type can create the misconception that numeric properties

are a real thing in JavaScript, either for yourself or for readers of your code.

If you object to accepting an Array type because they have many other properties

(from their prototype) that you might not use, such as push and concat, then that’s

good—you’re thinking structurally! (If you need a refresher on this, refer to Item 4.)

If you truly want to accept tuples of any length or any array-like construct, TypeScript

has an ArrayLike type you can use:

```
function checkedAccess<T>(xs: ArrayLike<T>, i: number ): T {
if (i >= 0 && i < xs.length) {
return xs[i];
}
throw new Error(`Attempt to access ${i} which is past end of array.`)
}
```
```
Item 17: Avoid Numeric Index Signatures | 87
```

(TypeScript also has a noUncheckedIndexedAccess option you can set for safe array

access. See Item 48.)

ArrayLike has just a length and numeric index signature. As the name implies, this

allows array-like structures such as a NodeList to be passed in. In the rare cases that

this is what you want, you should use it instead of a normal array. But remember that

the keys are still really strings!

```
const tupleLike: ArrayLike< string > = {
'0': 'A',
'1': 'B',
length: 2,
}; // OK
```
If you just need something you can iterate over, you can use the Iterable type

instead, which allows you to pass generator expressions to your function (see Item

30 ).

Object keys in JavaScript (and TypeScript) are either strings or symbols. Numeric

index types are best thought of as a concession to make the Array type convenient to

use in TypeScript. But remember that numeric indices aren’t real. Avoid using them

in your own types.

**Things to Remember**

- Understand that arrays are objects, so their keys are strings, not numbers. number
    as an index signature is a purely TypeScript construct designed to help catch
    bugs.
- Prefer Array, tuple, ArrayLike, or Iterable types to using number in an index
    signature yourself.

**88 | Chapter 2: TypeScript’s Type System**


