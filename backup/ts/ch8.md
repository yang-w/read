**CHAPTER 8**

### Type Declarations and @types

Dependency management can be confusing in any language, and TypeScript is no

exception. In fact, because types are often shipped as separate packages, dependencies

in TypeScript can be especially bewildering.

This chapter will help you build a mental model for how dependencies work in Type‐

Script and show you how to sort through some of the issues that can come up with

them. It will also help you craft your own type declaration files to publish and share

with others. By writing great type declarations, you can help not just your own

project but the entire TypeScript community.

### Item 65: Put TypeScript and @types in devDependencies

The Node Package Manager, npm, is ubiquitous in the JavaScript world. It provides

both a repository of JavaScript libraries (the npm registry) and a way to specify which

versions of them you depend on (package.json).

npm draws a distinction between a few types of dependencies, each of which goes in a

separate section of package.json:

dependencies

```
These are packages that are required to run your JavaScript. If you import lodash
at runtime, then it should go in dependencies. When you publish your code on
npm and another user installs it, it will also install these dependencies. (These are
known as transitive dependencies.)
```
devDependencies

```
These packages are used to develop and test your code but are not required at
runtime. Your test framework is an example of a devDependency. Unlike depen
dencies, these are not installed transitively with your packages.
```
##### 283


peerDependencies

```
These are packages that you require at runtime but don’t want to be responsible
for tracking. If you publish a React component, for example, it will be compatible
with a range of versions of React itself. You’d prefer that the user select one,
rather than you choosing for them, which could result in multiple versions of
React running on the same page.
```
Of these, dependencies and devDependencies are by far the most common. As you

use TypeScript, be aware of which type of dependency you’re adding. Because Type‐

Script is a development tool and TypeScript types do not exist at runtime (Item 3),

packages related to TypeScript generally belong in devDependencies.

The first dependency to consider is TypeScript itself. While you can install TypeScript

system-wide, this is a bad idea for two main reasons:

- There’s no guarantee that you and your coworkers will always have the same ver‐
    sion installed.
- It adds a step to your project setup.

Make TypeScript a devDependency instead. That way you and your coworkers will

always get the correct version when you run npm install. You update TypeScript the

same way you’d update any other package.

Your IDE and build tools will happily discover a version of TypeScript installed in this

way. On the command line, for example, you can use npx to run the version of tsc

installed by npm:

```
$ npx tsc
```
The next type of dependency to consider is type dependencies or @types. If a library

itself does not come with TypeScript type declarations, then you may still be able to

find typings on DefinitelyTyped, a community-maintained collection of type defini‐

tions for JavaScript libraries. Type definitions from DefinitelyTyped are published on

the npm registry under the @types scope: @types/jquery has type definitions for

jQuery, @types/lodash has types for Lodash, and so on. These @types packages only

contain the types. They don’t contain the implementation.

Your @types dependencies should also be devDependencies, even if the package itself

is a direct dependency. For example, to depend on React and its type declarations,

you might run:

```
$ npm install react
```
```
$ npm install --save-dev @types/react
```
**284 | Chapter 8: Type Declarations and @types**


This will result in a package.json file that looks something like this:

```
{
"devDependencies" : {
"@types/react" : "^18.2.23",
"typescript" : "^5.2.2"
},
"dependencies" : {
"react" : "^18.2.0"
}
}
```
The idea here is that you should publish JavaScript, not TypeScript, and your Java‐

Script does not depend on the @types when you run it. (TypeScript users might

depend on these @types, but transitive types dependencies are best avoided. Item 70

will show you how.)

What if you’re building a web app, with no intentions to ever publish it as a library

on npm? You may find advice to the effect that it’s not worth separating out

devDependencies in this situation, and that you may as well just make everything a

prod dependency. Even for a web app, though, putting @types in devDependencies

has a few advantages:

- If your app has a server component, you can run npm install --production to
    only install prod dependencies in your production image. Assuming you’ve com‐
    piled your TypeScript to JavaScript already, these will be the only dependencies
    you need to run your code. This will result in a slimmer image that spins up
    more quickly.
- If you’re using an automated dependency update tool (such as Renovate or
    Dependabot), you can tell it to prioritize production dependencies. These are the
    ones that are more likely to have important security updates that could affect end
    users of your code, and these are the ones that you should focus on.

There are a few things that can go wrong with @types dependencies, and the next

item will delve deeper into this topic.

**Things to Remember**

- Understand the difference between dependencies and devDependencies in
    package.json.
