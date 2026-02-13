// @ts-nocheck
elapsed = 0
running = true

render = (s) =>
    <div class="card">
        <h2>Timer</h2>
        <p class="value">{s.elapsed}s</p>
        <button toggle>Pause / Resume</button>
    </div>

toggle = (s) => { s.running.v = !s.running.v }

mount = (s, el) => {
    el._iv = setInterval(() => { if (s.running.v) s.elapsed.v++ }, 1000)
}

unmount = (s, el) => {
    clearInterval(el._iv)
}
