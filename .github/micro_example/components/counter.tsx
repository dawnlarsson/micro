var count = 0

var render = (s) =>
    <div class="card">
        <h2>Counter</h2>
        <p class="value">{s.count}</p>
        <button onclick="dec">-</button>
        <button onclick="inc">+</button>
        <button onclick="reset">Reset</button>
    </div>

var inc = (s) => { s.count.v++ }
var dec = (s) => { s.count.v-- }
var reset = (s) => { s.count.v = 0 }
