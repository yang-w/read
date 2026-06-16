**CHAPTER 6**

### Generics and Type-Level Programming

### Item 50: Think of Generics as Functions Between Types

- A generic type takes one or more type parameters and produces a concrete, nongeneric type.
- In value-land, functions factor out repeated code. In type-land, the equivalent is a generic type.
- You "call" a function; you "instantiate" a generic type.

The built-in `Partial` generic makes all properties optional. A manual implementation:

```
type MyPartial<T> = {[K in keyof T]?: T[K]};
```

```
interface Person {
  name: string;
  age: number;
}

type MyPartPerson = MyPartial<Person>;
// ^? type MyPartPerson = { name?: string; age?: number; }

type PartPerson = Partial<Person>;
// ^? type PartPerson = { name?: string; age?: number; }
```

**Building MyPick — three approaches (worst to best):**

1. Suppress errors with `@ts-expect-error` (don't do this):

```
// @ts-expect-error (don't do this!)
type MyPick<T, K> = { [P in K]: T[P] };
type AgeOnly = MyPick<Person, 'age'>;
// ^? type AgeOnly = { age: number; }
```

This silences errors but incorrect uses return wrong types instead of errors:

```
type FirstNameOnly = MyPick<Person, 'firstName'>;
// ^? type FirstNameOnly = { firstName: unknown; }
type Flip = MyPick<'age', Person>;
// ^? type Flip = {}
```

2. Intersections (type-level equivalent of `as any` — not ideal):

```
type MyPick<T, K> = { [P in K & PropertyKey]: T[P & keyof T] };
```

Incorrect uses return `never` instead of `unknown`, which is slightly better, but this approach is not idiomatic.

3. Constraints with `extends` (correct approach):

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

Constraints with `extends` eliminate implementation errors and produce type errors on invalid instantiations.

**Type parameter defaults:** If you don't specify a constraint, it defaults to `unknown`, allowing any type. Always consider whether narrowing the constraint improves safety.

**Naming and documentation:**
- One-letter names (T, K) are fine for short generics; prefer descriptive names for longer or broader-scope definitions.
- Use `@template` in TSDoc to document type parameters — the language service will surface it at instantiation sites:

```
/**
 * Construct a new object type using a subset of the properties of another one
 * (same as the built-in `Pick` type).
 * @template T The original object type
 * @template K The keys to pick, typically a union of string literal types.
 */
type MyPick<T extends object, K extends keyof T> = {
  [P in K]: T[P]
};
```

**Generic functions — type inference:**

```
function pick<T extends object, K extends keyof T>(
  obj: T, ...keys: K[]
): Pick<T, K> {
  const picked: Partial<Pick<T, K>> = {};
  for (const k of keys) {
    picked[k] = obj[k];
  }
  return picked as Pick<T, K>;
}

const p: Person = { name: 'Matilda', age: 5.5 };
const age = pick(p, 'age');
// ^? const age: Pick<Person, "age">
```

TypeScript can infer type parameters from values — `pick(p, 'age')` is equivalent to `pick<Person, 'age'>(p, 'age')`.

**Generic classes — type parameters set at construction:**

```
class Box<T> {
  value: T;
  constructor(value: T) {
    this.value = value;
  }
}

const dateBox = new Box(new Date());
// ^? const dateBox: Box<Date>
```

**Higher-kinded types:** TypeScript does not support them. You cannot write a generic that takes another generic as a parameter:

```
type MapValues<T extends object, F> = {
  [K in keyof T]: F<T[K]>;
  // ~~~~~~~ Type 'F' is not generic.
};
```

**Things to Remember**

- Think of generic types as functions between types.
- Use `extends` to constrain the domain of type parameters, just as you'd use a type annotation to constrain a function parameter.
- Choose type parameter names that increase the legibility of your code, and write TSDoc for them.
- Think of generic functions and classes as conceptually defining generic types that are conducive to type inference.

### Item 51: Avoid Unnecessary Type Parameters

**The Golden Rule of Generics:** Every type parameter must appear two or more times. If it only appears once, it is not relating anything and should be removed.

```
function identity<T>(arg: T): T {  // T appears twice — good
  return arg;
}
```

```
function third<A, B, C>(a: A, b: B, c: C): C {  // A and B appear once — bad
  return c;
}
// Fix:
function third<C>(a: unknown, b: unknown, c: C): C {
  return c;
}
```

**Return-only generics are dangerous** — they are equivalent to a type assertion but look safe:

```
declare function parseYAML<T>(input: string): T;

interface Weight {
  pounds: number;
  ounces: number;
}

const w: Weight = parseYAML('');  // passes — but T is unconstrained, no real safety
```

Setting a default does not help:

```
declare function parseYAML<T = null>(input: string): T;
const w: Weight = parseYAML(''); // still allowed
```

Fix: return `unknown` and force the caller to assert:

```
declare function parseYAML(input: string): unknown;
const w = parseYAML('') as Weight;  // explicit, honest assertion
```

**Spurious K parameter:**

```
function printProperty<T, K extends keyof T>(obj: T, key: K) {  // K appears once
  console.log(obj[key]);
}
// Fix: move keyof T into the parameter type
function printProperty<T>(obj: T, key: keyof T) {
  console.log(obj[key]);
}
```

**K that appears implicitly in the return type (good use):**

```
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}
```

K appears in both the parameter and the inferred return type `T[K]` — this is a good use.

**Spurious class-level type parameter:**

```
class Joiner<T extends string | number> {  // T only applies to join — bad
  join(els: T[]) {
    return els.map(el => String(el)).join(',');
  }
}
```

Fix by removing generics entirely:

```
function join(els: (string | number)[]) {
  return els.map(el => String(el)).join(',');
}
```

**Spurious constraint used only for implementation safety:**

```
declare function processUnrelatedTypes<A, B>(a: A, b: B): void;
// A and B each appear once — bad
```

Fix:

```
declare function processUnrelatedTypes(a: unknown, b: unknown): void;
```

Caveat: with `unknown`, the implementation can assign `a = b` freely. If you need the implementation to treat them as unrelated, use a single overload (see Item 52), but this is rare.

**Things to Remember**

- Avoid adding type parameters to functions and classes that don't need them.
- Since type parameters relate types, every type parameter must appear two or more times to establish a relationship.
- Remember that a type parameter may appear in an inferred type.
- Avoid "return-only generics."
- Unneeded type parameters can often be replaced with the `unknown` type.

### Item 52: Prefer Conditional Types to Overload Signatures

**Problem:** modeling a function that returns a type based on its input type.

```
function double(x) {
  return x + x;
}
```

**Approach 1 — union type (too loose):**

```
declare function double(x: string | number): string | number;

const num = double(12);
// ^? const num: string | number
const str = double('x');
// ^? const str: string | number
```

**Approach 2 — generic (too precise):**

```
declare function double<T extends string | number>(x: T): T;

const num = double(12);
// ^? const num: 12
const str = double('x');
// ^? const str: "x"  // wrong: doubling 'x' gives 'xx', not 'x'
```

**Approach 3 — overload signatures (broken with union inputs):**

```
declare function double(x: number): number;
declare function double(x: string): string;

function f(x: string | number) {
  return double(x);
  // ~ Argument of type 'string | number' is not assignable
  // to parameter of type 'string'
}
```

TypeScript processes overloads one by one until it finds a match. The union `string | number` fails to match either individual overload.

**Approach 4 — conditional type (correct):**

```
declare function double<T extends string | number>(
  x: T
): T extends string ? string : number;
```

```
const num = double(12);
// ^? const num: number
const str = double('x');
// ^? const str: string

function f(x: string | number) {
  // ^? function f(x: string | number): string | number
  return double(x); // ok
}
```

**Why conditional types work with unions — distribution:**

When `T` is `string | number`, TypeScript distributes:

```
(string|number) extends string ? string : number
→ (string extends string ? string : number) |
  (number extends string ? string : number)
→ string | number
```

**Implementing a function declared with a conditional type:**

TypeScript will not infer a conditional type for a variable inside the function body. Use a single-overload strategy:

```
function double<T extends string | number>(
  x: T
): T extends string ? string : number;
function double(x: string | number): string | number {
  return typeof x === 'string' ? x + x : x + x;
}
```

The first line is the externally visible signature (with conditional type). The second is the implementation signature (simpler type). TypeScript checks basic compatibility, but not perfectly — test your types (Item 55).

**When overloads may be preferred:** if the union case is truly implausible, or if the function really represents two very distinct operations better expressed as separate named functions.

**Things to Remember**

- Prefer conditional types to overloaded type signatures. By distributing over unions, conditional types allow your declarations to support union types without additional overloads.
- If the union case is implausible, consider whether your function would be clearer as two or more functions with different names.
- Consider using the single overload strategy for implementing functions declared with conditional types.

#### Item 53: Know How to Control the Distribution of Unions over Conditional Types

**Distribution recap:** conditional types automatically distribute over union type parameters when the condition is a bare `T extends ...`.

**When distribution is undesirable:**

```
type Comparable<T> =
  T extends Date ? Date | number :
  T extends number ? number :
  T extends string ? string :
  never;

declare function isLessThan<T>(a: T, b: Comparable<T>): boolean;

let dateOrStr = Math.random() < 0.5 ? new Date() : 'A';
// ^? let dateOrStr: Date | string
isLessThan(dateOrStr, 'B') // ok, but should be an error
```

The second argument should be `(Date | number) & string` = `never`, so the call should fail. But distribution causes `Comparable<Date | string>` = `(Date | number) | string`, which is too permissive.

**Preventing distribution — wrap in a one-element tuple `[T]`:**

```
type Comparable<T> =
  [T] extends [Date] ? Date | number :
  [T] extends [number] ? number :
  [T] extends [string] ? string :
  never;
```

`[A]` is assignable to `[B]` iff `A` is assignable to `B`, so the semantics are unchanged for non-union types. But `[T]` is not a bare type, so unions no longer distribute:

```
isLessThan(dateOrStr, 'B');
// ~~~ Argument of type 'string' is not assignable to
// parameter of type 'never'.
```

**When distribution is desirable but isn't happening:**

`NTuple<T, N>` — builds a tuple of N elements of type T using an accumulator:

```
type NTuple<T, N extends number> = NTupleHelp<T, N, []>;

type NTupleHelp<T, N extends number, Acc extends T[]> =
  Acc['length'] extends N
    ? Acc
    : NTupleHelp<T, N, [T, ...Acc]>;
```

Works for single N, but not for union N:

```
type PairOrTriple = NTuple<bigint, 2 | 3>;
// ^? type PairOrTriple = [bigint, bigint]  // wrong — should be [bigint, bigint] | [bigint, bigint, bigint]
```

The condition is `Acc['length'] extends N` — not `N extends ...`, so distribution doesn't apply. Fix by adding a wrapper with a bare `N extends ...` condition:

```
type NTuple<T, N extends number> =
  N extends number
    ? NTupleHelp<T, N, []>
    : never;
```

```
type PairOrTriple = NTuple<bigint, 2 | 3>;
// ^? type PairOrTriple = [bigint, bigint] | [bigint, bigint, bigint]
```

**Surprising distribution over `boolean`:**

TypeScript treats `boolean` as the union `true | false`. So conditional types distribute over it:

```
type CelebrateIfTrue<V> = V extends true ? 'Huzzah!' : never;

type SurpriseParty = CelebrateIfTrue<boolean>;
// ^? type SurpriseParty = "Huzzah!"
// because: CelebrateIfTrue<true | false>
//        = CelebrateIfTrue<true> | CelebrateIfTrue<false>
//        = "Huzzah!" | never
//        = "Huzzah!"
```

To prevent: wrap in a tuple:

```
type CelebrateIfTrue<V> = [V] extends [true] ? 'Huzzah!' : never;

type SurpriseParty = CelebrateIfTrue<boolean>;
// ^? type SurpriseParty = never
```

**Surprising distribution over `never`:**

TypeScript treats `never` as an empty union. Distributing over an empty union yields `never`:

```
type AllowIn<T> = T extends {password: "open-sesame"} ? "Yes" : "No";

type N = AllowIn<never>;
// ^? type N = never
```

Neither branch is `never`, but the result is. The logic: `AllowIn<never>` = `AllowIn<T | never>` = `AllowIn<T> | AllowIn<never>`, so `AllowIn<never>` must be `never`. Fix: wrap in a tuple if you want a concrete result for `never`.

**Things to Remember**

- Think about whether you want unions to distribute over your conditional types.
- Know how to enable or disable distribution by adding conditions or by wrapping conditions in one-tuples.
- Be aware of the surprising behavior of `boolean` and `never` types when they distribute over unions.

#### Item 54: Use Template Literal Types to Model DSLs and Relationships Between Strings

**Template literal types** model structured subsets of string (infinite but constrained domains):

```
type PseudoString = `pseudo${string}`;
const science: PseudoString = 'pseudoscience'; // ok
const alias: PseudoString = 'pseudonym'; // ok
const physics: PseudoString = 'physics';
// ~~~~~~~ Type '"physics"' is not assignable to type '`pseudo${string}`'.
```

**Index signatures with template literal types** (e.g., requiring `data-` prefix on dynamic keys):

```
interface Checkbox {
  id: string;
  checked: boolean;
  [key: `data-${string}`]: unknown;
}

const check1: Checkbox = {
  id: 'subscribe',
  checked: true,
  value: 'yes',
  // ~~~~ Object literal may only specify known properties,
  // and 'value' does not exist in type 'Checkbox'.
  'data-listIds': 'all-the-lists', // ok
};
```

Using `[key: string]` instead would lose excess property checking and permit any key.

**Combining template literal types with generics for type inference:**

Extend `querySelector` to return precise element types for `tag#id` selectors:

```
type HTMLTag = keyof HTMLElementTagNameMap;
declare global {
  interface ParentNode {
    querySelector<
      TagName extends HTMLTag
    >(
      selector: `${TagName}#${string}`
    ): HTMLElementTagNameMap[TagName] | null;
  }
}

