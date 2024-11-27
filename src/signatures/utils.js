export const EIP712Domain = [
  { name: 'name', type: 'string' },
  { name: 'version', type: 'string' },
  { name: 'chainId', type: 'uint256' },
  { name: 'verifyingContract', type: 'address' },
];

export const MSG_PRIMARY_TYPE = {
  PERMIT: 'Permit',
  PERMIT_BATCH: 'PermitBatch',
  PERMIT_SINGLE: 'PermitSingle',
};

export function getPermitMsgParams(
  { chainId, primaryType },
  { fromAddress } = {},
) {
  switch (primaryType) {
    case MSG_PRIMARY_TYPE.PERMIT: {
      return {
        types: {
          EIP712Domain,
          Permit: [
            { name: 'owner', type: 'address' },
            { name: 'spender', type: 'address' },
            { name: 'value', type: 'uint256' },
            { name: 'nonce', type: 'uint256' },
            { name: 'deadline', type: 'uint256' },
          ],
        },
        primaryType: 'Permit',
        domain: {
          chainId,
          name: 'MyToken',
          verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
          version: '1',
        },
        message: {
          owner: fromAddress,
          spender: '0x5B38Da6a701c568545dCfcB03FcB875f56beddC4',
          value: 3000,
          nonce: 0,
          deadline: 50000000000,
        },
      };
    }
    case MSG_PRIMARY_TYPE.PERMIT_BATCH: {
      return {
        types: {
          PermitBatch: [
            {
              name: 'details',
              type: 'PermitDetails[]',
            },
            {
              name: 'spender',
              type: 'address',
            },
            {
              name: 'sigDeadline',
              type: 'uint256',
            },
          ],
          PermitDetails: [
            {
              name: 'token',
              type: 'address',
            },
            {
              name: 'amount',
              type: 'uint160',
            },
            {
              name: 'expiration',
              type: 'uint48',
            },
            {
              name: 'nonce',
              type: 'uint48',
            },
          ],
          EIP712Domain: [
            {
              name: 'name',
              type: 'string',
            },
            {
              name: 'chainId',
              type: 'uint256',
            },
            {
              name: 'verifyingContract',
              type: 'address',
            },
          ],
        },
        domain: {
          chainId,
          name: 'Permit2',
          verifyingContract: '0x000000000022d473030f116ddee9f6b43ac78ba3',
          version: '1',
        },
        primaryType: 'PermitBatch',
        message: {
          details: [
            {
              token: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
              amount: '1461501637330902918203684832716283019655932542975',
              expiration: '1722887542',
              nonce: '5',
            },
            {
              token: '0xb0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
              amount: '98765432109876543210',
              expiration: '1722887642',
              nonce: '6',
            },
          ],
          spender: '0x3fc91a3afd70395cd496c647d5a6cc9d4b2b7fad',
          sigDeadline: '1720297342',
        },
      };
    }
    case MSG_PRIMARY_TYPE.PERMIT_SINGLE: {
      return {
        types: {
          PermitSingle: [
            {
              name: 'details',
              type: 'PermitDetails',
            },
            {
              name: 'spender',
              type: 'address',
            },
            {
              name: 'sigDeadline',
              type: 'uint256',
            },
          ],
          PermitDetails: [
            {
              name: 'token',
              type: 'address',
            },
            {
              name: 'amount',
              type: 'uint160',
            },
            {
              name: 'expiration',
              type: 'uint48',
            },
            {
              name: 'nonce',
              type: 'uint48',
            },
          ],
          EIP712Domain,
        },
        domain: {
          chainId,
          name: 'Permit2',
          verifyingContract: '0x000000000022d473030f116ddee9f6b43ac78ba3',
          version: '1',
        },
        primaryType: 'PermitSingle',
        message: {
          details: {
            token: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
            amount: '1461501637330902918203684832716283019655932542975',
            expiration: '1722887542',
            nonce: '5',
          },
          spender: '0x3fc91a3afd70395cd496c647d5a6cc9d4b2b7fad',
          sigDeadline: '1720297342',
        },
      };
    }
    default: {
      throw new Error(
        `Unknown Sign Typed Signature primary type: ${primaryType}`,
      );
    }
  }
}
