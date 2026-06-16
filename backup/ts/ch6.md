**CHAPTER 6**

### Generics and Type-Level Programming

TypeScript’s type system is designed to model the runtime behavior of JavaScript

code. Because JavaScript is so dynamic and permissive, this has pushed TypeScript’s

type system to develop increasingly powerful capabilities. As Item 15 explained, this

includes logic for mapping between types.

When you add generic type aliases to the mix, TypeScript’s type system becomes pow‐

erful enough that you can think of it as its own independent programming language.

(TypeScript’s type system is Turing Complete, so this is true in a formal sense.) Rather

than programming with values, as you do in JavaScript, you’re now programming

with types. In other words, type-level programming. This is distinct from metaprog‐

ramming (writing programs that operate on programs), though the two terms are

sometimes conflated.

Learning new languages is fun, and you can find all sorts of wild applications built

using TypeScript’s type system, ranging from games to SQL parsers. This has been

driven in part by the Type Challenges project, which includes hundreds of increas‐

ingly difficult puzzles to solve in the type system. Solving these as you read this chap‐

ter is a great way to cement what you’ve learned.

This chapter also includes a few cautionary notes. Just because TypeScript includes a

programming language for types doesn’t mean it’s a particularly intuitive, ergonomic,

or pleasant language to work with. Just because you can write logic at the type level

doesn’t mean it’s always a good idea. Overuse of generic types can lead to cryptic,

hard-to-maintain code. Josh Goldberg puts it well in Learning TypeScript (O’Reilly):

```
Although generics can give us a lot of flexibility in describing types in code, they can
become rather complex quite quickly. Programmers new to TypeScript often go
through a phase of overusing generics to the point of making code confusing to read
and overly complex to work with. TypeScript best practice is generally to use generics
only when necessary, and to be clear about what they’re used for when they are.
```
##### 215


This chapter will help you decide whether it’s necessary to use generic types and

presents some alternatives. Used well, type-level code can improve other developers’

experiences without their ever needing to know that there’s fancy type-level code

involved.

### Item 50: Think of Generics as Functions Between Types

Item 15 showed how you can use type operations (extends, mapped types, indexing,

keyof) to reduce repetition between related types. In value-land, functions are one of

the key ways to factor out repeated code. In type-land, the equivalent of a function is

a generic type. A generic type takes one or more type parameters and produces a con‐

crete, nongeneric type. Whereas you “call” a function, you “instantiate” a generic type.

The built-in Partial generic type makes all the properties of another type optional.

Here’s how you might define that yourself:

```
type MyPartial<T> = {[K in keyof T]?: T[K]};
```
Here T is the type parameter. You can see that this works exactly the same as the built-

in Partial type:

```
interface Person {
name: string ;
age: number ;
}
```
```
type MyPartPerson = MyPartial<Person>;
// ^? type MyPartPerson = { name?: string; age?: number; }
```
```
type PartPerson = Partial<Person>;
// ^? type PartPerson = { name?: string; age?: number; }
```
By defining this generic type, we’ve encapsulated the type-level operations required to

optionalize all the properties on another type. This is exactly analogous to how a

function might encapsulate the logic of taking one value and producing another. You

don’t need to know the details of how Math.cos is implemented to know that it calcu‐

lates the cosine of a number.

You can write generic types that take multiple type parameters. Here’s how you might

try to define the equivalent of the built-in Pick generic:

```
type MyPick<T, K> = {
[P in K]: T[P]
// ~ Type 'K' is not assignable to type 'string | number | symbol'.
// ~~~~ Type 'P' cannot be used to index type 'T'.
};
```
**216 | Chapter 6: Generics and Type-Level Programming**


Even when you’re programming at the type level, TypeScript applies all the same tools

of static analysis to check for assignability and other errors in your code. Here it’s

found two problems:

- We’re mapping over K, but TypeScript has no reason to believe that it contains
    types that can be used as property keys, namely string, number, or symbol.
- Even if it were a valid property key, TypeScript has no reason to believe that P can
    be used to index into T. T might not be an object type, and it might not have that
    key.

There are many ways to deal with type-level errors, just as there are many ways to

deal with type errors in nongeneric code. Perhaps the simplest is to ignore them. This

works surprisingly well!

```
// @ts-expect-error (don't do this!)
type MyPick<T, K> = { [P in K]: T[P] };
type AgeOnly = MyPick<Person, 'age'>;
// ^? type AgeOnly = { age: number; }
```
You can think of this as the type-level equivalent of TypeScript emitting JavaScript,

even in the presence of type errors (Item 3). Just because it doesn’t like your imple‐

mentation of a generic type doesn’t mean that TypeScript won’t let you use it.

Of course, TypeScript is right to complain. This version of MyPick is quite error

prone:

```
type FirstNameOnly = MyPick<Person, 'firstName'>;
// ^? type FirstNameOnly = { firstName: unknown; }
type Flip = MyPick<'age', Person>;
// ^? type Flip = {}
```
Rather than getting a type error, incorrect uses of MyPick just return the wrong type.

It’s almost like programming in JavaScript!

Another way to make the error go away is to add intersections with the types that

TypeScript is expecting. Here’s what that looks like:

```
type MyPick<T, K> = { [P in K & PropertyKey]: T[P & keyof T] };
```
```
type AgeOnly = MyPick<Person, 'age'>;
// ^? type AgeOnly = { age: number; }
type FirstNameOnly = MyPick<Person, 'firstName'>;
// ^? type FirstNameOnly = { firstName: never; }
```
PropertyKey is a built-in alias for string | number | symbol. You can think of this

sort of intersection as a kind of type-level equivalent of as any. It has made the type

errors in the implementation go away and left the correct uses unchanged. The incor‐

rect uses come out slightly differently, and this is perhaps an improvement: never is

often an indication that something has gone wrong.

```
Item 50: Think of Generics as Functions Between Types | 217
```

```
1 This name makes more sense if you’re coming from the C++ world, where generic types are known as “tem‐
plate types” and developers talk about “template metaprogramming.”
```
But keeping with the analogy, as any is rarely the right choice in value-land, and

these intersections are not typically the best choice at the type level, either. You often

solve type errors by making a function accept a narrower type for its parameters, and

that’s exactly what we want to do here. You can add a constraint on type parameters

using the extends keyword:

```
type MyPick<T extends object, K extends keyof T> = {[P in K]: T[P]};
```
```
type AgeOnly = MyPick<Person, 'age'>;
// ^? type AgeOnly = { age: number; }
type FirstNameOnly = MyPick<Person, 'firstName'>;
// ~~~~~~~~~~~
// Type '"firstName"' does not satisfy the constraint 'keyof Person'.
type Flip = MyPick<'age', Person>;
// ~~~~~ Type 'string' does not satisfy the constraint 'object'.
```
By constraining T to be an object type and constraining K to be a subtype of the keys

of T, we’ve solved two problems at once: we’ve eliminated the type errors in the imple‐

mentation and we’ve produced type errors on the invalid instantiations of MyPick.

When you have noImplicitAny set, TypeScript requires that you provide type anno‐

tations for all function parameters. There’s no equivalent of this for type parameters.

If you don’t specify a constraint, it defaults to unknown, which allows users to pass in

any type whatsoever. When you’re defining a generic type, consider whether you want

to give your users a bit less freedom and a bit more safety.

When you write a function, you choose descriptive parameter names and write

TSDoc comments (Item 68). You should do that for generic types as well. There’s a

convention of using one-letter names for type parameters (as this item has), but you

should be just as wary of these in type-level code as you would be of one-letter vari‐

able names.

The general rule of thumb in naming is that the length of a name should match its

scope. Long-lived globals should have long, descriptive names, whereas short names

like i, k, or v can actually improve legibility in a concise arrow function with limited

scope. For a short generic like MyPick, T and K are fine. But for a longer definition

where the type parameter has broader scope (a generic class, say), a longer, more

meaningful name will improve clarity.

You can write TSDoc for generic types and the TypeScript language service will sur‐

face it in relevant situations, just as it would for functions. The type-level equivalent

of @param is @template:^1

**218 | Chapter 6: Generics and Type-Level Programming**


##### /**

```
* Construct a new object type using a subset of the properties of another one
* (same as the built-in `Pick` type).
* @template T The original object type
* @template K The keys to pick, typically a union of string literal types.
*/
type MyPick<T extends object, K extends keyof T> = {
[P in K]: T[P]
};
```
If you inspect MyPick at an instantiation site, you’ll get the full documentation. And if

you mouse over T or K in the definition, you’ll see the documentation for just that

type parameter (Figure 6-1).

Figure 6-1. The _@template_ TSDoc tag can be used to document a type parameter.

TypeScript types are best thought of as sets of values (Item 7), so generic types inher‐

ently operate on sets. This is quite distinct from JavaScript functions where you know

that each parameter will have a single value every time the function is called. In prac‐

tice this means that you always need to think about how your generic type will behave

with union types. Item 53 shows you how to do this.

You write tests for your value-level code, what about for your type-level code? You

absolutely should test your types! This is an interesting and deep enough topic that it

warrants its own item. Check out Item 55.

You can also add type parameters to some value-level constructs such as functions

and classes. We might accompany our Pick generic type with a corresponding pick

function, for example:

```
function pick<T extends object, K extends keyof T>(
obj: T, ...keys: K[]
): Pick<T, K> {
const picked: Partial<Pick<T, K>> = {};
for ( const k of keys) {
picked[k] = obj[k];
}
return picked as Pick<T, K>;
}
```
```
Item 50: Think of Generics as Functions Between Types | 219
```

```
const p: Person = { name: 'Matilda', age: 5.5 };
const age = pick(p, 'age');
// ^? const age: Pick<Person, "age">
console.log(age); // logs { age: 5.5 }
```
Just looking at the type and ignoring the bits between the parentheses, this looks a lot

like the definition of the MyPick type from earlier:

```
type P = typeof pick;
// ^? type P = <T extends object, K extends keyof T>(
// obj: T, ...keys: K[]
// ) => Pick<T, K>
```
You can think of generic functions as conceptually defining an associated generic

type. The beauty of generic functions, however, is that TypeScript can often infer the

type parameters from the values when the function is called. In the previous example,

we just wrote pick(p, 'age'). This is significantly more concise than (and produces

the exact same results as) writing out the types explicitly:

