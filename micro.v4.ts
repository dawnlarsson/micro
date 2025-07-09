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
                var ev_target = e.target
                var target = ev_target.closest("[_]");
                if (target) {
                        var comp = com(target);
                        comp[ev_target.attributes[0]?.name]?.(comp._[attrget(target)]);
                        _draw(target);
                }
        })
        return ++event_count;
};

const _draw = (that) => {
        var comp = com(that);
        that.innerHTML = comp.draw(comp._[attrget(that)]);
};

class _ extends HTMLElement {
        connectedCallback() {
                var self = this;
                var comp = com(self);
                comp._ ? comp._.push({ ...comp.i }) : comp._ = [{ ...comp.i }];
                self.setAttribute("_", comp._.length - 1);
                _draw(self);
        }
}

export const component = (name, component_obj: any) => {
        name += "-";
        components[name.toUpperCase()] = component_obj;
        customElements.define(name, _);
}