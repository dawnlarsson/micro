//
//      Dawning Micro V4 Router
//
//      By Dawn Larsson 2025 (github.com/dawnlarsson/micro)
//      License: Apache-2.0 license
//      www.dawning.dev
//
import { doc, registry_event } from "./micro";

export var routes: Record<string, [string, () => string, (() => void)?]> = {
        '*': ['404', '<h1>404</h1><a href="/">Back</a>']
};

export const route = (url: string | void, push = true): void => {
        url = url || location.pathname;

        if (push) history.pushState(0, '', url);

        var page = routes[url] || routes['*'];
        doc.title = page[0];

        doc.body.innerHTML = page[1]();
        page[2]?.();
}

export const page = (url: string, title: string, render: () => string, postRender?: () => void): void => {
        routes[url] = [title, render, postRender || null];
};

registry_event('popstate', () => route(location.pathname, false));

registry_event('click', e => {
        const link = (e.target as HTMLElement)?.closest('a[href^="/"]');
        if (link) {
                e.preventDefault();
                route(link.pathname, true);
        }
});