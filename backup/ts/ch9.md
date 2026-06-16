**CHAPTER 9**

### Writing and Running Your Code

This chapter is a bit of a grab bag: it covers some issues that come up in writing code

(not types) as well as issues you may run into when you run your code.

### Item 72: Prefer ECMAScript Features to TypeScript Features

The relationship between TypeScript and JavaScript has changed over time. When

Microsoft first started work on TypeScript in 2010, the prevailing attitude around

JavaScript was that it was a problematic language that needed to be fixed. It was com‐

mon for frameworks and source-to-source compilers to add missing features like

classes, decorators, and a module system to JavaScript. TypeScript was no different.

Early versions included home-grown versions of classes, enums, and modules.

Over time, TC39, the standards body that governs JavaScript, added many of these

same features to the core JavaScript language. And the features they added were not

compatible with the versions that existed in TypeScript. This left the TypeScript team

in an awkward predicament: adopt the new features from the standard or maintain

existing code?

TypeScript has largely chosen to do the former and eventually articulated its current

governing principle: TC39 defines the runtime, while TypeScript innovates solely in

the type space.

There are a few remaining features from before this decision. It’s important to recog‐

nize and understand these, because they don’t fit the pattern of the rest of the lan‐

guage. In general, I recommend avoiding them to keep the relationship between

TypeScript and JavaScript as clear as possible. This will also ensure that your code is

##### 305


compatible with alternative TypeScript compilers and won’t break as a result of future

standards alignment.

If you follow this advice, you can think of TypeScript as “JavaScript with types.”

**Enums**

Many languages model types that can take on a small set of values using enumerations

or enums. TypeScript adds them to JavaScript:

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
The argument for enums is that they provide more safety and transparency than bare

numbers. But enums in TypeScript have some quirks. There are actually several var‐

iants on enums that all have subtly different behaviors:

Number-valued enum (like Flavor)

```
The number type is assignable to this, so it’s not very safe. (It was designed this
way to make bit flag structures possible.)
```
String-valued enum

```
This does offer type safety, and also more informative values at runtime. But it’s
not structurally typed, unlike every other type in TypeScript (more on this
momentarily).
```
const enum

```
Unlike regular enums, const enums go away completely at runtime. If you
changed to const enum Flavor in the previous example, the compiler would
rewrite Flavor.Chocolate as 1. This also breaks our expectations around how
the compiler behaves and still has the divergent behaviors between string and
number-valued enums.
```
const enum with the preserveConstEnums flag set

This emits runtime code for const enums, just like for a regular enum.

That string-valued enums are nominally typed comes as a particular surprise, since

every other type in TypeScript uses structural typing for assignability (Item 4):

**306 | Chapter 9: Writing and Running Your Code**


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
This has implications when you publish a library. Suppose you have a function that

takes a Flavor:

```
function scoop(flavor: Flavor) { /* ... */ }
```
Because a Flavor at runtime is really just a string, it’s fine for your JavaScript users to

call it with one:

```
scoop('vanilla'); // OK in JavaScript
```
but your TypeScript users will need to import the enum and use that instead:

```
scoop('vanilla');
// ~~~~~~~~~ '"vanilla"' is not assignable to parameter of type 'Flavor'
```
```
import {Flavor} from 'ice-cream';
scoop(Flavor.Vanilla); // OK
```
These divergent experiences for JavaScript and TypeScript users are a reason to avoid

string-valued enums.

TypeScript offers an alternative to enums that is less common in other languages: a

union of literal types.

```
type Flavor = 'vanilla' | 'chocolate' | 'strawberry';
```
```
let favoriteFlavor: Flavor = 'chocolate'; // OK
favoriteFlavor = 'americone dream';
// ~~~~~~~~~~~ Type '"americone dream"' is not assignable to type 'Flavor'
```
This offers as much safety as the enum and has the advantage of translating more

directly to JavaScript. It also provides autocomplete in your editor, as shown in

Figure 9-1.

Figure 9-1. TypeScript offering autocomplete for a union of string literal types.

For more on unions of string literal types, see Item 35.

```
Item 72: Prefer ECMAScript Features to TypeScript Features | 307
```

What about numeric enums, like our initial definition of Flavor? If you have the

option, strongly consider using strings for your values instead. Numeric enums don’t

offer the safety you expect, and they’re harder to work with than strings. Which

would you rather see in your JavaScript debugger or in a network request,

{"flavor": 1} or {"flavor": "chocolate"}?

**Parameter Properties**

It’s common to assign constructor parameters to properties when initializing a class:

```
class Person {
name: string ;
constructor (name: string ) {
this .name = name;
}
}
```
TypeScript provides a more compact syntax for this:

```
class Person {
constructor ( public name: string ) {}
}
```
This is called a “parameter property,” and it is equivalent to the code in the first exam‐

ple. There are a few issues to be aware of with parameter properties:

- They are one of the few constructs that generate code when you compile to Java‐
    Script (enums are another). Generally, compilation just involves erasing types.
- Because the parameter is only used in generated code, the source looks like it has
    unused parameters.
- A mix of parameter and nonparameter properties can hide the design of your
    classes.

For example:

```
class Person {
first: string ;
last: string ;
constructor ( public name: string ) {
[ this .first, this .last] = name.split(' ');
}
}
```
This class has three properties (first, last, name), but this is hard to read off the

code because only two are listed before the constructor. This gets worse if the con‐

structor takes other parameters, too.

**308 | Chapter 9: Writing and Running Your Code**


If your class consists only of parameter properties and no methods, you might con‐

sider making it an interface and using object literals. Remember that the two are

assignable to one another because of structural typing (Item 4):

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
Opinions are divided on parameter properties. While I generally avoid them, others

appreciate the saved keystrokes. Be aware that they do not fit the pattern of the rest of

TypeScript, however, and may in fact obscure that pattern for new developers. Try to

avoid hiding the design of your class behind a mix of parameter and nonparameter

properties.

**Namespaces and Triple-Slash Imports**

Before ECMAScript 2015, JavaScript didn’t have an official module system. Different

environments added this missing feature in different ways: Node.js used require and

module.exports, whereas in the browser, the AMD system used a define function

with a callback.

TypeScript also filled this gap with its own module system. This was done using a

module keyword and “triple-slash” imports. After ECMAScript 2015 added an official

module system, TypeScript added namespace as a synonym for module, to avoid

confusion:

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
Outside of type declaration files, triple-slash imports and the module keyword are just

a historical curiosity. In your own code, you should use ECMASCript 2015-style

modules (import and export).

```
Item 72: Prefer ECMAScript Features to TypeScript Features | 309
```

**experimentalDecorators**

Decorators can be used to annotate or modify classes, methods, and properties. If a

symbol is preceded by an @ sign, then it’s a decorator. They’re common in Angular

and several other frameworks.

In 2015, TypeScript added support for a draft proposal of decorators in order to sup‐

port Angular. This was gated behind the --experimentalDecorators flag.

Eight years later, in 2023, the decorators proposal reached stage 3 in a very different

