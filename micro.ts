//
//      Dawning Micro V3, ultra tiny and fast reactivity.
//
//      By Dawn Larsson 2025 (github.com/dawnlarsson/micro)
//      License: Apache-2.0 license
//      www.dawning.dev
//

// helpers/de-duplication
export const doc = document as Document & {}

export const select = (at: string) => doc.querySelector(`[${at}]`) as HTMLElement;
export const selectAll = (at: string) => doc.querySelectorAll(`[${at}]`)

export const html = (object: HTMLElement, content: any): void => { object.innerHTML = content }
export const text = (object: HTMLElement, content: any): void => { object.textContent = content }

export var events = []

export const event = name => {
        const type_map = new Map();

        addEventListener(name, e => {
                for (const [attribute, render] of type_map) {
                        e.target.hasAttribute(attribute) && render(name, e.target);
                }
        });

        return events.push(type_map) - 1;
};

export const on = (event_list: number[], attribute: string, call: any) => {
        for (const eventIndex of event_list) events[eventIndex].set(attribute, call);
};

//export const component = () => { }