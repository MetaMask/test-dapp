import {
  getPermitMsgParams,
  MSG_PRIMARY_TYPE,
  splitSig,
} from '../../signatures/utils';
import globalContext from '../..';

export function signTypedDataVariantsComponent(parentContainer) {
  parentContainer.insertAdjacentHTML(
    'beforeend',
    `          <div
            class="col-xl-4 col-lg-6 col-md-12 col-sm-12 col-12 d-flex align-items-stretch"
          >
            <div class="card full-width">
              <div class="card-body">
                <h4>
                  Sign Typed Data Variants
                </h4>
                <button
                  class="btn btn-primary btn-lg btn-block mb-3"
                  id="signBlurOrder"
                  disabled
                >
                  Blur - Order
                </button>
                <button
                  class="btn btn-primary btn-lg btn-block mb-3"
                  id="signPermitSingle"
                  disabled
                >
                  PermitSingle
                </button>

                <button
                  class="btn btn-primary btn-lg btn-block mb-3"
                  id="signPermitBatch"
                  disabled
                >
                  PermitBatch
                </button>

                <button
                  class="btn btn-primary btn-lg btn-block mb-3"
                  id="signSeaportBulkOrder"
                  disabled
                >
                  Seaport - BulkOrder
                </button>

                <p class="info-text alert alert-warning">
                  Result:
                  <span id="signPermitVariantResult"></span>
                  <p class="info-text alert alert-warning" id="signPermitVariantResultR">r: </p>
                  <p class="info-text alert alert-warning" id="signPermitVariantResultS">s: </p>
                  <p class="info-text alert alert-warning" id="signPermitVariantResultV">v: </p>
                </p>
              </div>
            </div>
          </div>`,
  );

  // Sign Typed Data Variants
  const signBlurOrder = document.getElementById('signBlurOrder');
  const signPermitSingle = document.getElementById('signPermitSingle');
  const signPermitBatch = document.getElementById('signPermitBatch');
  const signSeaportBulkOrder = document.getElementById('signSeaportBulkOrder');

  const signPermitVariantResult = document.getElementById(
    'signPermitVariantResult',
  );
  const signPermitVariantResultR = document.getElementById(
    'signPermitVariantResultR',
  );
  const signPermitVariantResultS = document.getElementById(
    'signPermitVariantResultS',
  );
  const signPermitVariantResultV = document.getElementById(
    'signPermitVariantResultV',
  );

  const signPermitVerify = document.getElementById('signPermitVerify');

  async function requestSignTypedDataVariant(primaryType) {
    const from = globalContext.accounts[0];
    const msgParams = getPermitMsgParams(
      {
        primaryType,
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

      signPermitVariantResult.innerHTML = sign;
      signPermitVariantResultR.innerHTML = `r: ${r}`;
      signPermitVariantResultS.innerHTML = `s: ${s}`;
      signPermitVariantResultV.innerHTML = `v: ${v}`;
      signPermitVerify.disabled = false;
    } catch (err) {
      console.error(err);
      signPermitVariantResult.innerHTML = `Error: ${err.message}`;
    }
  }

  document.addEventListener('globalConnectionChange', function (e) {
    if (e.detail.connected) {
      // MetaMask is connected, enable the button
      signBlurOrder.disabled = false;
      signPermitSingle.disabled = false;
      signPermitBatch.disabled = false;
      signSeaportBulkOrder.disabled = false;
    }
  });

  document.addEventListener('disableAndClear', function () {
    signBlurOrder.disabled = true;
    signPermitSingle.disabled = true;
    signPermitBatch.disabled = true;
    signSeaportBulkOrder.disabled = true;
  });

  signBlurOrder.onclick = async () => {
    await requestSignTypedDataVariant(MSG_PRIMARY_TYPE.BLUR_ORDER);
  };
  signPermitBatch.onclick = async () => {
    await requestSignTypedDataVariant(MSG_PRIMARY_TYPE.PERMIT_BATCH);
  };
  signPermitSingle.onclick = async () => {
    await requestSignTypedDataVariant(MSG_PRIMARY_TYPE.PERMIT_SINGLE);
  };
  signSeaportBulkOrder.onclick = async () => {
    await requestSignTypedDataVariant(MSG_PRIMARY_TYPE.SEAPORT_BULK_ORDER);
  };
}
