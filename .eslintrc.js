module.exports = {
  env: {
    'browser': true,
  },
  parserOptions: {
    'ecmaVersion': 2018,
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
