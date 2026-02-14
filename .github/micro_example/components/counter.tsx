var count = 0

render = () => < div class="card" >
    <h2>Counter</h2>
    <p class="value">{count}</p>
    <button onclick="dec">-</button>
    <button onclick="inc">+</button>
    <button onclick="reset">Reset</button>
</div >

var inc = () => { count++ }
var dec = () => { count-- }
var reset = () => { count = 0 }