```
const age = pick<Person, 'age'>(p, 'age');
// ^? const age: Pick<Person, "age">
```
Another advantage is that the user of your pick function needn’t know that they’re

working with generic types or type-level operations at all. They can just enjoy the

accurate, precise types. The type of age is a hint that there’s type-level programming

at work, but this, too, can be hidden if you like. Item 56 shows how.

Classes can also take type parameters, and these, too, can be inferred from usage:

```
class Box<T> {
value: T;
constructor (value: T) {
this .value = value;
}
}
```
```
const dateBox = new Box( new Date());
// ^? const dateBox: Box<Date>
```
Recall from Item 8 that class is one of the few constructs in TypeScript that introdu‐

ces both a type and a value. For a generic class, it introduces a generic type that relates

the type parameter (T) to the properties and methods of that class.

Just as classes are good at capturing related bits of state that you’d otherwise have to

track yourself, generic classes are a good way to capture types. A generic class’s type

parameters are set when it’s constructed and they don’t need to be passed to its meth‐

ods when you call them (though its methods can have type parameters of their own).

Item 28 explored how this could be used to gain more fine-grained control over type

inference.

**220 | Chapter 6: Generics and Type-Level Programming**


In value-land, you can write “higher order functions” like map, filter, and reduce

that take other functions as parameters. This gives you enormous flexibility to factor

out shared behaviors. Is there a type-level equivalent of these?

At the time of this writing, the answer is no. These would be “functions on functions

on types” or “higher-kinded types” as they’re usually known. They would let you fac‐

tor out common operations, like applying a generic type to the value types in an

object:

```
type MapValues<T extends object, F> = {
[K in keyof T]: F<T[K]>;
// ~~~~~~~ Type 'F' is not generic.
};
```
The good news is that this doesn’t limit what you can do with generic types. It only

limits the way you express yourself. In this case, you need to use a mapped type

instead of MapValues. Similarly, there’s no such thing as an anonymous generic type.

Generic types are best thought of as functions between types. Keep this in mind as

you write them. You’re working at the type level now and it’s exciting and new. But

you’re still coding, and all the best practices you’ve learned for writing value-level

code still apply.

**Things to Remember**

- Think of generic types as functions between types.
- Use extends to constrain the domain of type parameters, just as you’d use a type
    annotation to constrain a function parameter.
- Choose type parameter names that increase the legibility of your code, and write
    TSDoc for them.
- Think of generic functions and classes as conceptually defining generic types that
    are conducive to type inference.

### Item 51: Avoid Unnecessary Type Parameters

Here’s what the official TypeScript Handbook has to say about generic functions:

```
Writing generic functions is fun, and it can be easy to get carried away with type
parameters. Having too many type parameters or using constraints where they aren’t
needed can make inference less successful, frustrating callers of your function.
```
```
Item 51: Avoid Unnecessary Type Parameters | 221
```

It goes on to offer a few specific pieces of advice about how to use generics, including

one that is sometimes called the “Golden Rule of Generics”:

```
Type Parameters Should Appear Twice
Type parameters are for relating the types of multiple values. If a type parameter is only
used once in the function signature, it’s not relating anything.
Rule: If a type parameter only appears in one location, strongly reconsider if you
actually need it.
```
This rule gives you a specific way to tell whether any type parameter is good or bad,

but it’s not always obvious how to apply it, and it doesn’t offer much guidance about

how to rework your code if you’re using generics poorly. In this item we’ll go through

a few examples of good and bad uses of generics to illustrate how the rule works, and

we’ll rewrite the bad ones.

Let’s start with the identity function:

```
function identity<T>(arg: T): T {
return arg;
}
```
This function takes a single parameter and returns it, leaving its type unaltered. Here’s

how you might use it:

```
const date = identity( new Date());
// ^? const date: Date
const nums = [1, 2, 3];
// ^? const nums: number[]
const numsCopy = nums.map(identity);
// ^? const numsCopy: number[]
```
This function can be useful in practice if you’re required to pass in a callback but you

don’t want to alter your data. Thinking about the Golden Rule, is this a good use of

generics or a bad use? In this example, the type parameter T appears in two places

after its declaration:

```
function identity<T>(arg: T): T {
// (decl.) 1 2
return arg;
}
```
So this passes the test and is a good use of generics. And rightly so: it relates two types

because it says that the input parameter’s type and the function’s return type are the

same.

How about this one?

```
function third<A, B, C>(a: A, b: B, c: C): C {
return c;
}
```
**222 | Chapter 6: Generics and Type-Level Programming**


```
2 There are a few any-returning functions in the standard library, such as JSON.parse. See Item 71 for a discus‐
sion of how to make them return unknown instead.
```
The type parameter C appears twice, so it’s fine. But A and B only appear once (other

than in their declarations), so this function fails the test. You can rewrite it using only

one type parameter:

```
function third<C>(a: unknown , b: unknown , c: C): C {
return c;
}
```
Here’s a type declaration for a function that parses YAML:

```
declare function parseYAML<T>(input: string ): T;
```
Is this a good use of generics or a bad use of generics? The type parameter T only

appears once, so it must be bad. How to fix it? It depends what your goal is. These so-

called “return-only generics” are dangerous because they’re equivalent to a type asser‐

tion (Item 9), but don’t use the word as:

```
interface Weight {
pounds: number ;
ounces: number ;
}
```
```
const w: Weight = parseYAML('');
```
At first blush, this code looks safe because there are no type assertions or any types.

But this is an illusion. You could replace Weight with any other type and this code

would still type check. Setting a default value for the type parameter doesn’t change

this:

```
declare function parseYAML<T= null >(input: string ): T;
const w: Weight = parseYAML(''); // still allowed
```
It’s better to make this function return unknown instead (see Item 46 for a refresher on

the unknown type):

```
declare function parseYAML(input: string ): unknown ;
```
This will force users of the function to perform a type assertion on the result:

```
const w = parseYAML('') as Weight;
```
This is actually a good thing since it forces you to be explicit about your unsafe type

assertion. There are no illusions of type safety here!^2

How about this one?

```
function printProperty<T, K extends keyof T>(obj: T, key: K) {
console.log(obj[key]);
}
```
```
Item 51: Avoid Unnecessary Type Parameters | 223
```

Since K only appears once, this is a bad use of generics (T is fine because it appears

both as a parameter type and as a constraint on K). Fix it by moving the keyof T into

the parameter type and eliminating K:

```
function printProperty<T>(obj: T, key: keyof T) {
console.log(obj[key]);
}
```
This function looks superficially similar:

```
function getProperty<T, K extends keyof T>(obj: T, key: K) {
return obj[key];
}
```
This one, however, is actually a good use of generics. To see why, we need to look at

the inferred return type of the function. If you inspect getProperty in your editor,

you’ll see that its return type is T[K]. That means this signature is equivalent to:

```
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
return obj[key];
}
```
So K does appear twice! This is a good use of generics: K is related to T, and the return

type is related to both K and T.

What about a class?

```
class ClassyArray<T> {
arr: T[];
constructor (arr: T[]) { this .arr = arr; }
```
```
get(): T[] { return this .arr; }
add(item: T) { this .arr.push(item); }
remove(item: T) {
this .arr = this .arr.filter(el => el !== item)
}
}
```
This is fine since T appears many times in the implementation (I count 5). When you

instantiate a ClassyArray, you bind the type parameter and it relates the types of all

the properties and methods on the class. (This can be useful for creating inference

sites, as we saw in Item 28.)

This class, on the other hand, fails the test:

```
class Joiner<T extends string | number > {
join(els: T[]) {
return els.map(el => String(el)).join(',');
}
}
```
First of all, T only applies to join, so it can be moved down onto the method, rather

than the class:

**224 | Chapter 6: Generics and Type-Level Programming**


```
3 There’s a famous adage for object-oriented programmers: “Don’t make objects that end with er.”
```
```
class Joiner {
join<T extends string | number >(els: T[]) {
return els.map(el => String(el)).join(',');
}
}
```
By moving the declaration of T closer to its use, we make it possible for TypeScript to

infer the type of T. Generally, this is what you want! But in this case, since T only

appears once, you should make it nongeneric:

```
class Joiner {
join(els: ( string | number )[]) {
return els.map(el => String(el)).join(',');
}
}
```
Finally, why does this need to be a class at all? These sorts of wrapper classes are com‐

mon in Java (which doesn’t support standalone functions) but they’re unnecessary in

JavaScript.^3 Make it a standalone function instead:

```
function join(els: ( string | number )[]) {
return els.map(el => String(el)).join(',');
}
```
How about this function to get the length of any array-like object?

```
interface Lengthy {
length: number ;
}
function getLength<T extends Lengthy>(x: T) {
return x.length;
}
```
Since T only appears once after its definition, this is a bad use of generics. It could be

written as:

```
function getLength(x: Lengthy) {
return x.length;
}
```
or even:

```
function getLength(x: {length: number }) {
return x.length;
}
```
Or, since TypeScript has a built-in ArrayLike type:

```
function getLength(x: ArrayLike< unknown >) {
return x.length;
}
```
```
Item 51: Avoid Unnecessary Type Parameters | 225
```

Every rule has exceptions, so are there any exceptions to this one? There are some

rare cases where extraneous type parameters can help you get an implementation

right. For example, both type parameters in this function are bad:

```
declare function processUnrelatedTypes<A, B>(a: A, b: B): void ;
```
The fix is to rewrite it this way:

```
declare function processUnrelatedTypes(a: unknown , b: unknown ): void ;
```
This has a consequence for the implementation of the function, however. In the first

declaration, a and b were not assignable to one another in the body of the function:

```
function processUnrelatedTypes<A, B>(a: A, b: B) {
a = b;
// ~ Type 'B' is not assignable to type 'A'.
b = a;
// ~ Type 'A' is not assignable to type 'B'.
}
```
With the improved type signature, they are:

```
function processUnrelatedTypes(a: unknown , b: unknown ) {
a = b; // ok
b = a; // ok
}
```
A workaround is to use a single overload to create a distinct type signature for callers

versus the implementation. Item 52 shows what this looks like. As a general rule,

however, this sort of situation is rare, and you should avoid generic type parameters

that only appear once.

By now you should have a good sense for how to apply the golden rule of generics

and how to fix the declarations that break it. As you read and write generic functions,

