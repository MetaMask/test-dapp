import { recoverTypedSignature } from '@metamask/eth-sig-util';
import { toChecksumAddress } from 'ethereumjs-util';
import globalContext from '../..';
import { EIP712Domain } from '../../signatures/utils';

export function signTypedDataV4WithSaltComponent(parentContainer) {
  parentContainer.insertAdjacentHTML(
    'beforeend',
    `<div class="col-xl-4 col-lg-6 col-md-12 col-sm-12 col-12 d-flex align-items-stretch">
      <div class="card full-width">
        <div class="card-body">
          <h4>
            Sign Typed Data V4 with salt
          </h4>

          <button
            class="btn btn-primary btn-lg btn-block mb-3"
            id="signTypedDataV4WithSalt"
            disabled
          >
            Sign
          </button>

          <p class="info-text alert alert-warning">
            Result:
            <span id="signTypedDataV4WithSaltResult"></span>
          </p>

          <button
            class="btn btn-primary btn-lg btn-block mb-3"
            id="signTypedDataV4WithSaltVerify"
            disabled
          >
            Verify
          </button>

          <p class="info-text alert alert-warning">
            Recovery result:
            <span id="signTypedDataV4WithSaltVerifyResult"></span>
          </p>
        </div>
      </div>
    </div>`,
  );

  const signTypedDataV4WithSalt = document.getElementById(
    'signTypedDataV4WithSalt',
  );
  const signTypedDataV4WithSaltResult = document.getElementById(
    'signTypedDataV4WithSaltResult',
  );
  const signTypedDataV4WithSaltVerify = document.getElementById(
    'signTypedDataV4WithSaltVerify',
  );
  const signTypedDataV4WithSaltVerifyResult = document.getElementById(
    'signTypedDataV4WithSaltVerifyResult',
  );

  document.addEventListener('globalConnectionChange', function (e) {
    if (e.detail.connected) {
      // MetaMask is connected, enable the button
      signTypedDataV4WithSalt.disabled = false;
    }
  });

  document.addEventListener('disableAndClear', function () {
    signTypedDataV4WithSalt.disabled = true;
    signTypedDataV4WithSaltVerify.disabled = true;
  });

  /**
   * Sign Typed Data V4
   */
  signTypedDataV4WithSalt.onclick = async () => {
    const msgParams = {
      domain: {
        chainId: globalContext.chainIdInt.toString(),
        name: 'Ether Mail',
        verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
        version: '1',
        salt: 'test',
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
        attachment: '0x',
      },
      primaryType: 'Mail',
      types: {
        EIP712Domain: [
          {
            name: 'name',
            type: 'string',
          },
          {
            name: 'version',
            type: 'string',
          },
          {
            name: 'chainId',
            type: 'uint256',
          },
          {
            name: 'verifyingContract',
            type: 'string',
          },
          {
            name: 'salt',
            type: 'string',
          },
        ],
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
      signTypedDataV4WithSaltResult.innerHTML = sign;
      signTypedDataV4WithSaltVerify.disabled = false;
    } catch (err) {
      console.error(err);
      signTypedDataV4WithSaltResult.innerHTML = `Error: ${err.message}`;
    }
  };

  /**
   *  Sign Typed Data V4 Verification
   */
  signTypedDataV4WithSaltVerify.onclick = async () => {
    const msgParams = {
      domain: {
        chainId: globalContext.chainIdInt,
        name: 'Ether Mail',
        verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
        version: '1',
        salt: 'test',
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
        attachment: '0x',
      },
      primaryType: 'Mail',
      types: {
        EIP712Domain: [
          {
            name: 'name',
            type: 'string',
          },
          {
            name: 'version',
            type: 'string',
          },
          {
            name: 'chainId',
            type: 'uint256',
          },
          {
            name: 'verifyingContract',
            type: 'string',
          },
          {
            name: 'salt',
            type: 'string',
          },
        ],
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
      const sign = signTypedDataV4WithSaltResult.innerHTML;
      const recoveredAddr = recoverTypedSignature({
        data: msgParams,
        signature: sign,
        version: 'V4',
      });
      if (toChecksumAddress(recoveredAddr) === toChecksumAddress(from)) {
        console.log(`Successfully verified signer as ${recoveredAddr}`);
        signTypedDataV4WithSaltVerifyResult.innerHTML = recoveredAddr;
      } else {
        console.log(
          `Failed to verify signer when comparing ${recoveredAddr} to ${from}`,
        );
      }
    } catch (err) {
      console.error(err);
      signTypedDataV4WithSaltVerifyResult.innerHTML = `Error: ${err.message}`;
    }
  };
}
