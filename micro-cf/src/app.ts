import { page, go, bind, html, on_start, on } from "../../micro.ts";

page('/', 'Home', () => {
        return `<h1>Micro + Cloudflare Workers</h1>
        <a href="/about">About</a>
        <p count>0</p>
        <button more>+</button>
        <button less>-</button>`;
});

on_start(() => {
        const counter = bind({ count: 0 }, () => {
                html('count', counter.count);
        });
        on('click', 'more', () => counter.count++);
        on('click', 'less', () => counter.count--);
});

go()