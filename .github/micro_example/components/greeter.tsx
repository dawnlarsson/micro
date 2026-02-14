var name = "world"

render = () => < div class="card" >
    <h2>Greeter</h2>
    <p class="value">Hello, {name}!</p>
    <input type="text" placeholder="Enter a name..." oninput="typing" />
</div >

var typing = () => { name = e.target.value || "world" }
