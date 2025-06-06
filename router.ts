//
//      Dawning Micro V3 Router
//
//      By Dawn Larsson 2025 (github.com/dawnlarsson/micro)
//      License: Apache-2.0 license
//      www.dawning.dev
//

import { doc } from './micro.ts';

export var routes: Record<string, [string, () => string, (() => void)?]> = {
        '*': ['404', () => '<h1>404</h1><a href="/">Back</a>']
};

export const route = (url: string | void): void => {
        url = url || location.pathname;

        history.pushState(0, '', url);

        var page = routes[url] || routes['*'];
        doc.title = page[0];

        doc.body.innerHTML = page[1]();
        page[2]?.();
}

export const page = (url: string, title: string, render: () => string, postRender?: () => void): void => {
        routes[url] = [title, render, postRender || null];
};

addEventListener('popstate', () => route());
addEventListener('click', e => {
        const link = (e.target as HTMLElement)?.closest('a[href^="/"]');
        if (link) {
                e.preventDefault();
                route(link.pathname);
        }
});