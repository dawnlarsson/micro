![Slide 16_9 - 36 (1)](https://github.com/user-attachments/assets/6c6fd9c1-f219-43c4-9c6d-c74afa28e559)
<div align=center>


  **```npm i @dawning-org/micro```**
  <a href="https://www.npmjs.com/package/@dawning-org/micro"><img src="https://img.shields.io/npm/v/@dawning-org/micro"/></a>

</div>

Ultra tiny reactive framework with signals. **~860 byte** runtime (**~520 bytes** gzipped). Zero config. Bun only.
No virtual DOM. No diffing. No hydration. No runtime template parsing.

Components are flat `.tsx` files — top-level assignments become state, `render` returns JSX, functions are actions. Write plain variables and the compiler makes them reactive. JSX is compiled away, signal bindings are resolved, DOM paths are generated, and event delegation is tailored — all at build time.

---

### Counter in 6 lines

```tsx
// components/counter.tsx
var count = 0

render = () =>
  <p>{count} <button onclick="inc">+</button> <button onclick="dec">-</button></p>

var inc = () => { count++ }
var dec = () => { count-- }
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

render = () =>
  <div>
    <p>{count}</p>
    <button onclick="inc">+</button>
    <button onclick="dec">-</button>
  </div>

var inc = () => { count++ }
var dec = () => { count-- }
```

- **Plain values** (`var count = 0`) → reactive state (each becomes a signal)
- **`render`** → returns JSX, compiled away at build time (never shipped)
- **Functions** (`inc`, `dec`) → actions, bound with `on{event}` attributes
- **Just use the variable** — `count++`, `count = 5`, read `count` — the compiler rewrites to signal access
- The implicit `e` variable gives access to the DOM event in actions
- Binding discovery, DOM paths, prop coercion — all resolved by the compiler

### Actions & event handling

Bind events with `on{event}="action"` attributes. The event name and binding are resolved at build time — only the events your app actually uses get a single global listener via delegation. Zero per-element cost:

```tsx
render = () =>
  <div>
    <button onclick="inc">+</button>
    <input oninput="typed" type="text" />
    <select onchange="pick">...</select>
    <form onsubmit="send">...</form>
    <div onpointerdown="grab" onpointerup="release" />
  </div>
```

Any DOM event works — `click`, `input`, `change`, `submit`, `pointerdown`, `pointerup`, `keydown`, etc.

Actions use plain variables. The implicit `e` gives access to the native DOM event:

```tsx
var inc = () => { count++ }
var typed = () => { query = e.target.value }
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

render = () =>
  <div>
    <div class="preview" style={preview}></div>
    <p>{hex}</p>
    <input type="range" min="0" max="255" data-c="r" oninput="slide" />
    <input type="range" min="0" max="255" data-c="g" oninput="slide" />
    <input type="range" min="0" max="255" data-c="b" oninput="slide" />
  </div>

var slide = () => {
  var ch = e.target.getAttribute("data-c")
  var val = +e.target.value
  if (ch === "r") r = val
  else if (ch === "g") g = val
  else b = val
  preview = "background-color:rgb(" + r + "," + g + "," + b + ")"
  hex = "#" + [r, g, b].map(x => x.toString(16).padStart(2, "0")).join("")
}
```

Dragging any slider updates the `style` attribute on the preview div and the hex text — in real time. Works with any attribute: `class`, `style`, `href`, `src`, `placeholder`, `title`, etc.

Both text content and attributes use the same signal binding mechanism.

### Reactive Props

Top-level variables define the component's state and public API. Attributes placed on the component tag (<my-cmp count="10">) are automatically synced to these signals.

They are fully reactive: changing an attribute at runtime (via JS setAttribute or a parent framework) immediately updates the component's internal state.

The initial value of your variable determines the type coercion:
```ts
// components/card.tsx
var label = "Hello"      // String (default)
var value = 0            // Number (parsed with +)
var active = false       // Boolean (presence/absence)

render = () =>
  <div class={active ? "active" : ""}>
    <h1>{label}: {value}</h1>
  </div>
```

usage
```html
<card- label="Score" value="100" active></card->
```

runtime updates
```js
// In your console or script:
const card = document.querySelector("card-")

// Updates the number signal, re-renders text
card.setAttribute("value", "500")

// Updates boolean signal, toggles class
card.removeAttribute("active")
```

### Lifecycle hooks

Components support `mount` and `unmount` hooks. These are **not** wired as event handlers — they are called automatically by the framework.

```tsx
// components/timer.tsx
var elapsed = 0

render = () => <p>{elapsed}s</p>

var mount = (el) => {
  el._interval = setInterval(() => elapsed++, 1000)
}

var unmount = (el) => {
  clearInterval(el._interval)
}
```

- **`mount(el)`** — called after the component is connected to the DOM. Receives the host element.
- **`unmount(el)`** — called when the component is removed from the DOM. Use it to clean up timers, listeners, etc.

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

## IDE Setup

Add a `tsconfig.json` to your project root for full IDE support (autocomplete, type checking, no red squiggles):

```jsonc
{
    "compilerOptions": {
        "jsx": "react-jsx",
        "jsxImportSource": "micro",
        "module": "esnext",
        "moduleResolution": "bundler",
        "baseUrl": ".",
        "paths": {
            "micro/jsx-runtime": ["path/to/micro/jsx-runtime.ts"]
        },
        "noEmit": true
    },
    "include": ["micro.d.ts", "components/**/*.tsx"]
}
```

And a `micro.d.ts` for compiler-provided globals:

```ts
declare var render: (...args: any[]) => any
declare var e: Event & { target: HTMLInputElement }
```

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