- Put TypeScript in your project’s devDependencies. Don’t install TypeScript
    system-wide.
- Put @types dependencies in devDependencies, not dependencies.

```
Item 65: Put TypeScript and @types in devDependencies | 285
```

### Item 66: Understand the Three Versions Involved in Type Declarations

Dependency management rarely conjures up happy feelings for software developers.

Usually, you just want to use a library and not think too much about whether its tran‐

sitive dependencies are compatible with yours.

The bad news is that TypeScript doesn’t make this any better. In fact, it can make

dependency management quite a bit more complicated. This is because instead of

having a single version to worry about, you now have up to three:

- The version of the package
- The version of its type declarations (@types)
- The version of TypeScript

If any of these versions get out of sync with one another, you can run into errors that

may not be clearly related to dependency management. But as the saying goes, “make

things as simple as possible, but no simpler.” Understanding the full complexity of

TypeScript package management will help you diagnose and fix problems. And it will

help you make more informed decisions when it comes time to publish type declara‐

tions of your own.

Here’s how dependencies in TypeScript are supposed to work. You install a package as

a direct dependency, and you install its types as a dev dependency (see Item 65):

```
$ npm install react
+ react@18.2.0
```
```
$ npm install --save-dev @types/react
+ @types/react@18.2.23
```
Note that the major and minor versions (18.2) match but the patch versions (.0

and .23) do not. This is exactly what you want to see. The 18.2 in the @types version

means that these type declarations describe the API of version 18.2 of react. Assum‐

ing the react module follows good semantic versioning hygiene, the patch versions

(18.2.1, 18.2.2, ... ) will not change its public API and will not require updates to

the type declarations. But the type declarations themselves might have bugs or omis‐

sions. The patch versions of the @types module correspond to these sorts of fixes and

additions. In this case, there were many more updates to the type declarations than

the library itself (23 versus 0).

Version matching can go wrong in a few ways.

First, you might update a library but forget to update its type declarations. This often

happens as a result of automatic dependency updating tools such as Dependabot. In

**286 | Chapter 8: Type Declarations and @types**


this case you’ll get type errors whenever you try to use new features of the library. If

there were breaking changes to the library, you might get runtime errors despite your

code passing the type checker.

The solution is usually to update your type declarations so that the versions are back

in sync. If the type declarations have not been updated, you have a few options. You

can use an augmentation in your own project to add new functions and methods that

you’d like to use (Item 71 shows you how). Or you can contribute updated type decla‐

rations back to the community.

Second, your type declarations might get ahead of your library. This can happen if

you’ve been using a library without its typings (perhaps you gave it an any type using

declare module) and try to install them later. If there have been new releases of the

library and its type declarations, your versions might be out of sync. The symptoms

of this are similar to the first problem, just in reverse. The type checker will be com‐

paring your code against the latest API, while you’ll be using an older one at runtime.

The solution is to either upgrade the library or downgrade the type declarations until

they match.

Third, the type declarations might require a newer version of TypeScript than you’re

using in your project. Much of the development of TypeScript’s type system has been

motivated by an attempt to more precisely type popular JavaScript libraries like

Lodash, React, and Ramda. It makes sense that the type declarations for these libra‐

ries would want to use the latest and greatest features to get you better type safety.

You’ll experience this problem as type errors in the @types declarations themselves.

The solution is to do one of the following: upgrade your TypeScript version, use an

older version of the type declarations, or, if you really can’t update TypeScript, stub

out the types with declare module. It is possible for a library to provide different

type declarations for different versions of TypeScript via typesVersions. This is rare

(well under 1% of packages on DefinitelyTyped do so), but you may encounter it in

widely used typings like @types/node and @types/react.

To install @types for a specific version of TypeScript, you can use:

```
npm install --save-dev @types/react@ts4.9
```
The version matching between libraries and their types is best effort and may not

always be correct. But the more popular the library is, the more likely it is that its type

declarations will get this right.

Fourth, you can wind up with duplicate @types dependencies. Say you depend on

@types/foo and @types/bar. If @types/bar depends on an incompatible version of

@types/foo, then npm will attempt to resolve this by installing both versions, one in

a nested folder:

```
Item 66: Understand the Three Versions Involved in Type Declarations | 287
```

```
node_modules/
@types/
foo/
index.d.ts @1.2.3
bar/
index.d.ts
node_modules/
@types/
foo/
index.d.ts @2.3.4
```
While this is sometimes OK for node modules that are used at runtime, it almost cer‐

