# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
## [9.4.0]
### Added
- Add malicious send calls ([#401](https://github.com/MetaMask/test-dapp/pull/401))

## [9.3.0]
### Added
- feat: support version 2.0.0 of EIP-5792 ([#402](https://github.com/MetaMask/test-dapp/pull/402))

## [9.2.0]
### Changed
- Support updated send calls result ([#396](https://github.com/MetaMask/test-dapp/pull/396))
- chore: add workflow_dispatch to security-code-scanner ([#392](https://github.com/MetaMask/test-dapp/pull/392))
- Set yarn resolution for `elliptic@^6.6.1` ([#393](https://github.com/MetaMask/test-dapp/pull/393))

### Fixed
- fix: Increase hardcoded gas limit ([#397](https://github.com/MetaMask/test-dapp/pull/397))

## [9.1.0]
### Added
- feat: add EIP-5792 section ([#388](https://github.com/MetaMask/test-dapp/pull/388))
- feat: add send with heavy hex data ([#386](https://github.com/MetaMask/test-dapp/pull/386))

### Changed
- chore: updated icon ([#391](https://github.com/MetaMask/test-dapp/pull/391))

### Fixed
- fix: update send calls default calls ([#389](https://github.com/MetaMask/test-dapp/pull/389))

## [9.0.0]
### Added
- Add SignTypedData primaryType variants: Blur - Order, PermitBatch, PermitSingle, Seaport - BulkOrder ([#376](https://github.com/MetaMask/test-dapp/pull/376))

### Changed
- Move all components to separate files, use shared global state and events for updating cards based on connect / disconnect / deploy contract ([#379](https://github.com/MetaMask/test-dapp/pull/379))

## [8.13.0]
### Changed
- Fix malicious trade order button on test dapp ([#373](https://github.com/MetaMask/test-dapp/pull/373))

## [8.12.0]
### Changed
- Fix enabling EIP-1559 support ([#367](https://github.com/MetaMask/test-dapp/pull/367))

## [8.11.0]
### Added
- Add NFT permit option ([#363](https://github.com/MetaMask/test-dapp/pull/363))
- Add ENS resolution ([#362](https://github.com/MetaMask/test-dapp/pull/362))

## [8.10.0]
### Added
- Add malicious contract interaction as an option ([#356](https://github.com/MetaMask/test-dapp/pull/356))

### Changed
- Updates mmsdk to latest and fixes a bad call when extension doesn't exist ([#354](https://github.com/MetaMask/test-dapp/pull/354))
- Bump MetaMask SDK version to 0.26.5 ([#349](https://github.com/MetaMask/test-dapp/pull/349))
- Refactor permit code ([#351](https://github.com/MetaMask/test-dapp/pull/351))

### Fixed
- Fix the watch all nfts and watch ERC1155 dapp actions to use provider ([#348](https://github.com/MetaMask/test-dapp/pull/348))

## [8.9.0]
### Added
- Add opBnB chain ([#335](https://github.com/MetaMask/test-dapp/pull/335))

### Fixed
- Fix issue with E2E tests failing on Android when running within Detox environment ([#343](https://github.com/MetaMask/test-dapp/pull/343))
- Fix yarn.lock syncing to remove unnecessary dependencies and improve package cleanliness ([#339](https://github.com/MetaMask/test-dapp/pull/339))

## [8.8.0]
### Added
- Add json RPC result text area ([#334](https://github.com/MetaMask/test-dapp/pull/334))
- Add token contract addresses and consolidate names ([#332](https://github.com/MetaMask/test-dapp/pull/332))
- Add SDK support ([#331](https://github.com/MetaMask/test-dapp/pull/331))
- Add Blockaid bypass for send value without 0x prefix ([#329](https://github.com/MetaMask/test-dapp/pull/329))
- Add malicious deeplinks, bypasses and reorg ([#328](https://github.com/MetaMask/test-dapp/pull/328))

### Changed
- Change `eth-sig-util` to `@metamask/eth-sig-util` ([#286](https://github.com/MetaMask/test-dapp/pull/286))

## [8.7.0]
### Added
- Add support for Send EIP1559 tx's without suggested gas values ([#320](https://github.com/MetaMask/test-dapp/pull/320))

### Fixed
- Fix Permit signature domain by following EIP-712 ([#319](https://github.com/MetaMask/test-dapp/pull/319))
- Fix queue transactions with correct malicious recipient address ([#322](https://github.com/MetaMask/test-dapp/pull/322)) 

## [8.6.0]
### Added
- Add deeplinks for Send Eth, Send ERC20 and Approve ERC20 ([#313](https://github.com/MetaMask/test-dapp/pull/313))
- Add get allowance support for ERC20 tokens ([#312](https://github.com/MetaMask/test-dapp/pull/312))

### Fixed
- Fix network status field ([#306](https://github.com/MetaMask/test-dapp/pull/306))
- Fix NFT contract address for Base network ([#315](https://github.com/MetaMask/test-dapp/pull/315))

## [8.5.0]
### Added
- Add Base network support ([#2310](https://github.com/MetaMask/test-dapp/pull/310))

## [8.4.0]
### Added
- Add Malformed Transactions ([#295](https://github.com/MetaMask/test-dapp/pull/295))
- Adds transferFromTokens error to token addresses text box ([#304](https://github.com/MetaMask/test-dapp/pull/304))
- Add Increase Token Allowance btn ([#302](https://github.com/MetaMask/test-dapp/pull/302))

## [8.3.0]
### Fixed
- Replace deprecated `window.ethereum.selectedAddress` property with local account value ([#300](https://github.com/MetaMask/test-dapp/pull/300))

## [8.2.0]
### Added
- Add Wallet Connect support ([#284](https://github.com/MetaMask/test-dapp/pull/284))
- Add Malformed Signatures ([#290](https://github.com/MetaMask/test-dapp/pull/290))

## [8.1.0]
### Added
- Add support for ppom malicious transactions in multiple networks ([#281](https://github.com/MetaMask/test-dapp/pull/281))
- Add support for ppom malicious signatures in multiple networks ([#279](https://github.com/MetaMask/test-dapp/pull/279))
- Add `wallet_revokePermissions` for `eth_accounts` ([#278](https://github.com/MetaMask/test-dapp/pull/278))

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

[Unreleased]: https://github.com/MetaMask/test-dapp/compare/v9.4.0...HEAD
[9.4.0]: https://github.com/MetaMask/test-dapp/compare/v9.3.0...v9.4.0
[9.3.0]: https://github.com/MetaMask/test-dapp/compare/v9.2.0...v9.3.0
[9.2.0]: https://github.com/MetaMask/test-dapp/compare/v9.1.0...v9.2.0
[9.1.0]: https://github.com/MetaMask/test-dapp/compare/v9.0.0...v9.1.0
[9.0.0]: https://github.com/MetaMask/test-dapp/compare/v8.13.0...v9.0.0
[8.13.0]: https://github.com/MetaMask/test-dapp/compare/v8.12.0...v8.13.0
[8.12.0]: https://github.com/MetaMask/test-dapp/compare/v8.11.0...v8.12.0
[8.11.0]: https://github.com/MetaMask/test-dapp/compare/v8.10.0...v8.11.0
[8.10.0]: https://github.com/MetaMask/test-dapp/compare/v8.9.0...v8.10.0
[8.9.0]: https://github.com/MetaMask/test-dapp/compare/v8.8.0...v8.9.0
[8.8.0]: https://github.com/MetaMask/test-dapp/compare/v8.7.0...v8.8.0
[8.7.0]: https://github.com/MetaMask/test-dapp/compare/v8.6.0...v8.7.0
[8.6.0]: https://github.com/MetaMask/test-dapp/compare/v8.5.0...v8.6.0
[8.5.0]: https://github.com/MetaMask/test-dapp/compare/v8.4.0...v8.5.0
[8.4.0]: https://github.com/MetaMask/test-dapp/compare/v8.3.0...v8.4.0
[8.3.0]: https://github.com/MetaMask/test-dapp/compare/v8.2.0...v8.3.0
[8.2.0]: https://github.com/MetaMask/test-dapp/compare/v8.1.0...v8.2.0
[8.1.0]: https://github.com/MetaMask/test-dapp/compare/v8.0.0...v8.1.0
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
