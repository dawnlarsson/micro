![Dawning Micro Header](https://github.com/user-attachments/assets/f5ce7fef-b1d5-4e97-82e6-5791ae55d663)
<div align=center>

  **```npm i @dawning-org/micro```**
  <a href="https://www.npmjs.com/package/@dawning-org/micro"><img src="https://img.shields.io/npm/v/@dawning-org/micro"/></a>

</div>

Ultra tiny reactive framework with signals. **~400 bytes** runtime. Zero config. Bun only.
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

Output: **~1 KB** minified (runtime + component, entire app)

### CLI

```sh
bun micro/build build      # compile components → dist/
bun micro/build dev        # build + serve on :3000
bun micro/build serve      # serve dist/ only
```

---

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

### Actions & event handling

Actions are dispatched by matching an element's attribute name to an action function. Just add the action name as an attribute on any element:

```tsx
render = (s) =>
  <div>
    <button inc>+</button>         {/* click */}
    <input oninput type="text" />  {/* input */}
    <select onpick>...</select>    {/* change */}
    <form onsend>...</form>        {/* submit */}
  </div>
```

Event types are inferred globally via delegation — one listener per event type on the document, zero per-element cost:

| Element | Event |
|---------|-------|
| `<input>`, `<textarea>` | `input` |
| `<select>` | `change` |
| `<form>` | `submit` |
| Everything else | `click` |

Actions receive the component's state and the native event:

```tsx
inc = (s, e) => { s.count.v++ }
oninput = (s, e) => { s.query.v = e.target.value }
```

### Props / attributes

Pass initial state values as HTML attributes. The component's default state type determines how the attribute is coerced:

```html
<counter- count="10"></counter->     <!-- number: parsed with + -->
<toggle- active="true"></toggle->    <!-- boolean: anything except "false" is true -->
<greeting- name="world"></greeting-> <!-- string: used as-is -->
```

```tsx
// components/counter.tsx
count = 0                                // default value, also defines type

render = (s) => <p>{s.count}</p>
```

When `<counter- count="10">` is used, the count signal starts at `10` instead of `0`.

### Lifecycle hooks

Components support `mount` and `unmount` hooks. These are **not** wired as event handlers — they are called automatically by the framework.

```tsx
// components/timer.tsx
elapsed = 0

render = (s) => <p>{s.elapsed}s</p>

mount = (s, el) => {
  el._interval = setInterval(() => s.elapsed.v++, 1000)
}

unmount = (s, el) => {
  clearInterval(el._interval)
}
```

- **`mount(s, el)`** — called after the component is connected to the DOM. Receives state and the host element.
- **`unmount(s, el)`** — called when the component is removed from the DOM. Use it to clean up timers, listeners, etc.

When a component is removed, all its signal effects are automatically stopped and its instance is cleaned up.

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

## Cloudflare Example
```sh
cd .github/micro_example
bun run build     # compile → dist/
bun run dev       # build + serve on :3000
```

## Support
Did you know this effort has gone 100% out of my pocket?
If you think this project speaks for itself, consider supporting on github sponsors to continue making
projects like these a reality, open & free.

Supporter or not, you can **always** reach me on <a href="https://discord.gg/cxRvzUyzG8">My Discord Server, my primary communication channel</a>
Questions, feedback or support related to any of my projects, or if you need consulting.

## License
Apache-2.0 license
