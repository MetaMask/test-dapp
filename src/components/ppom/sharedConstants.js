import { maliciousAddress } from '../../sample-addresses';
import {
  ERC20_SAMPLE_CONTRACTS,
  ERC721_SAMPLE_CONTRACTS,
  MALICIOUS_CONTRACT_ADDRESSES,
  NETWORKS_BY_CHAIN_ID,
} from '../../onchain-sample-contracts';

export const getMaliciousTransactions = (globalContext) => {
  const chainId = globalContext.chainIdInt;
  const networkName = NETWORKS_BY_CHAIN_ID[chainId] || 'default';

  return {
    eth: {
      to: maliciousAddress,
      value: '0x9184e72a000',
    },
    erc20Transfer: {
      to: ERC20_SAMPLE_CONTRACTS[networkName],
      data: '0xa9059cbb0000000000000000000000005fbdb2315678afecb367f032d93f642f64180aa30000000000000000000000000000000000000000000000000000000000000064',
      value: '0x0',
    },
    erc20Approval: {
      to: ERC20_SAMPLE_CONTRACTS[networkName],
      data: '0x095ea7b3000000000000000000000000e50a2dbc466d01a34c3e8b7e8e45fce4f7da39e6000000000000000000000000000000000000000000000000ffffffffffffffff',
      value: '0x0',
    },
    setApprovalForAll: {
      to: ERC721_SAMPLE_CONTRACTS[networkName],
      data: '0xa22cb465000000000000000000000000b85492afc686d5ca405e3cd4f50b05d358c75ede0000000000000000000000000000000000000000000000000000000000000001',
      value: '0x0',
    },
    maliciousContractInteraction: {
      to:
        MALICIOUS_CONTRACT_ADDRESSES[networkName] ||
        MALICIOUS_CONTRACT_ADDRESSES.default,
      data: '0xef5cfb8c0000000000000000000000000b3e87a076ac4b0d1975f0f232444af6deb96c59',
      value: '0x0',
    },
  };
};

export const getMaliciousTransactionBypasses = (globalContext) => {
  const chainId = globalContext.chainIdInt;
  const networkName = NETWORKS_BY_CHAIN_ID[chainId] || 'default';

  return {
    ethWithHexData: {
      to: maliciousAddress,
      value: '0x9184e72a000',
      data: '0x1', // odd hex data - expected 0x01
    },
    erc20ApprovalWithOddHexData: {
      to: ERC20_SAMPLE_CONTRACTS[networkName],
      value: '0x0',
      data: '0x95ea7b3000000000000000000000000e50a2dbc466d01a34c3e8b7e8e45fce4f7da39e6000000000000000000000000000000000000000000000000ffffffffffffffff',
    },
    maliciousSendWithoutHexPrefixValue: {
      to: maliciousAddress,
      value: 'ffffffffffffff', // value without 0x prefix
      data: '0x0',
    },
  };
};
