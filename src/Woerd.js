import HTMLParser from './htmlparser'

// usage: createNativeEl(document, "div", {attrs: {/*attributes*/}}, [/*children*/])
function createNativeEl(d, tag, attrs, children) {
  const el = d.createElement(tag)
  const keys = Object.keys(attrs)

  for (let i = 0, k = keys[i]; i < keys.length; i++) el.setAttribute(k, attrs[k])
  for (let i = 0; i < children.length; i++) el.appendChild(children[i])

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
export function fromVDOM (node, index = 0) {
  const tag = node.tag
  let content = ""
  let children = []

  for (let i = 0; i < node.children.length; i++) {
    const c = node.children[i]
    if (c.text) content += c.text
    else if (c.tag) children.push(fromVDOM(c, content.length))
  }

  return { tag, index, content, children }
}

// usage: toVDOM (createElementFunc, woerdNode) -> vdomNode
export function toVDOM (h, node) {
  const text = node.content
  let nodes = []
  let lastIdx = 0

  for (let i = 0; i < node.children.length; i++) {
    const c = node.children[i]
    nodes.push(text.slice(lastIdx, c.index))
    nodes.push(toVDOM(h, c))
    lastIdx = c.index
  }

  nodes.push(text.slice(lastIdx))
  return h(node.tag, {attrs: node.attrs}, nodes)
}

// usage: fromNative (HTMLElement) -> woerdNode
export function fromNative (node, index = 0) {
  const tag = node.tagName
  let content = ""
  let children = []

  for (let i = 0; i < node.children.length; i++) {
    const c = node.children[i]
    if (c.nodeType === c.TEXT_NODE)
      content += c.textContent
    else if (c.nodeType === c.ELEMENT_NODE)
      children.push(fromNative(c, content.length))
  }

  return { tag, index, content, children }
}

// usage: toNative ({createElementFunc, createTextNodeFunc}, woerdNode) -> HTMLElement
export function toNative (d, node) {
  const createEl = d.createElement
  const createTxt = d.createTextNode

  const text = node.content
  let nodes = []
  let lastIdx = 0

  for (let i = 0; i < node.children.length; i++) {
    const c = node.children[i]
    nodes.push(createTxt(text.slice(lastIdx, c.index)))
    nodes.push(toNative(d, c))
    lastIdx = c.index
  }

  nodes.push(text.slice(lastIdx))
  return createNativeEl(d, node.tag, node.attrs, nodes)
}
