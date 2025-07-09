![Dawning Micro Header (1)](https://github.com/user-attachments/assets/f5ce7fef-b1d5-4e97-82e6-5791ae55d663)
<div align=center>

  **```npm i @dawning-org/micro@3.0.0-beta.2```**
  <a href="https://www.npmjs.com/package/@dawning-org/micro"><img src="https://img.shields.io/npm/v/@dawning-org/micro"/></a>

</div>
Ultra tiny and fast reactivity. <br>
V3 is a document wide event handler, 
the **only** thing you pay for is the types you register.

with near zero memory cost, near zero CPU cost.
and ZERO entirely for dom elements.

V3 Is ideal for being inlined script on the first request,
given it's tiny size, it's far more worth it than a second request overhead

> [!IMPORTANT]
> ## V4 Draft
```html
<body>
	<counter-></counter->
</body>
```

```ts
import { component, event } from "../micro.v4.ts"

event("click");

component("counter", {

        i: { count: 0 },

        more(i) { i.count++ },
        less(i) { i.count-- },

        draw(i) {
                return "<p>" + i.count + "</p><button more>+</button><button less>-</button>";
        }
});
```

350 bytes v4, 509 total (example)


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
import { event, select, on, text } from "micro.ts";

// combination of events 'on' can take
var click = [event('click')];

// selects dom element with attribute 'count'
// (just a de-duplication wrapper for querySelector)
var counter = select('count');

// A single "reactive" counter
var count = 0;
on(click, 'more', () => text(counter, ++count));
on(click, 'less', () => text(counter, --count));
```

Minified JS: **339 bytes**

### SPA router only
404 is baked in by default
```ts
import { page, route } from "router.ts"

page('/', 'Home', () => `<a href="/about">About</a>`);
page('/about', 'About', () => `<a href="/">Home</a>`);

route();
```
Minified JS: **478 bytes**

### SPA router + Micro
```ts
import { event, select, on, text } from "micro.ts";
import { page, route } from "router.ts"

var counter;
var click = [event('click')];

var count = 0;
on(click, 'more', () => text(counter, ++count));
on(click, 'less', () => text(counter, --count));

page('/',
        'Home',
        () => `<h1>Home Page</h1><a href="/about">About</a><p count>0</p><button more>+</button><button less>-</button>`,
        () => { count = 0; counter = select('count') }
);

route();
```

Minified JS: **843 bytes**

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
