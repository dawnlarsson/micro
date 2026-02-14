var name = "world"

var render = (s) =>
    <div class="card">
        <h2>Greeter</h2>
        <p class="value">Hello, {s.name}!</p>
        <input type="text" placeholder="Enter a name..." oninput="typing" />
    </div>

var typing = (s, e) => { s.name.v = e.target.value || "world" }
