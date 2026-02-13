//
//      Dawning Micro V5, ultra tiny reactive components with signals.
//
//      By Dawn Larsson 2025 (github.com/dawnlarsson/micro)
//      License: Apache-2.0 license
//      www.dawning.dev
//
export var instances = {},
        instance_count: number = 0,
        doc = document,
        _c;

export function signal(v) {
        var subs = new Set;
        return {
                get v() { _c && subs.add(_c); return v },
                set v(x) { v = x; for (var f of subs) f() }
        }
}

export function effect(fn) { _c = fn; fn(); _c = null }

export function component(name, state, tpl, actions) {
        var frag = doc.createElement("template");
        frag.innerHTML = tpl;

        customElements.define(name + "-", class extends HTMLElement {
                connectedCallback() {
                        var id = name + instance_count++, s = {}, k;

                        for (k in state) s[k] = signal(Array.isArray(state[k]) ? [...state[k]] : state[k]);

                        var dom = frag.content.cloneNode(true),
                                w = doc.createTreeWalker(dom, 4), p, r = [];

                        while (p = w.nextNode()) {
                                var m = p.data.match(/^\$\$(\w+)\$\$$/);
                                m && s[m[1]] && r.push([p, m[1]])
                        }

                        for (var [p, k] of r)
                                ((p, k) => effect(() => p.data = "" + s[k].v))(p, k);

                        this.appendChild(dom);
                        this.setAttribute("_", id);
                        instances[id] = { s, actions };
                }
        })
}

function wire(ev) {
        doc.addEventListener(ev, e => {
                var el = e.target, root = el.closest("[_]");
                if (!root) return;
                var inst = instances[root.getAttribute("_")];
                if (!inst) return;
                var a = el.attributes[0]?.name;
                a && inst.actions[a] && inst.actions[a](inst.s, e);
        })
}

wire("click"); wire("input"); wire("change"); wire("submit");
