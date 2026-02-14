var elapsed = 0
var running = true
var status = "running"

var render = (s) =>
    <div class="card">
        <h2>Timer</h2>
        <p class={s.status}>{s.elapsed}s</p>
        <button onclick="toggle">Pause / Resume</button>
    </div>

var toggle = (s) => {
    s.running.v = !s.running.v
    s.status.v = s.running.v ? "running" : "paused"
}

var mount = (s, el) => {
    el._iv = setInterval(() => { if (s.running.v) s.elapsed.v++ }, 1000)
}

var unmount = (s, el) => {
    clearInterval(el._iv)
}
