import MetaMaskOnboarding from '@metamask/onboarding';
// eslint-disable-next-line camelcase
import { recoverTypedSignature } from '@metamask/eth-sig-util';
import { ethers } from 'ethers';
import { toChecksumAddress } from 'ethereumjs-util';
import {
  handleSdkConnect,
  handleWalletConnect,
  walletConnect,
} from './connections';
import Constants from './constants.json';
import { splitSig } from './signatures/utils';
import {
  ERC20_SAMPLE_CONTRACTS,
  ERC721_SAMPLE_CONTRACTS,
  NETWORKS_BY_CHAIN_ID,
  MALICIOUS_CONTRACT_ADDRESSES,
} from './onchain-sample-contracts';
import { getPermissionsDisplayString } from './utils';

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
import { sendFormComponent } from './components/forms/send-form';

const globalContext = {
  accounts: [],
  provider: undefined,
  ethersProvider: undefined,
  chainIdInt: undefined,
  _connected: false,
  get connected() {
    return this._connected;
  },
  set connected(value) {
    if (this._connected !== value) {
      const changeEvent = new CustomEvent('globalConnectionChange', {
        detail: { connected: value },
      });
      document.dispatchEvent(changeEvent);
      this._connected = value;
    }
  },
};

export default globalContext;

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

/**
 * Page
 */

const SEPOLIA_NETWORK_ID_HEX = '0xaa36a7';
const SEPOLIA_NETWORK_ID_DEC = '11155111';
const BASE_NETWORK_ID = '8453';
const BASE_NETWORK_ID_HEX = '0x2105';

const currentUrl = new URL(window.location.href);
const forwarderOrigin =
  currentUrl.hostname === 'localhost' ? 'http://localhost:9010' : undefined;
const urlSearchParams = new URLSearchParams(window.location.search);
let deployedContractAddress = urlSearchParams.get('contract');
if (!ethers.utils.isAddress(deployedContractAddress)) {
  deployedContractAddress = '';
}

