---
title: "you know what?! fy!"
date: "2026-08-17"
excerpt: "oh you don't understand? skill issue."
tags: ["software", "development", "programming", "rant"]
---

the title is understandable... or is it? _vsauce music starts playing_

before anything else... i'm scrolling through this repo at like 2am, minding my own business, and i open one file and immediately regret every decision that led me to this machine.

**holy f\*ck, the code is so vague and hard to read.**

no, no, it is NOT a skill issue. it's just too damn vague. take a look at this sample zig code.

```zig
pub fn calculate(x: i32, y: i32) i32 {
    return x + (x * y / 100);
}
```

now guess what that's trying to do... yeah, take your time...

got your guesses? well the answer is... calculating a base price plus `y` percent tax.

now if you actually guessed it, you're either cracked as f\*ck or you're used to seeing bullsh\*t code like this. which i HIGHLY respect, i genuinely envy your skill.

this is my huge programming pet peeve.

single-letter variables.

before someone starts typing `x` and `y` into the comments, **i know they're not always bad.**

`i` and `j` are fine. especially in loops.

```zig
for (items, 0..) |item, i| {
    // ...
}
```

perfectly reasonable. i don't need `current_item_index` just because some clean-code cultist decided every variable needs a birth certificate.

same thing with `x` and `y` for coordinates.

```zig
const distance = sqrt(x * x + y * y);
```

yeah. i know what `x` and `y` are. they're coordinates. the context is doing the work.

but then i see this sh*t:

```text
x + (x * y / 100)
```

**WHAT THE F\*CK DOES THIS DO?**

WHAT IS `x`?

WHAT IS `y`?

IS `y` A PERCENTAGE?

IS `x` A PRICE?

IS THIS CALCULATING TAX?

IS THIS SOME WEIRD GAME DAMAGE FORMULA?

AM I SUPPOSED TO OPEN THE FUNCTION, TRACE SIX CALLS BACKWARDS, AND CONSULT THE DEAD SEA SCROLLS TO FIND OUT WHAT `y` MEANS?

and the worst part? the compiler doesn't care. the compiler doesn't care about anything. it has the emotional depth of a rock and the memory of a goldfish. it'll happily let you name a boolean flag and then let that `flag` quietly become three completely different concepts over the next two years, because computers are incredibly obedient and have zero survival instincts. they'll do exactly what you tell them, even if what you told them was a lie.

give your variables real names.

not necessarily long names.

**useful names.**

```zig
base_price + (base_price * tax_rate / 100)
```

look at that.

i haven't even seen the surrounding code and i already have an idea of what's happening.

that's the important part: **names don't have to be verbose. they have to carry enough information.**

---

## and functions are even worse

then there's the function equivalent.

```text
process()
```

PROCESS WHAT??? YOUR MOM???

what the f*ck am i supposed to infer from `process`?

process could mean:

- parse something
- validate something
- serialize something
- save something
- transform something
- calculate something
- summon an ancient demon

and then there's:

```text
extractData()
```

**WHAT DATA?**

are you extracting user information?

environment variables?

post metadata?

command arguments?

the nuclear launch codes?

just because you can type `extractData` doesn't mean the function suddenly became self-documenting.

something like this actually tells me something:

```text
extractUserId()
extractCommandArguments()
extractPostMetadata()
extractEnvironmentVariables()
```

now i know what the function is supposed to extract without opening it.

---

## but there's one huge exception

and this is where i think people sometimes go too far with "always use descriptive names."

sometimes the **context already provides the description.**

for example:

```text
Interpreter::interpret()
```

that's completely fine.

it's an interpreter.

**WHAT ELSE IS IT GOING TO INTERPRET?**

same with:

```text
Command::run(args)
```

a command running is perfectly understandable.

and:

```text
db.save()
```

makes sense.

the database saves something.

but:

```text
run()
```

**RUN WHAT?**

YOUR MOM?

```text
save()
```

**SAVE WHAT?**

ARE YOU GONNA `save()` YOURSELF AFTER BEING PUNCHED AROUND BY YOUR CO-DEVELOPERS?

the difference is that `Interpreter`, `Command`, and `db` provide context that the standalone function doesn't.

that's actually the thing i care about.

i'm not asking for:

```text
interpreter.interpretSourceCodeInputAndProduceAnAst()
```

we dont talk about java here, that's f*cking stupid.

this is perfectly readable:

```text
interpreter.interpret(source)
```

the receiver tells me what `interpret` means.

the same principle applies to variables.

```text
point.x
point.y
```

fine.

the type gives those names meaning.

but:

```text
x
y
```

sitting in the middle of some giant function?

son, i need _***ze*** lore._

---

## context is the rule

descriptive names aren't the rule. _context_ is.

here's probably the simplest way i can put it:

**the name is just how much of the context you have to carry yourself vs how much the surrounding code carries for you.**

`point.x` costs you nothing because `point` already did the work.

`command.run()` costs you nothing because `command` already did the work.

but `x` floating alone in a 200-line function?

now _you're_ doing the work the name should've done.

that's why these are fine:

```text
i
j
```

in loops.

```text
x
y
```

for coordinates.

```text
Interpreter::interpret()
Command::run()
db.save()
lexer.next()
```

but these become questionable when they're floating around without meaningful context:

```text
x
y
data
result
thing
stuff
process()
handle()
run()
doStuff()
```

and yes, sometimes `data` or `result` genuinely is the best name.

i'm not saying every variable needs to be named like it was generated by a government committee.

i'm saying that if i have to inspect the entire function just to figure out what the f*ck `data` represents, **the name failed to do its job.**

---

## the point isn't "use long names"

it's **use names that communicate intent.**

there's a huge difference.

bad:

```zig
const x = calculate(a, b);
```

potentially better:

```zig
const total_price = calculate(base_price, tax_rate);
```

bad:

```text
process(data)
```

better:

```text
validateEnvironmentVariables(environment)
```

bad:

```text
run()
```

potentially perfectly fine:

```text
command.run()
```

the second one isn't better because it has more characters.

it's better because **i know what the f\*ck you're talking about.**

that's really all i want.

i don't need every variable to have a dissertation attached to it.

i just don't want to stare at:

```text
x + (x * y / 100)
```

and wonder whether i'm reading source code or somebody's unfinished algebra homework.

unless the context already named it for you.

in that case, keep it short.

otherwise:

name your sh*t.
