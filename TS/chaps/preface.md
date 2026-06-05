Dan Vanderkam

# Effective

# TypeScript

83 Specific Ways to Improve Your TypeScript

**Second**

**Edition**


```
WEB DEVELOPMENT
```
```
“ Effective TypeScript
explores the most
common questions
we see when working
with TypeScript and
provides practical,
results-oriented advice.
Regardless of your
level of TypeScript
experience, you can
learn something from
this book.”
—Ryan Cavanaugh
Engineering Lead for
TypeScript at Microsoft
```
**Effective TypeScript**

```
linkedin.com/company/oreilly-media
youtube.com/oreillymedia
```
```
TypeScript is a typed superset of JavaScript with the potential
to solve many of the headaches for which JavaScript is
famous. But TypeScript has a learning curve of its own,
and understanding how to use it effectively takes time and
practice. Using the format popularized by Effective C++ and
Effective Java (both Addison-Wesley), this practical book
features 83 items that give specific advice on what to do
and what not to do, and how to think about the language.
```
```
Author Dan Vanderkam shows you how to apply each item’s
advice through concrete examples. This book will help you
advance from a beginning or intermediate user familiar with
TypeScript basics to an expert who knows how to use the
language well.
```
```
Updated for TypeScript 5, this second edition includes
two new chapters on type-level programming and
TypeScript recipes.
```
**-** Learn the nuts and bolts of TypeScript’s type system
**-** Use type inference to get full safety with a minimum
    of type annotations
**-** Design types to make your code safer
    and more understandable
**-** Model complex APIs using generic types
    and type-level programming
**-** Understand how dependencies and
    type declaration files work in TypeScript
**-** Successfully migrate your JavaScript code base
    to TypeScript

```
Dan Vanderkam is an independent
software engineer and long-time
user, writer, and contributor to
TypeScript and its ecosystem. He
was previously a principal software
engineer at Sidewalk Labs and a
senior staff software engineer at
Google, where he worked on search
features used by billions of users.
```
US $59.99 CAN $74.

ISBN: 978-1-098-15506-


**Praise for Effective TypeScript**

```
Effective TypeScript explores the most common questions we see when working
with TypeScript and provides practical, results-oriented advice. Regardless of
your level of TypeScript experience, you can learn something from this book.
```
```
—Ryan Cavanaugh, engineering lead for TypeScript at Microsoft
```
```
Effective TypeScript’s second edition is a marvelous addition to an already excellent book.
It combines the great tips and tricks from the first edition with deep suggestions on
TypeScript practices that have only solidified over the last few years. The knowledge here
is a must-have for working with TypeScript on any project size. I particularly appreciated
that many recommendations include nuance around when and why they apply.
```
I would encourage any developer who wants to be deeply proficient at writing TypeScript

```
to give this book two enthusiastic read-throughs and take detailed notes.
```
```
—Josh Goldberg, open source developer
and author of Learning TypeScript
```
```
Effective TypeScript is not just a guide to one of the world’s most popular programming
languages. At its core, it teaches you how to think in types with applicable real-world
advice. You can see Dan’s experience oozing from every single page. It’s daring! And will
potentially change your view on programming beyond TypeScript.
```
```
—Stefan Baumgartner, senior product architect, Dynatrace,
and author of TypeScript Cookbook
```
```
Effective TypeScript, 2nd ed., is a great companion book for engineers who are already
familiar with the basics of TypeScript and are writing it day-to-day,
or are considering adopting TypeScript for their codebase.
```
```
—Boris Cherny, author of Programming TypeScript
```

```
I’ve been engaged with TypeScript for over 10 years, both in teaching and professional
practice. Effective TypeScript offers sound advice that aligns well with my experience.
The book effectively highlights how understanding TypeScript’s syntax is one thing,
but knowing when to use its features is another. It’s a helpful guide for those who are
familiar with TypeScript but want to refine their use of its capabilities.
```
```
—Titian-Cornel Cernicova-Dragomir,
software engineer at Bloomberg LP
```
```
This book is packed with practical recipes and must be kept on the desk
of every professional TypeScript developer. Even if you think
you know TypeScript already, get this book and you won’t regret it.
```
```
—Yakov Fain, Java champion
```
```
This book is not just about what TypeScript can do—it teaches why each language feature
is useful, and where to apply patterns to get the greatest effect. The book focuses on
```
practical advice that will be useful in day-to-day work, with just enough theory to give the

