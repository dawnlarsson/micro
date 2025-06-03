// Micro
const doc = document as Document & {}
export const select = (at: string) => doc.querySelector(`[${at}]`) as HTMLElement;
export const selectAll = (at: string) => doc.querySelectorAll(`[${at}]`)
export const html = (at: string, content: any): void => { select(at).innerHTML = content }

export const bind = <T extends Record<string, any>>(obj: T, render: () => void): T => new Proxy(obj, {
        set: (target, key, value) => { target[key as keyof T] = value; render(); return true }
})

export const on = (target: string, at: string, handler: (event: Event) => void, delegation?: string): void => {
        select(at).addEventListener(target, delegation ? (e: Event) => {
                if ((e.target as HTMLElement)?.matches(delegation)) { handler(e) }
        } : handler)
}

export var sanitize = (text: any): string => text.value.replace(/[<>&"']/g, (char) => ({
        '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#x27;'
}[char] || char)).trim();

export const field = (target: string, call: (text: string, submit: boolean) => void, selects: string[] = [], allow_empty: boolean = false): void => {
        var input = select(target) as HTMLInputElement;
        on('input', target, () => { var text = sanitize(input); if (allow_empty || text) call(text, false) });
        on('keypress', target, (e) => { if (e.key !== 'Enter') return; var text = sanitize(input); if (allow_empty || text) call(text, true) });
        selects.forEach(selector => on('click', selector, () => { var text = sanitize(input); if (allow_empty || text) call(text, true); }));
};

// Router
var router_initialized = false;
var post = (page: [string, () => void, () => void]) => { };

export var pages: Record<string, [string, () => string, (() => void)?]> = {
        '*': ['404', () => '<h1>404</h1><a href="/">Back</a>']
};

export const go = (url: string | void): void => {
        if (!url) url = location.pathname;
        const newBody = doc.body.cloneNode(false) as HTMLBodyElement;
        doc.body.parentNode?.replaceChild(newBody, doc.body);
        history.pushState(0, '', url);
        if (!router_initialized) {
                addEventListener('popstate', go);
                addEventListener('click', (e) => {
                        const link = (e.target as HTMLElement)?.closest('a[href^="/"]') as HTMLAnchorElement;
                        if (!link) return;
                        e.preventDefault();
                        go(link.pathname);
                });
                router_initialized = true;
        }
        var page = pages[url] || pages['*'];
        doc.title = page[0];
        doc.body.innerHTML = page[1]();
        page[2]?.();
        post(page);
}

export const page = (url: string, title: string, render: () => string, postRender?: () => void): void => {
        pages[url] = postRender ? [title, render, postRender] : [title, render];
};

export const on_start = (p) => { post = p };