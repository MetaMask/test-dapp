import { EIP712Domain } from '../../signatures/utils';
import globalContext from '../..';

// Malformed Signatues
export const signInvalidType = document.getElementById('signInvalidType');
export const signEmptyDomain = document.getElementById('signEmptyDomain');
export const signExtraDataNotTyped = document.getElementById(
  'signExtraDataNotTyped',
);
export const signInvalidPrimaryType = document.getElementById(
  'signInvalidPrimaryType',
);
export const signNoPrimaryTypeDefined = document.getElementById(
  'signNoPrimaryTypeDefined',
);
export const signInvalidVerifyingContractType = document.getElementById(
  'signInvalidVerifyingContractType',
);
export const signMalformedResult = document.getElementById(
  'signMalformedResult',
);

export function malformedSignaturesComponent(parentContainer) {
  parentContainer.insertAdjacentHTML(
    'beforeend',
    `<div class="col-xl-4 col-lg-6 col-md-12 col-sm-12 col-12 d-flex align-items-stretch" >
        <div class="card full-width">
          <div class="card-body">
            <h4>
              Malformed Signatures
            </h4>

            <button
              class="btn btn-primary btn-lg btn-block mb-3"
              id="signInvalidType"
              disabled
            >
            Invalid Type
            </button>
            <button
              class="btn btn-primary btn-lg btn-block mb-3"
              id="signEmptyDomain"
              disabled
            >
            Empty Domain
            </button>

            <button
              class="btn btn-primary btn-lg btn-block mb-3"
              id="signExtraDataNotTyped"
              disabled
            >
            Extra Data not Typed
            </button>

            <button
              class="btn btn-primary btn-lg btn-block mb-3"
              id="signInvalidPrimaryType"
              disabled
            >
            Invalid Primary Type
            </button>

            <button
              class="btn btn-primary btn-lg btn-block mb-3"
              id="signNoPrimaryTypeDefined"
              disabled
            >
            No Primary Type Defined
            </button>
            <button
              class="btn btn-primary btn-lg btn-block mb-3"
              id="signInvalidVerifyingContractType"
              disabled
            >
            Invalid Verifying Contract Type
            </button>
            <p class="info-text alert alert-warning">
              Result:
              <span id="signMalformedResult"></span>
            </p>
          </div>
      </div>
    </div>`,
  );

  /**
   * Sign Invalid Type
   */
  signInvalidType.onclick = async () => {
    const msgParams = {
      primaryType: 'OrderComponents',
      domain: {
        chainId: globalContext.chainIdInt,
        name: 'Seaport',
        version: '1.5',
        verifyingContract: '0x00000000000000ADc04C56Bf30aC9d3c0aAF14dC',
      },
      types: {
        EIP712Domain,
        OrderComponents: [
          { name: 'consideration', type: 'ConsiderationItem[+' },
        ],
      },
      message: {
        consideration: [
          {
            itemType: '0',
            token: '0x0000000000000000000000000000000000000000',
            identifierOrCriteria: '0',
            startAmount: '1950000000000000',
            endAmount: '1950000000000000',
            recipient: '0x0000000000000000000000000000000000000000',
          },
        ],
      },
    };
    try {
      const from = globalContext.accounts[0];
      const sign = await globalContext.provider.request({
        method: 'eth_signTypedData_v4',
        params: [from, JSON.stringify(msgParams)],
      });
      signMalformedResult.innerHTML = sign;
    } catch (err) {
      console.error(err);
      signMalformedResult.innerHTML = `Error: ${err.message}`;
    }
  };

  /**
   * Sign Empty Domain
   */
  signEmptyDomain.onclick = async () => {
    const msgParams = {
      domain: {},
      message: {
        contents: 'Hello, Bob!',
        from: {
          name: 'Cow',
          wallets: [
            '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
            '0xDeaDbeefdEAdbeefdEadbEEFdeadbeEFdEaDbeeF',
          ],
        },
        to: [
          {
            name: 'Bob',
            wallets: [
              '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
              '0xB0BdaBea57B0BDABeA57b0bdABEA57b0BDabEa57',
              '0xB0B0b0b0b0b0B000000000000000000000000000',
            ],
          },
        ],
        attachment: '0x',
      },
      primaryType: 'Mail',
      types: {
        EIP712Domain,
        Group: [
          { name: 'name', type: 'string' },
          { name: 'members', type: 'Person[]' },
        ],
        Mail: [
          { name: 'from', type: 'Person' },
          { name: 'to', type: 'Person[]' },
          { name: 'contents', type: 'string' },
          { name: 'attachment', type: 'bytes' },
        ],
        Person: [
          { name: 'name', type: 'string' },
          { name: 'wallets', type: 'address[]' },
        ],
      },
    };
    try {
      const from = globalContext.accounts[0];
      const sign = await globalContext.provider.request({
        method: 'eth_signTypedData_v4',
        params: [from, JSON.stringify(msgParams)],
      });
      signMalformedResult.innerHTML = sign;
    } catch (err) {
      console.error(err);
      signMalformedResult.innerHTML = `Error: ${err.message}`;
    }
  };

  /**
   * Sign Extra Data Not Typed
   */
  signExtraDataNotTyped.onclick = async () => {
    const msgParams = {
      domain: {
        chainId: globalContext.chainIdInt,
        name: 'Seaport',
        version: '1.5',
        verifyingContract: '0x00000000000000ADc04C56Bf30aC9d3c0aAF14dC',
      },
      message: {
        name: 'Hello, Bob!',
        extraData: 'This data is not typed!',
      },
      primaryType: 'Wallet',
      types: {
        EIP712Domain,
        Wallet: [{ name: 'name', type: 'string' }],
      },
    };
    try {
      const from = globalContext.accounts[0];
      const sign = await globalContext.provider.request({
        method: 'eth_signTypedData_v4',
        params: [from, JSON.stringify(msgParams)],
      });
      signMalformedResult.innerHTML = sign;
    } catch (err) {
      console.error(err);
      signMalformedResult.innerHTML = `Error: ${err.message}`;
    }
  };

  /**
   * Sign Invalid Primary Type
   */
  signInvalidPrimaryType.onclick = async () => {
    const msgParams = {
      domain: {
        chainId: globalContext.chainIdInt,
        name: 'Seaport',
        version: '1.5',
        verifyingContract: '0x00000000000000ADc04C56Bf30aC9d3c0aAF14dC',
      },
      message: {
        name: 'Hello, Bob!',
      },
      primaryType: 'Non-Existent',
      types: {
        EIP712Domain,
        Wallet: [{ name: 'name', type: 'string' }],
      },
    };
    try {
      const from = globalContext.accounts[0];
      const sign = await globalContext.provider.request({
        method: 'eth_signTypedData_v4',
        params: [from, JSON.stringify(msgParams)],
      });
      signMalformedResult.innerHTML = sign;
    } catch (err) {
      console.error(err);
      signMalformedResult.innerHTML = `Error: ${err.message}`;
    }
  };

  /**
   * Sign No Primary Type Defined
   */
  signNoPrimaryTypeDefined.onclick = async () => {
    const msgParams = {
      domain: {
        chainId: globalContext.chainIdInt,
        name: 'Seaport',
        version: '1.5',
        verifyingContract: '0x00000000000000ADc04C56Bf30aC9d3c0aAF14dC',
      },
      message: {
        contents: 'Hello, Bob!',
        from: {
          name: 'Cow',
          wallets: [
            '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
            '0xDeaDbeefdEAdbeefdEadbEEFdeadbeEFdEaDbeeF',
          ],
        },
        to: [
          {
            name: 'Bob',
            wallets: [
              '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
              '0xB0BdaBea57B0BDABeA57b0bdABEA57b0BDabEa57',
              '0xB0B0b0b0b0b0B000000000000000000000000000',
            ],
          },
        ],
      },
      types: {
        EIP712Domain,
        Group: [
          { name: 'name', type: 'string' },
          { name: 'members', type: 'Person[]' },
        ],
        Mail: [
          { name: 'from', type: 'Person' },
          { name: 'to', type: 'Person[]' },
          { name: 'contents', type: 'string' },
        ],
        Person: [
          { name: 'name', type: 'string' },
          { name: 'wallets', type: 'address[]' },
        ],
      },
    };
    try {
      const from = globalContext.accounts[0];
      const sign = await globalContext.provider.request({
        method: 'eth_signTypedData_v4',
        params: [from, JSON.stringify(msgParams)],
      });
      signMalformedResult.innerHTML = sign;
    } catch (err) {
      console.error(err);
      signMalformedResult.innerHTML = `Error: ${err.message}`;
    }
  };
  /**
   * Sign Invalid verifyingContract type
   */
  signInvalidVerifyingContractType.onclick = async () => {
    const msgParams = {
      domain: {
        chainId: globalContext.chainIdInt,
        name: 'Seaport',
        version: '1.5',
        verifyingContract: 1,
      },
      message: {
        name: 'Hello, Bob!',
      },
      primaryType: 'Wallet',
      types: {
        EIP712Domain,
        Wallet: [{ name: 'name', type: 'string' }],
      },
    };
    try {
      const from = globalContext.accounts[0];
      const sign = await globalContext.provider.request({
        method: 'eth_signTypedData_v4',
        params: [from, JSON.stringify(msgParams)],
      });
      signMalformedResult.innerHTML = sign;
    } catch (err) {
      console.error(err);
      signMalformedResult.innerHTML = `Error: ${err.message}`;
    }
  };
}
