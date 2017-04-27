import HTMLParser from './htmlparser'

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

function fromEl (node, index = 0) {
  const tag = node.tag
  let content = ""
  let children = []

  for (let i = 0; i < node.children.length; i++) {
    const c = node.children[i]
    if (c.text) content += c.text
    else if (c.tag) children.push(fromEl(c, content.length))
  }

  return { tag, index, content, children }
}

function toEl (h, node) {
  const text = node.content
  let nodes = []
  let lastIdx = 0

  for (let i = 0; i < node.children.length; i++) {
    const c = node.children[i]
    nodes.push(text.slice(lastIdx, c.index))
    nodes.push(toEl(h, c))
    lastIdx = c.index
  }

  nodes.push(text.slice(lastIdx))
  return h(node.tag, {attrs: node.attrs}, nodes)
}

export default {
  functional: true,
  name: 'woerd',
  props: {
    content: {
      type: String,
      default: '<p>Hello <i>World</i>. This <s class="foo">was</s><b>is</b> a <i>test</i>.<img src="foo.svg" alt="some image"></p>'
    }
  },
  methods: {
  },
  render (h, ctx) {
    const root = HTMLParser(ctx.props.content)
    return toEl(h, root)
  }
}
