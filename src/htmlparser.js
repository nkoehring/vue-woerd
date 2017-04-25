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
      const sepIdx = snip.indexOf(' ')
      const tag = sepIdx < 0 ? snip : snip.slice(0, sepIdx)
      const parent = leaf
      leaf = { tag, index: leaf.content.length, content: '', children: [] }
      leaf.parent = parent
      parent.children.push(leaf)

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
