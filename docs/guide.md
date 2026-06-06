<link href="css/style.css" rel="stylesheet"></link>

* [1. Transpiling, Build Pipeline, JS Engine, Compile vs Runtime](#ydkjs-ch1)
* [3.10 Global Variable / Local Variable](#global-local)
* [3.10.1 Declarations with `let` and `const`](#let-const)
* [3.10.2 Hoisting](#hoist)
* [3.10.3 `Object.entries()`](#object-entires)
* [3.10.3 Destructuring Assignment](#destructuring-assignment)
* [4.11.1 Assignment with Operation](#assignment-with-operation)
* [4.13.3 The `typeof` and `instanceof` Operator](#typeof-instanceof)
* [5.4.4 for/of](#for-of)
* [5.4.5 for/in](#for-in)
* [6.2 Creating Objects](#create-obj)
* [6.9 Object Methods](#obj-method)
* [6.7 Extending Objects](#extending-obj)
* [6.10 Extended Object Literal Syntax (更多的object literal的定义方法)](#extended-obj-literal-syntax)
	* [6.10.1 Shorthand Properties + 6.10.2 Computed Property Names + 6.10.5 Shorthand Methods](#extended-obj-literal-syntax-shorthand-prop-method)
	* [6.10.4 Spread Operator + Rest Parameters](#extended-obj-literal-syntax-spread)
* [7.1 Creating Arrays (`Array.of`, `Array.from`)](#create-arry)
* [7.8 Array Methods](#arry-methods)
	* [7.8.1 Array Iterator Methods (`forEach`, `map`, `filter`, `find`, `findIndex`, `indexOf`, `lastIndexOf`, `includes `, `every`, `some`, `reduce`)](#arry-iterator)
	* [7.8.2 Flattening arrays with `flat()` and `flatMap()`)](#arry-flat)
	* [7.8.3 Adding arrays with `concat()`](#arry-concat)
	* [7.8.4 Stacks and Queues with `push()`, `pop()`, `shift()`, and `unshift()`](#arry-stack-queue)
	* [7.8.5 Subarrays with `slice()`, `splice()`, `fill()`, and `copyWithin()`](#arry-subarry)
	* [7.8.6 Array Sorting Methods (`sort`, `reverse`)](#arry-sort)
	* [7.8.7 Array to String Conversions (`JSON.stringify`, `join`, `toString`)](#arry-to-string)
* [7.9 Array-Like Objects](#arrylike-obj)
* [11.1.1 The Set Class](#set)
* [11.1.2 The Map Class](#map)
* [8.1 Defining Functions](#func-def)
* [8.2 Invoking Functions](#func-invoke)
* [8.3 Function Arguments and Parameters](#func-args-params)
* [8.4 Functions as Values](#func-val)
* [8.6 Closure](#closure)
* [8.7 Function Properties, Methods, and Constructor](#func-prop-method-constructor)
	* [8.7.1 `func.length`, `func.name`, `func.prototype`](#func-prop)
	* [8.7.4-5 The `func.apply()`, `func.call()` and `func.bind()` Methods](#func-apply-call-bind)
	* [8.8.2 Higher-Order Functions](#higher-order-func)
* [9.2 Classes and Constructors](#class-constructor)
* [9.3 Classes with the class Keyword](#class-with-class-keyword)
* [9.4 Adding Methods to Existing Classes](#add-method-to-existing-class)
* [9.5 Subclasses](#subclass)
* [async/await](#async-await)
* [Input change debounce](#input-debounce)
* [Big data with virtualization](#virtualization-windowing)
* [HTML and CSS gotcha](#html-css-gotcha)

#### <a name="ydkjs-ch1" id="ydkjs-ch1">1. Transpiling, Build Pipeline, JS Engine, Compile vs Runtime</a>

### 1.1 Transpiling
- **forwards-compatibility**: 
  - new HTML/CSS in an old browser → browser skips what it doesn't understand, page still works.
  - JS is NOT forwards-compatible — unknown syntax crashes the engine (it's backward-compatible).
- **transpiling**: to run new JS syntax in older browsers, we convert it to equivalent older syntax using Babel
  - in brwweb, Babel checks ES6+ features the target browsers (defined in `.browserslistrc` via `@ebay/browserslist-config`) already support natively, and only transforms what they don't
    - ES6+ timeline:
      - ES2015 (ES6): classes, arrow functions, `let`/`const`, template literals
      - ES2017: `async`/`await`
      - ES2020: optional chaining (`?.`), nullish coalescing (`??`), `BigInt`
      - ES2022: class fields (public/private)

### 1.2 Build pipeline (brwweb)

Webpack:
1. Transpiles source files with Babel
2. Parses own AST (Abstrct Syntax Tree): resolve imports, tree-shake (drop exports never imported), inject polyfills
3. Outputs bundle.js → shipped to browser

Browser (V8):
1. Re-parses bundle.js: builds own AST → compiles to bytecode
2. Executes bytecode → runtime

### 1.3 Compile time vs Runtime — JS vs TypeScript
"Compile time" is overloaded — it means different things in different contexts:

| | "Compile time" | "Runtime" |
|---|---|---|
| **Plain JS** | no static check | V8 executes → crashes → user sees error |
| **TypeScript** | `tsc` catches type errors on your machine | error never reaches user |
- `tsc`: TypeScript compiler
- **"JS errors appear at runtime"** → V8 is executing code and blows up mid-run
- **"TS catches errors at compile time"** → `tsc` on your machine during dev, before browser sees anything

---

#### <a name="global-local" id="global-local">3.10 Global Variable / Local Variable</a>

- **Global variables** live as long as your application (your window / your web page) lives.
- **Local variables** have short lives. They are created when the function is invoked, and deleted when the function is finished.

**Lexical Scope** defines how variable names are resolved in nested functions (Climbing through the **Scope Chain**). 

- The <u>order of accessing a variable</u> is local variables (inner scope), parameters, outer scope(s) then as a last resort, the global variable (window). If your variable doesn’t exist in the global scope, JavaScript will return an undefined.

Ex.

```javascript
var globalvar = 1; // Global Scope
 
function outer() {
    var outervar = 2; // Scope is within outer()
     
    function inner() {
        var innervar = 3; // Scope is within inner()
        console.log(globalvar); // => 1
        console.log(outervar); // => 2
        console.log(innervar); // => 3
    }
     
    console.log(globalvar); // => 1
    console.log(outervar); // => 2
    console.log(innervar); // => Uncaught ReferenceError: innervar is not defined
}
 
console.log(globalvar); // => 1
console.log(outervar); // => Uncaught ReferenceError: outervar is not defined
console.log(innervar); // => Uncaught ReferenceError: outervar is not defined
```

- 一旦出了function, local variable就out of scope了, <span class="orange">等同于从没define过, 如果这时request local variable, 会throw ReferenceError</span>, 如上面出了inner后log(innerar) throw ReferenceError.
- <span class="yellowBG">区别于`var a; console.log(a);` 这里是undefined不是error, 因为a已经define了, 只是没有initiate.</span>

Ex. <span class="orange">注意区别下面三个例子</span>

```javascript
x=1;
(function() {
	x=10;
	var b=2; // 虽然是IIF, 但是b依然是local, function执行完了就out of scope了
})();
console.log(x); // 10
console.log(b); // Uncaught ReferenceError: b is not defined
```

```javascript
x=1;
(function() {
	var x=10; // function里的x是local,function执行完了就out of scope了.和外面的x是两个variable
})();
console.log(x); // 是1不是10!!!
```

```javascript
x=1;
(function() {
	x=10;
	var x; // 相当于new了一个local x并且hoist了,所以function里的x都和外面的x无关了
})();
console.log(x); // 1 区别于上面的例子 是1不是10!!!
```

#### <a name="let-const" id="let-const">3.10.1 Declarations with `let` and `const`</a>

- 对于`let`, 可以不付初始值, the value will be undefined
- 但是`const`必须付初始值

```javascript
let a; // a is undefined
const b = 0;
```

`const` variable can NOT change through re-assignment or be re-declared, otherwise `TypeError` will be throwed.

- 对于<span class="orange">primitive types</span> (undefined, null, boolean, number, string, symbol), value change is <u>NOT</u> possible.

	```javascript
	const x = 9;
	x++; // TypeError, cannot change value
	x *= 2; // TypeError, cannot change value
	
	x = 6; // TypeError, cannot change value
	x = 9; // TypeError, 即使付同样的值也不行
	```
	
- 对于<span class="orange">reference types</span> (object, array is object), as long as it's still pointing to the <u>same address</u>, it's possible to edit the value.
	- Object: 注意下面可以改变x.foo的值, since x is still pointing the same address.
	
		```javascript
		const x = {};
		x.foo = "bar";
		console.log(x); // {foo : "bar"}
	
		x.foo = "bar2";
		console.log(x); // {foo : "bar2"}  
		```
	- Array: 与object一样, y始终指向同一个address, 只是address里存的值变了.

		```javascript
		const y = [];
		y.push("foo");
		console.log(y); // ["foo"]
		
		y.pop();
		console.log(y); // []
		```
		
`const`和`let`的<b>scope</b>只到the nearest wrapping code block (curly braces). 

在while/for loop中, <u>每一次loop是一个scope.</u> 下例中, a brand new `next` variable is created on EVERY iteration. <u>Each iteration has no knowledge of a previously created `next` variable</u>. 

```javascript
while(stack.length > 0) {
	const next = stack.pop(); 
}
```

<span class="white-on-black">Difference between let and var</span>

- The difference is scoping. var is scoped to the <span class="orange">nearest function block</span> and let is scoped to the <span class="orange">nearest enclosing block</span>, which can be smaller than a function block.
- Variables declared with <u>let are not accessible before they are declared</u> in their enclosing block. <span class="orange">let不存在hoist</span>.

	Ex. <span class="orange">注意下面这个例子</span>
	
	```javascript
	console.log("globalVar: " + globalVar); // undefined, but visible
	console.log("globalLet: " + globalLet); // ReferenceError: a is not defined, *not* visible
	
	var globalVar = "globalVar";
	let globalLet = "globalLet";
	
	console.log("globalVar: " + globalVar); // globalVar
	console.log("globalLet: " + globalLet); // globalLet
	
	function functionScoped() {
	  console.log("functionVar: " + functionVar); // undefined, but visible
	
	  try {
	    console.log("functionLet: " + functionLet); // ReferenceError, *not* visible
	  } catch (exception) {
	    console.log("functionLet: exception");
	  }
	
	  var functionVar = "functionVar";
	  let functionLet = "functionLet";
	
	  console.log("functionVar: " + functionVar); // functionVar
	  console.log("functionLet: " + functionLet); // functionLet
	}
	
	function blockScoped() {
	  console.log("blockVar: " + blockVar); // undefined, but visible
	
	  try {
	    console.log("blockLet: " + blockLet); // ReferenceError, *not* visible
	  } catch (exception) {
	    console.log("blockLet: exception");
	  }
	
	  for (var blockVar = "blockVar", blockIndex = 0; blockIndex < 1; blockIndex++) {
	    console.log("blockVar: " + blockVar); // visible here and whole function
	  }; //blockVar: blockVar
	
	  for (let blockLet = "blockLet", letIndex = 0; letIndex < 1; letIndex++) {
	    console.log("blockLet: " + blockLet); // visible only here
	  }; //blockLet: blockLet
	
	  console.log("blockVar: " + blockVar); // blockVar: blockVar
	
	  try {
	    console.log("blockLet: " + blockLet); // ReferenceError, *not* visible
	  } catch (exception) {
	    console.log("blockLet: exception");
	  }
	}
	```
	
#### <a name="hoist" id="hoist">3.10.2 Hoisting</a>

**Hoisting** is JavaScript’s default behavior of moving **declarations** to the top of a function scope (<span class="orange">注意只是hoist到当前function内的top</span>). 

- 只针对var和function declaration, let/const不存在hoist.
- <span class="orange">Any function declaration will be hoisted at the top first, then variable</span>.
- If you assign a function to a variable (function expression) only the variable part will be hoisted. However if you have a function declaration, the full function will be hoisted.
- JavaScript in strict mode does not allow hoist, 即不允许variables to be used if they are not declared.

<span class="orange">Ex1.</span> 

```javascript
var foo = "outside"; 
function logIt(){
	console.log(foo); 
	var foo = "inside";
} 
logIt(); // undefined
```	
注意logIt里的foo被hoist后, local有了一个新的foo, <u>所以不会再向上找global的foo</u>, 且local的还没复值, 所以是undefined

<span class="orange">Ex2.</span>

```javascript
function setName(obj) { // 区别于Ex1, 这里不存在hoist
    obj.name = "Nicholas"; 
    obj = {}; // when obj is overwritten inside func, it becomes a pointer to a local obj, will be destroyed once func finishes
    obj.name = "Greg";
}
var person = new Object();
setName(person);
console.log(person.name);    // "Nicholas", 不是Greg!!
```

<span class="orange">Ex3.</span> 

```javascript
var a = 1; 
function b() { 
    a = 10; 
    return; 
    function a() {} 
} 
b(); 
console.log(a);  // 1
```
- function declaration `function a(){}` is hoisted first and <span class="orange">it behaves like `var a = function () {};`</span>. Hence in local scope variable a is created, 所以后来的a=10是reset了这个a, 不是global的a, 所以log时a没变.
-  If <span class="orange">you didnt have a function named as a, you will see 10 in the log. 因为a=10就是reset了global的a</span>.

#### <a name="object-entires" id="object-entires">3.10.3 Object.entries()</a>

[MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/entries)

```Object.entries(obj)```返回的是array of [key, val]  pairs. 注意[key, val]是array的形式, 不是object.

并且注意```Object.entries```返回的<span class="red">没有inherited properties</span>.

```javascript
const obj1 = {
    a: "aaa",
    b: 42
};
// 注意entries returns [["a", "aaa"], ["b", 42]] 
for(let [key, val] of Object.entries(obj1)) {
    console.log(`key = ${key}, val = ${val}`);
}
// key = a, val = aaa
// key = b, val = 42
```

同样适用于array

```javascript
let letters = [..."abc"];
for(let [index, val] of letters.entries()) {
	console.log(`index = ${index}, letter = ${val}`);
}
// index = 0, letter = a
// index = 1, letter = b
// index = 2, letter = c
```

#### <a name="destructuring-assignment" id="destructuring-assignment">3.10.3 Destructuring Assignment</a>

[MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment#object_destructuring)

The <span class="bold">destructuring assignment</span> syntax is a JavaScript expression that makes it possible to unpack values from <span class="bold">arrays</span>, or properties from <span class="bold">objects</span>, into distinct variables.

##### <span class="white-on-black">Array Destructuring</span>

##### Swapping variables
```javascript
let [x, y] = [1, 2];
[x, y] = [x+1, y+1];
[x, y] = [y, x]; // swap
console.log(`[x, y] = ${[x, y]}`);  // [x, y] = 3,2. toString()了
console.log([x, y]); // [3, 2]
```

```javascript
const arr = [1,2,3];
// 1. swap 注意这里的arry[2], arry[1]是reference, 
// 2. [arry[2], arry[1]] = [2, 3]. 右边的值已经取出来了, 虽然arry[2]先变成了arry[1], 但是当arry[1]=arry[2]时的arry[2]依然是原来的arry[2]
[arr[2], arr[1]] = [arr[1], arr[2]];
console.log(arr); // [1,3,2]
```

##### Default values

```javascript
// Default values
let [c=2, d=5] = [1];
console.log(`c = ${c}, d = ${d}`); // c = 1, d = 5
```

##### Parsing an array returned from a function

```javascript
// Parsing an array returned from a function
function f() { return [1, 2, 3]; }
let [f1, f2] = f();
console.log(`f1 = ${f1}, f2 = ${f2}`); // f1 = 1, f2 = 2

// Ignoring some returned values
let [f3, , f4] = f(); //arry[1] is ignored
console.log(`f3 = ${f3}, f4 = ${f4}`); // f3 = 1, f4 = 3
```

```javascript
const [firstElem, secondElem] = [1,2,3,4,5];
// is equivalent to:
// const firstElem = arry[0];
// const secondElem = arry[1];
console.log(firstElem, secondElem); //1, 2
```

##### Using rest/spread operator to group the rest into an array

```javascript
// with ..., spread/rest will group the rest into an array
let [a, ...rest] = [10, 20, 30];
console.log(`a = ${a}, rest = ${rest}`); //a = 10, b = 20,30. b is Array[20, 30]
console.log(rest); // [20, 30]
```

```javascript
// destructuring on iterable object, anything can be used with for...of loop
let [start, ...restOfStr] = "hello";
console.log(start); // "h"
// 注意这里是arry of charactors, 不是剩余的string
console.log(restOfStr); // ["e", "l", "l", "o"] 
```

##### <span class="white-on-black">Object Destructuring</span>

Object destructuring左手边是obj的key, 返回的是obj.key, 即val

```javascript
const user = {
    id: 123,
    is_verified: true
};
const {id, is_verified} = user;
console.log(`user id = ${id}, isVerified = ${is_verified}`); // user id = 123, isVerified = true
```

##### Assigning to new variable names

区别于array destructuring的default value, `let [a=1, b=2] = [4];`中用的等号, 这里是冒号

```javascript
const {id: id_renamed} = user;
// assign id to id_renamed = 123
console.log(`assign id to id_renamed = ${id_renamed}`);
console.log(id); // Uncaught ReferenceError: tes is not defined
```

##### Default values

区别于上面的assign new var用的是冒号, 这里default val和arry restructuring一样, 都是等号

```javascript
// 区别于array destructuring. 这里左手边必须是obj的key
// 剩余一样 注意用等号: aa=1, 不是冒号
const {aa = 1, bb = 2} = {aa: 3};
console.log(`aa = ${aa}, bb = ${bb}`); // aa = 3, bb = 2
```

```javascript
const { 
  main: { 
    content: { 
      title = "defaultTitle" 
    } = {} 
  } = {}
} = obj || {}; // deconstruct with default fallback
console.log(title); // defaultTitle
```

##### Assignment without declaration + Using rest/spread operator to group the rest into an object

注意{...} = {...}外面的括号是必须的

```javascript
let b;
// The parentheses ( ... ) around the assignment statement are required.
// 因为{ a, b, ...rest } is considered a block not an object literal
// 要么就写成 const {a, b} = obj
({ a, b, ...rest } = { a: 10, b: 20, c: 30, d: 40 });
console.log(`a = ${a}, b = ${b}`); // a = 10, b = 20

// spread will group the rest into an object
console.log(rest); // {c: 30, d: 40}
```

##### Unpacking fields from objects passed as a function parameter

```javascript
//注意下面getFirstName是怎么得到fName的
const user1 = {
    id: 42,
    name: "jdoe",
    fullName: {
        fName: "john",
        lName: "doe"
    }
};
function getId({id}) {
    return `userId = ${id}`;
}
// 注意这里得不到fullName, 只有name和fullName中的fName
function getFirstName({ name, fullName: {fName}}) {
	try {
	    console.log(fullName); // Uncaught ReferenceError: fullName is not defined
	} catch(e) {}
	return `${name} = ${fName}`;
}
// 注意这里为了同时得到fullName和fullName中的fName, fullName要单独写出来
function getFullNameWithFName({ name, fullName, fullName: { fName }}) {
    console.log(`fullName = ${JSON.stringify(fullName)}`); // {fName: "john", lName: "doe"}
    return `${name} = ${fName}`;
}
//这里assign lName给last
function getLastName({name, fullName: {lName: last}}) { 
    return `${name} = ${last}`;
}
console.log(getId(user1)); // userId = 42
console.log(getFirstName(user1)); // jdoe = john
console.log(getFullNameWithFName(user1)); // jdoe = john
console.log(getLastName(user1)); // jdoe = doe
```

##### Nested object and array destructuring

```javascript
const metadata = {
    title: "metadata",
    translations: [
        {
            locale: "en",
            title: "en_title_metadata",
            rel: {
                a: "en_a",
                b: "en_b"
            }
        },
        {
            locale: "es",
            title: "es_titile_metadata",
            rel: {
                a: "es_a",
                b: "es_b"
            }
        }
    ],
    url: "/en-US/metadata"
};
// 注意这里的写法读取的是translations[0].title
let { 
  title, 
  translations: [{title: translatedTitle}] = []
} = metadata;
console.log(`title = ${title}, translated = ${translatedTitle}`); // title = metadata, translated = en_title_metadata

// 1. 这里不能再用 {title: translatedTitle} 否则会报错 let/const不能同一个variable(translatedTitle) declare两次
// 2. 注意这里读取的是translations[1].title
let { translations: [, { title: translatedTitleEs }]} = metadata;
console.log(`es translated = ${translatedTitleEs}`); // es translated = es_titile_metadata

// For-of iteration and destructuring
// 1. 注意这里是怎么对translations循环的 
// 2. 注意rel_b的assign
for (let { title, rel: { a, b: rel_b } } of metadata.translations) {
    console.log(`title = ${title}, rel.a = ${a}, rel.b = ${rel_b}`);
}
// title = en_title_metadata, rel.a = en_a, rel.b = en_b
// title = es_titile_metadata, rel.a = es_a, rel.b = es_b
```

##### Combined Array and Object Destructuring

```javascript
const props = [
    { id: 1, name: "fizz"},
    { id: 2, name: "bizz"},
    { id: 3, name: "gizz"}
];
const [, , { name }] = props;
console.log(`props[2].name = ${name}`); //props[2].name = gizz
```

##### The prototype chain is looked up when the object is deconstructed 

When deconstructing an object, if a property is not accessed in itself, it will continue to look up along the prototype chain.

```javascript
let obj = {
    anotherId: 123
};
obj.__proto__.prop = "456";
const { anotherId, prop } = obj; // 注意这里不能再用{ id, prop }中的id了,因为前面已经declare过了
console.log(`obj.id = ${anotherId}, obj.prop = ${prop}`); // obj.id = 123, obj.prop = 456
```

##### <span class="white-on-black">Destruct Function Arguments into Parameters</span>

Ex1. Destructure args as array

```javascript
function vectorAdd1(v1, v2) {
    return [v1[0]+v2[0], v1[1]+v2[1]];
}
// compare with destructured args
function vectorAdd2([x1, y1], [x2, y2]) {
    return [x1+x2, y1+y2];
}
console.log(vectorAdd2([1,2], [3,4])); // [4,6]
```

Ex2. Destructure args as object

```javascript
// 注意这里z的default val
function vectorMultiply({ x, y, z=0 }, scalar) {
    return {
        x: x * scalar,
        y: y * scalar,
        z: z * scalar
    };
}
console.log(vectorMultiply({ x: 1, y: 2}, 3)); // {x: 3, y: 6, z: 0}

function vectorMultiply2({ x, y, z=0, ...props}, scalar) {
    return {x: x*scalar, y: y*scalar, z: z*scalar, ...props};
}
// 除了x,y,z的props会原封不动的return: 这里的w:-1
console.log(vectorMultiply2({ x: 1, y: 2, w: -1}, 3)); // { x: 3, y: 6, z: 0, w: -1 }
```

Ex3. Rename

```javascript
// 注意这里的rename, 左边的key是不变的, 右边的是rename
function vectorAdd3({ x: x1, y: y1 }, { x: x2, y: y2 }) {
    return {
        x: x1 + x2,
        y: y1 + y2
    };
}
console.log(vectorAdd3({x: 1, y: 2}, {x: 3, y: 4})); // {x: 4, y: 6}
```

Ex4. 把from copy进to, 在to的insertAt插入, 插入的是from从fromIndex开始向后数numToCopy个

```javascript
function arryCopy({ from, to=from, fromIndex=0, numToCopy=from.length, insertAt=0 }) {
    let valuesToCopy = from.splice(fromIndex, fromIndex + numToCopy);
    to.splice(insertAt, 0, ...valuesToCopy);
    return to;
}
let a = [1,2,3,4], b=[5,6,7,8];
// 注意splice从index=2开始插入 所以(1,2,3)是插在7之前!!
console.log(arryCopy({ from: a, to: b, numToCopy: 3, insertAt: 2 })); // [5,6,(1,2,3),7,8]
```

- arryCopy的params是一个obj, key是from, to, fromIndex, numToCopy, insertAt. 对于obj每个key的defaultVal用等号赋值
- 注意上例没有pass进fromIndex, 区别于func(a, b, c), 如果call的时候是func(1,2)则b=2, c=undefined, 不可能跳过b, 除非func(1, , 2). 但是obj可以随意跳过某个key

#### <a name="assignment-with-operation" id="assignment-with-operation">4.11.1 Assignment with Operation</a>

注意L1, the expression <span class="red">a is evaluated once</span>. 但是L2, it is <span class="red">evaluated twice</span>.

```javascript
a op= b
a = a op b
```

注意区别下面两个Ex. 虽然assignment operator has right-to-left associativity, 但是Javascript会先evaluate一次, 把i先代入, 然后再从右往左计算. 

所以Ex1中, data[i++] evaluate了两次. 区别于Ex2, data[i++]只evaluate了一次.

```javascript
// Ex1
let data1 = [1,2,3,4,5], i1=1;
data1[i1++] = data1[i1++]*10; // data[1++] = data[2++]*10
console.log(data1); // [1, 30, 3, 4, 5]
console.log(i1); // 3

// Ex2
let data2 = [1,2,3,4,5], i2=1;
data2[i2++] *= 10; // data[1++] *= 10
console.log(data2);// [1, 20, 3, 4, 5]
console.log(i2); // 2

let a=1, b=a++;
console.log(`a = ${a}, b = ${b}`); // a = 2, b = 1
```

#### <a name="typeof-instanceof" id="typeof-instanceof">4.13.3 The `typeof` and `instanceof` Operator</a>

<span class="orange bold">Primitives </span>are: `undefined`, `null`, `number`, `string`, `boolean`, `symbol`. 他们没有constructor, 不存在instanceof.

All <span class="orange bold">non-primitive</span> objects are instances of <b>Object</b>.

<span class="white-on-black">typeof</span>

The <b>`typeof`</b> operator is used for getting the <b>type of primitive values</b> mainly.

`typeof` returns `undefined`, `number`, `string`, `boolean`, `symbol`, `object`, `function`. 和primitive types比, <span class="orange">没有`null`, 多了`function`</span>.

Ex1.

```javascript
typeof 1; // number

let foo = 1;
typeof foo; // number

typeof NaN; // number

typeof null; // object

typeof false; // boolean

```

Ex2. Anything that is created using the `new` operator is of type `object`, including `String`, `Boolean`, and `Number` :

```javascript
// 注意区别下面三种情况. 一旦用new了, 就是object了
typeof Boolean(0) === "boolean"; // true; 注意这里是true, 
typeof new Boolean(0) === "boolean"; // false
typeof new Boolean(0) === "object"; // true
```

<span class="white-on-black">instanceof</span>

The <b>`instanceof`</b> operator tests whether the prototype property of a constructor <b>appears anywhere in the prototype chain</b> of an object. 就是看这个object的prototype chain上有没有这个constructor.

Ex3. 

- 注意`typeof`和`instanceof`的区别
- foo的prototype chain上先有String, 再有Object

```javascript
let foo = new String("foo");
console.log(typeof foo); // object
console.log(foo instanceof String); // true
console.log(foo instanceof Object); // true
```

#### <a name="for-of" id="for-of">5.4.4 for/of</a>

The `for/of` loop works with <span class="bold">iterable</span> objects. <span class="red">Arrays, strings, sets, and maps</span> are iterable: they represent a sequence or set of elements that you can loop or iterate through using a for/of loop.

- ```for/of``` <span class="red">不能用于object</span>
  - <b>Objects</b> are <b>not</b> (by default) iterable. Attempting to use ```for/of``` on a regular object throws a <span class="red">TypeError</span> at runtime.
- ```for/in``` 可以loop thru object, 但是包括enumerable <u>inherited</u> props. 所以一般用Object.keys(obj) + for/of
- ```for/in``` with array will loop through <b>index</b> 
  - ```for(const index in str) { str[index] }```
- ```forEach```<u>只能</u>用于array

```javascript
let arry = [1,2,3], sum = 0;
for (let num of arry) {
	// (let i=0,size=arry.length; i<size; ++i)
	sum += num;
}
```

- ```for/of``` with strings

```javascript
let getFreq = (str) => {
    const freq = {};
    
    for(let char of str) { //不能用str.forEach, forEach只能用于array
        if(!freq[char]) { //注意不是str[char]了, 区别于for/in才是index
            freq[char] = 0;
        }
        freq[char]++;
    }

    Object.keys(freq).forEach((key) => console.log(key, freq[key]));
};

getFreq("mississippi");
// "m: 1"
// "i: 4"
// "s: 4"
// "p: 2"
```

#### <a name="for-in" id="for-in">5.4.5 for/in</a>

While a ```for/of``` loop requires an <b>iterable</b> object after the of, a ```for/in``` loop works with any object after the in. 

但是```for/in```会loop through <span class="red">enumerable <u>inherited</u> properties</span>. For this reason, many programmers prefer to use a ```for/of``` loop with ```Object.keys()``` instead of a ```for/in``` loop.

Loop through Object的方法:

<u>相较于for/in, 更常用for/of + Object.keys/values/entries</u>, 避免inherited properties

- ```Object.keys(obj)```, ```Object.values(obj)```, ```Object.entries(obj)``` returns an array of a given object's <span class="red bold">own</span> <b>enumerable</b> key, value, [key, val] pair, <span class="red bold">no inherited</span> ones, 区别于```for/in```.

	```javascript
	let obj = {x: 1, y: 2};
	console.log(Object.keys(obj).join('')) // "xy"
	
  console.log(Object.keys(obj).reduce((acc, cur) => acc + obj[cur], 0)); // 这里是obj[cur], cur是key
	
	Object.entries(obj).forEach(([key, val]) => console.log(key, val)) // 勿忘括号([key, val])
	// "x 1"
	// "y 2"
	``` 
	
-  ```for(let key in obj)``` will loop enumerates properties <span class="red">in the prototype chain</span> as well. 可以用```for/in``` test if property exists (both its own + inherited).

	```javascript
	let o = { x: 1 };
	"x" in o // => true: o has an own property "x"
	"y" in o // => false: o doesn"t have a property "y" 
	"toString" in o // => true: o inherits a toString property
	```

#### <a name="create-obj" id="create-obj">6.2 Creating Objects</a>

There are three ways to create object. o1, o2, o3 created方式生成的obj是等效的

```javascript
let obj = {x: 1, y: 2}; // object created with object literals
let obj_dup = Object.create(obj);

let o1 = {};
let o2 = new Object();
let o3 = Object.create(Object.prototype);
```

```Object.create(proto)``` 会返回一个新的object, 以proto作为他的prototype, 
即新的object inherits properties from proto.

```let p = Object.create({x: 1, y: 2});``` p inherits properties both from ```{x: 1, y: 2}``` and `Object.prototype`.

#### <a name="obj-method" id="obj-method">6.9 Object Methods</a>

```Object.create()```, ```Object.keys()```, etc, they are all static functions defined on the <b>Object constructor</b>.

Here, we introduce some universal object methods that are defined on <b>Object.prototype</b>: 

- ```obj.toString()```: 如果不override, output永远是"[object Object]"
- ```obj.valueOf()```: will be called when convert to Number is needed (eg: 比较大小的时候 >, <). eg: 下面的Number(point)和point < 4

	```javascript
	let o = {x: 1};
	o.valueOf(); // {x: 1}
	Number(o); // NaN
	```

- ```obj.toJSON()```: will be invoked when ```JSON.stringify()``` is called


```javascript
// override original Object.prototype.method
let point = {
    x: 3, 
    y: 4,
    toString() { // 注意this的用法
        return `(${this.x}, ${this.y})`;
    },
    valueOf() { 
    	return Math.hypot(this.x, this.y);
    },
    toJSON() {
    	return this.toString();
    }
};
console.log(point.toString()); // (3, 4)
console.log(JSON.stringify(point)); // "(3, 4)"
console.log(Number(point)); // 5, valueOf is called
console.log(point < 4); // false, 因为convert to Number以后point=5
```

#### <a name="extending-obj" id="extending-obj">6.7 Extending Objects</a>

Extend object的方法有如下几种

- 最原始的copy it over. 注意这里用的不是for/in, 而是<b>for/of + Object.keys</b>, 避免了inherited properties

	```javascript
  // copy source into target
	let target = {x: 1}; // target后面被赋值, 必须用let, 不能const
  const source = {x: 2, y: 3};
	Object.keys(source).forEach((key) => {
      target[key] = source[key];
  });
	target; // {x: 2, y: 3}
	```
- ```Object.assign(targetObj, sourceObj1, sourceObj2,...)```, 这里后面sourceObjs会override前面obj的properties. <span class="orange">Object.assign会trigger targetObj的setter</span>.

	```javascript
	// 如果想用defaults补齐o中没有default val的properties, 这个做法会override o中本身有的property的val
	Object.assign(o, defaults)
	
	//这个做法解决了上面的问题, 复制了defaults给{}
	Object.assign({}, defaults, o); 
	```
- 自己写一个merge function, escape已有的properties

	```javascript
	// 注意spread operator
	function merge(target, ...sources) {
      // 注意sources是个array, 区别于arguments要Array.from(arguments)
      sources.forEach((source) => {
          target = {
              ...target,
              ...source
          };
      });
      return target; // 勿忘, 否则console没有输出
  }
  // {"x":2,"y":3,"z":4}
  console.log(`mergedObj = ${JSON.stringify(merge({x: 1}, {x: 2, y: 2}, {y: 3, z: 4}))}`); 
	```
- Use spread operator, see [6.10.4 Spread Operator + Rest Parameters](#extended-obj-literal-syntax-spread).


	```javascript
	// source的properties会overwrite target的
	target = {
      ...target,
      ...source
  }; 
	```
	
#### <a name="extended-obj-literal-syntax" id="extended-obj-literal-syntax">6.10 Extended Object Literal Syntax (更多的object literal的定义方法)</a>

An <b>Object Literal</b> is a comma-separated list of colon-separated name:value pairs, enclosed within curly braces, 即(key, value) pairs. eg:

```javascript
// Object `empty`, `point`, they are all object literals
let empty = {};
let point = { x: 0, y: 0 };
```

除了```{x: 1, y: 2}```这种常见的定义object的方法, there are a number of extended syntax for object literals as shown in the following sections.

##### <a name="extended-obj-literal-syntax-shorthand-prop-method" id="extended-obj-literal-syntax-shorthand-prop-method">6.10.1 Shorthand Properties + 6.10.2 Computed Property Names + 6.10.5 Shorthand Methods</a>

When using shorthand syntax, besides a regular JavaScript identifier like the prop name "side" and function name "area", the key of object can be string literals (下面的`"prop/method with space"`) and computed property names (variable like  `PROP_NAME`, `METHOD_NAME`, `computedPropName()`), <span class="yellowBG">用bracket括起来就可以</span>, 类似于template string里的`${...}`, 告诉compiler这是expression, 要evaluate.

##### Shorthand Properties

```javascript
let x=1, y=2;

// instead of
let o = {
	x: x,
	y: y 
};

// DOTHIS: shorthand props
let o = { x, y };
```

```javascript
let x=1, y=2;
const PROP_NAME = "const prop name";
const computedPropName = () => "prop_1";
let obj = {
    x,
    y,
    [PROP_NAME]: "prop name is a variable",
    [computedPropName()]: "testing prop name returned by functions",
    "prop with space": "testing prop with space",
};
console.log(`obj.x = ${obj.x}, obj.y = ${obj.y}`);
console.log(`obj[PROP_NAME] = ${obj[PROP_NAME]}`); // prop name is a variable
console.log(`obj[computedPropName()] = ${obj[computedPropName()]}`); // testing prop name returned by functions
console.log(`obj[prop with space] = ${obj["prop with space"]}`); // testing prop with space
```

##### Shorthand Methods

1. function name后直接是(): ```area()```
2. functionName()后没有冒号, 直接{ ... }

```javascript
let square = {
    side: 10,
    areaOld: function() { // instead of
    	return this.side * this.side;
    },
    area() { // DOTHIS: shorthand methods
        return this.side * this.side; // 注意这里this的应用
    }
}
square.area(); // 100
```

```javascript
const METHOD_NAME = "plus1";
let square = {
    side: 10,
    area() {
        return this.side * this.side;
    },
    "method with space"(x) {
        return x;
    },
    [METHOD_NAME](x) {
        return x+1;
    }
};
console.log(`square.area = ${square.area()}`);

//注意写法obj[funcName](param)
console.log(`square["method with space"](1) = ${square["method with space"](1)}`); // 1
console.log(`square.plus1(2) = ${square[METHOD_NAME](1)}`);  // 2
```

##### <a name="extended-obj-literal-syntax-spread" id="extended-obj-literal-syntax-spread">6.10.4 Spread Operator + Rest Parameters</a>

##### <span class="white-on-black">Spread Syntax</span>

Spread syntax can be used when all elements from an object or array need to be included in a list of some kind. 

类似于unpack elements of an array, 变成单个的items, 或者是unpack an object, 变成单个的(key, value) pairs.

Spread operator可以用于
- <span class="orange">Array</span> `sum(...nums)`
- <span class="orange">Object</span> `copy = { ...obj }`
- Convert <span class="orange">array-like</span> to array `nodeArry = [...document.querySelectorAll(img)]`, `[...arguments]`
- <span class="orange">String to array</span> `[...str]`
- <span class="orange">Set/Map to array</span> `[...set]`

* <b>For function calls </b>
	
    一般用于function的params有好多, 把它们合成一个array.

    过去这种情况用`myFunc.apply(null, args)`, 现在可以直接用`myFunc(...args)`

    ```javascript
    myFunction(...arry);  // myFunction(1,2,3), arry = [1,2,3]
    ```

    Example: 
        
    ```javascript
    const sum = (x, y, z) => x + y + z;
    let nums = [1, 2, 3];
        
    console.log(sum.apply(null, nums)); // 6
    console.log(sum(...nums)); // 6
        
    nums.push(4);
    console.log(sum(...nums)); // 依然是6, 虽然nums的4个数 all would be passed, but only the first three would be used 

    function sum2(...arry) { // 和sum(x,y,z)类似, 只是这里把params合成了一个array, 并且param没有个数限制
        return arry.reduce((acc, cur) => acc + cur, 0);
    }
    sum2(...nums); // 10, 区别于sum(nums)只取前三个
    ```
	
	注意是sum.apply(null, args)不是Function.prototye.apply(thisArg, argsArry), 区别于
	- Array.prototype.slice.call(arguments)
	- Array.prototype.unshift.apply(arry1, arry2)
        ```javascript
        arry1.unshift(4, 5); // [4,5, ..arry1]
        arry1.unshift(...arry2); 
        [...arry2, ...arry1];
        ```
	- 区别Spread Operator和Rest Parameter. 
		- sum2<b>定义</b>中的(<span class="orange">...nums</span>) 是rest paramter
		- sum2<b>具体使用时</b>sum2的(<span class="orange">....nums</span>)是spread operator
	
* <b>For array literals</b>
	
	```javascript
	[...arry1, "4", ...arry2, 6]; // unpack elements of an array, and combine them to a new array
	```
		
	Example: 
	- <b>Copy Array</b>, 等同于`arry.slice()`
	
        ```javascript
        let arry1 = [1,2,3];
        let arry2 = [...arry1]; // like arry1.slice()
            
        arry1.push(4);
        console.log(arry1); // [1,2,3,4]
        console.log(arry2); // [1,2,3] arry2依然是[1,2,3]
        ```	
        
        但是Spread syntax effectively goes <u>one level deep</u> while copying an array. Therefore, it may be <u>unsuitable for copying multidimensional arrays</u>, as the following example shows.
        
        ```javascript
		let a = [[1], [2], [3]];
		let b = [...a]; // b = [[1], [2], [3]]
			
		b.shift().shift(); //  1, 注意返回的是shift出去的: [1].shift()的1
		console.log(b); // [[2], [3]], 注意b只剩两个了
		console.log(a); //[[], [2], [3]], 注意a的第一个的1没了
		```
		
	- <b>Concatenate Arrays</b>, 等同于`arry1.concat(arry2)`, 类似的还有`Array.prototype.unshift.apply(arry1, arry2)`
	
        ```javascript
        let arry1 = [1, 2], arry2 = [3, 4];
        arry1 = [...arry1, ...arry2]; // 等同于arry1.concat(arry2): [1,2,3,4]
        
        arry1 = [1, 2]; // reset arry1
        // 勿忘.apply. 等同于[...arry2, ...arry1]
        Array.prototype.unshift.apply(arry1, arry2); //[3,4,1,2], 把arry2整个放在arry1前面
        
        arry1 = [1, 2]; // reset arry1
        // 注意这里依然是[3,4,1,2], 不是[4,3,1,2]
        arry1.unshift(...arry2); // [3,4,1,2]
        ```

* <b>For object literals</b>

    ```javascript
    let objClone = { ...obj }; // pass all key:value pairs from an object 
    ```

    ```javascript
    const obj = { foo: "bar" };
    const clone = { ...obj }; // { foo: "bar" }
    obj.foo = "baz";
    clone.foo; // "bar", shallow copy, 没有随着obj.foo变
    ```

    If the object that is spread and the object it is being spread into both have a property with the same name, then the value of that property will be the one that comes last:

    ```javascript
    let obj1 = { foo: "bar", x: 42 };
    let obj2 = { foo: "baz", y: 13 };
    let mergedObj = {...obj1, ...obj2}; // obj1.foo will be overwritten by obj2.foo
    console.log(JSON.stringify(mergedObj)); // {"foo":"baz","x":42,"y":13}
    ```

    Also note that the spread operator only spreads <span class="orange"><u>own</u> <u>enumerable</u></span> properties of an object, <span class="orange">not any inherited ones</span>:

    ```javascript
    let o1 = Object.create({ x: 1 }); // o1 inherits the property x
    let o2 = {...o1};
    console.log(o2.x); // undefined, 注意o2没有inherited property x
    ```

    注意下面用spread operator clone的obj, does NOT copy inherited properties, <span class="orange">NOR inherit class information</span>.
    在这一点上, <u>Object.assign() behaves the SAME</u>.

    ```javascript
    class BaseClass {
        foo() {
            return "baseClass";
        }
    }
    class MyClass extends BaseClass {
        bar() {
            return "myClass: bar";
        }
    }
    const myClass = new MyClass();
    myClass.baz = function() {
        return "myClass: baz";
    }

    const clone = { ...myClass };
    // 注意spread除了clone props, 还clone functions
    console.log(clone); // {baz: [Function]}. 注意clone没有bar也没有foo, new MyClass()的bar是inherited
    console.log(JSON.stringify(clone)); // {}, 区别于直接log, clone没有props,只有function

    console.log(clone.constructor.name); // Object
    console.log(clone instanceof MyClass); // false

    const clone2 = Object.assign({}, myClass); // Object.assign()和...一样, 都没有inherited
    console.log(clone2); // {baz: ƒ} 没有bar也没有foo
    ```

    Example:
  
    - <b>Clone / Extend Object</b>: Note that the cloning is always <span class="orange">shallow</span>, eg: 下面circle.style和coloredCircle.style指向的是同一个ref.

        ```javascript
        const circle = {
            radius: 10,
            style: {
                background: "red"
            }
        };
        const coloredCircle = {
            ...circle, // 注意写法
            color: "black"
        }
        console.log(JSON.stringify(coloredCircle)); // {"radius":10,"style":{"background":"red"},"color":"black"}

        coloredCircle.radius = 20;
        coloredCircle.style.background = "yellow";
        // style是shallow copy, circle.style.background也变了, 但是radius没变
        console.log(JSON.stringify(circle)); // {"radius":10,"style":{"background":"yellow"}}
        ```

    - <b>Merge Object</b>

        ```javascript
        const circle = {
            radius: 10,
            style: {
                background: "red"
            }
        };
        const style = {
            border: "1 px";
        };
        const mergedCircle = {
            ...circle,
            ...style
        };
        // 注意border并没有被汇进style里, 因为...style后剩下的只有它的(key,value) pair了
        console.log(JSON.stringify(mergedCircle)); // {"radius":10,"style":{"background":"yellow"},"border":"1px"}
        ```
            
    <div class="border">
    <h3 class="title">Spread operator vs. Object.assign()</h3>
    -- 都是shallow copy
    -- 都是does NOT copy inherited properties, NOR inherit class information
    -- <b>Object.assign()</b> invokes <span class="orange">setters</span> on the target object, while <b>spread operator</b> doesn’t, it defines <span class="orange">new properties</span> in the target object. <span class="blue">See Ex1</span>, spread operator没有trigger set导致circle.radius没能update.
    <br>
    -- 但是因为Object.assign会trigger setter, 所以如果targetObj有read-only properties时会ERROR, 但是spread operator就不会. <span class="blue">See Ex2</span>.
    </div>

    Ex1: 下面的diameter是<span class="orange">accessor property</span>, 对应于data property (6.10.6 Property Getters and Setters). 注意<span class="orange">accessor prop在JSON.stringify时不会print出来</span>.
        
    ```javascript
    class Circle {
        constructor(radius) {
            this.radius = radius;
        }
        get diameter() {
            return this.radius * 2;
        }
        set diameter(val) {
            this.radius = val/2;
            console.log(`diameter SET called, val = ${val}`);
        }
    }
    
    const circle = new Circle(10);
    // 注意diamter没有print出来 只有radius
    console.log(JSON.stringify(circle)); // {"radius":10} 注意没有diameter, 区别于radius, diameter只能通过circle.diameter得到
    
    const c1 = Object.assign({}, circle, { diameter: 30 });
    console.log(JSON.stringify(c1)); // {"radius":10,"diameter":30}, 注意radius没有变, 且diameter是新添的, 不是circle.diameter
    console.log(c1.diameter); // 30, 这里的diamter不是circle.diameter
    
    const c2 = Object.assign(circle, { diameter: 40 }); // trigger "diameter SET called, val = 40"	
    // 注意circle.radius变了, 但没有diameter这个prop!!! 区别于c1
    console.log(JSON.stringify(c2)); // {"radius":20} 依然只有radius,没有diameter
    console.log(c2.diameter); // 40
    console.log(circle); // {radius: 20} 本身的circle变了
    
    const c3 = {
        ...circle,
        diameter: 50
    };
    console.log(JSON.stringify(c3)); // {"radius":20,"diameter":50}, 和c1一样, diameter是新添的, 和circle.diameter没关系
    console.log(circle); // {radius: 20}
    console.log(circle.diameter); // 40, 没变
    ```	
        
    <span class="yellowBG">注意区别上面的c1和c2:</span>
    
    - c1的targetObj是{}, 所以setter没有被trigger, 所以circle.radius也没有变. c2的targetObj是circle, 所以setter被trigger了, 因此circle.radius也变了.
    - c1的diameter是新添的, 和circle.diamter没关系. c2的diamter是circle本身的. log(c1)有diameter, 但是log(c2)没有diameter
    
    <span class="yellowBG">c2和c3的区别:</span>
    
    - c3的spread没有trigger setter, 只是assign了新的diameter给c3, 所以circle.radius没变, 并且c3也有prop-diameter, 和c1一样
    
    Ex2:
    
    ```javascript
    const blueSquare = {
        length: 100,
        color: "blue"
    };
    Object.defineProperty(blueSquare, "color", {
        value: "blue",
        enumerable: true,
        writable: false // color is NOT writable
    });
        
    const style = {
        color: "red"
    };
    
    const greenSquare1 = {
        ...blueSquare,
        ...style
    };
    // spread是assign new prop, blueSquare的setter不会被trigger, 所以这里style变成red
    console.log(JSON.stringify(greenSquare1)); // {"length":100,"color":"red"}
    
    //Object.assign会trigger blueSquare的setter, 因为color is NOT writable, 所以ERROR
    const greenSquare2 = Object.assign(blueSquare, style); // Uncaught TypeError: Cannot assign to read only property "color" of object "#<Object>"
    
    const g3 = Object.assign({}, blueSquare, style);
    console.log(g3) // {length: 100, color: "red"} 和上面c1类似, targetObj不是blueSquare
    ```
        
##### <span class="white-on-black">Rest Parameters</span>

The rest parameter syntax allows a function to accept an indefinite number of arguments <span class="orange">as an array</span>, 区别于`arguments`.

<span class="orange">Rest用于function definition时的params</span>, 因此具体用这个function的时候pass进的params是无所谓多少个的. 区别于<span class="orange">Spead用于具体用function的时候</span>, 只是为了不一个一个写params, 但是function本身定义时能接受的params是定量的.

```javascript
function f1(a, b, ...rest) {
	// ... rest是一个array
}

const arry = [1,2];
f2(...arry); // 区别于f1(...rest)的rest, 这里表示f2的params是一个一个的数字
```

<div class="border">
	<h3 class="title"> Spread syntax vs. Rest syntax</h3>
	<b>Spread Syntax</b>可用于unpack <u>arry and object</u>, transform <u>array-like object (string/arguments/NodeList)</u> and <u>iterable object (set/map)</u> to an array.
	<br>
	-- Unpack <b>array</b> 例如上面[...arry1, 4, ...arry2, 6]<br>
  -- Unpack <b>object</b> `{ ... obj }`<br>
  -- Transform <b>array-like</b> to array `nodeArry = [...document.querySelectorAll("img")]`, `[...arguments]` <br>
  -- Transform <b>string</b> to array `[...str]`<br>
  -- Transform <b>set</b> to array  `[...set]`, `[...map]`<br>
	-- <u>Spread operator</u>一般用于function invocation. eg: `Math.max(...nums)`, `arry1.push(...arry2)`. <br>
	<span class="orange">区别于</span><u>Rest parameter</u>, 一般用于function definition. eg: `function f(a, ...args)`<br>
	<br>
	<b>Rest Syntax</b> 
	<br>
	-- Collects multiple elements and "condenses" them into a single element. 他是把所有剩下的args集中到一个array中. 具体看下面的Rest Parameters. <br>
	-- Rest parameters一般用于function definition.<br>
	-- A function <b>definition</b> can have only one ...restParam. `function foo(...one, ...wrong, ...wrong); // WRONG` <br>
	-- The rest parameter must be the last parameter in the function definition. `function foo(...wrong, arg2, arg3); // WRONG` <br>
</div>


```javascript
// Ex1
function sum(...args) {
    // 注意这里args直接就是个array
    return args.reduce((acc, cur) => acc + cur, 0);
}
const arry = [1,2,3];
console.log(sum(...arry)); // 6. 注意不是sum([1,2,3])!!!

// Ex2
function multiply(multiplier, ...args) {
    return args.map(num => num*multiplier);
}
console.log(multiply(10, 1, 2, 3)); // [10, 20, 30]
```

区别于具体用sum的时候```sum(...arry)```:  这里arry是已知的, 是Spread Operator, 只是为了不用一个一个写params, 所以用spread operator把nums里的items unpack. 
<br><br>
区别于sum的定义```function sum(...args)```是未知的, 作用是把所有剩下的args集合成一个arry, pass进function.


<div class="border">
	<h3 class="title">Rest Parameters vs. arguments</h3>
	-- The <b>arguments</b> is an array-like object, is <span class="orange">not a real array</span>, 只有`argments.length`,  while <b>...restParams</b> <span class="orange">is an array</span> instance, meaning methods like sort, map, forEach or pop can be applied on it directly; <span class="blue">See Ex1</span>.
	<br>
	-- The <b>...restParams</b> packs all the extra parameters into a single array, therefore it does not contain any named argument defined <span class="orange">before</span> the <b>...restParams</b>. Whereas the <b>arguments</b> object contains all of the parameters -- including all of the stuff in the <b>...restParams</b> -- unpacked. <span class="blue">See Ex2</span>.
</div>

Ex1: 注意`arguments` transforms into an array的三种方法

```javascript
function sortRestArgs(...args) {
    return args.sort();
}
function sortArguments() { // 这里不用写params
    try {
        return arguments.sort();
    } catch(e) {
        console.log(e);
        
        // -- From arguments to an array --
        let arry1 = Array.prototype.slice.call(arguments);
        // -- or --
        let arry2 = Array.from(arguments);
        // -- or --
        let arry3 = [...arguments];
        
        console.log(arry1.sort()); // [1, 3, 5, 7]
        console.log(arry2.sort()); // [1, 3, 5, 7]
        console.log(arry3.sort());
    }
} 
// 注意这里sortRestArgs和sortArguments pass进的都不是array!!! 
// 不是sortRestArgs([5,3,7,1])!!!
console.log(sortRestArgs(5,3,7,1)); // [1, 3, 5, 7]
console.log(sortArguments(5,3,7,1)); // throws a TypeError (arguments.sort is not a function)

```

Ex2:

```javascript
function myFunc(a, b, ...otherArgs) {
	console.log(`a = ${a}, b = ${b}`);
	console.log(otherArgs);
	console.log(`otherArgs.length = ${otherArgs.length}`);
	
	// Array.from不是in-place, arguments没变
	console.log(Array.from(arguments)); // 注意这里arguments转换成array
	console.log(`arguments.length = ${arguments.length}`); // arguments只有.length
}
myFunc(1, 2, 3, 4, 5);
// a = 1, b = 2
// [3, 4, 5] <-- 注意otherArgs是一个array
// otherArgs.length = 3
// [1, 2, 3, 4, 5] <-- arguments
// arguments.length = 5

myFunc(1); 
// a = 1, b = undefined
// [] <-- 注意虽然只有一个param, otherArgs依然是arry, 只是是空arry, 不是undefined, 区别于b
// otherArgs.length = 0
// [1] <-- arguments
// arguments.length = 1
```

#### <a name="create-arry" id="create-arry">7.1 Creating Arrays (`Array.of`, `Array.from`)</a>

Javascript array is a type of object, it's a collection of data. Each value gets numeric index and may be any data type. 

Array has a `length` property that tells how many items are in the array and is automatically updated when you add or remove items to the array.

Ex. 

- 注意只有以non-negtive integer的方式添加才会改变`length`. 否则都是添加到object上了, 类似obj的key.
- 注意以不是non-negtive integer加进去的, 在`JSON.stingify`时不会显示出
  - JSON.stringify(arry)得到的没有index/key, 就是本身arry. eg: ["cat", "mouse"]

```javascript
let arry = [];
arry[0] = "cat";
arry[1] = "mouse";
console.log(arry.length); // 2

arry["favoriteFood"] = "pizza"; // this DOES NOT add to the array. Setting a string parameter adds to the underlying object
console.log(arry.length); // 2, 不是3

arry[-1] = -1;
console.log(arry.length); // 2, negative也不会影响arry.length

console.log(JSON.stringify(arry)); //["cat","mouse"], 只有non-negatvie integer加进去的两个
console.log(arry); // ["cat", "mouse", favoriteFood: "pizza", -1: -1], 注意添加的最后两个
```

<b>Ways to create Array</b>

* Array literals `let arry = [1,2,3];`
* The ... spread operator on an <u>iterable</u> object
	
	<b>String / Array-like object / Set / Map to Array</b>. `[...string]`, `[...arguments]`, `[...set]`

	Spread operator works on any iterable objects (<span class="orange">任何可以用`for/of`的都是iterable</span>). 因为string is iterable, 所以可以用spread operator把它unpack.
	
	<span class="orange">Set objects are iterable, 但是objects本身并不是iterable.</span>
	
	Ex. Remove dups in a string. 利用了set可以remove dups
	
	```javascript
	let lettersArry = [..."hello world"];
	console.log(lettersArry); // ["h", "e", "l", "l", "o", " ", "w", "o", "r", "l", "d"]

  function removeDup(str) {
      const set = new Set([...str]); // 用array init set
      return [...set].join(""); // 注意join default param是comma',' 这里要用""
  }
  console.log(removeDup("hello world")); // helo wrd
	```
* The `Array()` constructor. 

	```javascript
	// construct from array length
	new Array(arrayLength)
	
	let fruits = new Array(2);
	console.log(fruits.length); // 2
	console.log(fruits[0]); // undefined
	```
	
	```javascript
	// construct from elements
	new Array(element0, element1, ..., elementN)
	
	let fruits = new Array("Apple", "Banana");

	console.log(fruits.length); // 2
	console.log(fruits[0]); // "Apple"
	```
	
	注意如果pass进的是a <b>single</b> argument, and that argument is a <b>number</b>, 都按arryLength处理. 而且number要处于[0, 2^32-1], 否则会报错.
	
	```javascrpt
	let arry = new Array(1);
	console.log(arry); // [undefined], arry.length=1;
	
	// 区别于[].length = 0, 和上面的arry不同
	
	arry = new Array(2);
	console.log(arry); // [undefined, undefined], arry.length=2
	
	arry = new Array(-1); // Uncaught RangeError: Invalid array length
	```

* `Array.of(elementN)`
	
	The `Array.of()` method creates a new Array instance from a variable number of arguments, 无论是几个arguments. 区别于 `new Array(...)` created array取决于params是一个还是多个

	```javascript
	let arry1 = new Array(2); // arry1 is an array with 2 empty slots
	let arry2 = new Array(1,2); // arry2 = [1,2]
	
	let arry3 = Array.of(2); // arry3 = [2]
	let arry4 = Array.of(1,2,); // arry4 = [1,2], 和new Array(1, 2)一样

	```

	`Array.of(7)` creates an array with a single element, 7, whereas `new Array(7)` creates an empty array with a length property of 7
* `Array.from()`
	
	```javascript
	Array.from(arrayLike) // arguments, nodeList, string, set, map
	
	// Arrow function, 类似于arry.map(), return一个新arry
	Array.from(arrayLike, (element) => { ... } )
	Array.from(arrayLike, (element, index) => { ... } )
	```

	`Array.from()` lets you create Arrays from: <b>array-like</b> objects (string) or <b>iterable</b> objects.
	
  * <b>array-like</b> object: objects with a <span class="orange">length</span> property and <span class="orange">indexed elements</span> <br><br>

    Ex1. `arguments`
    
    ```javascript
    const f1 = () => {
      console.log(arguments); // Uncaught ReferenceError: arguments is not defined
      return Array.from(arguments); // aborted
    };
    console.log(f1(4,5));
    
    function f2() {
      console.log(arguments); // [4, 5, callee: ƒ, Symbol(Symbol.iterator): ƒ]
      console.log(arguments[0], arguments[1]); // 4, 5
      return Array.from(arguments);
    }
    console.log(f2(4,5)); // [4, 5]
    ```
    
    注意上面f1的arrow function是没有arguments, 但是<span class="yellowBG">Arrow functions do not have an own arguments binding in their scope</span>; no arguments object is created when calling them. <br><br>

    Ex2. <span class="orange">NodeList</span>

    ```javascript
    const images = document.querySelectorAll("img"); // non-live NodeList
    const unsecuredUrls = Array.from(images).filter(img => img.src.startsWith("http://")); // str.startsWith(str): boolean
    const exLarges = Array.from(images).filter(img => img.src.includes("s-l1600")); // str.includes(str): boolean
    ```

    注意`str.startsWith()`和`str.includes()`

    Ex3. <span class="orange">String</span>, 等同于`[...string]`

    ```javascript
    Array.from("foo"); // [ "f", "o", "o" ]

    //等同于
    [..."foo"]; // ["f", "o", "o"]
    ```
		
  * <b>iterable</b> objects (eg: <span class="orange">Set</span> and <span class="orange">Map</span>).
      
    * Array from a Set
    
      ```javascript
      // const set = new Set(["a", "b", "a"]);
      const set = new Set([..."aba"]); // remove dup
      Array.from(set); // [ "a", "b" ]
      
      // 等同于
      [...set];
      ```

    * Array from a Map
    
      ```javascript
      const map = new Map([[1, 2], [2, 4], [4, 8]]); // 类似于new Map(Object.entries(obj))
      Array.from(map); // [[1, 2], [2, 4], [4, 8]] // 得到的是Object.entries(obj)
      
      const mapper = new Map([["1", "a"], ["2", "b"]]);
      Array.from(mapper.values()); // ["a", "b"];
      
      Array.from(mapper.keys()); // ["1", "2"];
      ```

  Ex. Using arrow functions and Array.from(), 类似于`arry.map`, but it is more efficient to perform the mapping while the array is being built than it is to build the array and then map it to another new array.

  ```javascript
  // Ex1
  function double() {
    return Array.from(arguments, elem => elem*2);
  }
  double(2,1,5); // [4,2,10]

  // Ex2
  const t2 = Array.from({length: 5}, (elem, index) => index);
  console.log(t2); // [0, 1, 2, 3, 4]
  ```
  注意上面Ex2

  * { length: 5 }满足了arry-like (有length prop). 
  * `Array.from({length: 5})`返回的是[undefined, undefined, undefined, undefined, undefined]. 
  * 后面的(elem, index) => index等同于 `(elem, index) => { return elem = index; }`, 加了{}后勿忘return.

#### <a name="arry-methods" id="arry-methods">7.8 Array Methods</a>

`arry.forEach`, `for/of`<br>
`arry.map`, `arry.filter`, <br>
`arry.find`, `arry.findIndex`, `arry.indexOf`, `arry.lastIndexof`, `arry.includes`, <br>
`arry.every`, `arry.some`, <br>
`arry.reduce`, `arry.reduceRight`, <br>
`arry.flat`, `arry.flatMap`, <br>
`arry.concat`, `arry.join` (join是arry变str), <br>
`arry.push`, `arry.pop`, `arry.shift`, `arry.unshift`, <br>
`arry.slice`, `arry.splice`, `arry.fill`, `arry.copyWithin`

- Most of the methods above will <b>NOT modify</b> the arry on which it is invoked. (<span class="orange">NOT in-place</span>). <b>`concat`, `flat`</b>都是non-inplace, original arry stays the same. <span class="orange">除了</span>以下这几个是<span class="orange">in-place</span>:
	- `push`, `pop`, `shift`, `unshift`
	- `splice`, `fill`, `copyWithin`
	- `sort`, `reverse`
- If the array is <span class="orange">sparse</span>, the function you pass is <b>not</b> invoked for nonexistent elements, but the returned array (if there is) will be <u>sparse in the same way</u> as the original array: it will have the same length and the same missing elements. <span class="orange">除了</span>
  - `arry.forEach` will skip the empty slot.
  - `arry.filter` will skip and return a densed array.
  - `arry.find` will loop thru nonexistent elements as well.
  - `arry.flat` is similar to `filter`, will remove empty elem/slot, but it will also remove one level empty [].

##### <a name="arry-iterator" id="arry-iterator">7.8.1 Array Iterator Methods</a>

##### <span class="white-on-black">forEach(for/of)</span>

```javascript
// Arrow function
arry.forEach((element) => { ... } )
arry.forEach((element, index) => { ... } )
arry.forEach((element, index, array) => { ... } )
```

`forEach`<span class="orange">没有return</span>, 也不改变本身arry, 且<b>无法`break`</b>. 

<span class="orange">Not In-Place</span>. <u>Original arry stays the same.</u>

适用于只对arry中的每个elem操作, <u>区别于`map`: `map`的意义在于returned arry</u>.

注意There is no equivalent of the `break` statement in `forEach` you can use with a regular `for` or `for/of` loop.

`arry.forEach`和`for/of`一样, 都是<span class="orange">sequential order</span>

Ex1. arry.forEach(elem) where elem is a <span class="orange">shallow</span> copy of original arry

```javascript
// Ex1.1
const arry = [1,2,3];
arry.forEach(num => {
  num = num*2; // 这里的num是copy of arry elem
  console.log(num); // 2, 4, 6
}); 
console.log(arry); // [1, 2, 3], 本身arry没有变

// Ex1.2
const arry = [1,2,3];
arry.forEach((num, index, arry) => {
  arry[index] = num * 2; // This modifies the array in place
  console.log(num); // 1, 2, 3. 这里的num是本身arry里的copy, 没有double, 和arry[index]没关系
}); 
console.log(arry); // [2, 4, 6], 用arry[index]修改了原arry

// Ex1.3
const arry = [{ a: 1 }, { b: 2 }];
arry.forEach((obj) => {
  obj.c = 3;
});
console.log(arry); // [{ a: 1, c: 3 }, { b: 2, c: 3 }], 这里本身arry变了, 因为elem是object
```

`arry.forEach(elem)`的<span class="orange">elem是本身arry的copy, 对elem的操作不改变原arry</span>
- Ex1.1 虽然forEach里num double了, 但是num是a copy of arry elem, 本身arry不变 
- Ex1.2区别于1.1, <span class="orange">用arry[index]改变原arry</span>, num是本身arry的copy, 没有double
- Ex1.3区别于1.1, 本身arry变了, 因为这里的elem是object

Ex2. arry.forEach with sparse array

```javascript
let arry = [1,,3];
arry.forEach(num => console.log(num)); // 1, 3
```

- arry.forEach callback is <u>Not invoked for empty slots</u> in sparse arrays.

Ex3. add/remove elems from array when arry.forEach

```javascript
// Ex3.1
const arry = [1, 2, 3];
arry.forEach(num => {
  console.log(num); // 1, 2, 3
  num = num * 2;
  arry.push(0);
});
console.log(arry); // [1, 2, 3, 0, 0, 0]

// Ex3.2
const arry = [1, 2, 3];
arry.forEach(num => {
  console.log(num); // 1, 1, 1
  num = num * 2;
  arry.unshift(0);
});
console.log(arry); // [0, 0, 0, 1, 2, 3]
```

- <u>The number of elements to visit is determined <b>BEFORE</b> the callback</u>: ex1和ex2都只loop了本身arry.length=3次
- 注意Ex3.1的push, 虽然arry有新的0加入, 但是loop只loop了原先arry.length=3次
- 区别Ex3.2的unshift, 也有3个0加入, 虽然也只loop了3次, 但是每次loop的都是1

Ex4. arry.forEach with async

```javascript
const arry = [5, 4, 5];
let sum = 0;
const sumAsync = async (a, b) => a + b;
// function declartion
async function sum(a, b) { return a + b; }

arry.forEach(async (num) => {
  sum = await sumAsync(sum, num) // 勿忘sum=, 否则sum不变
});
console.log(sum); // 0, (naively expected output: 14)
```

- 注意`arry.forEach` loop <u>does NOT wait for the async</u> function to complete before moving on to the next iteration.

Ex5. flatten arry (`arry.flat(depth)`)

```javascript
function flatten(arry) {
  const flattened = [];
  arry.forEach(elem => {
    if (Array.isArray(elem)) {
      flattened.push(...flatten(elem)); // 勿忘spread, push进的是单个elem, flatten() returned的是一个arry
    } else {
      flattened.push(elem);
    }
  });
  return flattened;
}
const nested = [1, 2, 3, [4, 5, [6, 7], 8, 9]];
flatten(nested); // [1, 2, 3, 4, 5, 6, 7, 8, 9]

nested.flat(Infinity); // [1, 2, 3, 4, 5, 6, 7, 8, 9]
```

- 注意arry.flat(<span class="orange">Infinity</span>)

##### <span class="white-on-black">map</span>

```javascript
// Arrow function
let newArry = arry.map((element) => { ... } )
newArry = arry.map((element, index) => { ... } )
newArry = arry.map((element, index, array) => { ... } )
```

<span class="orange">Return value</span>: A new array with each element being the result of the callback function.

<span class="orange">Not In-Place</span>. <u>Original arry stays the same.</u>

<b>Don't</b> using `map` when you <u>aren't using the returned array</u>. In that case, you should use `forEach` or `for...of`.

```javascript
let doubled = arry.map(num => num*2); // 只有在需要returned arry时才需要map
console.log(doubled); // [2, 4, 6]
```

##### <span class="white-on-black">filter</span>

```javascript
// Arrow function
let filtered = arry.filter((element) => { ...return true/false... } )
filtered = arry.filter((element, index) => { ... } )
filtered = arry.filter((element, index, array) => { ... } )

// Callback function
filtered = arry.filter(callbackFn)
filtered = arry.filter(callbackFn, thisArg)
```

<span class="orange">Return value</span>: A new array with the elements that pass the test. If no elements pass the test, an empty array will be returned.

<span class="orange">Not In-Place</span>. <u>Original arry stays the same.</u>

`arry.filter`的callbackFn返回的是true/false.

`arry.filter` <b>skips</b> missing elements in sparse arrays and that its <u>return value is always dense</u>. 

```javascript
// To close the gaps in a sparse array
let sparse = [1,,3,,5, undefined];
let dense = sparse.filter(() => true);
console.log(dense); // [1, 3, 5, undefined]]

// To close gaps and remove undefined and null elements,
sparse = sparse.filter((elem) => elem !== undefined && elem !== null);
console.log(sparse); //  [1, 3, 5]
```

```javascript
// use callback function
// Ex1.1
const isBigEnuf = val => val>4; // callback自动得到arry中的num
console.log([1,5,7].filter(isBigEnuf)); // [5, 7]

// Ex1.2 additional param for callback
function isBigEnuf2(threshold) {
  return function(num) { // 注意这里不用pass进threshold
    return num >= threshold;
  };
}
console.log([1,8,4,3].filter(isBigEnuf2(4))); // [8, 4]
```

- 注意Ex1.2中how to <u>pass in additional params to callback</u>: use higer-order function. Wrap callback in another function that takes extra params and returns the actual callback.

- Modify array while `filter`.

	```javascript
	// 本身length<6的是["spray", "limit", "elite"]
	let words = ["spray", "limit", "elite", "exuberant", "destruction", "present"];
	
	const modified = words.filter((word, index, arry) => {
	    arry[index+1] += " extra"; // 这里改变的下一个word
	    return word.length < 6; 
	});
	console.log(`words = ${words}`); // [spray,limit extra,elite extra,exuberant extra,destruction extra,present extra,undefined extra]
	console.log(`modified = ${modified}`); // [spray]
	```

  - 注意原始words多了一个, 且是"undefined extra"
	- 但是filter的<u>loop次数依然是原始words.length</u>, 虽然filter里的word已经是更新过的word了

- Appending new words while `arry.filter`.

  Ex1.
	```javascript
	// reset words, 因为之前words被改变了
	words = ["spray", "limit", "elite", "exuberant", "destruction", "present"];
	
	const appendedWords = words.filter((word, _, arry) => {
		arry.push("new");
		return word.length < 6;
	});
	console.log(`words = ${words}`); // [spray,limit,elite,exuberant,destruction,present,new,new,new,new,new,new]
	console.log(`appended = ${appendedWords}`); // [spray,limit,elite]
	```

  Ex2. 用unshift加在前面, 区别于Ex1
  ```javascript
  let words = ["spray", "limit", "elite", "exuberant", "destruction", "present"];
  const filtered = words.filter(word,  => {
    words.unshift("new");
    console.log(word); // 6个spray
    return word.length > 6;
  });
  console.log(words); // ['new', 'new', 'new', 'new', 'new', 'new', 'spray', 'limit', 'elite', 'exuberant', 'destruction', 'present']
  console.log(filtered); // []
  ```

  - Ex1中虽然push进了6个new, 但是loop只loop了本身words.length(6)次
  - 区别Ex1和Ex2, Ex2是从前面插入, 虽然也只loop了6次, 但是每次下一个word都是"spray": words[nextIndex]

- Deleting words while `filter`.	
	```javascript
	// reset words, 因为之前words被改变了
	words = ["spray", "limit", "exuberant", "destruction", "elite", "present"];
	
	const deleteWords = words.filter((word) => {
	    arry.pop();
	    return word.length < 6;
	});
	console.log(`words = ${words}`); // [spray,limit,exuberant]
	console.log(`deleted = ${deleteWords}`); // [spray,limit]
  ```

  - 因为pop, <u>fitler只进行了三轮</u>, 因为后面三个被pop掉了, 区别于前面的modify和append
	- 最终的words只剩3个word
	- deletedWords中没有elite, 因为在第二轮的时候被pop了
    
##### <span class="white-on-black">find and findIndex</span>

```javascript
// Arrow function
let foundElem = arry.find((element) => { ...return true/false... } )
foundElem = arry.find((element, index) => { ... } )
foundElem = arry.find((element, index, array) => { ... } )
```

<span class="orange">Return value</span>: The value of the <b>first element</b> in the array that satisfies the provided testing function. <u>Return的不是arry</u>.

`arry.find()` returns <span class="orange">undefined</span> if not found. `arry.findIndex()` returns <span class="orange">-1</span> if not found.


`find`和`findIndex`的callbackFn返回的是true/false.

```javascript
let arry = [1,2,3,4];
let found = arry.find(elem => elem%2 === 0);
console.log(found); // 2. 第一个满足条件的是2, iterate就结束了

let foundIndex = arry.findIndex(elem => elem === 2);
console.log(foundIndex); // 1. 第一次找到2是index=1的时候
```

- If the checking can be done <b>without</b> testing function, eg: <b>primitive equality check</b>, use `arry.indexOf()` or `arry.includes()`
  - If you need to find the <b>index of a value</b>, use `arry.indexOf()`. (It’s similar to findIndex(), but checks each element for equality with the value <u>instead of using a testing function</u>.)
  - If you need to find if a value <b>exists</b> in an array, use `arry.includes()`. Again, it checks each element for equality with the value <u>instead of using a testing function</u>. 
- If you need to find if any element satisfies the provided testing function, use `arry.some()`.

##### <span class="white-on-black">indexOf, lastIndexOf</span>

```javascript
let foundIndex = arry.indexOf(searchElement);
indexOf(searchElement, fromIndex);

let foundIndexFromEnd = arry.lastIndexOf(searchElement)
arry.lastIndexOf(searchElement, fromIndex)
```

<span class="orange">Return value</span>: The first index of the element in the array; -1 if not found.

```javascript
let arry = [2, 9, 9];
arry.indexOf(2);     // 0
arry.indexOf(7);     // -1

arry.lastIndexOf(9); // 2, 从后面开始找
arry.indexOf(9, 2);  // 2, 从index=2开始找9
```

<b>`indexOf()` compares searchElement to elements of the Array using strict equality `===`.</b>

注意`NaN === NaN` always returns false, means <u>indexOf cannot find NaN</u>. <br>
区别于 `includes`, `includes` can.

If array contains <u>objects instead of primitive values</u>, these methods check to see if two <u>references both refer to exactly the same object</u>. 

If you want to actually look at the <u>content of an object</u>, try using the `arry.find()` method with your own custom predicate function instead.

Ex. Finding all the occurrences of an element

```javascript
function findAllIndexes(arry, target) {
    const indexes = [];
    arry.forEach((num, index) => {
      if (num === target) {
        indexes.push(index);
      }
    });
    return indexes;
}
console.log(findAllIndexes(["a", "b", "a", "c", "a", "d"], "a")); // [0, 2, 4]
```

##### <span class="white-on-black">includes</span>

```javascript
arry.includes(searchElement)
arry.includes(searchElement, fromIndex)
```

<span class="orange">Return value</span>: true/false.

<b>`includes` checks if any element `===` searchElement, except it consider `NaN` to be equal to itself</b>. 

```javascript
let a = [1, true, 3, NaN];
a.includes(true); // true
a.includes(2); // false

a.includes(NaN); // true
a.indexOf(NaN); // -1, 注意和incldues的区别!!!
```

In case of objects, === means literally the same object, as in the same reference (same place in memory), not the same shape.

```javascript
let obj1 = {id: 1}, obj2 = {id: 2};
let ids = [obj1, obj2];
console.log(ids.includes(obj1)); // true
console.log(ids.includes({id: 1})); // false. obj不存在===, 除非是同一个
```

##### <span class="white-on-black">every and some</span>

```javascript
// Arrow function
let testResult = arry.every((element) => { ... } )
testResult = arry.every((element, index) => { ... } )
testResult = arry.every((element, index, array) => { ... } )

testResult = arry.some((element) => { ... } )
testResult = arry.some((element, index) => { ... } )
testResult = arry.some((element, index, array) => { ... } )
```

<span class="orange">Return value</span>: Boolean true/false.

The `every()` method tests whether <b>all</b> elements in the array pass the predicates. The `some()` method tests whether <b>at least one</b> element in the array passes the predicates.

Note that both `every()` and `some()` stop iterating array elements as soon as they know what value to return. 

```javascript
let arry = [1, 30, 39, 29, 10, 13];
let isBigEnuf = val => val > 10; // 注意callBackFn自动得到arry的num
console.log(arry.every(isBigEnuf)); // false
console.log(arry.some(isBigEnuf)); // true
```

```javascript
// Check if arry2 is a subset of arry1
const isSubset = (arry1, arry2) => {
	return arry2.every(elem => arry1.includes(elem)); // 勿忘return every的结果
};
fuction isSubset2(arry1, arry2) {
  for(const elem of arry2) {
    if (!arry1.includes(elem)) return false;
  }
  return true;
}
console.log(`isSubset = ${isSubset([1, 2, 3, 4, 5, 6, 7], [5, 7, 6])}`); // true
console.log(`isSubset = ${isSubset([1, 2, 3, 4, 5, 6, 7], [5, 8, 7])}`); // false
```

- 注意`arry.every`和`for/of`在上面的应用, isSubset中arry2.every一旦有一个不includes了, every就结束了. 和isSubset2的for/of的break一样

##### <span class="white-on-black">reduce and reduceRight</span>

```javascript
// Arrow function
let reducedResult = arry.reduce((acc, cur) => { ...must return some value... } )
arry.reduce((acc, cur, index, array) => { ... }, initialValue)
arry.reduce((accumulator, currentValue, index) => { ... } )
arry.reduce((accumulator, currentValue, index, array) => { ... } )

// Callback function
arry.reduce(callbackFn)
arry.reduce(callbackFn, initialValue)
```

<span class="orange">Return value</span>: The single value that results from the reduction, which is the `accumulator` - the first param in the reducer function. 

- callbackFn / reducerFn <b>MUST</b>  <span class="orange">return some value</span> as the value for `accumulator` in the next round, otherwise, `acc` / final result of `reduce()` will be `undefined`.

- <b>`initialValue`</b>

	If `initialValue` is provided, then `accumulator` will be equal to `initialValue`, and `currentValue` will be `arry[0]`, `curIndex` will be 0. 
	
	If no `initialValue` is provided, then `accumulator` will be `arry[0]`, and `currentValue` will be `arry[1]`, `curIndex` will be 1.
	
	- If array is empty and no `initialValue` is provided, `TypeError` will be thrown.
	- If `reduce` is called with only one value, the solo value will be returned <u>without calling callbackFn</u>.
		- Either arry has <u>only one element (regardless of position) but no `initialValue`</u> is provided, 
		- Or if <u>`initialValue` is provided but arry is empty</u>.
	
	```javascript
	const getMax = (a, b) => Math.max(a, b);
	
	// callbackFn is not invoked
	[50].reduce(getMax); // 50
	[].reduce(getMax, 50); // 50
	try {
      [].reduce(getMax); // TypeError
	} catch(err) {
	    console.log(err);
	}
	```

`reduce()` can be used anytime when trying to <b>combine all the elements in an array into a single output</b> value by a reducer function.

- Ex1. Sum / Multiply

	```javascript
	const arry1 = [1, 2, 3, 4];
	let sum = arry1.reduce((acc, cur) => acc + cur);
	console.log(`sum = ${sum}`); // 10
	
	// use callbackFn
	function reducer(acc, cur) { // callbackFn可以自动得到acc, cur, index, arry
      return acc + cur;
	}
	sum = arry1.reduce(reducer);
	console.log(`callback sum = ${sum}`); // 10
	
	sum = arry1.reduce(reducer, 5); // callbackFn w initial val
	console.log(`reduce sum with initialVal 5, sum = ${sum}`); // 15
	
	let product = arry1.reduce((acc, cur) => acc * cur);
	console.log(product); // 24
	```
	
- Ex2. Sum of values in an object array. 

	```javascript
	let sum = [{x: 1}, {x: 2}, {x: 3}].reduce((acc, cur) => acc + cur.x, 0)； // 需要initialVal = 0
  console.log(`sum of obj.x = ${sum}`); // 6
	```
  - 区别于Ex1, 此时的reducer需要initialVal, 否则initialVal=arry[0]是个obj, 没办法加减

-  Ex3. Flatten an array of arrays
    ```javascript
    // Ex3.1 等同于 [[0, 1], [2, 3], [4, 5]].flat()
    function flatWithDepthOne(arry) {
      return arry.reduce((acc, cur) => {
        // return acc.concat(cur); // arry.concat不用check if(cur是arry), arry.concat可以take single elem or arry

        if (Array.isArray(cur)) {
          // acc = [...acc, ...cur];
          acc.push(...cur); // // 不能直接return. push返回的是长度
        } else {
          acc.push(cur);
        }
        return acc; // 勿忘return
      }, []);
    }
    console.log(flatWithDepthOne([[0, 1], 2, [3, [4, 5]]])); // [0, 1, 2, 3, [4,5]]

    // Ex3.2 等同于arry.flat(Infinity)
    function flatten(arry) {
      return arry.reduce((acc, cur) => {
        if (Array.isArray(cur)) {
          acc.push(...flatten(cur));
        } else {
          acc.push(cur);
        }
        return acc; // 勿忘return
      }, []); // 勿忘initial value
    }
    console.log(flatten([[0, 1], "a", ["b", [2, 3]], [4, 5]]));
    ```
    
    - reducer <b>MUST return</b> 一个value
    - 如果用acc.push(...cur), <span class="orange">不能直接</span> `return acc.push();`!! 因为push返回的是新的arry长度, 得写成`acc.push(...cur); return acc;`
    - 注意Ex3.1中`return acc.concat(cur)`. arry.concat返回一个新arry, 并且cur可以是单个elem, 也可以是一个arry, 不用check if(cur是arry)

- Ex4. Counting number of times a string appears in an array 

	```javascript
	let names = ["Alice", "Bob", "Tiff", "Bruce", "Alice"];
	let countMap = names.reduce((acc, cur) => {
		if(!(cur in acc)) { // 或者 if(!acc[cur])
		    acc[cur] = 0;
		}
		acc[cur]++;
		return acc; // 勿忘return!! 否则下次的acc是undefined!!
	}, {});
	console.log(`name count = ${JSON.stringify(countMap)}`); // {"Alice":2,"Bob":1,"Tiff":1,"Bruce":1}
	```

  - reducer需要initialVal {}
  - <span class="orange">勿忘reducer最后要返回acc</span>!!! 否则下次的acc是undefined!!

- Ex5. Grouping objects by a property
	
	```javascript
	let people = [
      { name: "Alice", age: 21 },
      { name: "Max", age: 20 },
      { name: "Jane", age: 20 }
  ];
  function groupByProp(arry, prop) {
      return arry.reduce((acc, cur) => {
          const val = cur[prop]; 
          if(!acc[val]) { // 不是if(prop in acc), key是cur.age
              acc[val] = [];
          }
          acc[val].push(cur);
          return acc; // 勿忘return!!
      }, {});
  }
  console.log(`${JSON.stringify(groupByProp(people, "age"))}`); // {"20":[{"name":"Max","age":20},{"name":"Jane","age":20}],"21":[{"name":"Alice","age":21}]}
	```

  - reducer需要initialVal {}
  - reducer里acc的key是cur[prop], 不是(prop in acc)
	
- Ex6. Remove duplicate items in an array
	
	```javascript
	let myArry = ["a", "b", "a", "b", "c", "e", "e", "c", "d", "d", "d", "d"];
    
    // let noDup = [...new Set(myArry)];
    // let noDup = Array.from(new Set(myArry));
    
    let noDup = myArry.reduce((acc, cur) => {
        // 不用map, 用arry测dup只能用includes
        if(!acc.includes(cur)) {
            acc.push(cur);
        }
        return acc; // 勿忘return!!
    }, []);
    console.log(noDup); // ["a", "b", "c", "e", "d"]
    
    // 如果用filter
	let map = {}; // 用map跟快, 相比较于用arry.includes
	noDup = myArry.filter((word) => {
	    if(!map[word]) { // !!undefined = false
	        map[word] = true;
	        return true;
	    } 
	    return false;
	});
	console.log(noDup); // ["a", "b", "c", "e", "d"]
	```

  - <span class="orange">用`Set` remove dups</span>. Set转Array可以用`[...set]`, 也可以用`Array.from(set)`.
  - 不用map, 用<b>arry测dup</b>可以用<span class="orange">`acc.includes`</span>或者<span class="orange">`acc.indexOf(cur) > -1`</span>.
  - 如果用`fitler`, 需要map.filter的callbackFn返回true的条件是!map[cur]
  - 用filter check dup的时候, 相较于用arry.includes(), 用map更快
	
- Ex7. Replace `.filter().map()` with `.reduce()`

	```javascript
	const nums = [-5, 6, 2, 0,];
  // fitler out positive nums and multiply them by 2
  // Ex7.1
  const doublePositive = nums.reduce((acc, cur) => {
      if (cur > 0) {
        acc.push(cur*2);
      }
      return acc; // 勿忘return!!
  }, []);
  console.log(doublePositive); // [12, 4]

  // Ex7.2
  nums.filter((num) => {
      if (num <= 0) return false;
      num = num *2;
      return true;
  }); // [6,2], filter针对的是原始的num, filter出的num是原来的num
  console.log(nums); // [-5, 6, 2, 0]

  // Ex7.3
  nums.filter((num, index, arry) => {
      if (num <= 0) return false;
      arry[index] = num * 2; // 虽然原始nums变了, 但filter针对的是一开始num
      return true;
  }); // [6,2]
  console.log(nums); // [-5, 12, 4, 0]
	```

  - 注意7.2和7.3, <u>filter针对的是原始的num</u>, filter callback中无论对pass进num操作或者改变原始arry都不影响filter的结果
  - Instead of `filter` then `map` that traverse arry twice, can use `reduce` by just one pass. `arry.forEach` also works.
  - 勿忘return acc

Ex8和Ex9都是<b>pipeline</b>. Ex8是pipeline arry of promise, Ex9是pipeline arry of fns.

- Ex8. <span class="red">Running Promises in Sequence</span>

	```javascript
	// 8.1
	const p1 = new Promise((resolve) => {
		resolve("p1"); // 不需要return resolve
	});
	const p2 = new Promise((resolve) => {
		resolve("p2");
	});
	function runInSeq1(...promises) {
		return promises.reduce((acc, cur) => { // 勿忘return, 才能runInSeq1.then
			return acc.then(val => {
				console.log(val); // undefined, p1
				return cur; // 等同于acc = cur
			})
		}, Promise.resolve()) // initialVal不是new Promise(). executorFunc is required when init Promise 
	}
	runInSeq2(p1, p2); // log没有p2, 返回的是p2这个promise
	runInSeq2(p1, p2).then(val => console.log(val)); // undefined p1 p2
	```

	- `promsie.then(val)`, `Promise.resolve()`, `Promise.reject()`都<b>returns a new Promise</b>
	- `new Promise(executorFunc)`的<u>executorFunc是required</u>, 不能只new Promise()
	- runInSeq1返回的是promise p2, log只有undefined和p1. 得runInSeq1.then才有p2

	```javascript
	// 8.2
	function p1(val) {
		return new Promise(resolve => {
			resolve(val * 5); // 不用return resolve
		});
	}
	function p2(val) {
		return new Promise(resolve => {
			resolve(val * 3);
		});
	}
	/**
	* runInSeq2返回的是一个Promise
	* => Promise.resolve(10).then(p1) 
	* => p1(10).then(p2))
	* => 最终的return是p2(10*5) = Promise.resolve(10*5*3)
	* runInSeq2.then(log) => Promise.resolve(10*5*3).then(log)
	*/
	function runInSeq2(promises, initVal) {
		// 勿忘return, 否则runInSeq2不能then
		return promises.reduce((acc, cur) => {
			return acc.then(cur); // 勿忘return
		}, Promise.resolve(initVal));
	}
	runInSeq2([p1, p2], 10).then(console.log); // 150
	```
	- runInSeq2的initVal是一个promise
	- runInSeq2的reducer中勿忘`return acc.then(cur)`, 否则接下来的acc就不是promise了, 变成了undefined.

	```javascript
	// 8.3
	function runInSeq3(...promises) {
		promises.forEach(async p => { // 勿忘async
			console.log(await p); // p1 p2
		});
	}
	const p1 = new Promise(resolve => resolve("p1"));
	const p2 = new Promise(resolve => resolve("p2"));
	runInSeq3(p1,p2);
	```

	- 注意`async/await`的用法. <u>`await`返回的是一个value</u>, 不是promise. 区别于Promise.resolve/reject/then
	
- Ex9. <span class="red">Function composition enabling piping</span>

	- 区别于Ex8的runPromisesInSeq(promises), Ex8中pass进的promises本身就是arry. 这里pipe的使用方式是一个一个的fn, 所以用`...fns`把一个一个的fn condense成一个arry: <span class="orange">`fns`是一个arry</span>. 
	
	```javascript
	const double = x => x * 2;
	const triple = x => x * 3;
	
	// fns condense成了一个arry
	const pipe = (...fns) => input => fns.reduce((acc, fn) => fn(acc), input);
	
	const multiply6 = pipe(double, triple);
	const multiply18 = pipe(double, triple, triple);
	
	console.log(multiply6(6)); // 36, 6是input, 先6*2再*3
	console.log(multiply18(2)); // 36, 2*2*3*3
	```

##### <a name="arry-flat" id="arry-flat">7.8.2 Flattening arrays with `flat()` and `flatMap()`</a>

```javascript
let flattened = arry.flat(); // default depth = 1;
flattened = arry.flat(depth);
flattend = arry.flat(Infinity); // flat所有内部arry
```

<span class="orange">Return value</span>: A new array with the sub-array elements concatenated into it.

<span class="orange">Not In-Place</span>. <u>Original arry stays the same.</u>
 
- <u>如果arry里没有nested arry</u>, arry.flat()返回的是本身的arry.
- <u>如果arry中有empty [] or empty elem</u>, arry.flat都会去掉 (<u>empty [] 只能去掉一层</u>).

`depth`: Defaults=1. 表示打开内部depth层[]. `Infinity`表示完全展开.


```javascript
let a = [1, [2, [3, [4]]]];

console.log(a.flat()); // [1, 2, [3, [4]]]
console.log(a.flat(1)); // [1, 2, [3, [4]]]. 和上面一样, default depth就是1

console.log(a.flat(2)); // [1, 2, 3, [4]]. 打开两层[]

console.log(a.flat(3)); // [1, 2, 3, 4]
console.log(a.flat(4)); // [1, 2, 3, 4]. 即使depth多了也无所谓
console.log(a.flat(Infinity)); // [1, 2, 3, 4]
```

`arry.flat` will remove empty slots in arrays, 无论是<u>empty elem</u>还是<u>empty arry</u>:

```javascript
// empth element
console.log([1, 2, , 4, 5].flat()); // [1, 2, 4, 5]
// 等同于
[1, 2, , 4, 5].filter(() => true);

// empty arry: 这种情况无法用filter实现
console.log([[], [], 1, 2].flat()); // [1, 2]
// filter无法去掉empty[], 只能去掉empty elem
console.log([1, 2, , 4, [], 6].filter(() => true)); // [1, 2, 4, [], 6]

// 但是flat只能去掉一层empty arry
console.log([1, 2, , 4, [[]], 6].flat()); // [1, 2, 4, [], 6]

```
<b>Alternatives</b>

- `flat()`一层的alternative: `reduce` + `concat`
	- <span class="orange">不能用`return [...acc, ...cur]`</span>, 因为cur不一定iterable / cur不一定是arry. 比如这里的a[0]=1, 1不是iterable, ERROR.
	- <span class="orange">思考</span>下面`concat`的过程!!

	```javascript
	let a = [1, [2, [3, [4]]]];
	console.log(a.reduce((acc, cur) => { // [1, 2, [3, [4]]]
		// return [...acc, ...cur]; // 不能用...cur, 因为cur不一定iterable. 比如这里的a[0]=1, 1不是iterable, ERROR.
		return acc.concat(cur);
    }, []));
    
	/** 
	 * a = [1, [2, [3, [4]]]], 思考[].concat(...a)
	 * ...a是 1, [2, [3, [4]]] 
	 * [].concat(1) = [1]
	 * [1].concat([2, [3, [4]]]) = [1, 2, [3, [4]]]
	 */
	console.log([].concat(...a)); // [1, 2, [3, [4]]]. 不是[1, [2, [3, [4]]] ]!!!
	```
- `flat(depth)`多层的alternative
	- Recursive
		- 注意recursive思路: <span class="orange">`reduce` + `concat` + `Array.isArray`</span>: recursivity
		- Stop condition是depth===0
		- `concat`可以pass进single elem或者arry. <span class="orange">思考</span>: 如果arry=[[1]], 第一次reduce的时候[].concat([1])其实就已经完全展开了, 但是如果arry=[[[1]]], 第一次是[].concat([[1]]) = [[1]]就不对了. 所以无论哪种情况都用`Array.isArray()`确保最后concat的只能是single elem.
		
		```javascript
		// recursive
		let a = [1, [2, [3, [4]]]];
		const flatDeep = (arry, depth = 1) => { // 注意default val的写法
			if (depth < 1) return arry;
			return arry.reduce((acc, cur) => {
			    return acc.concat(Array.isArray(cur) ? flatDeep(cur, depth-1) : cur);
			}, []);
	    };
	    console.log(flatDeep(a, 2)); // [1, 2, 3, [4]]
	    
	    /** recursive思路
	     * [1].concat(flatDeep([2, [3, [4]]], 1)) = ...from below... = [1].concat([2, 3, [4]]) = [1, 2, 3, [4]];
	     * flatDeep([2, [3, [4]]], 1) = [2].concat(flatDeep([3, [4]], 0)) = ...from below... = [2].concat([3, [4]]) = [2, 3, [4]]
	     * flatDeep([3, [4]], 0) = [3, [4]]
	     */
	     ```
	- Iterative
		- depth control is hard/inefficient. 这里只考虑完全flat
		- It's possible w/o reversing on shift/unshift, but array OPs on the end tends to be faster
		- <span class="orange">注意`const`的用法</span>: 
			- stack, res虽然后来值变了, 但是因为arry是reference val, 所以依然用的const. 
			- 对于next, 因为`const` is only scoped to the wrapping code block {}, 即<u>一次的loop,</u> 所以 a brand new 'next' variable is created on every iteration.
		- 注意stack = [...arry]是arry的copy, 后面虽然stack.pop()了, 但是并不影响本身的arry. <span class="orange">思考!!</span> 和7.8.3中的最后一个例子类似.

		```javascript
		const flatDeep = (arry) => { // [3, [4]]
			const stack = [...arry]; // [3, [4]], stack是arry的copy
			const res = [];
			while(stack.length > 0) {
				const next = stack.pop(); // next = [4], stack = [3]
				if(Array.isArray(next)) {
				    stack.push(...next); // stack = [3, 4]
				} else {
				    res.push(next); // res = [4]
				}
			}
			return res.reverse();
		};
		console.log(flatDeep(a)); // [1, 2, 3, 4]
		```
		
##### <a name="arry-concat" id="arry-concat">7.8.3 Adding arrays with `concat()`</a>

```javascript
const newArry = arry.concat(value0, value1, ... , valueN);

// 当valueN是arry时, arry1.concat(arry2)就是 [...arry1, ...arry2] 
```

<span class="orange">Return value</span>: a new array. <u>Original array stays the same</u>.

<span class="orange">Not In-Place</span>. <u>Original arry stays the same.</u>


`valueN`: can be values or array.

```javascript
const a = [1, 2],  b = [3, 4], c = [5, 6];
console.log(a.concat("test", b, c)); // [1, 2, "test", 3, 4, 5, 6]
```

<span class="orange">区别下面两种情况</span>

- num1.concat(num2)就是 [...num1, ...num2], ...num1是[1], 所以num1.push(4)并不会影响后来的nums
- 但是如果是对已经spread了的[1]中push(5), nums就变了

```javascript
const num1 = [[1]], num2 = [2, [3]];
const nums = num1.concat(num2);
console.log(nums); // [[1], 2, [3]]; 

// case 1
num1.push(4); 
console.log(nums); // [[1], 2, [3]]; 注意此时nums不变
// case 2
num1[0].push(5);
console.log(nums); // [[1, 5], 2, [3]]; 但是这里nums变了
```

##### <a name="arry-stack-queue" id="arry-stack-queue">7.8.4 Stacks and Queues with `push()`, `pop()`, `shift()`, and `unshift()`</a>

`push`, `pop`, `shift`, `unshift` are all <span class="orange">in-place</span> methods. 并且他们的returned都不是本身的arry, 要么是新的length, 要么是removed element.

- `push()`

	```javascript
	let newLength = arry.push(element0); 
	console.log(arry); // arry changed
	
	newLength = arry.push(element0, element1, ... , elementN)
	```
	<span class="orange">Return value</span>: the new length of arry.
	
	```javascript
	const stack = [];
	stack.push(1, 2); // 返回的是2. stack = [1, 2]
	stack.push([3, 4]); // 返回3. stack = [1, 2, [3, 4]] 注意[3, 4]是以一个整体push进去的
	```
	
	<u>Merging two arrays</u>: use <b>spread</b> to push all elements from a second array into the first one.
	
	```javascript
	const moreNums = [5, 6, [7]];
	stack.push(...moreNums); 
	// 注意不是console.log(stack.push(...))!! push返回的是长度
	console.log(stack); // [1,2,[3,4],5,6,[7]];
	```
- `pop()`
	
	```javascript
	const popedElem = arry.pop(); 
	console.log(arry); // arry changed
	```
	<span class="orange">Return value</span>: The removed element from arry; `undefined` if arry is empty.
	
- `shift()`
	
	```javascript
	const firstElem = arry.shift();
	console.log(arry); // arry changed
	```
	<span class="orange">Return value</span>: The removed element from arry (first element); `undefined` if arry is empty.

- `unshift()`
	
	```javascript
	let newLength = arry.unshift(element0);
	console.log(arry); // arry changed
	
	newLength = arry.unshift(element0, element1, ... , elementN);
	```
	<span class="orange">Return value</span>: The new length of the arry.
	
	但是要注意一点, if multiple elements are passed as parameters, they're inserted in chunk at the beginning of the object, in the <u>exact same order</u> they were passed as parameters. <u>区别于一次一次unshift</u>.
	
	```javascript
	let arry = [1, 2, 3];
	console.log(arry.unshift(4, 5)); // 5. 注意这里返回的不是arry!! 是新的length
	console.log(arry); // [4, 5, 1, 2, 3]. (4,5)整体在前面
	
	// 区别于
	arry = [1, 2, 3];
	arry.unshift(4);
	arry.unshift(5);
	console.log(arry); // [5, 4, 1, 2, 3]. 5被插到了4的前面
	```
	
##### <a name="arry-subarry" id="arry-subarry">7.8.5 Subarrays with `slice()`, `splice()`, `fill()`, and `copyWithin()`</a>

##### <span class="white-on-black">slice</span>

```javascript
let slicedArry = arry.slice();
arry.slice(start);
arry.slice(start, end); // slice [start, end), 注意end is not included
```

<span class="orange">Return value</span>: A <b>shallow</b> copy of sliced elements from the original array.

<span class="orange">Not In-Place</span>. <u>Original arry stays the same.</u>

- Ex1.

	```javascript
	let arry = ["a", { b: 1 }, "c", "d", "e"];
	console.log(arry.slice()); // 一个shallow copy of arry
	
	let sliced = arry.slice(1, 3);
	console.log(arry); // arry没变
	console.log(JSON.stringify(sliced)); // [{"b":1},"c"], 注意不包括arry[3]
	    
	arry[1].b = 2;
	console.log(JSON.stringify(sliced)); // [{"b":2},"c"], 注意是shallow copy
	```
	- `arry.slice(start, end)`, end是不包括的
	- `arry.slice`是shallow copy, sliced中b的value变了

- Ex2. 用于Array-like objects变成arry

	```javascript
	const argsArry = Array.prototype.slice.call(arguments);
	```
	
##### <span class="white-on-black">splice</span>

```javascript
let deletedArry = arry.splice(start); // 类似arry.slice(start), 但是本身arry被改了
deletedArry = arry.splice(start, deleteCount, item1, item2, itemN);
arry.splice(start, deleteCount);
arry.splice(start, deleteCount, item1);
```

<span class="orange">Return value</span>: An array containing the deleted elements. If no elements are removed, an empty array is returned.

<span class="orange">In-Place</span>. <u>Original arry will be changed.</u>

```javascript
let arry = ["a", "b", "c", "d", "e"];
let deleted = arry.splice(2);
console.log(deleted); // ["c", "d", "e"], 等同于arry.slice(2), 除了arry本身被改了
console.log(arry); // ["a", "b"]

arry = ["a", "b", "c", "d", "e"];
console.log(arry.splice(2,0,"test1","test2")); // [], 注意return的是空arry, 因为没有delete
console.log(arry); // ["a", "b", "test1", "test2", "c", "d", "e"], 注意test1, test2是插在c的前面, 即从start开始插入

console.log(arry.splice(2, 2, ["test3","test4"], "test5")); // ["test1", "test2"]
console.log(JSON.stringify(arry)); // ["a","b",["test3","test4"],"test5","c","d","e"]
```

##### <a name="arry-sort" id="arry-sort">7.8.6 Array Sorting Methods (`sort`, `reverse`)</a>

##### <span class="white-on-black">sort</span>

```javascript
arry.sort(); // returns sorted arry, in-place
arry.sort((firstEl, secondEl) => { ... compareFn... } )
arry.sort(compareFn)
```

<span class="orange">Return value</span>: The sorted array.

<span class="orange">In-Place</span>. <u>Original arry will be changed.</u>

If `compareFn` is not supplied, all `non-undefined` array elements are sorted in <u>alphabetical</u>, <u>case-sensitive</u>, <u>ascending</u> order</u>, by <u>converting them to strings</u> and comparing strings in UTF-16 code units order. All `undefined` elements are sorted to the end of the array.

- If `compareFn` returns some value > 0, order will be "b, a".
- If `compareFn` returns some value < 0, order will be "a, b".
- If `compareFn` returns 0, a and b are considered equal.

Ex1.

```javascript
let a = [33, 4, 1111, 222]; // alphabetical string ascending
console.log(a.sort()); // [1111, 222, 33, 4];

a = [33, 4, 1111, 222];
a.sort((a, b) => a - b); // increaseing num
console.log(a); // [4, 33, 222, 1111]

a = [33, 4, 1111, 222]; // decreasing num
console.log(a.sort((a, b) => b-a)); // [1111, 222, 33, 4]
```

Ex2. 

```javascript
let b = ["ant", "Bug", "cat", "Dog", "Cat"];
console.log(b.sort()); // ["Bug","Cat","Dog","ant","cat"]; case sensitive

/** 
 * 不能用return e1<e2;
 * 1. false是0, 不是-1!!!
 * 2. return e1 < e2;返回的是true/false. true>0 is true, but false>0 is false
*/
b.sort((elem1, elem2) => {
    const e1 = elem1.toLowerCase(), e2 = elem2.toLowerCase();
    if(e1 === e2) return 0;
    if(e1 < e2) return -1;
    else return 1;
});
console.log(b); // ["ant", "Bug", "Cat", "cat", "Dog"]; case insensitive
```
- 注意Ex2中不能用`return e1<e2`:
	- `compareFn`expect的是returned value和0的关系.
	- <span class="orange">`false`是0</span>, 不是-1!!!
	- `return e1 < e2`返回的是true/false. <span class="orange">true>0 is true</span>, but <span class="orange">false>0或者false<0都是false</span>.

##### <span class="white-on-black">reverse</span>

```javascript
arry.reverse(); // returns reversed arry, in-place
```

<span class="orange">Return value</span>: The reversed array.

<span class="orange">In-Place</span>. <u>Original arry will be changed.</u>

##### <a name="arry-to-string" id="arry-to-string">7.8.7 Array to String Conversions (`JSON.stringify`, `join`, `toString`)</a>
##### <span class="white-on-black">JSON.stringify</span>

如果想保持arry的样子(带bracket)以便今后再用, serialize the array with `JSON.stringify(arry)`. 这样以后可以用`JSON.parse(str)`把它变回array.

<span class="orange">Return value</span>: A JSON <b>string</b> representing the given value, or undefined.

Ex. 注意stringify出来的结果是string, 虽然带bracket:  <span class="orange bold">[</span>"a","b","c"<span class="orange bold">]</span>

```javascript
let arry = ["a", "b", "c"];
console.log(JSON.stringify(arry)); // ["a","b","c"]; 带bracket的string
console.log(JSON.parse(JSON.stringify(arry))); // array: ["a", "b", "c"]
```

##### <span class="white-on-black">join</span>

```javascript
let str = arry.join(); // default separator is comma (","), no space inbt
str = arry.join(separator);
```

<span class="orange">Return value</span>: A string with all array elements joined by separator. If an element is `undefined`, `null` or empty arry [], it is converted to an <u>empty string</u>.

<span class="orange">Not In-Place</span>. <u>Original arry stays the same.</u>

Ex1. 

```javascript
let a = ["Wind", "Water", "Fire"];
a.join(); // "Wind,Water,Fire"; no space bt, 和a.toString()一样
a.join(""); // "WindWaterFire"
```

Ex2. 注意`undefined` join后变成了empty str, 不是空格

```javascript
console.log(["a",undefined,"c"].join()); // "a,,c"; 注意中间的empty str
```

Ex3. 注意b.join后是4个相连的hyphen, 虽然本身arry是5个empty slots.

```javascript
let b = new Array(5); // An array of length 5 with no elements
b.join("-") // => "----": a string of 4 hyphens
```

区别于`JSON.stringify()` return的是arry样子的string, <span class="orange">有bracket</span>. `arry.join()`返回的结果和`arry.toString()`一样, <span class="orange">都没有bracket</span>. 

```javascript
let arry = ["a", "b", "c"];
console.log(JSON.stringify(arry)); // ["a","b","c"], 有bracket, 但是是string

console.log(arry.join()); // a,b,c; 注意没有bracket
console.log(arry.join("")); // abc

console.log(arry.toString()); // a,b,c; 注意没有bracket
```

##### <span class="white-on-black">toString</span>

```javascript
["a", "b", "c"].toString(); // a,b,c; 注意没有bracket
[1, [2,"c"]].toString(); // 1,2,c; 注意里面的bracket也拆了
```

#### <a name="arrylike-obj)" id="arrylike-obj)">7.9 Array-Like Objects</a>

An <b>array-like object</b> is an <u>object</u> that has <u>indexed properties</u> and <u>a non-negative length property</u>.

Some common examples of Array-Like Objects are <b>string</b>, <b>arguments</b> object in functions, <b>HTMLCollection</b> or <b>NodeList</b> objects returned from methods like `document.getElementsByClassName("test")` (HTMLCollection), `document.getElementsByTagName("p")` (HTMLCollection), or `document.querySelectorAll("div.test")` (NodeList).

Ex1. 

```javascript
let arry_like_obj = {
    4: "i",
    1: "am",
    2: "arry-like-obj",
    length: 2 // 虽然有3个elem
};
console.log(arry_like_obj[4]); // i
console.log(arry_like_obj.length); // 2

/**
 * 1. 因为arry_like_obj的key没有0, 所以生成的arry[0]是undefined
 * 2. 因为length=2, 所以只取了arry[0]和arry[1]
 */
console.log(Array.from(arry_like_obj)); // [undefined, "am"];
```

- arry-like obj不需要顺序的index, 也不要求length一定是elem的数量. 只要有indexed property和length就够了
- <span class="orange">注意random index和length对最后转成arry的影响</span>
- `arry_like_obj.4`是syntax error, 不能这样access

Ex2.

```javascript
const arr = [];
arr[0] = "a"; // adds item to the array
console.log(arr.length); // 1

arr.two = "b"; // adds an item to the underlying object that array is built on top of.
console.log(arr.length); // 1, 注意此时依然是1!!

// 但是key可以loop到arry的index和附加的key
for(let i in arr){
    // this will hit both "0" and "two"
    console.log(i);
}
```

- `arry.two`并不影响length, 只有numbered index才会算到length里
- arry本质还是object, 用for/in可以loop所有的key, 无论numbered还是non-numbered

Ex3. both <u>array</u> and <u>arry-like</u> are object (<span class="orange">instanceof</span>)

```javascript
console.log(Array.isArray(arry_like_obj)); // false

// both array and arry-like are object
console.log(arry_like_obj instanceof Object); // true
console.log([] instanceof Object); // true
console.log([] instanceof Array); // true

// arry is always an instanceof Object
let a = new Array();
console.log(a instanceof Array); // true
console.log(a instanceof Object); // true
```

<u>arry is always an instanceof Object</u>, no matter how created (new Array() or arry literal).

<b>Array-Like Object to Array</b>

- `Array.prototype.slice.call(arry_like_obj)`
- `Array.from(arry_like_obj)`
	
	Ex1. 
	
	```javascript
	let arry_like_obj = {
		4: "i",
		1: "am",
		2: "arry-like-obj",
		length: 2 // 虽然有2个elem
	};
	console.log(Array.from(arry_like_obj)); // [undefined, "am"]
	console.log(Array.prototype.slice.call(arry_like_obj)); // [, "am"]
	```
	
	Ex2.
	
	```javascript
	let a = {"0": "a", "1": "b", "2": "c", length: 3};
	console.log(Array.from(a)); // ["a", "b", "c"]
	console.log(Array.prototype.slice.call(a)); // ["a", "b", "c"]
	```
	
	注意Ex1和Ex2的区别, 注意random index和length对生成的arry的影响

<div class = "border">
	<ul>
		<li>
			<b>Set</b>和<b>Map</b>都是iterable object.
			<ul>
				<li>都可以用<b>`[...]`</b>或者<b>`Array.from()`</b>变成array</li>
				<li>都可以用<b>for/of</b>循环</li>
			</ul>
		</li>
		<li>
			<b>Set</b>和<b>Map</b>都有has(), delete(), clear().
			<ul>
				<li>Set用`set.add(val)`加入新的elem</li>
				<li>Map用`map.set(key, val)`加入新的elem, 除此之外, Map还有`map.get(key)`</li>
			</ul>
		</li>
		<li><b>Set</b> is <b>faster</b> in lookup (`set.has(val)`), comparing to `arry.includes(val)`. <b>Map</b> is <b>faster</b> in lookup, and frequent insertion/deletion  (`map.has(key)`, `map.set(key, val)`, `map.delete(key)`)</li>
	</ul>
</div>

#### <a name="set" id="set">11.1.1 The Set Class</a>

<b>Set</b> is a collection of <b>unique</b> values, like an array is, but it's not ordered or indexed, you <u>CANNOT</u> visit a set like an array does `arry[1]`. However, <b>set</b> can be iterated in insertion order.

#####<u>Value Equality in Set</u>
Set用类似于<b>`===`</b>判断是否unique

- 1, "1"和true是不一样的
- `document.body`和`document.querySelector("body")`是一样的

	```javascript
	let s = new Set();
	s.add(document.body);
	s.has(document.querySelector("body")); // true
	``` 
- 对于reference values (array, object, functions), 永远不相等, 只能用地址比较

Ex1. 

```javascript
let s = new Set();
s.add([1]);
s.add([1]);
console.log(s.has([1])); // false, 区别于后面s.has(arry)是true
console.log(s); // Set {[1], [1]}, [1]永远不等于[1]
console.log(s.delete([1])); // false, 只能用地址delete
	
let arry=[1];
s.add(arry);
console.log(s); // Set {[1], [1], arry}
console.log(s.has(arry)); // true
s.add(arry);
console.log(s); // 还是Set {[1], [1], arry}. 区别于上面, 这里arry只加了一次, 对于reference val, 只能用地址
console.log(s.delete(arry)); // true, s是Set {[1], [1]}, arry被delete了
```
- `undefined`和`null`都可以加入Set. <u>`NaN`是个特例,</u> 虽然`NaN !== NaN`, 但是Set里可以只被加入一次

```javascript
// undefined和null都是primitive, 可以比较
undefined === undefined; // true
null === null; // true

undefined == null; // true

NaN === NaN; // false
[1] === [1]; // false
```

#####<u>Constructor</u>

```javascript
new Set(); // empty set
new Set(iterable);
```

- If an <u>iterable object</u> is passed, all of its elements will be added to the new Set, <span class="bold underline">one by one</span>, not as a whole.
- <span class="bold underline">Iterable object</span>包括array, string, set, map, etc

Ex2.1

```javascript
// iterable eg: array
let s = new Set(["a", "b", "a"]);
console.log(s); // Set {"a", "b"}
s = new Set([..."aba"]); // ["a", "b", "a"]等同于[..."aba"] 和上面完全一样
console.log(s); // Set {"a", "b"}

console.log(typeof s); //object
console.log(s instanceof Set); // true
    
/**
 * iterable object变array的两种方法 eg: set, map
 * 1. Array.from(an iterable or array-like object), arryLike: arguments
 * 2. Spread operator [...iterable]
 */
console.log(Array.from(s)); //  ["a", "b"]

// Remove duplicates in array
let rmDup = [...new Set(["a", "b", "a"])];
console.log(rmDup); // ["a", "b"]

// iterable eg: string
s = new Set("aab");
console.log(s); // Set {"a", "b"}, "aab" is added in Set OneByOne

// iterable eg: set
let t = new Set(s);
console.log(t); // Set {"a", "b"}, Set s被拆开一一加入t
t = new Set([1, s]);
console.log(t); // Set {1, s}. 区别于上面s里的elem被一个个加入Set, 这里[1,s]已经是iterable了, 只会拆一层, 不会继续拆s了, s以一个整体加入t
```

- Set constructor可以pass进的iterable包括<u>array, string, set</u>, etc.
- Set常用来作为<u>remove dups</u>. 注意`Array.from(set)`和`[...set]`的应用
	- 注意set和array的关系
	
	Ex2.2 
	
	```javascript
	let s = new Set([1,4,2]);
	console.log([...s]); // [1,4,2], set变array
	console.log(Math.max(...s)); // 4, set通过...变成单个的.这里不是array, 是Math.max(1,4,2)  
	```
	
- 区别于<u>`set.add([1,2])`</u>是把[1,2]以一个整体加入set, <u>`new Set([1,2])`</u>是把[1,2]拆开一一加入set.

##### Instance Properties
`Set.prototype.size`

##### Instance Methods
- `Set.prototype.add(value)`: <u>returns the `Set` object</u> with added value, 所以<b>可以chain</b>.
- `Set.prototype.has(value)`: returns `true/false`
	- `has()` is musch faster than `Array.prototype.includes()` when they have the same length/size.
- `Set.prototype.delete(value)`: returns `true` if `value` was already in `Set`, otherwise `false`
- `Set.prototype.clear()`: returns `undefined`

Ex3. 

```javascript
let s = new Set();
console.log(s.size); // 0

s.add(1).add(1).add(true); // add可以chain
console.log(s); // Set {1, true}. 1和true是不一样的

console.log(s.has("1")); // false, check ===
console.log(s.has(true)); // true

s.add([1,2]);
console.log(s.size); // 3, [1,2]是以一个整体加进去的, Set {1,true,[1,2]}. 区别于new Set([1,2]), [1,2]会被拆开
console.log(s.delete([1,2])); // false, reference obj永远不等
console.log(s.size); // 还是3

console.log(s.delete("1")); // false, 1和"1", true不一样
console.log(s.delete(1)); // true, Set{true, [1,2]}
s.clear();
console.log(s.size); // 0
```

##### Iteration Methods
- for/of
- <b>Set.prototype.forEach()</b>
	
	```javascript
	set.forEach((elem) => { ... });
	set.forEach(callbackFn)
	```
	- 区别于<b>`arry.forEach((elem, index) => { ... })`</b>, 因为Set doesn’t have indexes.
	- 和`arry.forEach()`一样, 都没有return, 都不改变当前arry, 等同于for loop.
	- 和`arry.forEach()`一样, 都<u>无法跳出循环. 区别于for loop</u>.
	- Iterated in the order of insertion order

	Ex4.1
	
	```javascript
	let s = new Set([1,4,2]);
	s.add(5);
	let sum = 0;
	// 1, 4, 2, 5. in insertion order
	for(let num of s) { // 等同于 s.forEach((num) => { sum += num })
	    console.log(num);
	    sum += num;
	}
	console.log(sum); // 12
	
	let product = 1;
	s.forEach(num => {
	    product *= num;
	});
	console.log(product); // 40
	```
	
	Ex4.2 `set.forEach(callbackFn)`
	
	```javascript
	function logElem(elem) {
	    console.log(elem);
	}
	new Set(["foo", "bar", undefined]).forEach(logElem);
	// foo
	// bar
	// undefined
	```
	
	- 注意每个elem对应一行log, 不是log在一行里
	
	Ex4.3 delete obj from set
	
	```javascript
	let s = new Set();
	s.add({ x: 1, y: 2}).add({ x: 10, y: 4});
	s.forEach((point) => {
	    if (point.x > 5) {
	        s.delete(point);
	    }
	});
	console.log(s); // Set { { x: 1, y: 2} }, 第二个point被delete了
	```
	
	Ex4.4.1 set.isSubset(superset) 
	
	<span class="red">ERROR</span>: 注意forEach和for的区别
	
	- 如果循环是一旦遇到某种情况就可以跳出结束的要用for
	- 如果是无论如何都要一个一个循环的可以用forEach
	
	```javascript
	Set.prototype.isSubset = (superset) => {
	    if(this.size > superset.size) return false;
	
	    /**
	     * 1. forEach无法中断for loop 
	     * 2. forEach没有return
	     * 3. 如果用forEach, 得在forEach外有一个let val=true, 然后如果不has就val=false, 最后return val
	     */
	    this.forEach((elem) => {
	        if(!superset.has(elem)) {
	            return false; // forEach没有return, 不会因为return就跳出循环
	        }
	    });
	    return true;
	}
	let s1 = new Set([1,2,3]);
	let s2 = new Set([5,1,6,2,3]);
	let s3 = new Set([1,3,5]);
	console.log(s1.isSubset(s2)); // true
	console.log(s1.isSubset(s3)); // true. 因为forEach不会因为return就stop, 永远返回的都是最后的true
	console.log(s2.isSubset(s3)); // false. fail在s2.length > s3.length
	```
	
	- 区别于for loop可以随时跳出for循环, <span class="underline-orange">forEach无法中断for loop</span>, 不会因为return false就跳出, 会一直走到最后return true
	- <span class="underline-orange">forEach没有return</span>

	应该用for loop
	
	```javascript
	Set.prototype.isSubset = (superset) => {
	    if (this.size > superset.size) return false;
	    for(let elem of this) {
	        if(!superset.has(elem)) return false; // 区别于forEach, 这里for loop可以因为return就结束了
	    }
	    return true;
	}
	let s1 = new Set([1,2,3]);
	let s2 = new Set([5,1,6,2,3]);
	let s3 = new Set([1,3,5]);
	console.log(s1.isSubset(s2)); // true
	console.log(s1.isSubset(s3)); // false
	console.log(s2.isSubset(s3)); // false. fail在s2.length > s3.length
	```
	
	Ex4.4.2 set1.union(set2), 不能改变原有set1
	
	```javascript
	Set.prototype.union = function(otherSet) {
	    const _union = new Set(this); // 注意Set可以直接用set init
	    otherSet.forEach((elem) => {
	        // if(!_union.has(elem)) { // 不需要check, 应该直接add, Set本身会保证unique
	            _union.add(elem);
	        // }
	    });
	    return _union;
	};
	let s1 = new Set([1,2,3]);
	let s3 = new Set([1,3,5]);
	console.log(s1.union(s3)); // Set {1,2,3,5}
	```
	- 可以直接`_union = new Set(this)`, 不用init一个空set再一个一个加
	- 注意上面不用check _union是否has新的elem, <u>应该直接add, Set本身会保证unique</u>

	Ex4.4.3 set1.intersect(s3)
	
	这个思路是错的: new set(this); 然后loop thru otherSet,如果newSet没有otherSet的elem,就删掉. 
	<span class="red">ERROR</span>的点在: newSet(this)里的elem如果有不属于otherSet也应该删掉, 思考s1.intersect(s3)
	
	```javascript
	Set.prototype.intersect = function(otherSet) {
	    const _intersect = new Set(this); // ERROR
	    otherSet.forEach((elem) => {
	        if(! _intersect.has(elem)) {
	            _intersect.delete(elem);
	        }
	    });
	    return _intersect;
	};
	let s1 = new Set([1,2,3]);
	let s2 = new Set([5,1,6,2,3]);
	let s3 = new Set([1,3,5]);
	console.log(s1.intersect(s2)); // Set {1,2,3}
	console.log(s1.intersect(s3)); // Set {1,2,3}. ERROR: s1里s3没有的要删掉, 应该是{1,3}
	```
	
	这么做是对的, 但是loop了两遍
	
	```javascript
	Set.prototype.intersect = (other) => {
	    const _intersect = new Set(this); // loop第一遍
	    _intersect.forEach(elem => { // loop第二遍
	        if (!other.has(elem)) {
	            _intersect.delete(elem);
	        }
	    });
	    return _intersect;
	}
	```
	
	应该这样
	
	```javascript
	Set.prototype.intersect = function(otherSet) {
	    const _intersect = new Set(); // 要用空set
	    this.forEach((elem) => {
	        if(otherSet.has(elem)) {
	            _intersect.add(elem);
	        }
	    });
	    return _intersect;
	};
	let s1 = new Set([1,2,3]);
	let s2 = new Set([5,1,6,2,3]);
	let s3 = new Set([1,3,5]);
	console.log(s1.intersect(s2)); // Set {1,2,3}
	console.log(s1.intersect(s3)); // Set {1,3}, s1里的2不在intersect中
	```
	
	
	
	Ex4.4.4 s1.difference(s2)
	
	注意difference的意思不是返回(s1并s2)-(s1交s2), 而是s1.difference(s2)是取(s1-s2)
	
	```javascript
	Set.prototype.difference = function(otherSet) {
	    const _difference = new Set(this);
	    // _difference.forEach((elem) => {
	    //     if(otherSet.has(elem)) {
	    //         _difference.delete(elem); // 如果用这个方法, 必须查has
	    //     }
	    // });
	    otherSet.forEach((elem) => {
	        _difference.delete(elem); // 不需要查has, 和union类似, 可以直接delete, 只是返回true/false而已
	    })
	    return _difference;
	};
	let s1 = new Set([1,2,3]);
	let s2 = new Set([5,1,6,2,3]);
	let s3 = new Set([1,3,5]);
	console.log(s1.difference(s2)); // empty set
	console.log(s2.difference(s3)); // Set {6,2}
	```
	
	-  注意delete不需要对_difference循环然后看otherSet是否有这个elem. 可以直接用otherSet循环, 并且直接delete otherSet里的每一个elem, 不需要考虑_difference里是否有otherSet的elem, 即使没有就是return false而已

#### <a name="map" id="map">11.1.2 The Map Class</a>

<b>Map</b> is a collection of `[key, value]` pairs, where <u>`key` is unique</u>. <b>Map</b> can be iterated in insertion order (后来的update不会改变loop的顺序, 永远根据的是初始insert的顺序)

#####<u>Value Equality in Map</u>

Map用类似<b>`===`</b>判断key是否一样, 和Set一样. 

- Any Javascript value can be used as a `key` or a `value` in a Map.
- `undefined`, `null`, `NaN`都可以用作key, 虽然`NaN !== NaN`.
- Reference value (objects, arrays, functions)也可以做key, 但是永远不相等, 只能用地址比较

Ex1.1

```javascript
let m = new Map();
m.set({}, 1);
m.set({}, 2);
console.log(m.size); // 2, {} !== {}
console.log(m); // Map {{}=>1, {}=>2}
console.log(m.get({})); // undefined

m.set(m, 3);
console.log(m.has(m)); // true, 只能用地址
console.log(m.get(m)); // 3
```

Ex1.2 注意ref和primitive做key区别

```javascript
let m = new Map();
let str = "a string";
m.set(str, "val associate with \"a string\"");
let obj = {};
m.set(obj, "val associate with {}");
    
console.log(m.get(str)); // val associate with "a string"
console.log(m.get(obj)); // val associate with {}

console.log(m.get("a string")); // val associate with "a string". 和m.get(str)一样
console.log(m.get({})); // undefined, 因为obj!=={}

console.log(obj === {}); // false
```

- 对于<b>primitive value</b>做key, eg: string, `str === "a string"`. <span class="underline-orange">`m.get("a string")`等同于`m.get(str)`</span>
- 但是<b>reference value</b>做key, eg: object, array, function, `obj !== {}`, 即使他们key/val一样. <span class="underline-orange">`m.get({})`和`m.get(obj)`不一样</span>

Ex1.3 `NaN`做key

```javascript
let m = new Map();
m.set(NaN, "not a number");
console.log(m.get(NaN)); // not a number

console.log(m.get(Number("foo"))); // not a number
```

- `NaN`可以做key, 虽然<b>`NaN !== NaN`</b>
- 注意`Number("foo")`返回的是`NaN`, <span class="underline-orange">`m.get(Number("foo"))`和`m.get(NaN)`完全一样</span>

##### <u>Constructor</u>

```javascript
new Map(); // empty map
new Map(iterable);
```

- <b>iterable包括</b>
	- array of [key, val]. ex: [["a", 1], ["b", 2]]
	- object -> array of [key, val]: `Object.entries(obj)`
	- map

Ex2.1

```javascript
// iterable: array
let m = new Map([["one", 1], ["two", 2]]);

// iterable: Object.entries(obj)
let o = { x: 1, y: 2};
let p = new Map(Object.entries(o)); // 等同于new Map([["x", 1], ["y", 2]])
console.log(p); // Map {"x"=>1, "y"=>2}

// iterable: map
let copy = new Map(m);
console.log(copy); // Map {"one"=>1, "two"=>2}, 和m完全一样

console.log(copy === m); // false. 注意copy并不等于原始的m
```

Ex2.2 Maps can be merged, maintaining key uniqueness

```javascript
let arry1 = [[1, "one"], [2, "two"]];
let arry2 = [[1, "oneone"]];
m = new Map([...arry1, ...arry2, [1, "oneoneone"]]);
console.log(m); // Map {1 => "oneoneone", 2 => "two"}. 注意对于相同的key, val取最后一个
```

- 注意对于相同的key, val取最后一个

##### <u>Map和array的关系</u>

Ex3.

```javascript
let m = new Map([["one", 1], ["two", 2]]);

// 一下两种变array的结果都一样, 等同于[...m.entries()]
console.log([...m]); // [["one", 1], ["two", 2]], 和init m的array of array完全一样
console.log(Array.from(m)); //  [["one", 1], ["two", 2]]

console.log(m.entries()); // [["one", 1], ["two", 2]], 和变arry类似,但不是arry,[...m.entries()]
```

##### <u>Map和Object的关系</u>

|      	    		| Map      	    | Object 		|
| ----------- | ----------- | ----------- |
| <b>Keys</b>      | A Map does not contain any keys by default.  | An Object has a `prototype`, so it contains default keys.     |
| <b>Key Types</b>      | A Map's keys can be any value, including functions, objects, or any primitive. | The keys of an Object must be either a `String` or a `Symbol`.    |
| <b>Size</b>      | `map.size`  | The number of items in an Object must be determined manually.    |
| <b>Iteration</b>      | A Map is iterable (`for/of`, `forEach((val, key)=>{...})`), by its first insertion order. 可以用在`for(let [key,val] of map)`, 也可以用在`m.entries()`, `m.keys()`, `m.values()`. <span class="underline-orange">区别于Object的三个对应function, map的这三个返回的都不是arry, 是iterable object</span>.	| Object has to use `for/of` on `Object.keys()`, `Object.values()`, `Object.entries()`, no order guranteed.   |
| <b>Performance</b>      | Map performs better in scenarios involving <span class="underline-orange">frequent additions and removals (set/get/delete)</span> of key-value pairs.  | Object is NOT optimized for frequent additions and removals of key-value pairs.    |

Map和Object都有key,但是如果用`obj[key]=val`的方式set Map, will cause confusion.

```javascript
// The following way of setting a property does not interact with the Map data structure. 
// It uses the feature of the generic object.
let wrongMap = new Map();
wrongMap["a"] = 1;
wrongMap["b"] = 2;
console.log(wrongMap); // Map {a: 1, b: 2, size: 0}

console.log(wrongMap.size); // 0
console.log(wrongMap.has("a")); // false
console.log(wrongMap.delete("a")); // false
```

- 注意上面用`obj[key]=val`的方式set Map的方法并<u>没有interact with the Map data structure, still uses the feature of the generic object</u>: size, has(), delete()都不work
- Map要用`map.set(key, val)` set key/val

##### Instance Properties

```javascript
Map.prototype.size
```

##### Instance Methods

- `Map.prototype.get(key)`: return `undefined` if not found. set里没有类似的.
- `Map.prototype.set(key, val)`: <u>returns new Map</u>, <b>可以chain</b>. 和set.add()一样.

- `Map.prototype.has(key)`: return `true/false`
	- map.has()很快, though not as fast as indexing an array, no matter how large the map is
	- Map could be represented internally as a <span class="underline-orange">hash table (with O(1) lookup)</span>, a <span class="underline-orange">search tree (with O(log(N)) lookup)</span>, or any other data structure, as long as the complexity is <b>better than O(N), linear</b>, like <u>array.includes() is O(N)</u>.
- `Map.prototype.delete(key)`: returns `true` if key was already in Map, otherwise `false`
- `Map.prototype.clear()`: returns `undefined`

Ex4.1

```javascript
let m = new Map();
m.set("1", 1).set(1, 2).set(true, 3); // key查的是===
console.log(m); // Map {"1"=>1, 1=>2, true=>3}
console.log(m.get("1")); // 1
console.log(m.get("one")); // undefined

m.set(1, 11); // update val
console.log(m); // Map {"1"=>1, 1=>11, true=>3}

for(let [key, val] of m) {
    console.log(`[${key}, ${val}]`);
}
// ["1",1]
// [1, 11], 注意iterate是根据insertion order, 后来update并不会改变顺序
// [true, 3]

console.log(m.delete("one")); // false
console.log(m.delete(1)); // true
console.log(m); // Map {"1"=>1, true=>3}

m.set(1, "hello");
for(let [key, val] of m) {
    console.log(`[${key}, ${val}]`);
}
// ["1", 1]
// [true, 3]
// [1, hello], 之前被删掉又加回来的1, loop时在末尾
```

- 注意iteration的顺序, 和后来的update无关. 如果delete后又加回来, 加回来的elem按新elem处理, loop时在最后

Ex4.2 注意下面arry和map中的arry的关系

```javascript
let arry = [];
let m = new Map();
m.set("ref", arry);

arry.push("a");
console.log(m); // Map {"ref" => ["a"]}, 注意map里的arry的val也变了

m.get("ref").push("b");
console.log(arry); // ["a", "b"], 注意本身arry的val变了
console.log(m); // Map {"ref" => ["a", "b"]}
```

##### Iteration Methods

- 以下三个返回的都<b>不是array</b>, 得用<b>`[...m.keys()]`</b>或者<b>`Array.from(m.keys())`</b	>变成array. 区别于<u>obj.keys(), obj.values(), obj.entries()</u>返回的都是array
- 以下三个<b>都可以用for/of循环</b>, 因为返回的都是iterable obj
	- `Map.prototype.keys()`: returns <u>iterable objects</u> that iterate keys
	- `Map.prototype.values()`: returns <u>iterable objects</u> that iterate values
	- `Map.prototype.entries()`: returns <u>iterable objects</u> that iterate [key,value] pairs
		- `[...m.entries()]`等同于`[...m]`
		- 虽然m.entries()不是array, 但是for(let entry of m.entries())的entry是array
		
	Ex5.1
	
	```javascript
	let m = new Map();
	m.set("0", "foo").set(1, "bar").set({}, "baz");
	console.log([...m.keys()]); // ["0", 1, {}]. 注意本身m.keys()不是返回array, 要用[...]变成array. 也可以用Array.from(m.keys())
	console.log(Array.from(m.values())); // ["foo", "bar", "baz"]
	
	console.log([...m.entries()]); // [["0", "foo"], [1, "bar"], [{}, "baz"]], 等同于[...m]
	for(let [key, val] of m.entries()) {
		console.log(key, val);
	}
	// "0" "foo"
	// 1 "bar"
	// {} "baz"
	
	for(let [key, val] of m) {
		console.log(key, val); // 和for/of m.entries()完全一样
	}
	
	for(let entry of m.entries()) {
	    console.log(entry); // 注意虽然m.entries()不是array, 但是entry是
	}
	// ["0", "foo"]
	// [1, "bar"]
	// [{}, "baz"]
	
	for(let entry of m) {
	    console.log(typeof entry); // object. array is object. typeof有undefined, number, string, boolean, object, function
	    console.log(Array.isArray(entry)); // true
	    console.log(entry);
	}
	```
	
	- 注意`m.keys()`, `m,values()`, `m.entries()`返回的都<b>不是array</b>, 要用<b>`[...iterable]`</b>或者<b>`Array.from(iterable)`</b>变成array
	- 注意`[...m.entries()]`等同于`[...m]`
	- <span class="underline-orange">`for(let [key, val] of m)`和`for(let [key, val] of m.entries())`完全一样</span>
	- for/of
		- 注意`for(let entry of m.entries())`, 虽然<u>m.entries()不是array, 但是entry是array</u>
		- 类似的, <u>`for(let entry of m)`的entry也是array</u>
			- 注意查是不是array的方法不是`typeof` (<u>`typeof []` 是object</u>). 要用<span class="underline-orange">`Array.isArray(arry)`</span>

- for/of: `for(let [key, val] of m)`
- `Map.prototype.forEach()`

	```javascript
	map.forEach((value, key) => {...});
	map.forEach(callbackFn)
	```
	- 注意是<b>`(value, key)`</b>不是`(key, value)`. 类似`arry.forEach((elem, index))`, index变成了key
	- 区别于<span class="underline-orange">`for(let [key, val] of m)`是先key后val, `m.forEach((val, key) => {...})`是先val后key</span>
	- `forEach`没有return, 也不能中途跳出循环
	
	Ex5.2
	
	```javascript
	function logValKey(val, key) {
	    console.log(val, key);
	}
	m = new Map([["a", 1], ["b", 2]]);
	m.forEach(logValKey);
	// 1 "a", val在前, key在后
	// 2 "b"
	
	[...m.entries()].forEach((entry) => { // m.entries()不是array, 要用arry.forEach()要先变成array
	    console.log(entry); // entry是array
	})
	// ["a", 1], key在前, val在后.区别于直接对m.forEach,这里的forEach是针对m.entries(),which返回的是[key, val]不是val/key
	// ["b", 2]
	
	// 或者写成
	[...m.entries()].forEach(([key, val]) => { // 要用()把[key, val]括起来
	    console.log(key, val);
	})
	```
	
	- 注意map.forEach是先val后key
	- m.entries()不是array, 要用arry.forEach()要先变成array
	- 区别于m.forEach是先val后key, m.entries()的forEach返回的是[key, val]不是val/key

#### <a name="func-def" id="func-def">8.1 Defining Functions</a>

四种方法define function: function declaration, function expression, arrow function, nested function.

- Function Declaration
	- `function sum(...args) { ... "this" is window obj ...}`
	-  will be hoisted to the top of block, before var hoisting. <b>Functions are first-class citizens</b>.
	-  <span class="yellowBG">function declaration里的`this`是global window</span>
- Function Expression
	- `const sum = function(...args) {}`
	- function expression can <span class="orange">include names, which can be used in recursive</span>. 注意下例中<span class="orange">factorial is only available within function f</span>.

	
		```javascript
		const f = function factorial(x) {
			if (x <= 1) return 1;
			return x * factorial(x-1);
		};
		```

	- Immediatly Invoking Function Expression (IIFE)

		```javascript
		const addCount = (function() {
			let count = 1; // count是private, 只有通过addCount()才能access
			return function() {
				return count + 1;
			}
	    })();
	    console.log(addCount()); // 2
	    console.log(addCount()); // 3	
	    ```
	    
- Arrow Function
	- arrow function实际上类似没有function keyword也没有function name的function expression
	- `const sum = (x, y) => x+y;`
	- arrow function<span class="orange">没有`arguments`</span>
	- <span class="yellowBG">Arrow Functions **do not have their own this**</span>, 所以无法用于obj.method (Ex1), 也无法通过apply/call/bind改变scope (Ex2).
		- <span class="yellowBG">Arrow functions establish/inherit "this" based on the scope where the arrow function is defined</span>: <span class="orange">进入arrow function之前, where "this" is bind to</span>.
			- 如果obj.method是arrow function, arrow function里的this继承的是和obj同scope的this, 通常是window (Ex1). 
			- 如果obj.method是普通function, 但是里面有setTimeout(() => {..this..})用了arrow function, 因为arrow function的this会inherit进入setTimout之前的this, 此时是obj (Ex3).
			
			Ex1. <i>注意下面calculator.add和calculator.minus, 无论是shorthand还是传统写法, `this`都是calculator</i>
			
			```javascript
			let calculator = { // An object literal 
				operand1: 1,
				operand2: 1,
				add() { // with method shorthand syntax
				    console.log(`calculator.add, this = ${this}`); // calculator itself
				    this.result = this.operand1 + this.operand2; 
				},
				minus: function() { // regular function
				    console.log(`calculator.minus, this = ${this}`); // calculator itself, not window obj!!!
				    this.result = this.operand1 - this.operand2;
				},
				arrowThis: () => { // arrow function "this" in obj.method
				    console.log(`calculator.arrowThis, this = ${this}`); // window object
				    console.log(this.operand1); // undefined
				}
			};
			calculator.add();
			console.log(calculator.result); // 2
			calculator.minus();
			console.log(calculator.result); // 0
			calculator.arrowThis();
			```
		- <span class="orange">Not suitable for `call`, `apply` and `bind` methods</span>, which generally rely on establishing a scope. **Arrow functions establish/inherit "this" based on the scope where the arrow function is defined**.
			
			Ex2. 
			
			```javascript
			let obj = { num: 10 };
			window.num = 100;
			const add = function(a, b) { 
			    console.log(`add.this = ${this}`);
			    return this.num+a+b; 
			};
 			// 如果直接call add, 此时add里log的this是window
    		add(1, 2); // 103
    		
			// With Arrow functions, addArrow function is essentially created on the window (global) scope, 
			// it will assume this is the window.
			const addArrow = (a, b) => {
			    console.log(`addArrow.this = ${this}`);
			    return this.num + a + b;
			}
			/**
			 * add.this = obj
			 * result = obj.num + 1 + 2 = 13
			 */
			console.log(add.call(obj, 1, 2)); // 13
			/**
			 * addArrow.this = window obj, call没有bind成功
			 * result = window.num + 1 + 2 = 103
			 */
			console.log(addArrow.call(obj, 1, 2)); // 103
			```
			
		-  the greatest benefit of using Arrow functions is with DOM-level methods (<span class="orange">setTimeout, setInterval, addEventListener</span>) that usually required some kind of closure, call, apply or bind to ensure the function executed in the proper scope.
			
			注意<span class="orange">`setTimeout(func, delay)`的func</span>, by default if there is no set on `this` in the call or with `bind`, <span class="orange">func是executes on the window scope, 即func的this是window obj</span>.
		
			Ex3. 
			
			```javascript
			let obj = {
				count: 10,
				doSomethingLater: function() {
				    // setTimeout(func, delay)的func是executes on the window scope
				    setTimeout(function() {
				        console.log(`setTimeout.this = ${this}`); // window obj
				        console.log(this.count); // undefined
				    }, 300)
				},
				doSomethingLaterArrow: function() {
				    // 进入setTimeout之前, "this" is bind to "obj"
				    setTimeout(() => {
				        /** 
				         * 区别于doSomthingLater.setTimeout的function会产生this的scope是window
				         * 这里因为arrow function本身没有this,
				         * doSomethingLaterArrow.setTimeout的arrow function的this会inherit进入setTimout之前的this, 即obj
				         */
				        console.log(`setTimeout.arrowThis = ${this}`); // obj itself
				        console.log(this.count); // 10
				    }, 300)
				}
			};
			obj.doSomethingLater();
			obj.doSomethingLaterArrow();  
			```
- Nested Functions: 可以function里套function declaration

	```javascript
	function squareAndSum(a, b) {
		function square(x) { return x*x; }
		return square(a) + square(b);
	}
	```

#### <a name="func-invoke" id="func-invoke">8.2 Invoking Functions</a>

Functions can be invoked in 5 ways: as function, as obj.method, as constructor, indireclty thru `apply`/`call`, implicit function invocation: `getter`/`setter`, `toString`, etc.

- Function Invocation: `func(...args)`
	- `func(...args)`
	- inside func(){...this...}, `this` is window obj (non-strict) or `undefined` (strict). <span class="orange">注意下面把this放到function里</span>
	
		```javascript
		"use strict"; // 勿忘双引号
		/**
		 * 如果是strict, this=undefined, isStrict = !undefined = true
		 * 如果不是strict, this=window obj, isStrict = ![window obj] = false
		 */
		// 按道理, function() {.. this...} 里的this是window
		// 不要写成 isStrict = !this. 要把this放到function里
		const isStrict = (function() { return !this; })(); // IIFE
		console.log(`is strict mode = ${isStrict}`);
		```
	- **Recursive** calls bahave like a <span class="orange">stack</span>, first in, last out. A calls B calls C: when C returns, it will back to B then A.
- Method Invocation
	- `obj.method(...args)`
	- inside obj.method(){...this...}, `this` is obj.
	
	<span class="orange">Ex</span>. `this` in obj.method and nested function

	```javascript
	let calculator = {
        operand1: 1,
        operand2: 2,
        add() {
            console.log(`calculator.add.this = ${this}`); // calculator
            this.result = this.operand1 + this.operand2;
        },
        scopeTest() {
            console.log(`calculator.scopeTest.this = ${this}`); // calculator
            console.log(this === calculator); // true
            const self = this;
            nestedFunc();

            function nestedFunc() {
                console.log(`calculator.scopeTest.nestedFunc.this = ${this}`); // window obj
                console.log(`calculator.scopeTest.nestedFunc, self = ${self}`); // calculator
                console.log(this === calculator); // false
            }

            const nestedFuncArrow = () => {
                console.log(`calculator.scopeTest.nestedFuncArrow.this = ${this}`); // calculator
            }
            nestedFuncArrow();

            nestedFunc.bind(this)(); // inside nestedFunc.this will be calculator
        }
    };
    calculator.add();
    console.log(calculator.result); // 3

    calculator.scopeTest();
	```
	- 注意区别两种nested function: <span class="orange">function declaration(nestedFunc)</span>和<span class="orange">arrow function(nestedFuncArrow)</span>
		- 如果nested function是declaration(calculator.scopeTest中的nestedFunc): `this`是window obj/undefined
		- 但是如果nested function是arrow function(nestedFuncArrow), `this`依然是calcultor, 因为arrow function的this取决于where it is defined
	- 解决nested function (declaration)的`this`的方法
		- 进入nested function之前`self = this;` 用`self`
		- 换成arrow function, 但是注意nestedFuncArrow要用在定义之后, 因为区别于nestedFunc是function declaration, `const nestedFuncArrow = ...`没有hoist
		- 用bind, 勿忘bind(this)<span class="red">()</span>, 多出来的()是执行
	- 注意上面对比`this === calculator`, `===`对比的是<span class="orange">location, 两个objs是永远不可能相等的</span>
- Constructor Invocation: `const obj = new Object();`
- Indireclty thru `call`/`apply`
- Implicit function invocation: <span class="orange">`getter`/`setter` (accessor properties)</span>, `toString()`, `valueOf()`, etc
	
	```javascript
	let p = {
        x: 2,
        y: 4,
        get result() { // result就是一个accessor prop, 可以通过p.result trigger getter
            return this.x + this.y;
        },
        set result(val) { // p.result = val will trigger setter
            let ratio = val / this.result;
            this.x *= ratio;
            this.y *= ratio;
        }
    };
    console.log(p.result); // 6, get result() is triggered
    p.result = 3; // set result(3) is triggered
    console.log(`p.x = ${p.x}, p.y = ${p.y}`); // p.x=1, p.y=2
	```

#### <a name="func-args-params" id="func-args-params">8.3 Function Arguments and Parameters</a>

- Optional Parameters and Defaults

	Ex1. 注意下面两种default的写法
	
	```javascript
	const pushToArray1 = function(num, arry) {
		arry = arry || []; // default to []
		arry.push(num);
		return arry;
	};
	const pushToArray2 = function(num, arry = []) { // default to []
		arry.push(num);
		return arry;
	}
	```
		
	Ex2. 注意下面height的default val用的是前一个param的val
		
	```javascript
	const rect = (width, height=width*2) => ({ width, height });
	rect(1); // { width: 1, height: 2 } 
	rect(1, 3); // { width: 1, height: 3 }. 注意这里pass进height了,  height就不取width*2了
	```
- **Rest** Parameters in function **Definition** and **Spread** Operator in function **Invocation**

	Ex1. Rest parameter in function defintion
	
	```javascript
	function max(first = -Infinity, ...rest) {
        let maxVal = first;
        for(let n of rest) { // rest是从第二个param开始的剩下的所有params的合集
            maxVal = Math.max(maxVal, n);
        }
        return maxVal;
    }
    console.log(max(1, 10, 100, 2, 3, 1000, 4, 5, 6)); // 1000. 这里first=1, rest=[10,100,...]
    
  	// 也可以写成
	function max1(first = -Infiintiy, ...rest) {
		// first=1, rest是剩下的[10, 100, 2, 3, 1000, 4, 5, 6]
		return Math.max(first, ...rest); // 注意这里要加上first, 因为rest里没有第一个param
	}
	console.log(max1(1, 10, 100, 2, 3, 1000, 4, 5, 6)); // 1000
	```
	
	- <span class="orange">注意first在这里并不是max的第一个param叫first</span>, 只是对于max传进去的params,第一个param会赋值给first. 并且如果max没有params, e.g: max(), 那么first defaults to -Infinity作为最后返回的maxVal
	- rest是从第二个param开始的剩下所有params的合集. 如果max()没有params, rest = [], 即空arry;
	
	Ex2. Spread operator for function calls
	
	```javascript
	const arry = [1, 10, 100, 2, 3, 1000, 4, 5, 6];
	Math.max(...arry); // spread用于真正tirgger function的时候
	
	// 也可以
	Math.max.apply(Math, arry)
	```
	
	Ex3. timed() will log the start/end time of running f. 注意区别下面rest和spread的用法.
	
	```javascript
	function timed(f) {
		// 此时的arguments只有[func: benchmark]. arguments[0].name = benchmark
		console.log(arguments); 
		    
		// rest in function definition
		return function(...args) {
		    console.log(`Entering function ${f.name}`); // Entering function benchmark
		    console.log(args); // [100]. args本身是array, rest operator相当于把pass进的params都condense到了一个args里. ...args相当于把args unpack了
		    
		    let startTime = Date.now();
		    try {
		        // spread in function call
		        return f(...args); // Spread the args back out, run benchmark(100)
		    }
		    finally {
		        console.log(`Exiting ${f.name} after ${Date.now()-startTime}ms`);
		    }
		};
	}
	function benchmark(n) {
	    let sum = 0;
	    for(let i = 1; i <= n; i++) sum += i; 
	    return sum;
	}
	// Now invoke the timed version of that test function 
	timed(benchmark)(100);
	```
	<span class="yellowBG">注意timed(f)(100)的意思</span>:
	
	- <span class="orange">timed(f)是一个closure</span>, function return一个function
	- timed(f) returns a function, and the returned function gets immediately called with parameter 100
	- that's why <span class="orange">in the first console.log, arguments only contains [func:benchmark], no access to 100</span>
	- returned function has access to "f", so inside can use f(...args)
	- with returned function gets called, 100 is passed in, which is <span class="orange">args=[100]</span>
	
	Ex4. <span class="orange">类似的closure (function returns function)</span>
	
	```javascript
	function add(x){
	    return function(y){
	        return x + y;
	    };
	}
	/**
	 * addTwo returns a function with x=2
	 * addTwo(4) means the returned function with y=4
	 */
	const addTwo = add(2); 
	addTwo(4) === 6; // true
	
	/**
	 * add(3) returns a function with x=3
	 * add(3)(4) means returned function with y=4
	 */
	add(3)(4) === 7; // true
	```
- Argument Types
	
	Ex1. <span class="orange">注意下面try/catch对结果的影响</span>. 
	
	throw并不意味着只是跳出当前function, 剩下的function还可以继续. 如果没有try/catch, 一旦throw, 所有下面的function就都不会继续了.
	
	```javascript
	const sum = (arry) => {
	    let total = 0;
	    /** 
	     * 1. 如果没有这个try/catch, 会停在第二个function, 且第二个function没有return, 一throw error就一切结束了
	     * 2. 有了这个try/catch, 三个function都会run, 虽然throw, 但是只是当前的try结束了,
	     * 	注意不是跳出整个function, 只是跳出当前的try block.
	     * 3. 区别有没有try/catch: 
 	     *  - 如果有try/catch, 会跳出try/catch继续下面的function, 这里是return total. 
 	     *  - 如果没有try/catch, 一旦throw就完全结束, 就算下面还有别的function也不会进行了
 	     */
 	     
	    try { 
	        for(let num of arry) {
	            if(typeof num !== "number") {
	                /**
	                 * throw没有return, 不是return  throw!!
	                 * 1. throw new Error(...), log是Uncaught Error: ...
	                 * 2. throw new TypeError(...), log是Uncaught TypeError: ...
	                 * 3. 也可以直接throw + str, log是Uncaught 3 is not a number.
	                 */
	                throw new TypeError(`${num} is not a number.`); // 也可以throw new Error(...)
	                // throw `${num} is not a number.`;
	            }
	            total += num;
	        }
	    } catch (e) {
	        // sum(1, 2, 3): TypeError: arry is not iterabel
	        // sum([1,2, "3"]): Error: 3 is not a number
	        console.log(e);
	    }
	    return total;
	}
	console.log(sum([1,2,3])); // 6
	console.log(sum(1, 2, 3)); // 0, 在for(let num of a)处: Uncaught TypeError: arry is not iterable
	console.log(sum([1,2, "3"])); //3, 在throw处: Uncaught TypeError: 3 is not a number.
	```

#### <a name="func-val" id="func-val">8.4 Functions as Values</a>

- Function as parameter values

	Ex1.
	
	```javascript
	function add(x, y) { return x+y; }
	function operate1(operator, operand1, operand2) {
	    return operator(operand1, operand2);
	    
		// 也可以用call or apply
		return operator.call(this, operand1, operand2);
		return operator.apply(this, [operand1, operand2]);
	}
	// 注意这里add没有引号!! 不是string, 不是operate("add", ...args). 
	// add是func name, 前面定义过了
	console.log(operate1(add, 1, 2)); // 3
	```
	
	Ex2.
	
	```javascript
	// 注意obj.method的两种写法
	const operators = {
	    add(x, y) { return x+y; },
	    minus: (x, y) => x-y
	};
	function operate2(operator, operand1, operand2) {
        try {
            const func = operators[operator];
            if(typeof func !== "function") {
                throw new Error(`${operator} not exists`);
            }
            return func(operand1, operand2);
        } catch(e) {
            console.log(e);
        }
    }
	// 区别于之前operate1(add, 1, 2)中add没有引号,不是string. 
	// 这里operate2("add",..)的add是string, 是operators的key
	// 因为这里没有对add的直接定义
	console.log(operate2("add", operate2("minus", 3, 1), 4)); // 6
	console.log(operate2("add", "hello", " world")); // hello world
	console.log(operate2("multiply", 2, 3)); // Uncaught Error: multiply not exists
	```
	
	- Ex1中operate1(<span class="orange">add</span>, ...rest)的<span class="orange">add没有引号</span>, 不是string, 前面定义过了, 是function name.
	- 区别于Ex2的operate2(<span class="orange">"add"</span>, ...rest)的<span class="orange">add有引号</span>, 是operators的key, 是string, 前面没有对add的定义.
	- 注意Ex2中的operators.method的两种写法
	- 注意Ex中如果obj的key是variable, 不能用operators.operator, 得用<span class="orange">operators[operator]</span>
	- 注意Ex2种try/catch, <span class="orange">一旦throw error但是没有try/catch就整个application结束了</span>. 这里有try/catch, 所以会log error，并继续下面的

- Function as Object: <span class="orange">Functions are Objects</span>, can set properties to it.

	Ex3. 
	
	```javascript
	uniqueInt.count = 0;
	function uniqueInt() {
	    console.log(this); // window obj
	    // 不能用this.count++, function declaration里的this是window! 区别于obj.method的this是obj
	    return uniqueInt.count++;
	}
	console.log(uniqueInt()); // 0, 注意不是1, a++是返回的值先不变, 返回完了才a+1
	console.log(uniqueInt()); // 1
	```
	
	- 注意上面uniqueInt()中不能用this.count. <span class="orange">function declaration里的this是window! 区别于obj.method的this是obj</span>
	- a++返回的值是原本的a, 返回完了才a+1
	- 但是这种uniqueInt.count的写法有一个问题: buggy or malicious code could reset the counter or set it to a noninteger.
	
	Ex4.
	
	```javascript
	function factorial(n) {
		// 只测typeof n === "number"是不够的
		if(!Number.isInteger(n) || n <= 0) return NaN;
		// 也可以写成 if(n in factorial), 因为是key
		if(factorial[n] !== undefined) return factorial[n];
		// 这里不是n*factorial[n-1]!! 得是factorial(n-1), 再次invoke function
		factorial[n] = n * factorial(n-1);
		// 不能return factorial[n] = n * factorial(n-1)
		// 要写成两步, return的时候不能有等号
		return factorial[n];
    }
    factorial[1] = 1; // initiate cache, base case;
    console.log(factorial(4)); // 24
    console.log(factorial[3]); // 6 前面算4的时候cache了factorial[2]和factorial[3]
	```
	
	- factorial既是function, 也有factorial[n]作为cache
	- 注意上例只测`typeof n === "number"`是不够的，要用`Number.isInteger(n)`

#### <a name="closure" id="closure">8.6 Closure</a>

A **closure** is the combination of a function bundled together (enclosed) with references to its surrounding state (the lexical environment). In other words, a closure gives you <u>access to an outer function's scope from an inner function</u>.

A **closure** is a function that <u>references variables in the outer scope from its inner scope</u>. The closure preserves the outer scope inside its inner scope.

In JavaScript, closures are created every time a function is created, at function creation time. Technically, <u>all JavaScript functions are clousres</u>, but because most functions are <u>invoked from the same scope</u> that they were defined in, it normally doesn’t really matter that there is a closure involved. Closures become interesting when they are <u>invoked from a different scope than the one they were defined in</u>, 比如下面Ex1.2中的checkScope2第二个()执行function f的时候, f is invoked from a different scope.

Ex1.1

```javascript
let scope = "global scope";
function checkScope1() {
	let scope = "local scope";
	function f() {
	    return scope;
	}
	// 必须return f(). 如果没有return,下面的log是undefined
	return f(); // 这里是直接执行了f, 区别于下面return f;
}
console.log(checkScope1()); // local scope
```

- 勿忘checkScope1中必须<span class="red">return</span> f(). function如果没有return, 它返回的就是undefined, 导致之后的log是undefined

Ex1.2

```javascript
let scope = "global scope";
function checkScope2() {
    let scope = "local scope";
    function f() {
        return scope;
    }
    return f;
}
console.log(checkScope2()()); // local scope. 勿忘第二个()才是执行return的f
```

- 区别于Ex1.1, 这里checkScope2()<span class="orange">()</span>有两个(). Ex1.1中checkScope1()返回的是已经执行了的f, 这里checkScope2()返回的还是function f
- 虽然checkScope2 executed的时候, 和checkScope2同级的scope是"global scope", 但是**Functions are executed using the scope they were defined in**, NOT where they are invoked.

Ex2.1.1 <span class="orange">如果要keep `count` as a private state</span>, 更好的写法是用<span class="orange">IIFE + closure (return function)</span>
	
```javascript
const uniqueIntClosure = (function() {
    let count = 0;
    return function() {
        return count++;
    }
})();
console.log(uniqueIntClosure()); // 0 注意这里不用uniqueIntClosure()(). uniqueIntClosure已经是return的function了,一个()就够了 
console.log(uniqueIntClosure()); // 1
```
	
- 注意上面不用uniqueIntClosure()<span class="orange">()</span>. uniqueIntClosure<span class="orange">已经是return的function了,一个()就够了</span>

Ex2.1.2 类似的还有Singleton, instance只init了一次

```javascript
const Singleton = (function() {
	let instance;
	function createInstance() {
		console.log(`-- in createInstance --`);
		return { a: 1 };
	}
	function getInstance() {
		console.log(`-- in getInstance --`);
		if(instance === undefined) {
			instance = createInstance();
		}
		return instance;
	}
	return {
		getInstance
	}
})();
console.log(Singleton.getInstance()); // 会trigger createInstance
console.log(Singleton.getInstance()); // 不会再trigger createInstance了
```

Ex2.2 区别uniqueIntClosure和下面的uniqueIntClass
	
```javascript
// 其实这个应该写成class(function)
// function uniqueIntClass() { ... }
const uniqueIntClass = function() {
    let n = 0;
    return function() {
        return n++;
    }
    // return n++; // 这两种return都一样 只是return function的话 下面call的时候需要两个()()
};
console.log(uniqueIntClass()()); // 0
console.log(uniqueIntClass()()); // 0 是新的obj, n互不影响
```
	
- 区别于Ex2.1的uniqueIntClosure, <span class="orange">uniqueIntClass没有IIFE, 是一个class/function</span>. <span class="orange">每次call得到的是一个新的object</span>, n互相不干扰.

类似上面Ex2.1中uniqueIntClosure的count, 但是it need not be exclusive to a single closure: it can be shared bt more nested functions. 下面Ex3.1中的n就是shared bt count和reset, which are defined within the same outer function counter1.

Ex3.1

```javascript
function counter1() {
    let n = 0;
    return {
        count() { return n++; },
        reset() { n = 0; }
    };
}
const c1 = counter1(), c2 = counter1(); // 和new counter1()一样, 都是返回一个obj
console.log(c1.count()); // 0. 注意不是counter1.count(), 是counter1().count()
console.log(c1.count()); // 1
c1.reset();
console.log(c1.count()); // 0
console.log(c1.count()); // 1

console.log(c2.count()); // 0, c1和c2互不干扰, has its own scope
```

- 这里counter1和上面的uniqueIntClass一样, 返回的是一个object, 所以call的时候一个()就够了
- 和uniqueIntClass一样, 区别于uniqueIntClosure, 这里没有IIFE, 所以类似class, c1和c2是两个互不相干的obj
- counter1是一个closure, 这种用法实际上是一个<span class="orange">class</span>.

Ex3.2 区别于上例的n是private, 无法通过c1.n access n. 这里通过count的getter/setter expose了count, 所以可以直接d.count. 但是n依然是private.

```javascript
function counter2(n = 0) { // n is private, if not passed in, default will be 0
    return {
        get count() { return n++; },
        set count(val) { 
            if(val > n) {
                n = val; 
            } else {
                throw new Error ("count can only be set to a larger val");
            }
        }
    }
}
const d1 = counter2(3);
console.log(d1.count); // 3. 注意这里不是d.count(), 因为count是accessor prop, 不是function!!
console.log(d1.count); // 4
console.log(d1.count); // 5
try {
    d1.count = 4; // 注意不是d1.set(1)!!! count是个prop, 直接赋值就会trigger set
} catch(e) {
    console.log(e); // Error: count can only be set to a larger val
}
d1.count = 10;
console.log(d1.count); // 10
```

- accessor properties: <span class="orange">getter/setter can only be added to object</span>, not function. 所以下面是return { get, set } 
- 注意上面是trigger setter时是直接d1.count = 4, 不是d1.set(10)
- 上面的get count和set count是<u>two closures defined in the same scope</u> and share access tot he same private variable.

```javascript
console.log(d1 instanceof  counter2); // false
console.log(d1 instanceof Object); // true
```

- <span class="orange">constructor function不需要return</span>. 之前counter2 return的两个function导致instanceof不work了
- 得用下面的方法写getter/setter

```javascript
// constructor一般不用return, write all necessary stuff into this, and it automatically becomes the result.
function counterConstructor(n) {
    this._n = n;
}
Object.defineProperties(counterConstructor.prototype, {
    count: {
        get: function() {
            return this._n++;
        },
        set: function(val) {
            this._n = val;
        }
    }
});
const d2 = new counterConstructor(5);
console.log(d2 instanceof counterConstructor); // true
console.log(d2.count); // 5
console.log(d2.count); // 6
d2.count = 10;
console.log(d2.count); // 10
```

- constructor一般不用return, write all necessary stuff into this, and it automatically becomes the result.

但是也要注意<b>Closure可能带来的Performance  issue</b>: 

It is unwise to unnecessarily create functions within other functions if closures are not needed for a particular task, as it will <u>negatively affect script performance both in terms of processing speed and memory consumption</u>.

For instance, when creating a new object/class, <u>methods should normally be associated to the object's prototype</u> rather than defined into the object constructor. The reason is that whenever the constructor is called, the methods would get reassigned (that is, for every object creation).

Ex4.1 `getName`和`getMessage`是两个closure. 下面不应该把这两个closures写在constructor里

```javascript
function MyObject(name, message) {
  this.name = name.toString();
  this.message = message.toString();
  this.getName = function() {
    return this.name;
  };

  this.getMessage = function() {
    return this.message;
  };
}
```

Ex4.2 下面的写法也不对, 不应该改本身的`MyObject.prototype`

```javascript
function MyObject(name, message) {
  this.name = name.toString();
  this.message = message.toString();
}
MyObject.prototype = {
  getName: function() {
    return this.name;
  },
  getMessage: function() {
    return this.message;
  }
};
```

Ex4.3 应该写成下面这样

```javascript
function MyObject(name, message) {
  this.name = name.toString();
  this.message = message.toString();
}
MyObject.prototype.getName = function() {
  return this.name;
};
MyObject.prototype.getMessage = function() {
  return this.message;
};
```

<b>Closure Scope Chain</b>: Every closure has three scopes (它解释了下面how variables are resolved when it's inside <u>closures in loops</u>)

- Local Scope (Own scope)
- Outer Functions Scope
- Global Scope

<span class="bold border">Creating closures in loops: A common mistake</span>

Prior to the introduction of the let keyword in ECMAScript 2015, a common problem with closures occurred when you created them inside a loop.

Ex5.1

```javascript
let funcs = [];
for(var i=0; i<10; ++i) {
    funcs[i] = () => i; // 所有loop share的同一个i
}
console.log(funcs[5]()); // 10. 因为funcs的10个functions都是share的同一个i, 此时i=10
```

- 勿忘最后是funcs[5]<span class="red">()</span>. funcs[5]只是一个function, 没有执行
- This code creates 10 closures and stores them in an array. The closures are all defined within the same invocation of the function, so they <span class="orange">share access to the variable i</span>. 
- <b>Closure Scope Chain</b>： `funcs[5] = function() { return i; }`: `funcs[5]()`执行的时候, <span class="orange">local scope没有i的定义, 所以向上找outer scope</span>. <b>Functions are excuted using the scope they were defined in</b>, 所以找到for loop, 此时i已经是10了
- 如果改成`funcs[i] = (i) => i; ` 即只pass进i也不对. funcs[5]其实就是`function(i) { return i; }`, `funcs[5]()`执行的时候, 没有传进i, <span class="red">i此时是undefined</span>, log是undefefined. <span class="orange">除非同时改成</span>`funcs[5](5)`.

Ex5.2 how to fix

- fix 5.2.1: 用`let` / `const` 做for loop, since `let` and `const` are block scoped, each iteration has its own independent binding of i.
- fix 5.2.2: use more closures:  <u>Creates a new lexical environment</u>, in which v refers to the corresponding i when constFunc(i) triggered.

	```javascript
	function constFunc(v) { // constFunc是一个closure, return的是一个function! 不是return v
		return () => v;
		/**
		 * 等同于
		 * return function() {
		 *    return v;
		 * }
		 */
	}
	let funcs = [];
	for(var i=0; i<10; ++i) {
		funcs[i] = constFunc(i); 
	}
	console.log(funcs[5]()); // 5. 勿忘多出来的()!! funcs[5]即constFunc(5)返回的是一个function
	```
	
	- 勿忘最后是funcs[5]<span class="red">()</span>. funcs[5]即constFunc(5)返回的是一个function, 没有执行
	- 不能写成`function constFunc(v) { return v; }`, 这样的话funcs[i]=constFunc(i)就直接执行return i了
	- <b>Closure Scope Chain</b>: `funcs[5] = () => v`, 此时在<span class="orange">local scope</span>里v没有定义, 所以向上找<span class="orange">outer scope</span>. <b>Functions are excuted using the scope they were defined in</b>, <span class="orange">区别于4.1, 这里的outer scope是</span>`function constFunc(5)`, <span class="orange">即v=5</span>
	- 和5.1一样, 这里也不能改成`function constFunc(v) { return (v) => v; }`, 因为`funcs[5]()`执行的时候, 没有传进v, log是undefefined, 除非同时改成`funcs[5](5)`.
- 这里<span class="orange">没有办法用类似6.2.3的IIFE</span>. 因为这里不存在callback, 当时就执行了

Ex6.1 Show help text once focusing on the input box. 

但是No matter what field you focus on, the message "your name" will always be displayed.

```html
<p>Email: <input type="text" id="email" name="email"></p>
<p>Name: <input type="text" id="name" name="name"></p>
<p id ="help">Help msg goes here.</p> 
```

```javascript
const help = document.getElementById("help");
const json = [{
	id: "email",
	help: "your email"
	}, {
	id: "name",
	help: "your name"
}];

for(var i=0, size=json.length; i<size; ++i) {
    var elem = json[i];
    document.getElementById(elem.id).onfocus = () => {
        help.innerHTML = elem.help;
    }
}
```

- 注意<span class="red">`elem.innerHTML`</span>和<span class="red">`elem.onfocus`</span>的用法
- The functions assigned to onfocus are closures, they share the same variable `elem`. The value of `elem.help` is determined when the onfocus callbacks are executed, and at that time, elem is the last obj in json.
- <b>Closure Scope Chain</b>: 当onfocus callback的时候只有`() => { helper.innerHTML = elem.help; }`. 此时在<span class="orange">local scope</span>里没有elem的定义, 所以向上找<span class="orange">outer scope</span>, 即for loop的elem, 此时elem = the last obj in json, 所以help text是name的help.

Ex6.2 how to fix

- fix 6.2.1: 用`let` / `const` 做for loop
- fix 6.2.2: use more closures, 和5.2.2一样. <u>Creates a new lexical environment</u> for each callback, in which text refers to the corresponding string from the json array.

	```javascript
	function helpCallback(text) {
	    return function() {
	        help.innerHTML = text;
	    }
	}
	for(var i=0, size=json.length; i<size; ++i) {
	    var elem = json[i];
	    document.getElementById(elem.id).onfocus = helpCallback(elem.help);
	}
	```
	
	- <b>Closure Scope Chain</b>: onfocus callback的时候只有`function() { help.innerHTML = text; }`. 此时在<span class="orange">local scope</span>里没有text的定义, 所以向上找<span class="orange">outer scope</span>. 这里的outer scope是`function helpCallback(text)`, 即定义时传进来的当时item的help.

- fix 6.2.3: <span class="orange">using IIFE</span>: <u>Immediate event listener attachment with the current value</u> of item (preserved until iteration).

	```javascript
	for(var i=0; i<json.length; ++i) {
		(() => {
		    var elem = json[i];
		    document.getElementById(elem.id).onfocus = () => {
		        help.innerHTML = elem.help;
		    };
		})();

		// 用传统的(function() {})()
		// (function() {
		//     var elem = json[i];
		//     document.getElementById(elem.id).onfocus = () => {
		//     help.innerHTML = elem.help;
		//     };
		// })();
	}
	```
	
- fix 6.2.4: using `forEach`. 这个和6.2.2类似, 都是closure scope chain

	```javascript
	json.forEach((elem) => {
	    document.getElementById(elem.id).onfocus = () => {
	        help.innerHTML = elem.help;
	    }
	});
	```
	
	- <b>Closure Scope Chain</b>: onfocus callback的时候只有`() => { help.innerHTML = elem.help; }`. 此时在<span class="orange">local scope</span>里没有elem的定义, 所以向上找<span class="orange">outer scope</span>. 这里的outer scope是`json.forEach`的`(elem)`, 即当时的item.

#### <a name="func-prop-method-constructor" id="func-prop-method-constructor">8.7 Function Properties, Methods, and Constructor</a>
##### <a name="func-prop" id="func-prop">8.7.1 `func.length`, `func.name`, `func.prototype`</a>

<span class="white-on-black">Function.length</span>

- Read-only
- <span class="orange">Returns</span> the number of parameters it <u>declares</u> in its parameter list. This number <u>excludes the rest parameter</u> and only includes parameters <u>before the first one with a default value</u>. 

区别于`arguments.length` is local to a function and provides the number of arguments <u>actually</u> passed to the function.

```javascript
console.log(Function.length); // 1

function func1() {}
console.log(func1.length); // 0
function func2(a, b) {}
console.log(func2.length); // 2

// only includes parameters before the first one with a default value
console.log((function(a=3){}).length); // 0
console.log((function(a){}).length); // 1
console.log((function(a=3, b){}).length); // 0
console.log((function(a, b=1){}).length); // 1

// rest parameter is not counted
console.log((function(a, ...args) {}).length); // 1
```

<span class="white-on-black">Function.name</span>

- Read-only
- <span class="orange">Returns</span> the function's name as specified when it was created, or it may be either anonymous or '' (an empty string) for functions created anonymously.

```javascript
console.log(Function.name); // Function

// function的两种定义方式
const func2 = function() {}; // 右边是anonymous
console.log(func2.name); // func2
console.log((function func3() {}).name); // func3

const obj = {
    func4() {}
};
console.log(obj.func4.name) // func4

// anonymous
console.log((function(){}).name); // "", empty string
```

Use `obj.constructor.name` to check the "class" of an object 

```javascript    
// class
function Foo() {} // class Foo {}
const f = new Foo();
console.log(f.constructor.name); // Foo
```

Be careful when using `Function.name` and source code transformations, such as those carried out by JavaScript compressors (<u>minifiers</u>). These tools are often used as part of a JavaScript build pipeline to reduce the size of a program prior to deploying it to production. <u>Such transformations often change a function's name at build-time</u>. Above might change to the following after minifying

```javascript
function a() {}
let b = new a();
console.log(b.constructor.name); // a, 注意不是Foo了
```

<span class="white-on-black">Function.prototype</span>

All functions, except arrow functions, have a `prototype` property that refers to an object known as the prototype object. <u>Every function
has a <b>different</b> prototype object</u>. 即使看上去一样也不相等.

##### <a name="func-apply-call-bind" id="func-apply-call-bind">8.7.4-5 The `func.apply()`, `func.call()` and `func.bind()` Methods</a>

`apply()`和`call()`基本一样, 除了`apply` accepts <u>an array of arguments</u>, `call` accepts <u>an argument list</u>.

<span class="white-on-black">Function.prototype.apply()</span>

```javascript
func.apply(thisArg, argsArray)
```

- `argsArray ` is optional, can be an array or an array-like object.

基本本身要求pass进是list of arguments(一个一个的)的都可以用apply + argsArray, 同时也可以用spread operator: `...argsArray`

Ex1. `Math.max`, `Math.min`

```javascript
let arry1 = [4,3,6,1];
console.log(Math.max.apply(null, arry1)); // 6

// 等同于spread operator
console.log(Math.max(...arry1)); // 6
```

Ex2. `push`

```javascript
let arry2 = [5,7];
arry1.push.apply(arry1, arry2); // 这里thisArg必须是arry1, 不能是null
console.log(arry1); // [4, 3, 6, 1, 5, 7]

arry1 = [4,3,6,1]
// 等同于spread operator
arry1.push(...arry2);
console.log(arry1); // [4, 3, 6, 1, 5, 7]

// 区别于concat会create a new array and return
arry1 = [4,3,6,1];
console.log(arry1.concat(arry2)); // [4, 3, 6, 1, 5, 7], arry1不变
```

- 注意`arry1.push.apply`的时候thisArg必须是arry1, 不是null, 区别于`Math.max.apply`
- `concat`不会改变原arry, 会create a new array and return


<span class="white-on-black">Function.prototype.call()</span>

```javascript
func.call(thisArg, arg1, ..., argN)
```

- `arg1, ..., argN` is optional.

`call()`的用法

- `Array.prototype.slice.call(arguments)` 等同于 `Array.from(arguments)`
- Using call() to chain constructors for an object

	Ex1.
	
	```javascript
	function Product(name, price) {
	    this.name = name;
	    this.price = price;
	}
	function Toy(name, price) {
	    Product.call(this, name, price);
	    this.category = "toy";
	}
	function Food(name, price) {
	    Product.call(this, name, price);
	    this.category = "food";
	}
	const fun = new Toy("robot", 40);
	const cheese = new Food("feta", 5);
	console.log(fun.name, fun.price, fun.category); // robot 40 toy
	console.log(cheese.name, cheese.price, cheese.category); // feta 5 food
	```
	
- Using call() to invoke an anonymous function

	Ex2. 
	
	```javascript
	const animals = [
	    { species: "Lion", name: "King"},
	    { species: "Whale", name: "Fail"}
	];
	for(var i=0, size=animals.length; i<size; ++i) {
	    (function(i) { // 不传入i也可以 会向上到for loop找到i
	        this.print = function() {
	            console.log(`#${i} ${this.species}: ${this.name}`);
	        };
	        this.print();
	    }).call(animals[i], i); // 如果用bind要bind(animals[i], i)()才会执行
	}
	// #0 Lion: King
	// #1 Whale: Fail
	```
	
	- 区别call和bind, bind勿忘执行的<span class="orange">()</span>

<span class="white-on-black">Function.prototype.bind()</span>

```javascript
func.bind(thisArg, arg1, ..., argN)
```

- `arg1, ..., argN` is optional.
- <span class="orange">Returns</span> <u>a new function</u>.

<div class="border">
Unlike the call() and apply() methods, the bind() method <u>doesn’t immediately execute the function</u>. It just returns a new version of the function whose this sets to thisArg argument. bind必须要加func.bind(ctx, arguments)<span class="orange">()</span>才执行.
</div>

`bind()`的用法

- Creating a bound function, no matter how it is called, is called with a particular this value.
	
	Ex1.1
	
	```javascript
	this.x = 9;
	const module = {
	    x: 81,
	    getX() {
	        return this.x;
	    }
	};
	console.log(module.getX()); // 81
	
	const retrieveX = module.getX;
	console.log(retrieveX()); // 9, the function gets invoked at the global scope, returns window.x
	
	const boundGetX = retrieveX.bind(module);
	console.log(boundGetX()); // 81
	```
	- module.getX()返回的是module.x, 不是this.x
	- 注意retrieveX只是extract the method from object, but is invoked at the global scope: this是window, 不再是module了

	Ex1.2
	
	```javascript
	function f(y) {
	    return this.x + y;
	}
	let o = { x: 1 };
	let g = f.bind(o);
	console.log(g(2)); // o.x+2=3 其实就是f.bind(o)(2)
	
	let p = { x: 10, g };
	console.log(p.g(2)); // 还是o.x+2=3, g is still bound to o, not p
	```
	
	- g一直bound to o, 即使作为p.g

	Ex1.3
	
	```javascript
	const monica = {
	    name: "Monica Geller",
	    total: 400,
	    deductFee(fee) {
	       this.total -= fee;
	       return `${this.name} remaining balance is ${this.total}`; 
	    }
	  }
	console.log(monica.deductFee(10)); // Monica Geller remaining balance is 390
	
	const rachel = { name: "Rachel Green", total: 1500 };
	/**
	 * 1. 注意deductFee处没有括号 是一个function
	 * 2. bind后面没有括号 rachelDeductor依然是一个funciton
	 * 3. 可以bind时就传进了fee, 也可以rd = monica.deductFee.bind(rachel); rd(200);
	 */
	const rachelDeductorBind = monica.deductFee.bind(rachel, 200); 
	console.log(rachelDeductorBind()); // Rachel Green remaining balance is 1300
	console.log(rachelDeductorBind()); // Rachel Green remaining balance is 1100
	
	// 也可以这么写
	console.log(monica.deductFee.bind(rachel)(200)); // Rachel Green remaining balance is 1300
	
	/**
	 * 也可以用apply和call
	 * 1. apply和call都是直接出结果, 只有bind需要()代表执行
	 * 2. apply的args必须用[]传进去, 即使只有一个arg
	 */
	console.log(monica.deductFee.apply(rachel, [200])); // Rachel Green remaining balance is 900
	console.log(monica.deductFee.call(rachel, 200)); // Rachel Green remaining balance is 700
	```

- Create partially applied functions: <b>Currying</b>: make a function with pre-specified initial arguments

	Ex1.
	
	```javascript
	let sum = (x, y) => x+y;
	let sumOne = sum.bind(null, 1); // bind the first argument to 1
	console.log(sumOne(2)); // 1+2=3, x is bound to 1,and we pass 2 for y
	console.log(sumOne.name); // bound sum
		
	function f2(y, z) {
	    return this.x + y + z;
	}
	let g2 = f2.bind({ x: 1 }, 2); // bind this and y
	console.log(g2(3)); // 1+2+3=6
	```
	
	- 取决于本身的function需不需要this, 注意上面两种bind, sumOne的thisArg是null, g2的thisArg是一个object.
	- 注意上面`sumOne.name`, 对于bind的function, 它的func.name是bound + 本身func.name

- `bind` with `setTImeout()`

	By default within `setTimeout()`, the `this` keyword <span class="orange">will be set to the window</span> (or global) object in non-strict mode and `undefined` in strict mode. When working with class methods that require `this` to refer to class instances, you may explicitly bind `this` to the callback function, in order to maintain the instance.
	
	Ex1. 
	
	```javascript
	let person = {
        name: "John Doe",
        getName() {
            console.log(this.name);
        }
    };
    setTimeout(person.getName, 1000); // undefined
    ```
    
    上面`setTimeout(person.getName, 1000)`和下面是等价的, 所以this不是person
    
    ```javascript
    const f = person.getName;
    setTimeout(f, 1000);
    ```
    
    To fix:
    
    ```javascript
    // 法一
    setTimeout(person.getName.bind(person), 1000); // John Doe. 这里bind不用执行, setTimeout就是需要一个function
    
    // 法二 This works because it gets the person from the outer scope and then calls the method getName().
    setTimeout(function() {
        person.getName(); // John Doe
    }, 1000); 
	```
	
	- `setTimeout(func, delay, arg1, ..., argN)`: 注意pass进的func就是function, bind不需要执行
	- 法二work的原因是closure scope: it gets the person from the outer scope

	Ex2. 
	
	```javascript
	function RandomCount(min, max) { // [min, max)
        this.count = Math.floor(Math.random() * (max - min)) + min;
    }
    RandomCount.prototype.delayPrint = function() {
        setTimeout(this.print.bind(this), 1000);
    };
    RandomCount.prototype.print = function() {
        console.log(`random number generated: ${this.count}`);
    };
    const num = new RandomCount(1,10);
    num.delayPrint(); // after 1sec, random number generated: 3
	```
	
##### <a name="higher-order-func" id="higher-order-func">8.8.2 Higher-Order Functions</a>

<b>Higher-Order Functions</b> are functions that operate on other functions, either by taking them as arguments or by returning them. In simple words, A <u>Higher-Order function</u> is a function that receives a function as an argument or returns the function as output.

- Built-in Higher-Order Functions 
	- `Array.prototype.map`
	
		```javascript
		arry.map(callbackFn)
		```
		
		Ex.
		
		```javascript
		const arryHigherOrder = [1, 2, 3];
		const mapped = arryHigherOrder.map((item) => item * 2);
		console.log(mapped); // [2, 4, 6]
		```
		
	- `Array.prototype.filter`

		```javascript
		arry.filter(callbackFn)
		```
		
		Ex. 
		
		```javascript
		const filtered = arryHigherOrder.filter((item) => item%2 === 0);
		console.log(filtered); // [2]
		```
		
	- `Array.prototype.reduce`

		```javascript
		arry.reduce(callbackFn, initialVal)
		```
		
		Ex.
		
		```javascript
		const sumup = arryHigherOrder.reduce((acc, cur) => acc + cur);
		console.log(sumup); // 6
		
		// 等同于写成callback
		const sumFn = (x, y) => x + y;
		console.log(arryHigherOrder.reduce(sumFn)); // 6
		```
		
- Our own Higher-order Functions

	Ex. 先算fn2, 然后用fn2的结果算fn1
	
	```javascript
	function compose(fn1, fn2) {
		// 这里...args是传进来的2, 3
		return function(...args) { // return的是一个function, 直到(2,3)才执行
		    return fn1(fn2(...args));
		    // 等价于
			// return fn1.call(null, fn2.apply(null, args));
		};
	}
	const fn1 = (x) => x * x;
	const fn2 = (x, y) => x + y;
	console.log(compose(fn1, fn2)(2, 3)); // (2+3)*(2+3)=25   
	```
	
	- 注意compose return的是一个function, 并没有执行. 直到(2,3)才执行
	- compose里`...args`是执行时传进来的2,3
	- 注意fn2用apply的原因是`...args`是array, fn1用call的原因是fn2的结果是一个数

#### <a name="class-constructor" id="class-constructor">9.2 Classes and Constructors</a>

- Constructor-Less Class (<u>所有regular function都可以看作一种class</u>)
	
	Ex1. range() is a factory function
		
	```javascript
	function range(from, to) {
		console.log(this); // Window. 区别于Constructor里的this是constructor本身, eg: Range {}
		// 所有range的objects都会inherit range.methods里的properties
		let r = Object.create(range.methods);
		r.from = from;
		r.to = to;
		return r;
	}
	range.methods = { 
		includes(x) {
		    return x >= this.from && x <= this.to; // this指向range自己, 所以有this.from/to
		}, 
		toString() {
		    return `[${this.from}, ${this.to}]`;
		}
	};
	const range1 = range(1, 3), range2 = range(6, 10); // range1和range2互不干扰
	console.log(range1.toString()); // [1, 3]
	console.log(range1.includes(2)); // true
	console.log(range2.toString()); // [6, 10]
	console.log(range2.includes(5)); // false
	
	console.log(range1 instanceof range); // false, range不是constructor
	console.log(range.methods.isPrototypeOf(range1)); // true
	```
	
	- range()是factory function, 不是constructor. <u>Constructor用this赋值, 不需要return, invoke时要用new</u>.
	- range()是一个普通function, 所有function里的<span class="orange">this都是window</span>. 区别于<span class="orange">Constructor Range里的this是Range {}</span>.
	- `Object.create(proto)` creates a new object "r", which use range.methods as its prototype
	- 对于range.methods: 首先range是一个function, 所以也是一个object, 所以可以给range加property. methods是range的一个property, 所以可以access this.from/to
	- 注意range1和range2的to/from互不干扰, range()里定义的properties都是<u>unshared/uninherited, 和constructor一样</u>. 只有range.methods里的东西才<u>share/inherit, 类似prototype</u>.
	- 注意<span class="orange">用factory function init的object `instanceof`返回false. 这种constructor-less的要用`isPrototypeOf`</span>

- Constructor

	Constructor using `new` to invoke. Inside construtor function, there is <u>no need to call `Object.create(proto)`</u> to create a new object, there is also <u>no need to return</u> newly created object. With the use of `new`, construcotr will automatically create and return the new object.

	Ex2. 改写上面的range(), Range是一个constructor
	
	```javascript
	function Range(from, to) {
		this.from = from;
		this.to = to; // 不需要return
	}
	// 这里overwrite了predefined Range.prototype
	Range.prototype = {
		includes(x) {
		    return x >= this.from && x <= this.to;
		},
		toString() {
		    return `[${this.from}, ${this.to}]`;
		}
	}
	// Constructor用new invoke, 区别于factory/普通function
	const range1 = new Range(1, 3), range2 = new Range(6, 10);
	console.log(range1.toString()); // [1, 3]
	console.log(range1.includes(2)); // true
	console.log(range2.toString()); // [6, 10]
	console.log(range2.includes(5)); // false
	
	console.log(range1 instanceof Range); // true. 区别于上面的factory function
	console.log(Range.prototype.isPrototypeOf(range1)); // true
	```
	
	- Constructor name要大写首字母, 用来区别其他的function
	- 注意Range constructor里, no need to create/return object, <u>it just inits `this`</u>.
	- Constructor用new invoke, 区别于factory/普通function

上面的Ex1和Ex2都没有用<b>arrow function</b> when defining constructors or methods. 因为arrow function没有this. arrow functions inherit the `this` keyword from the context in which they are defined rather than setting it based on the object through which they are invoked. <u>Arrow functions are <b>NOT</b> allowed when defining methods in constructor/class</u>.
	
- `instanceof`, `isPrototypeOf`
	
	`obj instanceof C`<span class="orange">查的是如果obj inherits from C.prototype</span>. 所以上面Ex1中用factory function init的range的instanceof返回false, 而Ex2的range instanceof返回的是true. 这种constructor-less的可以用`isPrototypeOf`. 
	
	Ex1的range没有prototype, <span class="underline-orange">range.prototype会报错, 关键在于range不是constructor, constructor不能有return</span>. <span class="underline-orange bold">`prototype`只属于constructor, 只有constructor才能用prototype</span>, 例如Ex2的Range, 即function定义里没有return.
	
	Ex3.
	
	```javascript
	function Strange() {}
	Strange.prototype = Range.prototype;
	new Strange() instanceof Range； // true
	```
	
	- 注意`obj instanceof C`查的就是<span class="orange">obj的constructor.prototype是不是指向C.prototype</span>. <span class="orange">注意</span>这里并不要求obj.constructor存在, 思考Ex2的range1.constructor并不存在, 但instanceof是true.

- `obj.constructor`: Prototype的constructor property

	对于所有function/constructor自带的prototype都有back-reference回本身constructor的constructor property, 即<span class="orange">`F.prototype.constructor === F`</span>. 所以有下面的

	```javascript
	let F = function() {};
	let obj = new F();
	obj.constructor === F; // true. 因为inherit了F.prototype的所有properties, construtor是自带的其中之一
	
	// 之前Ex2的range1
	console.log(range1.constructor === Range); // false.
	```
	
	- 因为Ex2的Range.prototype是overwrite了本身predefined prototype, 所以上面range1.constructor不是Range
	- To fix
		
		```javascript
		Range.prototype = {
			constructor: Range, // Explicitly set the constructor back-reference
			/* method definitions go here */
		};
		const range3 = new Range(11,15);
		console.log(range3.constructor === Range); // true
		```
	- 除了上面explicitly set back reference, 经常用的是extend the predefined Range.prototype object

		```javascript
		Range.prototype.includes = function(x) {
			return x >= this.from && x <= this.to;
		}
		```

#### <a name="class-with-class-keyword" id="class-with-class-keyword">9.3 Classes with the class Keyword</a>

用`class`定义的class本质和9.2的`function Range(from, to)`是一样的, 只是`class`是ES6新的syntax, 简化了用function定义class

Ex1. 

```javascript
class Range { // Range后没有(), 直接{}, params从constructor传进去
    constructor(from, to) {
        this.from = from;
        this.to = to;
    }
    // prototype method, public
    includes(x) {
        return x >= this.from && x <= this.to;
    } // method之间不用comma断开
    toString() {
        return `[${this.from}, ${this.to}]`;
    }
} // 这里也没有comma
let range = new Range(1, 3); // 和之前用function Range(from, to)一样, 都用new init
console.log(range.toString()); // [1, 3]
console.log(range.includes(7)); // false
```

- `class Range { ... }`和function定义类似, 但是Range后没有(), 直接{}, params从constructor传进去
- class里的methods之间不用comma分开, 类似nested function里的function. 区别于Range.prototype这种obj的key/val pair(function)后每个都有comma
- class Range {}的最后也不用comma, 类似function Range() {}的最后也不需要comma

##### <u>Defining Classes</u>

<span class="bold underline">Classes</span> are special <span class="bold underline">functions</span>.

Ex2.

```javascript
console.log(typeof Range); // function
console.log(typeof class {}); // function

console.log(Range instanceof Object); // true, 判断Range是否inherit from Object.prototype
console.log(Range instanceof Function); // true
```

- `typeof`返回的是undefined, number, string, boolean, object(`typeof null // object`), function
- primitive有undefined, <u>null</u>, number, string, boolean, 剩下的都是reference
- `class` is a special function
- 注意上面对于class的typeof和instanceof

<hr />

- Class Declaration
	- 上面的`class Range {}`就是class declaration.
	- <b>Hoisting</b>: 区别于function declaration, classes <u>MUST be defined before</u> they can be constructed. Following will throw `ReferenceError`

		```javascript
		const range = new Range(); // ReferenceError
    	class Range {}
		```

- Class Expression (一般不这么用, 都是class declaration)
	
	Ex3. 
	
	```javascript
	let R1 = class { // R1大写
        constructor(from, to) {
            this.from = from;
            this.to = to;
        }
    };
    console.log(R1.name); // R1
    
    let R2 = class Range {};
    console.log(R2.name); // Range,不是R2
	```
	
	- 虽然是expression, 但是variable也要首字母大写, 表示是class, 区别于普通function.
	- Hoisting: 和function expression一样, must be defined before use.

##### <u>Class Body</u>

<span class="white-on-black">Constructor</span>

A constructor can use `super` keyword to call the constructor of the super class.
	
Ex4.1
	
```javascript
class Rectangle {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.name = "Rectangle";
    }
    toString() {
        return `${this.name}: [${this.width}, ${this.height}]`;
    }
}
class FilledRectangle extends Rectangle {
    constructor(width, height, color) {
        super(width, height); // call constructor of its super class
        this.name = "Filled rectangle";
        this.color = color;
    }
}
const rect = new Rectangle(3, 4);
const filledRect = new FilledRectangle(2, 5, "red");
console.log(rect.toString()); // Rectangle: [3, 4]
console.log(filledRect.toString()); // Filled rectangle: [2, 5], 注意虽然call的parent的toString, 但是this.name是subclass的name, 不是Rectangle
```
	
- 注意上面`super`的用法. `super`写在constructor里
- 注意filledRect.toString()虽然call的是Rectangle的toString(), 但是用的是自己的this.name
- subclass的init params可以和super class完全不一样(顺序, 个数, 含义), 完全取决于subclass的super怎么call. 看下面Ex4.2.
	
Ex4.2
	
```javascript
class Span extends Range {
    constructor(start, length) {
        if (length > 0) {
            super(start, start + length);
        } else {
            super(start + length, start);
        }
    }
}
let span = new Span(3, 4);
console.log(span.toString()); // [3, 7], end=3+4
span = new Span(5, -2);
console.log(span.toString()); // [3, 5], start=5-2
```
	
- 区别于Range需要的是(from, to), Span pass的是(start, length). 通过`super`把(start, length)变回Range需要的(from, to)

<span class="white-on-black">Instance Property and Method (Prototype Method)</span>

<div class="border">
<ul>
<li>只要不是 <span class="bold"><i>static</i></span> 的就都是instance的: instance property/method. 对于instance property, 每个instance都有一份copy. 区别于<span class="bold"><i>static</i></span> property, 只有一份, 属于class本身.</li>
<li><span class="bold"><i>Static</i></span> property一般<u>不在constructor里定义, 因为constructor里的this是instance, 而static属于class</u>, 除非用ClassName.staticProp</li>
<li>Instance property/method 可以是public, 也可以是private, 取决于有没有 <span class="bold">#</span>.</li> 
	<ul>
	<li>如果是private <span class="bold">#</span>, 就只能accessibile inside its own class body (NOT subclass): this.#prop, 不能obj.#prop / obj.#method()</li>
	<li>private property<u>不能在constructor里定义</u>, 得在constructor外先declare</li>
	<li>private property<u>必须先declare(#privateProp)才能用this.#privateProp</u></li>
	<li>private property是没有inherit的, <u>无法subClass.#baseProp</u></li>
	<li>private property是不能delete的, <s>delete this.#privateProp</s></li>
	<li>如果没有 <span class="bold">#</span>, 就可以access thru obj: obj.prop / obj.method()</li>
	</ul>
<li>Instance/Static property在class里定义时都<span class="bold">不用var/const/let</span>. 直接<u>`prop1 = "instanceProp"; static prop2 = "staticProp";`</u></li>
</ul>
</div>

- Instance Property

	- Ex1 Range的`this.from`, `this.to`是instance properties. 每个instance都有一份copy: `r.from`. 区别于<u>static property是针对class的, 只有一份</u>: `Range.someStaticProp`.
	- Instance Property is added at <span class="orange bold">construction</span> time (<u>before constructor body runs</u>), 要 `new` init才会执行. 区别于static property/block, 它们are added at class <span class="orange bold">evaluation</span> time.

	Ex5.1 注意log顺序
	
	```javascript
	class MyClass {
	    static f1 = console.log(`static f1 called`);
	    static {
			console.log(this); // class MyClass, class constructor (MyClass itself)
			console.log(`static block #1 called`);
	    }
	    static f2 = console.log(`static f2 called`);
	    static {
			console.log(`static block #2 called`);
	    }
	    static f() {
			console.log(`static method f called`)
	    }
	    constructor() {
			console.log(this); // MyClass instance under construction
			console.log(`constructor called`);
	    }
	    instanceProp1 = console.log(`instanceProp1 called`);
	    instanceProp2 = "instance prop 2";
	}
	/**
	 * 在不new MyClass()的情况下, 会有如下log in order
	 * static f1 called
	 * static block #1 called
	 * static f2 called
	 * static block #2 called
	 */
		
	const myClass = new MyClass();
	/**
	 * new MyClass()之后会有如下log in order
	 * instanceProp1 called
	 * constructor called
	 */
	console.log(myClass.instanceProp2); // instance prop 2
	MyClass.f2; // undefined, 因为static f2没有return
	MyClass.f(); // static method f called. 区别于f2是var, 没有log
	```
	
	- 注意所有static prop/block出现在class evaluation time, 不需要`new` init
	- static method f() 无论有没有init都不会进, 除非直接call MyClass.f(). 区别于MyClass.f2是var, 没有log. MyClass.f()是有log的.
	- instance properties are added at construction time, 出现在`new` init之后, constructor前
	- 注意<b>static</b>的<span class="orange">`this`</span>是class constructor MyClass itself, 是class本身. 区别于constructor/instance method的<span class="orange">`this`</span>是class的instance under construction.
	
- <b>Prototype Method</b> (Getter, Setter, and other Method)
	
	Ex1 Range的`includes(x)`, `toString()`是prototype methods: `r.toString()`. 区别于static method是针对class本身: `Range.someStaticMethod()`
	
	Ex5.2
	
	```javascript
	class ClassWithGetSet {
	    #msg = "private msg"; // private instance property
	
	    // msg和#msg是不同的properties
	    get msg() {
	        return `get ${this.#msg} from getter`;
	    }
	    set msg(txt) {
	        this.#msg = txt;
	    }
		// getter without setter: test只能get 无法被set
        get test() {
            return `getter test`;
        }
	    toString() { // prototype method
	        return `msg = ${this.#msg}`; // 只要在class里就可以access private property
	    }
	}
	const msgClass = new ClassWithGetSet();
	// console.log(msgClass.#msg); // SyntaxError. class外无法access private property
	console.log(msgClass.msg); // get private msg from getter
	msgClass.msg = "updated msg";
	console.log(msgClass.msg); // get updated msg from getter
	console.log(msgClass.toString()); // msg = updated msg

	console.log(msgClass.test); // getter test
    msgClass.test = "setter test";
    console.log(msgClass.test); // getter test. 注意test没变, 因为test没有setter, 所以test是个read only, 上句没能赋值
	```

	- 注意上面private property `#msg` is ONLY accessible inside class body
	- 上面的`#msg`和`msg`是两个不同的properties
	- 注意<span class="orange">只有getter没有setter</span>的`test`, test是<span class="orange">read only</span>, 无法赋值 (赋值不报错,但是没用)

<span class="white-on-black">Static Property and Method</span>

Static members (properties and methods) are called <u>without</u> instantiating their class and <u>cannot be called through a class instance</u>.

<u>Static methods</u> are often used to create <u>utility functions</u> (eg: 用来sort的`Article.compare`, database related `Article.delete({ id: 123 }`)) or a <u>factory method</u> (eg: `Article.createToday()`) for an application or <u>database related operation</u> (search/save/delete entires form db), whereas <u>static properties</u> are useful for caches, fixed-configuration, or any other data you <u>don't need to be replicated across instances</u>.

Ex6.1

```javascript
class Article {
	constructor(name, date) {
		this.name = name;
		this.date = date;
	}
	static publisher = "O\"Reilly";
	static compare(article1, article2) {
		return article1.date - article2.date;
	}
	static createToday() { // factory method
		return new this("Today\"s Digest", new Date()); // 注意这里用的this, 等同于new Article. static里的this是class本身
	}
}
let articles = [
	new Article("A1", new Date(2022, 5, 1)),
	new Article("A2", new Date(2022, 1, 1)),
	new Article("A3", new Date(2022, 9, 1))
];

articles.sort(Article.compare); // 注意是Article.compare, 用class call
const sorted = articles.reduce((prev, cur) => {
	prev.push(cur.name);
	return prev; // 勿忘return prev, 否则push返回的是arry的长度, 第二轮的prev就变成了length
}, []);
console.log(sorted); // ["A2", "A1", "A3"]
 
console.log(JSON.stringify(Article.createToday())); // {"name":"Today"s Digest","date":"2022-05-25T22:23:32.860Z"}
console.log(Article.publisher); // O"Reilly
```

- 上面`Article.compare`是static method, 用于sort: <span class="underline-orange">`articles.sort(Article.compare)`</span>. It"s not a method of an article, but rather of the whole class. 而且是articles.sort, 不是Article.sort.
- 注意`reduce`的用法, 要return prev. 因为push返回的是length.
- `Article.createToday()`是一个<u>factory method</u>. It's not a method of an article, but a method of the whole class.
- `static createToday()`里用的是<span class="underline-orange">`new this(...)`</span>, `this`就是class本身Article.
- Static methods are also used in database-related classes to search/save/remove entries from the database, like this:

	```javascript
	Article.remove({ id: 12345 });
	```
- `Article.publisher`只有一份copy, 区别于instance prop.

Ex6.2 Static properties / methods are inherited

```javascript
class Animal {
	static category = "Animal"; // 不用放在constructor里, static, 一个class一份就够了
	static planet = "Earth";
		
	constructor(name, speed) {
		this.name = name;
		this.speed = speed;
	}
		
	run(speed = 0) {
		this.speed += speed;
		return `${this.name} runs at speed ${this.speed}`;
	}
		
	static compare(a1, a2) {
		return a1.speed - a2.speed;
	}
}
class Rabbit extends Animal {
	hide() {
		return `${this.name} hides!`;
	}
	static category = "Rabbit";
}
let rabbits = [
	new Rabbit("White Rabbit",  10),
	new Rabbit("Black Rabbit", 5)
];
console.log(Rabbit.planet); // Earth. static prop inherited from Animal
console.log(Rabbit.category); // Rabbit.

rabbits.sort(Rabbit.compare); // static method inherited from Animal
sorted = rabbits.reduce((prev, cur) => {
	prev.push(cur.name);
	return prev;
}, []);
console.log(sorted); // ["Black Rabbit", "White Rabbit"]

// instance method inheritance
console.log(rabbits[0].run()); // Black Rabbit runs at speed 5. 注意rabbits经过sort本身的arry改了
```

- 注意<span class="underline-orange">category和planet都是static prop, 一个class一份. 不用放在constructor里</span>, 否则就是每个obj都有自己的copy了
- static property (Rabbit.planet) 和method (Rabbit.compare) 都可以inherit
- static的inheritance也是follow chain (Rabbit.category)
- `sort`会改变本身的rabbits array

<span class="white-on-black">Public Fields and Methods</span>

Public Fileds包括public <u>instance</u> properties 和 public <u>static</u> properties.

Public Methods包括public <u>instance</u> methods 和 public <u>static</u> methods.

Ex7.

```javascript
class Rect {
    width; // 这跟写在constructor里this.width一样, 只是提前declare，可以此时init
    height = 0;
    heightCopy = this.height; // this是Rect instance, 不能写成heightCopy=height!! 只有定义等号左边可以省略this

    arry = [];
    arryCopy = this.arry;

    heightArry = [];
    heightArryCopy = this.heightArry;

    static category = "Rect";
    static categoryCopy = this.category; // this是Rect constructor, 最好用Rect.category

    #privateWidth;

    constructor(width, height, arry) {
        this.width = width;
        this.height = height; // 在没有=height之前, this.height=0
        this.arry = arry;

        this.heightArry.push(height);

        this.#privateWidth = width;
        // delete this.#privateWidth; // syntax error, can NOT delete private fields

        // #privateheight; // private props不能在constructor里declare
        // this.#privateHeight = height; // syntax error, #privateHeight之前没定义, can NOT use private fields before declared
    }
}
const r1 = new Rect();
/**
 * 1. 注意height是undefined但是heightCopy是0, 因为他们是primitive. 
 * heightCopy只是用height做了初始值, 后面height发生了什么和heightCopy无关. 所以虽然height变成了undefined, 但是heightCopy依然保留了初始值
 * 2. 注意heightCopy VS arryCopy
 * 虽然arryCopy是ref, 但是constructor里相当于是把this.arry指向了别的地址, 而arryCopy依然指向原来的地址[]
 * 所以虽然arry变成了undefined, 但是arryCopy没有跟着arry变, arryCopy依然是初始值
 * 3. 注意arryCopy VS heightArryCopy
 * heightArry在constructor里并没有像arry一样被重新赋值, 所以heightArry和heightArryCopy依然指向同一个地址
 * 所以heightArryCopy随着heightArry变而变
 */
console.log(r1.width, r1.height, r1.heightCopy) // undefined undefined 0
console.log(r1.arry, r1.arryCopy); // undefined []
console.log(r1.heightArry, r1.heightArryCopy); // [undefined] [undefined]
console.log(Rect.categoryCopy); // Rect

const r2 = new Rect(5, 10, [1,2]);
console.log(r2.width, r2.height, r2.heightCopy); // 5 10 0, 注意heightCopy依然是初始值0, 因为后面没有对他再赋值了
console.log(r2.arry, r2.arryCopy) // [1,2] [], 注意arryCopy依然是[]
console.log(r2.heightArry, r2.heightArryCopy); // [10] [10]

// console.log(r.#privateWidth); // syntax error, can NOT be referred outside class body
```

- 注意instance property可以在constructor<b>外</b>先declare/init然后在constructor<b>里</b>再init (width, height), 也可以只在constructor<b>外</b>declare/init (heightCopy)
- By declaring fields up-front, 可以先赋初始值 (height = 0).
- 写在最前面的<u>width/height/heightCopy没有const/let是因为他们是this.width/this.height/this.heightCopy</u>, 只是this.省略了
- 注意在外面declare的时候`heightCopy = this.height`, <span class="orange">`this`不能省略</span>. 不能写成<s>heightCopy=height</s>, 只有定义等号左边可以省略this
- 注意static的`this`和instance的`this`: 
	- `static categoryCopy = this.category`的`this`是Rect constructor. 最好不要用`this` access static, 用class access: `static categoryCopy = Rect.category`. 见Ex8.2
	- `heightCopy = this.height`的`this`是Rect instance
- 注意private property
	- private property必须<span class="orange">先declare再用, 而且declare不能在constructor里</span>，必须在constructor外: <s>`this.#privateHeight = height; // syntax error`</s>
	- private property<span class="orange">不能delete</span>: <s>`delete this.#privateWidth; // syntax error`</s>.
	- private property只能accessible inside class, 出了class就不能用了 <s>`r.#privateWidth; // syntax error`</s>
- new Rect()后, 进入constructor里, 在this.height赋值=height之前, this.height等于初始值0. 只是因为new Rect()时没有传入width和height, height是undefined, 所以r.height才是undefined
- 注意<span class="underline-orange">`r1.height`是undefined但是`r1.heightCopy`是0</span>, 因为他们是primitive. heightCopy只是用height做了初始值, 后面height发生了什么和heightCopy无关. 所以虽然height变成了undefined, 但是heightCopy依然保留了初始值. 同理`r2.heightCopy`也没有随着`r2.height`变化, 依然是0.
- 注意<span class="underline-orange">`r1.heightCopy` VS `r1.arryCopy`</span>: 虽然arryCopy是ref, 但是constructor里相当于是把this.arry指向了别的地址, 而arryCopy依然指向原来的地址[], 所以虽然arry变成了undefined, 但是arryCopy没有跟着arry变, arryCopy依然是初始值[]
- 注意<span class="underline-orange">`r1.arryCopy` VS `r1.heightArryCopy`</span>: heightArry在constructor里并没有像arry一样被重新赋值, 所以heightArry和heightArryCopy依然指向同一个地址, 所以heightArryCopy随着heightArry变而变

<span class="white-on-black">Private Fields and Methods</span>

Private Fields包括private <u>instance</u> properties 和 private <u>static</u> properties.

Private Methods包括private <u>instance</u> methods 和 private <u>static</u> methods.

Private Fields and Methods are declared using a hash `#` prefix.

Private Fields/Methods是没有inherit的

Ex8.1

```javascript
class BaseWithPrivateField {
	#privateField;
	
	constructor() {
		this.#privateField = 42;
		delete this.#privateField;   // syntax error, can NOT delete private fields
		this.#undeclaredField = 444; // syntax error, can NOT use private fields before declared
	}
}
const instance = new BaseWithPrivateField()
instance.#privateField === 42;   // syntax error, can NOT be referred outside class body
```
	
- Private fields can <u>ONLY be declared up-front</u> in a field declaration: `this.#undeclaredField = 444; // syntax error`. 区别于public fields: 之前的Rect的width/height, 即使不先declare也可以在constructor里直接赋值`this.width=width`
- Private fields不能`delete`: `delete this.#privateField; // syntax error `
- Private fields ONLY accessible inside class body

Ex8.2 注意static property and methods, 特别是在subclass里access baseclass的static property时
	
```javascript
class BaseWithPrivateField {
    #privateField;
    static #privateStatic = 12;
    static publicStatic = 22;
    constructor() {
        this.#privateField = 42;

        /**
         * 区别于前面declare的 static #privateStatic
         * 因为用的this, 所以和前面不是一个var, 虽然名字一样, static要用ClassName.static
         * 这里this.#privateStatic是一个private instance prop, 前面没有declare, 所以ERROR
         * 除非前面有 #privateStatic;
         * 
         * 同理下面的publicStatic和前面的static publicStatic不是一个var
         * base.publicStatic=40 VS BaseWithPrivateField.publicStatic
         */
        // this.#privateStatic = 12; // TypeError, cannot write private member #privateStatic to an object whose class did not declare it 
        this.publicStatic = 40; // 这个和之前的static publicStatic不是一个variable, 这个是instance prop
    }
    static getPrivateStatic1() {
        return this.#privateStatic; // 不能用this.#privateField, 因为是static, this是constructor, BaseClass.#privateField不存在, 只能access class的property
    }
    static getPrivateStatic2() {
        return BaseWithPrivateField.#privateStatic;
    }
}
class SubClass extends BaseWithPrivateField {
    #subPrivateField;
    constructor() {
        super();
        this.#subPrivateField = 23;
    }
    checkField() {
        // console.log(this.#privateField); // syntax error, private fields from base class is NOT accessible from subclass
        console.log(this.#subPrivateField); // 23

        // 不能用this.getPrivateStatic(), 因为getPrivateStatic是static, 只属于class, 这里的this是class instance
        // console.log(SubClass.getPrivateStatic1()); // syntax error, private field from base class is NOT accessible by this, even in original base class
        console.log(SubClass.getPrivateStatic2()); // 12, 是SubClass, 不是Base
    }
}
const base = new BaseWithPrivateField();
console.log(BaseWithPrivateField.getPrivateStatic1()); // 12
console.log(BaseWithPrivateField.getPrivateStatic2()); // 12

// 区别下面两个var, 虽然名字一样
console.log(base.publicStatic); // 40
console.log(BaseWithPrivateField.publicStatic); // 22

const sub = new SubClass();
sub.checkField(); // 23 12
```
	
- 对于static，最好用class access, 不要用`this`. 因为只有在static中`this`才是class constructor, 其余时候`this`都是class instance.
	- constructor中<b>不能</b>用this.#privateStatic赋值, 因为前面 `static #privateStatic`是class的. 而这里this是instance, 如果这样用, 那code认为#privateStatic是一个新的private instance prop, 前面没有declare, private field要先declare才能use, 所以会报错
	- 而且<span class="orange">static property没有必要在constructor里init</span>, 它不是每个instance一个, 是一个class一个
	- 注意区别<span class="underline-orange">constructor里的`this.publicStatic`和constructor外的`static publicStatic`, 虽然名字一样, 但不是一个var, 用法也不一样</span>: `base.publicStatic` VS `BaseWithPrivateField.publicStatic`
	- Subclass虽然继承了getPrivateStatic(), 但是得用class call, <b>不能</b>this.getPrivateStatic()
	- `SubClass.getPrivateStatic2()`是用<u>SubClass call, 不是Base</u>.
	- SubClass.getPrivateStatic1()报错, 因为subclass<b>不能</b>access private fields in its base class by using `this`, 虽然call了super(). 区别于SubClass.getPrivateStatic2()
- static method里是无法access instance property的, 因为this不同.
	- getPrivateStatic1()中<b>不能</b>this.#privateField, 因为getPrivateStatic1时static, 里面的this是class, 而#privateField是class instance的
- subclass can NOT access private fields in its base class
	- checkField()中<b>不能</b>this.#privateField

Ex9.2

```javascript
class Complex {
    #r;
    #i;
    constructor(real, imaginary) {
        this.#r = real;
        this.#i = imaginary;
    }

    // getters. c.real和c.imaginary都是read-only, 没有setter
    get real() { return this.#r; }
    get imaginary() { return this.#i; }

    // Classes should almost always have a toString() method
    toString() {
        return `${this.#r} + ${this.#i}i`
    }

    equals(that) { // 注意先查that是不是complex
        return that instanceof Complex &&
        this.#r === that.#r && this.#i === that.#i;
    }

    plus(that) {
        return new Complex(this.real + that.real, this.imaginary + that.imaginary); // this.#i和this.real一样, 都在class里
    }
    // 区别于c1.plus(c2), 对于static, 这里得用Complex.sum(c1, c2)
    static sum(c1, c2) {
        return c1.plus(c2); // 注意不是this.plus(...), static里的this时class本身
    }

    // factory functions
    static ZERO = new Complex(0, 0);
    static ONE = new Complex(1, 0);
    static I = new Complex(0, 1);
}
let c1 = new Complex(2, 3);
let c2 = new Complex(c1.imaginary, c1.real);
console.log(c1.plus(c2).toString()); // 5 + 5i
console.log(Complex.ZERO.toString()); // 0 + 0i
```

- 注意instance plus和static sum的区别, `Complex.sum(c1, c2)`和sum的定义<span class="underline-orange">`return c1.plus(c2)`</span>, 不是this.plus()
- c.real / c.imaginary是read-only, 只有getter没有setter. 这两个getters是针对private fields this.#r / this.#i
- <span class="underline-orange">每个class基本都有toString(), 大部分都有static compare()</span>, 这里有equals, 虽然equals不是static
- 注意equals里<u>先查`that instanceof Complex`</u>, 再查相等
- 注意factory functions used as predefined complex numbers (<u>Constants所以大写</u>): <u>`Complex.ZERO`, `Complex.ONE`, `Complex.I`</u>

#### <a name="add-method-to-existing-class" id="add-method-to-existing-class">9.4 Adding Methods to Existing Classes</a>

If the new String method `startsWith()` is not already defined

```javascript
String.prototype.startsWith = String.prototype.startsWith || function(str) {
    return this.indexOf(str) === 0;
};
console.log("abc".startsWith("ab")); // true
```

#### <a name="subclass" id="subclass">9.5 Subclasses</a>

- Subclasses in old way

	Ex1. create Span as a subclass of Range
	
	```javascript
	function Range(from, to) {
	    this.from = from; this.to = to;
	}
	Range.prototype.toString = function() {
	    return `[${this.from}, ${this.to}]`;
	}
	function Span(start, length) {
	    if (length >= 0) {
	        this.from = start;
	        this.to = start + length;
	    } else {
	        this.from = start + length;
	        this.to = start;
	    }
	}
	Span.prototype = Object.create(Range.prototype);
	Span.prototype.constructor = Span; // (new Span()).constrcutor指回Span, 否则指向的是Range
	    
	const span = new Span(5, -3);
	console.log(span.from, span.to); // 2 5
	console.log(span.toString()); // [2, 5], 因为前面的Span.prototype = Object.create(Range.prototype)才成立
	```
	
	- Span的constructor里set the same from/to as Range, 所以用的时候和Range一样，是span.from, span.to
	- Span是Range的subclass的关键是下面两句
		
		```javascript
		// ensure Span.prototype inherits from Range.prototype
		Span.prototype = Object.create(Range.prototype);
		// prototype.constructor back-reference Span, 所以span.constructor才是Span
		Span.prototype.constructor = Span;
		```
		
		L2保证了Span objects will inherit from both `Span.prototype` and `Range.prototype`, <u>勿忘同时也inherit了Span.prototype</u>. 思考span.toString()是因为这句才成立的.

	- 注意上面的写法只保证了Span objects will inherit Range的instance props/methods, 但是static的没有inherit. <u>There is no automatic inheriting of <b>static</b> props/methods before ES6 `extends`</u>.

- <span class="border">Subclasses with <b>`extends`</b> and <b>`super`</b></span>

	Ex2.1.1 subclass custom classes
	
	```javascript
	class Range {
	    constructor(from, to) {
	        this.from = from;
	        this.to = to;
	    }
	    static cat = "Range";
	    toString() {
	        return `[${this.from}, ${this.to}]`;
	    }
	}
	class Span extends Range {
	    constructor(start, length) {
	        if(length >= 0) {
	            super(start, start + length);
	        } else {
	            super(start + length, start);
	        }
	        // if there is a constructor present in the subclass, need to call super() first before using "this".
	    }
	    static cat = "Span";
	    toString() {
	        return `it's a span, start = ${this.from}, length = ${this.to - this.from}`;
	    }
	}
	```
	
	- 注意用`extends`时, if there is a constructor present in the subclass, <span class="orange">`super()` MUST be called before you can use "this". Leaving this out will cause a reference error</span>. 如果subclass没有constructor, one will be defined automatically for you and takes whatever values are passed to it and pass to super()
	
	Ex2.1.2 subclass traditional function-based class
	
	```javascript
	function Range(from, to) {
		this.from = from; this.to = to;
	}
	class Span extends Range {
		constructor(start, length) {
		    ...
		}
		toString() { ... }
	}
	```
	
	- Any constructor that can be called with `new` (that is, <u>it has the `prototype` property</u>) can be the candidate for the parent class.

	Ex2.2 subclass built-in classes
	
	```javascript
	class EZArray extends Array {
	    get first() { return this[0]; }
	    get last() { return this[this.length-1]; }
	}
	// 也可以 let arry = new EZArray(1,2,3)
	let arry = new EZArray(); // array init的一种方式, arry是一个empty arry
	arry instanceof Array; // true
	arry instanceof EZArray; // true
	
	// Array本身的methods都可以用
	arry.push(1, 2, 3, 4); 
	console.log(arry.pop()); // 4
	console.log(arry[1]); // 2
	    
	// 自定义的first/last
	console.log(arry.first, arry.last); // 1 3
	
	// Array的static methods也都inherit了
	console.log(Array.isArray(arry)); // true
	console.log(EZArray.isArray(arry)); // true
	```
	
	- 注意Array init的方式可以`new Array()`然后push, 也可以`new Array(1,2,3)`
	- 注意`Array.isArray()`和<span class="orange">`EZArray.isArray()`</span>的用法
	- `extends` will <span class="orange">set prototype for both ChildClass and ChildClass.prototype</span>. 注意ParentClass的static properties的继承, 这在ES6 `extends`之前是无法自动继承的

		```javascript
		class ParentClass {}
		class ChildClass extends ParentClass {}
		
		// extends做了以下两件事
		// 1. 区别于old way的继承, extends allows inheritance of "static" properties
		Object.getPrototypeOf(ChildClass) === ParentClass
		// 2. 类似old way中, Span.prototype = Object.create(Range.prototype)
		// allows inheritance of "instance" properties
		Object.getPrototypeOf(ChildClass.prototype) === ParentClass.prototype
		```
	- 注意EZArray继承了Array所有的instance props/methods + <span class="orange bold">static</span> props/methods: EZArray.isArray()

	Ex2.3 super class calls with `super`
	
	```javascript
	class Cat {
	    constructor(name) { this.name = name; }
	    speak() {
	        console.log(`${this.name} makes a noise.`);
	    }
	}
	class Lion extends Cat {
	    speak() {
	        super.speak();
	        console.log(`${this.name} roars.`);
	    }
	}
	let l = new Lion("Fuzzy");
	l.speak(); 
	// Fuzzy makes a noise.
	// Fuzzy roars.
	```
	
	- use `super` to call corresponding methods of super class: 注意上面<span class="underline-orange">`super.speak()`</span> call了parentClass的speak

`new.target`

- 在normal function call中, `new.target` is `undefined` in functions that are invoked without the `new` keyword. 

	```javascript
	function Foo() {
	    if(!new.target) {
	        throw `Foo() must be called with new`; 
	    }
	    console.log(new.target.name);
	}
	try {
	    Foo();
	} catch (err) {
	    console.log(err); // Foo() must be called with new
	}
	new Foo(); // Foo
	```

- In class constructors, `new.target` refers to the constructor that was directly invoked by `new`. This is also the case if the constructor is in a parent class and was delegated from a child constructor. A well-designed superclass should not need to know whether it has been subclassed, but it might be useful to be able to use <span class="orange">`new.target.name`</span> in logging messages, for example.

	```javascript
	class A {
	    constructor() {
	        console.log(new.target.name); // new.target是class A/B
	    }
	}
	class B extends A {} // constructor will be generated automatically with super()
	new A(); // A
	new B(); // B
	```


 
#### <a name="arry-methods" id="arry-methods">7.8 Array Methods</a>
##### <a name="arry-sort" id="arry-sort">7.8.6 Array Sorting Methods (`sort`, `reverse`)</a>


### <a name="async-await" id="async-await">async/await</a>

```javascript
async function task1() {
  console.log('task1 start');
  await task2();
  console.log('task1 end');
}

async function task2() {
  console.log('task2 start');
  await Promise.resolve();
  console.log('task2 end');
}

task1();
console.log('outside');
```

log will be

```sql
task1 start
task2 start
outside
task2 end
task1 end
```

JavaScript uses an event loop and a mircrotask queue to handle asynchronous behavior.
- task1() starts and hits await task2(), task1 suspends
- event loop picks up next task - task2 is called immediately
- Inside task2, execution continues until its own await. At that point, task2 suspends and returns a Promise (still pending).
  - `await Promise.resolve()` will always resolve in the next microtask, not immediately in the current call stack. and will wait until the current synchronous code to finish before jumping back
- That Promise is returned up to task1, which is also awaiting it. So now task1 suspends as well, because it’s waiting for the result of task2.
- log outside

### <a name="input-debounce" id="input-debounce">input change debounce</a>

[debounce/throttle](./debounce.html)

- pair `debounce` with `input` event
  - `input` fires every time the value of the input changes
  - `change` fires only after input loses focus or the user confirms the edit (e.g., pressing Enter in a text box).

For search boxes or filtering UIs, you want to react as the user types, but not on every keystroke — hence `debounced` and  `input` is the perfect combo.

- for `debounce`, only the most recent action triggers the callback. eg: user types in "abc" and pauses, `debounce` shouldn't be triggered when "a"/"ab" is in, but only when "abc" is done. so we need `clearTimeout` to cancel previous schedule.

```javascript
// without clearTimeout
function debounce(callback, delay) {
    return function(...args) {
        setTimeout(() => callback(...args), delay);
    };
}

const log = debounce(console.log, 500);
log("A"); // schedules "A"
log("B"); // schedules "B"
log("C"); // schedules "C"
// result: prints A, B, C — all after 500ms (BAD for debounce)

// with clearTimeout
function debounce(callback, delay) {
    let id;
    return function(...args) {
        clearTimeout(id); // cancel any previous timer
        id = setTimeout(() => callback(...args), delay); // schedule a new one
    };
}

const log = debounce(console.log, 500);
log("A");
log("B");
log("C");
// result: only "C" prints (GOOD for debounce)
```

- `setTimeout(fnRef, delay)` expects a function reference, not a function call

```javascript
setTimeout(callback(...args), delay); 
// This calls callback(...args) immediately — instead of scheduling it to run later

setTimeout(() => callback(...args), delay);
// giving setTimeout the arrow function to call later
```
### <a name="virtualization-windowing" id="virtualization-windowing">Big data with virtualization</a>

The scrolling list that only renders a subset of items (recycling a fixed pool of rows) — is called <b>virtualization</b> or <b>windowing</b> or <b>DOM virtualization</b>, not "Virtual DOM".

The <b>Virtual DOM</b> (used by frameworks like React, Vue, etc.) is something completely different:
- It's a JavaScript data structure (a lightweight object tree) that represents what the DOM should look like.
- The framework compares (diffs) the new virtual tree against the previous one, then updates the real DOM minimally.
- Developers don't directly touch the DOM — the framework handles it.

To render 100,000 rows smoothly by windowing (only mounting the items in view):
- Total height: we compute totalRows * ROW_HEIGHT but don’t render all rows.
- Visible window: based on scrollTop, we calculate startIndex/endIndex.
- Spacers: paddingTop and paddingBottom visually position the windowed items correctly.
- Overscan: renders a few rows outside the viewport to avoid flicker during fast scrolls.

[big-data-list.html](./big-data-list.html)

textNode, innerText, innerhtml

Immediately Invoked Function Expression (IIFE), and it’s mainly about scoping and isolation

```javascript
let pool = []; // becomes window.pool

(function () {
    const pool = []; // private
})();
```

- whatever inside IIFE runs right away, once, when the file loads
- creates its own local scope, self-contain, avoids polluting the global namespace, unless explicitly attach to `window`
- like a mini-module, not accessible from `window.pool`

Don't cache rendered nodes
- Keeping thousands of detached nodes in memory can be heavier than re-creating a few dozen visible ones.
- You have to manage state carefully (e.g., clear event listeners, avoid leaks).
- The browser is already good at creating/destroying lightweight elements quickly.

Instead, recycles a pool of DOM nodes and renders only the visible window. Uses `transform: translateY(...)` to move nodes (cheap for the browser), `requestAnimationFrame` to throttle scroll updates, and supports `OVERSCAN` for smoothness.


### <a name="html-css-gotcha" id="html-css-gotcha">HTML and CSS gotcha</a>

- flexbox: left with fixed width, right takes up rest of space

  ```html
  <div class="parent">
      <div class="left">left</div>
      <div class="right">right</div>
  </div>
  ```
  ```css
  .parent {
      display: flex;
      gap: 10px;
      justify-content: center; /* center horizontally */
      align-items: center;     /* center vertically */
  }
  .left {
      width: 50px;
      flex: 0 0 auto; // no shrink/grow, fixed width
  }
  .right {
      flex: 1 1 auto; // take the rest of space
      min-width: 0;
  }
  ```

- IntersectionObserver: `item.isIntersecting` means whether target is overlapping with viewport
  - on page load: mag is fully visible inside viewport -> `item.isIntersecting = true`
  - when scrolls and mag is out of viewport -> `item.isIntersecting = false`

  ```javascript
  onMount() {
      const initStickyObserver = () => {
          const refinementRoot = document.getElementById('brw-refinement-root');

          // sticky when refinement is out of viewport
          if (refinementRoot) {
              const observer = new IntersectionObserver(([item]) => {
                  this.state.isSticky = !item.isIntersecting;
              });

              observer.observe(refinementRoot);
          }
      };

      if (this.isMiniVersion) {
          if (document.readyState === 'complete') {
              initStickyObserver();
          } else {
              window.addEventListener('load', initStickyObserver);
          }
      }
  }
  ```


