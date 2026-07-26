---
title: "TailwindCSS sucks"
date: "2026-07-26"
description: "unpopular opinion but its not that unpopular"
tags: ["css", "rant", "frontend"]
---

ok so i gotta get this off my chest. tailwind is mid. not "bad" bad, but mid in a way that everyone pretends is genius because twitter told them so.

my whole issue boils down to one thing: **tailwind only makes sense if you're already running react, vue, svelte, whatever.** the second you're not, it just falls apart and turns into the exact thing it claims to fix.

## the pitch vs the reality

the pitch is "utility classes, no more naming things, no more bloated css files, compose your styles inline." cool. sounds nice on paper.

but here's the thing nobody says out loud: tailwind's entire value prop is _reusability through componentization_. and componentization isn't a tailwind feature. it's a jsx/vue-template feature. tailwind is just riding on top of it.

```jsx
function Button({ children }) {
  return (
    <button className="px-4 py-2 rounded-lg bg-violet-600 text-white font-medium hover:bg-violet-700 transition-colors">
      {children}
    </button>
  );
}
```

look at that. that's fine! because you write it once, `<Button>` it everywhere, done. the insane class soup lives in exactly one place.

now take that same energy into a plain html/css project, no component system, no jsx, just raw markup:

```html
<button
  class="px-4 py-2 rounded-lg bg-violet-600 text-white font-medium hover:bg-violet-700 transition-colors"
>
  submit
</button>
<button
  class="px-4 py-2 rounded-lg bg-violet-600 text-white font-medium hover:bg-violet-700 transition-colors"
>
  cancel
</button>
<button
  class="px-4 py-2 rounded-lg bg-violet-600 text-white font-medium hover:bg-violet-700 transition-colors"
>
  confirm
</button>
```

congrats, you just reinvented copy-pasting inline styles, except now it's a string instead of a `style` attribute. you have the exact same maintenance problem css was invented to solve in the first place: change the button color, now you're doing a project-wide find-and-replace across a wall of class soup instead of editing one selector.

## "just use @apply" is not the flex you think it is

yeah i know, `@apply`. let's look at what that actually is:

```css
.btn {
  @apply px-4 py-2 rounded-lg bg-violet-600 text-white font-medium;
}
```

my brother in christ. that's just... css. that's a css class. with extra syntax. you have re-invented `.btn { padding: ...; border-radius: ...; background: ...; }` but now it's vendor-locked to tailwind's compiler and you need a build step to make sense of it.

if the "fix" for tailwind's core problem is "write normal css classes again," what was the utility-first pitch even for? you didn't remove the abstraction layer, you just added one (tailwind's class-to-property mapping) and then immediately built another abstraction layer on top of it to get back to where plain css already was.

## it's a reskin, not a paradigm shift

this is the part that actually annoys me. tailwind isn't a new idea, it's boilerplate css with a rebrand:

- `flex items-center justify-between` → that's just `display: flex; align-items: center; justify-content: space-between;` with the vowels removed
- the entire spacing scale (`p-4`, `m-2`, `gap-6`) → is just css custom properties/a design token system, which people were already doing with sass variables or css vars years before tailwind existed
- responsive prefixes (`md:flex`, `lg:grid`) → media queries, shortened

none of this is a new mental model. it's the same css concepts, just renamed into a proprietary shorthand that only means something once you've memorized their cheat sheet. you're not learning css faster, you're learning tailwind's _lexicon_ for css, which doesn't transfer anywhere else.

compare that to actual reusable css:

```css
:root {
  --space-2: 0.5rem;
  --space-4: 1rem;
  --radius-lg: 0.5rem;
}

.btn {
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-lg);
  background: var(--color-primary);
}
```

same design-token idea. zero build step required. zero proprietary syntax. works in literally any project, forever, no compiler dependency.

## when it does make sense

to be fair — in a react/vue/svelte project where you've already got component boundaries doing the reuse work for you, tailwind genuinely is fast. you skip context-switching between files, skip naming bikeshedding, prototyping goes quick. i get why people who live in component-land like it.

but that's my whole point: **it's a nice-to-have on top of componentization, not a css methodology by itself.** the second you're doing static html, server-rendered templates without a component system, email templates, whatever — tailwind gives you nothing you didn't already have, and actively makes your markup worse to read.

## tldr

tailwind's value is 90% "i have a component system to hide the class soup in" and 10% "utility classes are kinda handy." people talk about it like it's the second thing when it's really riding entirely on the first thing existing already.

anyway. rant over. back to being a ret*rd.
