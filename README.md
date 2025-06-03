# Micro V2
Single file **Super tiny** "reactive framework", no build systems, no bs.

V2: Typescript & html attributes
- SPA router (Client-side Routing)
- Reactive state & events
- Semantic HTML & JS DX

V1: Pure minified JS

## Examples
#### Counter
```html
<p count>0</p>
<button more>+</button>
<button less>-</button>
```

```ts
import { bind, html, on } from "./micro.ts";

const counter = bind({ count: 0 }, () => {
        html('count', counter.count)
});

on('click', 'more', () => counter.count++);
on('click', 'less', () => counter.count--);
```

Minified JS: **329 bytes**

#### SPA router only
404 is baked in by default
```ts
import { page, go } from "./micro.ts";

page('/', 'Home', () => { return `<a href="/about">about</a>`; });
page('/about', 'about', () => { return `<a href="/">home</a>`; });

go();
```
Minified JS: **610 bytes**

#### SPA router + Micro
```ts
import { page, go, bind, html, on_start, on } from "./micro.ts";

page('/', 'Home', () => {
        return `<h1>Home Page</h1><a href="/about">About</a><p count>0</p><button more>+</button><button less>-</button>`;
});

on_start((page: [string, () => void, () => void]) => {
        const counter = bind({ count: 0 }, () => {
                html('count', counter.count);
        });
        on('click', 'more', () => counter.count++);
        on('click', 'less', () => counter.count--);
});

go()
```

Minified JS: **969 bytes**

#### Todo list
with input sanitization (XSS prevention)
```html
<input todo placeholder="Add task...">
<button add>Add</button>
<ul tasks></ul>
```

```ts
import { field, select, bind, html, on } from "./micro.ts";

const todos = bind({ list: [] }, () => {
        html('tasks', todos.list.map((task, i) =>
                `<li>${task} <button task="${i}">×</button></li>`
        ).join(''));
});

field("todo", (text, submit) => {
        if (!submit) return;

        todos.list = [...todos.list, text];
        select('todo').value = '';

}, ["add"]);

on('click', 'tasks', (e) => {
        if (!e.target.matches('[task]')) return;
        todos.list = todos.list.filter(
                (_, idx) => idx !== parseInt(e.target.getAttribute('task'))
        );
}, '[task]');
```

Minified JS: **892 bytes**

#### Search
```html
<input search placeholder="Search...">
<div results></div>
```

```ts
import { field, bind, html } from "./micro.ts";

const data = ['Apple', 'Banana', 'Cherry', 'Kiwi'];
const search = bind({ results: data }, () => {
        html('results', search.results.map(r => `<div>${r}</div>`).join(''));
});

field("search", (text) => {
        search.results = data.filter(item =>
                item.toLowerCase().includes(text.toLowerCase())
        );
}, [], true);
```

Minified JS: **770 bytes**

## Micro v1 pure JS
Super tiny client side js "framework"
```js
$=document.querySelector.bind(document)
P=(o,r)=>new Proxy(o,{set:(t,k,v)=>(t[k]=v,r?.(),1)})
H=(e,h)=>($(e).innerHTML=h)
_=(e,t,f,s)=>$(e).addEventListener(t,s?x=>{x.target.matches(s)&&f(x)}:f)
```
211 bytes ~63 bytes gzip


#### Optional:
```js
$$=document.querySelectorAll.bind(document)
```

### Example
```html
<div id="display"></div>
<button id="inc">+</button>
<button id="dec">-</button>
```

```js
const counter = P({ count: 0 }, () => {
  H('#display', `Count: ${counter.count}`)
})

_('#inc', 'click', () => counter.count++)
_('#dec', 'click', () => counter.count--)
```