const img = document.querySelector('img#spectacular-sunset');
// ^? const img: HTMLImageElement | null
img?.src // ok
```

Gotcha — complex selectors match incorrectly:

```
const img = document.querySelector('div#container img');
// ^? const img: HTMLDivElement | null  // wrong: matched "div", then "#container img"
```

Fix with an escape-hatch overload that falls back to `Element` for selectors containing CSS special characters:

```
type CSSSpecialChars = ' ' | '>' | '+' | '~' | '||' | ',';
type HTMLTag = keyof HTMLElementTagNameMap;

declare global {
  interface ParentNode {
    // escape hatch
    querySelector(
      selector: `${HTMLTag}#${string}${CSSSpecialChars}${string}`
    ): Element | null;

    // same as before
    querySelector<
      TagName extends HTMLTag
    >(
      selector: `${TagName}#${string}`
    ): HTMLElementTagNameMap[TagName] | null;
  }
}

const img = document.querySelector('img#spectacular-sunset');
// ^? const img: HTMLImageElement | null
const img2 = document.querySelector('div#container img');
// ^? const img2: Element | null
```

**Using `infer` in template literal types to parse strings at the type level:**

```
type ToCamelOnce<S extends string> =
  S extends `${infer Head}_${infer Tail}`
    ? `${Head}${Capitalize<Tail>}`
    : S;