tainly won’t be OK for type declarations, which live in a flat global namespace. You’ll

see this as errors about duplicate declarations or declarations that cannot be merged.

You can track down why you have a duplicate type declaration by running npm ls

@types/foo. The solution is typically to update your dependency on @types/foo or

@types/bar so that they are compatible.

Transitive @types dependencies like these are often a source of trouble. If you’re pub‐

lishing types, see Item 70 for a way to avoid them. If you have a large number of

duplicated type declarations, it can even become a performance issue for the Type‐

Script compiler. Item 78 dives into this topic in more detail.

Some packages, particularly those written in TypeScript, choose to bundle their own

type declarations. This is usually indicated by a "types" field in their package.json

which points to a .d.ts file:

```
{
"name" : "left-pad",
"version" : "1.3.0",
"description" : "String left pad",
"main" : "index.js",
"types" : "index.d.ts"
// ...
}
```
Does this solve all our problems? Would I even be asking if the answer was “yes”?

Bundling types does solve the problem of version mismatch, particularly if the library

itself is written in TypeScript and the type declarations are generated by tsc (with the

declaration setting). But bundling has some problems of its own.

First, what if there’s an error in the bundled types that can’t be fixed through augmen‐

tation (Item 71)? Or the types worked fine when they were published, but a new

TypeScript version has since been released which flags an error. With @types, you

could depend on the library’s implementation but not its type declarations. But with

bundled types, you lose this option. One bad type declaration might keep you stuck

on an old version of TypeScript. Contrast this with DefinitelyTyped: as TypeScript is

**288 | Chapter 8: Type Declarations and @types**


developed, Microsoft runs it against all the type declarations on DefinitelyTyped.

Breaks are fixed quickly.

Second, what if your types depend on another library’s type declarations? Usually, this

would be a devDependency (Item 65). But if you publish your module and another

user installs it, they won’t get your devDependencies. Type errors will result. On the

other hand, you probably don’t want to make it a direct dependency either, since then

your JavaScript users will install @types modules for no reason. Item 70 discusses the

standard workaround for this situation. But if you publish your types on Definitely‐

Typed, this is not a problem at all: you declare your type dependency there, and only

your TypeScript users will get it.

Some projects adopt a hybrid solution of publishing their TypeScript types as a sepa‐

rate package. This keeps you in control of your own code while still allowing you to

cleanly separate the implementation and type dependency trees.

Third, what if you need to fix an issue with the type declarations of an old version of

your library? Would you be able to go back and release a patch update? DefinitelyTy‐

ped has mechanisms for simultaneously maintaining type declarations for different

versions of the same library, something that might be hard for you to do in your own

project.

Fourth, how committed are you to accepting patches for type declarations? Remem‐

ber, the versions of react and @types/react from the start of this item. There were

far more patch updates to the type declarations than the library itself. DefinitelyTy‐

ped is community maintained and is able to handle this volume. In particular, if a

library maintainer doesn’t look at a patch within five days, a global maintainer will.

Can you commit to a similar turnaround time for your library?

Managing dependencies in TypeScript can be challenging, but it does come with

rewards: well-written type declarations can help you learn how to use libraries cor‐

rectly and can greatly improve your productivity with them. As you run into issues

with dependency management, keep the three versions in mind.

If you are publishing packages, weigh the pros and cons of bundling type declarations

versus publishing them on DefinitelyTyped. The official recommendation is to bun‐

dle type declarations only if the library is written in TypeScript. This works well in

practice since tsc can automatically generate type declarations for you (by using the

declaration compiler option). For JavaScript libraries, handcrafted type declarations

are more likely to contain errors, and they’ll require more updates. If you publish

your type declarations on DefinitelyTyped, the community will help you support and

maintain them.

```
Item 66: Understand the Three Versions Involved in Type Declarations | 289
```

**Things to Remember**

- There are three versions involved in an @types dependency: the library version,
    the @types version, and the TypeScript version.
- Recognize the symptoms of different types of version mismatch.
- If you update a library, make sure you update the corresponding @types.
- Understand the pros and cons of bundling types versus publishing them on
    DefinitelyTyped. Prefer bundling types if your library is written in TypeScript,
    and DefinitelyTyped if it is not.

### Item 67: Export All Types That Appear in Public APIs

Use TypeScript long enough and you’ll eventually find yourself wanting to use a type

or interface from a third-party library, only to find that it isn’t exported. This is just