let tokenDecimals = urlSearchParams.get('decimals');
if (!tokenDecimals) {
  tokenDecimals = '18';
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

// Basic Actions Section
const onboardButton = document.getElementById('connectButton');
const getAccountsButton = document.getElementById('getAccounts');
const getAccountsResult = document.getElementById('getAccountsResult');
const walletConnectBtn = document.getElementById('walletConnect');
const sdkConnectBtn = document.getElementById('sdkConnect');

// Permissions Actions Section
const requestPermissionsButton = document.getElementById('requestPermissions');
const getPermissionsButton = document.getElementById('getPermissions');
const permissionsResult = document.getElementById('permissionsResult');
const revokeAccountsPermissionButton = document.getElementById(
  'revokeAccountsPermission',
);

// Contract Section
const deployButton = document.getElementById('deployButton');
const depositButton = document.getElementById('depositButton');
const withdrawButton = document.getElementById('withdrawButton');
const contractStatus = document.getElementById('contractStatus');
const deployFailingButton = document.getElementById('deployFailingButton');
const sendFailingButton = document.getElementById('sendFailingButton');
const failingContractStatus = document.getElementById('failingContractStatus');
const deployMultisigButton = document.getElementById('deployMultisigButton');
const sendMultisigButton = document.getElementById('sendMultisigButton');
const multisigContractStatus = document.getElementById(
  'multisigContractStatus',
);

// NFTs Section
const deployNFTsButton = document.getElementById('deployNFTsButton');
const mintButton = document.getElementById('mintButton');
const watchNFTsButton = document.getElementById('watchNFTsButton');
const watchNFTButtons = document.getElementById('watchNFTButtons');

const mintAmountInput = document.getElementById('mintAmountInput');
const approveTokenInput = document.getElementById('approveTokenInput');
const approveButton = document.getElementById('approveButton');
const watchNFTInput = document.getElementById('watchNFTInput');
const watchNFTButton = document.getElementById('watchNFTButton');
const setApprovalForAllButton = document.getElementById(
  'setApprovalForAllButton',
);
const revokeButton = document.getElementById('revokeButton');
const transferTokenInput = document.getElementById('transferTokenInput');
const transferFromButton = document.getElementById('transferFromButton');
const nftsStatus = document.getElementById('nftsStatus');
const erc721TokenAddresses = document.getElementById('erc721TokenAddresses');
// 721 Permit
const sign721Permit = document.getElementById('sign721Permit');
const sign721PermitResult = document.getElementById('sign721PermitResult');
const sign721PermitResultR = document.getElementById('sign721PermitResultR');
const sign721PermitResultS = document.getElementById('sign721PermitResultS');
const sign721PermitResultV = document.getElementById('sign721PermitResultV');
const sign721PermitVerify = document.getElementById('sign721PermitVerify');
const sign721PermitVerifyResult = document.getElementById(
  'sign721PermitVerifyResult',
);

// ERC 1155 Section

const deployERC1155Button = document.getElementById('deployERC1155Button');
const batchMintTokenIds = document.getElementById('batchMintTokenIds');
const batchMintIdAmounts = document.getElementById('batchMintIdAmounts');
const batchMintButton = document.getElementById('batchMintButton');
const batchTransferTokenIds = document.getElementById('batchTransferTokenIds');
const batchTransferTokenAmounts = document.getElementById(
  'batchTransferTokenAmounts',
);
const batchTransferFromButton = document.getElementById(
  'batchTransferFromButton',
);
const setApprovalForAllERC1155Button = document.getElementById(
  'setApprovalForAllERC1155Button',
);
const revokeERC1155Button = document.getElementById('revokeERC1155Button');
const watchAssetInput = document.getElementById('watchAssetInput');
const watchAssetButton = document.getElementById('watchAssetButton');
const erc1155Status = document.getElementById('erc1155Status');
const erc1155TokenAddresses = document.getElementById('erc1155TokenAddresses');

// ERC 747 Section
const eip747ContractAddress = document.getElementById('eip747ContractAddress');
const eip747Symbol = document.getElementById('eip747Symbol');
const eip747Decimals = document.getElementById('eip747Decimals');
const eip747WatchButton = document.getElementById('eip747WatchButton');
const eip747Status = document.getElementById('eip747Status');

// Send Eth Section
const sendButton = document.getElementById('sendButton');
const sendEIP1559Button = document.getElementById('sendEIP1559Button');
const sendEIP1559WithoutGasButton = document.getElementById(
  'sendEIP1559WithoutGasButton',
);

// Send Tokens Section
const decimalUnitsInput = document.getElementById('tokenDecimals');
const approveTokensToInput = document.getElementById('approveTo');
const transferFromSenderInput = document.getElementById(
  'transferFromSenderInput',
);
const transferFromRecipientInput = document.getElementById(
  'transferFromRecipientInput',
);
const tokenSymbol = 'TST';
const erc20TokenAddresses = document.getElementById('erc20TokenAddresses');
const createToken = document.getElementById('createToken');
const watchAssets = document.getElementById('watchAssets');
const transferTokens = document.getElementById('transferTokens');
const transferFromTokens = document.getElementById('transferFromTokens');
const approveTokens = document.getElementById('approveTokens');
const increaseTokenAllowance = document.getElementById(
  'increaseTokenAllowance',
);
const allowanceOwnerInput = document.getElementById('allowanceOwner');
const allowanceSpenderInput = document.getElementById('allowanceSpender');
const allowanceAmountResult = document.getElementById('allowanceAmountResult');
const getAllowance = document.getElementById('getAllowance');
const transferTokensWithoutGas = document.getElementById(
  'transferTokensWithoutGas',
);
const approveTokensWithoutGas = document.getElementById(
  'approveTokensWithoutGas',
);

const tokenMethodsResult = document.getElementById('tokenMethodsResult');

const encryptionParentContainer = 
  document.getElementById('components-encryption') || document.body; 
encryptDecryptComponent(encryptionParentContainer); 

// Encrypt / Decrypt Section
const encryptMessageInput = document.getElementById('encryptMessageInput');
const encryptionKeyDisplay = document.getElementById('encryptionKeyDisplay');
const ciphertextDisplay = document.getElementById('ciphertextDisplay');
const cleartextDisplay = document.getElementById('cleartextDisplay');

// Ethereum Signature Section
const signaturesParentContainer =
  document.getElementById('components-signatures') || document.body;
const signaturesRow = document.createElement('div');
signaturesRow.className = 'row';
signaturesParentContainer.appendChild(signaturesRow);
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

const signTypedData = document.getElementById('signTypedData');
const signTypedDataVerify = document.getElementById('signTypedDataVerify');
const signTypedDataV3 = document.getElementById('signTypedDataV3');
const signTypedDataV3Verify = document.getElementById('signTypedDataV3Verify');
const signTypedDataV4 = document.getElementById('signTypedDataV4');
const signTypedDataV4Verify = document.getElementById('signTypedDataV4Verify');
const signPermit = document.getElementById('signPermit');
const signPermitVerify = document.getElementById('signPermitVerify');

// Sign Typed Data Variants

const signBlurOrder = document.getElementById('signBlurOrder');
const signPermitSingle = document.getElementById('signPermitSingle');
const signPermitBatch = document.getElementById('signPermitBatch');
const signSeaportBulkOrder = document.getElementById('signSeaportBulkOrder');

const siwe = document.getElementById('siwe');
const siweResources = document.getElementById('siweResources');
const siweBadDomain = document.getElementById('siweBadDomain');
const siweBadAccount = document.getElementById('siweBadAccount');
const siweMalformed = document.getElementById('siweMalformed');

// Malformed Signatues
const signInvalidType = document.getElementById('signInvalidType');
const signEmptyDomain = document.getElementById('signEmptyDomain');
const signExtraDataNotTyped = document.getElementById('signExtraDataNotTyped');
const signInvalidPrimaryType = document.getElementById(
  'signInvalidPrimaryType',
);
const signNoPrimaryTypeDefined = document.getElementById(
  'signNoPrimaryTypeDefined',
);
const signInvalidVerifyingContractType = document.getElementById(
  'signInvalidVerifyingContractType',
);

// Malformed Transactions
const sendWithInvalidValue = document.getElementById('sendWithInvalidValue');
const sendWithInvalidTxType = document.getElementById('sendWithInvalidTxType');
const sendWithInvalidRecipient = document.getElementById(
  'sendWithInvalidRecipient',
);
const sendWithInvalidGasLimit = document.getElementById(
  'sendWithInvalidGasLimit',
);
const sendWithInvalidMaxFeePerGas = document.getElementById(
  'sendWithInvalidMaxFeePerGas',
);
const sendMalformedResult = document.getElementById('sendMalformedResult');

// End Ethereum Signature Section

// Batch
const signTypedDataV4Batch = document.getElementById('signTypedDataV4Batch');
const sendEIP1559Batch = document.getElementById('sendEIP1559Batch');

// Queue
const signTypedDataV4Queue = document.getElementById('signTypedDataV4Queue');
const sendEIP1559Queue = document.getElementById('sendEIP1559Queue');

// Miscellaneous
const addEthereumChain = document.getElementById('addEthereumChain');
const switchEthereumChain = document.getElementById('switchEthereumChain');

// PPOM
const mintSepoliaERC20 = document.getElementById('mintSepoliaERC20');
const maliciousApprovalButton = document.getElementById(
  'maliciousApprovalButton',
);
const maliciousContractInteractionButton = document.getElementById(
  'maliciousContractInteractionButton',
);

const maliciousERC20TransferButton = document.getElementById(
  'maliciousERC20TransferButton',
);
const maliciousRawEthButton = document.getElementById('maliciousRawEthButton');
const maliciousPermit = document.getElementById('maliciousPermit');
const maliciousTradeOrder = document.getElementById('maliciousTradeOrder');
const maliciousSeaport = document.getElementById('maliciousSeaport');
const maliciousSetApprovalForAll = document.getElementById(
  'maliciousSetApprovalForAll',
);
const maliciousAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

// Deeplinks
const sendDeeplinkButton = document.getElementById('sendDeeplinkButton');
const transferTokensDeeplink = document.getElementById(
  'transferTokensDeeplink',
);
const approveTokensDeeplink = document.getElementById('approveTokensDeeplink');
const maliciousSendEthWithDeeplink = document.getElementById(
  'maliciousSendEthWithDeeplink',
);
const maliciousTransferERC20WithDeeplink = document.getElementById(
  'maliciousTransferERC20WithDeeplink',
);
const maliciousApproveERC20WithDeeplink = document.getElementById(
  'maliciousApproveERC20WithDeeplink',
);

// PPOM - Malicious Warning Bypasses
const maliciousSendWithOddHexData = document.getElementById(
  'maliciousSendWithOddHexData',
);
const maliciousApproveERC20WithOddHexData = document.getElementById(
  'maliciousApproveERC20WithOddHexData',
);
const maliciousSendWithoutHexPrefixValue = document.getElementById(
  'maliciousSendWithoutHexPrefixValue',
);
const maliciousPermitHexPaddedChain = document.getElementById(
  'maliciousPermitHexPaddedChain',
);
const maliciousPermitIntAddress = document.getElementById(
  'maliciousPermitIntAddress',
);

sendFormComponent(document.getElementById('components-forms'));

ensResolutionComponent(document.getElementById('components-resolutions'));

// Send form controls (because they are updated by certain events in this file)
const fromDiv = document.getElementById('fromInput');
const type = document.getElementById('typeInput');
const gasPriceDiv = document.getElementById('gasPriceDiv');
const maxFeeDiv = document.getElementById('maxFeeDiv');
const maxPriorityDiv = document.getElementById('maxPriorityDiv');

// Buttons that require connecting an account
const allConnectedButtons = [
  deployButton,
  depositButton,
  withdrawButton,
  deployNFTsButton,
  mintButton,
  sign721Permit,
  sign721PermitVerify,
  mintAmountInput,
  approveTokenInput,
  approveButton,
  watchNFTInput,
  watchNFTButton,
  setApprovalForAllButton,
  revokeButton,
  transferTokenInput,
  transferFromButton,
  watchNFTsButton,
  deployERC1155Button,
  batchTransferTokenIds,
  batchTransferTokenAmounts,
  batchTransferFromButton,
  setApprovalForAllERC1155Button,
  revokeERC1155Button,
  watchAssetInput,
  watchAssetButton,
  deployFailingButton,
  sendFailingButton,
  deployMultisigButton,
  sendMultisigButton,
  sendButton,
  createToken,
  decimalUnitsInput,
  approveTokensToInput,
  watchAssets,
  transferTokens,
  transferFromTokens,
  approveTokens,
  increaseTokenAllowance,
  allowanceOwnerInput,
  allowanceSpenderInput,
  allowanceAmountResult,
  getAllowance,
  transferFromRecipientInput,
  transferFromSenderInput,
  transferTokensWithoutGas,
  approveTokensWithoutGas,
  document.getElementById('getEncryptionKeyButton'),
  encryptMessageInput,
  document.getElementById('encryptButton'),
  document.getElementById('decryptButton'),
  document.getElementById('ethSign'),
  document.getElementById('personalSign'),
  document.getElementById('personalSignVerify'),
  signTypedData,
  signTypedDataVerify,
  signTypedDataV3,
  signTypedDataV3Verify,
  signTypedDataV4,
  signTypedDataV4Verify,
  signTypedDataV4Batch,
  signTypedDataV4Queue,
  signBlurOrder,
  signPermit,
  signPermitSingle,
  signPermitBatch,
  signPermitVerify,
  signSeaportBulkOrder,
  siwe,
  siweResources,
  siweBadDomain,
  siweBadAccount,
  siweMalformed,
  signInvalidType,
  signEmptyDomain,
  signExtraDataNotTyped,
  signInvalidPrimaryType,
  signNoPrimaryTypeDefined,
  signInvalidVerifyingContractType,
  eip747WatchButton,
  maliciousApprovalButton,
  maliciousContractInteractionButton,
  maliciousSetApprovalForAll,
  maliciousERC20TransferButton,
  maliciousRawEthButton,
  maliciousPermit,
  maliciousTradeOrder,
  maliciousSeaport,
  sendWithInvalidValue,
  sendWithInvalidTxType,
  sendWithInvalidRecipient,
  mintSepoliaERC20,
  maliciousSendEthWithDeeplink,
  maliciousSendWithOddHexData,
  maliciousSendWithoutHexPrefixValue,
  maliciousApproveERC20WithOddHexData,
  maliciousPermitHexPaddedChain,
  maliciousPermitIntAddress,
  maliciousPermitIntAddress,
  document.getElementById('ensSubmit'),
];

// Buttons that are available after initially connecting an account
const initialConnectedButtons = [
  deployButton,
  deployNFTsButton,
  deployERC1155Button,
  sendButton,
  deployFailingButton,
  deployMultisigButton,
  createToken,
  decimalUnitsInput,
  signTypedDataV4Batch,
  signTypedDataV4Queue,
  eip747WatchButton,
  maliciousApprovalButton,
  maliciousContractInteractionButton,
  maliciousSetApprovalForAll,
  maliciousERC20TransferButton,
  maliciousRawEthButton,
  maliciousPermit,
  maliciousTradeOrder,
  maliciousSeaport,
  mintSepoliaERC20,
  maliciousSendWithOddHexData,
  maliciousSendWithoutHexPrefixValue,
  maliciousApproveERC20WithOddHexData,
  maliciousPermitHexPaddedChain,
  maliciousPermitIntAddress,
];

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
  updateFormElements();

  accountsDiv.innerHTML = globalContext.accounts;
  fromDiv.value = globalContext.accounts[0] || '';
  gasPriceDiv.style.display = 'block';
  maxFeeDiv.style.display = 'none';
  maxPriorityDiv.style.display = 'none';

  handleEIP1559Support();
};