```

Made recursive for multiple underscores:

```
type ToCamel<S extends string> =
  S extends `${infer Head}_${infer Tail}`
    ? `${Head}${Capitalize<ToCamel<Tail>>}`
    : S;
type T0 = ToCamel<'foo'>;       // type is "foo"
type T1 = ToCamel<'foo_bar'>;   // type is "fooBar"
type T2 = ToCamel<'foo_bar_baz'>; // type is "fooBarBaz"
```

Applied to `objectToCamel` using a mapped type with key remapping:

```
type ObjectToCamel<T extends object> = {
  [K in keyof T as ToCamel<K & string>]: T[K]
};

function objectToCamel<T extends object>(obj: T): ObjectToCamel<T> {
  // ... implementation ...
}

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

**Things to Remember**

- Use template literal types to model structured subsets of string types and domain-specific languages (DSLs).
- Combine template literal types with mapped and conditional types to capture nuanced relationships between types.
- Take care to avoid crossing the line into inaccurate types. Strive for uses of template literal types that improve developer experience without requiring knowledge of fancy language features.

### Item 55: Write Tests for Your Types

**Why type testing is necessary:**
- TypeScript allows complex logic in types — logic can have bugs.
- Types for JS libraries can be declared independently of implementations; they can diverge.

**Ineffective approaches:**