a nuisance for library users. As you’ll see, any type that’s part of a public API is effec‐

tively exported anyway, even if not explicitly. As a library author, this means that you

ought to just export your types to begin with as a convenience to your users.

Suppose you want to create some private, unexported types:

```
interface SecretName {
first: string ;
last: string ;
}
```
```
interface SecretSanta {
name: SecretName;
gift: string ;
}
```
```
export function getGift(name: SecretName, gift: string ): SecretSanta {
// ...
}
```
As a user of your module, I cannot directly import SecretName or SecretSanta, only

getGift. But this is more an annoyance than a firm barrier: because those types

appear in an exported function signature, I can extract them. One way is to use the

Parameters and ReturnType generic types:

```
type MySanta = ReturnType< typeof getGift>;
// ^? type MySanta = SecretSanta
type MyName = Parameters< typeof getGift>[0];
// ^? type MyName = SecretName
```
If your goal in not exporting these types was to preserve flexibility, then the jig is up!

You’ve already committed to them by putting them in a public API. Do your users a

favor and export them.

**290 | Chapter 8: Type Declarations and @types**


**Things to Remember**

- Export types that appear in any form in any public method. Your users will be
    able to extract them anyway, so you may as well make it easy for them.

### Item 68: Use TSDoc for API Comments

Here’s a TypeScript function to generate a greeting:

```
// Generate a greeting. Result is formatted for display.
function greet(name: string , title: string ) {
return `Hello ${title} ${name}`;
}
```
The author was kind enough to leave a comment describing what this function does.

But for documentation intended to be read by users of your functions, it’s better to

use JSDoc-style comments:

```
/** Generate a greeting. Result is formatted for display. */
function greetJSDoc(name: string , title: string ) {
return `Hello ${title} ${name}`;
}
```
The reason is that there is a nearly universal convention in editors to surface JSDoc-

style comments when the function is called (see Figure 8-1).

Figure 8-1. JSDoc-style comments are shown in tooltips in your editor.

The inline comment, in contrast, gets no such treatment (see Figure 8-2).

Figure 8-2. Inline comments are typically not shown in tooltips.

The TypeScript language service supports this convention, and you should take

advantage of it. If a comment describes a public API, it should be JSDoc. In the con‐

text of TypeScript, these comments are sometimes called TSDoc. You can use many of

the usual conventions like @param and @returns:

```
Item 68: Use TSDoc for API Comments | 291
```

##### /**

```
* Generate a greeting.
* @param name Name of the person to greet
* @param title The person's title
* @returns A greeting formatted for human consumption.
*/
function greetFullTSDoc(name: string , title: string ) {
return `Hello ${title} ${name}`;
}
```
This lets editors show the relevant documentation for each parameter as you’re writ‐

ing out a function call (as shown in Figure 8-3). Only the documentation for the name

parameter is shown here, not title.

Figure 8-3. An @param annotation lets your editor show documentation for the current

parameter as you type it.

You can also use TSDoc with type definitions:

```
/** A measurement performed at a time and place. */
interface Measurement {
/** Where was the measurement made? */
position: Vector3D;
/** When was the measurement made? In seconds since epoch. */
time: number ;
/** Observed momentum */
momentum: Vector3D;
}
```
As you inspect individual fields in a Measurement object, you’ll get contextual docu‐

mentation (see Figure 8-4).

Figure 8-4. TSDoc for a field is shown when you mouse over that field in your editor.

**292 | Chapter 8: Type Declarations and @types**


The documentation on individual fields is carried along through mapped types so

long as they are “homomorphic” (see Item 15). This includes helper types such as

Partial and Pick.

You can use the @template tag to document type parameters for generic types. Item

50 shows how this works.

TSDoc comments are formatted using Markdown, so if you want to use bold, italic,

or bulleted lists, you can (see Figure 8-5).

Figure 8-5. TSDoc comments can include Markdown formatting.

Try to avoid writing essays in your documentation, though. The best comments are

short and to the point.

JSDoc includes some conventions for specifying type information (@param {string}

name ...), but you should avoid these in favor of TypeScript types (Item 31).

Finally, you should mark deprecated symbols using the @deprecated tag. Not only

does this provide a clear indication that a function is deprecated, it also enables the

most aggressive TSDoc feature of all: @deprecated symbols are typically rendered

using strikethrough text. This means you don’t even need to inspect a symbol to

know it’s deprecated, as you can see in Figure 8-6.

