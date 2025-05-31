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

## Optional parts:
```js
$$=document.querySelectorAll.bind(document)
```

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

### Form validation

```html
<input id="email" type="email" placeholder="Email">
<button id="submit">Submit</button>
<div id="status"></div>
```

```js
const form = P({ email: '', valid: false }, () => {
  form.valid = /\S+@\S+\.\S+/.test(form.email)
  $('#submit').disabled = !form.valid
  H('#status', form.valid ? '✓ valid' : 'invalid email')
})

_('#email', 'input', e => form.email = e.target.value)
```

### Shopping cart
```html
<button onclick="addToCart('Coffee', 5)">Add Coffee $5</button>
<button onclick="addToCart('Tea', 3)">Add Tea $3</button>
<div id="cart"></div>
```

```js
const cart = P({ items: [], total: 0 }, () => {
  cart.total = cart.items.reduce((sum, item) => sum + item.price, 0)
  
  H('#cart', `
    ${cart.items.map(item => `<div>${item.name} - $${item.price}</div>`).join('')}
    <div><strong>Total: $${cart.total}</strong></div>
  `)
})

window.addToCart = (name, price) => {
  cart.items = [...cart.items, { name, price }]
}
```

### Tabs
```html
<div id="tabs">
  <button class="tab active" data-tab="home">Home</button>
  <button class="tab" data-tab="about">About</button>
  <button class="tab" data-tab="contact">Contact</button>
</div>
<div id="content"></div>
```

```js
const content = {
  home: '<h2>Welcome Home</h2>',
  about: '<h2>About Us</h2>',
  contact: '<h2>Contact Info</h2>'
}

const tabs = P({ active: 'home' }, () => {
  H('#content', content[tabs.active])
  
  $$('.tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.tab === tabs.active)
  })
})

_('#tabs', 'click', e => {
  if (e.target.dataset.tab) {
    tabs.active = e.target.dataset.tab
  }
}, '.tab')

```
