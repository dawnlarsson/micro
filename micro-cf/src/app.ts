import { event, select, on, text } from "../../micro.ts";
import { page, route } from "../../router.ts"

var counter;
var count = 0;
var click = [event('click')];

on(click, 'more', () => text(counter, ++count));
on(click, 'less', () => text(counter, --count));

page('/', 'Home', () => {
        return `<h1>Micro V3 Beta + Cloudflare Workers</h1>
        <a href="/about">About</a>
        <p count>0</p><button more>+</button><button less>-</button>`;
}, () => { count = 0; counter = select('count'); });

page('/about', 'About', () => `<a href="/">Home</a>`);

route();