module.exports = {
  parserOptions: {
    'sourceType': 'script',
    'ecmaVersion': 2017,
    'ecmaFeatures': {
      'experimentalObjectRestSpread': true,
      'impliedStrict': true,
      'modules': true,
      'blockBindings': true,
      'arrowFunctions': true,
      'objectLiteralShorthandMethods': true,
      'objectLiteralShorthandProperties': true,
      'templateStrings': true,
      'classes': true,
    },
  },

  env: {
    'browser': true,
  },

  plugins: [
    'json',
  ],

  extends: [
    '@metamask/eslint-config',
    '@metamask/eslint-config/config/nodejs',
  ],

  globals: {
    'web3': true,
  },
}
