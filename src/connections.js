import { createWeb3Modal, defaultConfig } from '@web3modal/ethers5';
import { MetaMaskSDK } from '@metamask/sdk';
import {
  handleNewAccounts,
  updateFormElements,
  setActiveProviderDetail,
  handleNewProviderDetail,
  updateSdkConnectionState,
  updateWalletConnectState,
  removeProviderDetail,
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
    setActiveProviderDetail(providerDetail);
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
    setActiveProviderDetail(providerDetail);
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
