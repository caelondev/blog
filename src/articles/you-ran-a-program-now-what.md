---
title: "You ran a program. Now what?"
date: "2026-08-13"
excerpt: "what actually happens between running a binary and your code starting?"
tags: ["low-level", "computer science", "cpu"]
---

# what actually happens when you run a binary

i built a [16-bit cpu emulator](https://codeberg.org/caelondev/cael-16) recently. nothing complex, just my own instruction set, registers, memory, and a fetch-decode-execute loop. (still very much a work in progress as i'm writing this btw, so don't go judging the code too hard)

building it made something obvious: a cpu is literally just reading bytes and turning them into operations.

stream of bytes in, state changes out.

that's the whole mechanism.

i thought about writing a post explaining how that works at the emulator level. but that's too narrow. most people don't care about my custom instruction set.

what's actually interesting is that your real computer does the same basic thing.

when you run a binary, those bytes eventually become instructions executed by a cpu.

except there's a whole lot of setup between:

> `./program`

and

> "okay cpu, here's your first instruction."

so let's figure out what actually happens.

## the kernel parses the binary

when you execute a binary, the operating system has to figure out what the hell it is first.

on linux, executables are usually ELF files. macos uses mach-o. windows uses PE. the formats are different, but they all solve roughly the same problem:

**how do i turn this pile of bytes on disk into something the operating system can execute?**

the executable contains metadata describing things like:

- which architecture it's meant for
- where its loadable parts are
- what permissions those parts need
- where execution should begin
- whether another program, such as a dynamic linker, needs to be involved

for ELF, this information lives in things like the ELF header and program headers.

think of the binary as a blueprint.

the actual program isn't running inside the file. the file is just sitting there, completely unaware that you exist.

it's basically this pipeline:

<img src="/assets/posts/you-ran-a-program-now-what/binary-to-kernel-pipeline.jpg" alt="kernel loading a binary pipeline"/>

_before you comment anything, yes that's a screenshot from my terminal lol. i'm too lazy to draw. expect other diagrams to be that too._

the kernel reads the executable, checks that it makes sense for the current system, creates a new process address space, maps the required parts of the binary into memory, and prepares the initial execution environment.

there's an important detail here though.

the kernel doesn't do **all** of the work itself.

for a dynamically linked executable, the ELF file can specify an interpreter through its `PT_INTERP` program header. this is usually a path to the system's dynamic linker, something like:

```text
/lib64/ld-linux-x86-64.so.2
```

the kernel loads that interpreter and transfers control to it.

the dynamic linker then does its own work before your program gets to run properly.

we'll get there.

## memory layout

once the process is being created, the operating system needs to give it an address space.

this is where things start getting weird.

your program doesn't normally work directly with physical RAM addresses. it gets its own **virtual address space**, and the cpu's memory-management hardware translates those virtual addresses into physical memory.

the executable's contents are mapped into that address space with different permissions.

a simplified picture looks something like this:

<p>
<img src="/assets/posts/you-ran-a-program-now-what/stack-memory-layout.jpg" alt="simplified process memory layout"
/>
</p>

this is a useful mental model, but don't take it literally.

modern processes usually have a lot more going on: shared libraries, memory-mapped files, guard pages, thread stacks, the vDSO, ASLR, and plenty of other things that would make this diagram look like someone dropped a box of spaghetti onto it.

the important part is that different regions of the process have different purposes and permissions.

the **text** region contains executable code.

the **data** region contains initialized global and static data.

the **bss** represents zero-initialized global and static data.

read-only data can contain things like constants and string literals.

and the stack and heap provide places for runtime data to live.

the stack usually grows downward and the heap is commonly described as growing upward.

which makes for a very funny diagram.

two regions expanding toward each other like they're trying to settle a land dispute.

but they don't normally "collide" in the literal sense.

a stack overflow can corrupt data within the stack's mapped area. a heap overflow can corrupt neighboring heap objects or allocator metadata. guard pages and virtual-memory protections can catch some invalid accesses, but the exact failure depends on what was overwritten and where.

the diagram is a model.

the actual machine is considerably more annoying.

## dynamic linking

now for the part that makes a binary less self-contained than it looks.

most programs don't contain every function they use.

your program might call `printf()`, `malloc()`, `pthread_create()`, or some function from another shared library. those functions can live in shared objects such as libc rather than inside your executable.

so how does your program find them?

that's where the dynamic linker comes in.

remember that `PT_INTERP` path from earlier?

that's the path telling the kernel which dynamic loader should handle the executable.

the loader finds the libraries the program depends on, maps them into the process, and resolves references to symbols in those libraries.

exactly how symbol resolution happens depends on the platform and binary, and things like the PLT, GOT, relocations, and lazy binding can make this whole rabbit hole considerably deeper.

we're not going there.

not today.

i have bills to pay. _(i don't, i'm unemployed)_

the important idea is simply:

```text
your executable
      ↓
"I need this library"
      ↓
dynamic linker
      ↓
find + map the library
      ↓
resolve the symbol
      ↓
now the program knows where that function lives
```

this is also why "it works on my machine" can become "why the fuck does this binary need a library that doesn't exist here."

a binary is not necessarily self-contained.

its environment matters.

## stack and heap

the stack is established as part of the process's initial execution environment.

it's where things such as function call frames and local variables commonly live.

the heap is different.

the heap isn't some magical chunk of RAM that the kernel hands your program with a little bow on top.

it's better to think of it as memory that the runtime allocator manages.

when you call something like:

```c
malloc(1024);
```

the allocator decides how to satisfy that request. if it needs more virtual memory from the operating system, it can use mechanisms such as `mmap()` or `brk()`.

the kernel provides the mechanism.

the allocator manages the details.

and this distinction matters.

if you overflow a heap allocation, you're not necessarily smashing into the stack on the other side of the address space.

you might instead overwrite another heap object.

or allocator metadata.

or padding.

or something that turns out to be extremely important five bytes later.

that's why memory corruption bugs can become security vulnerabilities.

the cpu doesn't look at your pointer and politely say:

> "sir, that appears to be outside the bounds of your allocation."

it sees an address.

the rest is software's job.

## execution begins

eventually, the operating system has done enough setup that execution can actually begin.

every ELF executable has an **entry point address** recorded in its ELF header.

the kernel doesn't care whether that address corresponds to a function called `_start`.

it just knows:

> start executing here.

in a normal executable produced by a typical toolchain, that address usually points into runtime startup code, commonly associated with `_start`.

and this is where another common assumption breaks:

**the first code executed isn't usually `main()`.**

there's startup code that runs before it.

that startup code prepares the runtime environment, handles things like the initial process state, performs runtime initialization, and eventually calls your program's `main()`.

so when you write:

```c
int main() {
    return 0;
}
```

there's already been quite a bit of computer activity before that line gets anywhere near the cpu.

and once `main()` is running?

underneath all those abstractions, the cpu is still doing its basic job:

```text
fetch
  ↓
decode
  ↓
execute
  ↓
fetch
  ↓
decode
  ↓
execute
  ↓
...
```

that's the loop i mentioned at the start.

here's a stripped-down version of what cael-16 is doing right now, written in zig 0.16:

```zig
const std = @import("std");

const Cpu = struct {
    registers: [8]u16 = undefined,
    memory: [65536]u8 = undefined,
    pc: u16 = 0,

    const Self = @This();

    fn fetch(self: *Self) u16 {
        const lo = self.memory[self.pc];
        const hi = self.memory[self.pc + 1];

        self.pc += 2;

        return (@as(u16, hi) << 8) | lo;
    }

    fn step(self: *Self) void {
        const instr = self.fetch();
        const opcode: u4 = @truncate(instr >> 12);

        // these are instructions such as
        // ADD, MOV, JMP, etc.
        switch (opcode) {
            0x1 => self.execAdd(instr),
            0x2 => self.execMov(instr),
            0x3 => self.execJmp(instr),
            else => unreachable, // future me's problem
        }
    }

    fn execAdd(self: *Self, instr: u16) void {
        _ = self;
        _ = instr;
    }

    fn execMov(self: *Self, instr: u16) void {
        _ = self;
        _ = instr;
    }

    fn execJmp(self: *Self, instr: u16) void {
        _ = self;
        _ = instr;
    }
};

// 0.16 introduced this "Juicy Main" pattern. main() can just ask
// for a std.process.Init struct and get an allocator, io, and args
// handed to it instead of grabbing them manually.
pub fn main(init: std.process.Init) !void {
    const gpa = init.gpa;
    const args = try init.minimal.args.toSlice(init.arena.allocator());

    var cpu = Cpu{};
    @memset(&cpu.memory, 0);

    const program =
        try std.fs.cwd().readFileAlloc(gpa, args[1], cpu.memory.len);
    defer gpa.free(program);

    @memcpy(cpu.memory[0..program.len], program);

    while (cpu.pc < program.len) {
        cpu.step();
    }
}
```

that's genuinely it.

fetch two bytes.

rip the opcode out of the top nibble.

figure out what that opcode means.

execute it.

repeat.

real cpus do the same fundamental dance, just with dramatically more hardware involved: pipelines, caches, speculative execution, branch prediction, out-of-order execution...

basically, someone looked at this little loop and decided it wasn't complicated enough.

## user mode and system calls

your program eventually needs to interact with the outside world.

read a file.

write to the terminal.

allocate more memory.

send something over the network.

but letting every program directly control hardware would be a spectacularly bad idea.

so CPUs provide different privilege levels, and operating systems use them to separate ordinary application code from privileged kernel code.

on a typical system, your program runs in **user mode**.

restricted.

you don't get to touch everything.

when your program needs something that requires kernel privileges, it makes a **system call**.

conceptually:

<img src="/assets/posts/you-ran-a-program-now-what/program-kernel-program-pipeline.jpg" alt="program, kernel, program"
/>

on x86-64 linux, the `syscall` instruction is one mechanism used to make that transition.

for example, a very small write syscall looks roughly like this:

```asm
    mov     rax, 1          ; syscall number for write
    mov     rdi, 1          ; fd = stdout
    mov     rsi, msg        ; pointer to buffer
    mov     rdx, msg_len    ; number of bytes
    syscall                 ; enter kernel mode

msg:     db "hi from user mode", 0xa
msg_len: equ $ - msg
```

the exact registers and syscall numbers are architecture and ABI specific, but the idea is simple.

the program asks.

the kernel checks.

the kernel decides what happens.

then execution returns to user mode.

that's one of the fundamental boundaries that keeps an operating system from turning into a room full of programs fighting over the hardware.

## signals and multithreading

while your process is running, the operating system can also send it signals.

`SIGINT`.
`SIGTERM`.
`SIGUSR1`.

and a bunch of other names that look like someone ran out of variable names.

signals are a way for the operating system or other processes to notify a process asynchronously.

`SIGINT`, for example, is normally what you get when you press `ctrl+c` in a terminal.

`SIGTERM` is a request for a process to terminate.

both can be caught or handled by the program.

`SIGKILL` is different.

it can't be caught, blocked, or ignored.

when the kernel sends it, that's it.

no handler.

no negotiation.

no appeal to the supreme court of linux.

multithreading adds another layer.

multiple threads in the same process share things like memory and file descriptors, but each thread has its own stack and execution state.

the scheduler decides which runnable thread gets cpu time.

on a multicore system, multiple threads can genuinely execute at the same time.

on a single core, the kernel rapidly switches between them.

and because concurrent threads can access the same data at unpredictable times, synchronization primitives such as mutexes and atomics become necessary when those accesses need coordination.

the cpu is doing its little instruction dance.

the scheduler is deciding who gets to dance next.

## process termination

eventually, the program finishes.

if `main()` returns in a normal C program, the C runtime turns that return value into a call to `exit()`.

that means userspace cleanup can happen first, including things like `atexit` handlers and standard-library teardown.

then the kernel gets involved.

the kernel cleans up the process's operating-system resources, such as its memory mappings and file descriptors, terminates remaining execution contexts, and records the exit status so the parent process can retrieve it.

the process disappears.

the binary doesn't.

that's an important distinction.

the binary sitting on your disk is still exactly where it was.

the process was a temporary execution context created from that binary.

one is the artifact.

the other is the running thing.

## what just happened

so let's rewind.

you typed:

```text
./program
```

and somehow that turned into an executing process.

underneath that one command, the operating system had to:

- recognize and validate the executable format
- create a process and its virtual address space
- map the executable's loadable regions
- establish the initial stack and execution environment
- load the dynamic linker when necessary
- resolve shared-library dependencies
- begin execution at the executable's entry point
- run the program's startup code
- eventually reach `main()`
- provide controlled access to privileged operations through system calls
- schedule the process and its threads
- deliver signals and other asynchronous events
- clean everything up when the process exits

and after all of that?

the cpu is still doing its fundamental job.

fetch an instruction.

decode it.

execute it.

repeat.

the cpu doesn't understand your source code.

it doesn't understand `main()`.

it doesn't understand files, processes, libraries, or even the concept of a "program" in the way you think about one.

it sees instructions and machine state.

the operating system is the enormous layer of machinery that turns those primitive operations into something resembling a usable computer.

and that's the weird part.

you type one command.

the shell asks the operating system to run something.

the operating system builds an entire execution environment around a static file.

the runtime prepares your program.

the dynamic linker finds its dependencies.

the scheduler gives it time on a cpu.

the cpu fetches some bytes.

and eventually your little `main()` function gets its turn.

all because you typed:

```text
./program
```

anyway.

that's the trick underneath.
