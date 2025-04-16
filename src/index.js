import MetaMaskOnboarding from '@metamask/onboarding';
import { ethers } from 'ethers';
import {
  handleSdkConnect,
  handleWalletConnect,
  walletConnect,
} from './connections';
import Constants from './constants.json';
import { NETWORKS_BY_CHAIN_ID } from './onchain-sample-contracts';

import {
  connectionsComponent,
  permissionsComponent,
} from './components/connections';
import {
  sendComponent,
  erc20Component,
  erc1155Component,
  eip747Component,
  erc721Component,
} from './components/transactions';
import {
  ppomMaliciousSendCalls,
  ppomMaliciousTransactionsAndSignatures,
  ppomMaliciousBatchingAndQueueing,
  ppomMaliciousWarningBypasses,
} from './components/ppom';
import { encryptDecryptComponent } from './components/encryption/encrypt-decrypt';
import {
  ethSignComponent,
  permitSignComponent,
  personalSignComponent,
  signTypedDataComponent,
  signTypedDataVariantsComponent,
  signTypedDataV3Component,
  signTypedDataV4Component,
  siweComponent,
  malformedSignaturesComponent,
  malformedTransactionsComponent,
} from './components/signatures';
import { ensResolutionComponent } from './components/resolutions/ens-resolution';
import {
  jsonRpcResult,
  ethereumChainInteractions,
  emptyComponent,
} from './components/interactions';
import { sendFormComponent } from './components/forms/send-form';
import { eip5792Component } from './components/transactions/eip5792';

const {
  hstBytecode,
  hstAbi,
  piggybankBytecode,
  piggybankAbi,
  nftsAbi,
  nftsBytecode,
  failingContractAbi,
  failingContractBytecode,
  multisigAbi,
  multisigBytecode,
  erc1155Abi,
  erc1155Bytecode,
} = Constants;

const globalContext = {
  accounts: [],
  provider: undefined,
  ethersProvider: undefined,
  chainIdInt: undefined,
  chainIdPadded: undefined,
  networkName: undefined,
  piggybankContract: undefined,
  piggybankFactory: undefined,
  failingContractFactory: undefined,
  failingContract: undefined,
  multisigContract: undefined,
  multisigFactory: undefined,
  hstContract: undefined,
  hstFactory: undefined,
  nftsContract: undefined,
  nftsFactory: undefined,
  erc1155Contract: undefined,
  erc1155Factory: undefined,
  tokenDecimals: '18',
  _connected: false,
  get connected() {
    return this._connected;
  },
  set connected(value) {
    const changeEvent = new CustomEvent('globalConnectionChange', {
      detail: { connected: value },
    });
    document.dispatchEvent(changeEvent);
    this._connected = value;
  },
  _deployedContractAddress: '',
  get deployedContractAddress() {
    return this._deployedContractAddress;
  },
  set deployedContractAddress(value) {
    if (typeof value !== 'string') {
      return;
    }
    const changeEvent = new CustomEvent('deployedContractAddressChange', {
      detail: { contractAddress: value },
    });
    document.dispatchEvent(changeEvent);
    this._deployedContractAddress = value;
  },
};

export default globalContext;

/**
 * Page
 */

const currentUrl = new URL(window.location.href);
const forwarderOrigin =
  currentUrl.hostname === 'localhost' ? 'http://localhost:9010' : undefined;
const urlSearchParams = new URLSearchParams(window.location.search);
const urlParamContractAddress = urlSearchParams.get('contract');
if (ethers.utils.isAddress(urlParamContractAddress)) {
  globalContext.deployedContractAddress = urlParamContractAddress;
}
const urlParamTokenDecimals = urlSearchParams.get('decimals');
if (urlParamTokenDecimals) {
  globalContext.tokenDecimals = urlParamTokenDecimals;
}

const scrollTo = urlSearchParams.get('scrollTo');

/**
 * DOM
 */

// Provider Section
const eip6963Section = document.getElementById('eip6963');
const eip6963Warning = document.getElementById('eip6963Warning');
const activeProviderUUIDResult = document.getElementById('activeProviderUUID');
const activeProviderNameResult = document.getElementById('activeProviderName');
const activeProviderIconResult = document.getElementById('activeProviderIcon');
const providersDiv = document.getElementById('providers');
const useWindowProviderButton = document.getElementById(
  'useWindowProviderButton',
);

