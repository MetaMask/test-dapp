import { recoverTypedSignature } from '@metamask/eth-sig-util';
import { toChecksumAddress } from 'ethereumjs-util';
import globalContext from '../..';

export function signTypedDataComponent(parentContainer) {
  parentContainer.insertAdjacentHTML(
    'beforeend',
    `<div class="col-xl-4 col-lg-6 col-md-12 col-sm-12 col-12 d-flex align-items-stretch">
      <div class="card full-width">
        <div class="card-body">
          <h4>
            Sign Typed Data
          </h4>

          <button
            class="btn btn-primary btn-lg btn-block mb-3"
            id="signTypedData"
            disabled
          >
            Sign
          </button>

          <p class="info-text alert alert-warning">
            Result: <span id="signTypedDataResult"></span>
          </p>

          <button
            class="btn btn-primary btn-lg btn-block mb-3"
            id="signTypedDataVerify"
            disabled
          >
            Verify
          </button>

          <p class="info-text alert alert-warning">
            Recovery result:
            <span id="signTypedDataVerifyResult"></span>
          </p>
        </div>
      </div>
    </div>`,
  );

  const signTypedData = document.getElementById('signTypedData');
  const signTypedDataResult = document.getElementById('signTypedDataResult');
  const signTypedDataVerify = document.getElementById('signTypedDataVerify');
  const signTypedDataVerifyResult = document.getElementById(
    'signTypedDataVerifyResult',
  );

  document.addEventListener('globalConnectionChange', function (e) {
    if (e.detail.connected) {
      // MetaMask is connected, enable the button
      signTypedData.disabled = false;
    }
  });

  /**
   * Sign Typed Data Test
   */
  signTypedData.onclick = async () => {
    const msgParams = [
      {
        type: 'string',
        name: 'Message',
        value: 'Hi, Alice!',
      },
      {
        type: 'uint32',
        name: 'A number',
        value: '1337',
      },
    ];
    try {
      const from = globalContext.accounts[0];
      const sign = await globalContext.provider.request({
        method: 'eth_signTypedData',
        params: [msgParams, from],
      });
      signTypedDataResult.innerHTML = sign;
      signTypedDataVerify.disabled = false;
    } catch (err) {
      console.error(err);
      signTypedDataResult.innerHTML = `Error: ${err.message}`;
    }
  };

  /**
   * Sign Typed Data Verification
   */
  signTypedDataVerify.onclick = async () => {
    const msgParams = [
      {
        type: 'string',
        name: 'Message',
        value: 'Hi, Alice!',
      },
      {
        type: 'uint32',
        name: 'A number',
        value: '1337',
      },
    ];
    try {
      const from = globalContext.accounts[0];
      const sign = signTypedDataResult.innerHTML;
      const recoveredAddr = await recoverTypedSignature({
        data: msgParams,
        signature: sign,
        version: 'V1',
      });
      if (toChecksumAddress(recoveredAddr) === toChecksumAddress(from)) {
        console.log(`Successfully verified signer as ${recoveredAddr}`);
        signTypedDataVerifyResult.innerHTML = recoveredAddr;
      } else {
        console.log(
          `Failed to verify signer when comparing ${recoveredAddr} to ${from}`,
        );
      }
    } catch (err) {
      console.error(err);
      signTypedDataVerifyResult.innerHTML = `Error: ${err.message}`;
    }
  };
}
