/* eslint-disable import/no-mutable-exports */
import { recoverPersonalSignature } from '@metamask/eth-sig-util';
import globalContext from '../..';

export function personalSignComponent(parentContainer) {
  parentContainer.insertAdjacentHTML(
    'beforeend',
    `<div class="col-xl-4 col-lg-6 col-md-12 col-sm-12 col-12 d-flex align-items-stretch">
      <div class="card full-width">
        <div class="card-body">
          <h4>
            Personal Sign
          </h4>

          <button
            class="btn btn-primary btn-lg btn-block mb-3"
            id="personalSign"
            disabled
          >
            Sign
          </button>

          <p class="info-text alert alert-warning">
            Result: <span id="personalSignResult"></span>
          </p>

          <button
            class="btn btn-primary btn-lg btn-block mb-3"
            id="personalSignVerify"
            disabled
          >
            Verify
          </button>

          <p class="info-text alert alert-warning">
            eth-sig-util recovery result:
            <span id="personalSignVerifySigUtilResult"></span>
          </p>
          <p class="info-text alert alert-warning">
            personal_ecRecover result:
            <span id="personalSignVerifyECRecoverResult"></span>
          </p>
        </div>
      </div>
    </div>`,
  );

  const personalSign = document.getElementById('personalSign');
  const personalSignResult = document.getElementById('personalSignResult');
  const personalSignVerify = document.getElementById('personalSignVerify');
  const personalSignVerifySigUtilResult = document.getElementById(
    'personalSignVerifySigUtilResult',
  );
  const personalSignVerifyECRecoverResult = document.getElementById(
    'personalSignVerifyECRecoverResult',
  );

  document.addEventListener('globalConnectionChange', function (e) {
    if (e.detail.connected) {
      // MetaMask is connected, enable the button
      personalSign.disabled = false;
    }
  });

  /**
   * Personal Sign
   */
  personalSign.onclick = async () => {
    const exampleMessage = 'Example `personal_sign` message';
    try {
      const from = globalContext.accounts[0];
      const msg = `0x${Buffer.from(exampleMessage, 'utf8').toString('hex')}`;
      const sign = await globalContext.provider.request({
        method: 'personal_sign',
        params: [msg, from, 'Example password'],
      });
      personalSignResult.innerHTML = sign;
      personalSignVerify.disabled = false;
    } catch (err) {
      console.error(err);
      personalSign.innerHTML = `Error: ${err.message}`;
    }
  };

  /**
   * Personal Sign Verify
   */
  personalSignVerify.onclick = async () => {
    const exampleMessage = 'Example `personal_sign` message';
    try {
      const from = globalContext.accounts[0];
      const msg = `0x${Buffer.from(exampleMessage, 'utf8').toString('hex')}`;
      const sign = personalSignResult.innerHTML;
      const recoveredAddr = recoverPersonalSignature({
        data: msg,
        signature: sign,
      });
      if (recoveredAddr === from) {
        console.log(`SigUtil Successfully verified signer as ${recoveredAddr}`);
        personalSignVerifySigUtilResult.innerHTML = recoveredAddr;
      } else {
        console.log(
          `SigUtil Failed to verify signer when comparing ${recoveredAddr} to ${from}`,
        );
        console.log(`Failed comparing ${recoveredAddr} to ${from}`);
      }
      const ecRecoverAddr = await globalContext.provider.request({
        method: 'personal_ecRecover',
        params: [msg, sign],
      });
      if (ecRecoverAddr === from) {
        console.log(`Successfully ecRecovered signer as ${ecRecoverAddr}`);
        personalSignVerifyECRecoverResult.innerHTML = ecRecoverAddr;
      } else {
        console.log(
          `Failed to verify signer when comparing ${ecRecoverAddr} to ${from}`,
        );
      }
    } catch (err) {
      console.error(err);
      personalSignVerifySigUtilResult.innerHTML = `Error: ${err.message}`;
      personalSignVerifyECRecoverResult.innerHTML = `Error: ${err.message}`;
    }
  };
}
