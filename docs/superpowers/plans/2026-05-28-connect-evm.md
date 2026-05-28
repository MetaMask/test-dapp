# Connect EVM Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `Connect EVM` button that connects through the published `@metamask/connect-evm` package while preserving the current `window.ethereum`, EIP-6963, MetaMask SDK, and WalletConnect flows.

**Architecture:** Keep the change additive. Add a small Connect EVM integration module that creates a singleton `createEVMClient()` instance and returns its EIP-1193 provider through the app's existing `globalContext.provider` path. Update provider capability checks so the app no longer requires `provider.isMetaMask` for active provider initialization.

**Tech Stack:** Yarn v1, webpack, vanilla JavaScript, ethers v5, EIP-1193 provider API, `@metamask/connect-evm`.

---

## File Structure

- Modify: `package.json`
  - Add `@metamask/connect-evm` as a published development dependency to match the existing bundled dapp dependencies.
- Modify: `yarn.lock`
  - Updated by `yarn add --dev @metamask/connect-evm`.
- Create: `src/dapp-metadata.js`
  - Central owner for dapp metadata shared by legacy SDK/Web3Modal and Connect EVM.
- Modify: `src/connections.js`
  - Import `dappMetadata` from the shared module.
  - Keep existing SDK and WalletConnect behavior.
- Create: `src/connect-evm.js`
  - Owns supported network RPC configuration.
  - Owns Connect EVM client singleton creation.
  - Exposes `handleConnectEvm(name, button, isConnected)`.
- Modify: `src/components/connections/connections.js`
  - Add `Connect EVM` button.
- Modify: `src/index.js`
  - Wire `Connect EVM` button.
  - Track Connect EVM connection state.
  - Rename provider capability checks.
  - Add `net_version` fallback.
  - Install/remove listeners for any EIP-1193 provider with event methods.

---

### Task 1: Add Published Dependency And Shared Metadata

**Files:**
- Modify: `package.json`
- Modify: `yarn.lock`
- Create: `src/dapp-metadata.js`
- Modify: `src/connections.js:1-18`

- [ ] **Step 1: Add the package**

Run:

```bash
yarn add --dev @metamask/connect-evm
```

Expected:

- `package.json` has `@metamask/connect-evm` in `devDependencies`.
- `yarn.lock` has entries for `@metamask/connect-evm` and its transitive dependencies.
- Existing dependencies are not removed.

- [ ] **Step 2: Create shared dapp metadata**

Create `src/dapp-metadata.js`:

```javascript
const dappMetadata = {
  name: 'E2e Test Dapp',
  description: 'This is the E2e Test Dapp',
  url: 'https://metamask.github.io/test-dapp/',
};

export default dappMetadata;
```

- [ ] **Step 3: Update `src/connections.js` to import metadata**

Replace the top of `src/connections.js` with:

```javascript
import { MetaMaskSDK } from '@metamask/sdk';
import globalContext, {
  handleNewAccounts,
  handleNewProviderDetail,
  removeProviderDetail,
  setActiveProviderDetail,
  updateFormElements,
  updateSdkConnectionState,
  updateWalletConnectState,
} from '.';
import dappMetadata from './dapp-metadata';

const sdk = new MetaMaskSDK({ dappMetadata });
```

Leave the rest of `src/connections.js` unchanged.

- [ ] **Step 4: Verify dependency and metadata task**

Run:

```bash
yarn lint
```

Expected:

- Exit code `0`.
- No ESLint or Prettier failures.

- [ ] **Step 5: Commit task 1**

Run:

```bash
git add package.json yarn.lock src/dapp-metadata.js src/connections.js
git commit -m "feat: add connect evm dependency"
```

Expected:

- Commit succeeds.

---

### Task 2: Add Connect EVM Integration Module

**Files:**
- Create: `src/connect-evm.js`

- [ ] **Step 1: Create the Connect EVM module**

Create `src/connect-evm.js`:

