import { event, select, type, text } from "../../micro.ts";
import { page, route } from "../../router.ts"

var click = event('click');
var counter;
var count = 0;

type('more', [click], () => {
        text(counter, ++count);
});

type('less', [click], () => {
        text(counter, --count);
});

page('/', 'Home', () => {
        return `<h1>Micro V3 Beta + Cloudflare Workers</h1>
        <a href="/about">About</a>
        <p count>0</p>
        <button more>+</button>
        <button less>-</button>`;
}, () => { count = 0; counter = select('count'); });

page('/about', 'About', () => `<a href="/">Home</a>`);

route();