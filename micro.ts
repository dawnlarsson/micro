//      By Dawn Larsson 2025 (github.com/dawnlarsson/micro)
//      License: Apache-2.0 license
//      www.dawning.dev
//
export var doc = document,
        S = (v, s = new Set) => ({
                get v() { return v },
                set v(x) { v = x; for (var f of s) f() },
                s
        }),
        P = (el, k, s, t) => {
                var a = el.getAttribute(k)
                if (a != null) s.v = t === 1 ? +a : t === 2 ? a !== "false" : a
        },
        B = (d, b) => {
                var w = doc.createTreeWalker(d, 128), c = [], n
                while (n = w.nextNode()) c.push(n)
                b.forEach(r => {
                        var t = doc.createTextNode(r[1].v)
                        c[r[0]].replaceWith(t)
                        r[1].s.add(() => { t.nodeValue = r[1].v })
                })
        },
        A = (d, i, a, s) => {
                var e = d.querySelector("[data-_" + i + "]")
                e.removeAttribute("data-_" + i)
                s.s.add(() => { e.setAttribute(a, s.v) })
        },
        E = {},
        C = (name, tpl, k, setup) => {
                var f = doc.createElement("template")
                f.innerHTML = tpl
                customElements.define(name + "-", class extends HTMLElement {
                        static get observedAttributes() { return k }
                        attributeChangedCallback(n, o, v) {
                                if (this._m && this._m.s[n]) {
                                        var s = this._m.s[n], t = typeof s.v
                                        s.v = t === "number" ? +v : t === "boolean" ? v !== "false" : v
                                }
                        }
                        connectedCallback() {
                                var d = f.content.cloneNode(true)
                                this._m = setup(d, this)
                                this.appendChild(d)
                        }
                        disconnectedCallback() {
                                if (!this._m) return
                                for (var k in this._m.s) this._m.s[k].s.clear()
                                this._m.u?.(this)
                        }
                })
        }
