import { createWeb3Modal, defaultConfig } from '@web3modal/ethers5';
import { MetaMaskSDK } from '@metamask/sdk';
import {
  handleNewAccounts,
  updateFormElements,
  setActiveProviderDetail,
  handleNewProviderDetail,
  updateSdkConnectionState,
  updateWalletConnectState,
} from '.';

const dappMetadata = {
  name: 'E2e Test Dapp',
  description: 'This is the E2e Test Dapp',
  url: 'https://metamask.github.io/test-dapp/',
};

const sdk = new MetaMaskSDK({ dappMetadata });

export const walletConnect = createWeb3Modal({
  ethersConfig: defaultConfig({ metadata: dappMetadata }),
  projectId: 'e6360eaee594162688065f1c70c863b7', // test id
});

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

async function _updateDappWithProviderConnected(provider, providerDetail, name, button) {
  setActiveProviderDetail(providerDetail);
  handleNewProviderDetail(providerDetail);

  switch (name) {
    case 'wallet-connect':
      updateWalletConnectState(true);
      button.innerText = 'Wallet Connect Connected';
      break;
    case 'sdk-connect':
      updateSdkConnectionState(true);
      button.innerText = 'Sdk Connect Connected';
      break;
  }

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

async function _updateDappWithProviderDisconnected(name, button) {
  handleNewAccounts([]);
  updateFormElements();
  switch (name) {
    case 'wallet-connect':
      updateWalletConnectState(false);
      button.innerText = 'Wallet Connect';
      break;
    case 'sdk-connect':
      updateSdkConnectionState(false);
      button.innerText = 'Sdk Connect';
      break;
  }
}

export async function handleSdkConnect(name, button, isConnected) {
  if (isConnected) {
    _updateDappWithProviderDisconnected(name, button);
  } else {
    await sdk.connect();
    const provider = sdk.getProvider();
    const uuid = sdk.getChannelId();
    const providerDetail = _setProviderDetail(provider, name, uuid);
    button.innerText = `${name.toUpperCase()} Connected`;
    _updateDappWithProviderConnected(provider, providerDetail, name, button);
  }
}

export async function handleWalletConnect(name, button, isConnected) {
  if (isConnected) {
    _updateDappWithProviderDisconnected(name, button);
  } else {
    const provider = walletConnect.getWalletProvider().provider;
    const uuid = provider.signer.uri;
    const providerDetail = _setProviderDetail(provider, name, uuid);
    button.innerText = `${name.toUpperCase()} Connected`;
    _updateDappWithProviderConnected(provider, providerDetail, name, button);
  }
}