```javascript
import { createEVMClient } from '@metamask/connect-evm';
import globalContext, {
  handleNewAccounts,
  handleNewProviderDetail,
  removeProviderDetail,
  setActiveProviderDetail,
  updateConnectEvmConnectionState,
  updateFormElements,
} from '.';
import dappMetadata from './dapp-metadata';

export const CONNECT_EVM_PROVIDER_NAME = 'connect-evm';
export const CONNECT_EVM_PROVIDER_UUID = 'connect-evm';

export const CONNECT_EVM_SUPPORTED_NETWORKS = {
  '0x1': 'https://ethereum.publicnode.com',
  '0xaa36a7': 'https://ethereum-sepolia.publicnode.com',
  '0xa': 'https://optimism.publicnode.com',
  '0x89': 'https://polygon-bor.publicnode.com',
  '0x2105': 'https://base.publicnode.com',
  '0xa4b1': 'https://arbitrum-one.publicnode.com',
  '0xa86a': 'https://avalanche-c-chain-rpc.publicnode.com',
  '0x38': 'https://bsc-dataseed.binance.org',
  '0x539': 'http://127.0.0.1:8545',
  '0x53a': 'http://127.0.0.1:8546',
};

export const CONNECT_EVM_CHAIN_IDS = Object.keys(
  CONNECT_EVM_SUPPORTED_NETWORKS,
);

let connectEvmClientPromise;
let connectEvmClient;
let connectEvmProvider;

async function getConnectEvmClient() {
  if (!connectEvmClientPromise) {
    connectEvmClientPromise = createEVMClient({
      dapp: dappMetadata,
      api: {
        supportedNetworks: CONNECT_EVM_SUPPORTED_NETWORKS,
      },
    });
  }

  connectEvmClient = await connectEvmClientPromise;
  return connectEvmClient;
}

function getConnectEvmProviderDetail(provider, name) {
  return {
    info: {
      uuid: CONNECT_EVM_PROVIDER_UUID,
      name,
      icon: './sdk-connect.svg',
      rdns: 'io.metamask',
    },
    provider,
  };
}

function setConnectedButtonState(button) {
  button.innerText = 'Connect EVM - Disconnect';
  button.classList.remove('btn-primary');
  button.classList.add('btn-danger');
}

function setDisconnectedButtonState(button) {
  button.innerText = 'Connect EVM';
  button.classList.add('btn-primary');
  button.classList.remove('btn-danger');
}

export function isConnectEvmProvider(provider) {
  return Boolean(provider && provider === connectEvmProvider);
}

export async function handleConnectEvm(name, button, isConnected) {
  button.disabled = true;

  try {
    const client = await getConnectEvmClient();

    if (isConnected) {
      await client.disconnect();
      handleNewAccounts([]);
      updateFormElements();
      updateConnectEvmConnectionState(false);
      removeProviderDetail(name);
      setDisconnectedButtonState(button);
      globalContext.connected = false;
      return;
    }

    const { accounts } = await client.connect({
      chainIds: CONNECT_EVM_CHAIN_IDS,
    });
    const provider = client.getProvider();
    connectEvmProvider = provider;

    const providerDetail = getConnectEvmProviderDetail(provider, name);
    await setActiveProviderDetail(providerDetail);
    handleNewProviderDetail(providerDetail);
    updateConnectEvmConnectionState(true);
    setConnectedButtonState(button);
    updateFormElements();
    handleNewAccounts(accounts);
  } catch (err) {
    console.error('Error connecting with MetaMask Connect EVM', err);
    if (isConnected) {
      setConnectedButtonState(button);
    } else {
      setDisconnectedButtonState(button);
    }
  } finally {
    button.disabled = false;
  }
}
```

- [ ] **Step 2: Verify module syntax through lint**

Run:

```bash
yarn lint:eslint src/connect-evm.js
```

Expected:

- Exit code `0`.
- No ESLint failures.

- [ ] **Step 3: Commit task 2**

Run:

```bash
git add src/connect-evm.js
git commit -m "feat: add connect evm client helper"
```

Expected:

- Commit succeeds.

---

### Task 3: Add The Connect EVM Button

**Files:**
- Modify: `src/components/connections/connections.js:22-34`

- [ ] **Step 1: Add the button markup**

In `src/components/connections/connections.js`, insert the new button after the existing SDK button and before `<hr />`:

```html
          <button
            class="btn btn-primary btn-lg btn-block mb-3"
            id="connectEvm"
          >
          Connect EVM
          </button>
```

The Connect Actions button block should become:

```javascript
          <button
            class="btn btn-primary btn-lg btn-block mb-3"
            id="walletConnect"
          >
          Wallet Connect
          </button>
          <button
            class="btn btn-primary btn-lg btn-block mb-3"
            id="sdkConnect"
          >
          SDK Connect
          </button>
          <button
            class="btn btn-primary btn-lg btn-block mb-3"
            id="connectEvm"
          >
          Connect EVM
          </button>
          <hr />
```