Calling a function without checking the result:

```
map(['2017', '2018', '2019'], v => Number(v));  // only checks that it doesn't error
```

Assigning to a typed variable (better, but has pitfalls):

```
const lengths: number[] = map(['john', 'paul'], name => name.length);
```

**Helper function approach:**

```
function assertType<T>(x: T) {}
assertType<number[]>(map(['john', 'paul'], name => name.length));
```

**Pitfall 1 — assignability vs. equality:**

```
const beatles = ['john', 'paul', 'george', 'ringo'];
assertType<{name: string}[]>(
  map(beatles, name => ({
    name,
    inYellowSubmarine: name === 'ringo'
  }))
); // OK — but inYellowSubmarine is missing from the assertion!
```

**Pitfall 2 — function types with different parameter counts:**

```
const add = (a: number, b: number) => a + b;
assertType<(a: number, b: number) => number>(add); // OK

const double = (x: number) => 2 * x;
assertType<(a: number, b: number) => number>(double); // OK!?
```

A function type with fewer parameters is assignable to one with more — this is by design (callbacks often only use some parameters). To test parameter types explicitly:

```
const double = (x: number) => 2 * x;
declare let p: Parameters<typeof double>;
assertType<[number, number]>(p);
// ~ Argument of type '[number]' is not
// assignable to parameter of type [number, number]
declare let r: ReturnType<typeof double>;
assertType<number>(r); // OK
```

