---
title: "I'd Rather Be a Detective Than a Fortune Teller"
date: "2026-08-30"
excerpt: "i'm a programmer, not a mind reader"
tags: ["programming", "low-level", "languages", "debugging", "rant", "zig"]
---

i don't give a fuck if a language gives me footguns.

seriously.

if i shoot myself in the foot, but the language actually tells me what happened, then whatever. give me a medkit and i'll patch myself up and keep walking.

what i hate is when the program explodes and the language just stares at me and goes

> [Segmentation fault](https://en.wikipedia.org/wiki/Segmentation_fault)

bro.

what the fuck am i supposed to do with that. that's not an error message, that's a shrug wearing a monospace font.

this is probably why i have this weird preference for "unsafe" languages. i'd rather use something that lets me fuck up, but actually tells me _how_ i fucked up, than something that tries to protect me and then gives me absolutely nothing when it still goes wrong anyway.

i'd rather be a detective than a fortune teller.

## C is not frustrating because it's unsafe

people always bring up C's footguns.

[use-after-free](https://en.wikipedia.org/?title=Use-after-free&redirect=no). [buffer overflows](https://en.wikipedia.org/wiki/Buffer_overflow). [dangling pointers](https://en.wikipedia.org/wiki/Dangling_pointer). [undefined behavior](https://en.wikipedia.org/wiki/Undefined_behavior). whatever, i've heard the whole lineup.

i don't really care about that part.

those are problems, sure. but they're not what makes C frustrating to me.

what pisses me off is how vague everything becomes the second something breaks.

you dereference some cursed pointer and suddenly:

> [Segmentation fault](https://en.wikipedia.org/wiki/Segmentation_fault)

cool. cool cool cool.

where?

why?

which pointer?

what value did it have?

what operation caused it?

what happened??

now i need to summon an entire forensics team just to reconstruct a crime that happened inside my own RAM.

and yeah, debuggers and sanitizers are great. they make C dramatically more usable. gdb is basically doing the language's job for it at that point.

but that's kind of my point. why am i assembling a whole detective agency just to figure out what my own program did five milliseconds ago.

## i want the code to explain itself

this is also why i dislike a chunk of C's design.

take structs.

```c
struct File {
    int fd;
};
```

cool, a box with a number in it. but you can't attach behavior to that box in the language itself.

so now you get:

```c
file_read(&file);
file_close(&file);
file_seek(&file);
```

and those functions are "related" to `File` because somebody typed `file_` at the start of the name and prayed. there's no actual semantic relationship there. it's vibes-based association.

it's basically [hungarian notation](https://en.wikipedia.org/wiki/Hungarian_notation). except somehow worse, because instead of slapping a cute little type tag like `sz` or `n` on the front, you're prefixing every single identifier with the entire fucking type name like it's a legal disclaimer.

then there's headers.

```c
#include "something.h"
```

which is really just:

> hey compiler, paste this other file here and don't ask questions

and now a hundred names are floating around your file like ghosts and you're just supposed to know where they came from. it's like `.d.ts` files, except somebody fed the module system into a wood chipper first.

## this is why zig clicked for me

[zig](https://ziglang.org/) doesn't magically make low-level programming safe. that's not even what i'm asking for.

what i want is for the low-level shit to be **visible**.

allocators are probably my favorite example of this actually working.

you don't just blindly call some magic global allocator and hope the universe is feeling generous today. you pass one around. you choose one on purpose, like an adult.

- [arena](https://ziglang.org/documentation/0.16.0/std/#std.heap.ArenaAllocator)? sure.
- fixed buffer? go off.
- debug allocator that snitches on you the moment you leak memory? even better.

here's the 0.16 version of that debug allocator actually catching me in the act:

```zig
const std = @import("std");

pub fn main() !void {
    var debug_allocator: std.heap.DebugAllocator(.{}) = .init;
    defer {
        const status = debug_allocator.deinit();
        if (status == .leak) {
            std.debug.print("caught you. you disgusting, useless (pun intended) leaked memory. shame on you.\n", .{});
        }
    }

    const allocator = debug_allocator.allocator();

    const numbers = try allocator.alloc(u32, 5);
    // "forgetting" to free on purpose, for science
    // defer allocator.free(numbers);

    numbers[0] = 42;
    std.debug.print("first number: {d}\n", .{numbers[0]});
}
```

comment out that `defer allocator.free(numbers)` and run it, and the allocator doesn't just crash into a wall and go silent about it. it tells on you. it says "hey, this exact allocation, right here, is still alive and you never let it go." that's not a fortune teller vaguely gesturing at doom. that's a detective handing you the case file.

that's fucking useful. because now if i fuck up, i have evidence. i can make the program unsafe. i can make it manual. i can make it do genuinely unhinged things with memory. just **tell me what happened when i do it.**

> note: this uses the [zig 0.16 allocator api](https://ziglang.org/documentation/0.16.0/std/#std.heap.DebugAllocator) — `DebugAllocator` is initialized with `.init` instead of `{}` now, since a chunk of allocator/writer/io internals got reworked between 0.15 and 0.16. if you're on an older zig and this looks unfamiliar, that's why.

## safety isn't the only thing that matters

i think people sometimes design languages like the only goal is preventing programmers from making mistakes.

that's important. genuinely, it is.

but there's another thing i care about just as much:

**observability.**

a language shouldn't only try to prevent failures. it should help you understand the ones that slip through anyway. because something will always slip through. that's not pessimism, that's just what software is.

and when it does, i don't want:

> something went wrong

i want the crime scene.

give me the location. give me the state. give me the values. give me the stack. give me the context. give me enough information that i can rebuild the whole timeline like i'm pinning red string to a corkboard.

i don't need a language that promises i'll never shoot myself in the foot. that promise is a lie anyway, someone always finds a way.

i need one that tells me **which foot i shot, what i shot it with, and where the bullet ended up.**

that's the whole difference between being a detective and being a fortune teller.

anyway. good bye, nerds.
