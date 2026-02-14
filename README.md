![Slide 16_9 - 36 (1)](https://github.com/user-attachments/assets/6c6fd9c1-f219-43c4-9c6d-c74afa28e559)
<div align=center>


  **```npm i @dawning-org/micro```**
  <a href="https://www.npmjs.com/package/@dawning-org/micro"><img src="https://img.shields.io/npm/v/@dawning-org/micro"/></a>

</div>

Ultra tiny reactive framework with signals. **~860 byte** runtime (**~520 bytes** gzipped). Zero config. Bun only.
No virtual DOM. No diffing. No hydration. No runtime template parsing.

Components are flat `.tsx` files — top-level assignments become state, functions become actions, `render` returns JSX. The compiler does the heavy lifting: JSX is compiled away, signal bindings are resolved, DOM paths are generated, and event delegation is tailored — all at build time. The browser runtime is six shared helpers: signal constructor, prop coercion, text binding, attribute binding, event map, and component registration.

---

### Counter in 6 lines

```tsx
// components/counter.tsx
var count = 0
var render = (s) => <p>{s.count} <button onclick="inc">+</button> <button onclick="dec">-</button></p>
var inc = (s) => { s.count.v++ }
var dec = (s) => { s.count.v-- }
```

Output: **~1.2 KB** minified, **~720 bytes** gzipped (runtime + component, entire app)

### CLI

```sh
bun micro/build.ts build      # compile components → dist/
bun micro/build.ts dev         # build + serve on :3000
bun micro/build.ts serve       # serve dist/ only
```

---

### Component format

A component file is a flat `.tsx` where the filename becomes the tag name (`counter.tsx` → `<counter->`).

```tsx
// components/counter.tsx

var count = 0

var render = (s) =>
  <div>
    <p>{s.count}</p>
    <button onclick="inc">+</button>
    <button onclick="dec">-</button>
  </div>

var inc = (s) => { s.count.v++ }
var dec = (s) => { s.count.v-- }
```

- **Plain values** (`var count = 0`) → reactive state (each becomes a signal)
- **`render`** → called once at build time with a proxy, returns JSX (never shipped to browser)
- **Functions** (`inc`, `dec`) → actions, bound with `on{event}` attributes
- **`s.count.v`** → read/write the signal's value (`.v` getter/setter)
- Binding discovery, DOM paths, prop coercion — all resolved by the compiler

### Actions & event handling

Bind events with `on{event}="action"` attributes. The event name and binding are resolved at build time — only the events your app actually uses get a single global listener via delegation. Zero per-element cost:

```tsx
var render = (s) =>
  <div>
    <button onclick="inc">+</button>
    <input oninput="typed" type="text" />
    <select onchange="pick">...</select>
    <form onsubmit="send">...</form>
    <div onpointerdown="grab" onpointerup="release" />
  </div>
```

Any DOM event works — `click`, `input`, `change`, `submit`, `pointerdown`, `pointerup`, `keydown`, etc.

Actions receive the component's state and the native event:

```tsx
var inc = (s, e) => { s.count.v++ }
var typed = (s, e) => { s.query.v = e.target.value }
```

### Reactive attributes

Attributes that reference state are reactive — they update automatically when the signal changes. Use them for dynamic classes, styles, or any HTML attribute:

```tsx
// components/mixer.tsx
var r = 128
var g = 128
var b = 128
var preview = "background-color:rgb(128,128,128)"
var hex = "#808080"

var render = (s) =>
  <div>
    <div class="preview" style={s.preview}></div>
    <p>{s.hex}</p>
    <input type="range" min="0" max="255" data-c="r" oninput="slide" />
    <input type="range" min="0" max="255" data-c="g" oninput="slide" />
    <input type="range" min="0" max="255" data-c="b" oninput="slide" />
  </div>

var slide = (s, e) => {
  var ch = e.target.getAttribute("data-c")
  var val = +e.target.value
  if (ch === "r") s.r.v = val
  else if (ch === "g") s.g.v = val
  else s.b.v = val
  s.preview.v = "background-color:rgb(" + s.r.v + "," + s.g.v + "," + s.b.v + ")"
  s.hex.v = "#" + [s.r.v, s.g.v, s.b.v].map(x => x.toString(16).padStart(2, "0")).join("")
}
```

Dragging any slider updates the `style` attribute on the preview div and the hex text — in real time. Works with any attribute: `class`, `style`, `href`, `src`, `placeholder`, `title`, etc.

Both text content and attributes use the same signal binding mechanism.

### Props / attributes

Pass initial state values as HTML attributes. The component's default state type determines how the attribute is coerced:

```html
<counter- count="10"></counter->     <!-- number: parsed with + -->
<toggle- active="true"></toggle->    <!-- boolean: anything except "false" is true -->
<greeting- name="world"></greeting-> <!-- string: used as-is -->
```

```tsx
// components/counter.tsx
var count = 0                            // default value, also defines type

var render = (s) => <p>{s.count}</p>
```

When `<counter- count="10">` is used, the count signal starts at `10` instead of `0`.

### Lifecycle hooks

Components support `mount` and `unmount` hooks. These are **not** wired as event handlers — they are called automatically by the framework.

```tsx
// components/timer.tsx
var elapsed = 0

var render = (s) => <p>{s.elapsed}s</p>

var mount = (s, el) => {
  el._interval = setInterval(() => s.elapsed.v++, 1000)
}

var unmount = (s, el) => {
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