**Testing callback parameter types and `this`:**

```
const beatles = ['john', 'paul', 'george', 'ringo'];
assertType<number[]>(map(
  beatles,
  function(name, i, array) {
    // ~~~ Argument of type '(name: any, i: any, array: any) => any' is
    // not assignable to parameter of type '(u: string) => any'
    assertType<string>(name);
    assertType<number>(i);
    assertType<string[]>(array);
    assertType<string[]>(this);
    // ~~~~ 'this' implicitly has type 'any'
    return name.length;
  }
));
```

Note: use a `function` expression (not arrow function) to test the type of `this`.

A declaration that passes these checks:

```
declare function map<U, V>(
  array: U[],
  fn: (this: U[], u: U, i: number, array: U[]) => V
): V[];
```

**`any` types defeat all assertions:**

```
declare module 'your-amazing-module';  // every call returns any — assertions still pass
```

Add negative tests with `@ts-expect-error`:

```
// @ts-expect-error only takes two parameters
map([1, 2, 3], x => x * x, 'third parameter');
```

**Using `expect-type` library (recommended):**

```
import {expectTypeOf} from 'expect-type';

const beatles = ['john', 'paul', 'george', 'ringo'];
expectTypeOf(map(
  beatles,
  function(name, i, array) {
    expectTypeOf(name).toEqualTypeOf<string>();
    expectTypeOf(i).toEqualTypeOf<number>();
    expectTypeOf(array).toEqualTypeOf<string[]>();
    expectTypeOf(this).toEqualTypeOf<string[]>();
    return name.length;
  }
)).toEqualTypeOf<number[]>();
```

`toEqualTypeOf` catches `any` types, differing function arity, and `readonly` differences:

```
const anyVal: any = 1;
expectTypeOf(anyVal).toEqualTypeOf<number>();
// ~~~~~~
// Type 'number' does not satisfy the constraint 'never'.

const double = (x: number) => 2 * x;
expectTypeOf(double).toEqualTypeOf<(a: number, b: number) => number>();
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Type ... does not satisfy '"Expected: function, Actual: never"'

interface ABReadOnly {
  readonly a: string;
  b: number;
}
declare let ab: {a: string, b: number};
expectTypeOf(ab).toEqualTypeOf<ABReadOnly>();
// ~~~~~~~~~~~~~
// Arguments for the rest parameter 'MISMATCH' were not provided.
expectTypeOf(ab).toEqualTypeOf<{a: string, b: number}>(); // OK
```

**Type Challenges `Equals` approach:**

```
export type Equals<X, Y> =
  (<T>() => T extends X ? 1 : 2) extends
  (<T>() => T extends Y ? 1 : 2) ? true : false;

export type Expect<T extends true> = T;

const double = (x: number) => 2 * x;
type Test1 = Expect<Equals<typeof double, (x: number) => number>>;
type Test2 = Expect<Equals<typeof double, (x: string) => number>>;
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Type 'false' does not satisfy the constraint 'true'.
```

Edge cases of `Equals`:

```
type Test3 = Expect<Equals<1 | 2, 2 | 1>>; // good!
type Test4 = Expect<Equals<[a: 1, b: 2], [1, 2]>>; // maybe not so good
type Test5 = Expect<Equals<{x: 1} & {y: 2}, {x: 1, y: 2}>>; // surprising — false
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Type 'false' does not satisfy the constraint 'true'.
```

**External tooling:**

- `dtslint` — for DefinitelyTyped; uses `$ExpectType` comments:

