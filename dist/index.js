(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.woerd = factory());
}(this, (function () { 'use strict';

const selfClosing = ['img', 'br'];

function fromHTML (str, index = 0) {
    let el = { tag: 'div', index, content: '', children: [] };
  let ptr = 0;
  let tIdx = 0;
  let leaf = el;
  str = str.trim();

  if (str[0] === '<') {
    ptr = str.indexOf('>');
    el.tag = str.slice(1, ptr++);
  }

  while (ptr < str.length) {
    const c = str[ptr++];
    const d = str[ptr];
    const i = ptr;

    // tag opens
    if (c === '<' && d !== '/') {
      ptr = str.indexOf('>', i);
      const snip = str.slice(i, ptr++);

      // in case the element has properties (eg <a href> instead of just <a>)
      const attrs = {};
      const sepIdx = snip.indexOf(' ');
      let startIdx = sepIdx + 1, endIdx, tag;
      let tmp = 3;

      if (sepIdx < 0) { // no properties, easy peasy
        tag = snip;
      } else {          // has properties, shizzle damnizzle
        tag = snip.slice(0, sepIdx);
        while (tmp--) {
          endIdx = snip.indexOf('=', startIdx);

          if (endIdx < 0) break
          const key = snip.slice(startIdx, endIdx);

          startIdx = endIdx + 2;
          endIdx = snip.indexOf('"', startIdx);
          attrs[key] = snip.slice(startIdx, endIdx);

          startIdx = endIdx + 2;
        }
      }

      const parent = leaf;
      leaf = { tag, attrs, index: leaf.content.length, content: '', children: [] };
      leaf.parent = parent;
      parent.children.push(leaf);

      if (selfClosing.indexOf(tag) >= 0) leaf = parent;

    // tag closes
    } else if (c === '<' && d === '/') {
      ptr = str.indexOf('>', i);
      const closingTag = str.slice(i+1, ptr++);
      if (closingTag !== leaf.tag)
        console.warn('Malformed HTML! Expected', leaf.tag, 'but got', closingTag);
      else leaf = leaf.parent;

    // text node
    } else {
      ptr = str.indexOf('<', ptr);
      leaf.content += c + str.slice(i, ptr);
      if (ptr === -1) ptr = str.length;
    }
  }

  return el
}

// usage: createNativeEl(document, "div", {attrs: {/*attributes*/}}, [/*children*/])
function createNativeEl(d, tag, attrs, children) {
  const el = d.createElement(tag);
  const keys = Object.keys(attrs);

  for (let i = 0; i < keys.length; i++) {
    const k = keys[i];
    const v = attrs[k];
    el.setAttribute(k, v);
  }
  for (let i = 0; i < children.length; i++) el.appendChild(children[i]);

  return el
}


/*
 * tags to support: p, a, b, i, s, img, h[1-6], hr
 *
 * <p>Hello <i>World</i>. This <s>was</s><b>is</b> a <i>test</i>.<img src="foo.svg" alt="some image"></p>
 * becomes
 * const content = [
 *   { tag: 'p', index: 0, attrs: {}, content: 'Hello . This  a .', children: [
 *     { tag: 'i', index: 6, attrs: {}, content: 'World', children: [] },
 *     { tag: 's', index: 13, attrs: {}, content: 'was', children: [] },
 *     { tag: 'b', index: 13, attrs: {}, content: 'is', children: [] },
 *     { tag: 'i', index: 16, attrs: {}, content: 'test', children: [] },
 *     { tag: 'img', index: 17, attrs: {src:'foo.svg', alt:'some image'}, content: '', children: [] }
 *   ]},
 * ]
 * and vice versa
 */

// usage: fromVDOM (vdomNode) -> woerdNode
function fromVDOM (node, index = 0) {
  const tag = node.tag;
  const attrs = node.data.attrs;
  let content = "";
  let children = [];

  for (let i = 0; i < node.children.length; i++) {
    const c = node.children[i];
    if (c.text) content += c.text;
    else if (c.tag) children.push(fromVDOM(c, content.length));
  }

  return { tag, index, attrs, content, children }
}

// usage: toVDOM (createElementFunc, woerdNode) -> vdomNode
function toVDOM (h, node) {
  const text = node.content;
  let nodes = [];
  let lastIdx = 0;

  for (let i = 0; i < node.children.length; i++) {
    const c = node.children[i];
    nodes.push(text.slice(lastIdx, c.index));
    nodes.push(toVDOM(h, c));
    lastIdx = c.index;
  }

  nodes.push(text.slice(lastIdx));
  return h(node.tag, {attrs: node.attrs}, nodes)
}

// usage: fromNative (HTMLElement) -> woerdNode
function fromNative (node, index = 0) {
  const tag = node.tagName;
  const attrs = {};
  let content = "";
  let children = [];

  for (let i = 0; i < node.attributes.length; i++) {
    const attr = node.attributes[i];
    attrs[attr.name] = attr.value;
  }

  for (let i = 0; i < node.childNodes.length; i++) {
    const c = node.childNodes[i];
    if (c.nodeType === c.TEXT_NODE)
      content += c.textContent;
    else if (c.nodeType === c.ELEMENT_NODE)
      children.push(fromNative(c, content.length));
  }

  return { tag, index, attrs, content, children }
}

// usage: toNative ({createElementFunc, createTextNodeFunc}, woerdNode) -> HTMLElement
function toNative (d, node) {
  const createEl = d.createElement;
  const createTxt = d.createTextNode.bind(d);

  const text = node.content;
  let nodes = [];
  let lastIdx = 0;

  for (let i = 0; i < node.children.length; i++) {
    const c = node.children[i];
    nodes.push(createTxt(text.slice(lastIdx, c.index)));
    nodes.push(toNative(d, c));
    lastIdx = c.index;
  }

  nodes.push(createTxt(text.slice(lastIdx)));
  return createNativeEl(d, node.tag, node.attrs, nodes)
}

const Woerd = {
  HTMLParser: fromHTML,
  fromVDOM: fromVDOM,
  toVDOM: toVDOM,
  fromNative: fromNative,
  toNative: toNative
};

return Woerd;

})));
//# sourceMappingURL=index.js.map
