import { component, event } from "../../micro.ts"
import { page, route } from "../../router.ts"

event("click");

component("counter", {

        i: { count: 0 },

        more(i) { i.count++ },
        less(i) { i.count-- },

        draw(i) {
                return "<p>" + i.count + "</p><button more>+</button><button less>-</button>";
        }
});

page('/', 'Home', () => `<h1>Home Page</h1><a href="/about">About</a><counter-></counter->`);
page('/about', 'About', () => `<a href="/">Home</a>`);

route();