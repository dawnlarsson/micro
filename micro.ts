//
//      Dawning Micro V5, ultra tiny reactive components with signals.
//
//      By Dawn Larsson 2025 (github.com/dawnlarsson/micro)
//      License: Apache-2.0 license
//      www.dawning.dev
//
export var doc = document,
        _c,
        evs = ["click", "input", "change", "submit"],
        evIdx = { I: 1, T: 1, S: 2, F: 3 },
        signal = (v) => {
                var subs = new Set;
                return {
                        get v() { _c && subs.add(_c); return v },
                        set v(x) { v = x; for (var f of subs) f() }
                }
        },
        effect = (fn) => { _c = fn; fn(); _c = null },
        component = (name, state, tpl, actions) => {
                var frag = doc.createElement("template");
                frag.innerHTML = tpl;

                customElements.define(name + "-", class extends HTMLElement {
                        connectedCallback() {
                                var s = {}, k;

                                for (k in state) s[k] = signal(Array.isArray(state[k]) ? [...state[k]] : state[k]);

                                for (k of this.getAttributeNames()) {
                                        var a = this.getAttribute(k);
                                        if (s[k]) s[k].v = state[k] === +state[k] ? +a
                                                : state[k] === !!state[k] ? a !== "false" : a;
                                }

                                var dom = frag.content.cloneNode(true),
                                        w = doc.createTreeWalker(dom, 4), p, r = [], nodes = [];

                                while (p = w.nextNode()) nodes.push(p);

                                for (p of nodes) {
                                        var parts = p.data.split(/(\$\$\w+\$\$)/);
                                        if (parts.length < 2) continue;
                                        for (var part of parts) {
                                                var n = doc.createTextNode(part), m = part.match(/^\$\$(\w+)\$\$$/);
                                                p.parentNode.insertBefore(n, p);
                                                m && s[m[1]] && r.push([n, m[1]])
                                        }
                                        p.remove()
                                }

                                var alive = 1;
                                for (let [p, k] of r)
                                        effect(() => { if (alive) p.data = s[k].v });

                                this.appendChild(dom);
                                this._m = { s, actions, kill: () => alive = 0 };
                                actions.mount?.(s, this);
                        }

                        disconnectedCallback() {
                                if (!this._m) return;
                                this._m.kill();
                                actions.unmount?.(this._m.s, this);
                        }
                })
        }

for (let ev of evs)
        doc.addEventListener(ev, e => {
                var el = e.target, tag = el.tagName, r = el;
                while (r && !r._m) r = r.parentElement;
                if (!r) return;
                if (ev !== (evs[evIdx[tag[0]]] || evs[0])) return;
                for (var a of el.attributes)
                        if (r._m.actions[a.name] && !/^(un)?mount$/.test(a.name))
                                return r._m.actions[a.name](r._m.s, e);
        });
