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

const dappMetadata = {
  name: 'E2e Test Dapp',
  description: 'This is the E2e Test Dapp',
  url: 'https://metamask.github.io/test-dapp/',
};

// eslint-disable-next-line require-unicode-regexp
const isAndroid = /Android/i.test(navigator.userAgent);

const sdk = new MetaMaskSDK({ dappMetadata });

export const initializeAppKit = () => {
  if (!isAndroid) {
    try {
      // eslint-disable-next-line node/global-require
      const { createAppKit } = require('@reown/appkit')
      const { arbitrum, mainnet, sepolia, zksync, optimism, base, unichain } = require('@reown/appkit/networks')
      const { Ethers5Adapter } = require('@reown/appkit-adapter-ethers5')

      const dappMetadata = {
        name: 'E2e Test Dapp',
        description: 'This is the E2e Test Dapp',
        url: 'https://metamask.github.io/test-dapp/',
      };
      const projectId = "e6360eaee594162688065f1c70c863b7"

      const web3Modal = createAppKit({
        adapters: [new Ethers5Adapter()],
        networks: [arbitrum, mainnet, sepolia, zksync, optimism, base, unichain],
        dappMetadata,
        projectId,
        features: {
          email: false,
          socials: [
            "farcaster",
          ],
          emailShowWallets: true, // default to true
        },
      })
      console.log('Web3Modal initialized successfully');
      return web3Modal;
    } catch (error) {
      console.error('Error initializing Web3Modal', error);
    }

  }

  console.log('Web3Modal is not initialized');
  return null;
};

export const walletConnect = initializeAppKit();

function _setProviderDetail(provider, name, uuid) {
  const providerDetail = {
    info: {
      uuid,
      name,
      icon: `./${name}.svg`,
      rdns: 'io.metamask',
    },
    provider,
  };
  return providerDetail;
}

export async function handleSdkConnect(name, button, isConnected) {
  if (isConnected) {
    handleNewAccounts([]);
    updateFormElements();
    updateSdkConnectionState(false);
    removeProviderDetail(name);
    await sdk.terminate();
    button.innerText = 'Sdk Connect';
    button.classList.add('btn-primary');
    button.classList.remove('btn-danger');
  } else {
    await sdk.connect();
    const provider = sdk.getProvider();
    const uuid = sdk.getChannelId();
    const providerDetail = _setProviderDetail(provider, name, uuid);
    await setActiveProviderDetail(providerDetail);
    handleNewProviderDetail(providerDetail);
    updateSdkConnectionState(true);
    button.innerText = 'Sdk Connect - Disconnect';
    button.classList.remove('btn-primary');
    button.classList.add('btn-danger');

    updateFormElements();

    try {
      const newAccounts = await provider.request({
        method: 'eth_accounts',
      });
      handleNewAccounts(newAccounts);
    } catch (err) {
      console.error('Error on init when getting accounts', err);
    }
  }
}

export async function handleWalletConnect(name, button, isConnected) {
  if (isConnected) {
    handleNewAccounts([]);
    updateFormElements();
    updateWalletConnectState(false);
    removeProviderDetail(name);
    button.innerText = 'Wallet Connect';
    button.classList.add('btn-primary');
    button.classList.remove('btn-danger');
    globalContext.connected = false;
  } else {
    console.log("WTF")
    const { provider } = walletConnect.getWalletProvider();
    const uuid = provider.signer.uri;
    const providerDetail = _setProviderDetail(provider, name, uuid);
    await setActiveProviderDetail(providerDetail);
    handleNewProviderDetail(providerDetail);
    updateWalletConnectState(true);
    button.innerText = 'Wallet Connect - Disconnect';
    button.classList.remove('btn-primary');
    button.classList.add('btn-danger');

    updateFormElements();

    try {
      const newAccounts = await provider.request({
        method: 'eth_accounts',
      });
      handleNewAccounts(newAccounts);
    } catch (err) {
      console.error('Error on init when getting accounts', err);
    }
  }
  globalContext.connected = true;
}