// Dapp Status Section
const networkDiv = document.getElementById('network');
const chainIdDiv = document.getElementById('chainId');
const accountsDiv = document.getElementById('accounts');
const warningDiv = document.getElementById('warning');

const mainContainer =
  document.body.getElementsByTagName('main')[0] || document.body;

const connectionsSection = document.createElement('section');
mainContainer.appendChild(connectionsSection);
const connectionsRow = document.createElement('div');
connectionsRow.className = 'row d-flex justify-content-center';
connectionsSection.appendChild(connectionsRow);
connectionsComponent(connectionsRow);
permissionsComponent(connectionsRow);

// Connection buttons set up by this file
const onboardButton = document.getElementById('connectButton');
const walletConnectBtn = document.getElementById('walletConnect');
const sdkConnectBtn = document.getElementById('sdkConnect');

const transactionsSection = document.createElement('section');
mainContainer.appendChild(transactionsSection);
const transactionsRow = document.createElement('div');
transactionsRow.className = 'row';
transactionsSection.appendChild(transactionsRow);
sendComponent(transactionsRow);
erc20Component(transactionsRow);
erc721Component(transactionsRow);
erc1155Component(transactionsRow);
eip747Component(transactionsRow);
eip5792Component(transactionsRow);

const ppomSection = document.createElement('section');
mainContainer.appendChild(ppomSection);
const ppomRow = document.createElement('div');
ppomRow.className = 'row';
ppomSection.appendChild(ppomRow);
ppomMaliciousTransactionsAndSignatures(ppomRow);
ppomMaliciousSendCalls(ppomRow);
ppomMaliciousBatchingAndQueueing(ppomRow);
ppomMaliciousWarningBypasses(ppomRow);

const encryptionSection = document.createElement('section');
mainContainer.appendChild(encryptionSection);
encryptDecryptComponent(encryptionSection);

const signaturesSection = document.createElement('section');
mainContainer.appendChild(signaturesSection);
const signaturesRow = document.createElement('div');
signaturesRow.className = 'row';
signaturesSection.appendChild(signaturesRow);
ethSignComponent(signaturesRow);
personalSignComponent(signaturesRow);
signTypedDataComponent(signaturesRow);
signTypedDataV3Component(signaturesRow);
signTypedDataV4Component(signaturesRow);
permitSignComponent(signaturesRow);
signTypedDataVariantsComponent(signaturesRow);
siweComponent(signaturesRow);
malformedSignaturesComponent(signaturesRow);
malformedTransactionsComponent(signaturesRow);

const interactionsSection = document.createElement('section');
mainContainer.appendChild(interactionsSection);
const interactionsRow = document.createElement('div');
interactionsRow.className = 'row d-flex justify-content-center';
interactionsSection.appendChild(interactionsRow);
jsonRpcResult(interactionsRow);
ethereumChainInteractions(interactionsRow);
emptyComponent(interactionsRow);

const sendSection = document.createElement('section');
mainContainer.appendChild(sendSection);
sendFormComponent(sendSection);

const resolutionsSection = document.createElement('section');
mainContainer.appendChild(resolutionsSection);
ensResolutionComponent(resolutionsSection);

/**
 * Provider
 */

const providerDetails = [];
let scrollToHandled = false;

const isMetaMaskConnected = () =>
  globalContext.accounts && globalContext.accounts.length > 0;
let isWalletConnectConnected = false;
let isSdkConnected = false;

// TODO: Need to align with @metamask/onboarding
const isMetaMaskInstalled = () =>
  globalContext.provider && globalContext.provider.isMetaMask;

walletConnectBtn.onclick = () => {
  walletConnect.open();
  walletConnect.subscribeProvider(() => {
    handleWalletConnect(
      'wallet-connect',
      walletConnectBtn,
      isWalletConnectConnected,
    );
  });
};

sdkConnectBtn.onclick = async () => {
  await handleSdkConnect('sdk-connect', sdkConnectBtn, isSdkConnected);
};

export function updateWalletConnectState(isConnected) {
  isWalletConnectConnected = isConnected;
}

export function updateSdkConnectionState(isConnected) {
  isSdkConnected = isConnected;
}

