import utf8 from 'utf8'

/**
 * Should be called to get hex representation (prefixed by 0x) of utf8 string
 *
 * Source: https://github.com/ethereum/web3.js/blob/0.20.7/lib/utils/utils.js
 *
 * @method fromUtf8
 * @param {String} string
 * @param {Boolean} allowZero to convert code point zero to 00 instead of end of string
 * @returns {String} hex representation of input string
 */
export function stringToHex (str, allowZero) {
  const _str = utf8.encode(str)
  let hex = ''
  for (let i = 0; i < _str.length; i++) { // eslint-disable-line no-plusplus
    const code = _str.charCodeAt(i)
    if (code === 0) {
      if (allowZero) {
        hex += '00'
      } else {
        break
      }
    } else {
      const n = code.toString(16)
      hex += n.length < 2 ? `0${n}` : n
    }
  }

  return `0x${hex}`
}