```
const beatles = ['john', 'paul', 'george', 'ringo'];
map(beatles, function(
  name,  // $ExpectType string
  i,     // $ExpectType number
  array  // $ExpectType string[]
) {
  this   // $ExpectType string[]
  return name.length;
}); // $ExpectType number[]
```

- `eslint-plugin-expect-type` — works as an ESLint plugin; supports Twoslash-style comments:

```
const spiceGirls = ['scary', 'sporty', 'baby', 'ginger', 'posh'];
// ^? const spiceGirls: string[]
```

External tools match the way you interact with types in the editor and can catch display issues (Item 56), but are sensitive to union ordering (e.g., `number|string` vs `string|number`).

**Things to Remember**

- When testing types, be aware of the difference between equality and assignability, particularly for function types.
- For functions that use callbacks, test the inferred types of the callback parameters. Don't forget to test the type of `this` if it's part of your API.
- Avoid writing your own type testing code. Use one of the standard tools instead.
- For code on DefinitelyTyped, use `dtslint`. For your own code, use `vitest`, `expect-type`, or the Type Challenges approach. If you want to test type display, use `eslint-plugin-expect-type`.

### Item 56: Pay Attention to How Types Display

The same type can have many valid representations. As a library author, control how your types display to keep them readable for users.

**Example of undesirable display:**

```
type PartiallyPartial<T, K extends keyof T> =
  Partial<Pick<T, K>> & Omit<T, K>;

interface BlogComment {
  commentId: number;
  title: string;
  content: string;
}

type PartComment = PartiallyPartial<BlogComment, 'title'>;
// ^? type PartComment =
//      Partial<Pick<BlogComment, "title">> &
//      Omit<BlogComment, "title">
```

Implementation details leak through; it's unclear what properties exist or their types.

**The `Resolve` trick — force TypeScript to flatten object types:**

```
type Resolve<T> = T extends Function ? T : {[K in keyof T]: T[K]};
```

```
type PartiallyPartial<T, K extends keyof T> =
  Resolve<Partial<Pick<T, K>> & Omit<T, K>>;

type PartComment = PartiallyPartial<BlogComment, 'title'>;
// ^? type PartComment = {
//      title?: string | undefined;
//      commentId: number;
//      content: string;
//    }
```

The conditional type guards against functions — without it, function types become `{}`:

```
type ObjIdentity<T> = {[K in keyof T]: T[K]};
type F = ObjIdentity<(a: number) => boolean>;
// ^? type F = {}
```

`Resolve` works transparently for primitives and unions (homomorphic mapped type):

```
type S = ObjIdentity<string>;
// ^? type S = string
type U = ObjIdentity<'A' | 'B' | 'C'>;
// ^? type U = "A" | "B" | "C"
```

**`Resolve` is also useful for inlining `keyof`:**

```
interface Color { r: number; g: number; b: number; a: number };
type Chan = keyof Color;
// ^? type Chan = keyof Color
type ChanInline = Resolve<keyof Color>;
// ^? type ChanInline = "r" | "g" | "b" | "a"
```

**Avoid deep resolve on classes** — it inlines every method:

```
type D = Resolve<Date>;
// ^? type D = {
//      toLocaleString: { ... };
//      // ... 42 more ...;
//    }
```

Better to let `Date` display as `Date`.

**Handling special cases to improve display:**

For `PartiallyPartial<T, never>` (no fields made optional), the result should display as `T`:

```
type PartiallyPartial<T extends object, K extends keyof T> =
  [K] extends [never]
    ? T // special case
    : T extends unknown // extra conditional to preserve distribution over unions
    ? Resolve<Partial<Pick<T, K>> & Omit<T, K>>
    : never;

type FullComment = PartiallyPartial<BlogComment, never>;
// ^? type FullComment = BlogComment
```

**Other display techniques (replaceable by `Resolve`):**
- `Exclude<keyof T, never>` to inline `keyof` expressions
- `unknown & T` or `{} & T` to inline object types

**Things to Remember**

- There are many valid ways to display the same type. Some are clearer than others.
- TypeScript gives you some tools to control how types display, notably the `Resolve` generic. Make judicious use of this to clarify type display and hide implementation details.
- Consider handling important special cases of generic types to improve type display.
- Write tests for your generic types and their display to avoid regressions.

### Item 57: Prefer Tail-Recursive Generic Types

