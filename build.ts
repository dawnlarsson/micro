//      By Dawn Larsson 2025 (github.com/dawnlarsson/micro)
//      License: Apache-2.0 license
//      www.dawning.dev
//
import { Glob } from "bun";
import { join, basename } from "path";
import { mkdir, unlink } from "fs/promises";

// --- JSX Runtime (build-time only, never shipped) ---

function jsx(tag, props) {
    if (typeof tag === "function") return tag(props);
    var children = props?.children;
    delete props?.children;
    if (!tag) return flat(children);
    var attrs = "";
    if (props) for (var k in props) {
        var v = props[k];
        if (v === true) attrs += " " + k;
        else if (v !== false && v != null) attrs += ` ${k}="${String(v).replace(/"/g, "&quot;")}"`;
    }
    var inner = flat(children);
    return /^(br|hr|img|input|meta|link)$/i.test(tag)
        ? `<${tag}${attrs}>`
        : `<${tag}${attrs}>${inner}</${tag}>`;
}

function flat(c) {
    if (c == null) return "";
    return Array.isArray(c) ? c.map(flat).join("") : String(c);
}

// Write a tiny JSX module that the temp files import
async function ensureJSXRuntime(dir) {
    var p = join(dir, ".micro_jsx.ts");
    await Bun.write(p, `
export var jsx = ${jsx.toString()};
export var jsxs = jsx;
export var jsxDEV = jsx;
var flat = ${flat.toString()};
export function Fragment(p) { return flat(p.children); }
`);
    return p;
}

// --- Component Parser ---

function parseComponent(src) {
    var lines = src.split("\n"), decls = [], jsxLines = [], cur = [], inJsx = false;
    var stateNames = [];  // track state variable names
    var renderMode = "none"; // "none" | "bare" | "function"

    function flush() {
        if (!cur.length) return;
        var joined = cur.join("\n");
        // Extract the name before transforming
        var nameMatch = joined.match(/^(?:var|const|let)\s+(\w+)\s*=|^(\w+)\s*=/);
        var varName = nameMatch ? (nameMatch[1] || nameMatch[2]) : null;

        // Detect render = () => <jsx> pattern
        if (varName === "render" && /=\s*\([^)]*\)\s*=>\s*</.test(joined)) {
            // Extract the JSX body after the arrow
            var arrowMatch = joined.match(/=\s*\([^)]*\)\s*=>\s*([\s\S]*)$/);
            if (arrowMatch) {
                jsxLines.push(arrowMatch[1]);
                renderMode = "function";
                cur = [];
                return;
            }
        }

        joined = joined
            .replace(/^(?:var|const|let)\s+/, "")
            .replace(/^(\w+)\s*=\s*/, "$1: ");
        decls.push("  " + joined);
        // Track non-function state names (functions have => or function keyword in value)
        if (varName && varName !== "render" && !/:\s*(\([^)]*\)|[\w]+)\s*=>/.test(joined) && !/:\s*function/.test(joined)) {
            stateNames.push(varName);
        }
        cur = [];
    }

    for (var line of lines) {
        // Detect bare JSX: line starts with < (the template)
        if (!inJsx && /^\s*</.test(line)) {
            flush();
            inJsx = true;
            renderMode = "bare";
            jsxLines.push(line);
        } else if (inJsx) {
            // JSX ends when we hit a new top-level var/function declaration or EOF
            if (/^(?:(?:var|const|let)\s+)?\w+\s*=\s*/.test(line)) {
                inJsx = false;
                cur.push(line);
            } else {
                jsxLines.push(line);
            }
        } else if (/^(?:(?:var|const|let)\s+)?\w+\s*=\s*/.test(line)) {
            flush();
            cur.push(line);
        } else if (!cur.length && (line.trim() === "" || /^\/\//.test(line.trim()))) {
            // skip leading blanks and comments
        } else {
            cur.push(line);
        }
    }
    flush();

    // Wrap JSX (bare or from render function) with proxy-compatible render
    if (jsxLines.length) {
        var jsxStr = jsxLines.join("\n");
        if (stateNames.length) {
            var id = stateNames.join("|");
            // Rewrite {varName} to {s.varName} for proxy tracing
            jsxStr = jsxStr.replace(new RegExp(`\\{(${id})\\}`, "g"), "{s.$1}");
        }
        decls.push("  render: (s) =>\n" + jsxStr);
    }

    return `export default {\n${decls.join(",\n")}\n}`;
}

// --- Build ---

