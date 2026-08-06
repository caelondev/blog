---
title: "they become what you think they should be"
date: "2026-08-06"
excerpt: "binaries are kewl"
tags: ["binary", "low-level", "computer-science", "rant"]
---

okay so i was staring at a single byte the other night for way longer than a normal person should, and somehow that turned into a full blown crisis about what a computer even is. figured i'd just write it out instead of keeping it to myself like a normal person.

so. binaries. everyone knows the "1s and 0s" thing. cool. fine. but that's not actually what's happening down there, it's just the story we tell so nobody has to think about voltage for a living. under the hood it's literally just electricity, high or low, on or off. that's the whole trick. that's it. i genuinely mean that's it.

we slap `1` and `0` labels on top because saying "5 volts vs 0.2 volts across a transistor gate" out loud in a lecture would get everyone to drop the class immediately. a bit isn't a number. it's a decision. flipped, or not flipped. no in between.

anyway here's the part that actually fucked with my head:

**a bit means literally nothing on its own.**

take `1000011`. seven little switches, some on some off, minding their own business. by itself, that's all it is. it has no identity. no meaning. nothing. the meaning only shows up the second something, a program, a cpu, you, decides to read it a certain way. the bits themselves genuinely do not care.

| interpretation          | context                                          | result                                                                                          |
| ----------------------- | ------------------------------------------------ | ----------------------------------------------------------------------------------------------- |
| unsigned decimal        | plain binary                                     | `67`                                                                                            |
| hexadecimal             | if you'd written it as `43` in hex and converted | also `67`. coincidence. don't overthink it                                                      |
| ASCII                   | text encoding                                    | `C`                                                                                             |
| x86-64 opcode           | disassembler context, right byte alignment       | could decode as part of `inc ebx`, or something completely different depending on its neighbors |
| two's complement signed | if the width were different                      | could flip straight into negative territory                                                     |

same seven switches. five different identities. nobody touched the bits. we just kept showing up with a different lens and going "okay today you're a letter." the bit had zero input in this process.

wait ok but why does that even work though. why can we just decide what a bit "is" and have that be true.

turns out it's because nothing in the hardware actually enforces meaning. the cpu doesn't know what a `.png` is. it doesn't know what an `int` is. it doesn't know what _anything_ is. it's just moving switches around and executing instructions on whatever byte pattern shows up next. computers are unbelievably obedient and have zero survival instincts. you hand it garbage and tell it "this is an instruction," and it will absolutely try to execute your fucking garbage, no hesitation, no second guessing, right up until everything explodes.

this is also why file formats exist. a `.png`, a `.zip`, an `.exe`, all of it is just streams of these switches with no self awareness. the only reason your os knows to open one in an image viewer and the other in winrar is that somewhere, someone agreed on a rule: "if the first few bytes look like this, treat everything after as that." magic numbers. header signatures. basically vibes, except the vibes are load bearing and if you mess with them your file just refuses to open and you get to enjoy an error dialog for the rest of your night.

## okay but pointers though

if a bit's identity is just whatever we decide it is, pointers are where this gets genuinely funny to me. a pointer isn't special. it's not some little arrow floating above your ram like the diagrams love to pretend. a pointer is just a number. that's the whole secret. it's a number that happens to be a memory address, and the only reason it "points" at anything is because your program agreed to treat that specific number as a location instead of a value.

zig example because i've been living in zig lately:

```zig
const std = @import("std");

pub fn main() void {
    var x: u32 = 67;
    const ptr: *u32 = &x;

    std.debug.print("value of x: {}\n", .{x});
    std.debug.print("address of x: {*}\n", .{ptr});
    std.debug.print("value through ptr: {}\n", .{ptr.*});
}
```

`x` is just a byte pattern in memory. same deal as our `1000011` from earlier. `ptr` is also just a byte pattern. the cpu does not treat `ptr`'s bits any differently than it'd treat `x`'s bits. same universe of switches, on and off, no special pointer flavored electricity happening anywhere. the only thing making one of them an address and the other a value is zig's type system insisting really hard that it's true.

and if you're feeling unhinged, which i was, you can just rip the mask off and print the raw number:

```zig
const addr: usize = @intFromPtr(ptr);
std.debug.print("ptr as a plain number: {}\n", .{addr});
```

that's it. that's the entire secret. some boring number like `140732938473528` that the os handed out because that's apparently where it felt like putting `x` today. i still can't believe that's genuinely all a pointer is. pointers are just numbers wearing fake mustaches. there's no ceremony at the hardware level. the ceremony is entirely zig going "no you can't add 5 to this, it's a `*u32` not a `usize`" while underneath, it's doing the exact same electrical nonsense as literally everything else in memory.

and yeah this is exactly why dangling pointers ruin your week:

```zig
var y: u32 = 43;
const dangling: *u32 = &y;
// pretend y goes out of scope here
// dangling.* is now anyone's guess
```

dereference a garbage address, one that isn't pointing at anything your program actually owns anymore, and the cpu will happily go read whatever's sitting there. it has no concept of "valid pointer" vs "random leftover number that used to mean something." it just does what it's told, and BOOM, segfault, or worse, no segfault at all and you just get quietly handed garbage data that looks plausible enough to ruin your afternoon. the storage device couldn't give less of a shit either, it's just holding bytes, it has zero opinion about your lifetime bugs.

so yeah. pointers, addresses, all of it, same rule as before. a chunk of bits with zero opinions about what it's supposed to be, sitting there until your program walks up and decides "you're an address now." it's `1000011` all over again wearing a fancier hat.

anyway. that's basically the whole shit. bits don't have identities, pointers aren't magical, and computers are just extremely obedient idiots doing exactly what we tell them regardless of whether what we told them makes any sense at all.

go hug a transistor or something.