- [ ] **Step 2: Update nearby commented DOM references**

Update the comment block in `src/components/connections/connections.js` to include the new button:

```javascript
  /*
  const onboardButton = document.getElementById('connectButton');
  const walletConnectBtn = document.getElementById('walletConnect');
  const sdkConnectBtn = document.getElementById('sdkConnect');
  const connectEvmBtn = document.getElementById('connectEvm');
  */
```

- [ ] **Step 3: Verify button markup**

Run:

```bash
yarn lint:eslint src/components/connections/connections.js
```

Expected:

- Exit code `0`.
- No ESLint failures.

- [ ] **Step 4: Commit task 3**

Run:

```bash
git add src/components/connections/connections.js
git commit -m "feat: add connect evm button"
```

Expected:

- Commit succeeds.

---

### Task 4: Wire Connect EVM Into The Main Page

**Files:**
- Modify: `src/index.js:3-7`
- Modify: `src/index.js:174-178`
- Modify: `src/index.js:248-278`

- [ ] **Step 1: Import the Connect EVM handler**

In `src/index.js`, add `handleConnectEvm` to the connection imports:

```javascript
import {
  handleSdkConnect,
  handleWalletConnect,
  walletConnect,
} from './connections';
import { handleConnectEvm } from './connect-evm';
```

- [ ] **Step 2: Read the Connect EVM button**

In the connection button setup block, add:

```javascript
const connectEvmBtn = document.getElementById('connectEvm');
```

The block should be:

```javascript
// Connection buttons set up by this file
const onboardButton = document.getElementById('connectButton');
const walletConnectBtn = document.getElementById('walletConnect');
const sdkConnectBtn = document.getElementById('sdkConnect');
const connectEvmBtn = document.getElementById('connectEvm');
```

- [ ] **Step 3: Track Connect EVM connection state**

Near the existing state declarations, add:

```javascript
let isConnectEvmConnected = false;
```

The block should become:

```javascript
const isMetaMaskConnected = () =>
  globalContext.accounts && globalContext.accounts.length > 0;
let isWalletConnectConnected = false;
let isSdkConnected = false;
let isConnectEvmConnected = false;
```

- [ ] **Step 4: Wire the click handler**

After `sdkConnectBtn.onclick`, add:

```javascript
connectEvmBtn.onclick = async () => {
  await handleConnectEvm(
    'connect-evm',
    connectEvmBtn,
    isConnectEvmConnected,
  );
};
```

- [ ] **Step 5: Export state updater**

After `updateSdkConnectionState`, add:

```javascript
export function updateConnectEvmConnectionState(isConnected) {
  isConnectEvmConnected = isConnected;
}
```

- [ ] **Step 6: Verify main page wiring**

Run:

```bash
yarn lint:eslint src/index.js
```

Expected:

- Exit code `0`.
- No ESLint failures.

- [ ] **Step 7: Commit task 4**

Run:

```bash
git add src/index.js
git commit -m "feat: wire connect evm button"
```

Expected:

- Commit succeeds.

---

### Task 5: Make Provider Initialization EIP-1193 Based

**Files:**
- Modify: `src/index.js:253-255`
- Modify: `src/index.js:467-483`
- Modify: `src/index.js:506-552`
- Modify: `src/index.js:664-731`

- [ ] **Step 1: Replace the MetaMask-only provider gate**

Replace the current `isMetaMaskInstalled` function:

```javascript
const isMetaMaskInstalled = () =>
  globalContext.provider && globalContext.provider.isMetaMask;
```

with:

```javascript
const isProviderAvailableForDapp = () =>
  globalContext.provider &&
  typeof globalContext.provider.request === 'function';

const canSubscribeToProviderEvents = () =>
  globalContext.provider && typeof globalContext.provider.on === 'function';

const removeProviderListener = (eventName, listener) => {
  if (typeof globalContext.provider.removeListener === 'function') {
    globalContext.provider.removeListener(eventName, listener);
  } else if (typeof globalContext.provider.off === 'function') {
    globalContext.provider.off(eventName, listener);
  }
};
```

- [ ] **Step 2: Add `net_version` fallback**

Replace `getNetworkAndChainId` with:

```javascript
const getNetworkAndChainId = async () => {
  try {
    const chainId = await globalContext.provider.request({
      method: 'eth_chainId',
    });
    handleNewChain(chainId);

    let networkId;
    try {
      networkId = await globalContext.provider.request({
        method: 'net_version',
      });
    } catch (err) {
      console.warn('Falling back to eth_chainId for network id', err);
      networkId = `${parseInt(chainId, 16)}`;
    }
    handleNewNetwork(networkId);

    handleEIP1559Support();
  } catch (err) {
    console.error(err);
  }
};
```

- [ ] **Step 3: Update `closeProvider` listener cleanup**

Replace `closeProvider` with:

```javascript
const closeProvider = () => {
  const previousProvider = globalContext.provider;

  handleNewAccounts([]);
  handleNewChain('');
  handleNewNetwork('');

  if (previousProvider && canSubscribeToProviderEvents()) {
    removeProviderListener('chainChanged', handleNewChain);
    removeProviderListener('chainChanged', handleEIP1559Support);
    removeProviderListener('networkChanged', handleNewNetwork);
    removeProviderListener('accountsChanged', handleNewAccounts);
    removeProviderListener('accountsChanged', handleEIP1559Support);
  }
};
```

- [ ] **Step 4: Update `initializeProvider` listener setup**

Replace `initializeProvider` with:

```javascript
const initializeProvider = async () => {
  initializeContracts();
  updateFormElements();

  if (isProviderAvailableForDapp()) {
    if ('autoRefreshOnNetworkChange' in globalContext.provider) {
      globalContext.provider.autoRefreshOnNetworkChange = false;
    }
    await getNetworkAndChainId();

    if (canSubscribeToProviderEvents()) {
      globalContext.provider.on('chainChanged', handleNewChain);
      globalContext.provider.on('chainChanged', handleEIP1559Support);
      globalContext.provider.on('networkChanged', handleNewNetwork);
      globalContext.provider.on('accountsChanged', handleNewAccounts);
      globalContext.provider.on('accountsChanged', handleEIP1559Support);
    }

    try {
      const newAccounts = await globalContext.provider.request({
        method: 'eth_accounts',
      });
      handleNewAccounts(newAccounts);
    } catch (err) {
      console.error('Error on init when getting accounts', err);
    }
  } else {
    handleScrollTo();
  }
};
```

- [ ] **Step 5: Update form enablement**

Replace `updateFormElements` with:

```javascript
export const updateFormElements = () => {
  if (!isProviderAvailableForDapp() || !isMetaMaskConnected()) {
    document.dispatchEvent(new Event('disableAndClear'));
  } else if (isMetaMaskConnected()) {
    globalContext.connected = true;
  }

  updateOnboardElements();
  updateContractElements();
};
```

- [ ] **Step 6: Update onboarding controls**

Replace `updateOnboardElements` with:

```javascript
const updateOnboardElements = () => {
  let onboarding;
  try {
    onboarding = new MetaMaskOnboarding({ forwarderOrigin });
  } catch (error) {
    console.error(error);
  }

  if (!isProviderAvailableForDapp()) {
    onboardButton.innerText = 'Click here to install MetaMask!';
    onboardButton.onclick = () => {
      onboardButton.innerText = 'Onboarding in progress';
      onboardButton.disabled = true;
      onboarding.startOnboarding();
    };
    onboardButton.disabled = false;
    return;
  }

  document.dispatchEvent(new Event('MetaMaskInstalled'));

  if (isMetaMaskConnected()) {
    onboardButton.innerText = 'Connected';
    onboardButton.disabled = true;
    if (onboarding) {
      onboarding.stopOnboarding();
    }
  } else {
    onboardButton.innerText = 'Connect';
    onboardButton.onclick = async () => {
      try {
        const newAccounts = await globalContext.provider.request({
          method: 'eth_requestAccounts',
        });
        handleNewAccounts(newAccounts);
      } catch (error) {
        console.error(error);
      }
    };
    onboardButton.disabled = false;
  }

  if (isWalletConnectConnected) {
    if (onboarding) {
      onboarding.stopOnboarding();
    }
    if ('autoRefreshOnNetworkChange' in globalContext.provider) {
      globalContext.provider.autoRefreshOnNetworkChange = false;
    }
    getNetworkAndChainId();

    if (canSubscribeToProviderEvents()) {
      globalContext.provider.on('chainChanged', handleNewChain);
      globalContext.provider.on('chainChanged', handleEIP1559Support);
      globalContext.provider.on('chainChanged', handleNewNetwork);
      globalContext.provider.on('accountsChanged', handleNewAccounts);
      globalContext.provider.on('accountsChanged', handleEIP1559Support);
    }
  }
};
```