Figure 8-6. Symbols marked with the @deprecated tag are struck through.

```
Item 68: Use TSDoc for API Comments | 293
```

If you mark a method as deprecated, do your users a favor and say what the new

alternative is. At the very least, include a reference to documentation on the

deprecation.

**Things to Remember**

- Use JSDoc-/TSDoc-formatted comments to document exported functions,
    classes, and types. This helps editors surface information for your users when it’s
    most relevant.
- Use @param, @returns, and Markdown for formatting.
- Avoid including type information in documentation (see Item 31).
- Mark deprecated APIs with @deprecated.

### Item 69: Provide a Type for this in Callbacks if It’s Part of Their API

JavaScript’s this keyword is one of the most notoriously confusing parts of the lan‐

guage. Unlike variables declared with let or const, which are lexically scoped, this is

dynamically scoped: its value depends not on where it appears in your code but on

how you get there.

this is most often used in classes, where it typically references the current instance of

an object:

```
class C {
vals = [1, 2, 3];
logSquares() {
for ( const val of this .vals) {
console.log(val ** 2);
}
}
}
```
```
const c = new C();
c.logSquares();
```
This logs:

```
1
4
9
```
**294 | Chapter 8: Type Declarations and @types**


Now look what happens if you try to put logSquares in a variable and call that:

```
const c = new C();
const method = c.logSquares;
method();
```
This version throws an error at runtime:

```
for (const val of this.vals) {
^
```
```
TypeError: Cannot read properties of undefined (reading 'vals')
```
The problem is that c.logSquares() actually does two things: it calls

C.prototype.logSquares and it binds the value of this in that function to c. By

pulling out a reference to logSquares, you’ve separated these, and this gets set to

undefined.

JavaScript gives you complete control over this binding. You can use call to explic‐

itly set this and fix the problem:

```
const c = new C();
const method = c.logSquares;
method.call(c); // Logs the squares again
```
There’s no reason that this had to be bound to an instance of C. It could have been

bound to anything. So libraries can, and do, make the value of this part of their APIs.

Even the DOM does this in event handlers, for instance:

```
document.querySelector('input')?.addEventListener('change', function (e) {
console.log( this ); // Logs the input element on which the event fired.
});
```
this binding often comes up in the context of callbacks like this one. If you want to

define an onClick handler in a class, for example, you might try this:

```
class ResetButton {
render() {
return makeButton({text: 'Reset', onClick: this .onClick});
}
onClick() {
alert(`Reset ${ this }`);
}
}
```
When a user clicks the button, it will alert with “Reset undefined.” Oops! As usual, the

culprit is this binding. A common solution is to create a bound version of the

method in the constructor:

```
class ResetButton {
constructor () {
this .onClick = this .onClick.bind( this );
}
```
```
Item 69: Provide a Type for this in Callbacks if It’s Part of Their API | 295
```

```
render() {
return makeButton({text: 'Reset', onClick: this .onClick});
}
onClick() {
alert(`Reset ${ this }`);
}
}
```
The onClick() { ... } definition defines a property on ResetButton.prototype.

This is shared by all instances of ResetButton. When you bind this.onClick = ...

in the constructor, it creates a property called onClick on the instance of

ResetButton with this bound to that instance. The onClick instance property comes

before the onClick prototype property in the lookup sequence, so this.onClick

refers to the bound function in the render() method.

There is a shorthand for this binding that is extremely convenient:

```
class ResetButton {
render() {
return makeButton({text: 'Reset', onClick: this .onClick});
}
onClick = () => {
alert(`Reset ${ this }`); // "this" refers to the ResetButton instance.
}
}
```
Here we’ve replaced onClick with an arrow function. This will define a new function

every time a ResetButton is constructed with this set to the appropriate value. It’s

instructive to look at the generated JavaScript:

```
class ResetButton {
constructor() {
this .onClick = () => {
alert(`Reset ${ this }`); // "this" refers to the ResetButton instance.
};
}
render() {
return makeButton({ text: 'Reset', onClick: this .onClick });
}
}
```
So what does this all have to do with TypeScript? Because this binding is part of

JavaScript, TypeScript models it. This means that if you’re writing (or typing) a

library that sets the value of this on callbacks, then you should model it, too.

You can do so by adding a this parameter to your callback:

```
function addKeyListener(
el: HTMLElement,
listener: ( this : HTMLElement, e: KeyboardEvent) => void
) {
```
**296 | Chapter 8: Type Declarations and @types**


