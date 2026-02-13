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
                _m;
                connectedCallback() {
                        var id = name + instance_count++, s = {}, k;

                        for (k in state) s[k] = signal(Array.isArray(state[k]) ? [...state[k]] : state[k]);

                        for (k of this.getAttributeNames())
                                if (s[k]) s[k].v = typeof state[k] === "number" ? +this.getAttribute(k)
                                        : typeof state[k] === "boolean" ? this.getAttribute(k) !== "false"
                                                : this.getAttribute(k);

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

                        var alive = true;
                        for (var [p, k] of r)
                                ((p, k) => effect(() => { if (alive) p.data = "" + s[k].v }))(p, k);

                        this.appendChild(dom);
                        this.setAttribute("_", id);
                        instances[id] = { s, actions };
                        this._m = { s, kill: () => alive = false };
                        actions.mount?.(s, this);
                }

                disconnectedCallback() {
                        if (!this._m) return;
                        this._m.kill();
                        var id = this.getAttribute("_");
                        if (id) delete instances[id];
                        actions.unmount?.(this._m.s, this);
                }
        })
}

function handle(ev) {
        doc.addEventListener(ev, e => {
                var el = e.target, root = el.closest("[_]"), tag = el.tagName;
                if (!root) return;
                var inst = instances[root.getAttribute("_")];
                if (!inst) return;
                var expect = /^(input|textarea)$/i.test(tag) ? "input"
                        : /^select$/i.test(tag) ? "change"
                                : /^form$/i.test(tag) ? "submit" : "click";
                if (ev !== expect) return;
                for (var a of el.attributes)
                        if (inst.actions[a.name] && a.name !== "mount" && a.name !== "unmount")
                                return inst.actions[a.name](inst.s, e);
        })
}

handle("click"); handle("input"); handle("change"); handle("submit");