// Rewrite signal references in action/mount/unmount function bodies.
// Given signal names [count, name, ...], transforms:
//   count      (read)  → count.v
//   count++    (post)  → count.v++
//   ++count    (pre)   → ++count.v
//   count = x          → count.v = x
//   count += x         → count.v += x
// Skips string literals and template literals. Preserves property access.
function rewriteSignals(fnStr: string, signals: string[]): string {
    if (!signals.length) return fnStr;

    // Tokenize: split into string/template chunks vs code chunks
    // Match strings, template literals, and regex literals to skip them
    var parts = fnStr.split(/((?:"(?:[^"\\]|\\.)*")|(?:'(?:[^'\\]|\\.)*')|(?:`(?:[^`\\]|\\.)*`))/);

    var id = signals.join("|");
    for (var i = 0; i < parts.length; i += 2) {
        var code = parts[i];
        // Assignment: count = / count += / count -= etc.
        code = code.replace(new RegExp(`\\b(${id})\\s*([+\\-*/%&|^]?=(?!=))`, "g"), "$1.v $2");
        // Pre-increment/decrement: ++count / --count
        code = code.replace(new RegExp(`(\\+\\+|\\-\\-)(${id})\\b(?!\\.)`, "g"), "$1$2.v");
        // Post-increment/decrement: count++ / count--
        code = code.replace(new RegExp(`\\b(${id})(\\+\\+|\\-\\-)`, "g"), "$1.v$2");
        // Read: bare identifier not followed by ., not preceded by ., not in assignment position
        code = code.replace(new RegExp(`(?<!\\.)\\b(${id})\\b(?!\\s*[+\\-*/%&|^]?=(?!=))(?!\\.v\\b)(?!\\.)`, "g"), "$1.v");
        parts[i] = code;
    }
    return parts.join("");
}

// Strip user's params from arrow/function, return just the body
function extractBody(fnStr: string): string {
    // Arrow: (s, e) => { ... } or (s, e) => expr or s => expr
    var m = fnStr.match(/^(?:\w+|\([^)]*\))\s*=>\s*([\s\S]*)$/);
    if (m) return m[1];
    // function(s, e) { ... }
    m = fnStr.match(/^function\s*\w*\s*\([^)]*\)\s*\{([\s\S]*)\}$/);
    if (m) return `{${m[1]}}`;
    return fnStr;
}

