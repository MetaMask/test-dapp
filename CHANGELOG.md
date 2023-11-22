# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [8.0.0]
### Added
- Add `wallet_watchAsset` for ERC1155 ([#272](https://github.com/MetaMask/test-dapp/pull/272))

### Changed
- **BREAKING**: Minimum Node.js version is now 18 ([#264](https://github.com/MetaMask/test-dapp/pull/264))
- Update to webpack 5 ([#264](https://github.com/MetaMask/test-dapp/pull/264))
- Update `eth_signTypedData_v4` example ([#274](https://github.com/MetaMask/test-dapp/pull/274))
- Add `transferFrom` and `approve` to input address for ERC20 contract ([#271](https://github.com/MetaMask/test-dapp/pull/271))

## [7.3.1]
### Fixed
- Fix clickable PPOM section after connecting ([#267](https://github.com/MetaMask/test-dapp/pull/267))

## [7.3.0]
### Added
- Implement EIP6963(Multi) provider detection ([#263](https://github.com/MetaMask/test-dapp/pull/263))

## [7.2.0]
### Added
- Add ability to create multiple tokens and watch all of them ([#259](https://github.com/MetaMask/test-dapp/pull/259))
- Add PPOM setApprovalForAll button. Add token symbols for PPOM buttons ([#258](https://github.com/MetaMask/test-dapp/pull/258))

### Fixed
- Fix legacy send gas to 21000 ([#169](https://github.com/MetaMask/test-dapp/pull/169))
- Fix Network ID incorrectly using chainId value ([#256](https://github.com/MetaMask/test-dapp/pull/256))

## [7.1.0]
### Added
- Add PPOM testing section ([#253](https://github.com/MetaMask/test-dapp/pull/253))

### Changed
- Watch NFT by id instead of generating a watch NFT button for each token id ([#247](https://github.com/MetaMask/test-dapp/pull/247))

## [7.0.2]
### Fixed
- Fix XSS vulnerability on the `contract` query string parameter ([#248](https://github.com/MetaMask/test-dapp/pull/248))

## [7.0.1]
### Fixed
- Fix issue where add watch NFT buttons introduced in `v7.0.0` called `wallet_watchAsset` with parameter tokenId typed as a number, rather than as a string ([#241](https://github.com/MetaMask/test-dapp/pull/241))

## [7.0.0]
### Added
- Add watch NFT buttons that call `wallet_watchAsset` to add NFTs to wallet for NFT contracts deployed through the dapp ([#232](https://github.com/MetaMask/test-dapp/pull/232))

### Changed
- **BREAKING:** Change all instances of the term `collectible` to `NFT` ([#237](https://github.com/MetaMask/test-dapp/pull/237))

## [6.2.0]
### Added
- Add optional URL parameter to scroll to an element on load ([#235](https://github.com/MetaMask/test-dapp/pull/235))

### Changed
- Return all accounts in eth_accounts result ([#233](https://github.com/MetaMask/test-dapp/pull/233))

## [6.1.0]
### Added
- Add page for making a request with query parameters ([#227](https://github.com/MetaMask/test-dapp/pull/227))

## [6.0.0]
### Added
- Add section to trigger wallet_watchAsset ([#222](https://github.com/MetaMask/test-dapp/pull/222))

### Changed
- **BREAKING:** Update minimum Node.js version to v16 ([#225](https://github.com/MetaMask/test-dapp/pull/225))

## [5.7.0]
### Added
- Add input field for setting custom decimals on ERC20 deploy ([#219](https://github.com/MetaMask/test-dapp/pull/219))

### Changed
- Update ERC20 Token contract with non-hardcoded decimals and Permit support ([#220](https://github.com/MetaMask/test-dapp/pull/220))

## [5.6.0]
### Added
- Add Set approval for all and Revoke button to the ERC1155 token section ([#215](https://github.com/MetaMask/test-dapp/pull/215))
- Permit Signature first part ([#217](https://github.com/MetaMask/test-dapp/pull/217))

## [5.5.0]
### Added
- Add ERC1155 token section with Batch Minting and Batch Transfers ([#212](https://github.com/MetaMask/test-dapp/pull/212))

## [5.4.0]
### Added
- Add a Multisig section to test Sending ETH to Multisig Wallets ([#209](https://github.com/MetaMask/test-dapp/pull/209))

## [5.3.0]
### Added
- Add a Sign In With Ethereum (SIWE) section to test signing messages that conform to [EIP-4361 spec](https://eips.ethereum.org/EIPS/eip-4361) ([#164](https://github.com/MetaMask/test-dapp/pull/164))

## [5.2.1]
### Added
- Add button to revoke NFT allowances ([#187](https://github.com/MetaMask/test-dapp/pull/187))

## [5.2.0]
### Added
- Add NFT contract interaction buttons ([#181](https://github.com/MetaMask/test-dapp/pull/181))
- Allow specifying already existing contract address ([#180](https://github.com/MetaMask/test-dapp/pull/180))

## [5.1.1]
### Fixed
- Fix RPC info for local Ganache instance ([#178](https://github.com/MetaMask/test-dapp/pull/178))

## [5.1.0]
### Added
- Use local Ganache instance for `wallet_addEthereumChain` instead of XDAI ([#174](https://github.com/MetaMask/test-dapp/pull/174))

### Fixed
- Fix event used for accessing provider ([#163](https://github.com/MetaMask/test-dapp/pull/163))
- fix: replace networkChanged with chainChanged ([#162](https://github.com/MetaMask/test-dapp/pull/162))
- wait for the transaction to be mined ([#138](https://github.com/MetaMask/test-dapp/pull/138))

## [5.0.0]
### Added
- Add buttons to send transaction and deploy contract that will fail([#139](https://github.com/MetaMask/test-dapp/pull/139))
- add deploy and mint buttons for collectibles flow ([#136](https://github.com/MetaMask/test-dapp/pull/136))
- Add warning when using Test Dapp on Mainnet ([#134](https://github.com/MetaMask/test-dapp/pull/134))
- Add form to send transaction with parameters([#132](https://github.com/MetaMask/test-dapp/pull/132))
- Add button to send EIP1559 transaction ([#117](https://github.com/MetaMask/test-dapp/pull/117))
- Add button to suggest switching Ethereum chains([#102](https://github.com/MetaMask/test-dapp/pull/102))
- Add button to call watch-asset ([#112](https://github.com/MetaMask/test-dapp/pull/112))
- Add button to suggest adding Ethereum chain ([#92](https://github.com/MetaMask/test-dapp/pull/92))

### Fixed
- Remove known hacked address from send flow. ([#129](https://github.com/MetaMask/test-dapp/pull/129))
- Fix decimal unit error in send token flow ([#131](https://github.com/MetaMask/test-dapp/pull/131))
- Fix signTypedData_v3 message ([#133](https://github.com/MetaMask/test-dapp/pull/133))
- Fix repository standardization issues ([#118](https://github.com/MetaMask/test-dapp/pull/118))
- Fix addEthereumChain button disable logic ([#93](https://github.com/MetaMask/test-dapp/pull/93))

[Unreleased]: https://github.com/MetaMask/test-dapp/compare/v8.0.0...HEAD
[8.0.0]: https://github.com/MetaMask/test-dapp/compare/v7.3.1...v8.0.0
[7.3.1]: https://github.com/MetaMask/test-dapp/compare/v7.3.0...v7.3.1
[7.3.0]: https://github.com/MetaMask/test-dapp/compare/v7.2.0...v7.3.0
[7.2.0]: https://github.com/MetaMask/test-dapp/compare/v7.1.0...v7.2.0
[7.1.0]: https://github.com/MetaMask/test-dapp/compare/v7.0.2...v7.1.0
[7.0.2]: https://github.com/MetaMask/test-dapp/compare/v7.0.1...v7.0.2
[7.0.1]: https://github.com/MetaMask/test-dapp/compare/v7.0.0...v7.0.1
[7.0.0]: https://github.com/MetaMask/test-dapp/compare/v6.2.0...v7.0.0
[6.2.0]: https://github.com/MetaMask/test-dapp/compare/v6.1.0...v6.2.0
[6.1.0]: https://github.com/MetaMask/test-dapp/compare/v6.0.0...v6.1.0
[6.0.0]: https://github.com/MetaMask/test-dapp/compare/v5.7.0...v6.0.0
[5.7.0]: https://github.com/MetaMask/test-dapp/compare/v5.6.0...v5.7.0
[5.6.0]: https://github.com/MetaMask/test-dapp/compare/v5.5.0...v5.6.0
[5.5.0]: https://github.com/MetaMask/test-dapp/compare/v5.4.0...v5.5.0
[5.4.0]: https://github.com/MetaMask/test-dapp/compare/v5.3.0...v5.4.0
[5.3.0]: https://github.com/MetaMask/test-dapp/compare/v5.2.1...v5.3.0
[5.2.1]: https://github.com/MetaMask/test-dapp/compare/v5.2.0...v5.2.1
[5.2.0]: https://github.com/MetaMask/test-dapp/compare/v5.1.1...v5.2.0
[5.1.1]: https://github.com/MetaMask/test-dapp/compare/v5.1.0...v5.1.1
[5.1.0]: https://github.com/MetaMask/test-dapp/compare/v5.0.0...v5.1.0
[5.0.0]: https://github.com/MetaMask/test-dapp/releases/tag/v5.0.0