think about whether they follow this rule! If a function or class doesn’t need to be

generic, then it will be easier to understand and maintain if it isn’t.

Put another way, the first rule of generics is “don’t.”

**Things to Remember**

- Avoid adding type parameters to functions and classes that don’t need them.
- Since type parameters relate types, every type parameter must appear two or
    more times to establish a relationship.
- Remember that a type parameter may appear in an inferred type.
- Avoid “return-only generics.”
- Unneeded type parameters can often be replaced with the unknown type.

**226 | Chapter 6: Generics and Type-Level Programming**


### Item 52: Prefer Conditional Types to Overload Signatures

How would you write a type declaration for this JavaScript function?

```
function double (x) {
return x + x;
}
```
double can be passed either a string or a number. So you might use a union type:

```
declare function double (x: string | number ): string | number ;
```
While this declaration is accurate, it’s a bit imprecise:

```
const num = double (12);
// ^? const num: string | number
const str = double ('x');
// ^? const str: string | number
```
When double is passed a number, it returns a number. And when it’s passed a string,

it returns a string. This declaration misses that nuance and will produce types that

are inconvenient to work with.

You might try to capture this relationship by making the function generic:

```
declare function double <T extends string | number >(x: T): T;
```
```
const num = double (12);
// ^? const num: 12
const str = double ('x');
// ^? const str: "x"
```
Unfortunately, in our zeal for precision we’ve overshot. The types are now a little too

precise. When passed a string type, this double declaration will result in a string

type, which is correct. But when passed a string literal type, the return type is the

same string literal type. This is wrong: doubling 'x' results in 'xx', not 'x'. As Item

40 explained, imprecise types are preferable to inaccurate types, so this is a step in the

wrong direction. How can we do better?

Another option is to provide multiple type declarations, also known as “overload sig‐

natures” (see Item 3 for a refresher). While JavaScript only allows you to write one

implementation of a function, TypeScript allows you to write any number of type sig‐

natures. You can use this to improve the type of double:

```
declare function double (x: number ): number ;
declare function double (x: string ): string ;
```
```
const num = double (12);
// ^? const num: number
const str = double ('x');
// ^? const str: string
```
```
Item 52: Prefer Conditional Types to Overload Signatures | 227
```

This is progress! But there’s still a subtle bug. This type declaration will work with val‐

ues that are either a string or a number, but not with values that could be either:

```
function f(x: string | number ) {
return double (x);
// ~ Argument of type 'string | number' is not assignable
// to parameter of type 'string'
}
```
This call to double is safe and should return string|number. When you provide

overload signatures, TypeScript processes them one by one until it finds a match. The

error you’re seeing is a result of the last overload (the string version) failing, because

string|number is not assignable to string.

While you could fix this by adding a third string|number overload, a better solution

is to use a conditional type. Conditional types are like if statements (conditionals) in

type space. They’re perfect for situations like this one where there are a few possibili‐

ties that you need to cover:

```
declare function double <T extends string | number >(
x: T
): T extends string? string : number ;
```
This is similar to the first attempt to type double using a generic function, but with a

more elaborate return type. You read the conditional type like you’d read a ternary

(?:) operator in JavaScript:

- If T is a subtype of string (i.e., string, or a string literal, or a union of string
    literals, or a template literal type), then the return type is string.
- Otherwise return number.

With this declaration, all of our examples work:

```
const num = double (12);
// ^? const num: number
const str = double ('x');
// ^? const str: string
```
```
function f(x: string | number ) {
// ^? function f(x: string | number): string | number
return double (x); // ok
}
```
The string|number example works because conditional types distribute over unions.

When T is string|number, TypeScript resolves the conditional type as follows:

```
(string|number) extends string? string : number
→ (string extends string? string : number) |
(number extends string? string : number)
→ string | number
```
**228 | Chapter 6: Generics and Type-Level Programming**


The way that conditional types distribute over unions is part of the design of Type‐

Script’s type system. It didn’t have to be this way. But in many cases (such as this one),

this behavior is correct and extremely convenient.

While the type declaration using overload signatures was simpler to write, the version

using conditional types is more correct because it generalizes to the union of the indi‐

vidual cases. This is often the case for overload signatures. Whereas overloads are

treated independently, the type checker can analyze conditional types as a single

expression, distributing them over unions.

Whenever you write a conditional type, you should think about whether you want it

to distribute over unions. Usually you do, but this isn’t always the case. Item 53

presents a situation where distribution is incorrect and shows how you can gain some

control over it.

Are there any situations where you should prefer overloads? If the union case is

implausible, or if your function really acts as two or more very distinct functions with

completely different signatures, then it may not be worth the effort to handle it, and

keeping the distinct overloads separate will result in more readable code.

If you find yourself in this situation, though, think about whether it would be clearer

to have two different functions. An example of this comes from the Node standard

library, which offers both callback- and Promise-based versions of filesystem func‐

tions like readFile. This could be a single function that behaves differently depend‐

ing on its arguments. But you generally know in advance whether you’re using

callbacks or Promises, so it’s clearer and simpler to have two distinct functions.

Since this is a chapter on type-level programming, we’ve focused entirely on the

types. But it’s worth briefly discussing how to implement overloaded functions and

functions that return conditional types. This can often be awkward and require type

assertions in the function body. TypeScript will not infer a conditional type for a

variable.

One strategy is to define a single overload to present a different type signature to call‐

ers than you use to implement the function. For example:

```
function double <T extends string | number >(
x: T
): T extends string? string : number ;
function double (x: string | number ): string | number {
return typeof x === 'string'? x + x : x + x ;
}
```
Here we use the conditional type for the externally visible API, but use a simpler type

for the implementation. (The typeof check looks a bit odd but saves us a type asser‐

tion.) TypeScript does some checking that the two signatures are compatible, but it

cannot do a perfect job. It’s still important to test your types, as explained in Item 55.

```
Item 52: Prefer Conditional Types to Overload Signatures | 229
```

**Things to Remember**

- Prefer conditional types to overloaded type signatures. By distributing over
    unions, conditional types allow your declarations to support union types without
    additional overloads.
- If the union case is implausible, consider whether your function would be clearer
    as two or more functions with different names.
- Consider using the single overload strategy for implementing functions declared
    with conditional types.

#### Item 53: Know How to Control the Distribution of Unions

#### over Conditional Types

Item 52 looked at how conditional types distribute over unions, and how this could

be helpful in typing a double function:

```
declare function double <T extends number | string >(
x: T
): T extends string? string : number ;
```
```
const num = double (12);
// ^? const num: number
const str = double ('x');
// ^? const str: string
```
```
declare let numOrStr: number | string ;
const either = double (numOrStr);
// ^? const either: number | string
```
In this case, the distribution over unions produced the desired result. This is typically,

but not always, the case.

To see an example of where distribution is not desirable, let’s define an isLessThan

function that determines whether its first argument is less than the second. We’d like

it to operate on dates, numbers, and strings. As a convenience, if you pass a Date in as

the first argument, we’d like to allow you to pass a number (milliseconds since epoch)

as the second argument.

You can model this using a conditional type:

```
type Comparable<T> =
T extends Date? Date | number :
T extends number? number :
T extends string? string :
never ;
```
```
declare function isLessThan<T>(a: T, b: Comparable<T>): boolean ;
```
**230 | Chapter 6: Generics and Type-Level Programming**


This seems to allow and disallow the combinations that we expect:

```
isLessThan( new Date(), new Date()); // ok
isLessThan( new Date(), Date.now()); // ok, Date/number comparison allowed
isLessThan(12, 23); // ok
isLessThan('A', 'B'); // ok
isLessThan(12, 'B');
// ~~~ Argument of type 'string' is not assignable to parameter
// of type 'number'.
```
Because of the way it’s written, Comparable distributes over unions. Is this desirable?

Evidently not:

```
let dateOrStr = Math.random() < 0.5? new Date() : 'A';
// ^? let dateOrStr: Date | string
isLessThan(dateOrStr, 'B') // ok, but should be an error
```
The second parameter should really be the intersection of the two possibilities, not

the union. And (Date | number) & string is never, so this call shouldn’t be allowed

at all.

How can we prevent distribution? Unions only distribute over conditional types if the

condition is a bare type (T extends ...). So to prevent distribution, we need to com‐

plicate the expression a bit. The standard way to do this is to wrap T in a one-element

tuple type, [T]:

```
type Comparable<T> =
[T] extends [Date]? Date | number :
[T] extends [ number ]? number :
[T] extends [ string ]? string :
never ;
```
The type [A] is assignable to [B] if and only if A is assignable to B. So on the surface

this change doesn’t look like it should affect the behavior of Comparable. But since

[T] is not a bare type, unions no longer distribute over Comparable and we get the

desired errors without breaking the other valid calls:

```
isLessThan( new Date(), new Date()); // ok
isLessThan( new Date(), Date.now()); // ok, Date/number comparison allowed
isLessThan(12, 23); // ok
isLessThan('A', 'B'); // ok
isLessThan(12, 'B');
// ~~~ Argument of type 'string' is not assignable to parameter
// of type 'number'.
isLessThan(dateOrStr, 'B');
// ~~~ Argument of type 'string' is not assignable to
// parameter of type 'never'.
```
Sometimes the situation is reversed and you have a conditional type that doesn’t dis‐

tribute but you’d like it to. This typically occurs as an inadvertent consequence of the

way that the generic type was implemented.

```
Item 53: Know How to Control the Distribution of Unions over Conditional Types | 231
```

To see how this might happen, let’s implement a generic type, NTuple<T, N>, that

produces a tuple with N elements, all of type T. This is a step up in complexity from

the types we’ve seen before, but we’ll talk our way through it. Here’s one way to do it

using an accumulator:

```
type NTuple<T, N extends number > = NTupleHelp<T, N, []>;
```
```
type NTupleHelp<T, N extends number , Acc extends T[]> =
Acc['length'] extends N
? Acc
: NTupleHelp<T, N, [T, ...Acc]>;
```
The trick here is to keep adding elements to a tuple type until its length property

matches the number that we want. Remember that this lookup is happening in the

type system. Looking up 'length' on an array type will yield number, but for a tuple

type it will yield a more precise numeric literal type like 0 , 1 , 2 , etc.

This generic type works as we’d hope for constructing N-tuples if N is a single number:

