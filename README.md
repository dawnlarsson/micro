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
        select(at).addEventListener(target, delegation ? (event: Event) => {
                if ((event.target as HTMLElement)?.matches(delegation)) { handler(event) }
        } : handler)
}
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
```html
<input todo placeholder="Add task...">
<button add>Add</button>
<ul tasks></ul>
```

```ts
const input = select('todo');

const todos = bind({ list: [] }, () => {
        html('tasks', todos.list.map((task, i) =>
                `<li>${task} <button task="${i}">×</button></li>`
        ).join(''));
});

on('click', 'add', () => {
        if (!input.value.trim()) return;
        todos.list = [...todos.list, input.value];
        input.value = '';
});

on('keypress', 'todo', (e) => {
        if (e.key !== 'Enter') return;
        if (!input.value.trim()) return;

        todos.list = [...todos.list, input.value];
        input.value = '';
});

on('click', 'tasks', (e) => {
        if (!e.target.matches('[task]')) return;
        todos.list = todos.list.filter(
                (_, idx) => idx !== parseInt(e.target.getAttribute('task'))
        );
}, '[task]');
```

Minified JS: **688 bytes**

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
