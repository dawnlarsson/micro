// Micro JSX runtime — types only, never shipped to browser.
// The real JSX runtime is generated at build time by build.ts.

export namespace JSX {
    type Element = string
    interface IntrinsicElements { [k: string]: any }
    interface ElementChildrenAttribute { children: {} }
}

export function jsx(tag: string, props: any): string { return "" }
export function jsxs(tag: string, props: any): string { return "" }
export function Fragment(props: { children?: any }): string { return "" }
