![Dawning Micro Header](https://github.com/user-attachments/assets/f5ce7fef-b1d5-4e97-82e6-5791ae55d663)
<div align=center>

  **```npm i @dawning-org/micro```**
  <a href="https://www.npmjs.com/package/@dawning-org/micro"><img src="https://img.shields.io/npm/v/@dawning-org/micro"/></a>

</div>
Ultra tiny component "framework", 350 bytes! and a SPA router, 335 bytes!
Micro v4 freeloads ontop of the browsers native component system, fused with a tiny attribute based event system

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

### SPA router only
404 is baked in by default
```ts
import { page, route } from "router.ts"

page('/', 'Home', () => `<a href="/about">About</a>`);
page('/about', 'About', () => `<a href="/">Home</a>`);

route();
```
Minified JS: **478 bytes**

### V4+ TBD
- Router fixes
- Examples

## Support
Did you know this effort has gone 100% out of my pocket?
If you think this project speaks for itself, consider supporting on github sponsors to continue making
projects like these a reality, open & free.

Supporter or not, you can **always** reach me on <a href="https://discord.gg/cxRvzUyzG8">My Discord Server, my primary communication channel</a>
Questions, feedback or support related to any of my projects, or if you need consulting.

## License
Apache-2.0 license
