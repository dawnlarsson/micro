// @ts-nocheck
count = 0

render = (s) =>
    <div class="card">
        <h2>Counter</h2>
        <p class="value">{s.count}</p>
        <button dec>-</button>
        <button inc>+</button>
        <button reset>Reset</button>
    </div>

inc = (s) => { s.count.v++ }
dec = (s) => { s.count.v-- }
reset = (s) => { s.count.v = 0 }