```
el.addEventListener('keydown', e => listener.call(el, e));
}
```
The this parameter is special: it’s not just another positional argument. You can see

this if you try to call it with two parameters:

```
function addKeyListener(
el: HTMLElement,
listener: ( this : HTMLElement, e: KeyboardEvent) => void
) {
el.addEventListener('keydown', e => {
listener(el, e);
// ~ Expected 1 arguments, but got 2
});
}
```
Even better, TypeScript will enforce that you call the function with the correct this

context:

```
function addKeyListener(
el: HTMLElement,
listener: ( this : HTMLElement, e: KeyboardEvent) => void
) {
el.addEventListener('keydown', e => {
listener(e);
// ~~~~~~~~ The 'this' context of type 'void' is not assignable
// to method's 'this' of type 'HTMLElement'
});
}
```
As a user of this function, you can reference this in the callback and get full type

safety:

```
declare let el: HTMLElement;
addKeyListener(el, function (e) {
console.log( this .innerHTML);
// ^? this: HTMLElement
});
```
Of course, if you use an arrow function here, you’ll override the value of this. Type‐

Script will catch the issue:

```
class Foo {
registerHandler(el: HTMLElement) {
addKeyListener(el, e => {
console.log( this .innerHTML);
// ~~~~~~~~~ Property 'innerHTML' does not exist on 'Foo'
});
}
}
```
Don’t forget about this! If you set the value of this in your callbacks, then it’s part of

your API, and you should include it in your type declarations.

```
Item 69: Provide a Type for this in Callbacks if It’s Part of Their API | 297
```

If you’re designing a new API, try not to use dynamic this binding. While it was his‐

torically popular, it has always been a source of confusion, and the prevalence of

arrow functions makes this sort of API much harder to use in modern JavaScript.

**Things to Remember**

- Understand how this binding works.
- Provide a type for this in callbacks if it’s part of your API.
- Avoid dynamic this binding in new APIs.

### Item 70: Mirror Types to Sever Dependencies

Suppose you’ve written a library for parsing CSV files. Its API is simple: you pass in

the contents of the CSV file and get back a list of objects mapping column names to

values.

As a convenience for your Node.js users, you allow the contents to be either a string

or a Node.js Buffer:

```
// parse-csv.ts
import {Buffer} from 'node:buffer';
```
```
function parseCSV(contents: string | Buffer): {[column: string ]: string }[] {
if ( typeof contents === 'object') {
// It's a buffer
return parseCSV(contents.toString('utf8'));
}
// ...
}
```
The type definition for Buffer comes from the Node.js type declarations, which you

must install:

```
npm install --save-dev @types/node
```
Here we’re following the advice of Item 65 by making @types dev dependencies rather

than production dependencies.

When you publish your CSV parsing library, you generate type declarations using

--declaration and bundle them with it. Here’s what the generated .d.ts file looks

like:

```
// parse-csv.d.ts
import { Buffer } from 'node:buffer';
export declare function parseCSV(contents: string | Buffer): {
[column: string ]: string ;
}[];
```
**298 | Chapter 8: Type Declarations and @types**


If you take this approach, the JavaScript users of your library will be happy, but Type‐

Script web developers will not be. You’ll get complaints from them that they’re getting

an error from your library:

```
Cannot find module 'node:buffer' or its corresponding type declarations.
```
Because we’ve made @types/node a devDependency, it’s not installed with our pack‐

age, even though our types, which are part of our package, depend on it.

So should we make @types/node a prod dependency? This will make the error go

away, but now you’re likely to get a different set of complaints:

- JavaScript developers will wonder what these @types modules are that they’re
    depending on.
- TypeScript web developers will wonder why they’re depending on Node.js.
- TypeScript developers using a different version of Node.js will wonder why they
    have duplicated type definitions.

These complaints are reasonable. The Buffer behavior isn’t essential and is only rele‐

vant for users who are using Node.js already. And the declaration in @types/node is

only relevant to Node.js users who are also using TypeScript. The @types/node pack‐

age is not small (nearly 100k lines of code), and our library only uses a very tiny part

of it.

TypeScript’s structural typing (Item 4) can help you out of the jam. Rather than using

the declaration of Buffer from @types/node, you can write your own with just the

methods and properties you need. In this case that’s just a toString method that can

accept an encoding:

```
export interface CsvBuffer {
toString(encoding?: string ): string ;
}
export function parseCSV(
contents: string | CsvBuffer
): {[column: string ]: string }[] {
// ...
}
```
This interface is dramatically shorter than the complete one, but it does capture our