```
type PairOfStrings = NTuple< string , 2>;
// ^? type PairOfStrings = [string, string]
type TripleOfNumbers = NTuple< number , 3>;
// ^? type TripleOfNumbers = [number, number, number]
```
But it does not work as we’d hope if N is a union:

```
type PairOrTriple = NTuple<bigint, 2 | 3>;
// ^? type PairOrTriple = [bigint, bigint]
```
This should be [bigint, bigint] | [bigint, bigint, bigint]. The immediate

issue is that Acc['length'] extends 2 | 3 is true as soon as the accumulator gets to

be a pair. But the deeper issue is that our conditional type isn’t distributing over

unions. We’d like it to. Why isn’t it, and how can we fix it?

The problem is that the condition is Acc['length'] extends N, which does not start

with the bare “N extends...” that’s required for distribution. So the easiest fix is to add

an extra conditional type that looks like this:

```
type NTuple<T, N extends number > =
N extends number
? NTupleHelp<T, N, []>
: never ;
```
Because N is constrained to extend number, this conditional will always evaluate to

true (you could make it N extends any or N extends unknown if you like). Its sole

purpose is to add a conditional type in the right form for distribution. And it works!

```
type PairOrTriple = NTuple<bigint, 2 | 3>;
// ^? type PairOrTriple = [bigint, bigint] | [bigint, bigint, bigint]
```
**232 | Chapter 6: Generics and Type-Level Programming**


```
4 A remaining issue with this definition is that NTuple<string, number> is [], but it should be string[]. Try
fixing it without breaking existing behavior.
```
This happens because NTupleHelp is instantiated with N = 2 and N = 3 and the

results are unioned together. Using an accumulator is a common technique with

recursive generic types because it can improve their performance. Item 57 will

explain how.^4

Conditional types have two other surprising behaviors that you should be aware of

when they distribute over the boolean and never types.

First, boolean. Let’s define a generic type that yields a celebratory message if its argu‐

ment is true:

```
type CelebrateIfTrue<V> = V extends true? 'Huzzah!' : never ;
```
```
type Party = CelebrateIfTrue< true >;
// ^? type Party = "Huzzah!"
type NoParty = CelebrateIfTrue< false >;
// ^? type NoParty = never
type SurpriseParty = CelebrateIfTrue< boolean >;
// ^? type SurpriseParty = "Huzzah!"
```
It’s surprising that this last instantiation resolves to "Huzzah!" because you wouldn’t

expect boolean extends true to be true. What’s going on is a bit more subtle. Inter‐

nally, TypeScript treats boolean as a union:

```
type boolean = true | false ;
```
Because boolean is a union, it can distribute over conditional types. So spelling it out

a bit, the evaluation looks like this:

```
type SurpriseParty
= CelebrateIfTrue< boolean >
= CelebrateIfTrue< true | false >
= CelebrateIfTrue< true > | CelebrateIfTrue< false >
= "Huzzah!" | never
= "Huzzah!";
```
In this case, it’s probably not what you wanted. As before, you can prevent distribu‐

tion by wrapping the condition in a one-tuple:

```
type CelebrateIfTrue<V> = [V] extends [ true ]? 'Huzzah!' : never ;
```
```
type SurpriseParty = CelebrateIfTrue< boolean >;
// ^? type SurpriseParty = never
```
Another surprise comes with the never type. Looking at this definition, you’d expect

AllowIn<T> to always evaluate to either "Yes", "No" or possibly "Yes" | "No":

```
type AllowIn<T> = T extends {password: "open-sesame"}? "Yes" : "No";
```
```
Item 53: Know How to Control the Distribution of Unions over Conditional Types | 233
```

But there’s one other possibility if T is never:

```
type N = AllowIn< never >;
// ^? type N = never
```
Why does this evaluate to never if neither side of the conditional is never? Again, it’s

all about distribution over unions. TypeScript treats the never type as an empty

union and, if there’s nothing to distribute over, you get empty back. This might make

a bit more sense if you replace T with T|never (which is the same as T) and see what

happens:

```
AllowIn<T>
= AllowIn<T | never >
= AllowIn<T> | AllowIn< never >
= AllowIn<T> | never
= AllowIn<T>
```
Surely T|never should be treated the same as T. And when distribution applies, this

means that F<never> must be never, regardless of how you define F. As before, if you

don’t want this, one solution is to wrap your condition in a one-tuple.

The way that conditional types distribute over unions is one of their most powerful

and useful capabilities. It is usually, but not always, the behavior that you want. When

you write a generic type, think about whether you want it to distribute over unions,

and be aware of how seemingly innocuous refactors can enable or disable

distribution.

**Things to Remember**

- Think about whether you want unions to distribute over your conditional types.
- Know how to enable or disable distribution by adding conditions or by wrapping
    conditions in one-tuples.
- Be aware of the surprising behavior of boolean and never types when they dis‐
    tribute over unions.

#### Item 54: Use Template Literal Types to Model DSLs and

#### Relationships Between Strings

Item 35 suggested using more precise alternatives to string types in your own code.

But there are many strings in the world and it’s hard to avoid them entirely. In these

cases, TypeScript offers its own unique tool for capturing patterns and relationships

in strings: template literal types. This item will explore how this feature works and

how you can use it to bring safety to code that would be impossible to type otherwise.

**234 | Chapter 6: Generics and Type-Level Programming**


Like all programming languages, TypeScript has a string type but, as we’ve seen in

previous items, it also has string literal types, which are types whose domain consists

of a single string value. These are often combined with unions:

```
type MedalColor = 'gold' | 'silver' | 'bronze';
```
With unions of string literal types, you can model finite sets of strings. With string

itself you can capture the infinite set all possible strings. Template literal types let you

model something in between, for example, the set of all strings starting with pseudo:

```
type PseudoString = `pseudo${ string }`;
const science: PseudoString = 'pseudoscience'; // ok
const alias: PseudoString = 'pseudonym'; // ok
const physics: PseudoString = 'physics';
// ~~~~~~~ Type '"physics"' is not assignable to type '`pseudo${string}`'.
```
Like string, the PseudoString type has an infinite domain (Item 7). But unlike

string, values in the PseudoString type have some structure: they all start with

pseudo. As with other type-level constructs, the syntax for template literal types is

deliberately meant to evoke JavaScript’s template literals.

JavaScript abounds with structured strings. For example, what if you want to require

that an object have some known set of properties, but also allow any others that start

with data-? (This pattern is common with the DOM.)

```
interface Checkbox {
id: string ;
checked: boolean ;
[key: `data-${ string }`]: unknown ;
}
```
```
const check1: Checkbox = {
id: 'subscribe',
checked: true ,
value: 'yes',
// ~~~~ Object literal may only specify known properties,
// and 'value' does not exist in type 'Checkbox'.
'data-listIds': 'all-the-lists', // ok
};
const check2: Checkbox = {
id: 'subscribe',
checked: true ,
listIds: 'all-the-lists',
// ~~~~~~ Object literal may only specify known properties,
// and 'listIds' does not exist in type 'Checkbox'
};
```
Had we used string as the index type, we’d lose the benefit of excess property check‐

ing on check1 (see Item 11) and incorrectly permit the property without a data-

prefix on check2:

```
Item 54: Use Template Literal Types to Model DSLs and Relationships Between Strings | 235
```

```
interface Checkbox {
id: string ;
checked: boolean ;
[key: string ]: unknown ;
}
```
```
const check1: Checkbox = {
id: 'subscribe',
checked: true ,
value: 'yes', // permitted
'data-listIds': 'all-the-lists',
};
const check2: Checkbox = {
id: 'subscribe',
checked: true ,
listIds: 'all-the-lists' // also permitted, matches index type
};
```
Template literal types are helpful for modeling subsets of string, but their real power

comes when we combine them with generics and type inference to capture relation‐

ships between types.

Consider the querySelector function provided by the DOM. TypeScript is already

clever enough to give you a more specific subtype of HTMLElement if you query for it:

```
const img = document.querySelector('img');
// ^? const img: HTMLImageElement | null
```
This allows you to access img.src, for example, which would not be permitted on the

less specific Element type. (Item 75 covers TypeScript and the DOM.)

This cleverness is not very deep, though. If you try to query for an image with a spe‐

cific ID, you’ll just get an Element:

```
const img = document.querySelector('img#spectacular-sunset');
// ^? const img: Element | null
img?.src
// ~~~ Property 'src' does not exist on type 'Element'.
```
With the help of template literal types, we can make this work. TypeScript’s type dec‐

larations for the DOM (lib.dom.d.ts) include a mapping from tag name to type:

```
interface HTMLElementTagNameMap {
"a": HTMLAnchorElement;
"abbr": HTMLElement;
"address": HTMLElement;
"area": HTMLAreaElement;
// ... many more ...
"video": HTMLVideoElement;
"wbr": HTMLElement;
}
```
**236 | Chapter 6: Generics and Type-Level Programming**


```
5 Since E only appears once in this declaration, it’s a bad use of a type parameter. See Item 51.
```
as well as a few declarations for querySelector:^5

```
interface ParentNode extends Node {
// ...
querySelector<E extends Element = Element>(selectors: string ): E | null ;
// ...
}
```
Now we can use a template literal type to add an overload for the tag#id case:

```
type HTMLTag = keyof HTMLElementTagNameMap;
declare global {
interface ParentNode {
querySelector<
TagName extends HTMLTag
>(
selector: `${TagName}#${ string }`
): HTMLElementTagNameMap[TagName] | null ;
}
}
```
The example from before now works as you’d hope, returning the more precise image

type and allowing access to its src property:

```
const img = document.querySelector('img#spectacular-sunset');
// ^? const img: HTMLImageElement | null
img?.src // ok
```
This is helpful, but we’ve slightly missed the mark:

```
const img = document.querySelector('div#container img');
// ^? const img: HTMLDivElement | null
```
A space in a CSS selector means “descendant of.” In this case, our template literal type

`${TagName}#${string}` matched "div", then "#", then "container img". In

attempting to get more precise types, we’ve run afoul of Item 40’s advice to prefer

imprecision to inaccuracy.

While one could imagine building an entire CSS selector parser using template literal

types, a less ambitious way to handle this issue is to guard against characters with

special meanings in CSS selectors using another overload:

