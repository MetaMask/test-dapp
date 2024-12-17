import { recoverTypedSignature } from '@metamask/eth-sig-util';
import { toChecksumAddress } from 'ethereumjs-util';
import {
  getPermitMsgParams,
  MSG_PRIMARY_TYPE,
  splitSig,
} from '../../signatures/utils';
import globalContext from '../..';

export const signPermit = document.getElementById('signPermit');
export const signPermitResult = document.getElementById('signPermitResult');
export const signPermitResultR = document.getElementById('signPermitResultR');
export const signPermitResultS = document.getElementById('signPermitResultS');
export const signPermitResultV = document.getElementById('signPermitResultV');
export const signPermitVerify = document.getElementById('signPermitVerify');
export const signPermitVerifyResult = document.getElementById(
  'signPermitVerifyResult',
);
export function permitSignComponent(parentContainer) {
  parentContainer.insertAdjacentHTML(
    'beforeend',
    `<div class="col-xl-4 col-lg-6 col-md-12 col-sm-12 col-12 d-flex align-items-stretch">
      <div class="card full-width">
        <div class="card-body">
          <h4>
            Sign Permit
          </h4>

          <button
            class="btn btn-primary btn-lg btn-block mb-3"
            id="signPermit"
            disabled
          >
            Sign
          </button>

          <p class="info-text alert alert-warning">
            Result:
            <span id="signPermitResult"></span>
            <p class="info-text alert alert-warning" id="signPermitResultR">r: </p>
            <p class="info-text alert alert-warning" id="signPermitResultS">s: </p>
            <p class="info-text alert alert-warning" id="signPermitResultV">v: </p>
          </p>

          <button
            class="btn btn-primary btn-lg btn-block mb-3"
            id="signPermitVerify"
            disabled
          >
            Verify
          </button>

          <p class="info-text alert alert-warning">
            Recovery result:
            <span id="signPermitVerifyResult"></span>
          </p>
        </div>
      </div>
    </div>`,
  );

  /**
   *  Sign Permit
   */
  signPermit.onclick = async () => {
    const from = globalContext.accounts[0];
    const msgParams = getPermitMsgParams(
      {
        primaryType: MSG_PRIMARY_TYPE.PERMIT,
        chainId: globalContext.chainIdInt,
      },
      { fromAddress: from },
    );

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

      signPermitResult.innerHTML = sign;
      signPermitResultR.innerHTML = `r: ${r}`;
      signPermitResultS.innerHTML = `s: ${s}`;
      signPermitResultV.innerHTML = `v: ${v}`;
      signPermitVerify.disabled = false;
    } catch (err) {
      console.error(err);
      signPermitResult.innerHTML = `Error: ${err.message}`;
    }
  };

  /**
   *  Sign Permit Verification
   */
  signPermitVerify.onclick = async () => {
    const from = globalContext.accounts[0];
    const msgParams = getPermitMsgParams({
      primaryType: MSG_PRIMARY_TYPE.PERMIT,
      chainId: globalContext.chainIdInt,
    });

    try {
      const sign = signPermitResult.innerHTML;
      const recoveredAddr = recoverTypedSignature({
        data: msgParams,
        signature: sign,
        version: 'V4',
      });
      if (toChecksumAddress(recoveredAddr) === toChecksumAddress(from)) {
        console.log(`Successfully verified signer as ${recoveredAddr}`);
        signPermitVerifyResult.innerHTML = recoveredAddr;
      } else {
        console.log(
          `Failed to verify signer when comparing ${recoveredAddr} to ${from}`,
        );
      }
    } catch (err) {
      console.error(err);
      signPermitVerifyResult.innerHTML = `Error: ${err.message}`;
    }
  };
}
