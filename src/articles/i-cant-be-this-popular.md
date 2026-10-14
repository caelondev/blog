---
title: "I can't be THIS popular"
date: "2026-10-14"
excerpt: "a crawler ate my entire cloudflare quota and i hosted it a free buffet without knowing"
tags: ["cloudflare", "workers", "debugging", "crawlers", "rant"]
---

so i was minding my own business. watching tiktok, writing [my programming language](https://git.caelondev.net/repos/iglot), chatting on discord, and then a guy asks me what my website is.

so i send him the link. like a normal person. proud of my little portfolio.

and he comes back with this

<img src="/assets/posts/i-cant-be-this-popular/cf-error-1027.jpg" alt="the error 1027 screenshot my friend sent me" />

bro.

> "error 1027. this website has been temporarily rate limited. you cannot access this site because the owner has reached their plan limits."

what.

i'm not popular. i'm genuinely not. my portfolio gets like a handful of visitors a day and half of those are me refreshing it to check if everything is still functional. so i did what any rational person would do and sent back a screenshot of the free plan limits like it was evidence in a court case

<img src="/assets/posts/i-cant-be-this-popular/cf-free-plan-limit.jpg" alt="me, in denial" />

> "ts must be a mistake. there's NO WAY my website hit this much traffic"

lmao. there was a way.

## the crime scene had no cameras

here's the embarrassing part. i had observability turned off on my cloudflare worker. the one toggle that would've told me what the fuck was going on. so i had zero logs. no timeline. nothing.

i don't know when this shit started. i just know it happened. as far as i can tell my site was dead for like 3 whole days, and the only reason i found out is because some guy on discord was nice enough to click a link.

3\. days. my portfolio. the thing that's supposed to make me look employable. just a cloudflare error page, and i was out here writing a compiler.

## the graph

so i opened the analytics and... wait.

<img src="/assets/posts/i-cant-be-this-popular/cf-requests-graph.jpg" alt="the request graph, vertical at 8 AM" />

every day, at 8 AM sharp, the graph goes straight up. like a cliff. 148.5k requests in that window, climbing at ~24k an hour, then it just drops off.

8 AM for me is midnight UTC, which is when cloudflare resets the daily quota. so the whole thing goes like this: quota resets, something immediately starts hammering me, burns through the 100k in about 4 or 5 hours, my worker gets rate limited, and the site stays dead until the next reset.

and humans don't do that. no human wakes up at exactly midnight UTC and refreshes my portfolio 6 times a second. somebody's bot was clocking in on schedule like it had a job.

## turning on the lights

so i enabled observability, hit live, and within seconds:

<img src="/assets/posts/i-cant-be-this-popular/cf-observability-logs.jpg" alt="worker logs full of requests for repos that aren't mine" />

> git.caelondev.net/Codeberg-Infrastructure/forgejo/pulls/35

> git.caelondev.net/emanuelpina/mailygo

> git.caelondev.net/explore

bro. those aren't my repos. i don't even know what a mailygo is. why is somebody crawling a forgejo pull request through MY domain.

## the culprit was my own dumbass code

my `git` subdomain wasn't a redirect back then. it was a full proxy. i have a worker called [router-proxy](https://git.caelondev.net/repos/router-proxy) that routes subdomains, and the git route looked like this:

```js
register({
  name: "git",
  subdomain: "git",
  upstream: "https://codeberg.org",
  upstreamHost: "codeberg.org",
  proxy: true,
  allowRobots: true,
  rewritePath: (pathname) => {
    if (pathname == "/") return "/caelondev";
    if (pathname == "/repos" || pathname == "/repos/")
      return "/caelondev?tab=repositories";
    if (pathname.startsWith("/repos/")) {
      let path = pathname.split("/").slice(2); // remove "" and repos
      return `/caelondev/${path.join("/")}`;
    }

    return pathname;
  },
});
```

see that `return pathname;` at the bottom? that's the whole bug.

i only meant to map my own stuff. `/` goes to my profile, `/repos` goes to my repo list. but anything else just falls through and gets proxied to codeberg.org as is. so `git.caelondev.net/literally/anything` was a working codeberg mirror. on my domain. on my quota.

and then there's `allowRobots: true`, which is the funny part. normally my worker serves its own robots.txt, the one with my [bad bot honeypot](https://blog.caelondev.net/posts/screw-you-naughty-nut-munchers) in it. `allowRobots: true` skips that, so on this subdomain the trap was just off. crawlers got codeberg's robots.txt instead, which is basically a welcome mat.

so i accidentally built a free codeberg mirror and turned off my own bot trap on it.

and git forges are the worst possible thing to leave open, because every commit, every blame, every diff, every pull request is its own unique url. the crawl never ends. it's an infinite buffet, and i was the one running the buffet.

## the fix that didn't fix

first attempt: i flipped the route to `proxy: false` and removed `allowRobots: true`, so instead of proxying the page it just sends a 308 redirect to codeberg. surely that fixes it.

nope.

the worker still has to run to decide to redirect. and the quota counts invocations, not how much data i moved. so the bots were out here doing GET and HEAD pairs at like 20 a second and my worker was politely redirecting every single one of them. very obedient worker. zero survival instincts.

## the actual fix

the thing i didn't know is that cloudflare's WAF runs before the worker. so if a request gets blocked at the edge, my worker never even wakes up, and it never counts against the 100k.

so i made a custom rule:

```
(http.host eq "git.caelondev.net" and http.request.uri.path ne "/" and not starts_with(http.request.uri.path, "/repos"))
```

translation: if it's on the git subdomain and it's not the homepage and it's not one of my `/repos` paths, block it. real people only ever hit my stuff, so real people never see the block page. the bots just eat a 403, their requests die at the edge, and the worker stays asleep.

and no, block isn't a ban. every request gets judged on its own, so a bot can keep knocking all day and every knock just gets a 403. it only matters that the knock never reaches my code.

then i tested it. opened the pull request url from the logs and got the cloudflare block page. opened `/` and it loaded like nothing happened.

<img src="/assets/posts/i-cant-be-this-popular/cf-waf-rule.jpg" alt="the anti-git crawlers rule" />

1.09k requests caught in the first 5 minutes. i genuinely felt like a cybersecurity expert.

## what i learned

- turn on observability BEFORE something breaks. debugging with no logs is just guessing with extra steps
- the free tier counts worker invocations, so filter junk at the WAF, not inside the worker
- `return pathname` as a default route is a trap. allowlist your own paths and let everything else die
- an open proxy is basically a signup form for every crawler on the internet

i should probably also add a 404 for unknown git paths inside the worker as a backup, and stop logging every single request like it's a diary. that's on the list.

anyway. if tomorrow's graph is flat after the reset i'm gonna act like i planned this the whole time. go turn on your observability or something.