(simple) needs from a Buffer. In a Node.js project, calling parseCSV with a real

Buffer is still OK because the types are compatible:

```
parseCSV( new Buffer("column1,column2\nval1,val2", "utf-8")); // OK
```
```
Item 70: Mirror Types to Sever Dependencies | 299
```

Looking again at the CsvBuffer interface, there’s nothing about it that’s specific to

CSV files. Giving it a more “structural” name can reinforce this:

```
/** Anything convertible to a string with an encoding, e.g. a Node buffer. */
export interface StringEncodable {
toString(encoding?: string ): string ;
}
```
Since it’s important that a Node Buffer is assignable to StringEncodable (the com‐

ment says as much!), you should write a unit test that verifies this:

```
import {Buffer} from 'node:buffer';
import {parseCSV} from './parse-csv';
```
```
test('parse CSV in a buffer', () => {
expect(
parseCSV( new Buffer("column1,column2\nval1,val2", "utf-8"))
).toEqual(
[{column1: 'val1', column2: 'val2'}]
);
});
```
This test verifies both the runtime behavior of your code and the assignability of a

Node Buffer to StringEncodable. The test imports node:buffer, but that’s fine

because @types/node can be a devDependency without affecting users of your library.

If your code starts using more methods from the Buffer interface, then you’ll need to

add them to your version of this interface as well. This may feel duplicative but, as

they say in the Go Language community, “a little copying is better than a little

dependency.” If you depend on a large portion of another library’s types, you may

choose to formalize this copying by vendoring the dependency.

In any case, by severing the @types dependency you get a good experience for Java‐

Script and all kinds of TypeScript developers. If the @types dependency had depen‐

dencies of its own, then you may sever an entire dependency tree, which can have a

large positive impact on compiler performance (Item 78).

This technique is also helpful for severing dependencies between your unit tests and

production systems. See the getAuthors example in Item 4.

**Things to Remember**

- Avoid transitive type dependencies in published npm modules.
- Use structural typing to sever dependencies that are nonessential.
- Don’t force JavaScript users to depend on @types. Don’t force web developers to
    depend on Node.js.

**300 | Chapter 8: Type Declarations and @types**


### Item 71: Use Module Augmentation to Improve Types

JavaScript famously has some “bad parts,” like implicit globals and type coercions.

Most of these were design decisions made in the halcyon days of the mid-90s that

have proven extremely hard to reverse.

TypeScript has a few historical warts of its own. One of these is the type declaration

for JSON.parse, which returns any:

```
declare let apiResponse: string ;
```
```
const response = JSON.parse(apiResponse);
const cacheExpirationTime = response.lastModified + 3600;
// ^? const cacheExpirationTime: any
```
If you fail to give response a type, it will quietly spread any types throughout your

code. As Item 5 explained, this will undermine type safety, thwart language services,

and generally give you a poor experience with TypeScript.

It would be better if JSON.parse returned unknown which, as Item 46 explained, can

be used as a type-safe alternative to any. So why doesn’t it? It’s because the unknown

type was only introduced in TypeScript 3.0, which came out in July of 2018. Enor‐

mous amounts of TypeScript code had been written before then, and changing the

return type of JSON.parse would have been extremely disruptive. So the TypeScript

team made a concession to pragmatism. Future code will be a bit less safe, but exist‐

ing code won’t break.

But just because the TypeScript team decided to keep this type signature doesn’t mean

that you have to. Recall from Item 13 that interfaces have a special power that type

aliases do not: they participate in “declaration merging,” where repeated definitions of

the same interface are merged to form a final result.

We can use this to change the type signature of JSON.parse. Here’s what it looks like

(in lib.es5.d.ts):

```
interface JSON {
parse(
text: string ,
reviver?: ( this : any , key: string , value: any ) => any
): any ;
// ...
}
declare var JSON: JSON;
```
We’re interested in the interface. If you define your own interface JSON in a type

declaration file in your project, TypeScript will merge it with the library declarations.

```
// declarations/safe-json.d.ts
interface JSON {
parse(
```
```
Item 71: Use Module Augmentation to Improve Types | 301
```

```
text: string ,
reviver?: ( this : any , key: string , value: any ) => any
): unknown ;
}
```
Note the changed return type. The result is similar to a TypeScript function overload

(Item 52). Since libs are loaded before our code, our overload will always win. The

