import { MetaMaskSDK } from '@metamask/sdk';
import {
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

export const initializeWeb3Modal = () => {
  if (!isAndroid) {
    try {
      // eslint-disable-next-line node/global-require
      const { createWeb3Modal, defaultConfig } = require('@web3modal/ethers5');

      const web3Modal = createWeb3Modal({
        ethersConfig: defaultConfig({
          metadata: dappMetadata,
          defaultChainId: 1287,
        }),
        chains: [
          {
            rpcUrl: 'https://moonbase-alpha.drpc.org',
            explorerUrl: 'https://moonbase.moonscan.io',
            currency: 'DEV',
            name: 'Moonbase Alpha',
            chainId: 1287,
          },
        ],
        projectId: 'e6360eaee594162688065f1c70c863b7',
      });

      console.log('Web3Modal initialized successfully');
      return web3Modal;
    } catch (error) {
      console.error('Error initializing Web3Modal', error);
    }
  }

  console.log('Web3Modal is not initialized');
  return null;
};

export const walletConnect = initializeWeb3Modal();

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
    sdk.terminate();
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
  } else {
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
}
