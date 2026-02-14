var count = 0
var render = (s) => <p>{s.count} <button inc>+</button> <button dec>-</button></p>
var inc = (s) => { s.count.v++ }
var dec = (s) => { s.count.v-- }