const detectEip6963 = () => {
  window.addEventListener('eip6963:announceProvider', (event) => {
    if (event.detail.info.uuid) {
      eip6963Warning.hidden = true;
      eip6963Section.hidden = false;

      handleNewProviderDetail(event.detail);
    }
  });

  window.dispatchEvent(new Event('eip6963:requestProvider'));
};

export const setActiveProviderDetail = async (providerDetail) => {
  closeProvider();
  // When the extension is not installed the providerDetails comes in undefined
  // but because the SDK is already init the window.ethereum has been injected
  // this doesn't mean we can refer to it directly as the connection may have
  // not been approved which is there uuid comes in as empty
  if (!providerDetail || providerDetail.info.uuid === '') {
    return;
  }
  globalContext.provider = providerDetail.provider;
  await initializeProvider();

  try {
    const newAccounts = await globalContext.provider.request({
      method: 'eth_accounts',
    });
    handleNewAccounts(newAccounts);
  } catch (err) {
    console.error('Error on init when getting accounts', err);
  }

  const { uuid, name, icon } = providerDetail.info;
  activeProviderUUIDResult.innerText = uuid;
  activeProviderNameResult.innerText = name;
  activeProviderIconResult.innerHTML = icon
    ? `<img src="${icon}" height="90" width="90" />`
    : '';
  updateFormElements();
};

const setActiveProviderDetailWindowEthereum = async () => {
  const providerDetail = {
    info: {
      uuid: '',
      name: 'window.ethereum',
      icon: '',
    },
    provider: window.ethereum,
  };

  await setActiveProviderDetail(providerDetail);
};

const existsProviderDetail = (newProviderDetail) => {
  const existingProvider = providerDetails.find(
    (providerDetail) =>
      providerDetail.info &&
      newProviderDetail.info &&
      providerDetail.info.uuid === newProviderDetail.info.uuid,
  );

  if (existingProvider) {
    if (
      existingProvider.info.name !== newProviderDetail.info.name ||
      existingProvider.info.rdns !== newProviderDetail.info.rdns ||
      existingProvider.info.image !== newProviderDetail.info.image
    ) {
      console.error(
        `Received new ProviderDetail with name "${newProviderDetail.info.name}", rdns "${newProviderDetail.info.rdns}, image "${newProviderDetail.info.image}, and uuid "${existingProvider.info.uuid}" matching uuid of previously received ProviderDetail with name "${existingProvider.info.name}", rdns "${existingProvider.info.rdns}", and image "${existingProvider.info.image}"`,
      );
    }
    console.log(
      `Ignoring ProviderDetail with name "${newProviderDetail.info.name}", rdns "${newProviderDetail.info.rdns}", and uuid "${existingProvider.info.uuid}" that was already received before`,
    );
    return true;
  }
  return false;
};

export const handleNewProviderDetail = (newProviderDetail) => {
  if (existsProviderDetail(newProviderDetail)) {
    return;
  }
  providerDetails.push(newProviderDetail);
  renderProviderDetails();
};

export const removeProviderDetail = (name) => {
  const index = providerDetails.findIndex(
    (providerDetail) => providerDetail.info.name === name,
  );
  if (index === -1) {
    console.log(`ProviderDetail with name ${name} not found`);
    return;
  }
  providerDetails.splice(index, 1);
  renderProviderDetails();
  console.log(`ProviderDetail with name ${name} removed successfully`);
};

const renderProviderDetails = () => {
  providersDiv.innerHTML = '';
  providerDetails.forEach((providerDetail) => {
    const { info, provider: provider_ } = providerDetail;

    const content = JSON.stringify(
      {
        info,
        provider: provider_ ? '...' : provider_,
      },
      null,
      2,
    );
    const eip6963Provider = document.createElement('div');
    eip6963Provider.id = 'provider';
    eip6963Provider.className = 'col-xl-6 col-lg-6 col-md-12 col-sm-12 col-12';
    providersDiv.append(eip6963Provider);

    const pre = document.createElement('pre');
    pre.className = 'alert alert-secondary';
    pre.innerText = content;
    eip6963Provider.appendChild(pre);

    const button = document.createElement('button');
    button.className = 'btn btn-primary btn-lg btn-block mb-3';
    button.innerHTML = `Use ${info.name}`;
    button.onclick = () => {
      setActiveProviderDetail(providerDetail);
    };
    eip6963Provider.appendChild(button);
  });
};

