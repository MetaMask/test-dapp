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

  globals: {
    'web3': 'readonly',
    'ethereum': 'readonly',
    'MetamaskOnboarding': 'readonly',
  },

  plugins: [
    'json',
  ],

  extends: [
    '@metamask/eslint-config',
    '@metamask/eslint-config/config/nodejs',
  ],

  ignorePatterns: [
    '*bundle.js',
  ],
}
