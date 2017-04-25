import HTMLParser from './htmlparser'

// tags to support: p, a, b, i, s, img, h[1-6], hr
// <p>Hello <i>World</i>. This <s>was</s><b>is</b> a <i>test</i>.</p>
const content = [
  { tag: 'p', index: 0, content: 'Hello . This  a .', children: [
    { tag: 'i', index: 6, content: 'World', children: [] },
    { tag: 's', index: 13, content: 'was', children: [] },
    { tag: 'b', index: 13, content: 'is', children: [] },
    { tag: 'i', index: 16, content: 'test', children: [] }
  ]}
]

export default {
  name: 'woerd',
  props: {
  },
  data () {
    return {
      content: '<p>Hello <i>World</i>. This <s class="foo">was</s><b>is</b> a <i>test</i>.</p>'
    }
  },
  methods: {
    fromEl (node, index = 0) {
      const tag = node.tag
      let content = ""
      let children = []

      for (let i = 0; i < node.children.length; i++) {
        const c = node.children[i]
        if (c.text) content += c.text
        else if (c.tag) children.push(this.fromEl(c, content.length))
      }

      return { tag, index, content, children }
    },
    toEl (h, node) {
      const text = node.content
      let nodes = []
      let lastIdx = 0

      for (let i = 0; i < node.children.length; i++) {
        const c = node.children[i]
        nodes.push(text.slice(lastIdx, c.index))
        nodes.push(this.toEl(h, c))
        lastIdx = c.index
      }

      nodes.push(text.slice(lastIdx))

      return h(node.tag, nodes)
    }
  },
  render (h) {
    const root = HTMLParser(this.content)
    return this.toEl(h, root)
  }
}
