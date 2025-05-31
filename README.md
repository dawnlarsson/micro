# micro
Super tiny client side js "framework"

the code:
```js
$=document.querySelector.bind(document)
P=(o,r)=>new Proxy(o,{set:(t,k,v)=>(t[k]=v,r?.(),1)})
H=(e,h)=>($(e).innerHTML=h)
_=(e,t,f,s)=>$(e).addEventListener(t,s?x=>{x.target.matches(s)&&f(x)}:f)
```
211 bytes

~63 bytes gzip

# Usage

### Counter
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

### Todo list
```html
<input id="input" placeholder="Add todo...">
<button id="add">Add</button>
<div id="list"></div>
```

```js
const todos = P({ items: [] }, () => {
  H('#list', todos.items.map((item, i) => 
    `<div>${item} <button onclick="remove(${i})">×</button></div>`
  ).join(''))
})

window.remove = i => {
  todos.items = todos.items.filter((_, idx) => idx !== i)
}

_('#add', 'click', () => {
  const input = $('#input')
  if (input.value) {
    todos.items = [...todos.items, input.value]
    input.value = ''
  }
})
```

### Live search
```html
<input id="search" placeholder="Search...">
<div id="results"></div>
```

```js
const data = ['apple', 'banana', 'cherry', 'date']

const search = P({ query: '', results: data }, () => {
  H('#results', search.results.map(r => `<div>${r}</div>`).join(''))
})

_('#search', 'input', e => {
  search.query = e.target.value
  search.results = data.filter(item => 
    item.toLowerCase().includes(search.query.toLowerCase())
  )
})
```

### Event deligation

```html
<div id="container">
  <button data-id="1">Item 1</button>
  <button data-id="2">Item 2</button>
</div>
```

```js
_('#container', 'click', e => {
  console.log('clicked item:', e.target.dataset.id)
}, 'button')

$('#container').innerHTML += '<button data-id="3">Item 3</button>'
```
