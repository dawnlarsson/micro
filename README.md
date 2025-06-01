# Micro V2
**Super tiny** "reactive framework", no build systems, no bs.

V2: Typescript and html attributes version for a more semantic DX / HTML

V1: Pure minified JS

copy and past the entire framework:
```ts
const select = (at: string) => document.querySelector(`[${at}]`) as HTMLElement;
const selectAll = (at: string) => document.querySelectorAll(`[${at}]`)
const html = (at: string, content: any): void => { select(at).innerHTML = content }

const bind = <T extends Record<string, any>>(obj: T, render: () => void): T => new Proxy(obj, {
        set: (target, key, value) => { target[key as keyof T] = value; render(); return true }
})

const on = (target: string, at: string, handler: (event: Event) => void, delegation?: string): void => {
        select(at).addEventListener(target, delegation ? (e: Event) => {
                if ((e.target as HTMLElement)?.matches(delegation)) { handler(e) }
        } : handler)
}

const field = (target: string, call: (text: string, submit: boolean) => void, selects: string[] = []): void => {
        var input = select(target) as HTMLInputElement;
        var sanitize = (text: string): string => text.value.replace(/[<>&"']/g, (char) => ({
                '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#x27;'
        }[char] || char)).trim();

        on('input', target, () => { var text = sanitize(input); if (text) call(text, false) });
        on('keypress', target, (e) => { if (e.key !== 'Enter') return; var text = call(input); if (text) call(text, true) });

        selects.forEach(selector => on('click', selector, () => {
                const text = sanitize(input);
                if (text) call(text, true);
        }));
};
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

on('click', 'more', () => counter.count += 1);
on('click', 'less', () => counter.count -= 1);
```

Minified JS: **323 bytes**

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

Minified JS: **870 bytes**

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
