import { createEVMClient } from '@metamask/connect-evm';
import dappMetadata from './dapp-metadata';
import globalContext, {
  handleNewAccounts,
  handleNewProviderDetail,
  removeProviderDetail,
  setActiveProviderDetail,
  updateFormElements,
} from '.';

export const CONNECT_EVM_PROVIDER_NAME = 'connect-evm';
export const CONNECT_EVM_PROVIDER_UUID = 'connect-evm';

export const CONNECT_EVM_SUPPORTED_NETWORKS = {
  '0x1': 'https://ethereum.publicnode.com',
  '0xaa36a7': 'https://ethereum-sepolia.publicnode.com',
  '0xa': 'https://optimism.publicnode.com',
  '0x89': 'https://polygon-bor-rpc.publicnode.com',
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

const noop = () => undefined;

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

export async function handleConnectEvm(
  name,
  button,
  isConnected,
  updateConnectionState = noop,
) {
  button.disabled = true;

  try {
    const client = await getConnectEvmClient();

    if (isConnected) {
      await client.disconnect();
      handleNewAccounts([]);
      updateFormElements();
      updateConnectionState(false);
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
    updateConnectionState(true);
    setConnectedButtonState(button);
    updateFormElements();
    handleNewAccounts(accounts);
    globalContext.connected = true;
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
