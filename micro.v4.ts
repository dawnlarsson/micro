//
//      Dawning Micro V4, ultra tiny and fast reactivity.
//
//      By Dawn Larsson 2025 (github.com/dawnlarsson/micro)
//      License: Apache-2.0 license
//      www.dawning.dev
//

var components: { [key: string]: any } = {}
var event_count: number = 0;
const com = (that) => components[that.tagName];
const attrget = (that) => that.getAttribute("_");

export const event = (name: string) => {
        addEventListener(name, (e: Event) => {
                var target = e.target.closest("[_]");
                if (target) {
                        var comp = com(target);
                        comp[event_count](comp.i[attrget(target)]);
                        _draw(target);
                }
        })
        return ++event_count;
};

const _draw = (that) => {
        var comp = com(that);
        that.innerHTML = comp.draw(comp.i[attrget(that)]);
};


class _ extends HTMLElement {
        connectedCallback() {
                var comp = com(this);
                comp.i ? comp.i.push(structuredClone(comp.db)) : comp.i = [structuredClone(comp.db)];
                this.setAttribute("_", comp.i.length - 1); // Also fixed: should be length - 1 for 0-based index
                _draw(this);
        }
}

export const component = (name, component_obj: any) => {
        name += "-";
        components[name.toUpperCase()] = component_obj;
        customElements.define(name, _);
}