**The problem:** recursive type aliases consume stack depth. TypeScript limits recursive instantiation depth to prevent infinite loops and sluggishness.

**Non-tail-recursive `GetChars` (overflows at ~50 chars):**

```
type GetChars<S extends string> =
  S extends `${infer FirstChar}${infer RestOfString}`
    ? FirstChar | GetChars<RestOfString>
    : never;

type ABC = GetChars<"abc">;
// ^? type ABC = "a" | "b" | "c"

type Long = GetChars<"abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWX">;
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Type instantiation is excessively deep and possibly infinite.
```

The union with `FirstChar` happens _after_ the recursive call — not tail recursive.

**Non-tail-recursive `ToSnake` (overflows at ~50 chars):**

```
type ToSnake<T extends string> =
  string extends T
    ? string
    : T extends `${infer First}${infer Rest}`
    ? (First extends Uppercase<First>
      ? `_${Lowercase<First>}${ToSnake<Rest>}`
      : `${First}${ToSnake<Rest>}`)
    : T;

type S = ToSnake<'fooBarBaz'>;
// ^? type S = "foo_bar_baz"

type Long = ToSnake<'reallyDescriptiveNamePropThatsALittleTooLoquacious'>;
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Type instantiation is excessively deep and possibly infinite.
```

**Tail-recursive `ToSnake` using an accumulator:**

```
type ToSnake<T extends string, Acc extends string = ""> =
  string extends T
    ? string
    : T extends `${infer First}${infer Rest}`
    ? ToSnake<
        Rest,
        First extends Uppercase<First>
          ? `${Acc}_${Lowercase<First>}`
          : `${Acc}${First}`
      >
    : Acc;

type S = ToSnake<'fooBarBaz'>;
// ^? type S = "foo_bar_baz"

type Two = ToSnake<'className' | 'tagName'>;
// ^? type Two = "class_name" | "tag_name"

type Long = ToSnake<'reallyDescriptiveNamePropThatsALittleTooLoquacious'>;
// ^? type Long = "really_descriptive_name_prop_thats_a_little_too_loquacious"
```

The recursive call is now the last operation — the accumulator carries all intermediate work. TypeScript applies Tail Call Optimization (TCO) and allows much greater recursion depth for tail-recursive type aliases.

The accumulator pattern also appeared in `NTupleHelp` in Item 53.

**Things to Remember**

- Aim to make your recursive generic types tail recursive. They're more efficient and have greater depth limits.
- Recursive type aliases can often be made tail recursive by rewriting them to use an accumulator.

### Item 58: Consider Codegen as an Alternative to Complex Types

**When type-level programming reaches its limits:** increasingly complex SQL queries or domain parsers in the type system become error-prone and hard to maintain.

**The codegen alternative:** use a build-time tool to inspect external resources (database schemas, API specs, GraphQL schemas) and emit TypeScript type declaration files.

**Example — PgTyped for typed SQL:**

Write query with a tag:

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

Run codegen:

```
$ npx pgtyped -c pgtyped.config.json
```

Generated output:

```
// books-queries.types.ts
/** 'selectLatest' parameters type */
export interface selectLatestParams {
  publisher: string;
}

/** 'selectLatest' return type */
export interface selectLatestResult {
  author: string;
  year: number;
}

/** 'selectLatest' query type */
export interface selectLatestQuery {
  params: selectLatestParams;
  result: selectLatestResult;
}
```

Updated query file and usage:

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

async function getLatestBookByAuthor(db: Database, publisher: string) {
  const result = await selectLatestBookByAuthor.run({publisher}, db);
  // ^? const result: selectLatestResult[]
  return result;
}
```

**Advantages of codegen over type-level programming:**
- Written in ordinary TypeScript (or any language) — easier to test and maintain.
- Full control over how types display — no need for the `Resolve` trick (Item 56).
- Less taxing on the TypeScript compiler and language server.

**Cost of codegen:** adds a build step that must stay in sync with external sources.
- Run codegen on CI and use `git diff` to detect drift.
- Can also add as a pre-push hook.

**Things to Remember**

- While type-level TypeScript is an impressively powerful tool, it's not always the best tool for the job.
- For complex type manipulations, consider generating code and types as an alternative to writing type-level code. Your code generation tool can be written in ordinary TypeScript or any other language.
- Run codegen and `git diff` on your continuous integration system to make sure generated code stays in sync.
