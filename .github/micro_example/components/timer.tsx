var elapsed = 0
var running = true
var status = "running"

render = () => <div class="card" >
    <h2>Timer</h2>
    <p class={status}>{elapsed}s</p>
    <button onclick="toggle">Pause / Resume</button>
</div >

var toggle = () => {
    running = !running
    status = running ? "running" : "paused"
}

var mount = (el) => {
    el._iv = setInterval(() => { if (running) elapsed++ }, 1000)
}

var unmount = (el) => {
    clearInterval(el._iv)
}