form. You can use standard decorators without any flags. Here’s what an ECMAScript

standard decorator looks like:

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
You can tell which version of decorators you’re using by checking for experimental

Decorators in your tsconfig.json. If it’s set, then you’re using nonstandard decorators.

If you’re able to, turn this off! But you may be forced to keep this setting by a library

or framework, at least until it adopts the latest standards.

If you are using experimentalDecorators, try not to dig the hole deeper by writing

your own nonstandard decorators. You’ll eventually have to migrate these to the stan‐

dard version.

**310 | Chapter 9: Writing and Running Your Code**


If you don’t have this flag set, then feel free to write decorators to your heart’s content.

Just remember that decorators aren’t the best solution to all problems and can some‐

times make your code harder to follow. Try to avoid decorators that change a meth‐

od’s type signature, for example.

**Member Visibility Modifiers (Private, Protected, and Public)**

Historically, JavaScript lacked a way to make the properties and methods of a class

private. The usual workaround was a convention that underscore-prefixed fields

weren’t part of a class’s public API:

```
class Foo {
_private = 'secret123';
}
```
But this only discourages users from accessing private data. It’s easy to circumvent:

```
const f = new Foo();
f._private; // 'secret123'
```
TypeScript adds public, protected, and private field visibility modifiers that seem

to provide some enforcement:

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
But private is a feature of the type system and, as Item 3 explained, features of the

type system all go away at runtime. Here’s what this snippet looks like when Type‐

Script compiles it to JavaScript:

```
class Diary {
constructor() {
this .secret = 'cheated on my English test';
}
}
const diary = new Diary();
diary.secret;
```
The private indicator is gone, and your secret is out! Much like the _private con‐

vention, TypeScript’s visibility modifiers only discourage you from accessing private

data. You can even access a private property from within TypeScript using a type

assertion or iteration:

```
Item 72: Prefer ECMAScript Features to TypeScript Features | 311
```

```
const diary = new Diary();
(diary as any ).secret // OK
```
```
console.log(Object.entries(diary));
// logs [["secret", "cheated on my English test"]]
```
ES2022 officially added support for private fields. Unlike TypeScript’s private,

ECMAScript’s private is enforced both for type checking and at runtime. To use it,

prefix your class property with a #:

