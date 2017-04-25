import HTMLParser from './htmlparser'

// tags to support: p, a, b, i, s, img, h[1-6], hr
// <p>Hello <i>World</i>. This <s>was</s><b>is</b> a <i>test</i>.<img src="foo.svg" alt="some image"></p>
const content = [
  { tag: 'p', index: 0, attrs: {}, content: 'Hello . This  a .', children: [
    { tag: 'i', index: 6, attrs: {}, content: 'World', children: [] },
    { tag: 's', index: 13, attrs: {}, content: 'was', children: [] },
    { tag: 'b', index: 13, attrs: {}, content: 'is', children: [] },
    { tag: 'i', index: 16, attrs: {}, content: 'test', children: [] },
    { tag: 'img', index: 17, attrs: {src:'foo.svg', alt:'some image'}, content: '', children: [] }
  ]},
]

export default {
  name: 'woerd',
  props: {
  },
  data () {
    return {
      content: '<p>Hello <i>World</i>. This <s class="foo">was</s><b>is</b> a <i>test</i>.<img src="foo.svg" alt="some image"></p>'
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
      return h(node.tag, {attrs: node.attrs}, nodes)
    }
  },
  render (h) {
    const root = HTMLParser(this.content)
    return this.toEl(h, root)
  }
}
