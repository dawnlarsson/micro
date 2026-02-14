
export var jsx = function jsx(tag, props) {
  if (typeof tag === "function")
    return tag(props);
  var children = props?.children;
  delete props?.children;
  if (!tag)
    return flat(children);
  var attrs = "";
  if (props)
    for (var k in props) {
      var v = props[k];
      if (v === !0)
        attrs += " " + k;
      else if (v !== !1 && v != null)
        attrs += ` ${k}="${String(v).replace(/"/g, "&quot;")}"`;
    }
  var inner = flat(children);
  return /^(br|hr|img|input|meta|link)$/i.test(tag) ? `<${tag}${attrs}>` : `<${tag}${attrs}>${inner}</${tag}>`;
};
export var jsxs = jsx;
export var jsxDEV = jsx;
var flat = function flat(c) {
  if (c == null)
    return "";
  return Array.isArray(c) ? c.map(flat).join("") : String(c);
};
export function Fragment(p) { return flat(p.children); }
