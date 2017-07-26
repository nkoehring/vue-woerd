const selfClosing = ['img', 'br']

function fromHTML (str, index = 0) {
  let el = { tag: 'div', index, content: '', children: [] }
  let ptr = 0
  let tIdx = 0
  let leaf = el
  str = str.trim()

  if (str[0] === '<') {
    ptr = str.indexOf('>')
    el.tag = str.slice(1, ptr++)
  }

  while (ptr < str.length) {
    const c = str[ptr++]
    const d = str[ptr]
    const i = ptr

    // tag opens
    if (c === '<' && d !== '/') {
      ptr = str.indexOf('>', i)
      const snip = str.slice(i, ptr++)

      // in case the element has properties (eg <a href> instead of just <a>)
      const attrs = {}
      const sepIdx = snip.indexOf(' ')
      let startIdx = sepIdx + 1, endIdx, tag
      let tmp = 3

      if (sepIdx < 0) { // no properties, easy peasy
        tag = snip
      } else {          // has properties, shizzle damnizzle
        tag = snip.slice(0, sepIdx)
        while (tmp--) {
          endIdx = snip.indexOf('=', startIdx)

          if (endIdx < 0) break
          const key = snip.slice(startIdx, endIdx)

          startIdx = endIdx + 2
          endIdx = snip.indexOf('"', startIdx)
          attrs[key] = snip.slice(startIdx, endIdx)

          startIdx = endIdx + 2
        }
      }

      const parent = leaf
      leaf = { tag, attrs, index: leaf.content.length, content: '', children: [] }
      leaf.parent = parent
      parent.children.push(leaf)

      if (selfClosing.indexOf(tag) >= 0) leaf = parent

    // tag closes
    } else if (c === '<' && d === '/') {
      ptr = str.indexOf('>', i)
      const closingTag = str.slice(i+1, ptr++)
      if (closingTag !== leaf.tag)
        console.warn('Malformed HTML! Expected', leaf.tag, 'but got', closingTag)
      else leaf = leaf.parent

    // text node
    } else {
      ptr = str.indexOf('<', ptr)
      leaf.content += c + str.slice(i, ptr)
      if (ptr === -1) ptr = str.length
    }
  }

  return el
}

export default fromHTML