export async function build(cwd?) {
    cwd = cwd || process.cwd();
    var componentsDir = join(cwd, "components");
    var distDir = join(cwd, "dist");
    var publicDir = join(cwd, "public");
    var microDir = new URL(".", import.meta.url).pathname.replace(/^\/([A-Z]:)/i, "$1");

    console.log("micro build\n");

    var jsxPath = await ensureJSXRuntime(cwd);
    var allEvents = new Set(), componentData = [], names = [];

    for await (var file of new Glob("*.tsx").scan(componentsDir)) {
        var name = basename(file, ".tsx");
        var src = await Bun.file(join(componentsDir, file)).text();
        var valid = parseComponent(src);
        var tmp = join(cwd, `.micro_tmp_${name}.tsx`);
        await Bun.write(tmp, `/** @jsxImportSource ${cwd}/.micro_jsx */\n` + valid);

        // we need the jsx runtime discoverable — write the shim files
        await mkdir(join(cwd, ".micro_jsx"), { recursive: true });
        await Bun.write(join(cwd, ".micro_jsx", "jsx-runtime.ts"),
            `export { jsx, jsxs, Fragment } from "../.micro_jsx.ts";`);
        await Bun.write(join(cwd, ".micro_jsx", "jsx-dev-runtime.ts"),
            `export { jsx as jsxDEV, Fragment } from "../.micro_jsx.ts";`);

        try {
            var mod = await import(tmp);
            var { render, ...rest } = mod.default;

            var state = {}, actions = {};
            for (var [k, v] of Object.entries(rest)) {
                typeof v === "function" ? actions[k] = v : state[k] = v;
            }

            // trace render with proxy — signal refs become $$key$$
            var tpl = render(new Proxy(state, {
                get: (_, k) => `$$${String(k)}$$`
            }));

            if (typeof tpl !== "string") {
                console.error(`  ! ${name}: render didn't return a string`);
                continue;
            }

            // 1. parse event bindings: onclick="action" → bare action attr
            var evMap = {};
            tpl = tpl.replace(/\son(\w+)="(\w+)"/g, (_, ev, act) => {
                evMap[act] = ev;
                allEvents.add(ev);
                return ` ${act}`;
            });

            // 2. parse attribute bindings: attr="$$key$$" → initial value + data-_ marker
            var attrBindings = [], attrIdx = 0;
            tpl = tpl.replace(/([\w-]+)="\$\$(\w+)\$\$"/g, (_, attr, key) => {
                attrBindings.push({ idx: attrIdx, attr, key });
                var initial = state[key] != null ? String(state[key]).replace(/"/g, '&quot;') : '';
                return `${attr}="${initial}" data-_${attrIdx++}`;
            });

            // 3. parse text bindings: $$key$$ → null char markers
            var textBindings = [], textIdx = 0;
            tpl = tpl.replace(/\$\$(\w+)\$\$/g, (_, key) => {
                textBindings.push({ idx: textIdx++, key });
                return `<!---->`;
            });

            // 4. minify HTML template
            tpl = tpl
                .replace(/\s+/g, " ")                        // collapse whitespace
                .replace(/> </g, "><")                        // remove space between tags
                .replace(/="([\w\-#]+)"/g, "=$1")            // unquote simple attr values
                .trim();

            componentData.push({ name, state, actions, tpl, evMap, textBindings, attrBindings });
            names.push(name);
            console.log(`  + ${name}`);
        } finally {
            await unlink(tmp).catch(() => { });
        }
    }

    // cleanup temp files
    await unlink(jsxPath).catch(() => { });
    await unlink(join(cwd, ".micro_jsx", "jsx-runtime.ts")).catch(() => { });
    await unlink(join(cwd, ".micro_jsx", "jsx-dev-runtime.ts")).catch(() => { });
    await import("fs/promises").then(f => f.rm(join(cwd, ".micro_jsx"), { recursive: true })).catch(() => { });

    // bundle: micro.ts runtime (just S and doc)
    var microSrc = await Bun.file(join(microDir, "micro.ts")).text();
    var runtimeSrc = microSrc
        .replace(/\/\/.*$/gm, "")
        .replace(/^export\s+/gm, "")
        .trim();

    // --- generate per-component code ---
    var eventList = [...allEvents];

    // global event map: action → event index
    var globalEvMap = {};
    for (var d of componentData)
        for (var [act, ev] of Object.entries(d.evMap))
            globalEvMap[act] = eventList.indexOf(ev as string);

    var componentCodes = componentData.map((d) => {
        var stateKeys = Object.keys(d.state);

        // state declarations: count = S(0)
        var stateDecls = stateKeys.map(k => {
            var v = d.state[k];
            var init = Array.isArray(v) ? `[...${JSON.stringify(v)}]` : JSON.stringify(v);
            return `${k} = S(${init})`;
        });

        // prop coercion: P(el, key, signal, type) — 0=string, 1=number, 2=bool
        var propLines = stateKeys.map(k => {
            var v = d.state[k];
            var t = typeof v === "number" ? 1 : typeof v === "boolean" ? 2 : 0;
            return `  P(el, ${JSON.stringify(k)}, ${k}, ${t})`;
        });

        // text bindings → B(d, [[idx, signal], ...])
        var textLine = d.textBindings.length
            ? `  B(d, [${d.textBindings.map(tb => `[${tb.idx}, ${tb.key}]`).join(", ")}])`
            : "";

        // attr bindings → A(d, i, attr, signal)
        var attrLines = d.attrBindings.map(ab =>
            `  A(d, ${ab.idx}, ${JSON.stringify(ab.attr)}, ${ab.key})`
        );

        // actions (exclude mount/unmount) — rewrite signal refs
        var actionEntries = Object.entries(d.actions)
            .filter(([k]) => k !== "mount" && k !== "unmount");
        var actionStr = actionEntries
            .map(([k, fn]) => {
                var body = extractBody((fn as Function).toString());
                body = rewriteSignals(body, stateKeys);
                // If body uses `e` (the event), take it as param
                var needsEvent = /\be\b/.test(body);
                return `${k}: ${needsEvent ? "(e)" : "()"} => ${body}`;
            }).join(", ");

        // mount/unmount — rewrite signal refs, inject el param
        var mountLine = d.actions.mount
            ? (() => {
                var body = extractBody((d.actions.mount as Function).toString());
                body = rewriteSignals(body, stateKeys);
                return `  ;((el) => ${body})(el)`;
            })()
            : "";
        var unmountLine = d.actions.unmount
            ? (() => {
                var body = extractBody((d.actions.unmount as Function).toString());
                body = rewriteSignals(body, stateKeys);
                return `, u: (el) => ${body}`;
            })()
            : "";

        // assemble setup function body
        var body = [];
        if (stateDecls.length) body.push(`  var ${stateDecls.join(", ")}`);
        body.push(...propLines);
        if (textLine) body.push(textLine);
        body.push(...attrLines);
        body.push(`  var r = {s: {${stateKeys.join(", ")}}, a: {${actionStr}}${unmountLine}}`);
        if (mountLine) body.push(mountLine);
        body.push("  return r");

        var tplStr = d.tpl.replace(/`/g, "\\`");
        return `C(${JSON.stringify(d.name)}, \`${tplStr}\`, ${JSON.stringify(stateKeys)}, (d, el) => {\n${body.join("\n")}\n})`;
    });

    // global event map assignment
    var evMapCode = Object.keys(globalEvMap).length
        ? `Object.assign(E, ${JSON.stringify(globalEvMap)})`
        : "";

    // --- event delegation — only events actually used ---
    var delegationCode = eventList.length
        ? `;${JSON.stringify(eventList)}.forEach((e, i) => doc.addEventListener(e, ev => {\n` +
        `  var el = ev.target, r = el\n` +
        `  while (r && !r._m) r = r.parentElement\n` +
        `  if (r) for (var a of el.attributes)\n` +
        `    if (r._m.a[a.name] && E[a.name] === i) r._m.a[a.name](ev)\n` +
        `}))`
        : "";

    var entrySrc = runtimeSrc + "\n\n" + componentCodes.join("\n\n") + "\n\n" + evMapCode + "\n\n" + delegationCode;

    // write + minify via Bun.build
    await mkdir(distDir, { recursive: true });
    var entryPath = join(cwd, ".micro_entry.js");
    await Bun.write(entryPath, entrySrc);

    var result = await Bun.build({
        entrypoints: [entryPath],
        minify: true,
        target: "browser",
        outdir: distDir,
        naming: "app.js",
    });

    await unlink(entryPath).catch(() => { });

    // copy public/ → dist/
    var hasIndex = false;
    try {
        for await (var pf of new Glob("**/*").scan(publicDir)) {
            if (pf === "index.html") hasIndex = true;
            await Bun.write(join(distDir, pf), Bun.file(join(publicDir, pf)));
        }
    } catch { }

    // auto-generate index.html if missing
    if (!hasIndex) {
        var tags = names.map(n => `  <${n}-></${n}->`).join("\n");
        await Bun.write(join(distDir, "index.html"),
            `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>micro</title></head>
<body>
${tags}
<script src="/app.js"></script>
</body>
</html>`);
    }

    var appSize = (await Bun.file(join(distDir, "app.js")).text()).length;
    console.log(`\n  → dist/app.js  ${appSize} bytes (minified)`);
    console.log(`  → ${names.length} component(s)\n`);
}

// --- Dev Server ---

var reloadScript = `<script>(function(){var s=new WebSocket("ws://"+location.host+"/_ws");s.onmessage=function(){location.reload()};s.onclose=function(){setTimeout(function(){location.reload()},1000)}})()</script>`;

function serve(cwd?, live?) {
    cwd = cwd || process.cwd();
    var distDir = join(cwd, "dist");
    var sockets = new Set<any>();

    Bun.serve({
        port: 3000,
        async fetch(req, server) {
            if (new URL(req.url).pathname === "/_ws")
                return server.upgrade(req) ? undefined : new Response("fail", { status: 500 });

            var path = new URL(req.url).pathname;
            if (path === "/") path = "/index.html";
            var f = Bun.file(join(distDir, path));
            if (!await f.exists()) return new Response("404", { status: 404 });

            if (live && path.endsWith(".html")) {
                var html = await f.text();
                return new Response(html.replace("</body>", reloadScript + "</body>"),
                    { headers: { "Content-Type": "text/html" } });
            }
            return new Response(f);
        },
        websocket: {
            open(ws) { sockets.add(ws) },
            close(ws) { sockets.delete(ws) },
            message() { }
        }
    });

    console.log("  → http://localhost:3000" + (live ? "  (live reload)\n" : "\n"));
    return () => { for (var ws of sockets) ws.send("reload") };
}

// --- CLI ---

var cmd = Bun.argv[2] || "build";

if (cmd === "build") {
    await build();
} else if (cmd === "dev") {
    await build();
    var reload = serve(undefined, true);

    var cwd = process.cwd();
    var { watch } = await import("fs");
    var timer;
    for (var dir of ["components", "public"]) {
        try {
            watch(join(cwd, dir), { recursive: true }, () => {
                clearTimeout(timer);
                timer = setTimeout(async () => {
                    console.log("  ~ rebuilding...");
                    await build(cwd);
                    reload();
                }, 100);
            });
        } catch { }
    }
} else if (cmd === "serve") {
    serve();
} else {
    console.log(`
  micro — ultra tiny reactive framework

  usage:
    bun micro/build.ts build     compile components → dist/
    bun micro/build.ts dev       build + serve + watch
    bun micro/build.ts serve     serve dist/
`);
}