```
type CSSSpecialChars = ' ' | '>' | '+' | '~' | '||' | ',';
type HTMLTag = keyof HTMLElementTagNameMap;
```
```
declare global {
interface ParentNode {
// escape hatch
querySelector(
selector: `${HTMLTag}#${ string }${CSSSpecialChars}${ string }`
```
```
Item 54: Use Template Literal Types to Model DSLs and Relationships Between Strings | 237
```

```
): Element | null ;
```
```
// same as before
querySelector<
TagName extends HTMLTag
>(
selector: `${TagName}#${ string }`
): HTMLElementTagNameMap[TagName] | null ;
}
}
```
Now you at least get an imprecise type for the more complex selector, rather than an

inaccurate type:

```
const img = document.querySelector('img#spectacular-sunset');
// ^? const img: HTMLImageElement | null
const img2 = document.querySelector('div#container img');
// ^? const img2: Element | null
```
This will help ensure safe usage. For more on TypeScript and the DOM, see Item 75.

Template literal types are often combined with conditional types to implement pars‐

ers for domain-specific languages (DSLs) like CSS selectors. To see how this works,

let’s try to get precise types for an objectToCamel function that camelCases the keys

of a snake_cased object:

```
// e.g. foo_bar -> fooBar
function camelCase(term: string ) {
return term.replace(/_([a-z])/g, m => m[1].toUpperCase());
}
```
```
// (return type to be filled in shortly)
function objectToCamel<T extends object>(obj: T) {
const out: any = {};
for ( const [k, v] of Object.entries(obj)) {
out[camelCase(k)] = v;
}
return out;
}
```
```
const snake = {foo_bar: 12};
// ^? const snake: { foo_bar: number; }
const camel = objectToCamel(snake);
// camel's value at runtime is {fooBar: 12};
// we'd like the type to be {fooBar: number}
const val = camel.fooBar; // we'd like this to have a number type
const val2 = camel.foo_bar; // we'd like this to be an error
```
Let’s start by defining a type-level ToCamelOnce helper:

```
type ToCamelOnce<S extends string > =
S extends `${ infer Head}_${ infer Tail}`
? `${Head}${Capitalize<Tail>}`
```
**238 | Chapter 6: Generics and Type-Level Programming**


##### : S;

```
type T = ToCamelOnce<'foo_bar'>; // type is "fooBar"
```
Here we’ve used the infer keyword in a conditional type to extract the part of the

string before and after an underscore. When S is "foo_bar", then Head is the string

literal type "foo" and Tail is the string literal type "bar". When we get a match, we

construct a new string (using a template literal type) without the underscore and with

the first letter of the tail capitalized (Capitalize is a built-in helper).

To make this work on strings with multiple underscores like "foo_bar_baz", we need

to make it recursive:

```
type ToCamel<S extends string > =
S extends `${ infer Head}_${ infer Tail}`
? `${Head}${Capitalize<ToCamel<Tail>>}`
: S;
type T0 = ToCamel<'foo'>; // type is "foo"
type T1 = ToCamel<'foo_bar'>; // type is "fooBar"
type T2 = ToCamel<'foo_bar_baz'>; // type is "fooBarBaz"
```
Now we can give objectToCamel a more precise type using a mapped type (Item 15)

that rewrites the keys using the helper:

```
type ObjectToCamel<T extends object> = {
[K in keyof T as ToCamel<K & string >]: T[K]
};
```
```
function objectToCamel<T extends object>(obj: T): ObjectToCamel<T> {
// ... as before ...
}
```
And now the types are exactly what we wanted!

```
const snake = {foo_bar: 12};
// ^? const snake: { foo_bar: number; }
const camel = objectToCamel(snake);
// ^? const camel: ObjectToCamel<{ foo_bar: number; }>
// (equivalent to { fooBar: number; })
const val = camel.fooBar;
// ^? const val: number
const val2 = camel.foo_bar;
// ~~~~~~~ Property 'foo_bar' does not exist on type
// '{ fooBar: number; }'. Did you mean 'fooBar'?
```
This new, more precise type for objectToCamel is an excellent example of “fancy”

TypeScript features being used to benefit a developer. You don’t need to know any‐

thing about template literal types, conditional types, or mapped types to use objectTo

Camel. But you still benefit from them in the form of more precise types. Your

experience of TypeScript is that it understands this code even if you don’t understand

precisely how it does that.

```
Item 54: Use Template Literal Types to Model DSLs and Relationships Between Strings | 239
```

One small issue is that the display of the camel’s type isn’t ideal. Item 56 will explain

how to improve it.

**Things to Remember**

- Use template literal types to model structured subsets of string types and
    domain-specific languages (DSLs).
- Combine template literal types with mapped and conditional types to capture
    nuanced relationships between types.
- Take care to avoid crossing the line into inaccurate types. Strive for uses of tem‐
    plate literal types that improve developer experience without requiring knowl‐
    edge of fancy language features.

### Item 55: Write Tests for Your Types

```
Write tests until fear is transformed into boredom.
—Phlip (quoted in Kent Beck, Test Driven Development: By Example [Addison-Wesley
Professional])
```
You wouldn’t write code without tests (I hope!), and you shouldn’t write type declara‐

tions without writing tests for them either. But how do you test types? If you’re

authoring type declarations or a TypeScript library, testing your types is an essential,

but surprisingly fraught, undertaking.

This is a particularly acute need for TypeScript compared to most other program‐

ming languages for two reasons:

- TypeScript lets you put an enormous amount of logic in the types. Where there’s
    logic, there might be bugs, and where there might be bugs, you should write tests.
- For JavaScript libraries and, to some extent, TypeScript code, you can define your
    types independently of the runtime implementation. This means that the two can
    get out of sync, and you need to write tests to ensure that this doesn’t happen.

There are two main ways to test types: using the type system and using tooling out‐

side the type system. Either approach works, and both have their advantages. This

item will first look at some ineffective ways to test types, then talk about the pros and

cons of the two standard approaches.

Suppose you’ve written a type declaration for a map function provided by a utility

library (the popular Lodash library provides such a function, as do native arrays):

```
declare function map<U, V>(array: U[], fn: (u: U) => V): V[];
```
**240 | Chapter 6: Generics and Type-Level Programming**


How can you check that this type declaration results in the expected types? (Presuma‐

bly, there are separate tests for the implementation.) One common technique is to

write a test file that calls the function:

```
map(['2017', '2018', '2019'], v => Number(v));
```
This will do some blunt error checking: if your declaration of map only listed a single

parameter, this would catch the mistake. But does it feel like something is missing

here?

The equivalent of this style of test for runtime behavior might look something like

this:

```
test('square a number', () => {
square(1);
square(2);
});
```
Sure, this tests that the square function doesn’t throw an error. But it doesn’t check

the return value, so there’s no real test of the behavior. An incorrect implementation

of square would still pass this test.

This approach is common in testing type declaration files because it’s simple to copy/

paste existing unit tests for a library. And while it does provide some value, it would

be much better to actually check some types!

One way to do this is to assign the result to a variable with a declared type:

```
const lengths: number [] = map(['john', 'paul'], name => name.length);
```
This is exactly the sort of superfluous type declaration that Item 18 would encourage

you to remove. But here it plays an essential role: it provides some confidence that the

map declaration is at least doing something sensible with the types. And indeed, you

can find many type declarations in DefinitelyTyped that use exactly this approach for

testing.

There are a few problems with using assignment for testing, however.

One problem is that you have to create a named variable that is likely to be unused.

This adds boilerplate, and also means that you’ll have to disable any linter rules that

warn about unused variables.

The usual workaround is to define a helper:

```
function assertType<T>(x: T) {}
```
```
assertType< number []>(map(['john', 'paul'], name => name.length));
```
A second issue is that we’re checking assignability of the two types rather than equal‐

ity. Often this works as you’d expect. For example:

```
Item 55: Write Tests for Your Types | 241
```

```
const n = 12;
assertType< number >(n); // OK
```
If you inspect the n symbol in your editor, you’ll see that its type is actually 12 , a

numeric literal type. This is a subtype of number, and the assignability check passes,

just as you’d expect.

So far, so good. But things get murkier when you start checking the types of objects:

```
const beatles = ['john', 'paul', 'george', 'ringo'];
assertType<{name: string }[]>(
map(beatles, name => ({
name,
inYellowSubmarine: name === 'ringo'
}))
); // OK
```
The map call returns an array of {name: string, inYellowSubmarine: boolean}

objects. This is assignable to {name: string}[], so the code passes the type checker.

But what about the yellow submarine? In this case, we’d really prefer to check for type

equality.

Testing for assignability can lead to surprising behavior with function types, too:

```
const add = (a: number , b: number ) => a + b;
assertType<(a: number , b: number ) => number >(add); // OK
```
```
const double = (x: number ) => 2 * x;
assertType<(a: number , b: number ) => number >( double ); // OK!?
```
It’s surprising that the second assertion succeeds since the functions take different

numbers of parameters. But this is just how assignability works in TypeScript: a func‐

tion type is assignable to another function type that takes fewer parameters:

```
const g: (x: string ) => any = () => 12; // OK
```
This reflects the fact that it’s perfectly fine to call a JavaScript function with more

parameters than it’s declared to take. TypeScript chooses to model this behavior

rather than bar it, largely because it is pervasive in callbacks. The callback in the

Lodash map function, for example, takes up to three parameters:

```
map(array, (element, index, array) => { /* ... */ });
```
While all three are available if you need them, it’s very common to use only one or

sometimes two, as we have so far in this item. In fact, it’s quite rare to use all three. If

TypeScript disallowed this assignment, it would report errors in an enormous

amount of JavaScript code.

So what can you do? You could break apart the function type and test its pieces using

the built-in Parameters and ReturnType types:

**242 | Chapter 6: Generics and Type-Level Programming**


```
const double = (x: number ) => 2 * x;
declare let p: Parameters< typeof double >;
assertType<[ number , number ]>(p);
// ~ Argument of type '[number]' is not
// assignable to parameter of type [number, number]
declare let r: ReturnType< typeof double >;
assertType< number >(r); // OK
```
But if “this” isn’t complicated enough, there’s another issue: Lodash’s map sets the value

of this for its callback. TypeScript can model this behavior (see Item 69), so your

type declaration should do so. And you should test it. How can we do that?

Our tests of map so far have been a bit “black box” in style: we’ve run an array and

function through map and tested the type of the result, but we haven’t tested the

details of the intermediate steps. We can do so by filling out the callback function and

verifying the types of its parameters and this directly:

```
const beatles = ['john', 'paul', 'george', 'ringo'];
assertType< number []>(map(
beatles,
function (name, i, array) {
// ~~~ Argument of type '(name: any, i: any, array: any) => any' is
// not assignable to parameter of type '(u: string) => any'
assertType< string >(name);
assertType< number >(i);
assertType< string []>(array);
assertType< string []>( this );
// ~~~~ 'this' implicitly has type 'any'
return name.length;
}
));
```
This has surfaced a few issues with our declaration of map from earlier, namely that its

callback only takes one parameter and that it doesn’t set a type for this. Note the use

of a function expression instead of an arrow function so that we could test the type of

this.

Here is a declaration that passes the checks:

```
declare function map<U, V>(
array: U[],
fn: ( this : U[], u: U, i: number , array: U[]) => V
): V[];
```
There remains a final issue, however, and it is a major one. Here’s a complete type

declaration file for our module that will pass even the most stringent tests for map but

is worse than useless:

```
declare module 'your-amazing-module';
```
```
Item 55: Write Tests for Your Types | 243
```

This assigns an any type to the entire module. Your type assertions will all pass, but

you won’t have any type safety. What’s worse, every call to a function in this module

will quietly produce an any type, contagiously destroying type safety throughout your

code. Even with noImplicitAny, you can still get any types through type declarations

files.

One way to address this issue is by adding some “negative” tests: tests that are

expected to fail. TypeScript lets you do this via @ts-expect-error comments:

```
// @ts-expect-error only takes two parameters
map([1, 2, 3], x => x * x, 'third parameter');
```
This inverts the usual error checking process: now you’ll get a compiler error if there

isn’t a type error. This does give you some protection against any types, but be

warned: @ts-expect-error is a very blunt instrument. You can’t say exactly which

error you expect. For example, the previous snippet still passes with an any type

because there will be an implicit any error on the function parameter:

```
declare const map: any ;
map([1, 2, 3], x => x * x, 'third parameter');
// ~ Parameter 'x' implicitly has an 'any' type.
```
One workaround here is to split your code across multiple lines to reduce the scope

of the directive:

```
map(
[1, 2, 3],
x => x * x,
// @ts-expect-error only takes two parameters
'third parameter'
);
```
It would be better if we could adapt assertType to handle these pesky any types,

though. With some cleverness, you can detect an any type using a type alias. But

rather than add complexity to our testing code, let’s take this as a cue to pull in a test‐

ing library.

One of the more popular choices that works within the type system is expect-type.

You can use it on its own or via the vitest testing framework, which bundles it. Here’s

what it looks like:

```
import {expectTypeOf} from 'expect-type';
```
```
const beatles = ['john', 'paul', 'george', 'ringo'];
expectTypeOf(map(
beatles,
function (name, i, array) {
expectTypeOf(name).toEqualTypeOf< string >();
expectTypeOf(i).toEqualTypeOf< number >();
expectTypeOf(array).toEqualTypeOf< string []>();
```
**244 | Chapter 6: Generics and Type-Level Programming**


```
expectTypeOf( this ).toEqualTypeOf< string []>();
return name.length;
}
)).toEqualTypeOf< number []>();
```
As you’d hope, it’s able to catch any types, differing function types, and subtle differ‐

ences like readonly properties:

```
const anyVal: any = 1;
expectTypeOf(anyVal).toEqualTypeOf< number >();
// ~~~~~~
// Type 'number' does not satisfy the constraint 'never'.
```
```
const double = (x: number ) => 2 * x;
expectTypeOf( double ).toEqualTypeOf<(a: number , b: number ) => number >();
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Type ... does not satisfy '"Expected: function, Actual: never"'
```
```
interface ABReadOnly {
readonly a: string ;
b: number ;
}
declare let ab: {a: string , b: number };
expectTypeOf(ab).toEqualTypeOf<ABReadOnly>();
// ~~~~~~~~~~~~~
// Arguments for the rest parameter 'MISMATCH' were not provided.
expectTypeOf(ab).toEqualTypeOf<{a: string , b: number }>(); // OK
```
Testing types in this way offers a number of advantages:

- It doesn’t require any additional tooling. All type testing is done via tsc, which
    you’re using already.
- Since types are tested structurally, it won’t get tripped up by meaningless differ‐
    ences like 1|2 versus 2|1.
- TypeScript’s language service will help with refactoring. If you rename an inter‐
    face, for example, its name will also get updated in any type assertions.
- Your assertions will get formatted in the same way as your code if you’re using a
    formatting tool like prettier.

There are also a few downsides to this approach:

- The error message for mismatched types ('MISMATCH') doesn’t give much guid‐
    ance about what the mismatch is or where it occurs.
- Because it’s testing the structure of types, it cannot detect issues around how they
    display. As Item 56 will explain, you have some control over this and should care
    about it.

```
Item 55: Write Tests for Your Types | 245
```

That being said, this is a great way to test your types and it’s a vast improvement over

the hand-rolled attempts we saw earlier in this item.

Another approach in this vein was popularized by the Type Challenges repo. It looks

like this:

```
export type Equals<X, Y> =
(<T>() => T extends X? 1 : 2) extends
(<T>() => T extends Y? 1 : 2)? true : false ;
```
```
export type Expect<T extends true > = T;
```
```
const double = (x: number ) => 2 * x;
type Test1 = Expect<Equals< typeof double , (x: number ) => number >>;
type Test2 = Expect<Equals< typeof double , (x: string ) => number >>;
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Type 'false' does not satisfy the constraint 'true'.
```
Recall from Item 48 that function types are covariant with respect to their return

types. But the only way the first conditional type could reliably be assignable to the

second is if X is equal to Y. (Try plugging in a few concrete types for X, Y, and T to

convince yourself of this.) Rather than relying on type-level logic to test for equality,

this is the rare case where we can get TypeScript itself to compare types for equality.

While this is slightly more robust than expect-type, it has many of the same advan‐

tages and disadvantages. The error messages for failed tests aren’t particularly illumi‐

nating. And type equality is such a rare concept in TypeScript that the semantics are a

bit murky. Some parts of the type’s display matter, while others don’t:

```
type Test3 = Expect<Equals<1 | 2, 2 | 1>>; // good!
type Test4 = Expect<Equals<[a: 1, b: 2], [1, 2]>>; // maybe not so good
type Test5 = Expect<Equals<{x: 1} & {y: 2}, {x: 1, y: 2}>>; // surprising
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Type 'false' does not satisfy the constraint 'true'.
```
So much for testing types within the type system. What if you want to test types using

an external tool? Two common ones are dtslint and eslint-plugin-expect-type.

As the names suggest, these both operate as linters.

dtslint was built to test type declarations in the DefinitelyTyped repository. It oper‐

ates through specially formatted comments. Here’s how you might write the last test

for the map function using dtslint:

```
const beatles = ['john', 'paul', 'george', 'ringo'];
map(beatles, function (
name, // $ExpectType string
i, // $ExpectType number
array // $ExpectType string[]
) {
this // $ExpectType string[]
```
**246 | Chapter 6: Generics and Type-Level Programming**


```
return name.length;
}); // $ExpectType number[]
```
Rather than checking assignability, dtslint inspects the type of each symbol and

does a textual comparison. This matches how you’d manually test the type declara‐

tions in your editor: dtslint essentially automates this process. This approach does

have some drawbacks: despite being fundamentally the same type, number|string

and string|number are textually different. But so are string and any, despite being

assignable to each other, which is really the point.

eslint-plugin-expect-type works in a similar way, but as an ESLint plugin. This is

more convenient if you want to test your own TypeScript types, rather than type dec‐

larations on DefinitelyTyped. In addition to $ExpectType comments, it will check the

types in Twoslash-style comments:

```
const spiceGirls = ['scary', 'sporty', 'baby', 'ginger', 'posh'];
// ^? const spiceGirls: string[]
```
This should look familiar: it’s the same syntax used for code samples in this book! You

can also use Twoslash-style comments on the TypeScript playground (see Figure P-1

in the Preface to the Second Edition).

Testing types using an external tool has a number of strengths:

- It matches the way you interact with types in your editor. There’s no type-level
    fanciness required to do a character-by-character comparison of type displays.
- Since it tests the string representation of a type, it’s able to catch issues around
    how types display (Item 56).
- The ESLint plugin’s auto-fixer makes it easy to update tests.

There are some downsides, though:

- It requires setting up another tool (though it’s likely you’re already using ESLint).
- It can be too sensitive; e.g., saying that 1|2 and 2|1 are different types because
    they display differently.
- You miss out on type formatting / refactoring since the types are in comments.

Some tools take a hybrid approach. tsd, for example, is a type testing tool that oper‐

ates within the type system but also includes an external tool to provide the stricter

type checks that are hard to get otherwise.

Finally, there are some things you might like to test that neither tool can help you

with. For example, here’s a popular trick for providing autocomplete on a few values

while still allowing any string:

```
Item 55: Write Tests for Your Types | 247
```

```
type Game = 'wordle' | 'crossword' | ( string & {});
const spellingBee: Game = 'spelling bee';
let g: Game = '';
```
If you hit Ctrl-Space inside that last empty string, TypeScript will suggest “wordle” or

“crossword.” But it will still allow any string to be assigned to a Game. If you want to

write a test that this works as you expect, neither of the two approaches described in

this item will help (Figure 6-2).

Figure 6-2. TypeScript offers autocomplete for two values, but accepts all strings.

Testing type declarations is tricky business. You should test them. But be aware of the

pitfalls of some of the common techniques. Don’t roll your own type testing system. If

you’re writing type declarations on DefinitelyTyped, you should use dtslint because

that’s the standard tool in that setting. If you’re testing your own code, use a library

like vitest, expect-type, or tsd. If you want to write tests that are sensitive to the

way a type displays, not just its structure, use eslint-plugin-expect-type.

**Things to Remember**

- When testing types, be aware of the difference between equality and assignability,
    particularly for function types.
- For functions that use callbacks, test the inferred types of the callback parame‐
    ters. Don’t forget to test the type of this if it’s part of your API.
- Avoid writing your own type testing code. Use one of the standard tools instead.
- For code on DefinitelyTyped, use dtslint. For your own code, use vitest,
    expect-type, or the Type Challenges approach. If you want to test type display,
    use eslint-plugin-expect-type.

### Item 56: Pay Attention to How Types Display

Usually, we care about what types are and which values are assignable to them. But

when you’re using a TypeScript library, the way it chooses to display types can make a

big difference in your experience of using it. This means that, as a library author, you

need to pay attention to how your types display.

**248 | Chapter 6: Generics and Type-Level Programming**


For any type, there are many valid ways to display it. For example, union types typi‐

cally display their constituents in the order in which you listed them:

```
type T123 = '1' | '2' | '3';
// ^? type T123 = "1" | "2" | "3"
```
But if you happen to have introduced an overlapping union earlier, you might get a

different display:

```
type T21 = '2' | '1';
// ^? type T21 = "2" | "1"
```
```
type T123 = '1' | '2' | '3';
// ^? type T123 = "2" | "1" | "3"
```
Is it 1, 2, 3 or 2, 1, 3? They’re two equally valid representations of the exact same type.

In this case the legibility is about the same for both, but sometimes it can vary sub‐

stantially between multiple representations.

To see an example of an undesirable type display, let’s implement a PartiallyPartial

generic that makes a few of the properties of an object optional but not the others.

Here’s an implementation:

```
type PartiallyPartial<T, K extends keyof T> =
Partial<Pick<T, K>> & Omit<T, K>;
```
Here’s what it might look like in practice:

```
interface BlogComment {
commentId: number ;
title: string ;
content: string ;
}
```
```
type PartComment = PartiallyPartial<BlogComment, 'title'>;
// ^? type PartComment =
// Partial<Pick<BlogComment, "title">> &
// Omit<BlogComment, "title">
```
The generic type is implemented correctly, and this is a perfectly valid display of the

result of this instantiation. But it leaves a few things to be desired for a user inspecting

PartComment: what is the type of title? Is it nullable? And what other fields are there

behind that Omit? The whole thing feels implementation-y, as though it’s telling the

user more about how the generic type was defined than what the resulting type is.

We’d like to tell TypeScript to do a little more work to resolve those generic types.

There’s a widespread trick to do exactly that:

```
type Resolve<T> = T extends Function? T : {[K in keyof T]: T[K]};
```
```
Item 56: Pay Attention to How Types Display | 249
```

We’ll talk about how this works momentarily. But first, here’s how you use it:

```
type PartiallyPartial<T, K extends keyof T> =
Resolve<Partial<Pick<T, K>> & Omit<T, K>>;
```
```
type PartComment = PartiallyPartial<BlogComment, 'title'>;
// ^? type PartComment = {
// title?: string | undefined;
// commentId: number;
// content: string;
// }
```
By wrapping the generic type with Resolve, we’ve magically told TypeScript to flatten

out the display of all its properties. It’s much clearer what this type is now. Even bet‐

ter, all traces of the implementation are gone. The user of this type doesn’t need to

know that it’s been implemented using Partial, Pick, or Omit.

So how does Resolve work? If you ignore the conditional type, you’re left with an

expression that looks it should be the identity for object types:

```
type ObjIdentity<T> = {[K in keyof T]: T[K]};
```
And indeed, this does work to “resolve” some types. Because it’s a homomorphic

mapped type (see Item 15), it allows primitive types to pass through unmodified:

```
type S = ObjIdentity< string >;
// ^? type S = string
type N = ObjIdentity< number >;
// ^? type N = number
type U = ObjIdentity<'A' | 'B' | 'C'>;
// ^? type U = "A" | "B" | "C"
```
It’s not the identity for functions, however, which is why we need the conditional type

guarding Resolve:

```
type F = ObjIdentity<(a: number ) => boolean >;
// ^? type F = {}
```
This helper is ubiquitous in TypeScript code that uses lots of generic types. Resolve is

my choice of names, but you may also see it called Simplify, NOP, NOOP, or Merge

Insertions.

You can make a DeepResolve that recursively resolves object types, but this typically

isn’t a good idea because Resolve winds up being too aggressive on classes:

```
type D = Resolve<Date>;
// ^? type D = {
// toLocaleString: {
// (locales?: Intl.LocalesArgument,
// options?: Intl.DateTimeFormatOptions | undefined): string;
// (): string;
// (locales?: string | string[] | undefined,
// options?: Intl.DateTimeFormatOptions | undefined): string;
```
**250 | Chapter 6: Generics and Type-Level Programming**


##### // };

```
// ... 42 more ...;
// [Symbol.toPrimitive]: {
// ...;
// };
// }
```
The inlining has backfired here. Better to just let this type display as Date.

You can also use Resolve to inline keyof expressions if you feel that improves their

legibility:

```
interface Color { r: number ; g: number ; b: number ; a: number };
type Chan = keyof Color;
// ^? type Chan = keyof Color
type ChanInline = Resolve< keyof Color>;
// ^? type ChanInline = "r" | "g" | "b" | "a"
```
Sometimes there are particularly important cases for which you’d like to have types

display cleanly. For PartiallyPartial, this might be when the type parameter K is

never (in which case none of the fields are optional). Here’s how that case is handled

with our current definition:

```
type FullComment = PartiallyPartial<BlogComment, never >;
// ^? type FullComment = {
// title: string;
// commentId: number;
// content: string;
// }
```
This result is correct and it’s a valid way of displaying this type. But there’s a more

concise representation available: FullComment is just BlogComment. We can get a more

concise type by checking for this case:

```
type PartiallyPartial<T extends object, K extends keyof T> =
[K] extends [ never ]
? T // special case
: T extends unknown // extra conditional to preserve distribution over unions
? Resolve<Partial<Pick<T, K>> & Omit<T, K>>
: never ;
```
```
type FullComment = PartiallyPartial<BlogComment, never >;
// ^? type FullComment = BlogComment
```
See Item 53 for an explanation of why we’ve wrapped the condition in a tuple type

([K] instead of K) and added a T extends unknown clause. Adding this special case

does not change the behavior of PartiallyPartial at all, it just improves the way it

displays its result in one situation.

```
Item 56: Pay Attention to How Types Display | 251
```

```
6 For TypeScript, see https://oreil.ly/C5EzQ.
```
You may see some other techniques used to adjust type display, for example:

- Exclude<keyof T, never> to inline keyof expressions
- unknown & T or {} & T to inline object types

These can both be replaced by Resolve, which has the same effect and is less brittle.

When you change the display of your types, make sure you don’t sacrifice legibility in

one case for the sake of another. Since these manipulations are subtle and don’t affect

assignability, it’s easy for regressions to go unnoticed. New versions of TypeScript can

also affect how types display. For this reason, it’s important to have a system in place

for testing the display of types. Item 55 shows you how.

**Things to Remember**

- There are many valid ways to display the same type. Some are clearer than others.
- TypeScript gives you some tools to control how types display, notably the
    Resolve generic. Make judicious use of this to clarify type display and hide
    implementation details.
- Consider handling important special cases of generic types to improve type
    display.
- Write tests for your generic types and their display to avoid regressions.

### Item 57: Prefer Tail-Recursive Generic Types

The history of computing is filled with accidental programming languages. You add

some customizability to a system. Your users like it and ask for more. You add a few

more useful features. You keep giving your users more control. Soon enough, some‐

one points out that you’re Turing Complete!^6 Famous examples of this dynamic

include Microsoft Excel, the C preprocessor, C++ templates, and TypeScript generic

types.

These accidental programming languages are often purely functional because this

paradigm gives you tremendous control with a minimum of concepts. All you need is

function composition and some sort of branching. In the case of TypeScript’s type

system, function composition means instantiating a generic type. And you can get

branching either by looking up keys in an object type or by using a conditional type.

Purely functional languages typically implement looping via recursion. As we saw in

Item 54, this can be used to great effect to process string types.

**252 | Chapter 6: Generics and Type-Level Programming**


But while recursion is conceptually efficient, it comes with some real-world draw‐

backs because each recursive call requires a new entry on the stack.

To see how this can be a problem, let’s write a JavaScript function to sum all the num‐

bers in a list. One way is with recursion:

```
function sum(nums: readonly number []): number {
if (nums.length === 0) {
return 0;
}
return nums[0] + sum(nums.slice(1));
}
```
```
console.log(sum([0, 1, 2, 3, 4]));
```
As you’d expect, this prints:

```
10
```
This is not a very efficient way to sum a list of numbers. Each number in the list

entails another recursive call that uses stack space and will eventually overflow. For

me, using Node.js, this happens when the array has somewhere between 7,000 and

8,000 elements:

```
const arr = Array(7875).fill(1);
console.log(sum(arr));
```
```
return nums[0] + sum(nums.slice(1));
^
```
```
RangeError: Maximum call stack size exceeded
```
A version of sum implemented using a for-of loop would have no such limitation. So

are loops inherently better than recursion? Not so fast! Long ago, functional pro‐

grammers came up with a clever solution to this problem. If the last thing a function

does is call itself recursively and return that value, it can give up its space on the

stack: its work is done and it doesn’t need it any more. This is known as Tail Call

Optimization (TCO) and functions with this form are called tail recursive.

Here’s a tail-recursive version of sum that uses an accumulator:

```
function sum(nums: readonly number [], acc=0): number {
if (nums.length === 0) {
return acc;
}
return sum(nums.slice(1), nums[0] + acc);
}
```
```
Item 57: Prefer Tail-Recursive Generic Types | 253
```

```
7 Although ES2015 requires that JavaScript engines support Tail Call Optimization, at the time of this writing
only Safari does. This means that to see TCO in action, you need to use a runtime like bun that’s based on
JavaScriptCore (Safari) rather than one like Node that’s based on V8 (Chrome)
```
Running this quickly produces the correct result without a stack overflow:^7

```
$ bun sum-tail-rec.js
7875
```
The same concerns apply to recursive TypeScript type aliases. TypeScript limits the

number of recursive instantiations of a type alias to prevent infinite loops and slug‐

gishness in the type checker. But it supports Tail Call Optimization and gives tail-

recursive type aliases a much greater depth limit. Because they are more efficient and

more capable, you should make recursive type aliases tail recursive whenever

possible.

This is particularly relevant for generics that process string literal types one character

at a time. For example, here’s a generic type that converts a string literal type to the

union of the characters in the string:

```
type GetChars<S extends string > =
S extends `${ infer FirstChar}${ infer RestOfString}`
? FirstChar | GetChars<RestOfString>
: never ;
```
```
type ABC = GetChars<"abc">;
// ^? type ABC = "a" | "b" | "c"
```
This performs an operation (a union with FirstChar) after its recursive call, so it is

not tail recursive. For string literal types longer than about 50 characters, you’ll get an

overflow:

```
type Long = GetChars<"abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWX">;
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Type instantiation is excessively deep and possibly infinite.
```
For a more realistic example of how this could cause a problem, let’s revisit objectTo

Camel from Item 54. That function took an object with snake_cased properties

({foo_bar: 0}) and returned an equivalent object with camelCased properties

({fooBar: 0}). We developed a ToCamel generic to convert the string literal type

"foo_bar" into "fooBar".

Now let’s go in the opposite direction and implement ToSnake. There’s no delimiter

(“_”) in this case, so we’ll process the string type character by character.

Here’s an implementation:

```
type ToSnake<T extends string > =
string extends T
```
**254 | Chapter 6: Generics and Type-Level Programming**


```
8 Try Googling “VirtualMachineDeviceRuntimeInfoVirtualEthernetCardRuntimeStateVmDirectPathGen2Inac‐
tiveReasonOther.”
```
```
? string // We want ToSnake<string> = string
: T extends `${ infer First}${ infer Rest}`
? (First extends Uppercase<First> // Is First a capital letter?
? `_${Lowercase<First>}${ToSnake<Rest>}` // e.g. "B" -> "_b"
: `${First}${ToSnake<Rest>}`)
: T;
```
```
type S = ToSnake<'fooBarBaz'>;
// ^? type S = "foo_bar_baz"
```
```
type Two = ToSnake<'className' | 'tagName'>;
// ^? type Two = "class_name" | "tag_name"
```
There are two recursive calls here, depending on whether the first character of the

string literal type is a capital letter. If so, we want to replace it with an underscore and

a lowercase letter and keep going. Otherwise we leave it as is and keep going. The

second example shows that it distributes over unions correctly (Item 53).

This type alias does work after the recursive call in each branch of the conditional

(string concatenation, lowercasing), so it’s not tail recursive. And, as you might expect

by now, it’s easy for it to overflow the stack:

```
type Long = ToSnake<'reallyDescriptiveNamePropThatsALittleTooLoquacious'>;
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Type instantiation is excessively deep and possibly infinite.
```
If you try to snake_case an object with a long key using this helper, your type will

blow up. While 50 characters might seem like enough for a property name, there are

many examples of properties that are much longer, particularly in the Java world.^8

We can lift the limitation for long string literal types and speed up type checking for

all instantiations by refactoring ToSnake to be tail recursive:

```
type ToSnake<T extends string , Acc extends string = ""> =
string extends T
? string // We want ToSnake<string> = string
: T extends `${ infer First}${ infer Rest}`
? ToSnake<
Rest,
First extends Uppercase<First>
? `${Acc}_${Lowercase<First>}`
: `${Acc}${First}`
>
: Acc;
```
```
type S = ToSnake<'fooBarBaz'>;
// ^? type S = "foo_bar_baz"
```
```
Item 57: Prefer Tail-Recursive Generic Types | 255
```

```
type Two = ToSnake<'className' | 'tagName'>;
// ^? type Two = "class_name" | "tag_name"
```
```
type Long = ToSnake<'reallyDescriptiveNamePropThatsALittleTooLoquacious'>;
// ^? type Long = "really_descriptive_name_prop_thats_a_little_too_loquacious"
```
As with the tail-recursive version of sum, we’ve added an accumulator to track the

work we’ve done so far. This allows us to shift the recursive instantiation into a tail

position and lift the limit. You’ll be able to snake_case whatever wordy property

names your Java coworkers throw at you!

**Things to Remember**

- Aim to make your recursive generic types tail recursive. They’re more efficient
    and have greater depth limits.
- Recursive type aliases can often be made tail recursive by rewriting them to use
    an accumulator.

### Item 58: Consider Codegen as an Alternative to Complex Types

```
Beware of the Turing tar-pit in which everything is possible but nothing of interest is easy.
—Alan Perlis
```
This chapter has explored programming at the type level in TypeScript. This means

implementing logic and functions that operate on types rather than values (Item 50).

Just like regular programs, we can write tests (Item 55) and think about their perfor‐

mance (Item 57). Especially with tools for working with template literal types (Item

54 ), type-level programs in TypeScript can do some truly impressive things.

TypeScript’s type system is Turing complete, so in theory you can represent any com‐

putation with it. As the quote at the start of this item warns, though, just because

something is possible does not mean it’s easy. Or wise.

Suppose your TypeScript program interacts with a database and includes some SQL:

```
async function getBooks(db: Database) {
const result = await db.query(
`SELECT title, author, year, publisher FROM books`
);
return result.rows;
}
```
With some cleverness, you may be able to use template literal types and conditional

types to parse that query in TypeScript’s type system. Combine this with a type repre‐

senting your database schema, and you may actually be able to infer the result type of

**256 | Chapter 6: Generics and Type-Level Programming**


that query from the query SQL itself. This is an impressive achievement, and you’ll

certainly get more precise types from it.

But what if your program also includes this query?

```
async function getLatestBookByAuthor(db: Database, publisher: string ) {
const result = await db.query(
`SELECT author, MAX(year) FROM books GROUP BY author WHERE publisher=$1`,
[publisher]
);
return result.rows;
}
```
Getting the right types for this query is substantially harder. Your SQL query parser

will need to understand GROUP BY clauses, MAX expressions, and know that the $1

placeholder means that you need to pass a second parameter with a single string in

an array. Even if you were able to build a parser for the first query, this one will likely

push your code into the “Turing tar-pit”, where everything is possible but nothing is

easy. You may also find it increasingly hard to be sure you’re following the advice of

Item 40 to prefer imprecise types to inaccurate types. With more complex programs,

it’s easier to make mistakes.

There’s an alternative that’s considerably simpler, though: code generation, or code‐

gen. Codegen is metaprogramming in the true sense: programs that operate on code

and generate other code. The beauty of codegen is that it lets you write your type

manipulations in any language you like. Yes, TypeScript’s type system is powerful and

capable, but it’s probably not your first choice for getting a job done. With codegen,

you can write your type manipulation code in ordinary TypeScript. You could also

use Python or Rust. Even a shell script might do the job.

For our SQL queries, one option is to use the PgTyped library. It finds appropriately-

tagged SQL queries in your TypeScript, examines them against a live database, and

writes out a type declaration file with the input and output types. Here’s how you’d

write your query in TypeScript using PgTyped:

```
// books-queries.ts
import { sql } from '@pgtyped/runtime';
const selectLatest = sql`
SELECT author, MAX(year)
FROM books
GROUP BY author
WHERE publisher=$publisher
`;
```
```
async function getLatestBookByAuthor(db: Database, publisher: string ) {
const result = await selectLatest.run({publisher}, db);
// ^? const result: any[]
return result;
}
```
```
Item 58: Consider Codegen as an Alternative to Complex Types | 257
```

Then you run the pgtyped command to do codegen:

```
$ npx pgtyped -c pgtyped.config.json
```
(pgtyped.config.json is a file that tells PgTyped how to connect to your database)

This results in a new file containing some types:

```
// books-queries.types.ts
/** Types generated for queries found in "books-queries.ts" */
```
```
/** 'selectLatest' parameters type */
export interface selectLatestParams {
publisher: string ;
}
```
```
/** 'selectLatest' return type */
export interface selectLatestResult {
author: string ;
year: number ;
}
```
```
/** 'selectLatest' query type */
export interface selectLatestQuery {
params: selectLatestParams;
result: selectLatestResult;
}
```
and some changes to books-queries.ts:

```
// books-queries.ts
import { sql } from '@pgtyped/runtime';
import { selectLatestQuery } from './books-queries.types';
export const selectLatestBookByAuthor = sql<selectLatestQuery>`
SELECT author, MAX(year)
FROM books
GROUP BY author
WHERE publisher=$publisher
`;
```
```
async function getLatestBookByAuthor(db: Database, publisher: string ) {
const result = await selectLatestBookByAuthor.run({publisher}, db);
// ^? const result: selectLatestResult[]
return result;
}
```
Our query is now correctly typed! PgTyped is certainly not a simple program, but it’s

written in TypeScript, uses standard database and testing libraries, and is surely less

painful to develop than any equivalently powerful tool written in TypeScript’s type

system would be.

**258 | Chapter 6: Generics and Type-Level Programming**


In addition to allowing you to work in a more conventional programming system, the

codegen approach gives you complete control over how the types display. The tricks

described in Item 56 won’t be needed with your generated types. You can make them

look exactly the way you like. Don’t like the snake_case type names? Just pipe them

through sed or your text processing tool of choice.

The resulting types are also likely to be much less taxing on the TypeScript compiler

and language services than your hand-rolled SQL parser.

The one notable cost of code generation is that it adds another build step that must be

run regularly to ensure that the generated code stays in sync. In the SQL case, that

means that the pgtyped command would need to be rerun whenever a query changes

or the database schema changes. The usual way to enforce this is by doing codegen on

your continuous integration (CI) system and running git diff to make sure nothing

has changed. You might also add this as a pre-push check.

Software engineering is a constant battle against complexity. Major programming

languages like TypeScript and the ecosystems around them have been built to give

you a fighting chance. Type-level TypeScript, while an impressive tool, is not the best

weapon in this battle. If you write some fancy type-level code in TypeScript and feel

like you’re wading through the Turing tar-pit, consider whether you could generate

types instead and write your code in a more conventional language.

Items 42 and 74 explore other ways in which codegen can be used to improve type

safety and reduce maintenance overhead.

**Things to Remember**

- While type-level TypeScript is an impressively powerful tool, it’s not always the
    best tool for the job.
- For complex type manipulations, consider generating code and types as an alter‐
    native to writing type-level code. Your code generation tool can be written in
    ordinary TypeScript or any other language.
- Run codegen and git diff on your continuous integration system to make sure
    generated code stays in sync.

```
Item 58: Consider Codegen as an Alternative to Complex Types | 259
```


