---
title: "Intro to the Iglot Programming Language"
date: "2026-11-24"
excerpt: "i couldn't find a type safe, fast scripting language that wasn't a mess, so i got lazy and made my own. here's a tour of it"
tags: ["iglot", "programming-languages", "compilers", "tutorial"]
---

this is a walk through iglot, top to bottom, with code you can read as you go. iglot is still a work in progress, so some of what's here will grow.

i'll explain why it exists first, then we'll get to the code.

## contents

1. [why does this exist](#why-does-this-exist)
2. [hello, world](#hello-world)
3. [comments](#comments)
4. [types](#types)
   - [primitive types](#primitive-types)
   - [non-primitive types](#non-primitive-types)
5. [variables](#variables)
6. [literals and operators](#literals-and-operators)
   - [literals](#literals)
   - [arithmetic](#arithmetic)
   - [comparison](#comparison)
   - [logical](#logical)
7. [control flow](#control-flow)
   - [if / else](#if--else)
   - [loops](#loops)
8. [functions](#functions)
   - [declaring](#declaring)
   - [returning](#returning)
   - [calling](#calling)
9. [modules and imports](#modules-and-imports)
   - [the module header](#the-module-header)
   - [importing](#importing)
   - [aliases](#aliases)
   - [module rules](#module-rules)
10. [arrays](#arrays)
    - [bare braces](#bare-braces)
11. [structs](#structs)
    - [declaring](#declaring-1)
    - [creating](#creating)
    - [reading and writing members](#reading-and-writing-members)
12. [nullables](#nullables)
13. [built-ins](#built-ins)
14. [reading compiler errors](#reading-compiler-errors)
15. [putting it together](#putting-it-together)
16. [where to go from here](#where-to-go-from-here)

## why does this exist

i wanted a scripting language that's type safe and fast. not one or the other. both.

i couldn't find one i liked. everything i looked at was bloated and unreadable.

i tried js and python. they're fine, but on their own they aren't enough. typescript is the usual fix for js, but it bloats my file tree, so that was out too.

and since i was too lazy to learn another language, i made one myself. lmao.

so that's iglot. small, typed, and hopefully readable. i wrote it in zig, and the source is [on codeberg](https://git.caelondev.net/repos/iglot). the tour documentation lives in the same repo at `docs/tour.md`. you don't need to know it already. there are a few quirks i'll point out as we go.

## hello, world

every program starts at `main`. save this as `main.iglot`:

```iglot
module main;

fn main() void: {
  println#({ "Hello, World!" });
}
```

four things in those few lines are worth slowing down for.

**every file starts with `module`.** that first line says "this file is a module called `main`", and the name has to match the filename. there's a whole section on modules later. for now just know it always goes first.

**blocks start with a colon.** functions, `if`, `loop` and `struct` all follow the same shape: the header, a `:`, then a `{ ... }` body. you'll see it everywhere.

**`void` is a return type.** `main` returns nothing, so it says so.

**`println#` ends with a `#`.** that marks a built-in, a function the compiler provides, so you can tell what's yours from what's the compiler's. also notice the argument is wrapped in braces: `{ "Hello, World!" }`. `println#` and `print#` take any number of values, and the braces hand them over as a group. more on braces in the arrays section.

## comments

comments start with a double dash and run to the end of the line:

```iglot
println#({ ":)" }); -- this is a comment
```

## types

### primitive types

iglot has six primitive types:

| Type      | Meaning         |
| --------- | --------------- |
| `int`     | 64-bit integer  |
| `wideint` | 128-bit integer |
| `float`   | 32-bit float    |
| `double`  | 64-bit float    |
| `bool`    | `true` / `false`|
| `string`  | Text            |

an `int` is 64 bits and a `wideint` is 128 bits, so if you need more room, there it is.

### non-primitive types

then there are the non-primitive types, built from other types or describing something special:

| Type       | Meaning                                                            |
| ---------- | ------------------------------------------------------------------ |
| `void`     | Return type of functions that return nothing                       |
| `[n]T`     | Array of `n` elements of type `T` (size known at compile time)     |
| `fn (...)` | Function type, carried by identifiers that are functions           |
| `const T`  | Constant                                                           |
| `fin T`    | Final                                                              |
| `?T`       | Nullable `T`                                                       |
| `null`     | The type of the `null` value                                       |

function types are written like this:

```iglot
fn (type, type, ...) ret_type
```

so a function that takes two `int`s and returns an `int` has the type `fn (int, int) int`. you'll run into these in compiler messages and when reading about built-ins.

## variables

two ways to declare a variable. they only differ in whether you spell out the type:

```iglot
x :: int = 10;        -- explicit type
x :: const int = 10;  -- constant variable
x :: fin int = 10;    -- final variable
x ::= 10;             -- inferred type
x = 20;               -- reassign
```

read `::` as "is of type". so `x :: int = 10` is "x, of type int, equals 10". `::=` leaves the type out and lets the compiler work it out from the value. once the variable exists, plain `=` reassigns it.

## literals and operators

### literals

literals are what you'd expect:

```iglot
10; -100;        -- integers
10.0; -50.5;     -- floats
"strings";       -- strings
true; false;     -- booleans
null;            -- null
```

### arithmetic

```iglot
1 + 1;   -- addition
1 - 1;   -- subtraction
1 * 1;   -- multiplication
1 / 1;   -- division
```

### comparison

```iglot
1 > 1;    -- greater than
1 < 1;    -- less than
1 >= 1;   -- greater than or equal to
1 <= 1;   -- less than or equal to
1 == 1;   -- equal to
1 != 1;   -- not equal to
```

### logical

logic uses words instead of symbols (except `!`):

```iglot
!false           -- NOT
true and true    -- AND
true or false    -- OR
```

## control flow

### if / else

```iglot
if x != null: {
  -- do something
} else if 10 == 50: {
  -- do this
} else: {
  -- something else
}
```

same colon-then-block shape as everything else. if you only need one statement, you can skip the braces:

```iglot
if cond: x = 10;
else if cond_2: return false;
else: return true;
```

### loops

right now iglot has one loop, and it's called `loop`. it runs forever until you `break`:

```iglot
loop: {
  println#({ "THIS RUNS FOREVERRRRRRR!!!" });
  break; -- only allowed inside loops
}
```

`break` is the way out, and it's only allowed inside a loop. more loops are coming, but `loop` is the one that exists today. for now, if you want a counted loop, build one out of a variable, a condition and a `break`:

```iglot
count ::= 0;
loop: {
  if count == 3: break;
  println#({ count });
  count = count + 1;
}
```

## functions

### declaring

declare a function with `fn`, a name, typed parameters, a return type, then a colon and a body:

```iglot
fn main() void: {
  -- we're in a function
}

fn add(x :: int, y :: int) int: {
  return x + y;
}
```

parameters use the same `name :: type` form as variables, so there's only one syntax to remember.

### returning

`return` is only allowed inside functions, and it's optional in `void` functions:

```iglot
fn main() void: {}
fn add(a :: int, b :: int) int: {
    return a + b;
}
```

### calling

calling one looks like you'd expect:

```iglot
add(1, 2);
```

note the difference from built-ins. your own functions use plain parentheses, and built-ins carry the `#`. and if the function lives in another file, you call it through that file's module name. that's coming up next.

## modules and imports

so far everything has been one file, but real programs don't stay that way. so iglot has modules. every file is a module, and every module has its own scope, so two files can both have a function called `helper` and nothing breaks.

### the module header

every file says what it is on its first line:

```iglot
module math;
```

a few rules for it:

- it comes before everything else. comments above it are fine.
- it's required in every file.
- the name has to match the filename without the extension. `math.iglot` has to say `module math;`, otherwise you get a name mismatch error.
- files end in `.iglot`.

### importing

`import` goes right after the header, before any declarations. say we have a `math.iglot`:

```iglot
-- math.iglot
module math;

fn add(a :: int, b :: int) int: {
  return a + b;
}
```

and a `main.iglot` next to it that uses it:

```iglot
-- main.iglot
module main;

import math;

fn main() void: {
  println#({ math.add(1, 2) });   -- 3
}
```

`import math;` binds the name `math`, and you reach things inside it with a dot: `math.add`. you never write a bare `add`, so an import can't collide with your own names.

imported functions are just values, so they work anywhere a function does:

```iglot
sum :: fn (int, int) int = math.add;
println#({ sum(50, 100) });   -- 150
```

### aliases

if the module's name is long, or clashes with something, give the import a different name with `::`. same operator you use for declarations:

```iglot
import m :: math;

fn main() void: {
  println#({ m.add(1, 2) });
}
```

the alias goes on the left and the module on the right, so read it as "`m` is `math`". once you alias something, only the alias exists. after `import m :: math;` the name `math` isn't bound anymore.

### module rules

- **one file is one module.** imports are looked up by name next to the importing file, so `import math;` loads `math.iglot` from the same directory.
- **each module is loaded once.** if two files import the same module, they share it. its top-level variables are initialized once, before the importing module's own.
- **everything at the top level is importable** (functions, variables and structs). visibility modifiers are planned.
- **no import cycles.** if `a` imports `b` and `b` imports `a`, the compiler tells you and shows the chain.
- **a module is a namespace, not a value.** `x ::= math;` is an error. always use it as `math.something`.
- **missing names are errors.** `math.nope` tells you the module has no such member, and importing a file that doesn't exist tells you the module can't be found.
- **two imports can't bind the same name.** alias one of them.
- **built-ins need no import.** `println#` and friends belong to the compiler, not to any module.
- **only functions and variables are reachable through a module for now.** using another module's struct as a type (`math.Vec`) isn't supported yet.

## arrays

arrays have a fixed size and are zero-indexed. `[5]int` means "five ints". you read an element with `.[i]`:

```iglot
[3]int{ 1, 2, 3 };               -- array literal

x :: [5]int = { 10, 20, 30, 40, 50 };
println#({ x.[2] });             -- 30
```

yes, there's a dot before the bracket. it's `.[i]`, not `[i]`.

### bare braces

here's the thing i said i'd come back to. a pair of braces `{ ... }` on its own doesn't mean anything until the compiler knows what you're building. **the declared type decides** whether it becomes an array or a struct:

```iglot
array :: [3]int = {
  1,
  2,
  3,
};
```

the left side says `[3]int`, so the braces on the right are an array. trailing commas are allowed, so adding an element never means touching the line before it.

## structs

### declaring

declare a struct with named, typed members:

```iglot
struct Person: {
  name :: string,
  age :: int,
}
```

### creating

create one with the same bare braces, this time with `.field = value` entries:

```iglot
p :: Person = {
  .name = "Bob",
  .age = 30,
};
```

### reading and writing members

`p` is declared as a `Person`, so the compiler knows those braces build a struct. read and write members with a dot:

```iglot
println#({ p.name });   -- Bob
p.name = "Alice";
```

## nullables

put `?` in front of a type to allow `null`, and use `.?` to unwrap:

```iglot
p :: ?Person = {
  .name = "Bob",
  .age = 30,
};

println#({ p.?, p.?.name });   -- unwrap the value, or a member through it
```

unwrapping a `null` crashes the program:

```iglot
p = null;
println#({ p.? });             -- Crash!!! (unwrapping null)
```

so check first:

```iglot
if p != null: {
  println#({ p.?.name });
}
```

that's the whole nullable story. `?` to allow it, `!= null` to check it, `.?` to unwrap it.

## built-ins

built-ins are called with a `#` after the name. here's the list so far, with each one's type:

```iglot
println#({ "Hello, World!" });         -- fn ([UNBOUNDED]any) void
print#({ "Hello!", "Bye!" });          -- fn ([UNBOUNDED]any) void
prompt#("Say something! ");            -- fn (string) string

parse_to_int#("123");                  -- fn (string) int
parse_to_wideint#("123");              -- fn (string) wideint
parse_to_float#("3.14");               -- fn (string) float
parse_to_double#("3.1415926535");      -- fn (string) double

fetch#("https://example.com");         -- fn (string) ?FetchResult

type_of#(123);                         -- fn (any) string
```

a few things stand out:

- `println#` and `print#` take any number of values of any type, which is why you hand them a braced group.
- `prompt#` shows a message and gives back what the user typed, as a `string`.
- the `parse_to_*` functions turn strings into numbers.
- `fetch#` returns a nullable `?FetchResult`, so a failed request is handled with the nullable rules above.
- `type_of#` gives you a type's name as a `string`.

## reading compiler errors

you'll see a few types in error messages that you can't write yourself:

| Type     | Purpose                                                                        |
| -------- | ------------------------------------------------------------------------------ |
| `any`    | Used by built-ins that accept any non-void type                                |
| `err`    | Poison type for declarations that failed, which prevents cascading type errors |
| `number` | Special type used for error messages                                           |

`err` is the useful one to know about. when a declaration fails to type-check, the compiler marks it `err`, so everything that depends on it doesn't spit out its own pile of follow-up errors. if you get one real error and no avalanche, that's why.

## putting it together

a small program using most of what we covered: two modules, a struct, a nullable, a function, a loop, and a built-in. first, a tiny helper module:

```iglot
-- math.iglot
module math;

fn add(a :: int, b :: int) int: {
  return a + b;
}
```

and the main file, next to it:

```iglot
-- main.iglot
module main;

import math;

struct Person: {
  name :: string,
  age :: int,
}

fn greet(p :: ?Person) void: {
  if p != null: {
    println#({ "Hello,", p.?.name });
  } else: {
    println#({ "Nobody here." });
  }
}

fn main() void: {
  bob :: ?Person = {
    .name = "Bob",
    .age = 30,
  };

  greet(bob);

  count ::= 0;
  loop: {
    if count == 2: break;
    greet(null);
    count = math.add(count, 1);
  }
}
```

run `main.iglot` and the compiler loads `math.iglot` for you, because `main` imports it.

## where to go from here

that's the tour so far: six primitives, arrays, structs, nullables, a loop, modules, and a handful of built-ins. it's all still a work in progress, so expect it to grow. every piece uses the colon-then-braces shape from the very first function.

go write something. if the compiler yells at you, it's probably right.

> (P.S. i'll try to keep updating this post everytime theres a new iglot update :3)
