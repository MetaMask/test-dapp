# MetaMask Connect EVM Test Dapp Design

## Goal

Add an optional MetaMask Connect EVM connection path to the test dapp without replacing or regressing the existing `window.ethereum`, EIP-6963, MetaMask SDK, or WalletConnect flows.

The user-facing result is an additional `Connect EVM` button in the existing Connect Actions card. Clicking it connects through the published `@metamask/connect-evm` package and makes its EIP-1193 provider the active provider used by the rest of the page.

## Non-Goals

- Do not remove `@metamask/sdk` or change the behavior of the existing `SDK Connect` button.
- Do not replace WalletConnect/Web3Modal.
- Do not make `connect-evm` appear as an EIP-6963 provider unless the package itself provides that support.
- Do not convert the app to React, TypeScript, wagmi, viem, or a new app architecture.
- Do not require an Infura API key for local development.

## Current State

The dapp already centralizes most wallet interactions through `globalContext.provider`. That makes an additional provider source feasible, because existing transaction, signature, permissions, and network components call the active provider through the same EIP-1193 request surface.

The current connection paths are:

- `window.ethereum`, selected on startup when available.
- EIP-6963 provider discovery and manual selection.
- `@metamask/sdk` via `SDK Connect`.
- WalletConnect/Web3Modal via `Wallet Connect`.

The main compatibility issues for `@metamask/connect-evm` are:

- The app treats `globalContext.provider.isMetaMask` as the gate for installing listeners and enabling many controls. The `connect-evm` provider is EIP-1193 compatible but does not expose `isMetaMask`.
- Provider initialization calls `net_version`. `connect-evm` marks `net_version` unsupported, so initialization must derive the decimal network id from `eth_chainId` when `net_version` is unavailable.
- `connect-evm` needs an explicit `api.supportedNetworks` map of hex chain IDs to RPC URLs.

## Approach

Use an additive connection path:

1. Add the published `@metamask/connect-evm` package.
2. Add a focused `src/connect-evm.js` module that owns `createEVMClient`, supported network configuration, connect, disconnect, and provider-detail creation.
3. Add a `Connect EVM` button to the existing Connect Actions card.
4. Wire the new button in `src/index.js` so a successful connection calls `setActiveProviderDetail()` with the `connect-evm` provider.
5. Relax provider capability checks from "is MetaMask installed" to "is this active provider usable by this dapp."
6. Keep legacy provider behavior unchanged where possible.

## Supported Networks

The first implementation supports a stable core set aligned with the dapp's existing sample-contract and network-switching coverage:

- Ethereum Mainnet: `0x1`
- Sepolia: `0xaa36a7`
- OP Mainnet: `0xa`
- Polygon Mainnet: `0x89`
- Base Mainnet: `0x2105`
- Arbitrum One: `0xa4b1`
- Avalanche C-Chain: `0xa86a`
- Binance Smart Chain: `0x38`
- Localhost 8545: `0x539`
- Localhost 8546: `0x53a`

Use public RPC URLs for public networks only where they are acceptable for a test dapp. Local chains use `http://127.0.0.1:8545` and `http://127.0.0.1:8546`.

The network picker continues to display more chains than `connect-evm` supports. If a user selects an unsupported chain while `connect-evm` is active, the app shows the existing network error path instead of breaking the active provider state.

## Components

### `src/connect-evm.js`

Responsibilities:

- Import `createEVMClient` from `@metamask/connect-evm`.
- Keep a singleton client promise so repeated clicks do not create competing clients.
- Define `CONNECT_EVM_SUPPORTED_NETWORKS`.
- Define `CONNECT_EVM_CHAIN_IDS` from the supported network keys.
- Initialize the client with existing dapp metadata:
  - `name: 'E2e Test Dapp'`
  - `description: 'This is the E2e Test Dapp'`
  - `url: 'https://metamask.github.io/test-dapp/'`
- Pass `api.supportedNetworks`.
- Expose `handleConnectEvm(name, button, isConnected)`.
- On connect:
  - call `client.connect({ chainIds: CONNECT_EVM_CHAIN_IDS })`
  - get `client.getProvider()`
  - create a provider detail shaped like existing EIP-6963 details
  - set it active
  - update accounts and button state
- On disconnect:
  - call `client.disconnect()`
  - clear accounts and active UI state
  - remove the provider detail
  - restore button text and style

### `src/components/connections/connections.js`

Add a new button:

- `id="connectEvm"`
- text: `Connect EVM`
- same existing button classes as `SDK Connect` and `Wallet Connect`

Do not rearrange or rename existing controls.

### `src/index.js`

Responsibilities:

- Import the `connect-evm` handler.
- Track `isConnectEvmConnected` alongside SDK and WalletConnect state.
- Wire `connectEvmBtn.onclick`.
- Export `updateConnectEvmConnectionState`.
- Treat the `connect-evm` provider as an active provider that gets:
  - `chainChanged`
  - `accountsChanged`
  - `disconnect`, if supported by the provider
- Avoid duplicating listeners when providers change.

Provider capability checks are renamed away from install-specific language:

- `isMetaMaskInstalled()` becomes `isProviderAvailableForDapp()`.
- The check returns true when `globalContext.provider` has a `request` function and either:
  - `provider.isMetaMask` is true, or
  - the selected provider detail is the `connect-evm` provider, or
  - the provider was selected from EIP-6963 or WalletConnect.

Existing call sites are updated to use `isProviderAvailableForDapp()` without changing the behavior of legacy providers.

## Data Flow

Connection flow:

1. User clicks `Connect EVM`.
2. The handler initializes or reuses the `createEVMClient()` singleton.
3. The handler calls `client.connect({ chainIds })`.
4. The handler retrieves `client.getProvider()`.
5. The handler builds a provider detail:
   - `info.uuid`: a stable local identifier, such as `connect-evm`
   - `info.name`: `connect-evm`
   - `info.icon`: `./sdk-connect.svg` unless a better local asset is added
   - `info.rdns`: `io.metamask`
   - `provider`: the EIP-1193 provider
6. `setActiveProviderDetail()` installs the provider as `globalContext.provider`.
7. Existing status, account, network, contract, transaction, and signature components continue through `globalContext.provider`.

Disconnect flow:

1. User clicks `Connect EVM - Disconnect`.
2. The handler calls `client.disconnect()`.
3. The handler clears accounts, removes the provider detail, updates button state, and emits the same local UI state changes as the other connection paths.
4. If the active provider was `connect-evm`, reset active provider status in the UI without changing other provider entries.

## Network and Chain Handling

`getNetworkAndChainId()` continues to call `eth_chainId` first.

For `net_version`:

- Existing providers keep their current behavior.
- If `net_version` fails with an unsupported-method error or any error from `connect-evm`, derive the decimal network id from `eth_chainId`.
- Continue calling `handleNewNetwork(networkId)` with a string network id.

`wallet_switchEthereumChain` is supported by `connect-evm` for configured chains. The network picker uses existing error UI for unsupported chains or wallet rejections.

## Error Handling

Button behavior:

- Disable the `Connect EVM` button while a connection or disconnect is in progress.
- Restore the previous label and style on failure.
- Log connection errors to the console, following the existing dapp pattern.
- Do not clear an already active non-Connect-EVM provider if Connect EVM connection fails.

Known user-facing errors:

- `4001`: user rejected the request.
- `-32002`: connection request already pending.
- unsupported chain: show the existing network error path.
- unsupported RPC method: show the requesting component's existing error display.

Unsupported methods are acceptable for this test dapp as long as they fail locally in the specific test panel and do not break provider initialization or global UI state.

## Testing

Automated checks:

- `yarn lint`
- `yarn build`

Manual smoke checks:

- Existing `window.ethereum` startup path still works.
- EIP-6963 providers still render and can become active.
- Existing `Connect` button still calls `eth_requestAccounts`.
- Existing `SDK Connect` button still connects and disconnects.
- Existing `Wallet Connect` button still opens and connects as before.
- New `Connect EVM` button connects, updates accounts, active chain, and active provider display.
- `Connect EVM - Disconnect` clears the Connect EVM session and button state.
- `eth_accounts`, `eth_chainId`, `personal_sign`, and a simple transaction request work when supported by the connected wallet.
- Network picker switches to a configured supported chain.
- Network picker failure for unsupported chains does not break the app.
- A component using `net_version` fallback initializes correctly under Connect EVM.

## Documentation References

- MetaMask Connect EVM introduction: https://docs.metamask.io/metamask-connect/evm/
- MetaMask Connect EVM JavaScript quickstart: https://docs.metamask.io/metamask-connect/evm/quickstart/javascript/
- Local package source audited for compatibility: `/Users/aphex/repos/metamask/connect-monorepo/packages/connect-evm`

## Acceptance Criteria

- The repo depends on the published `@metamask/connect-evm` package.
- The Connect Actions card includes a `Connect EVM` button.
- Clicking `Connect EVM` connects through `@metamask/connect-evm`.
- The provider returned by `client.getProvider()` becomes the app's active provider.
- Existing connection paths continue to work.
- Provider initialization no longer depends on `net_version` succeeding.
- Existing request/signature/transaction panels remain disabled until an active provider and account are available.
- Lint and production build pass.
