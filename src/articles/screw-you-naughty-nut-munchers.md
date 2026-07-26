---
title: "Screw you! naughty nut-munchers!"
date: "2026-07-26"
description: "a love letter to bad robots"
tags: ["security", "robot", "javascript", "honeypot", "rant"]
---

so my somewhat close fella made an anti-bad-bot thing to stop crawlers from raping his site with requests, wrote it up here: [an attempt to ban bad bots crawling my sites](https://douxx.blog/an-attempt-to-ban-bad-bots-crawling-my-sites). great read. and me being me, i immediately thought "i wanna make this sh*t too, but in javascript, because i hate myself."

i named the route `/__clankers/` because that is objectively the most insulting thing you can call a robot right before "nut muncher" and "oil drinker."

## step one: know thy enemy's IP

first thing i needed was a way to actually grab the client's ip so i'd have something to ban.

```js
function getClientIP(req) {
  return (
    req.headers["cf-connecting-ip"] ||
    req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
    "unknown"
  );
}
```

simple enough. fall through cloudflare's header, then the standard forwarded-for header, then shrug.

## step two: the actual banhammer

next up, the logic that actually hits cloudflare's API and drops the IP into a firewall access rule.

```js
async function banIPCloudflare(ip) {
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/zones/${process.env.CF_ZONE_ID}/firewall/access_rules/rules`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.CF_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        mode: "block",
        configuration: { target: "ip", value: ip },
        notes: `honeypot trigger /__clankers @ ${new Date().toISOString()}`,
      }),
    },
  );
  const data = await res.json();
  if (!data.success) {
    console.error("Cloudflare ban failed:", data.errors);
  }
  return data.success;
}
```

hit the route, get banned, simple as. everything's going smooth at this point. and then, as always, vercel decided to mess the whole thing up.

## step three: vercel eats my client IP

quick bit of context: my sites (including this blog) sit behind [my own router proxy](https://codeberg.org/caelondev/router-proxy), which unifies everything under one main domain. i'm not gonna explain the whole setup, but the short version of the problem is this... vercel wraps the client IP with its own server's IP before it ever reaches my code. so from my honeypot's pov, every single "bad bot" was vercel. cool. useless.
so i did what a smart person would do, even though i am not. i went into cloudflare, added a custom header, named it something appropriately sh*tty like `x-user-real-ip`, and threaded that through instead.

```js
function getClientIP(req) {
  return (
    req.headers["x-user-real-ip"] ||
    req.headers["cf-connecting-ip"] ||
    req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
    "unknown"
  );
}
```

boom. worked first f*cking try. i almost didn't trust it.

## step four: ipv6 exists, apparently

felt good for about an hour, then someone reported the honeypot couldn't ban an ipv6 address. turns out i just... never accounted for one existing. so back into my terminal i went, typed neovim, and wrote the single dumbest, shortest function in this entire post... just so no senior dev could yell at me for not abstracting everything:

```js
function isIPv6(ip) {
  return ip.includes(":");
}
```

genuinely just checking for a colon. and then wiring it into the ban function so it targets the right rule type:

```js
async function banIPCloudflare(ip) {
  const target = isIPv6(ip) ? "ip6" : "ip";

  const res = await fetch(
    `https://api.cloudflare.com/client/v4/zones/${process.env.CF_ZONE_ID}/firewall/access_rules/rules`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.CF_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        mode: "block",
        configuration: { target, value: ip },
        notes: `honeypot trigger /__clankers @ ${new Date().toISOString()}`,
      }),
    },
  );
  const data = await res.json();
  if (!data.success) {
    console.error("Cloudflare ban failed:", data.errors);
  }
  return data.success;
}
```

and that was it. works now.

## the best part

remember how i said i built this inside the router proxy instead of one single site? that means `/__clankers/` isn't scoped to one domain — it's live under every single one of my domains at once. one honeypot, unlimited victims. you can go poke at it yourself if you want, i'm not gonna paste the link here because that defeats the purpose. *definitely not because i'm lazy or something*. but it's out there. just don't click the link below the warning. ;)

## tldr

- built a `/__clankers/` honeypot route to auto-ban bots that wander in where they shouldn't
- vercel silently swaps the client ip for its own, so i had to inject a custom `x-user-real-ip` header via cloudflare to see the real one
- forgot ipv6 existed for like a full release, fixed it with a function that's basically just `.includes(":")`
- because it lives in my router proxy, it's protecting every domain i own at once, not just one site

anyway. go touch grass, clankers.
