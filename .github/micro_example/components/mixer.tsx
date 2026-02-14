var rv = 255
var gv = 0
var bv = 0
var hv = 0
var sv = 100
var vv = 100
var hex = "#FF0000"
var swatch = "background:#FF0000"
var hBg = ""
var sBg = "background:linear-gradient(to right,#808080,#FF0000)"
var vBg = "background:linear-gradient(to right,#000,#FF0000)"

render = () => < div class="card picker-card" >
    <div class="picker-swatch" style={swatch}></div>
    <p class="hex-value">{hex}</p>
    <p class="rgb-readout"><span class="ch-r">R {rv}</span>  <span class="ch-g">G {gv}</span>  <span class="ch-b">B {bv}</span></p>
    <label class="slider-row"><span class="ch-label">H</span><input type="range" min="0" max="360" value="0" class="hue-slider" data-c="h" oninput="slide" /><span class="ch-val">{hv}</span></label>
    <label class="slider-row"><span class="ch-label">S</span><div class="track" style={sBg}><input type="range" min="0" max="100" value="100" data-c="s" oninput="slide" /></div><span class="ch-val">{sv}</span></label>
    <label class="slider-row"><span class="ch-label">V</span><div class="track" style={vBg}><input type="range" min="0" max="100" value="100" data-c="v" oninput="slide" /></div><span class="ch-val">{vv}</span></label>
</div >

var slide = () => {
    var c = e.target.getAttribute("data-c")
    var h = c === "h" ? +e.target.value : hv
    var st = c === "s" ? +e.target.value : sv
    var vl = c === "v" ? +e.target.value : vv
    hv = h; sv = st; vv = vl

    var hp = h / 60, sf = st / 100, vf = vl / 100
    var cv = vf * sf, x = cv * (1 - Math.abs(hp % 2 - 1)), m = vf - cv
    var r, g, b
    hp < 1 ? (r = cv, g = x, b = 0) : hp < 2 ? (r = x, g = cv, b = 0) : hp < 3 ? (r = 0, g = cv, b = x)
        : hp < 4 ? (r = 0, g = x, b = cv) : hp < 5 ? (r = x, g = 0, b = cv) : (r = cv, g = 0, b = x)
    r = Math.round((r + m) * 255); g = Math.round((g + m) * 255); b = Math.round((b + m) * 255)

    rv = r; gv = g; bv = b
    hex = "#" + [r, g, b].map(c => c.toString(16).padStart(2, "0").toUpperCase()).join("")
    swatch = "background:" + hex

    var hr = "hsl(" + h + ",100%,50%)"
    sBg = "background:linear-gradient(to right,hsl(" + h + ",0%," + vl / 2 + "%)," + hr + ")"
    vBg = "background:linear-gradient(to right,#000,hsl(" + h + "," + st + "%,50%))"
}