```
reader a deep understanding of how everything works. I consider myself to be an
advanced TypeScript user, and I learned a number of new things from this book.
```
```
—Jesse Hallett, senior software engineer, Hasura
```

**Dan Vanderkam**

**Effective TypeScript**

**83 Specific Ways to Improve Your TypeScript**

**SECOND EDITION**

BeijingBeijing BostonBoston FarnhamFarnham SebastopolSebastopol TokyoTokyo


##### 978-1-098-15506-

##### [LSI]

**Effective TypeScript**

by Dan Vanderkam

Copyright © 2024 Dan Vanderkam. All rights reserved.

Printed in the United States of America.

Published by O’Reilly Media, Inc., 1005 Gravenstein Highway North, Sebastopol, CA 95472.

O’Reilly books may be purchased for educational, business, or sales promotional use. Online editions are
also available for most titles (http://oreilly.com). For more information, contact our corporate/institutional
sales department: 800-998-9938 or corporate@oreilly.com.

**Acquisitions Editor:** Amanda Quinn
**Development Editor:** Angela Rufino
**Production Editor:** Clare Laylock
**Copyeditor:** Sonia Saruba
**Proofreader:** M & R Consultants Corporation

```
Indexer: nSight, Inc.
Interior Designer: David Futato
Cover Designer: Karen Montgomery
Illustrator: Kate Dullea
```
November 2019: First Edition
May 2024: Second Edition

**Revision History for the Second Edition**

2024-04-26: First Release

See [http://oreilly.com/catalog/errata.csp?isbn=9781098155063](http://oreilly.com/catalog/errata.csp?isbn=9781098155063) for release details.

The O’Reilly logo is a registered trademark of O’Reilly Media, Inc. Effective TypeScript, the cover image,
and related trade dress are trademarks of O’Reilly Media, Inc.

The views expressed in this work are those of the author and do not represent the publisher’s views. While
the publisher and the author have used good faith efforts to ensure that the information and instructions
contained in this work are accurate, the publisher and the author disclaim all responsibility for errors or
omissions, including without limitation responsibility for damages resulting from the use of or reliance
on this work. Use of the information and instructions contained in this work is at your own risk. If any
code samples or other technology this work contains or describes is subject to open source licenses or the
intellectual property rights of others, it is your responsibility to ensure that your use thereof complies
with such licenses and/or rights.


For Alex.

You’re just my type.



## Table of Contents

**Preface to the Second Edition.................................................... xi**




- 1. Getting to Know TypeScript. Preface to the First Edition (2019). xxi
   - Item 1: Understand the Relationship Between TypeScript and JavaScript
   - Item 2: Know Which TypeScript Options You’re Using
   - Item 3: Understand That Code Generation Is Independent of Types
   - Item 4: Get Comfortable with Structural Typing
   - Item 5: Limit Use of the any Type
- 2. TypeScript’s Type System.
   - Item 6: Use Your Editor to Interrogate and Explore the Type System
   - Item 7: Think of Types as Sets of Values
      - Value Space Item 8: Know How to Tell Whether a Symbol Is in the Type Space or
   - Item 9: Prefer Type Annotations to Type Assertions
      - BigInt) Item 10: Avoid Object Wrapper Types (String, Number, Boolean, Symbol,
   - Item 11: Distinguish Excess Property Checking from Type Checking
   - Item 12: Apply Types to Entire Function Expressions When Possible
   - Item 13: Know the Differences Between type and interface
   - Item 14: Use readonly to Avoid Errors Associated with Mutation
   - Item 15: Use Type Operations and Generic Types to Avoid Repeating Yourself
   - Item 16: Prefer More Precise Alternatives to Index Signatures
   - Item 17: Avoid Numeric Index Signatures
- 3. Type Inference and Control Flow Analysis.
   - Item 18: Avoid Cluttering Your Code with Inferable Types
   - Item 19: Use Different Variables for Different Types
   - Item 20: Understand How a Variable Gets Its Type
   - Item 21: Create Objects All at Once
   - Item 22: Understand Type Narrowing
   - Item 23: Be Consistent in Your Use of Aliases
   - Item 24: Understand How Context Is Used in Type Inference
   - Item 25: Understand Evolving Types
   - Item 26: Use Functional Constructs and Libraries to Help Types Flow
   - Item 27: Use async Functions Instead of Callbacks to Improve Type Flow
   - Item 28: Use Classes and Currying to Create New Inference Sites
- 4. Type Design.
   - Item 29: Prefer Types That Always Represent Valid States
   - Item 30: Be Liberal in What You Accept and Strict in What You Produce
   - Item 31: Don’t Repeat Type Information in Documentation
   - Item 32: Avoid Including null or undefined in Type Aliases
   - Item 33: Push Null Values to the Perimeter of Your Types
   - Item 34: Prefer Unions of Interfaces to Interfaces with Unions
   - Item 35: Prefer More Precise Alternatives to String Types
   - Item 36: Use a Distinct Type for Special Values
   - Item 37: Limit the Use of Optional Properties
   - Item 38: Avoid Repeated Parameters of the Same Type
   - Item 39: Prefer Unifying Types to Modeling Differences
   - Item 40: Prefer Imprecise Types to Inaccurate Types
   - Item 41: Name Types Using the Language of Your Problem Domain
   - Item 42: Avoid Types Based on Anecdotal Data
- 5. Unsoundness and the any Type.
   - Item 43: Use the Narrowest Possible Scope for any Types
   - Item 44: Prefer More Precise Variants of any to Plain any
   - Item 45: Hide Unsafe Type Assertions in Well-Typed Functions
   - Item 46: Use unknown Instead of any for Values with an Unknown Type
   - Item 47: Prefer Type-Safe Approaches to Monkey Patching
   - Item 48: Avoid Soundness Traps
   - Item 49: Track Your Type Coverage to Prevent Regressions in Type Safety
- 6. Generics and Type-Level Programming.
   - Item 50: Think of Generics as Functions Between Types
   - Item 51: Avoid Unnecessary Type Parameters
   - Item 52: Prefer Conditional Types to Overload Signatures
      - Conditional Types Item 53: Know How to Control the Distribution of Unions over
      - Between Strings Item 54: Use Template Literal Types to Model DSLs and Relationships
   - Item 55: Write Tests for Your Types
   - Item 56: Pay Attention to How Types Display
   - Item 57: Prefer Tail-Recursive Generic Types
   - Item 58: Consider Codegen as an Alternative to Complex Types
- 7. TypeScript Recipes.
   - Item 59: Use Never Types to Perform Exhaustiveness Checking
   - Item 60: Know How to Iterate Over Objects
   - Item 61: Use Record Types to Keep Values in Sync
   - Item 62: Use Rest Parameters and Tuple Types to Model Variadic Functions
   - Item 63: Use Optional Never Properties to Model Exclusive Or
   - Item 64: Consider Brands for Nominal Typing
- 8. Type Declarations and @types.
   - Item 65: Put TypeScript and @types in devDependencies
   - Item 66: Understand the Three Versions Involved in Type Declarations
   - Item 67: Export All Types That Appear in Public APIs
   - Item 68: Use TSDoc for API Comments
   - Item 69: Provide a Type for this in Callbacks if It’s Part of Their API
   - Item 70: Mirror Types to Sever Dependencies
   - Item 71: Use Module Augmentation to Improve Types
- 9. Writing and Running Your Code.
   - Item 72: Prefer ECMAScript Features to TypeScript Features
   - Item 73: Use Source Maps to Debug TypeScript
   - Item 74: Know How to Reconstruct Types at Runtime
   - Item 75: Understand the DOM Hierarchy
   - Item 76: Create an Accurate Model of Your Environment
      - Unit Testing Item 77: Understand the Relationship Between Type Checking and
   - Item 78: Pay Attention to Compiler Performance
- 10. Modernization and Migration.
      - Item 79: Write Modern JavaScript
      - Item 80: Use @ts-check and JSDoc to Experiment with TypeScript
      - Item 81: Use allowJs to Mix TypeScript and JavaScript
      - Item 82: Convert Module by Module Up Your Dependency Graph
      - Item 83: Don’t Consider Migration Complete Until You Enable noImplicitAny
   - Appendix: Item Mapping Between First and Second Editions.
   - Index.


### Preface to the Second Edition

It’s hard to believe it’s been nearly five years since the first edition of Effective

TypeScript was published. The book and its companion website have both been well

received and have helped countless developers improve their understanding and

usage of the language.

I was surprised how quickly I began to get asked whether the book was out-of-date. It

only took six months! Given the pace of change in TypeScript in the years leading up

to the first edition, this was a real concern of mine. I tried to avoid printing material

that would soon be out-of-date. This meant focusing more on timeless topics like lan‐

guage fundamentals and program design, rather than on libraries and frameworks.

By and large, the material in Effective TypeScript has held up well.

As TypeScript developed and gained new features, it didn’t invalidate the first edition

as much as it created gaps in its coverage. Writing an “effective” item requires more

than just knowing how a feature works. It requires experience using that feature: time

spent learning which patterns work well and which ones don’t hold up. Conditional

types had only recently been added to the language in 2019, so I had little experience

with them. They’re covered more extensively in this edition. Template literal types

have been the biggest addition to TypeScript in the past five years. They’ve opened

whole new worlds of possibilities and are covered in Item 54.

Moreover, thanks to projects like the Type Challenges, TypeScript developers have

become much more ambitious in what they do in the type system. Generics and type-

level programming were covered only lightly in the first edition. Now they get an

entire chapter, Chapter 6.

```
xi
```

More than eight years after I first tried TypeScript, I continue to enjoy it and get exci‐

ted every time I read the latest release notes or see an ambitious new PR from Anders

Hejlsberg making the rounds. I also continue to enjoy helping other developers learn

TypeScript and improve their usage of it. I hope that comes across in these pages, and

I hope that reading this book helps you enjoy working in TypeScript as much as I do!

```
Wallkill, NY
March 2024
```
#### Who This Book Is For

The Effective books are intended to be the “standard second book” on their topic.

You’ll get the most out of Effective TypeScript if you have some previous practical

experience working with JavaScript and TypeScript. My goal with this book is not to

teach you TypeScript or JavaScript but to help you advance from a beginning or inter‐

mediate user to an expert. The items in this book do this by helping you build mental

models of how TypeScript and its ecosystem work, making you aware of pitfalls and

traps to avoid, and by guiding you toward using TypeScript’s many capabilities in the

most effective ways possible. Whereas a reference book will explain the five ways that

a language lets you do X, an Effective book will tell you which of those five to use and

why.

TypeScript has evolved rapidly over the past few years, but my hope is that it has sta‐

bilized enough that the content in this book will remain valid for years to come. This

book focuses primarily on the language itself, rather than any frameworks or build

tools. You won’t find any examples of how to use React or Vue with TypeScript, or

how to configure TypeScript to work with webpack or Vite. The advice in this book

should be relevant to all TypeScript users.

#### Why I Wrote This Book

When I first started working at Google, I was given a copy of the third edition of

Effective C++ by Scott Meyers (Addison-Wesley Professional). It was unlike any other

programming book I’d read. It made no attempt to be accessible to beginners or to be

a complete guide to the language. Rather than telling you what the different features

of C++ did, it told you how you should and should not use them. It did so through

dozens of short, specific items motivated by concrete examples.

The effect of reading all these examples while using the language daily was unmistak‐

able. I’d used C++ before, but for the first time I felt comfortable with it and knew

how to think about the choices it presented to me. In later years I would have similar

experiences reading Effective Java by Joshua Bloch (Addison-Wesley Professional)

and Effective JavaScript by David Herman (Addison-Wesley Professional).

**xii | Preface to the Second Edition**


If you’re already comfortable working in a few different programming languages,

then diving straight into the odd corners of a new one can be an effective way to chal‐

lenge your mental models and learn what makes it different. I’ve learned an enor‐

mous amount about TypeScript from writing this book. I hope you’ll have the same

experience reading it!

#### How This Book Is Organized

This book is a collection of “items,” each of which is a short technical essay that gives

you specific advice about some aspect of TypeScript. The items are grouped themati‐

cally into chapters, but feel free to jump around and read whichever ones look most

interesting to you.

Each item’s title conveys the key takeaway. These are the things you should remember

as you’re using TypeScript, so it’s worth skimming the table of contents to get them in

your head. If you’re writing documentation, for example, and have a nagging sense

that you shouldn’t be writing type information, then you’ll know to read Item 31:

Don’t Repeat Type Information in Documentation.

The text of the item expands on the advice in the title and backs it up with concrete

examples and technical arguments. Almost every point made in this book is demon‐

strated through example code. I tend to read technical books by looking at the exam‐

ples and skimming the prose, and I assume you do something similar. I hope you’ll

read the prose and explanations! But the main points should still come across if you

skim the examples.

After reading the item, you should understand why it will help you use TypeScript

more effectively. You’ll also know enough to understand if it doesn’t apply to your sit‐

uation. Scott Meyers, the author of Effective C++, gives a memorable example of this.

He met a team of engineers who wrote software that ran on missiles. They knew they

could ignore his advice about preventing resource leaks, because their programs

would always terminate when the missile hit the target and their hardware blew up.

I’m not aware of any missiles with JavaScript runtimes, but the James Webb Space

Telescope has one, so you never know!

Finally, each item ends with “Things to Remember.” These are a few bullet points that

summarize the item. If you’re skimming through, you can read these to get a sense for

what the item is saying and whether you’d like to read more. You should still read the

item! But the summary will do in a pinch.

```
Preface to the Second Edition | xiii
```

#### Conventions in TypeScript Code Samples

All code samples are TypeScript except where it’s clear from the context that they are

JSON, HTML, or some other language. Much of the experience of using TypeScript

involves interacting with your editor, which presents some challenges in print. I’ve

adopted a few conventions to make this work.

Most editors surface errors using squiggly underlines. To see the full error message,

you hover over the underlined text. To indicate an error in a code sample, I put squig‐

gles in a comment line under the place where the error occurs:

```
let str = 'not a number';
let num: number = str;
// ~~~ Type 'string' is not assignable to type 'number'
```
I occasionally edit the error messages for clarity and brevity, but I never remove an

error. If you copy/paste a code sample into your editor, you should get exactly the

errors indicated—no more, no less.

To draw attention to the lack of an error, I use // OK:

```
let str = 'not a number';
let num: number = str as any ; // OK
```
You should be able to hover over a symbol in your editor to see what TypeScript con‐

siders its type. To indicate this in text, I use a comment with Twoslash syntax (^?):

```
let v = {str: 'hello', num: 42};
// ^? let v: { str: string; num: number; }
```
The comment indicates what you’d see in your editor if you moused over the symbol

above the caret (^). This matches the convention used on the TypeScript playground.

If you copy a code sample over there and drop everything after the ^?, TypeScript will

fill in the rest for you. What you see on the playground (Figure P-1) should precisely

match what you see in print.

Figure P-1. Twoslash syntax on the TypeScript playground.

**xiv | Preface to the Second Edition**


I will occasionally introduce no-op statements to indicate the type of a variable on a

specific line of code:

```
function foo(value: string | string []) {
if (Array.isArray(value)) {
value;
// ^? (parameter) value: string[]
} else {
value;
// ^? (parameter) value: string
}
}
```
The value; lines are only there to demonstrate the type in each branch of the condi‐

tional. You don’t need to (and shouldn’t) include statements like this in your own

code.

Unless otherwise noted or clear from context, code samples are intended to be

checked with the --strict flag. While printed copies of a book don’t change, Type‐

Script does, and it’s inevitable that some of the types or errors in code samples will be

different in the future. Check the Effective TypeScript repo for updated versions of

the examples in this book. All samples were verified with literate-ts using TypeScript

5.4.

#### Typographical Conventions Used in This Book

The following typographical conventions are used in this book:

Italic

Indicates new terms, URLs, email addresses, filenames, and file extensions.

Constant width

```
Used for program listings, as well as within paragraphs to refer to program ele‐
ments such as variable or function names, databases, data types, environment
variables, statements, and keywords.
```
**Constant width bold**

Shows commands or other text that should be typed literally by the user.

_Constant width italic_

```
Shows text that should be replaced with user-supplied values or by values deter‐
mined by context.
```
```
This element signifies a tip or suggestion.
```
```
Preface to the Second Edition | xv
```

```
This element signifies a general note.
```
```
This element indicates a warning or caution.
```
#### Using Code Examples

Supplemental material (code examples, exercises, etc.) is available for download at

https://github.com/danvk/effective-typescript.

This book is here to help you get your job done. In general, if example code is offered

with this book, you may use it in your programs and documentation. You do not

need to contact us for permission unless you’re reproducing a significant portion of

the code. For example, writing a program that uses several chunks of code from this

book does not require permission. Selling or distributing examples from O’Reilly

books does require permission. Answering a question by citing this book and quoting

example code does not require permission. Incorporating a significant amount of

example code from this book into your product’s documentation does require

permission.

We appreciate, but generally do not require, attribution. An attribution usually

includes the title, author, publisher, and ISBN. For example: “Effective TypeScript,

2nd ed., by Dan Vanderkam (O’Reilly). Copyright 2024 Dan Vanderkam,

978-1-492-05374-3.”

If you feel your use of code examples falls outside fair use or the permission given

above, feel free to contact us at permissions@oreilly.com.

#### O’Reilly Online Learning

```
For more than 40 years, O’Reilly Media has provided technol‐
ogy and business training, knowledge, and insight to help
companies succeed.
```
Our unique network of experts and innovators share their knowledge and expertise

through books, articles, and our online learning platform. O’Reilly’s online learning

platform gives you on-demand access to live training courses, in-depth learning

**xvi | Preface to the Second Edition**


paths, interactive coding environments, and a vast collection of text and video from

O’Reilly and 200+ other publishers. For more information, visit https://oreilly.com.

#### How to Contact Us

Please address comments and questions concerning this book to the publisher:

```
O’Reilly Media, Inc.
1005 Gravenstein Highway North
Sebastopol, CA 95472
800-889-8969 (in the United States or Canada)
707-827-7019 (international or local)
707-829-0104 (fax)
support@oreilly.com
https://www.oreilly.com/about/contact.html
```
We have a web page for this book, where we list errata, examples, and any additional

information. You can access this page at https://oreil.ly/effective-typescript-2e.

For news and information about our books and courses, visit [http://www.oreilly.com.](http://www.oreilly.com.)

Find us on LinkedIn: https://linkedin.com/company/oreilly-media.

Watch us on YouTube: [http://youtube.com/oreillymedia.](http://youtube.com/oreillymedia.)

#### Acknowledgments

Despite my hopes, writing a second edition did not prove any easier or less time-

consuming than the first. In the process, the book has grown from 62 items to 83. In

addition to writing 22 new items (one old item was consolidated into another), I’ve

reviewed and thoroughly revised all the original material. Some parts, such as Items

45 and 55 , are near complete rewrites.

Many new items are based on material that first appeared on the Effective TypeScript

blog, though all of these have seen significant revision. Chapter 6 is largely based on

my personal experiences building the crosswalk and crudely-typed libraries for Delve

at Sidewalk Labs.

Here are the origins of the new items in the second edition:

- Item 28 is adapted from the blog post “Use Classes and Currying to Create New
    Inference Sites”.
- Item 32 arose from code reviews. I didn’t know this was a rule until I saw it
    broken!
- Item 36 was inspired by feedback I’ve given on countless code reviews.

```
Preface to the Second Edition | xvii
```

- Item 37 is based on personal experience and Evan Martin’s blog post “Why Not
    Add an Option for That?”. Cory House’s frequent tweets on this topic gave me
    courage to include it in the book.
- Item 38 was inspired by the Alan Perlis quote, which I frequently cite, as well as
    by Scott Meyers’s rule.
- Item 39 is based on my team’s experience with the Jsonify adapter, which we
    were excited to adopt and then even more excited to ditch. The experience led to
    the blog post “The Trouble with Jsonify: Unify Types Instead of Modeling Small
    Differences”.
- Item 48 is adapted from the blog post “The Seven Sources of Unsoundness in
    TypeScript” with significant input from Ryan Cavanaugh.
- Item 50 was inspired by lots of thinking about what types really are, and a Stack
    Overflow answer explaining dependent types.
- Item 51 is an adaptation of the blog post “The Golden Rule of Generics”, which
    is, in turn, an adaptation of advice in the TypeScript handbook.
- Item 53 was inspired by my work on crosswalk and crudely-typed, and curiosity
    about all those [T] wrappers I was seeing.
- Item 54 was inspired by my own explorations of template literal types after Type‐
    Script 4.1 was released, which culminated in the blog post “TypeScript Splits the
    Atom!”.
- Item 56 is the culmination of my long-standing interest in this topic. This was
    kicked off by Titian Cernicova-Dragomir’s answer to a Stack Overflow question
    about typing _.invert, followed by my own experiences in crosswalk and
    crudely-typed, which eventually led to the blog post “The Display of Types”.
- Item 57 was inspired by the release notes for TypeScript 4.5, which added tail
    recursion.
- Item 58 was inspired by experience connecting TypeScript with databases that
    eventually led to my TypeScript Congress 2022 talk: “TypeScript and SQL: Six
    Ways to Bridge the Divide”.
- Item 59 presents a widespread trick that Jesse Hallett introduced me to while
    reviewing the first edition. The “pairs” variation comes from a 2021 tweet by Tom
    Hicks.
- Item 62 was inspired by an Artsy blog post: “Conditional Types in TypeScript”.
- Item 63 originated with Ryan Cavanaugh’s feedback on the first edition, which I
    eventually distilled into a blog post: “Exclusive Or and the Optional never Trick”.
    Stefan Baumgartner’s enthusiasm for this trick in the TypeScript Cookbook
    (O’Reilly) encouraged me to include it in the book.

**xviii | Preface to the Second Edition**


- Item 71 was inspired by a discussion with Evan Martin on reddit and a frustrat‐
    ing bug that came back to new Set("string"). This led to the blog post “In
    Defense of Interface: Using Declaration Merging to Disable ‘Bad Parts’”.
- Item 74 is a topic that comes up frequently, especially if you don’t have the right
    mental model of TypeScript.
- Item 76 was inspired by countless debugging sessions that came back to an incor‐
    rect model of your environment.
- Item 77 was inspired by personal curiosity about this topic, a few Stack Overflow
    questions, and a Gary Bernhardt talk.
- Item 78 was inspired by painful personal experience with TypeScript getting slow.
    It’s based on the TypeScript wiki and the blog post “What’s Typescript Compil‐
    ing? Use a Treemap to Find Out”.

Thanks to my tech reviewers, Josh Goldberg, Stefan Baumgartner, Ryan Cavanaugh,

Boris Cherny, and Titian Cernicova-Dragomir. Your feedback made this book

immensely better. Thanks to my coworkers on the Delve experience squad (particu‐

larly Stephanie Chew, Luda Zhao, Ha Vu, and Amanda Meurer) for all the code

reviews and for accommodating my boundless enthusiasm for TypeScript. Thanks to

everyone at O’Reilly who helped make this book happen: Angela Rufino, Ashley

Stussy, Amanda Quinn, Clare Laylock, Sonia Saruba. Thanks to Chris Mischaikow for

the last-minute proofreading. Spotify’s Jazzy Morning playlist, starting with Arta Por‐

ting’s Beautiful Sunrise, provided a soundtrack for writing and editing.

Finally, thanks to Alex for all her support: through a pandemic, online and in-person

weddings, a job change, and a big move, I’m glad at least one thing has stayed

constant!

```
Preface to the Second Edition | xix
```


### Preface to the First Edition (2019)

In the spring of 2016, I visited my old coworker Evan Martin at Google’s San Fran‐

cisco office and asked him what he was excited about. I’d asked him this same ques‐

tion many times over the years because the answers were wide-ranging and

unpredictable but always interesting: C++ build tools, Linux audio drivers, online

crosswords, emacs scripts. This time, Evan was excited about TypeScript and Visual

Studio Code.

I was surprised! I’d heard of TypeScript before, but I knew only that it was created by

Microsoft and that I mistakenly believed it had something to do with .NET. As a life‐

long Linux user, I couldn’t believe that Evan had hopped on team Microsoft.

Then Evan showed me VS Code and the TypeScript playground and I was instantly

converted. Everything was so fast, and the code intelligence made it easy to build a

mental model of the type system. After years of writing type annotations in JSDoc

comments for the Closure Compiler, this felt like typed JavaScript that really worked.

And Microsoft had built a cross-platform text editor on top of Chromium? Perhaps

this was a language and toolchain worth learning.

I’d recently joined Sidewalk Labs and was writing our first JavaScript. The codebase

was still small enough that Evan and I were able to convert it all to TypeScript over

the next few days.

I’ve been hooked ever since. TypeScript is more than just a type system. It also brings

a whole suite of language services which are fast and easy to use. The cumulative

effect is that TypeScript doesn’t just make JavaScript development safer: it also makes

it more fun!

```
Brooklyn, NY
October 2019
```
```
xxi
```

#### Acknowledgments to the First Edition

There are many people who helped make this book possible. Thanks to Evan Martin

for introducing me to TypeScript and showing me how to think about it. To Douwe

Osinga for connecting me with O’Reilly and being supportive of the project. To Brett

Slatkin for advice on structure and for showing me that someone I knew could write

an Effective book. To Scott Meyers for coming up with this format and for his “Effec‐

tive Effective Books” blog post, which provided essential guidance.

To my reviewers, Rick Battagline, Ryan Cavanaugh, Boris Cherny, Yakov Fain, Jesse

Hallett, and Jason Killian. To all my coworkers at Sidewalk who learned TypeScript

with me over the years. To everyone at O’Reilly who helped make this book happen:

Angela Rufino, Jennifer Pollock, Deborah Baker, Nick Adams, and Jasmine Kwityn.

To the TypeScript NYC crew, Jason, Orta, and Kirill, and to all the speakers. Many

items were inspired by talks at the Meetup, as described in the following list:

- Item 3 was inspired by a blog post of Evan Martin’s that I found particularly
    enlightening as I was first learning TypeScript.
- Item 7 was inspired by Anders’s talk about structural typing and keyof relation‐
    ships at TSConf 2018, and by a talk of Jesse Hallett’s at the April 2019 TypeScript
    NYC Meetup.
- Both Basarat’s guide and helpful answers by DeeV and GPicazo on Stack Over‐
    flow were essential in writing Item 9.
- Item 10 builds on similar advice in Item 4 of Effective JavaScript.
- I was inspired to write Item 11 by mass confusion around this topic at the August
    2019 TypeScript NYC Meetup.
- Item 13 was greatly aided by several questions about type vs. interface on Stack
    Overflow. Jesse Hallett suggested the formulation around extensibility.
- Jacob Baskin provided encouragement and early feedback on Item 15.
- Item 18 was inspired by several code samples submitted to the r/typescript
    subreddit.
- Item 24 is based on my own writing on Medium and a talk I gave at the October
    2018 TypeScript NYC Meetup.
- Item 29 is based on common advice in Haskell (“make illegal states unrepresenta‐
    ble”). The Air France 447 story is inspired by Jeff Wise’s incredible 2011 article in
    Popular Mechanics.
- Item 30 is based on an issue I ran into with the Mapbox type declarations. Jason
    Killian suggested the phrasing in the title.

**xxii | Preface to the First Edition (2019)**


- The advice about naming in Item 41 is common, but this particular formulation
    was inspired by Dan North’s short article in 97 Things Every Programmer Should
    Know (Kevlin, Henney, O’Reilly).
- Item 64 was inspired by Jason Killian’s talk at the very first TypeScript NYC
    Meetup in September 2017.
- Item 25 is based on the TypeScript 2.1 release notes. The term “evolving any” is
    not widely used outside the TypeScript compiler itself, but I find it useful to have
    a name for this unusual pattern.
- Item 46 was inspired by a blog post of Jesse Hallett’s.
- Item 47 was greatly aided by feedback from Titian Cernicova-Dragomir in Type‐
    Script issue #33128.
- Item 49 is based on York Yao’s work on the type-coverage tool. I wanted some‐
    thing like this and it existed!
- Item 66 is based on a talk I gave at the December 2017 TypeScript NYC Meetup.
- Item 52 owes a debt of gratitude to David Sheldrick’s post on the Artsy blog on
    conditional types, which greatly demystified the topic for me.
- Item 70 was inspired by a talk Steve Faulkner, aka southpolesteve, gave at the
    February 2019 Meetup.
- Item 55 is based on my own writing on Medium and work on the typings-
    checker tool, which eventually got folded into dtslint.
- Item 72 was inspired/reinforced by Kat Busch’s Medium post on the various types
    of enums in TypeScript, as well as Boris Cherny’s writings on this topic in Pro‐
    gramming TypeScript (O’Reilly).
- Item 60 was inspired by my own confusion and that of my coworkers on this
    topic. The definitive explanation is given by Anders on TypeScript PR #12253.
- The MDN documentation was essential for writing Item 75.
- Chapter 10 is based on my own experience migrating the aging dygraphs library.

I found many of the blog posts and talks that led to this book through the excellent r/

typescript subreddit. I’m particularly grateful to developers who provided code sam‐

ples there which were essential for understanding common issues in beginner Type‐

Script. Thanks to Marius Schulz for the TypeScript Weekly newsletter. While it’s only

occasionally weekly, it’s always an excellent source of material and a great way to keep

up with TypeScript. To Anders, Daniel, Ryan, and the whole TypeScript team at

Microsoft for the talks and all the feedback on issues. Most of my issues were misun‐

derstandings, but there is nothing quite so satisfying as filing a bug and immediately

seeing Anders Hejlsberg himself fix it!

```
Preface to the First Edition (2019) | xxiii
```

Finally, thanks to Alex for being so supportive during this project and so understand‐

ing of all the working vacations, mornings, evenings, and weekends I needed to

complete it.

**xxiv | Preface to the First Edition (2019)**

