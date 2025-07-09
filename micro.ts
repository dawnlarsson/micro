//
//      Dawning Micro V4, ultra tiny and fast reactivity.
//
//      By Dawn Larsson 2025 (github.com/dawnlarsson/micro)
//      License: Apache-2.0 license
//      www.dawning.dev
//
export var instances = {},
        event_count, instance_count: number = 0,
        registry_event = (name, e) => addEventListener(name, e),
        doc = document;

export const event = (name: string) => {
        registry_event(name, (e: Event) => {
                var ev_target = e.target, target = ev_target.closest("[_]"), target_name = target?.getAttribute("_"), i = instances[target_name];

                if (target) {
                        i.c[ev_target.attributes[0]?.name]?.(i);
                        target.innerHTML = i.c.draw(i);
                }
        })
        ++event_count;
};

export const component = (name, c: any) => customElements.define(name + "-", class extends HTMLElement {
        connectedCallback() {
                var self = this, self_name = name + instance_count++;
                instances[self_name] = { c, ...c.i }
                self.setAttribute("_", self_name);
                self.innerHTML = c.draw(instances[self_name]);
        }
});
