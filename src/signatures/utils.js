export const EIP712Domain = [
  { name: 'name', type: 'string' },
  { name: 'version', type: 'string' },
  { name: 'chainId', type: 'uint256' },
  { name: 'verifyingContract', type: 'address' },
];

export const EIP712DomainWithSalt = [
  ...EIP712Domain,
  { name: 'salt', type: 'bytes32' },
];

export const MSG_PRIMARY_TYPE = {
  BLUR_ORDER: 'Order',
  BLUR_ROOT: 'Root',
  PERMIT: 'Permit',
  PERMIT_BATCH: 'PermitBatch',
  PERMIT_SINGLE: 'PermitSingle',
  SEAPORT_BULK_ORDER: 'BulkOrder',
};

export function splitSig(sig) {
  const pureSig = sig.replace('0x', '');

  const _r = Buffer.from(pureSig.substring(0, 64), 'hex');
  const _s = Buffer.from(pureSig.substring(64, 128), 'hex');
  const _v = Buffer.from(parseInt(pureSig.substring(128, 130), 16).toString());

  return { _r, _s, _v };
}

export function getPermitMsgParams(
  { chainId, primaryType },
  { fromAddress } = {},
) {
  switch (primaryType) {
    case MSG_PRIMARY_TYPE.BLUR_ORDER: {
      return {
        primaryType: 'Order',
        types: {
          EIP712Domain: [
            { name: 'name', type: 'string' },
            { name: 'version', type: 'string' },
            { name: 'chainId', type: 'uint256' },
            { name: 'verifyingContract', type: 'address' },
          ],
          MakerFee: [
            { name: 'recipient', type: 'address' }, // Maker fee recipient address
            { name: 'rate', type: 'uint256' }, // Maker fee rate
          ],
          Order: [
            { name: 'assetType', type: 'uint8' }, // Asset type
            { name: 'collection', type: 'address' }, // NFT collection address
            { name: 'expirationTime', type: 'uint256' }, // Order expiration time in seconds
            { name: 'listingsRoot', type: 'bytes32' }, // Listings root hash
            { name: 'makerFee', type: 'MakerFee' }, // Maker fee
            { name: 'nonce', type: 'uint256' }, // Nonce for order uniqueness
            { name: 'numberOfListings', type: 'uint256' }, // Number of listings
            { name: 'orderType', type: 'uint8' }, // Order type
            { name: 'salt', type: 'uint256' }, // Salt for order uniqueness
            { name: 'trader', type: 'address' }, // User address
          ],
        },
        domain: {
          name: 'Blur Exchange',
          version: '1.0',
          chainId,
          verifyingContract: '0xb2ecfe4e4d61f8790bbb9de2d1259b9e2410cea5',
        },
        message: {
          assetType: '0',
          collection: '0x8a90cab2b38dba80c64b7734e58ee1db38b8992e',
          expirationTime: '1739484503',
          listingsRoot:
            '0xf5126e36e0cf3f8ccdf8e3d76c1501c706c15a029fb8139bca7b536776e9eafe',
          makerFee: {
            recipient: '0x0000000000000000000000000000000000000000',
            rate: '0',
          },
          nonce: '0',
          numberOfListings: '1',
          orderType: '1',
          salt: '106171581059276559763059578085820161781',
          trader: fromAddress,
        },
      };
    }
    case MSG_PRIMARY_TYPE.PERMIT: {
      return {
        primaryType: 'Permit',
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
        primaryType: 'PermitBatch',
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
        primaryType: 'PermitSingle',
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
    case MSG_PRIMARY_TYPE.SEAPORT_BULK_ORDER: {
      return {
        primaryType: 'BulkOrder',
        types: {
          BulkOrder: [{ name: 'tree', type: 'OrderComponents[][]' }],
          OrderComponents: [
            { name: 'offerer', type: 'address' },
            { name: 'zone', type: 'address' },
            { name: 'offer', type: 'OfferItem[]' },
            { name: 'consideration', type: 'ConsiderationItem[]' },
            { name: 'orderType', type: 'uint8' },
            { name: 'startTime', type: 'uint256' },
            { name: 'endTime', type: 'uint256' },
            { name: 'zoneHash', type: 'bytes32' },
            { name: 'salt', type: 'uint256' },
            { name: 'conduitKey', type: 'bytes32' },
            { name: 'counter', type: 'uint256' },
          ],
          OfferItem: [
            { name: 'itemType', type: 'uint8' },
            { name: 'token', type: 'address' },
            { name: 'identifierOrCriteria', type: 'uint256' },
            { name: 'startAmount', type: 'uint256' },
            { name: 'endAmount', type: 'uint256' },
          ],
          ConsiderationItem: [
            { name: 'itemType', type: 'uint8' },
            { name: 'token', type: 'address' },
            { name: 'identifierOrCriteria', type: 'uint256' },
            { name: 'startAmount', type: 'uint256' },
            { name: 'endAmount', type: 'uint256' },
            { name: 'recipient', type: 'address' },
          ],
        },
        domain: {
          name: 'Seaport',
          version: '1.5',
          chainId,
          verifyingContract: '0x00000000000000ADc04C56Bf30aC9d3c0aAF14dC',
        },
        message: {
          tree: [
            [
              {
                offerer: fromAddress,
                offer: [
                  {
                    itemType: '2',
                    token: '0xafd4896984CA60d2feF66136e57f958dCe9482d5',
                    identifierOrCriteria: '2104',
                    startAmount: '1',
                    endAmount: '1',
                  },
                ],
                consideration: [
                  {
                    itemType: '0',
                    token: '0x0000000000000000000000000000000000000000',
                    identifierOrCriteria: '0',
                    startAmount: '900000000000000000',
                    endAmount: '900000000000000000',
                    recipient: fromAddress,
                  },
                  {
                    itemType: '0',
                    token: '0x0000000000000000000000000000000000000000',
                    identifierOrCriteria: '0',
                    startAmount: '25000000000000000',
                    endAmount: '25000000000000000',
                    recipient: '0x0000a26b00c1F0DF003000390027140000fAa719',
                  },
                  {
                    itemType: '0',
                    token: '0x0000000000000000000000000000000000000000',
                    identifierOrCriteria: '0',
                    startAmount: '75000000000000000',
                    endAmount: '75000000000000000',
                    recipient: '0x839221C3F9dce0ef5318356c447F8192eD04d38C',
                  },
                ],
                startTime: '1705733618',
                endTime: '1708411897',
                orderType: '0',
                zone: '0x004C00500000aD104D7DBd00e3ae0A5C00560C00',
                zoneHash:
                  '0x0000000000000000000000000000000000000000000000000000000000000000',
                salt: '24446860302761739304752683030156737591518664810215442929806792077947493999137',
                conduitKey:
                  '0x0000007b02230091a7ed01230072f7006a004d60a8d4e71d599b8104250f0000',
                totalOriginalConsiderationItems: '3',
                counter: '0',
              },
              {
                offerer: fromAddress,
                offer: [
                  {
                    itemType: '2',
                    token: '0xafd4896984CA60d2feF66136e57f958dCe9482d5',
                    identifierOrCriteria: '2103',
                    startAmount: '1',
                    endAmount: '1',
                  },
                ],
                consideration: [
                  {
                    itemType: '0',
                    token: '0x0000000000000000000000000000000000000000',
                    identifierOrCriteria: '0',
                    startAmount: '900000000000000000',
                    endAmount: '900000000000000000',
                    recipient: fromAddress,
                  },
                  {
                    itemType: '0',
                    token: '0x0000000000000000000000000000000000000000',
                    identifierOrCriteria: '0',
                    startAmount: '25000000000000000',
                    endAmount: '25000000000000000',
                    recipient: '0x0000a26b00c1F0DF003000390027140000fAa719',
                  },
                  {
                    itemType: '0',
                    token: '0x0000000000000000000000000000000000000000',
                    identifierOrCriteria: '0',
                    startAmount: '75000000000000000',
                    endAmount: '75000000000000000',
                    recipient: '0x839221C3F9dce0ef5318356c447F8192eD04d38C',
                  },
                ],
                startTime: '1705733618',
                endTime: '1708411897',
                orderType: '0',
                zone: '0x004C00500000aD104D7DBd00e3ae0A5C00560C00',
                zoneHash:
                  '0x0000000000000000000000000000000000000000000000000000000000000000',
                salt: '24446860302761739304752683030156737591518664810215442929800482629144425056459',
                conduitKey:
                  '0x0000007b02230091a7ed01230072f7006a004d60a8d4e71d599b8104250f0000',
                totalOriginalConsiderationItems: '3',
                counter: '0',
              },
            ],
            [
              {
                offerer: fromAddress,
                offer: [
                  {
                    itemType: '2',
                    token: '0xafd4896984CA60d2feF66136e57f958dCe9482d5',
                    identifierOrCriteria: '2102',
                    startAmount: '1',
                    endAmount: '1',
                  },
                ],
                consideration: [
                  {
                    itemType: '0',
                    token: '0x0000000000000000000000000000000000000000',
                    identifierOrCriteria: '0',
                    startAmount: '900000000000000000',
                    endAmount: '900000000000000000',
                    recipient: fromAddress,
                  },
                  {
                    itemType: '0',
                    token: '0x0000000000000000000000000000000000000000',
                    identifierOrCriteria: '0',
                    startAmount: '25000000000000000',
                    endAmount: '25000000000000000',
                    recipient: '0x0000a26b00c1F0DF003000390027140000fAa719',
                  },
                  {
                    itemType: '0',
                    token: '0x0000000000000000000000000000000000000000',
                    identifierOrCriteria: '0',
                    startAmount: '75000000000000000',
                    endAmount: '75000000000000000',
                    recipient: '0x839221C3F9dce0ef5318356c447F8192eD04d38C',
                  },
                ],
                startTime: '1705733618',
                endTime: '1708411897',
                orderType: '0',
                zone: '0x004C00500000aD104D7DBd00e3ae0A5C00560C00',
                zoneHash:
                  '0x0000000000000000000000000000000000000000000000000000000000000000',
                salt: '24446860302761739304752683030156737591518664810215442929800836178870704788113',
                conduitKey:
                  '0x0000007b02230091a7ed01230072f7006a004d60a8d4e71d599b8104250f0000',
                totalOriginalConsiderationItems: '3',
                counter: '0',
              },
              {
                offerer: '0x0000000000000000000000000000000000000000',
                zone: '0x0000000000000000000000000000000000000000',
                offer: [],
                consideration: [],
                orderType: '0',
                startTime: '0',
                endTime: '0',
                zoneHash:
                  '0x0000000000000000000000000000000000000000000000000000000000000000',
                salt: '0',
                conduitKey:
                  '0x0000000000000000000000000000000000000000000000000000000000000000',
                counter: '0',
                totalOriginalConsiderationItems: '0',
              },
            ],
          ],
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