- [ ] **Step 7: Verify provider initialization**

Run:

```bash
yarn lint:eslint src/index.js
```

Expected:

- Exit code `0`.
- No ESLint failures.

- [ ] **Step 8: Commit task 5**

Run:

```bash
git add src/index.js
git commit -m "feat: support eip1193 provider initialization"
```

Expected:

- Commit succeeds.

---

### Task 6: Run Build Verification And Fix Integration Issues

**Files:**
- Modify only files already touched in Tasks 1-5 unless the build output identifies a specific missing browser fallback.

- [ ] **Step 1: Run full lint**

Run:

```bash
yarn lint
```

Expected:

- Exit code `0`.
- No ESLint or Prettier failures.

- [ ] **Step 2: Run production build**

Run:

```bash
yarn build
```

Expected:

- Exit code `0`.
- `dist/main.js` and other build artifacts are emitted.

- [ ] **Step 3: Inspect changed files**

Run:

```bash
git status --short
git diff --stat
```

Expected:

- Source changes match this plan.
- Build artifacts in `dist/` are ignored or intentionally absent from git status.

- [ ] **Step 4: Commit verification fixes**

If Tasks 6.1 or 6.2 required source fixes, run:

```bash
git add package.json yarn.lock src/dapp-metadata.js src/connections.js src/connect-evm.js src/components/connections/connections.js src/index.js
git commit -m "fix: stabilize connect evm integration"
```

Expected:

- Commit succeeds when there are source fixes.
- If there are no source fixes, `git status --short` shows no uncommitted source changes.

---

### Task 7: Manual Smoke Verification

**Files:**
- No planned source edits.

- [ ] **Step 1: Start the dev server**

Run:

```bash
yarn start
```

Expected:

- webpack-dev-server starts on port `9011`.
- The dapp is available at `http://localhost:9011`.

- [ ] **Step 2: Verify existing connection paths**

In a browser, verify:

- `Use window.ethereum` still appears and can select the injected provider when available.
- EIP-6963 provider cards still render when wallets announce providers.
- `Connect` still calls `eth_requestAccounts` on the active provider.
- `SDK Connect` still connects and toggles to `Sdk Connect - Disconnect`.
- `Wallet Connect` still opens Web3Modal.

Expected:

- Existing paths work as they did before this feature.
- No console error appears during initial page load.

- [ ] **Step 3: Verify Connect EVM path**

In a browser, verify:

- `Connect EVM` button appears in the Connect Actions card.
- Clicking `Connect EVM` initiates a MetaMask Connect EVM connection.
- Successful connection changes the button text to `Connect EVM - Disconnect`.
- Active Provider shows:
  - UUID: `connect-evm`
  - Name: `connect-evm`
  - Icon: local SDK icon
- Status shows non-empty Accounts.
- Status shows a ChainId.

Expected:

- Existing transaction/signature panels become enabled after accounts are present.
- The console does not show `net_version` as an uncaught initialization failure.

- [ ] **Step 4: Verify core EIP-1193 requests**

Use the page controls:

- Click `eth_accounts`.
- Click a personal sign action.
- Use the network picker to switch to Sepolia or another configured supported chain.

Expected:

- `eth_accounts` returns the connected account.
- Personal sign opens a wallet request or returns a user-rejection error when rejected.
- Network switching either succeeds or shows the existing network error message without breaking the page.

- [ ] **Step 5: Stop the dev server**

Stop the `yarn start` process with `Ctrl-C`.

Expected:

- Dev server exits cleanly.

---

### Task 8: Final Review

**Files:**
- No planned source edits.

- [ ] **Step 1: Review final diff**

Run:

```bash
git log --oneline -8
git status --short
```

Expected:

- Recent commits correspond to this plan's tasks.
- `git status --short` has no uncommitted source changes.

- [ ] **Step 2: Summarize implementation**

Prepare a final summary containing:

- Dependency added: `@metamask/connect-evm`.
- New button: `Connect EVM`.
- New module: `src/connect-evm.js`.
- Provider initialization change: EIP-1193 `request` capability replaces the old `isMetaMask` gate.
- Verification run: `yarn lint`, `yarn build`, and manual smoke checks.

Expected:

- The summary is short and includes any verification that was not run.
