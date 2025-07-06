//
//      Dawning Micro V4, ultra tiny and fast reactivity.
//
//      By Dawn Larsson 2025 (github.com/dawnlarsson/micro)
//      License: Apache-2.0 license
//      www.dawning.dev
//

var components: { [key: string]: any } = {}
var event_count: number = 0;

export const event = (name: string) => {
        addEventListener(name, (e: Event) => {
                var target = e.target.closest("[_]");
                if (target) {
                        components[target.tagName][event_count](e);
                        _draw(target);
                }
        })
        return ++event_count;
};

const _draw = (that) => {
        that.innerHTML = components[that.tagName].draw()
};

class _ extends HTMLElement {
        connectedCallback() {
                this.setAttribute("_", this.tagName); _draw(this)
        }
}

export const component = (name, component_obj: any) => {
        name += "-";
        components[name.toUpperCase()] = component_obj;
        customElements.define(name, _);
}