result is that JSON.parse now returns unknown:

```
const response = JSON.parse(apiResponse);
// ^? const response: unknown
const cacheExpirationTime = response.lastModified + 3600;
// ~~~~~~~~ response is of type 'unknown'.
```
Using it requires a type assertion, which is exactly what you want:

```
interface ApiResponse {
lastModified: number ;
}
const response = JSON.parse(apiResponse) as ApiResponse;
const cacheExpirationTime = response.lastModified + 3600; // ok
// ^? const cacheExpirationTime: number
```
You can do something similar for the fetch API’s Response.prototype.json(),

which also returns any. Here’s a fix:

```
// declarations/safe-response.d.ts
interface Body {
json(): Promise< unknown >;
}
```
These changes were clear wins. But since you’re only making changes that affect your

own code, you’re also free to make more controversial changes that would never fly in

the broader TypeScript ecosystem.

For example, it’s part of the language spec that the Set constructor can take a string.

This results in something that might not be what you expect:

```
> new Set('abc')
Set(3) { 'a', 'b', 'c' }
```
If your intention was to create a one-element set containing 'abc', then this might

introduce bugs in your code. Since the type of both would be Set<string>, and this is

how JavaScript works, TypeScript can’t help you catch this mistake.

But there’s no reason you can’t ban calling the Set constructor with a string in your

own code. It’s a little more difficult than changing the return type of JSON.parse, but

it all comes back to declaration merging.

Here’s the declaration of Set from lib.es2015.collections.d.ts:

```
interface Set<T> {
add(value: T): this ;
```
**302 | Chapter 8: Type Declarations and @types**


```
delete (value: T): boolean ;
has(value: T): boolean ;
readonly size: number ;
// ...
}
```
```
interface SetConstructor {
new <T = any >(values?: readonly T[] | null ): Set<T>;
readonly prototype: Set< any >;
}
declare var Set: SetConstructor;
```
There’s also an overload of the constructor in lib.es2015.iterable.d.ts:

```
interface SetConstructor {
new <T>(iterable?: Iterable<T> | null ): Set<T>;
}
```
This is the one we’d like to “knock out.” Here’s how:

```
// declarations/ban-set-string-constructor.d.ts:
interface SetConstructor {
new (str: string ): void ;
}
```
With this in place, constructing a Set with a string still won’t produce a type error.

But it will return void, so trying to do anything with the result will give you a clue

that something is amiss:

```
const s = new Set('abc');
// ^? const s: void
console.log(s.has('abc'));
// ~~~ Property 'has' does not exist on type 'void'.
const otherSet: Set< string > = s;
// ~~~~~~~~ Type 'void' is not assignable to type 'Set<string>'.
```
To give users a stronger hint what’s going on, you could have the Set constructor

return a string literal type containing an error. You can also mark this constructor

@deprecated to make it appear struck-through in your user’s editor (Item 68):

```
interface SetConstructor {
/** @deprecated */
new (str: string ): 'Error! new Set(string) is banned.';
}
```
```
const s = new Set('abc');
// ^? const s: "Error! new Set(string) is banned."
```
None of these is a perfect solution: it would be better if we produced a type error

when you constructed the Set, rather than producing an unusable type. But that’s not

possible in TypeScript, and this is what real-world applications of this technique often

wind up looking like.

```
Item 71: Use Module Augmentation to Improve Types | 303
```

Of course, with great power comes great responsibility. Here are a few things to be

aware of:

- As with all type-level constructs, this only affects type checking. The runtime
    behavior of JSON.parse and the Set constructor are not affected, either in your
    own code or in library code.
- This technique is best used either to make the built-in types stricter and more
    precise, or to disallow certain things. If you add declarations that don’t reflect
    reality at runtime, you can create a confusing situation. As Item 40 explained,
    incorrect types can be worse than no types.
- We “knocked out” the Set constructor by making it return void or an error
    string. But this won’t work as well if you want to ban a function or method that
    already returns void.

We used declaration merging to improve built-in types, but the same technique can

be used for third-party @types and bundled type declarations as well. You can find a

collection of improvements to the built-in types in the ts-reset npm package.

**Things to Remember**

- Use declaration merging to improve existing APIs or disallow problematic
    constructs.
- Use void or error string returns to “knock out” methods and mark them
    @deprecated.
- Remember that overloads only apply at the type level. Don’t make the types
    diverge from reality.

**304 | Chapter 8: Type Declarations and @types**


