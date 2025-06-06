//
//      Dawning Micro V3, ultra tiny and fast reactivity.
//
//      By Dawn Larsson 2025 (github.com/dawnlarsson/micro)
//      License: Apache-2.0 license
//      www.dawning.dev
//

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

/// what → when → how
export const type = (attribute: string, hooks: number[], render: any) => {
        for (const eventIndex of hooks) events[eventIndex].set(attribute, render);
};

// helpers/de-duplication
export const doc = document as Document & {}

export const select = (at: string) => doc.querySelector(`[${at}]`) as HTMLElement;
export const selectAll = (at: string) => doc.querySelectorAll(`[${at}]`)

export const html = (object: HTMLElement, content: any): void => { object.innerHTML = content }
export const text = (object: HTMLElement, content: any): void => { object.textContent = content }