export const handleNewAccounts = (newAccounts) => {
  globalContext.accounts = newAccounts;
  accountsDiv.innerHTML = globalContext.accounts;

  const changeEvent = new CustomEvent('newAccounts', {
    detail: { newAccounts },
  });
  document.dispatchEvent(changeEvent);

  updateFormElements();
  handleEIP1559Support();
};

const handleNewChain = (chainId) => {
  chainIdDiv.innerHTML = chainId;
  const networkId = parseInt(networkDiv.innerHTML, 10);
  globalContext.chainIdInt = parseInt(chainIdDiv.innerHTML, 16) || networkId;
  globalContext.chainIdPadded = `0x${globalContext.chainIdInt
    .toString(16)
    .padStart(77, '0')}`;
  globalContext.networkName = NETWORKS_BY_CHAIN_ID[globalContext.chainIdInt];

  if (chainId === '0x1') {
    warningDiv.classList.remove('warning-invisible');
  } else {
    warningDiv.classList.add('warning-invisible');
  }

  // Wait until warning rendered or not to improve accuracy
  if (!scrollToHandled) {
    handleScrollTo({ delay: true });
  }
};

function handleNewNetwork(networkId) {
  networkDiv.innerHTML = networkId;

  const changeEvent = new CustomEvent('newNetwork', {
    detail: { networkId },
  });
  document.dispatchEvent(changeEvent);
}

const getNetworkAndChainId = async () => {
  try {
    const chainId = await globalContext.provider.request({
      method: 'eth_chainId',
    });
    handleNewChain(chainId);

    const networkId = await globalContext.provider.request({
      method: 'net_version',
    });
    handleNewNetwork(networkId);

    handleEIP1559Support();
  } catch (err) {
    console.error(err);
  }
};

const handleEIP1559Support = async () => {
  if (
    !Array.isArray(globalContext.accounts) ||
    globalContext.accounts.length <= 0
  ) {
    return;
  }

  const block = await globalContext.provider.request({
    method: 'eth_getBlockByNumber',
    params: ['latest', false],
  });

  const supported = block.baseFeePerGas !== undefined;

  const changeEvent = new CustomEvent('blockBaseFeePerGasUpdate', {
    detail: { supported },
  });
  document.dispatchEvent(changeEvent);
};

// Must be called before the active provider changes
// Resets provider state and removes any listeners from active provider
const closeProvider = () => {
  // move these
  handleNewAccounts([]);
  handleNewChain('');
  handleNewNetwork('');
  if (isMetaMaskInstalled()) {
    globalContext.provider.removeListener('chainChanged', handleNewChain);
    globalContext.provider.removeListener('chainChanged', handleEIP1559Support);
    globalContext.provider.removeListener('networkChanged', handleNewNetwork);
    globalContext.provider.removeListener('accountsChanged', handleNewAccounts);
    globalContext.provider.removeListener(
      'accountsChanged',
      handleEIP1559Support,
    );
  }
};

