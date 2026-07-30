---
title: "users arent dumb, your UI just sucks"
date: "2026-07-30"
excerpt: "a rant about hamburger menus, invisible buttons, and blaming users for bad design"
tags: ["ux", "design", "frontend", "rant"]
---

> disclaimer real quick: i'm not a frontend dev. i know basic frontend shenanigans and that's about it. everything below is coming from the pov of a regular user who just wants to click a button without needing a tutorial.

---

# users aren't dumb, your UI is just cramped up

ok so here's the whole post in one sentence: **users arent dumb, your UI is just cramped up that it's hard to navigate.**

that's it. that's the take. everything else below is just me unpacking it.

every time someone can't find the settings button, or rage-quits an app because they don't know where the "save" option went, the go-to excuse is "lol users these days don't know how to use anything." no. the button is probably tucked inside a hamburger menu, inside another menu, inside a modal that only opens if you scroll down first. it's not a skill issue. it's a "why did you hide the one thing i need" issue.

## the UI is a room, and you filled it with furniture nobody asked for

imagine walking into someone's house and every wall is covered in shelves, every shelf has 40 random items, and the light switch is disguised as a picture frame. you'd trip over something within 5 seconds. that's what a cramped UI feels like. too many buttons competing for attention, no visual hierarchy, everything screaming "CLICK ME!" at the same volume so nothing actually stands out.

good design isn't about cramming more stuff in. it's about deciding what _doesn't_ need to be there.

## users dont read, they scan

this one's huge and it's the part devs forget the most.

nobody reads your UI top to bottom like a book. people scan. their eyes jump around looking for the thing that looks clickable, the thing that's a different color, the thing that stands out from the noise. if your "delete account" button and your "save changes" button look exactly the same, you _will_ have someone delete their account by accident, and it's not because they're dumb, it's because your ui gave them zero visual cues to slow down.

scanning behavior means:

- important actions need to visually stand out, not just exist somewhere on the page
- labels > icons, unless the icon is genuinely universal (nobody agrees on what a floppy disk means anymore btw)
- if someone has to _read carefully_ to understand your UI, you've already lost

## "just RTFM" is not a design philosophy

i see this a lot in dev spaces. "the docs explain it" or "just hover over the icon, it has a tooltip." cool, but if your average user needs a tooltip to understand what a button does, the button design already failed. tooltips are a patch, not a fix.

a good UI should make sense without an instruction manual. that's not a low bar, that's literally the point of designing an interface in the first place.

## so what actually helps (from a non-designer's pov)

i'm not gonna pretend i know the "right" way to design ui, but as a user, these are things that instantly make an app feel less cramped:

- **breathing room.** padding and spacing aren't wasted space, they're what stops everything from blurring together
- **one primary action per screen.** if everything is a button, nothing is _the_ button
- **consistent placement.** don't move the "back" button around app-wide just because it looks nice on one screen
- **clear feedback.** if i click something, i want to _know_ something happened. loading spinners, toasts, anything

none of this is groundbreaking. it's just stuff that gets skipped when the priority becomes "fit more features on screen" instead of "make the features people actually use easy to find."

## closing thought

next time a user "doesn't get" your app, maybe don't blame the user first. open your own UI and try to find the thing they were looking for, with fresh eyes, like you've never seen it before. if it takes you more than a few seconds, that's your answer.

users arent dumb. your UI is just cramped up.
