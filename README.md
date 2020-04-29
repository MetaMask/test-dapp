# MetaMask Test Dapp

This is a simple test dapp for use in MetaMask e2e tests.

Currently hosted [here](https://metamask.github.io/test-dapp/).

## Usage

If you wish to use this dapp in your e2e tests, install this package and set up a script of e.g. the following form:

```shell
static-server node_modules/@metamask/test-dapp/website --port 9011
```

### Development Note: Requires Manual Deployment

After merging or pushing to `master`, please run `yarn deploy` in the package root directory if the contents of the `website/` directory have changed.