// Must be called after the active provider changes
// Initializes active provider and adds any listeners
const initializeProvider = async () => {
  initializeContracts();
  updateFormElements();

  if (isMetaMaskInstalled()) {
    globalContext.provider.autoRefreshOnNetworkChange = false;
    await getNetworkAndChainId();

    globalContext.provider.on('chainChanged', handleNewChain);
    globalContext.provider.on('chainChanged', handleEIP1559Support);
    globalContext.provider.on('networkChanged', handleNewNetwork);
    globalContext.provider.on('accountsChanged', handleNewAccounts);
    globalContext.provider.on('accountsChanged', handleEIP1559Support);

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

/**
 * Misc
 */

const handleScrollTo = async ({ delay = false } = {}) => {
  if (!scrollTo) {
    return;
  }

  scrollToHandled = true;

  console.log('Attempting to scroll to element with ID:', scrollTo);

  const scrollToElement = document.getElementById(scrollTo);

  if (!scrollToElement) {
    console.warn('Cannot find element with ID:', scrollTo);
    return;
  }

  if (delay) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  scrollToElement.scrollIntoView();
};

/**
 * Contracts
 */

// Must be called after the active provider changes
const initializeContracts = () => {
  try {
    // We must specify the network as 'any' for ethers to allow network changes
    globalContext.ethersProvider = new ethers.providers.Web3Provider(
      globalContext.provider,
      'any',
    );
    if (globalContext.deployedContractAddress) {
      globalContext.hstContract = new ethers.Contract(
        globalContext.deployedContractAddress,
        hstAbi,
        globalContext.ethersProvider.getSigner(),
      );
      globalContext.piggybankContract = new ethers.Contract(
        globalContext.deployedContractAddress,
        piggybankAbi,
        globalContext.ethersProvider.getSigner(),
      );
      globalContext.nftsContract = new ethers.Contract(
        globalContext.deployedContractAddress,
        nftsAbi,
        globalContext.ethersProvider.getSigner(),
      );
      globalContext.failingContract = new ethers.Contract(
        globalContext.deployedContractAddress,
        failingContractAbi,
        globalContext.ethersProvider.getSigner(),
      );
      globalContext.multisigContract = new ethers.Contract(
        globalContext.deployedContractAddress,
        multisigAbi,
        globalContext.ethersProvider.getSigner(),
      );
      globalContext.erc1155Contract = new ethers.Contract(
        globalContext.deployedContractAddress,
        erc1155Abi,
        globalContext.ethersProvider.getSigner(),
      );
    }
    globalContext.hstFactory = new ethers.ContractFactory(
      hstAbi,
      hstBytecode,
      globalContext.ethersProvider.getSigner(),
    );
    globalContext.piggybankFactory = new ethers.ContractFactory(
      piggybankAbi,
      piggybankBytecode,
      globalContext.ethersProvider.getSigner(),
    );
    globalContext.nftsFactory = new ethers.ContractFactory(
      nftsAbi,
      nftsBytecode,
      globalContext.ethersProvider.getSigner(),
    );
    globalContext.failingContractFactory = new ethers.ContractFactory(
      failingContractAbi,
      failingContractBytecode,
      globalContext.ethersProvider.getSigner(),
    );
    globalContext.multisigFactory = new ethers.ContractFactory(
      multisigAbi,
      multisigBytecode,
      globalContext.ethersProvider.getSigner(),
    );
    globalContext.erc1155Factory = new ethers.ContractFactory(
      erc1155Abi,
      erc1155Bytecode,
      globalContext.ethersProvider.getSigner(),
    );
  } catch (error) {
    console.error(error);
  }
};

/**
 * Form / Elements
 */

// Must be called after the provider or connect acccounts change
// Updates form elements content and disabled status
export const updateFormElements = () => {
  if (!isMetaMaskInstalled() || !isMetaMaskConnected()) {
    /* MetaMask is not installed or not connected */
    document.dispatchEvent(new Event('disableAndClear'));
  } else if (isMetaMaskConnected()) {
    globalContext.connected = true;
  }

  updateOnboardElements();
  updateContractElements();
};

const updateOnboardElements = () => {
  let onboarding;
  try {
    onboarding = new MetaMaskOnboarding({ forwarderOrigin });
  } catch (error) {
    console.error(error);
  }

  if (isMetaMaskInstalled()) {
    document.dispatchEvent(new Event('MetaMaskInstalled'));
  } else {
    onboardButton.innerText = 'Click here to install MetaMask!';
    onboardButton.onclick = () => {
      onboardButton.innerText = 'Onboarding in progress';
      onboardButton.disabled = true;
      onboarding.startOnboarding();
    };
    onboardButton.disabled = false;
  }

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
    globalContext.provider.autoRefreshOnNetworkChange = false;
    getNetworkAndChainId();

    globalContext.provider.on('chainChanged', handleNewChain);
    globalContext.provider.on('chainChanged', handleEIP1559Support);
    globalContext.provider.on('chainChanged', handleNewNetwork);
    globalContext.provider.on('accountsChanged', handleNewAccounts);
    globalContext.provider.on('accountsChanged', handleEIP1559Support);
  }
};

const updateContractElements = () => {
  if (globalContext.deployedContractAddress) {
    document.dispatchEvent(new Event('contractIsDeployed'));
  }
};

/**
 * Entrypoint
 */

const initialize = async () => {
  await setActiveProviderDetailWindowEthereum();
  detectEip6963();
  // We only want to set the activeProviderDetail is there is one instead of
  // assuming it exists
  if (providerDetails.length > 0) {
    await setActiveProviderDetail(providerDetails[0]);
  }
  useWindowProviderButton.onclick = setActiveProviderDetailWindowEthereum;
};

window.addEventListener('load', initialize);
