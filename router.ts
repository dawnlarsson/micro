//
//      Dawning Micro V5 Router
//
//      By Dawn Larsson 2025 (github.com/dawnlarsson/micro)
//      License: Apache-2.0 license
//      www.dawning.dev
//
import { doc } from "./micro";

export var routes = {};

export const page = (url, title, render, post?) =>
        routes[url] = [title, render, post];

export const route = (url?, push = true) => {
        url = url || location.pathname;
        if (push) history.pushState(0, '', url);

        var p = routes[url] || routes['*'];
        doc.title = p[0];
        (doc.querySelector('main') || doc.body).innerHTML = p[1]();
        p[2]?.();
};

page('*', '404', () => '<h1>404</h1><a href="/">Back</a>');

addEventListener('popstate', () => route(location.pathname, false));
addEventListener('click', e => {
        var a = (e.target as HTMLElement)?.closest('a[href^="/"]');
        if (a) { e.preventDefault(); route(a.pathname); }
});
