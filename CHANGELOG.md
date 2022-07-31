# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [5.2.0]
### Added
- Add NFT contract interaction buttons ([#181](git+https://github.com/MetaMask/test-dapp/pull/181))
- Allow specifying already existing contract address ([#180](git+https://github.com/MetaMask/test-dapp/pull/180))

## [5.1.1]
### Fixed
- Fix RPC info for local Ganache instance ([#178](git+https://github.com/MetaMask/test-dapp/pull/178))

## [5.1.0]
### Added
- Use local Ganache instance for `wallet_addEthereumChain` instead of XDAI ([#174](git+https://github.com/MetaMask/test-dapp/pull/174))

### Fixed
- Fix event used for accessing provider ([#163](git+https://github.com/MetaMask/test-dapp/pull/163))
- fix: replace networkChanged with chainChanged ([#162](git+https://github.com/MetaMask/test-dapp/pull/162))
- wait for the transaction to be mined ([#138](git+https://github.com/MetaMask/test-dapp/pull/138))

## [5.0.0]
### Added
- Add buttons to send transaction and deploy contract that will fail([#139](git+https://github.com/MetaMask/test-dapp/pull/139))
- add deploy and mint buttons for collectibles flow ([#136](git+https://github.com/MetaMask/test-dapp/pull/136))
- Add warning when using Test Dapp on Mainnet ([#134](git+https://github.com/MetaMask/test-dapp/pull/134))
- Add form to send transaction with parameters([#132](git+https://github.com/MetaMask/test-dapp/pull/132))
- Add button to send EIP1559 transaction ([#117](git+https://github.com/MetaMask/test-dapp/pull/117))
- Add button to suggest switching Ethereum chains([#102](git+https://github.com/MetaMask/test-dapp/pull/102))
- Add button to call watch-asset ([#112](git+https://github.com/MetaMask/test-dapp/pull/112))
- Add button to suggest adding Ethereum chain ([#92](git+https://github.com/MetaMask/test-dapp/pull/92))

### Fixed
- Remove known hacked address from send flow. ([#129](git+https://github.com/MetaMask/test-dapp/pull/129))
- Fix decimal unit error in send token flow ([#131](git+https://github.com/MetaMask/test-dapp/pull/131))
- Fix signTypedData_v3 message ([#133](git+https://github.com/MetaMask/test-dapp/pull/133))
- Fix repository standardization issues ([#118](git+https://github.com/MetaMask/test-dapp/pull/118))
- Fix addEthereumChain button disable logic ([#93](git+https://github.com/MetaMask/test-dapp/pull/93))

[Unreleased]: git+https://github.com/MetaMask/test-dapp/compare/v5.1.1...HEAD
[5.1.1]: git+https://github.com/MetaMask/test-dapp/compare/v5.1.0...v5.1.1
[5.1.0]: git+https://github.com/MetaMask/test-dapp/compare/v5.0.0...v5.1.0
[5.0.0]: git+https://github.com/MetaMask/test-dapp/releases/tag/v5.0.0
