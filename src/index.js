import * as w from './Woerd'
import HTMLParser from './htmlparser'

const Woerd = {
  HTMLParser,
  fromVDOM: w.fromVDOM,
  toVDOM: w.toVDOM,
  fromNative: w.fromNative,
  toNative: w.toNative
}

export default Woerd
