var rv = 255
var gv = 0
var bv = 0
var hex = "#FF0000"
var swatch = "background:#FF0000"
var hBg = ""
var sBg = "background:linear-gradient(to right,#808080,#FF0000)"
var vBg = "background:linear-gradient(to right,#000,#FF0000)"

var render = (s) =>
    <div class="card picker-card">
        <div class="picker-swatch" style={s.swatch}></div>
        <p class="hex-value">{s.hex}</p>
        <p class="rgb-readout"><span class="ch-r">R {s.rv}</span>  <span class="ch-g">G {s.gv}</span>  <span class="ch-b">B {s.bv}</span></p>
        <label class="slider-row"><span class="ch-label">H</span><input type="range" min="0" max="360" value="0" class="hue-slider" data-c="h" slide /><span class="ch-val">{s.rv}</span></label>
        <label class="slider-row"><span class="ch-label">S</span><div class="track" style={s.sBg}><input type="range" min="0" max="100" value="100" data-c="s" slide /></div><span class="ch-val">{s.gv}</span></label>
        <label class="slider-row"><span class="ch-label">V</span><div class="track" style={s.vBg}><input type="range" min="0" max="100" value="100" data-c="v" slide /></div><span class="ch-val">{s.bv}</span></label>
    </div>

var slide = (s, e) => {
    var c = e.target.getAttribute("data-c")
    var hv = c === "h" ? +e.target.value : s._h || 0
    var sv = c === "s" ? +e.target.value : s._s ?? 100
    var vv = c === "v" ? +e.target.value : s._v ?? 100
    s._h = hv; s._s = sv; s._v = vv

    var h = hv / 60, st = sv / 100, vl = vv / 100
    var cv = vl * st, x = cv * (1 - Math.abs(h % 2 - 1)), m = vl - cv
    var r, g, b
    h < 1 ? (r = cv, g = x, b = 0) : h < 2 ? (r = x, g = cv, b = 0) : h < 3 ? (r = 0, g = cv, b = x)
        : h < 4 ? (r = 0, g = x, b = cv) : h < 5 ? (r = x, g = 0, b = cv) : (r = cv, g = 0, b = x)
    r = Math.round((r + m) * 255); g = Math.round((g + m) * 255); b = Math.round((b + m) * 255)

    s.rv.v = r; s.gv.v = g; s.bv.v = b
    s.hex.v = "#" + [r, g, b].map(c => c.toString(16).padStart(2, "0").toUpperCase()).join("")
    s.swatch.v = "background:" + s.hex.v

    var hh = hv, hr = "hsl(" + hh + ",100%,50%)"
    s.sBg.v = "background:linear-gradient(to right,hsl(" + hh + ",0%," + vv / 2 + "%)," + hr + ")"
    s.vBg.v = "background:linear-gradient(to right,#000,hsl(" + hh + "," + sv + "%,50%))"
}