```
class PasswordChecker {
#passwordHash: number ;
```
```
constructor (passwordHash: number ) {
this .#passwordHash = passwordHash;
}
```
```
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
The #passwordHash property is not accessible from outside the class and is not enu‐

merable. Even for targets of that don’t natively support private fields (ES2021 or ear‐

lier), there’s a fallback implementation that will keep your data private. ECMAScript

private fields are standard, widely supported, and more secure than TypeScript’s

private. You should use them instead.

What about public and protected? In JavaScript (and TypeScript), public is the

default visibility so there’s no need to annotate this explicitly. And while private

implies encapsulation, protected implies inheritance. The general rule in object-

oriented programming is to prefer composition over inheritance, so practical uses of

protected are quite rare.

readonly as a field modifier is a type-level construct and is fine to use. See Item 14. A

field may be both #private and readonly.

**312 | Chapter 9: Writing and Running Your Code**


**Things to Remember**

- By and large, you can convert TypeScript to JavaScript by removing all the types
    from your code.
- Enums, parameter properties, triple-slash imports, experimental decorators, and
    member visibility modifiers are historical exceptions to this rule.
- To keep TypeScript’s role in your codebase as clear as possible and to avoid future
    compatibility issues, avoid nonstandard features.

### Item 73: Use Source Maps to Debug TypeScript

When you run TypeScript code, you’re actually running the JavaScript that the Type‐

Script compiler generates. This is true of any source-to-source compiler, be it a mini‐

fier, a compiler, or a preprocessor. The hope is that this is mostly transparent, that you

can pretend that the TypeScript source code is being executed without ever having to

look at the JavaScript.

This works well until you have to debug your code. Debuggers generally work on the

code you’re executing and don’t know about the translation process it went through.

Since JavaScript is such a popular target language, browser vendors collaborated to

solve this problem. The result is source maps. They map positions and symbols in a

generated file back to the corresponding positions and symbols in the original source.

Most browsers and many IDEs support them. If you’re not using them to debug your

TypeScript, you’re missing out!

Suppose you’ve created a small script to add a button to an HTML page that incre‐

ments every time you click it:

```
// index.ts
function addCounter(el: HTMLElement) {
let clickCount = 0;
const button = document.createElement('button');
button.textContent = 'Click me';
button.addEventListener('click', () => {
clickCount++;
button.textContent = `Click me (${clickCount})`;
});
el.appendChild(button);
}
```
```
addCounter(document.body);
```
If you load this in your browser and open the debugger, you’ll see the generated Java‐

Script (here we’re using a target of ES5). This closely matches the original source, so

debugging isn’t too difficult, as you can see in Figure 9-2.

```
Item 73: Use Source Maps to Debug TypeScript | 313
```

Figure 9-2. Debugging generated JavaScript using Chrome’s developer tools. For this sim‐

ple example, the generated JavaScript closely resembles the TypeScript source.

Let’s make the page more fun by fetching an interesting fact about each number from

numbersapi.com:

```
// index.ts
function addCounter(el: HTMLElement) {
let clickCount = 0;
const triviaEl = document.createElement('p');
const button = document.createElement('button');
button.textContent = 'Click me';
button.addEventListener('click', async () => {
clickCount++;
const response = await fetch(`http://numbersapi.com/${clickCount}`);
const trivia = await response.text();
triviaEl.textContent = trivia;
button.textContent = `Click me (${clickCount})`;
});
el.appendChild(triviaEl);
el.appendChild(button);
}
```
If you click the button several times quickly, you may discover a race condition! If

you open up your browser’s debugger to investigate now, you’ll see that the generated

source has gotten dramatically more complicated (see Figure 9-3).

**314 | Chapter 9: Writing and Running Your Code**


Figure 9-3. The TypeScript compiler has generated JavaScript that doesn’t closely resem‐

ble the original TypeScript source. This will make debugging more difficult.

To support async and await in older browsers, TypeScript has rewritten the event

handler as a state machine. This has the same behavior, but the code no longer bears

such a close resemblance to the original source. This is where source maps can help.

To tell TypeScript to generate one, set the sourceMap option in your tsconfig.json:

```
{
"compilerOptions" : {
"sourceMap" : true
}
}
```
Now when you run tsc, it generates two output files for each .ts file: a .js file and

a .js.map file. The latter is the source map. With this file in place, a new index.ts file

appears in your browser’s debugger. You can set breakpoints and inspect variables in

it, just as you’d hope (see Figure 9-4).

```
Item 73: Use Source Maps to Debug TypeScript | 315
```

Figure 9-4. When a source map is present, you can work with the original TypeScript

source in your debugger, rather than the generated JavaScript.

Note that index.ts appears in italics in the file list on the left. This indicates that it isn’t

a “real” file in the sense that the web page included it. Rather, it was included via the

source map. Depending on your settings, index.js.map will contain either a reference

to index.ts (in which case the browser loads it over the network) or an inline copy of

it (in which case no request is needed).

There are a few things to be aware of with source maps:

- If you are using a bundler or minifier with TypeScript, it may generate a source
    map of its own. To get the best debugging experience, you want this to map all
    the way back to the original TypeScript sources, not the generated JavaScript. If
    your bundler has built-in support for TypeScript, then this should just work. If
    not, you may need to hunt down some flags to make it read source map inputs.
- Be aware of whether you’re serving source maps in production. If your JS file has
    a reference to the source map, then the browser will only load it when the debug‐
    ger is open, so there’s no performance impact for end users. (Inline source maps
    are always downloaded, so you should avoid them in production.) If your source
    map contains a copy of your original source code, then there may be content that
    you didn’t intend to publicize. Does the world really need to see your snarky
    comments or internal bug tracker URLs?

**316 | Chapter 9: Writing and Running Your Code**


You can also debug Node.js programs using source maps. This is typically done via

your editor or by connecting to your Node process from a browser’s debugger. Here’s

some code written in TypeScript that’s intended to be run in Node.js:

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
(The void in Promise<void> indicates that sleep doesn’t resolve to a usable value,

similar to returning void from a function.)

To debug this, compile it to JavaScript with sourceMap set in your tsconfig.json. Then

run it with node using the --inspect-brk flag:

```
$ tsc bedtime.ts
$ node --inspect-brk bedtime.js
Debugger listening on ws://127.0.0.1:9229/587c380b-fdb4-48df-8c09-a83f36d8a2e7
For help, see: https://nodejs.org/en/docs/inspector
```
Now you can open your browser to debug. In Chrome, for example, you navigate to

chrome://inspect. You should see a remote target that you can “Inspect,” as shown in

Figure 9-5.

Figure 9-5. Selecting a remote debug target to inspect in Google Chrome (chrome://

inspect).

Once you connect, you’ll see the usual browser dev tools with the generated Java‐

Script, as shown in Figure 9-6 (here we’re using a target of ES2015).

```
Item 73: Use Source Maps to Debug TypeScript | 317
```

Figure 9-6. Generated JavaScript for a Node.js program in Google Chrome Devtools.

Note the source map reference at the bottom.

In addition to opening a websocket running the remote debugging protocol, the

--inspect-brk flag pauses execution of your code at the very beginning. This is con‐

venient for switching over to the TypeScript view and setting up breakpoints in the

original source, as shown in Figure 9-7.

Figure 9-7. Debugging the original TypeScript source for a Node.js program.

**318 | Chapter 9: Writing and Running Your Code**


JavaScript’s debugger statement is another convenient way to set a breakpoint exactly

where you want.

If you generate .d.ts files for your project (by setting the declaration option), Type‐

Script can also generate .d.ts.map files that map your type declarations back to the

original source. You enable this by setting declarationMap. This can be useful for

improving languages services like “Go to Definition” in your editor, particularly if

you’re using project references (Item 78).

The type checker can catch many errors before you run your code, but it is no substi‐

tute for a good debugger. Use source maps to get a great TypeScript debugging

experience.

**Things to Remember**

- Don’t debug generated JavaScript. Use source maps to debug your TypeScript
    code at runtime.
- Make sure that your source maps are mapped all the way through to the code that
    you run.
- Know how to debug Node.js code written in TypeScript.
- Depending on your settings, your source maps might contain an inline copy of
    your original code. Don’t publish them unless you know what you’re doing!

### Item 74: Know How to Reconstruct Types at Runtime

At some point in the process of learning TypeScript, most developers have an epiph‐

any when they realize that TypeScript types aren’t “real”: they’re erased at runtime

(Item 3). This might be accompanied by a feeling of dread: if the types aren’t real, how

can you trust them?

The independence of types from runtime behavior is a key part of the relationship

between TypeScript and JavaScript (Item 1). And most of the time this system works

very well. But there are undeniably times when it would be extremely convenient to

have access to TypeScript types at runtime. This item explores how this situation

might arise and what your options are.

Imagine you’re implementing a web server and you define an API endpoint for creat‐

ing a comment on a blog post (we saw this API before in Item 42). You define a Type‐

Script type for the request body:

```
interface CreateComment {
postId: string ;
title: string ;
body: string ;
}
```
```
Item 74: Know How to Reconstruct Types at Runtime | 319
```

Your request handler should validate the request. Some of this validation will be at the

application level (does postId reference a post that exists and that the user can com‐

ment on?), but some will be at the type level (does the request have all the properties

we expect, are they of the right type, and are there any extra properties?).

Here’s what that might look like:

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
This is already a lot of validation code, even with just three properties. Worse, there’s

nothing to ensure that the checks are accurate and in sync with our type. Nothing

checks that we spelled the properties correctly. And if we add a new property, we’ll

need to remember to add a check, too.

This is code duplication at its worst. We have two things (a type and validation logic)

that need to stay in sync. It would be better if there was a single source of truth. The

interface seems like the natural source of truth, but it’s erased at runtime so it’s

unclear how you’d use it in this way.

Let’s look at a few possible solutions to this conundrum.

**Generate the Types from Another Source**

If your API is specified in some other form, perhaps using GraphQL or an OpenAPI

schema, then you can use that as the source of truth and generate your TypeScript

types from it.

This typically involves running an external tool to generate types and, possibly, vali‐

dation code. An OpenAPI spec uses JSON Schema, for example, so you can use a tool

like json-schema-to-typescript to generate the TypeScript types, and a JSON

Schema validator such as Ajv to validate requests.

The downside of this approach is that it adds some complexity and a build step that

must be run whenever your API schema changes. But if you’re already specifying

**320 | Chapter 9: Writing and Running Your Code**


your API using OpenAPI or some other system, then this has the enormous advan‐

tage of not introducing any new sources of truth, and this is the approach that you

should prefer.

If this is a good fit for your situation, then Item 42 includes an example of generating

TypeScript types from a schema.

**Define Types with a Runtime Library**

TypeScript’s design makes it impossible to derive runtime values from static types.

But going the other direction (from a runtime value to a static type) is straightfor‐

ward using the type-level typeof operator:

```
const val = { postId: '123', title: 'First', body: 'That is all'};
type ValType = typeof val;
// ^? type ValType = { postId: string; title: string; body: string; }
```
So one option is to define your types using runtime constructs and derive the static

types from those. This is typically done using a library. There are many of these, but

at the moment the most popular is Zod (React’s PropTypes is another example).

Here’s how the request validation logic would look with Zod:

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
Zod has completely eliminated the duplication: the value createCommentSchema is

now the source of truth, and both the static type CreateComment and the schema vali‐

dation (createCommentSchema.parse) are derived from that.

```
Item 74: Know How to Reconstruct Types at Runtime | 321
```

Zod and the other runtime type libraries are quite effective at solving this problem. So

what are the downsides to using them?

- You now have two ways to define types: Zod’s syntax (z.object) and TypeScript’s
    (interface). While these systems have many similarities, they’re not exactly the
    same. You’re already using TypeScript, so presumably your team has committed
    to learning how to define types using it. Now everyone needs to learn to use Zod
    as well.
- Runtime type systems tend to be contagious: if createCommentSchema needs to
    reference another type, then that type will also need to be reworked into a run‐
    time type. This may make it hard to interoperate with other sources of types, for
    example, if you wanted to reference a type from an external library or generate
    some types from your database (Item 58).

Having a distinct runtime type validation system comes with a few other advantages,

too:

- Libraries like Zod can express many constraints that are hard to capture with
    TypeScript types, for example, “a valid email address” or “an integer.” If you don’t
    use a tool like Zod, you’ll have to write this sort of validation yourself.
- There’s no additional build step. Everything is done through TypeScript. If you
    expect your schema to change frequently, then this will eliminate a failure mode
    and tighten your iteration cycle.

**Generate Runtime Values from Your Types**

If you’re willing to introduce a new tool and build step, then there’s another possibil‐

ity: you can reverse the approach from the previous section and generate a runtime

value from your TypeScript type. JSON Schema is a popular target.

To make this work we’ll put our API types in an api.ts file:

```
// api.ts
export interface CreateComment {
postId: string ;
title: string ;
body: string ;
}
```
then we can run typescript-json-schema to generate JSON Schema for this type:

```
$ npx typescript-json-schema api.ts '*' > api.schema.json
```
Here’s what that file looks like:

```
{
"$schema" : "http://json-schema.org/draft-07/schema#",
"definitions" : {
```
**322 | Chapter 9: Writing and Running Your Code**


```
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
Now we can load api.schema.json at runtime. If you enable TypeScript’s resolveJson

Module option, this can be done with an ordinary import. You can perform validation

using any JSON Schema validation library. Here we use the Ajv library:

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
The great strength of generating values from your TypeScript types is that you can

continue to use all the TypeScript tools you know and love to define your types. You

don’t need to learn a second way to define types since the JSON Schema is an imple‐

mentation detail. Your API types can reference types from @types or other sources

since they’re just TypeScript types.

The downside is that you’ve introduced a new tool and a new build step. Whenever

you change api.ts, you’ll need to regenerate api.schema.json. In practice, you’d want to

enforce that these stay in sync using your continuous integration system.

While you don’t typically need to access TypeScript types at runtime, there are occa‐

sionally situations like input validation where it’s extremely useful. We’ve seen three

approaches to this problem. So which one should you choose?

Unfortunately, there’s no perfect answer. Each option is a trade-off. If your types are

already expressed in some other form, like an OpenAPI schema, then use that as the

source of truth for both your types and your validation logic. This will incur some

tooling and process overhead, but it’s worth it to have a single source of truth.

```
Item 74: Know How to Reconstruct Types at Runtime | 323
```

If not, then the decision is trickier. Would you rather introduce a build step or a sec‐

ond way to define types? If you need to reference types that are only defined using

TypeScript types (perhaps they’re coming from a library or are generated), then gen‐

erating JSON Schema from your TypeScript types is the best option. Otherwise, you

need to pick your poison!

**Things to Remember**

- TypeScript types are erased before your code is run. You can’t access them at run‐
    time without additional tooling.
- Know your options for runtime types: using a distinct runtime type system (such
    as Zod), generating TypeScript types from values (json-schema-to-typescript),
    and generating values from your TypeScript types (typescript-json-schema).
- If you have another specification for your types (e.g., a schema), use that as the
    source of truth.
- If you need to reference external TypeScript types, use typescript-json-schema
    or an equivalent.
- Otherwise, weigh whether you prefer another build step or another system for
    specifying types.

### Item 75: Understand the DOM Hierarchy

Most of the items in this book are agnostic about where you run your TypeScript: in a

web browser, on a server, or on a phone. This one is different. If you’re not working

in a browser, skip ahead to Item 76!

The DOM hierarchy is always present when you’re running JavaScript in a web

browser. When you use document.getElementById to get an element, or

document.createElement to create one, it’s always a particular kind of element, even

if you’re not entirely familiar with the taxonomy. You call the methods and use the

properties that you want and hope for the best.

With TypeScript, the hierarchy of DOM elements becomes more visible. Knowing

your Nodes from your Elements and EventTargets will help you debug type errors

and decide when type assertions are appropriate. Because so many APIs are based on

the DOM, this is relevant even if you’re using a framework like React or D3.

Suppose you want to track a user’s mouse as they drag it across a <div>. You write

some seemingly innocuous JavaScript:

```
function handleDrag(eDown) {
const targetEl = eDown.currentTarget;
targetEl.classList.add('dragging');
const dragStart = [eDown.clientX, eDown.clientY];
```
**324 | Chapter 9: Writing and Running Your Code**


```
const handleUp = (eUp) => {
targetEl.classList.remove('dragging');
targetEl.removeEventListener('mouseup', handleUp);
const dragEnd = [eUp.clientX, eUp.clientY];
console.log('dx, dy = ', [0, 1].map(i => dragEnd[i] - dragStart[i]));
}
targetEl.addEventListener('mouseup', handleUp);
}
const surfaceEl = document.getElementById('surface');
surfaceEl.addEventListener('mousedown', handleDrag);
```
When you add type annotations and run the type checker, it flags no fewer than 11

errors in these 14 lines of code:

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
const handleUp = (eUp: Event) => {
targetEl.classList.remove('dragging');
// ~~~~~ 'targetEl' is possibly 'null'
// ~~~~~~~~~ Property 'classList' does not exist on type 'EventTarget'
targetEl.removeEventListener('mouseup', handleUp);
// ~~~~~ 'targetEl' is possibly 'null'
const dragEnd = [
eUp.clientX, eUp.clientY
// ~~~~~~~ ~~~~~~~ Property '...' does not exist on 'Event'
];
console.log('dx, dy = ', [0, 1].map(i => dragEnd[i] - dragStart[i]));
}
targetEl.addEventListener('mouseup', handleUp);
// ~~~~~ 'targetEl' is possibly 'null'
}
```
```
const surfaceEl = document.getElementById('surface');
surfaceEl.addEventListener('mousedown', handleDrag);
// ~~~~~~ 'surfaceEl' is possibly 'null'
```
What went wrong? What’s this EventTarget? And why might everything be null?

To understand the EventTarget errors, it helps to dig into the DOM hierarchy a bit.

Here’s some HTML:

```
< p id="quote">and < i >yet</ i > it moves</ p >
```
If you open your browser’s JavaScript console and get a reference to the p element,

you’ll see that it’s an HTMLParagraphElement:

```
Item 75: Understand the DOM Hierarchy | 325
```

```
const p = document.getElementsByTagName('p')[0];
p instanceof HTMLParagraphElement
// true
```
An HTMLParagraphElement is a subtype of HTMLElement, which is a subtype of

Element, which is a subtype of Node, which is a subtype of EventTarget. Note that

these are all JavaScript runtime values, not just TypeScript types. Table 9-1 lists some

examples of types along the hierarchy.

Table 9-1. Types in the DOM hierarchy

```
Type Examples
EventTarget window, XMLHttpRequest
Node document, Text, Comment
Element HTMLElements, SVGElements
HTMLElement <i>, <b>
HTMLButtonElement <button>
```
An EventTarget is the most general of all DOM types. All you can do with it is add

event listeners, remove them, and dispatch events. With this in mind, the classList

errors start to make a bit more sense:

```
function handleDrag(eDown: Event) {
const targetEl = eDown.currentTarget;
targetEl.classList.add('dragging');
// ~~~~~ 'targetEl' is possibly 'null'
// ~~~~~~~~~ Property 'classList' does not exist on type 'EventTarget'
// ...
}
```
As its name implies, an Event’s currentTarget property is an EventTarget. It could

even be null. TypeScript has no reason to believe that it has a classList property.

While currentTarget may be an HTMLElement in practice, from the type system’s per‐

spective there’s no reason it couldn’t be window or an XMLHttpRequest. (current

Target is the element you registered the listener on, while target is the element

where the event originated, which could have a different type.)

Moving up the hierarchy we come to Node. Nodes that are not Elements include text

fragments and comments. For instance, in this HTML:

```
< p >
And < i >yet</ i > it moves
<!-- quote from Galileo -->
</ p >
```
the outermost element is an HTMLParagraphElement. As you can see here, it has

children and childNodes:

**326 | Chapter 9: Writing and Running Your Code**


```
> p.children
HTMLCollection [i]
> p.childNodes
NodeList(5) [text, i, text, comment, text]
```
children returns an HTMLCollection, an array-like structure containing just the

child Elements (<i>yet</i>). childNodes returns a NodeList, an array-like collec‐

tion of Nodes. This includes not just Elements (<i>yet</i>) but also text fragments

(“And,” “it moves”) and comments (“quote from Galileo”). (See Item 17 for a refresher

on what “array-like” means.) You can use array spread syntax ([...p.childNodes])

to get a true array if you need one.

What’s the difference between an Element and an HTMLElement? There are non-

HTML Elements including the whole hierarchy of SVG tags. These are SVGElements,

which are another type of Element. What’s the type of an <html> or <svg> tag?

They’re HTMLHtmlElement and SVGSVGElement. If you don’t use SVG or MathML

then, in practice, all your Elements will be HTMLElements.

Sometimes specialized Element classes will have properties of their own—for exam‐

ple, an HTMLImageElement has a src property, and an HTMLInputElement has a value

property. If you want to read one of these properties off a value, its type must be spe‐

cific enough to have that property.

TypeScript’s type declarations for the DOM make liberal use of literal types to try to

get you the most specific type possible. For example:

```
const p = document.getElementsByTagName('p')[0];
// ^? const p: HTMLParagraphElement
const button = document.createElement('button');
// ^? const button: HTMLButtonElement
const div = document.querySelector('div');
// ^? const div: HTMLDivElement | null
```
But this is not always possible, notably with document.getElementById:

```
const div = document.getElementById('my-div');
// ^? const div: HTMLElement | null
```
While type assertions are generally frowned upon (Item 9 explains why), this is a case

where you know more than TypeScript does and so they are appropriate. There’s

nothing wrong with this assertion, so long as you know that #my-div is a div:

```
document.getElementById('my-div') as HTMLDivElement;
```
A runtime check will do the trick if you don’t know:

```
const div = document.getElementById('my-div');
if (div instanceof HTMLDivElement) {
console.log(div);
// ^? const div: HTMLDivElement
}
```
```
Item 75: Understand the DOM Hierarchy | 327
```

(Item 54 explores another way to get more precise types for HTMLElements.)

With strictNullChecks enabled, you’ll need to consider the case that

document.getElementById returns null. Depending on whether this can really hap‐

pen, you can either add an if statement or a non-null assertion (!):

```
const div = document.getElementById('my-div')!;
// ^? const div: HTMLElement
```
These types are not specific to TypeScript. Rather, they are generated from the formal

specification of the DOM. This is an example of the advice of Item 42 to generate

types from specs when possible.

So much for the DOM hierarchy. What about the clientX and clientY errors?

```
function handleDrag(eDown: Event) {
// ...
const dragStart = [
eDown.clientX, eDown.clientY
// ~~~~~~~ ~~~~~~~ Property '...' does not exist on 'Event'
];
// ...
}
```
In addition to the hierarchy for Nodes and Elements, there is also a hierarchy for

Events. TypeScript’s lib.dom.d.ts defines no fewer than 54 subtypes of Event!

Plain Event is the most generic type of event. More specific types include:

UIEvent

Any sort of user interface event

MouseEvent

An event triggered by the mouse, such as a click

TouchEvent

A touch event on a mobile device

KeyboardEvent

A key press

The problem in handleDrag is that the events are declared as Event, while clientX

and clientY exist only on the more specific MouseEvent type.

So how can you fix the example from the start of this item? Item 24 explained how

TypeScript makes use of context to infer more precise types, and the DOM declara‐

tions make extensive use of this. Inlining the mousedown handler gives TypeScript

more context and removes most of the errors. You can also declare the parameter

type to be MouseEvent rather than Event.

**328 | Chapter 9: Writing and Running Your Code**


Here’s a complete version of the code sample from the start of this item that passes

the type checker:

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
The if statement at the end handles the possibility that there is no #surface element.

If you know that this element exists, you could use a non-null assertion instead

(surfaceEl!). addDragHandler requires a non-null HTMLElement, following Item 33’s

advice to push null values to the perimeter.

**Things to Remember**

- The DOM has a type hierarchy that you can usually ignore while writing Java‐
    Script. But these types become more important in TypeScript. Understanding
    them will help you write TypeScript for the browser.
- Know the differences between Node, Element, HTMLElement, and EventTarget, as
    well as those between Event and MouseEvent.
- Either use a specific enough type for DOM elements and Events in your code or
    give TypeScript the context to infer it.

### Item 76: Create an Accurate Model of Your Environment

As Item 3 explained, your TypeScript code will eventually get converted to JavaScript

and executed. More specifically, it will be executed by a particular runtime (V8,

JavaScriptCore, SpiderMonkey) in a particular environment (a web page in a browser,

a test runner in Node.js, Deno, Electron, etc.).

For TypeScript to statically model the runtime behavior of your code, it needs a

model of that environment. One of your main goals in configuring a TypeScript

project is to ensure that this model is as accurate as possible. The more accurately you

```
Item 76: Create an Accurate Model of Your Environment | 329
```

model your runtime environment, the more effective TypeScript will be at finding

errors in your code.

For example, your generated JavaScript might run in a browser where it’s included in

an HTML page:

```
< script src="path/to/bundle.js"></ script >
```
TypeScript gives you a few ways to model this. One is via the lib setting in your

tsconfig.json:

```
{
"compilerOptions" : {
"lib" : ["dom", "es2021"]
}
}
```
By including "dom" in "lib", we tell TypeScript that it should include type declara‐

tions for a browser. The "es2021" indicates that we expect the browser to have built-

in support for everything in the JavaScript standard from that year (either natively or

via a polyfill). Using a feature from a newer version (for example, array.toSorted())

will result in a type error. You may not know precisely which features are in each

ECMAScript version, but TypeScript does. By creating an accurate model of your

environment, it can help you catch this particular mistake.

You can also model the types available in a web browser by installing the @types/web

package, which gives you a bit more control over versioning. Item 75 has much more

to say about TypeScript and the DOM.

It’s likely that your script tag isn’t the only one on your page. Perhaps your HTML

actually looks like this:

```
< script type="text/javascript">
window.userInfo = { name: 'Jane Doe', accountId: '123-abc' };
</ script >
< script src="https://code.jquery.com/jquery-3.7.1.min.js"></ script >
< script type="text/javascript">
// ... load Google Analytics ...
</ script >
< script src="path/to/bundle.js"></ script >
```
Each of those <script> tags modifies the environment in some way, adding global

variables that are available to your code. To ensure accurate type checking, you’ll need

to tell TypeScript about them.

You can model the userInfo global with a type declaration file:

```
// user-info-global.d.ts
interface UserInfo {
name: string ;
accountId: string ;
```
**330 | Chapter 9: Writing and Running Your Code**


##### }

```
declare global {
interface Window {
userInfo: UserInfo;
}
}
```
See Item 47 for more on more on the Window syntax here.

You can model the libraries by installing their type declarations:

```
$ npm install --save-dev @types/google.analytics @types/jquery
```
To get an accurate model, it’s essential that the @types package models the version of

the library that you source on your page. See Item 66 for more on how to match these

up. If you get this wrong, TypeScript may report spurious errors or miss some real

ones.

Perhaps you’re bundling your code using webpack, which lets you import CSS and

image files directly from JavaScript. These files are part of the environment, but Type‐

Script doesn’t know about them and will complain:

```
import sunrisePath from './images/beautiful-sunrise.jpg';
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Cannot find module './images/beautiful-sunrise.jpg' or its type declarations.
```
To make this work, you need to model these types of imports:

```
// webpack-imports.d.ts
declare module '*.jpg' {
const src: string ;
export default src;
}
```
webpack actually lets you import specific CSS rules from CSS modules. If you use this

feature, you’ll need to either add it to your model or install one of the npm packages

that does this for you.

It’s possible that different parts of your application run in different environments. For

example, your app might have client code that runs in a browser and server code that

runs under Node.js, not to mention test code that runs in its own environment. Since

these are distinct environments, you’ll want to model them separately. The usual way

to do this is with multiple tsconfig.json files and project references, which are dis‐

cussed in Item 78.

As with the browser, make sure you model the Node.js environment accurately. If you

run your code using Node.js version 20, make sure you install that version of @types/

node. This will ensure that you only use the library features that are available to you at

runtime.

```
Item 76: Create an Accurate Model of Your Environment | 331
```

**Things to Remember**

- Your code runs in a particular environment. TypeScript will do a better job of
    checking your code if you create an accurate static model of that environment.
- Model global variables and libraries that are loaded onto a web page along with
    your code.
- Match versions between type declarations and the libraries and runtime environ‐
    ment that you use.
- Use multiple tsconfig.json files and project references to model distinct environ‐
    ments within a single project (for example client and server).

#### Item 77: Understand the Relationship Between

#### Type Checking and Unit Testing

You sometimes hear claims that adopting TypeScript lets you delete most of your unit

tests. Or, flipping the argument around, that there’s no point in adding types to your

code since you’ll still need to write unit tests.

These are both extreme positions, but there is an interesting distinction hiding

behind the bluster. Unit tests and type checking are both forms of program verifica‐

tion. So what’s the relationship between the two? When should you write tests, and

when should you rely on types?

Let’s consider a function that adds two numbers:

```
/** Returns the sum of the two numbers. */
function add(a, b) {
// implementation omitted
}
```
If this seems too simple to test, then take a quick look at the IEEE 754 floating point

spec. There are quite a few corner cases! Here’s what a unit test might look like:

```
test('add', () => {
expect(add(0, 0)).toEqual(0);
expect(add(123, 456)).toEqual(579);
expect(add(-100, 90)).toEqual(-10);
});
```
Assuming these tests pass, how confident should we be in the correctness of the add

function? There are an enormous number of possible inputs. Numbers in JavaScript

are 64-bit floats, so there are 2^64 possible values for each parameter, or 2^128 possible

inputs in total. That’s an enormous number: it starts with 3 and is followed by

38 more digits. Our three test cases only cover an infinitesimal fraction of the

possibilities.

**332 | Chapter 9: Writing and Running Your Code**


These gaps create space for bugs to creep in. For example, what if this were the

implementation?

```
function add(a, b) {
if (isNaN(a) || isNaN(b)) {
return 'Not a number!';
}
return (a|0) + (b|0);
}
```
This passes our unit test. But the behavior with NaN values is surprising and probably

misguided (it should certainly be called out in the documentation!). The effect of the

bitwise operations is to round the inputs toward zero before adding them. Presuma‐

bly, the function should add nonintegers, too. Unless we specifically wrote unit tests

for these cases, we wouldn’t be able to catch these bugs.

Now let’s see what happens if you add types:

```
function add(a: number , b: number ): number {
if (isNaN(a) || isNaN(b)) {
return 'Not a number!';
// ~~~ Type 'string' is not assignable to type 'number'.
}
return (a|0) + (b|0);
}
```
Thanks to our type annotations, TypeScript has been able to spot one of the bugs.

There are whole classes of implementation errors that it can prevent: returning the

wrong type or performing invalid operations on the inputs. You could write a unit

test to check that add returns a number, but you’d never be able to test this for all 2^128

possible inputs. TypeScript has.

Of course, there are many mistakes that the type checker can’t catch. It doesn’t catch

the issue with decimals versus integers. In fact, here’s another implementation that

passes the type checker but is clearly wrong:

```
function add(a: number , b: number ): number {
return a - b; // oops!
}
```
Any unit test where b is non-zero would catch this bug, but the type checker is blind

to it.

Unit tests and type checking are complementary processes. Unit tests demonstrate

that your code behaves correctly in at least some situations. In other words, they pro‐

vide a lower bound on correctness. A type checker can prove that you haven’t made a

particular class of errors, say returning the wrong type. It provides an upper bound

on incorrectness. You can think of the two processes as whittling away at the bugs

from both ends until you’re satisfied that your code works well enough.

```
Item 77: Understand the Relationship Between Type Checking and Unit Testing | 333
```

Regardless of what the documentation or types say, in JavaScript, functions can be

called with any type of argument. In addition to adding numbers, the simple version

of the add function (return a+b) has the following behavior:

```
> add(null, null)
0
> add(null, 12)
12
> add(undefined, null)
NaN
> add('ab', 'cd')
'abcd'
```
Should you test these behaviors? TypeScript is unhappy if you do:

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
This makes sense. Unit tests are about demonstrating expected behavior. For invalid

inputs, there is no expected behavior to demonstrate. You should rely on the type

checker to prevent these invalid calls. There’s no need to write these sorts of unit tests.

There’s an important caveat to this for functions that have potentially harmful side

effects. Imagine you have a function that updates a user record in a database:

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
The intention of the elaborate type on the update parameter is that this function

really shouldn’t be used to change a user’s ID. (Item 63 explains the “optional never”

trick.) Doing so might cause a collision or even a security issue if it allows one user to

impersonate another. But this is only enforced at the type level. If you call this func‐

tion from JavaScript, perhaps even with untrusted user input, then it’s entirely possi‐

ble that the update argument will have an id property. It would be better if the

function threw an exception (i.e., rejected) rather than corrupting the database.

**334 | Chapter 9: Writing and Running Your Code**


This is a good behavior to specify and test, even if it’s disallowed by the types. You can

use an @ts-expect-error directive in your test to assert that it’s a type error:

```
test('invalid update', () => {
// @ts-expect-error Can't call updateUserById to update an ID.
expect(() => updateUserById('123', {id: '234'})).toReject();
});
```
One of the main goals in software quality assurance (QA) is to find problems as soon

as possible, when the cost of fixing them is low. The worst way to learn about a bug is

to have an end user (or a security researcher!) report it when it’s already in produc‐

tion. Better, but still expensive, is to catch it as part of a manual QA process. Better

yet is an automated QA process, say an integration test. Unit tests catch bugs even

earlier and more quickly. But type checking is the most immediate of all, reporting

bugs right in your editor, hopefully in the exact place that you made a mistake.

To catch bugs as quickly as possible, you should rely on the type checker where you

can. TypeScript can catch many errors, but sometimes it requires a bit of help. Items

59 , 61, and 64 all present techniques for helping the type checker catch new classes of

errors. But when you can’t rely on type checking, namely for testing behaviors, unit

tests are the next best option.

If your types themselves contain logic (Chapter 6 is all about this), then you abso‐

lutely need to write tests for them. Type tests are a different sort of test than unit tests.

Item 55 explores the fascinating world of type testing.

Finally, while both types and unit tests will help catch bugs when you refactor, types

also power the language services that make programming a more enjoyable experi‐

ence. As Item 6 explained, they can even do the refactoring for you!

Unit tests and type checking are both forms of program verification, but they work in

different and complementary ways. You typically want both. Keep their respective

roles clear and avoid repeating the same checks with both.

**Things to Remember**

- Type checking and unit testing are different, complementary techniques for dem‐
    onstrating program correctness. You want both.
- Unit tests demonstrate correct behavior on particular inputs, while type checking
    eliminates whole classes of incorrect behaviors.
- Rely on the type checker to check types. Write unit tests for behaviors that can’t
    be checked with types.
- Avoid testing inputs that would be type errors unless there are concerns about
    security or data corruption.

```
Item 77: Understand the Relationship Between Type Checking and Unit Testing | 335
```

### Item 78: Pay Attention to Compiler Performance

As Item 3 explained, TypeScript types are erased when you compile your code to

JavaScript. So generally speaking, TypeScript has zero impact on the runtime perfor‐

mance of your code.

TypeScript can have an impact on the performance of your developer tooling, how‐

ever. TypeScript comes with two executables, tsc and tsserver (Item 6). It makes

sense to talk about the performance of both of them:

tsc, the TypeScript compiler

```
Slow performance here means that your code will take longer to type check as
part of a batch process (perhaps on your CI system) and will take longer to pro‐
duce build artifacts (.js and .d.ts files).
```
tsserver, the TypeScript Language Service

```
Slow performance here means that your editor might feel sluggish or unrespon‐
sive. It may take a frustratingly long time for errors to appear or disappear after
you change your code.
```
If build or editor performance becomes a problem on your project, there are many

techniques available that might help. This item will look at a few of the most impact‐

ful. For each it will say which type of performance it impacts.

**Separate Type Checking from Building**

This only affects tsc (build) performance, not tsserver (editor).

At a high level, TypeScript does two things: it checks your code for type errors and it

emits JavaScript. The type checking is typically the more CPU intensive of the two. If

you don’t need the type checking, then skipping this step can be a huge time saver.

At first blush, this may sound like a strange thing to do. Isn’t type checking the whole

point of using TypeScript instead of JavaScript? In practice, though, you may be run‐

ning TypeScript indirectly via some other tool, perhaps a bundler (webpack, vite,

etc.) or ts-node. By default, these tools will type check your code and then bundle or

run the generated JavaScript. But they don’t need to do this. You can tell any of them

to run in “transpile only” mode to skip the checking.

This can make a noticeable difference even for trivial programs:

```
// hello.ts
console.log('Hello World!');
```
Here’s how quickly this runs with and without type checking using ts-node:

```
$ time ts-node --transpileOnly hello.ts
Hello World!
```
**336 | Chapter 9: Writing and Running Your Code**


```
ts-node --transpileOnly hello.ts 0.12s user 0.02s system 110% cpu 0.123 total
$ time ts-node hello.ts
Hello World!
ts-node hello.ts 1.60s user 0.08s system 255% cpu 0.656 total
```
This trivial program took 1.6 seconds to run with type checking but only 0.12 sec‐

onds without. If ts-node or a bundler is part of your toolchain, turning off type

checking can significantly tighten your iteration cycle and improve your developer

experience (DX). You may even be able to plug in an alternative TypeScript compiler,

such as swc, to get a bigger speedup.

Of course, type checking is still important! You’ll still get type errors as you develop

code in your editor (via tsserver), and you should make sure to run tsc on your CI

service to make sure you only commit code that passes the type checker.

**Prune Unused Dependencies and Dead Code**

This affects both build and editor performance.

The less code you have, the faster TypeScript can process it. Fewer types and symbols

also means lower RAM usage by tsserver, which will make your editor more

responsive.

One good way to shrink your project is via dead code elimination. If you set the noU

nusedLocals flag, TypeScript will detect some unused code and types:

```
function foo() {}
// ~~~ 'foo' is declared but its value is never read.
```
```
export function bar() {}
```
This works well for un-exported symbols. But an exported symbol might be unused,

too, if it’s never imported anywhere. To detect that, you’ll need a more sophisticated

tool like knip. This will also report unused third-party dependencies (e.g., node mod‐

ules). Removing these can be a huge win since their type declarations may be many

thousands of lines.

In fact, it’s likely that the majority of the types in your project come from third-party

code. You can run tsc --listFiles to get a printout of all the sources that go into

your TypeScript project:

```
$ tsc --listFiles
.../lib/node_modules/typescript/lib/lib.es5.d.ts
.../lib/node_modules/typescript/lib/lib.es2015.d.ts
.../lib/node_modules/typescript/lib/lib.es2016.d.ts
.../lib/node_modules/typescript/lib/lib.es2017.d.ts
...
```
The results may surprise you! Sometimes one dependency can pull in hundreds or

thousands of others (Item 70 describes a way to avoid this). A good way to visualize

```
Item 78: Pay Attention to Compiler Performance | 337
```

this is with a treemap. Since tsc will spend more time on a large file than a small file,

you’ll want to visualize the number of bytes in each file being compiled.

Here’s the magic incantation (the stat syntax may vary depending on your platform):

```
$ tsc --noEmit --listFiles | xargs stat -f "%z %N" | npx webtreemap-cli
```
For one of the author’s projects, the results looked like Figure 9-8.

Figure 9-8. Treemap of the files that TypeScript considers, weighted by file size.

This is a lot of code: nearly 110 MB! And most of it is evidently Google APIs? Many

of these were APIs (compute, dialogflow, dfareporting, healthcare) that my project

did not use. As it turned out, Google bundled all 300+ of its APIs as a single package,

weighing in at an impressive 80.5 MB. My project depended on only one or two APIs,

but this design meant that it still pulled in all three hundred of them.

In this case, updating to a newer version of googleapis fixed the issue since they

added support for depending on just one API. If a dependency is particularly large,

you may want to look into alternatives. You may also notice that you’re pulling in

multiple versions of the same library. The solution is to update versions until your

dependencies align (Item 66).

Regardless of the actions you take, the treemap visualization will make you more

aware of what you’re building and put you on the scent of potential issues. Before

looking at my treemap, I hadn’t thought much about my project’s use of googleapis.

Afterwards, I couldn’t think of much else!

**338 | Chapter 9: Writing and Running Your Code**


**Incremental Builds and Project References**

These only affect build (tsc) performance.

If you run tsc twice in a row, it will repeat all its work on the second invocation. But

if you set the incremental option, it will do something smarter: on the first invoca‐

tion, it will write a .tsbuildinfo file that saves some of the work it’s done. On the

second invocation, it will read that file and use it to check your types more quickly.

TypeScript lets you take this incremental approach a step further with “Project refer‐

ences.” The idea here is that if your code base has distinct parts (say client/server or

source/test), then changes to one should have a limited effect on the other. In particu‐

lar, if you change the implementation of a function in your source (but not its type

signature), then TypeScript shouldn’t have to redo type checking for your tests. And

no change to the tests should require TypeScript to redo type checking for your

source.

To set up project references, you create a tsconfig.json file for each distinct part of

your repo. These files say which other parts of your code they can reference. Your

tests will reference your source, but not the other way around. You also typically have

a top-level tsconfig.json for shared configuration. Here’s what the setup might look

like:

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
Here’s what these files look like:

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
```
```
Item 78: Pay Attention to Compiler Performance | 339
```

##### ]

##### }

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
```
```
it('should handle larger numbers', () => {
expect(fib(2)).toEqual(1);
expect(fib(3)).toEqual(2);
expect(fib(4)).toEqual(3);
expect(fib(5)).toEqual(5);
expect(fib(16)).toEqual(987);
});
});
```
That’s a lot of configuration! Here are the interesting bits:

- The src and test tsconfig.json inherit a shared base configuration that sets
    composite and declaration (to output .d.ts files).

**340 | Chapter 9: Writing and Running Your Code**


- The top-level tsconfig.json consists only of a list of references to subprojects.
- The test tsconfig.json references src but not the other way around.

With this setup in place, you can run tsc with the -b / --build flag to make it act as a

sort of build coordinator. After a first run, if you make a change to src/fib.ts that does

not affect the API, you’ll see something like this:

```
$ tsc -b -v
Project 'src/tsconfig.json' is out of date because output
'dist/src/tsconfig.tsbuildinfo' is older than input 'src/fib.ts'
Building project 'src/tsconfig.json'...
Project 'test/tsconfig.json' is up to date with .d.ts files from its
dependencies
```
The last line is the important one. Our change didn’t affect the .d.ts files (it was an

implementation change, not an API change), so the test project didn’t need to be

rebuilt.

There are a few caveats to be aware of with project references:

- In order for them to be useful, you must have declaration set, so that tsc out‐
    puts .d.ts files on disk. If you use noEmit or run tsc via webpack, vite, or some
    other tool, then project references won’t help you.
- Project references are most useful in large monorepos. The general rule of thumb
    is that they’re helpful primarily if you have more first-party code than third-party
    code (i.e., more lines of your own code than in node modules). This is rarely the
    case for small- to medium-sized projects, but it’s often the case at large
    corporations.
- While creating a small number of projects can speed up your interactions with
    TypeScript, creating too many can do the opposite. Try to scope projects to large
    chunks of your code. Creating distinct projects for src and test, or client and
    server, will be a win on large apps. But creating a separate project for each of
    your thousand UI components will create organizational overhead and is
    unlikely to improve TypeScript performance.

**Simplify Your Types**

This affects both build and editor performance.

Suppose you want to create a type to represent a year. Item 29 encouraged you to craft

types that can only represent valid states, so you craft a type that should hold up for

the rest of the millennium:

```
type Digit = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';
type Year = `2${Digit}${Digit}${Digit}`;
const validYear: Year = '2024';
```
```
Item 78: Pay Attention to Compiler Performance | 341
```

```
const invalidYear: Year = '1999';
// ~~~~~~~~~~~ Type '"1999"' is not assignable to type
// '"2000" | "2001" | "2002" | ... 996 more ... | "2999"'.
```
While it’s interesting that we can represent this type using TypeScript’s type system, it

may not be wise. The error hints at why: the Year type is a union with a thousand

elements! Every time TypeScript has to do something with this type, it will have to

check all of these. This is likely to make tsc and tsserver sluggish. Better to use

something simpler like a string or a number, or even a branded type (Item 64) if you

want to model this distinctly.

This is an extreme example, but enormous unions do sometimes arise, and you

should be aware that they can be a performance problem. Other ways to make your

types more efficient include:

- Extend interfaces rather than intersecting type aliases. Item 13 goes into great
    detail about the similarities and differences between type and interface. Usually
    they are interchangeable. But for subtyping, TypeScript is able to operate more
    efficiently with extends.
- Annotating return types. Item 18 discusses the pros and cons of adding type
    annotations, but providing explicit annotations on the return type of functions
    can save TypeScript work in inferring the type.

You should be particularly careful if you’re writing complex recursive types. Item 57

goes into more detail about how to keep these from blowing up.

**Things to Remember**

- There are two forms of TypeScript performance issues: build performance (tsc)
    and editor latency (tsserver). Recognize the symptoms of each and direct your
    optimizations accordingly.
- Keep type checking separate from your build process.
- Remove dead code and dependencies, and be on guard for code bloat in type
    dependencies. Use a treemap to visualize what TypeScript is compiling.
- Use incremental builds and project references to reduce the work tsc does
    between builds.
- Simplify your types: avoid large unions, use interface extension rather than
    intersection types, and consider annotating function return types.

**342 | Chapter 9: Writing and Running Your Code**


```
1 Z. Gao, C. Bird, and E. T. Barr, “To Type or Not to Type: Quantifying Detectable Bugs in JavaScript”, ICSE
2017.
2 Brie Bunge, “Adopting TypeScript at Scale”, JSConf Hawaii 2019.
```
