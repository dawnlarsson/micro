![Dawning Micro Header](https://github.com/user-attachments/assets/f5ce7fef-b1d5-4e97-82e6-5791ae55d663)
<div align=center>

  **```npm i @dawning-org/micro```**
  <a href="https://www.npmjs.com/package/@dawning-org/micro"><img src="https://img.shields.io/npm/v/@dawning-org/micro"/></a>

</div>

Ultra tiny reactive framework with signals. **268 bytes** runtime. Zero config. Bun only.
No virtual DOM. No diffing. No hydration. No framework.

Components are flat `.tsx` files — top-level assignments become state, functions become actions, `render` returns JSX. JSX is compiled away at build time (never shipped to the browser). State binds to the DOM through signals — only the text nodes that changed get updated.

---

### Counter in 6 lines

```tsx
// components/counter.tsx
count = 0
render = (s) => <p>{s.count} <button inc>+</button> <button dec>-</button></p>
inc = (s) => { s.count.v++ }
dec = (s) => { s.count.v-- }
```

Output: **1,034 bytes** minified (runtime + component, entire app)

### CLI

```sh
bun micro/build build      # compile components → dist/
bun micro/build dev        # build + serve on :3000
bun micro/build serve      # serve dist/ only
```

### Component format

A component file is a flat `.tsx` where the filename becomes the tag name (`counter.tsx` → `<counter->`).

```tsx
// components/counter.tsx

count = 0

render = (s) =>
  <div>
    <p>{s.count}</p>
    <button inc>+</button>
    <button dec>-</button>
  </div>

inc = (s) => { s.count.v++ }
dec = (s) => { s.count.v-- }
```

- **Plain values** (`count = 0`) → reactive state (each becomes a signal)
- **`render`** → called once at build time with a proxy, returns JSX
- **Functions** (`inc`, `dec`) → actions, dispatched by attribute name
- **`s.count.v`** → read/write the signal's value (`.v` getter/setter)

### SPA Router

Optional. Import alongside micro:

```ts
import { page, route } from "micro/router.ts"

page('/', 'Home', () => `<h1>Home</h1><counter-></counter-><a href="/about">About</a>`)
page('/about', 'About', () => `<a href="/">Home</a>`)

route()
```

Renders into `<main>` if present, otherwise `document.body`. 404 is built in. Intercepts `<a href="/">` clicks automatically.

---


## Support
Did you know this effort has gone 100% out of my pocket?
If you think this project speaks for itself, consider supporting on github sponsors to continue making
projects like these a reality, open & free.

Supporter or not, you can **always** reach me on <a href="https://discord.gg/cxRvzUyzG8">My Discord Server, my primary communication channel</a>
Questions, feedback or support related to any of my projects, or if you need consulting.

## License
Apache-2.0 license
