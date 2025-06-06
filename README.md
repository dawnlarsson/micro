![Dawning Micro](https://github.com/user-attachments/assets/bfb7f83d-2949-4ff2-8ae3-d812ff726209)
Ultra tiny and fast reactivity. <br>
V3 is a document wide event handler, 
the **only** thing you pay for is the types you register.

with near zero memory cost, near zero CPU cost.
and ZERO entirely for dom elements.

V3 Is ideal for being inlined script on the first request,
given it's tiny size, it's far more worth it than a second request overhead

> [!IMPORTANT]
> ### Beta status
> This is currently my state of the art research on web reactivity,
> this could serve as a building block for other frameworks
>
> but the core of the reactive/event system is done, 
>
> V3 beta is currently harder to use, I want a more intuitive developer experience and API refinements,
> but this **should be the MIN / MAX for size and speed.** (To my current knowledge)
>
> p.s. Forgive me if there’s a tiny bug somewhere, been re-writing V3 during the peek of a cold chugging aspirin lol

## V2 -> V3
V3 Events core is 177 bytes

V3 Router is 30% smaller than V2, **335 bytes total**

## Examples

### Counter

```html
<p count>0</p>
<button more>+</button>
<button less>-</button>
```

```ts
import { event, select, type, text } from "../micro.ts";

var click = event('click');
var counter = select('count');
var count = 0;

type('more', [click], () => {
        text(counter, count++);
});

type('less', [click], () => {
        text(counter, count--);
});
```

Minified JS: **345 bytes**

### SPA router only
404 is baked in by default
```ts
import { page, route } from "../router.ts"

page('/', 'Home', () => `<a href="/about">About</a>`);
page('/about', 'About', () => `<a href="/">Home</a>`);

route();
```
Minified JS: **468 bytes**

### SPA router + Micro
```ts
import { event, select, type, text } from "micro.ts";
import { page, route } from "router.ts"

var click = event('click');
var counter;
var count = 0;

type('more', [click], () => {
        text(counter, count++);
});

type('less', [click], () => {
        text(counter, count--);
});

page('/', 
        'Home', 
        () => `<h1>Home Page</h1><a href="/about">About</a><p count>0</p><button more>+</button><button less>-</button>`, 
        () => {count = 0; counter = select('count')}
);

route();
```

Minified JS: **844 bytes**

## Micro SPA + Cloudflare Workers
`micro-cf` contains a starting template for using micro with cloudflare workers with bun bun
live example: https://micro-cf.dawnday.workers.dev/

usage:
```sh
cd micro-cf
bun i
bun run start
```

deploy
```sh
bun run deploy
```

## Support
Did you know this effort has gone 100% out of my pocket?
If you think this project speaks for itself, consider supporting on github sponsors to continue making
projects like these a reality, open & free.

Supporter or not, you can **always** reach me on <a href="https://discord.gg/cxRvzUyzG8">My Discord Server, my primary communication channel</a>
Questions, feedback or support related to any of my projects, or if you need consulting.

## License
Apache-2.0 license
