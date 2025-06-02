# Micro V2
**Super tiny** "reactive framework", no build systems, no bs.

V2: Typescript and html attributes version for a more semantic DX / HTML

V1: Pure minified JS

copy and paste the entire framework:
```ts
const doc = document as Document & {}
const select = (at: string) => doc.querySelector(`[${at}]`) as HTMLElement;
const selectAll = (at: string) => doc.querySelectorAll(`[${at}]`)
const html = (at: string, content: any): void => { select(at).innerHTML = content }
const bind = <T extends Record<string, any>>(obj: T, render: () => void): T => new Proxy(obj, {
        set: (target, key, value) => { target[key as keyof T] = value; render(); return true }
})
const on = (target: string, at: string, handler: (event: Event) => void, delegation?: string): void => {
        select(at).addEventListener(target, delegation ? (e: Event) => {
                if ((e.target as HTMLElement)?.matches(delegation)) { handler(e) }
        } : handler)
}
const field = (target: string, call: (text: string, submit: boolean) => void, selects: string[] = [], allow_empty: boolean = false): void => {
        var input = select(target) as HTMLInputElement;
        var sanitize = (text: any): string => text.value.replace(/[<>&"']/g, (char) => ({
                '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#x27;'
        }[char] || char)).trim();
        on('input', target, () => { var text = sanitize(input); if (allow_empty || text) call(text, false) });
        on('keypress', target, (e) => { if (e.key !== 'Enter') return; var text = sanitize(input); if (allow_empty || text) call(text, true) });
        selects.forEach(selector => on('click', selector, () => { var text = sanitize(input); if (allow_empty || text) call(text, true); }));
};
export { on, bind, html, select, selectAll, field };
```
## Examples
#### Counter
```html
<p count>0</p>
<button more>+</button>
<button less>-</button>
```

```ts
const counter = bind({ count: 0 }, () => {
        html('count', counter.count)
});

on('click', 'more', () => counter.count++);
on('click', 'less', () => counter.count--);
```

Minified JS: **329 bytes**

#### Todo list
with input sanitization (XSS prevention)
```html
<input todo placeholder="Add task...">
<button add>Add</button>
<ul tasks></ul>
```

```ts
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

Minified JS: **888 bytes**

#### Search
```html
<input search placeholder="Search...">
<div results></div>
```

```ts
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

Minified JS: **766 bytes**

## SPA Extension (wip)
```ts
var pages: Record<string, [string, () => string, () => void]> = {};
var post = (page: [string, () => void, () => void]) => { };
const go = (url: string | void): void => {
        if (!url) url = location.pathname;
        const newBody = doc.body.cloneNode(false) as HTMLBodyElement;
        doc.body.parentNode?.replaceChild(newBody, doc.body);
        history.pushState(null, '', url);
        var page = pages[url] || pages['*'];
        doc.title = page[0];
        doc.body.innerHTML = page[1]();
        page[2]?.();
        post(page);
}
addEventListener('popstate', () => go(location.pathname));
addEventListener('click', (e) => {
        const link = (e.target as HTMLElement)?.closest('a[href^="/"]') as HTMLAnchorElement;
        if (!link) return;
        e.preventDefault();
        go(link.pathname);
});
const page = (url: string, title: string, render: () => string, postRender?: () => void): void => {
        pages[url] = [title, render, postRender || (() => { })];
};
page('*', '404', () => { return `404 Not Found <a href="/">Back</a>`; });

const set_post = (p) => { post = p };
export { go, page, pages, set_post };
```

#### use

#### SPA router only
404 is baked in by deafult
```
import { page, go } from "./micro.ts";

page('/', 'Home', () => { return `<a href="/about">about</a>`; });
page('/about', 'about', () => { return `<a href="/">home</a>`; });

go();
```
Minified JS: **629 bytes**

#### SPA router + Micro
```ts
page('/', 'Home', () => {
        return `<h1>Welcome to the Home Page</h1><p>This is the main page of our application.</p><p count>0</p><button more>+</button><button less>-</button>`;
});

page('*', '404 Not Found', () => {
        return `<h1>404 Not Found</h1><p>The page you are looking for does not exist.</p>`;
});

post = (page: [string, () => void, () => void]) => {
        const counter = bind({ count: 0 }, () => {
                html('count', counter.count);
        });
        on('click', 'more', () => counter.count++);
        on('click', 'less', () => counter.count--);
}

go()
```

Minified JS: **1060 bytes**

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