let networkName;
let chainIdPadded;

const handleNewChain = (chainId) => {
  chainIdDiv.innerHTML = chainId;
  const networkId = parseInt(networkDiv.innerHTML, 10);
  globalContext.chainIdInt = parseInt(chainIdDiv.innerHTML, 16) || networkId;
  chainIdPadded = `0x${globalContext.chainIdInt
    .toString(16)
    .padStart(77, '0')}`;
  networkName = NETWORKS_BY_CHAIN_ID[globalContext.chainIdInt];

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

function isSepoliaNetworkId(networkId) {
  return (
    networkId === SEPOLIA_NETWORK_ID_DEC || networkId === SEPOLIA_NETWORK_ID_HEX
  );
}

function isBaseNetworkId(networkId) {
  return networkId === BASE_NETWORK_ID || networkId === BASE_NETWORK_ID_HEX;
}

function toggleSepoliaMintButton(networkId) {
  mintSepoliaERC20.hidden = !isSepoliaNetworkId(networkId);
}

function toggleMaliciousContractInteractionButton(networkId) {
  maliciousContractInteractionButton.hidden =
    isBaseNetworkId(networkId) || isSepoliaNetworkId(networkId);
}

function handleNewNetwork(networkId) {
  networkDiv.innerHTML = networkId;

  toggleSepoliaMintButton(networkId);
  toggleMaliciousContractInteractionButton(networkId);
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

  if (supported) {
    sendEIP1559Button.disabled = false;
    sendEIP1559Button.hidden = false;
    sendEIP1559WithoutGasButton.disabled = false;
    sendEIP1559WithoutGasButton.hidden = false;
    sendWithInvalidMaxFeePerGas.disabled = false;
    sendWithInvalidMaxFeePerGas.hidden = false;
    sendEIP1559Batch.disabled = false;
    sendEIP1559Batch.hidden = false;
    sendEIP1559Queue.disabled = false;
    sendEIP1559Queue.hidden = false;
    sendWithInvalidGasLimit.disabled = false;
    sendWithInvalidGasLimit.hidden = false;
    sendButton.innerText = 'Send Legacy Transaction';
  } else {
    sendEIP1559Button.disabled = true;
    sendEIP1559Button.hidden = true;
    sendEIP1559WithoutGasButton.disabled = true;
    sendEIP1559WithoutGasButton.hidden = true;
    sendEIP1559Batch.disabled = true;
    sendEIP1559Batch.hidden = true;
    sendEIP1559Queue.disabled = true;
    sendEIP1559Queue.hidden = true;
    sendWithInvalidGasLimit.disabled = true;
    sendWithInvalidGasLimit.hidden = true;
    sendButton.innerText = 'Send';
  }
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

let hstFactory;
let piggybankFactory;
let nftsFactory;
let failingContractFactory;
let multisigFactory;
let erc1155Factory;
let hstContract;
let piggybankContract;
let nftsContract;
let failingContract;
let multisigContract;
let erc1155Contract;

// Must be called after the active provider changes
const initializeContracts = () => {
  try {
    // We must specify the network as 'any' for ethers to allow network changes
    globalContext.ethersProvider = new ethers.providers.Web3Provider(
      globalContext.provider,
      'any',
    );
    if (deployedContractAddress) {
      hstContract = new ethers.Contract(
        deployedContractAddress,
        hstAbi,
        globalContext.ethersProvider.getSigner(),
      );
      piggybankContract = new ethers.Contract(
        deployedContractAddress,
        piggybankAbi,
        globalContext.ethersProvider.getSigner(),
      );
      nftsContract = new ethers.Contract(
        deployedContractAddress,
        nftsAbi,
        globalContext.ethersProvider.getSigner(),
      );
      failingContract = new ethers.Contract(
        deployedContractAddress,
        failingContractAbi,
        globalContext.ethersProvider.getSigner(),
      );
      multisigContract = new ethers.Contract(
        deployedContractAddress,
        multisigAbi,
        globalContext.ethersProvider.getSigner(),
      );
      erc1155Contract = new ethers.Contract(
        deployedContractAddress,
        erc1155Abi,
        globalContext.ethersProvider.getSigner(),
      );
    }
    hstFactory = new ethers.ContractFactory(
      hstAbi,
      hstBytecode,
      globalContext.ethersProvider.getSigner(),
    );
    piggybankFactory = new ethers.ContractFactory(
      piggybankAbi,
      piggybankBytecode,
      globalContext.ethersProvider.getSigner(),
    );
    nftsFactory = new ethers.ContractFactory(
      nftsAbi,
      nftsBytecode,
      globalContext.ethersProvider.getSigner(),
    );
    failingContractFactory = new ethers.ContractFactory(
      failingContractAbi,
      failingContractBytecode,
      globalContext.ethersProvider.getSigner(),
    );
    multisigFactory = new ethers.ContractFactory(
      multisigAbi,
      multisigBytecode,
      globalContext.ethersProvider.getSigner(),
    );
    erc1155Factory = new ethers.ContractFactory(
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
  const accountButtonsDisabled =
    !isMetaMaskInstalled() || !isMetaMaskConnected();
  if (accountButtonsDisabled) {
    for (const button of allConnectedButtons) {
      button.disabled = true;
    }
    clearDisplayElements();
  }
  if (isMetaMaskConnected()) {
    globalContext.connected = true;
    for (const button of initialConnectedButtons) {
      button.disabled = false;
    }
  }

  updateOnboardElements();
  updateContractElements();
};

const clearDisplayElements = () => {
  getAccountsResult.innerText = '';
  permissionsResult.innerText = '';
  encryptionKeyDisplay.innerText = '';
  encryptMessageInput.value = '';
  ciphertextDisplay.innerText = '';
  cleartextDisplay.innerText = '';
  batchTransferTokenIds.value = '';
  batchTransferTokenAmounts.value = '';
  tokenMethodsResult.value = '';
};

const updateOnboardElements = () => {
  let onboarding;
  try {
    onboarding = new MetaMaskOnboarding({ forwarderOrigin });
  } catch (error) {
    console.error(error);
  }

  if (isMetaMaskInstalled()) {
    addEthereumChain.disabled = false;
    switchEthereumChain.disabled = false;
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
  if (deployedContractAddress) {
    // Piggy bank contract
    contractStatus.innerHTML = 'Deployed';
    depositButton.disabled = false;
    withdrawButton.disabled = false;
    // Failing contract
    failingContractStatus.innerHTML = 'Deployed';
    sendFailingButton.disabled = false;
    // Multisig contract
    multisigContractStatus.innerHTML = 'Deployed';
    sendMultisigButton.disabled = false;
    // ERC721 Token - NFTs contract
    erc721TokenAddresses.innerHTML = nftsContract ? nftsContract.address : '';
    nftsStatus.innerHTML = 'Deployed';
    mintButton.disabled = false;
    sign721Permit.disabled = false;
    mintAmountInput.disabled = false;
    approveTokenInput.disabled = false;
    approveButton.disabled = false;
    watchNFTInput.disabled = false;
    watchNFTButton.disabled = false;
    setApprovalForAllButton.disabled = false;
    revokeButton.disabled = false;
    transferTokenInput.disabled = false;
    transferFromButton.disabled = false;
    watchNFTsButton.disabled = false;
    watchNFTButtons.innerHTML = '';

    // ERC 1155 Multi Token
    erc1155TokenAddresses.innerHTML = erc1155Contract
      ? erc1155Contract.address
      : '';
    erc1155Status.innerHTML = 'Deployed';
    batchMintButton.disabled = false;
    batchMintTokenIds.disabled = false;
    batchMintIdAmounts.disabled = false;
    batchTransferTokenIds.disabled = false;
    batchTransferTokenAmounts.disabled = false;
    batchTransferFromButton.disabled = false;
    setApprovalForAllERC1155Button.disabled = false;
    revokeERC1155Button.disabled = false;
    watchAssetInput.disabled = false;
    watchAssetButton.disabled = false;
    // ERC20 Token - Send Tokens
    erc20TokenAddresses.innerHTML = hstContract ? hstContract.address : '';
    watchAssets.disabled = false;
    transferTokens.disabled = false;
    transferFromTokens.disabled = false;
    approveTokens.disabled = false;
    increaseTokenAllowance.disabled = false;
    allowanceOwnerInput.disabled = false;
    allowanceSpenderInput.disabled = false;
    allowanceAmountResult.disabled = false;
    getAllowance.disabled = false;
    transferTokensWithoutGas.disabled = false;
    approveTokensWithoutGas.disabled = false;
    transferFromSenderInput.disabled = false;
    approveTokensToInput.disabled = false;
    transferFromRecipientInput.disabled = false;
  }
};

// Initializes form button onclicks
const initializeFormElements = () => {
  /**
   * Piggy bank
   */

  deployButton.onclick = async () => {
    contractStatus.innerHTML = 'Deploying';

    try {
      piggybankContract = await piggybankFactory.deploy();
      await piggybankContract.deployTransaction.wait();
    } catch (error) {
      contractStatus.innerHTML = 'Deployment Failed';
      throw error;
    }

    if (piggybankContract.address === undefined) {
      return;
    }

    console.log(
      `Contract mined! address: ${piggybankContract.address} transactionHash: ${piggybankContract.deployTransaction.hash}`,
    );
    contractStatus.innerHTML = 'Deployed';
    depositButton.disabled = false;
    withdrawButton.disabled = false;
  };

  depositButton.onclick = async () => {
    contractStatus.innerHTML = 'Deposit initiated';
    const result = await piggybankContract.deposit({
      from: globalContext.accounts[0],
      value: '0x3782dace9d900000',
    });
    console.log(result);
    const receipt = await result.wait();
    console.log(receipt);
    contractStatus.innerHTML = 'Deposit completed';
  };

  withdrawButton.onclick = async () => {
    const result = await piggybankContract.withdraw('0xde0b6b3a7640000', {
      from: globalContext.accounts[0],
    });
    console.log(result);
    const receipt = await result.wait();
    console.log(receipt);
    contractStatus.innerHTML = 'Withdrawn';
  };

  /**
   * Failing
   */

  deployFailingButton.onclick = async () => {
    failingContractStatus.innerHTML = 'Deploying';

    try {
      failingContract = await failingContractFactory.deploy();
      await failingContract.deployTransaction.wait();
    } catch (error) {
      failingContractStatus.innerHTML = 'Deployment Failed';
      throw error;
    }

    if (failingContract.address === undefined) {
      return;
    }

    console.log(
      `Contract mined! address: ${failingContract.address} transactionHash: ${failingContract.deployTransaction.hash}`,
    );
    failingContractStatus.innerHTML = 'Deployed';
    sendFailingButton.disabled = false;
  };

  sendFailingButton.onclick = async () => {
    try {
      const result = await globalContext.provider.request({
        method: 'eth_sendTransaction',
        params: [
          {
            from: globalContext.accounts[0],
            to: failingContract.address,
            value: '0x0',
            gasLimit: '0x5028',
            maxFeePerGas: '0x2540be400',
            maxPriorityFeePerGas: '0x3b9aca00',
          },
        ],
      });
      failingContractStatus.innerHTML =
        'Failed transaction process completed as expected.';
      console.log('send failing contract result', result);
    } catch (error) {
      console.log('error', error);
      throw error;
    }
  };

  /**
   * Multisig
   */

  deployMultisigButton.onclick = async () => {
    multisigContractStatus.innerHTML = 'Deploying';

    try {
      multisigContract = await multisigFactory.deploy();
      await multisigContract.deployTransaction.wait();
    } catch (error) {
      multisigContractStatus.innerHTML = 'Deployment Failed';
      throw error;
    }

    if (multisigContract.address === undefined) {
      return;
    }

    console.log(
      `Contract mined! address: ${multisigContract.address} transactionHash: ${multisigContract.deployTransaction.hash}`,
    );
    multisigContractStatus.innerHTML = 'Deployed';
    sendMultisigButton.disabled = false;
  };

  sendMultisigButton.onclick = async () => {
    try {
      const result = await globalContext.provider.request({
        method: 'eth_sendTransaction',
        params: [
          {
            from: globalContext.accounts[0],
            to: multisigContract.address,
            value: '0x16345785D8A0', // 24414062500000
            gasLimit: '0x5028',
            maxFeePerGas: '0x2540be400',
            maxPriorityFeePerGas: '0x3b9aca00',
          },
        ],
      });
      multisigContractStatus.innerHTML = 'Transaction completed as expected.';
      console.log('send multisig contract result', result);
    } catch (error) {
      console.log('error', error);
      throw error;
    }
  };

  /**
   * ERC721 Token
   */

  deployNFTsButton.onclick = async () => {
    nftsStatus.innerHTML = 'Deploying';

    try {
      nftsContract = await nftsFactory.deploy();
      await nftsContract.deployTransaction.wait();
    } catch (error) {
      nftsStatus.innerHTML = 'Deployment Failed';
      throw error;
    }

    if (nftsContract.address === undefined) {
      return;
    }

    console.log(
      `Contract mined! address: ${nftsContract.address} transactionHash: ${nftsContract.deployTransaction.hash}`,
    );

    erc721TokenAddresses.innerHTML = erc721TokenAddresses.innerHTML
      .concat(', ', nftsContract.address)
      .split(', ')
      .filter(Boolean)
      .join(', ');

    nftsStatus.innerHTML = 'Deployed';
    mintButton.disabled = false;
    sign721Permit.disabled = false;
    mintAmountInput.disabled = false;
  };

  watchNFTsButton.onclick = async () => {
    const currentTokenId = await nftsContract.currentTokenId();
    const nftsContractAddress = nftsContract.address;
    let watchNftsResult;
    try {
      watchNftsResult = await globalContext.provider.sendAsync(
        Array.from({ length: currentTokenId }, (_, i) => i + 1).map(
          (tokenId) => {
            return {
              method: 'wallet_watchAsset',
              params: {
                type: 'ERC721',
                options: {
                  address: nftsContractAddress,
                  tokenId: tokenId.toString(),
                },
              },
            };
          },
        ),
      );
    } catch (error) {
      console.error(error);
    }
    console.log(watchNftsResult);
  };

  mintButton.onclick = async () => {
    nftsStatus.innerHTML = 'Mint initiated';
    let result = await nftsContract.mintNFTs(mintAmountInput.value, {
      from: globalContext.accounts[0],
    });
    result = await result.wait();
    console.log(result);
    nftsStatus.innerHTML = 'Mint completed';
    approveTokenInput.disabled = false;
    approveButton.disabled = false;
    watchNFTInput.disabled = false;
    watchNFTButton.disabled = false;
    setApprovalForAllButton.disabled = false;
    revokeButton.disabled = false;
    transferTokenInput.disabled = false;
    transferFromButton.disabled = false;
    watchNFTsButton.disabled = false;
    watchNFTButtons.innerHTML = '';
  };

  sign721Permit.onclick = async () => {
    const from = globalContext.accounts[0];
    const msgParams = await getNFTMsgParams();
    console.log(msgParams);

    let sign;
    let r;
    let s;
    let v;

    try {
      sign = await globalContext.provider.request({
        method: 'eth_signTypedData_v4',
        params: [from, JSON.stringify(msgParams)],
      });
      const { _r, _s, _v } = splitSig(sign);
      r = `0x${_r.toString('hex')}`;
      s = `0x${_s.toString('hex')}`;
      v = _v.toString();

      sign721PermitResult.innerHTML = sign;
      sign721PermitResultR.innerHTML = `r: ${r}`;
      sign721PermitResultS.innerHTML = `s: ${s}`;
      sign721PermitResultV.innerHTML = `v: ${v}`;
      sign721PermitVerify.disabled = false;
    } catch (err) {
      console.error(err);
      sign721PermitResult.innerHTML = `Error: ${err.message}`;
    }
  };

  /**
   *  Sign Permit Verification
   */
  sign721PermitVerify.onclick = async () => {
    const from = globalContext.accounts[0];
    const msgParams = await getNFTMsgParams();

    try {
      const sign = sign721PermitResult.innerHTML;
      const recoveredAddr = recoverTypedSignature({
        data: msgParams,
        signature: sign,
        version: 'V4',
      });
      if (toChecksumAddress(recoveredAddr) === toChecksumAddress(from)) {
        console.log(`Successfully verified signer as ${recoveredAddr}`);
        sign721PermitVerifyResult.innerHTML = recoveredAddr;
      } else {
        console.log(
          `Failed to verify signer when comparing ${recoveredAddr} to ${from}`,
        );
      }
    } catch (err) {
      console.error(err);
      sign721PermitVerifyResult.innerHTML = `Error: ${err.message}`;
    }
  };

  watchNFTButton.onclick = async () => {
    let watchNftsResult;
    try {
      watchNftsResult = await globalContext.provider.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC721',
          options: {
            address: nftsContract.address,
            tokenId: watchNFTInput.value,
          },
        },
      });
    } catch (error) {
      console.error(error);
    }
    console.log(watchNftsResult);
  };

  approveButton.onclick = async () => {
    nftsStatus.innerHTML = 'Approve initiated';
    let result = await nftsContract.approve(
      '0x9bc5baF874d2DA8D216aE9f137804184EE5AfEF4',
      approveTokenInput.value,
      {
        from: globalContext.accounts[0],
      },
    );
    result = await result.wait();
    console.log(result);
    nftsStatus.innerHTML = 'Approve completed';
  };

  setApprovalForAllButton.onclick = async () => {
    nftsStatus.innerHTML = 'Set Approval For All initiated';
    let result = await nftsContract.setApprovalForAll(
      '0x9bc5baF874d2DA8D216aE9f137804184EE5AfEF4',
      true,
      {
        from: globalContext.accounts[0],
      },
    );
    result = await result.wait();
    console.log(result);
    nftsStatus.innerHTML = 'Set Approval For All completed';
  };

  revokeButton.onclick = async () => {
    nftsStatus.innerHTML = 'Revoke initiated';
    let result = await nftsContract.setApprovalForAll(
      '0x9bc5baF874d2DA8D216aE9f137804184EE5AfEF4',
      false,
      {
        from: globalContext.accounts[0],
      },
    );
    result = await result.wait();
    console.log(result);
    nftsStatus.innerHTML = 'Revoke completed';
  };

  transferFromButton.onclick = async () => {
    nftsStatus.innerHTML = 'Transfer From initiated';
    let result = await nftsContract.transferFrom(
      globalContext.accounts[0],
      '0x2f318C334780961FB129D2a6c30D0763d9a5C970',
      transferTokenInput.value,
      {
        from: globalContext.accounts[0],
      },
    );
    result = await result.wait();
    console.log(result);
    nftsStatus.innerHTML = 'Transfer From completed';
  };

  /**
   * ERC1155 Token
   */

  deployERC1155Button.onclick = async () => {
    erc1155Status.innerHTML = 'Deploying';

    try {
      erc1155Contract = await erc1155Factory.deploy();
      await erc1155Contract.deployTransaction.wait();
    } catch (error) {
      erc1155Status.innerHTML = 'Deployment Failed!';
      throw error;
    }

    if (erc1155Contract.address === undefined) {
      return;
    }

    console.log(
      `Contract mined! address: ${erc1155Contract.address} transactionHash: ${erc1155Contract.deployTransaction.hash}`,
    );

    erc1155TokenAddresses.innerHTML = erc1155TokenAddresses.innerHTML
      .concat(', ', erc1155Contract.address)
      .split(', ')
      .filter(Boolean)
      .join(', ');

    erc1155Status.innerHTML = 'Deployed';
    batchTransferTokenIds.disabled = false;
    batchTransferTokenAmounts.disabled = false;
    batchMintButton.disabled = false;
    batchTransferFromButton.disabled = false;
    setApprovalForAllERC1155Button.disabled = false;
    revokeERC1155Button.disabled = false;
    watchAssetInput.disabled = false;
    watchAssetButton.disabled = false;
  };

  batchMintButton.onclick = async () => {
    erc1155Status.innerHTML = 'Batch Mint initiated';

    const params = [
      globalContext.accounts[0],
      batchMintTokenIds.value.split(',').map(Number),
      batchMintIdAmounts.value.split(',').map(Number),
      '0x',
    ];

    let result;

    try {
      result = await erc1155Contract.mintBatch(...params);
    } catch (error) {
      erc1155Status.innerHTML = 'Mint Failed!';
      throw error;
    }

    console.log(result);
    erc1155Status.innerHTML = 'Batch Minting completed';
  };

  batchTransferFromButton.onclick = async () => {
    erc1155Status.innerHTML = 'Batch Transfer From initiated';

    const params = [
      globalContext.accounts[0],
      '0x2f318C334780961FB129D2a6c30D0763d9a5C970',
      batchTransferTokenIds.value.split(',').map(Number),
      batchTransferTokenAmounts.value.split(',').map(Number),
      '0x',
    ];

    let result;

    try {
      result = await erc1155Contract.safeBatchTransferFrom(...params);
    } catch (error) {
      erc1155Status.innerHTML = 'Transaction Failed!';
      throw error;
    }
    console.log(result);
    erc1155Status.innerHTML = 'Batch Transfer From completed';
  };

  setApprovalForAllERC1155Button.onclick = async () => {
    erc1155Status.innerHTML = 'Set Approval For All initiated';
    let result = await erc1155Contract.setApprovalForAll(
      '0x9bc5baF874d2DA8D216aE9f137804184EE5AfEF4',
      true,
      {
        from: globalContext.accounts[0],
      },
    );
    result = await result.wait();
    console.log(result);
    erc1155Status.innerHTML = 'Set Approval For All completed';
  };

  revokeERC1155Button.onclick = async () => {
    erc1155Status.innerHTML = 'Revoke initiated';
    let result = await erc1155Contract.setApprovalForAll(
      '0x9bc5baF874d2DA8D216aE9f137804184EE5AfEF4',
      false,
      {
        from: globalContext.accounts[0],
      },
    );
    result = await result.wait();
    console.log(result);
    erc1155Status.innerHTML = 'Revoke completed';
  };

  watchAssetButton.onclick = async () => {
    try {
      const watchAssetResult = await globalContext.provider.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC1155',
          options: {
            address: erc1155Contract.address,
            tokenId: watchAssetInput.value,
          },
        },
      });
      console.log(watchAssetResult);
    } catch (error) {
      console.error(error);
    }
  };

  /**
   *  EIP 747
   */

  eip747WatchButton.onclick = async () => {
    eip747Status.innerHTML = 'Adding token...';

    try {
      const result = await globalContext.provider.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address: eip747ContractAddress.value,
            symbol: eip747Symbol.value,
            decimals: parseInt(eip747Decimals.value, 10),
            image: 'https://metamask.github.io/test-dapp/metamask-fox.svg',
          },
        },
      });
      eip747Status.innerHTML = 'NFT added successfully';
      console.log(result);
    } catch (error) {
      eip747Status.innerHTML =
        'There was an error adding the token. See console for details.';
      console.error(error);
    }
  };

  /**
   *  PPOM
   */

  // Mint ERC20 in Sepolia
  mintSepoliaERC20.onclick = async () => {
    const from = globalContext.accounts[0];
    const noPrefixedAddress = from.slice(2);
    const result = await globalContext.provider.request({
      method: 'eth_sendTransaction',
      params: [
        {
          from,
          to: '0x27A56df30bC838BCA36141E517e7b5376dea68eE',
          value: '0x0',
          data: `0x40c10f19000000000000000000000000${noPrefixedAddress}000000000000000000000000000000000000000000000000000000001dcd6500`,
        },
      ],
    });
    console.log(result);
  };

  // Malicious ERC20 Approval
  maliciousApprovalButton.onclick = async () => {
    let erc20Contract;

    if (networkName) {
      erc20Contract = ERC20_SAMPLE_CONTRACTS[networkName];
    } else {
      erc20Contract = '0x4fabb145d64652a948d72533023f6e7a623c7c53';
    }
    const result = await globalContext.provider.request({
      method: 'eth_sendTransaction',
      params: [
        {
          from: globalContext.accounts[0],
          to: erc20Contract,
          data: '0x095ea7b3000000000000000000000000e50a2dbc466d01a34c3e8b7e8e45fce4f7da39e6000000000000000000000000000000000000000000000000ffffffffffffffff',
        },
      ],
    });
    console.log(result);
  };

  // Malicious Contract interaction
  maliciousContractInteractionButton.onclick = async () => {
    const contractAddress =
      MALICIOUS_CONTRACT_ADDRESSES[networkName] ||
      MALICIOUS_CONTRACT_ADDRESSES.default;

    const result = await globalContext.provider.request({
      method: 'eth_sendTransaction',
      params: [
        {
          from: globalContext.accounts[0],
          to: contractAddress,
          data: '0xef5cfb8c0000000000000000000000000b3e87a076ac4b0d1975f0f232444af6deb96c59',
          value: '0x0',
        },
      ],
    });
    console.log(result);
  };

  // Malicious ERC20 transfer
  maliciousERC20TransferButton.onclick = async () => {
    let erc20Contract;

    if (networkName) {
      erc20Contract = ERC20_SAMPLE_CONTRACTS[networkName];
    } else {
      erc20Contract = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
    }

    const result = await globalContext.provider.request({
      method: 'eth_sendTransaction',
      params: [
        {
          from: globalContext.accounts[0],
          to: erc20Contract,
          data: '0xa9059cbb0000000000000000000000005fbdb2315678afecb367f032d93f642f64180aa30000000000000000000000000000000000000000000000000000000000000064',
        },
      ],
    });
    console.log(result);
  };

  // Malicious raw ETH transfer
  maliciousRawEthButton.onclick = async () => {
    const result = await globalContext.provider.request({
      method: 'eth_sendTransaction',
      params: [
        {
          from: globalContext.accounts[0],
          to: `${maliciousAddress}`,
          value: '0x9184e72a000',
        },
      ],
    });
    console.log(result);
  };

  // Malicious permit
  maliciousPermit.onclick = async () => {
    const result = await globalContext.provider.request({
      method: 'eth_signTypedData_v4',
      params: [
        globalContext.accounts[0],
        `{"types":{"EIP712Domain":[{"name":"name","type":"string"},{"name":"version","type":"string"},{"name":"chainId","type":"uint256"},{"name":"verifyingContract","type":"address"}],"Permit":[{"name":"owner","type":"address"},{"name":"spender","type":"address"},{"name":"value","type":"uint256"},{"name":"nonce","type":"uint256"},{"name":"deadline","type":"uint256"}]},"primaryType":"Permit","domain":{"name":"USD Coin","verifyingContract":"0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48","chainId":${globalContext.chainIdInt},"version":"2"},"message":{"owner":"${globalContext.accounts[0]}","spender":"0x1661F1B207629e4F385DA89cFF535C8E5Eb23Ee3","value":"1033366316628","nonce":1,"deadline":1678709555}}`,
      ],
    });
    console.log(result);
  };

  // Malicious trade order
  maliciousTradeOrder.onclick = async () => {
    const result = await globalContext.provider.request({
      method: 'eth_signTypedData_v4',
      params: [
        globalContext.accounts[0],
        `{"types":{"ERC721Order":[{"type":"uint8","name":"direction"},{"type":"address","name":"maker"},{"type":"address","name":"taker"},{"type":"uint256","name":"expiry"},{"type":"uint256","name":"nonce"},{"type":"address","name":"erc20Token"},{"type":"uint256","name":"erc20TokenAmount"},{"type":"Fee[]","name":"fees"},{"type":"address","name":"erc721Token"},{"type":"uint256","name":"erc721TokenId"},{"type":"Property[]","name":"erc721TokenProperties"}],"Fee":[{"type":"address","name":"recipient"},{"type":"uint256","name":"amount"},{"type":"bytes","name":"feeData"}],"Property":[{"type":"address","name":"propertyValidator"},{"type":"bytes","name":"propertyData"}],"EIP712Domain":[{"name":"name","type":"string"},{"name":"version","type":"string"},{"name":"chainId","type":"uint256"},{"name":"verifyingContract","type":"address"}]},"domain":{"name":"ZeroEx","version":"1.0.0","chainId":"${globalContext.chainIdInt}","verifyingContract":"0xdef1c0ded9bec7f1a1670819833240f027b25eff"},"primaryType":"ERC721Order","message":{"direction":"0","maker":"${globalContext.accounts[0]}","taker":"${maliciousAddress}","expiry":"2524604400","nonce":"100131415900000000000000000000000000000083840314483690155566137712510085002484","erc20Token":"0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2","erc20TokenAmount":"42000000000000","fees":[],"erc721Token":"0x8a90CAb2b38dba80c64b7734e58Ee1dB38B8992e","erc721TokenId":"2516","erc721TokenProperties":[]}}`,
      ],
    });
    console.log(result);
  };

  // Malicious Seaport
  maliciousSeaport.onclick = async () => {
    const result = await globalContext.provider.request({
      method: 'eth_signTypedData_v4',
      params: [
        globalContext.accounts[0],
        `{"types":{"OrderComponents":[{"name":"offerer","type":"address"},{"name":"zone","type":"address"},{"name":"offer","type":"OfferItem[]"},{"name":"consideration","type":"ConsiderationItem[]"},{"name":"orderType","type":"uint8"},{"name":"startTime","type":"uint256"},{"name":"endTime","type":"uint256"},{"name":"zoneHash","type":"bytes32"},{"name":"salt","type":"uint256"},{"name":"conduitKey","type":"bytes32"},{"name":"counter","type":"uint256"}],"OfferItem":[{"name":"itemType","type":"uint8"},{"name":"token","type":"address"},{"name":"identifierOrCriteria","type":"uint256"},{"name":"startAmount","type":"uint256"},{"name":"endAmount","type":"uint256"}],"ConsiderationItem":[{"name":"itemType","type":"uint8"},{"name":"token","type":"address"},{"name":"identifierOrCriteria","type":"uint256"},{"name":"startAmount","type":"uint256"},{"name":"endAmount","type":"uint256"},{"name":"recipient","type":"address"}],"EIP712Domain":[{"name":"name","type":"string"},{"name":"version","type":"string"},{"name":"chainId","type":"uint256"},{"name":"verifyingContract","type":"address"}]},"domain":{"name":"Seaport","version":"1.1","chainId":${globalContext.chainIdInt},"verifyingContract":"0x00000000006c3852cbef3e08e8df289169ede581"},"primaryType":"OrderComponents","message":{"offerer":"0x5a6f5477bdeb7801ba137a9f0dc39c0599bac994","zone":"0x004c00500000ad104d7dbd00e3ae0a5c00560c00","offer":[{"itemType":"2","token":"0x60e4d786628fea6478f785a6d7e704777c86a7c6","identifierOrCriteria":"26464","startAmount":"1","endAmount":"1"},{"itemType":"2","token":"0x60e4d786628fea6478f785a6d7e704777c86a7c6","identifierOrCriteria":"7779","startAmount":"1","endAmount":"1"},{"itemType":"2","token":"0x60e4d786628fea6478f785a6d7e704777c86a7c6","identifierOrCriteria":"4770","startAmount":"1","endAmount":"1"},{"itemType":"2","token":"0xba30e5f9bb24caa003e9f2f0497ad287fdf95623","identifierOrCriteria":"9594","startAmount":"1","endAmount":"1"},{"itemType":"2","token":"0xba30e5f9bb24caa003e9f2f0497ad287fdf95623","identifierOrCriteria":"2118","startAmount":"1","endAmount":"1"},{"itemType":"2","token":"0xba30e5f9bb24caa003e9f2f0497ad287fdf95623","identifierOrCriteria":"1753","startAmount":"1","endAmount":"1"}],"consideration":[{"itemType":"2","token":"0x60e4d786628fea6478f785a6d7e704777c86a7c6","identifierOrCriteria":"26464","startAmount":"1","endAmount":"1","recipient":"0xdfdc0b1cf8e9950d6a860af6501c4fecf7825cc1"},{"itemType":"2","token":"0x60e4d786628fea6478f785a6d7e704777c86a7c6","identifierOrCriteria":"7779","startAmount":"1","endAmount":"1","recipient":"0xdfdc0b1cf8e9950d6a860af6501c4fecf7825cc1"},{"itemType":"2","token":"0x60e4d786628fea6478f785a6d7e704777c86a7c6","identifierOrCriteria":"4770","startAmount":"1","endAmount":"1","recipient":"0xdfdc0b1cf8e9950d6a860af6501c4fecf7825cc1"},{"itemType":"2","token":"0xba30e5f9bb24caa003e9f2f0497ad287fdf95623","identifierOrCriteria":"9594","startAmount":"1","endAmount":"1","recipient":"0xdfdc0b1cf8e9950d6a860af6501c4fecf7825cc1"},{"itemType":"2","token":"0xba30e5f9bb24caa003e9f2f0497ad287fdf95623","identifierOrCriteria":"2118","startAmount":"1","endAmount":"1","recipient":"0xdfdc0b1cf8e9950d6a860af6501c4fecf7825cc1"},{"itemType":"2","token":"0xba30e5f9bb24caa003e9f2f0497ad287fdf95623","identifierOrCriteria":"1753","startAmount":"1","endAmount":"1","recipient":"0xdfdc0b1cf8e9950d6a860af6501c4fecf7825cc1"}],"orderType":"2","startTime":"1681810415","endTime":"1681983215","zoneHash":"0x0000000000000000000000000000000000000000000000000000000000000000","salt":"1550213294656772168494388599483486699884316127427085531712538817979596","conduitKey":"0x0000007b02230091a7ed01230072f7006a004d60a8d4e71d599b8104250f0000","counter":"0"}}`,
      ],
    });
    console.log(result);
  };

  // Malicious Set Approval For All
  maliciousSetApprovalForAll.onclick = async () => {
    let erc721Contract;

    if (networkName) {
      erc721Contract = ERC721_SAMPLE_CONTRACTS[networkName];
    } else {
      erc721Contract = '0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d';
    }

    const result = await globalContext.provider.request({
      method: 'eth_sendTransaction',
      params: [
        {
          from: globalContext.accounts[0],
          to: erc721Contract,
          data: '0xa22cb465000000000000000000000000b85492afc686d5ca405e3cd4f50b05d358c75ede0000000000000000000000000000000000000000000000000000000000000001',
        },
      ],
    });
    console.log(result);
  };

  /**
   * Sending ETH
   */

  sendButton.onclick = async () => {
    const result = await globalContext.provider.request({
      method: 'eth_sendTransaction',
      params: [
        {
          from: globalContext.accounts[0],
          to: '0x0c54FcCd2e384b4BB6f2E405Bf5Cbc15a017AaFb',
          value: '0x0',
          gasLimit: '0x5208',
          gasPrice: '0x2540be400',
          type: '0x0',
        },
      ],
    });
    console.log(result);
  };

  sendEIP1559Button.onclick = async () => {
    const result = await globalContext.provider.request({
      method: 'eth_sendTransaction',
      params: [
        {
          from: globalContext.accounts[0],
          to: '0x0c54FcCd2e384b4BB6f2E405Bf5Cbc15a017AaFb',
          value: '0x0',
          gasLimit: '0x5028',
          maxFeePerGas: '0x2540be400',
          maxPriorityFeePerGas: '0x3b9aca00',
        },
      ],
    });
    console.log(result);
  };

  sendEIP1559WithoutGasButton.onclick = async () => {
    const result = await globalContext.provider.request({
      method: 'eth_sendTransaction',
      params: [
        {
          from: globalContext.accounts[0],
          to: '0x0c54FcCd2e384b4BB6f2E405Bf5Cbc15a017AaFb',
          value: '0x0',
        },
      ],
    });
    console.log(result);
  };

  /**
   * ERC20 Token
   */

  createToken.onclick = async () => {
    const _initialAmount = 10;
    const _tokenName = 'TST';

    try {
      hstContract = await hstFactory.deploy(
        _initialAmount,
        _tokenName,
        decimalUnitsInput.value,
        tokenSymbol,
      );
      await hstContract.deployTransaction.wait();
    } catch (error) {
      erc20TokenAddresses.innerHTML = 'Creation Failed';
      throw error;
    }

    if (hstContract.address === undefined) {
      return;
    }

    console.log(
      `Contract mined! address: ${hstContract.address} transactionHash: ${hstContract.deployTransaction.hash}`,
    );
    erc20TokenAddresses.innerHTML = erc20TokenAddresses.innerHTML
      .concat(', ', hstContract.address)
      .split(', ')
      .filter(Boolean)
      .join(', ');
    watchAssets.disabled = false;
    transferTokens.disabled = false;
    transferFromTokens.disabled = false;
    approveTokens.disabled = false;
    increaseTokenAllowance.disabled = false;
    allowanceOwnerInput.disabled = false;
    allowanceSpenderInput.disabled = false;
    allowanceAmountResult.disabled = false;
    getAllowance.disabled = false;
    transferTokensWithoutGas.disabled = false;
    approveTokensWithoutGas.disabled = false;
    approveTokensToInput.disabled = false;
    transferFromSenderInput.disabled = false;
    transferFromRecipientInput.disabled = false;
  };

  watchAssets.onclick = async () => {
    const contractAddresses = erc20TokenAddresses.innerHTML.split(', ');

    const promises = contractAddresses.map((erc20Address) => {
      return globalContext.provider.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address: erc20Address,
            symbol: tokenSymbol,
            decimals: decimalUnitsInput.value,
            image: 'https://metamask.github.io/test-dapp/metamask-fox.svg',
          },
        },
      });
    });

    Promise.all(promises).then((result) => {
      console.log('result', result);
    });
  };

  transferTokens.onclick = async () => {
    const result = await hstContract.transfer(
      '0x2f318C334780961FB129D2a6c30D0763d9a5C970',
      decimalUnitsInput.value === '0'
        ? 1
        : `${1.5 * 10 ** decimalUnitsInput.value}`,
      { from: globalContext.accounts[0] },
    );
    console.log('result', result);
  };

  approveTokens.onclick = async () => {
    const result = await hstContract.approve(
      approveTokensToInput.value,
      `${7 * 10 ** decimalUnitsInput.value}`,
      { from: globalContext.accounts[0] },
    );
    console.log('result', result);
  };

  increaseTokenAllowance.onclick = async () => {
    const result = await hstContract.increaseAllowance(
      approveTokensToInput.value,
      `${1 * 10 ** decimalUnitsInput.value}`,
      { from: globalContext.accounts[0] },
    );
    console.log('result', result);
  };

  getAllowance.onclick = async () => {
    const result = await hstContract.allowance(
      allowanceOwnerInput.value,
      allowanceSpenderInput.value,
      { from: globalContext.accounts[0] },
    );
    const allowance = result.toNumber() / 10 ** decimalUnitsInput.value;
    allowanceAmountResult.innerHTML = allowance.toFixed(
      decimalUnitsInput.value,
    );
  };

  transferFromTokens.onclick = async () => {
    try {
      const result = await hstContract.transferFrom(
        transferFromSenderInput.value,
        transferFromRecipientInput.value,
        decimalUnitsInput.value === '0'
          ? 1
          : `${1.5 * 10 ** decimalUnitsInput.value}`,
        { from: globalContext.accounts[0] },
      );
      console.log('result', result);
      tokenMethodsResult.innerHTML = result;
    } catch (error) {
      tokenMethodsResult.innerHTML = error.message;
    }
  };

  transferTokensWithoutGas.onclick = async () => {
    const result = await hstContract.transfer(
      '0x2f318C334780961FB129D2a6c30D0763d9a5C970',
      decimalUnitsInput.value === '0'
        ? 1
        : `${1.5 * 10 ** decimalUnitsInput.value}`,
      {
        gasPrice: '20000000000',
      },
    );
    console.log('result', result);
  };

  approveTokensWithoutGas.onclick = async () => {
    const result = await hstContract.approve(
      '0x2f318C334780961FB129D2a6c30D0763d9a5C970',
      `${7 * 10 ** decimalUnitsInput.value}`,
      {
        gasPrice: '20000000000',
      },
    );
    console.log('result', result);
  };

  /**
   * Permissions
   */

  requestPermissionsButton.onclick = async () => {
    try {
      const permissionsArray = await globalContext.provider.request({
        method: 'wallet_requestPermissions',
        params: [{ eth_accounts: {} }],
      });
      permissionsResult.innerHTML =
        getPermissionsDisplayString(permissionsArray);
    } catch (err) {
      console.error(err);
      permissionsResult.innerHTML = `Error: ${err.message}`;
    }
  };

  getPermissionsButton.onclick = async () => {
    try {
      const permissionsArray = await globalContext.provider.request({
        method: 'wallet_getPermissions',
      });
      permissionsResult.innerHTML =
        getPermissionsDisplayString(permissionsArray);
    } catch (err) {
      console.error(err);
      permissionsResult.innerHTML = `Error: ${err.message}`;
    }
  };

  getAccountsButton.onclick = async () => {
    try {
      const _accounts = await globalContext.provider.request({
        method: 'eth_accounts',
      });
      getAccountsResult.innerHTML = _accounts || 'Not able to get accounts';
    } catch (err) {
      console.error(err);
      getAccountsResult.innerHTML = `Error: ${err.message}`;
    }
  };

  revokeAccountsPermissionButton.onclick = async () => {
    try {
      await globalContext.provider.request({
        method: 'wallet_revokePermissions',
        params: [
          {
            eth_accounts: {},
          },
        ],
      });
    } catch (err) {
      permissionsResult.innerHTML = `${err.message}`;
    }
  };

  addEthereumChain.onclick = async () => {
    await globalContext.provider.request({
      method: 'wallet_addEthereumChain',
      params: [
        {
          chainId: '0x53a',
          rpcUrls: ['http://127.0.0.1:8546'],
          chainName: 'Localhost 8546',
          nativeCurrency: { name: 'TEST', decimals: 18, symbol: 'TEST' },
          blockExplorerUrls: null,
        },
      ],
    });
  };

  switchEthereumChain.onclick = async () => {
    await globalContext.provider.request({
      method: 'wallet_switchEthereumChain',
      params: [
        {
          chainId: '0x53a',
        },
      ],
    });
  };

  type.onchange = async () => {
    if (type.value === '0x0') {
      gasPriceDiv.style.display = 'block';
      maxFeeDiv.style.display = 'none';
      maxPriorityDiv.style.display = 'none';
    } else {
      gasPriceDiv.style.display = 'none';
      maxFeeDiv.style.display = 'block';
      maxPriorityDiv.style.display = 'block';
    }
  };

  async function getNFTMsgParams() {
    return {
      domain: {
        name: 'My NFT',
        version: '1',
        chainId: globalContext.chainIdInt,
        verifyingContract: nftsContract.address,
      },
      types: {
        Permit: [
          { name: 'spender', type: 'address' },
          { name: 'tokenId', type: 'uint256' },
          { name: 'nonce', type: 'uint256' },
          { name: 'deadline', type: 'uint256' },
        ],
      },
      primaryType: 'Permit',
      message: {
        spender: '0x0521797E19b8E274E4ED3bFe5254FAf6fac96F08',
        tokenId: '3606393',
        nonce: '0',
        deadline: '1734995006',
      },
    };
  }

  /**
   * Queue of 10 Malicious Signatures
   */
  signTypedDataV4Queue.onclick = async () => {
    for (let i = 0; i < 10; i++) {
      try {
        const from = globalContext.accounts[0];
        await globalContext.provider.request({
          method: 'eth_signTypedData_v4',
          params: [
            from,
            `{"types":{"EIP712Domain":[{"name":"name","type":"string"},{"name":"version","type":"string"},{"name":"chainId","type":"uint256"},{"name":"verifyingContract","type":"address"}],"Permit":[{"name":"owner","type":"address"},{"name":"spender","type":"address"},{"name":"value","type":"uint256"},{"name":"nonce","type":"uint256"},{"name":"deadline","type":"uint256"}]},"primaryType":"Permit","domain":{"name":"USD Coin","verifyingContract":"0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48","chainId":${globalContext.chainIdInt},"version":"2"},"message":{"owner":"${globalContext.accounts[0]}","spender":"0x1661F1B207629e4F385DA89cFF535C8E5Eb23Ee3","value":"1033366316628","nonce":1,"deadline":1678709555}}`,
          ],
        });
      } catch (err) {
        console.error(err);
      }
    }
  };

  /**
   * Batch of 10 Malicious Signatures
   */
  signTypedDataV4Batch.onclick = async () => {
    for (let i = 0; i < 10; i++) {
      try {
        const from = globalContext.accounts[0];
        globalContext.provider.request({
          method: 'eth_signTypedData_v4',
          params: [
            from,
            `{"types":{"EIP712Domain":[{"name":"name","type":"string"},{"name":"version","type":"string"},{"name":"chainId","type":"uint256"},{"name":"verifyingContract","type":"address"}],"Permit":[{"name":"owner","type":"address"},{"name":"spender","type":"address"},{"name":"value","type":"uint256"},{"name":"nonce","type":"uint256"},{"name":"deadline","type":"uint256"}]},"primaryType":"Permit","domain":{"name":"USD Coin","verifyingContract":"0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48","chainId":${globalContext.chainIdInt},"version":"2"},"message":{"owner":"${globalContext.accounts[0]}","spender":"0x1661F1B207629e4F385DA89cFF535C8E5Eb23Ee3","value":"1033366316628","nonce":1,"deadline":1678709555}}`,
          ],
        });
      } catch (err) {
        console.error(err);
      }
    }
  };

  /**
   *  Batch of 10 Malicious Transactions
   */
  sendEIP1559Batch.onclick = async () => {
    for (let i = 0; i < 10; i++) {
      try {
        globalContext.provider.request({
          method: 'eth_sendTransaction',
          params: [
            {
              from: globalContext.accounts[0],
              to: `${maliciousAddress}`,
              value: '0x0',
              gasLimit: '0x5028',
              maxFeePerGas: '0x2540be400',
              maxPriorityFeePerGas: '0x3b9aca00',
            },
          ],
        });
      } catch (err) {
        console.error(err);
      }
    }
  };

  /**
   *  Queue of 10 Malicious Transactions
   */
  sendEIP1559Queue.onclick = async () => {
    for (let i = 0; i < 10; i++) {
      try {
        await globalContext.provider.request({
          method: 'eth_sendTransaction',
          params: [
            {
              from: globalContext.accounts[0],
              to: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
              value: '0x0',
              gasLimit: '0x5028',
              maxFeePerGas: '0x2540be400',
              maxPriorityFeePerGas: '0x3b9aca00',
            },
          ],
        });
      } catch (err) {
        console.error(err);
      }
    }
  };

  /**
   *  PPOM - Malicious Warning Bypasses
   */
  maliciousSendWithOddHexData.onclick = async () => {
    try {
      const from = globalContext.accounts[0];
      const send = await globalContext.provider.request({
        method: 'eth_sendTransaction',
        params: [
          {
            from,
            to: `${maliciousAddress}`,
            value: '0x9184e72a000',
            data: '0x1', // odd hex data - expected 0x01
          },
        ],
      });
      sendMalformedResult.innerHTML = send;
    } catch (err) {
      console.error(err);
      sendMalformedResult.innerHTML = `Error: ${err.message}`;
    }
  };

  maliciousApproveERC20WithOddHexData.onclick = async () => {
    let erc20Contract;

    if (networkName) {
      erc20Contract = ERC20_SAMPLE_CONTRACTS[networkName];
    } else {
      erc20Contract = '0x4fabb145d64652a948d72533023f6e7a623c7c53';
    }

    try {
      const from = globalContext.accounts[0];
      const send = await globalContext.provider.request({
        method: 'eth_sendTransaction',
        params: [
          {
            from,
            to: erc20Contract,
            value: '0x0',
            // odd approve hex data - expected 0x095ea7b3...
            data: '0x95ea7b3000000000000000000000000e50a2dbc466d01a34c3e8b7e8e45fce4f7da39e6000000000000000000000000000000000000000000000000ffffffffffffffff',
          },
        ],
      });
      sendMalformedResult.innerHTML = send;
    } catch (err) {
      console.error(err);
      sendMalformedResult.innerHTML = `Error: ${err.message}`;
    }
  };

  maliciousSendWithoutHexPrefixValue.onclick = async () => {
    try {
      const from = globalContext.accounts[0];
      const send = await globalContext.provider.request({
        method: 'eth_sendTransaction',
        params: [
          {
            from,
            to: `${maliciousAddress}`,
            value: 'ffffffffffffff', // value without 0x prefix
          },
        ],
      });
      sendMalformedResult.innerHTML = send;
    } catch (err) {
      console.error(err);
      sendMalformedResult.innerHTML = `Error: ${err.message}`;
    }
  };
  maliciousPermitHexPaddedChain.onclick = async () => {
    const result = await globalContext.provider.request({
      method: 'eth_signTypedData_v4',
      params: [
        globalContext.accounts[0],
        `{"types":{"EIP712Domain":[{"name":"name","type":"string"},{"name":"version","type":"string"},{"name":"chainId","type":"uint256"},{"name":"verifyingContract","type":"address"}],"Permit":[{"name":"owner","type":"address"},{"name":"spender","type":"address"},{"name":"value","type":"uint256"},{"name":"nonce","type":"uint256"},{"name":"deadline","type":"uint256"}]},"primaryType":"Permit","domain":{"name":"USD Coin","verifyingContract":"0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48","chainId":"${chainIdPadded}","version":"2"},"message":{"owner":"${globalContext.accounts[0]}","spender":"0x1661F1B207629e4F385DA89cFF535C8E5Eb23Ee3","value":"1033366316628","nonce":1,"deadline":1678709555}}`,
      ],
    });
    console.log(result);
  };

  maliciousPermitIntAddress.onclick = async () => {
    const result = await globalContext.provider.request({
      method: 'eth_signTypedData_v4',
      params: [
        globalContext.accounts[0],
        `{"types":{"EIP712Domain":[{"name":"name","type":"string"},{"name":"version","type":"string"},{"name":"chainId","type":"uint256"},{"name":"verifyingContract","type":"address"}],"Permit":[{"name":"owner","type":"address"},{"name":"spender","type":"address"},{"name":"value","type":"uint256"},{"name":"nonce","type":"uint256"},{"name":"deadline","type":"uint256"}]},"primaryType":"Permit","domain":{"name":"USD Coin","verifyingContract":"917551056842671309452305380979543736893630245704","chainId":${globalContext.chainIdInt},"version":"2"},"message":{"owner":"${globalContext.accounts[0]}","spender":"0x1661F1B207629e4F385DA89cFF535C8E5Eb23Ee3","value":"1033366316628","nonce":1,"deadline":1678709555}}`,
      ],
    });
    console.log(result);
  };

  /**
   * Providers
   */

  useWindowProviderButton.onclick = setActiveProviderDetailWindowEthereum;
};

const setDeeplinks = () => {
  sendDeeplinkButton.href =
    'https://metamask.app.link/send/0x0c54FcCd2e384b4BB6f2E405Bf5Cbc15a017AaFb?value=0';
  transferTokensDeeplink.href = `https://metamask.app.link/send/${deployedContractAddress}/transfer?address=0x2f318C334780961FB129D2a6c30D0763d9a5C970&uint256=4e${tokenDecimals}`;
  approveTokensDeeplink.href = `https://metamask.app.link/approve/${deployedContractAddress}/approve?address=0x178e3e6c9f547A00E33150F7104427ea02cfc747&uint256=3e${tokenDecimals}`;
  maliciousSendEthWithDeeplink.href = `https://metamask.app.link/send/${maliciousAddress}?value=0`;
  maliciousTransferERC20WithDeeplink.href = `https://metamask.app.link/send/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48@1/transfer?address=${maliciousAddress}&uint256=1e6`;
  maliciousApproveERC20WithDeeplink.href = `https://metamask.app.link/approve/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48@1/approve?address=${maliciousAddress}&uint256=1e6`;
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
  initializeFormElements();
  setDeeplinks();
};

window.addEventListener('load', initialize);
