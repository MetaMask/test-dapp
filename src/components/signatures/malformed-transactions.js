import globalContext from '../..';

// Malformed Signatues

export function malformedTransactionsComponent(parentContainer) {
  parentContainer.insertAdjacentHTML(
    'beforeend',
    `<div
      class="col-xl-4 col-lg-6 col-md-12 col-sm-12 col-12 d-flex align-items-stretch"
    >
      <div class="card full-width">
        <div class="card-body">
          <h4>
            Malformed Transactions
          </h4>

          <button
            class="btn btn-primary btn-lg btn-block mb-3"
            id="sendWithInvalidValue"
            disabled
          >
          Invalid Value Type (string)
          </button>
          <button
            class="btn btn-primary btn-lg btn-block mb-3"
            id="sendWithInvalidTxType"
            disabled
          >
          Invalid Transaction Type (not supported)
          </button>

          <button
            class="btn btn-primary btn-lg btn-block mb-3"
            id="sendWithInvalidRecipient"
            disabled
          >
          Invalid Recipient (string)
          </button>

          <button
            class="btn btn-primary btn-lg btn-block mb-3"
            id="sendWithInvalidGasLimit"
            disabled
          >
          Invalid Gas Limit (string)
          </button>
          <button
            class="btn btn-primary btn-lg btn-block mb-3"
            id="sendWithInvalidMaxFeePerGas"
            disabled
          >
          Invalid Max Fee Per Gas (string)
          </button>
          <p class="info-text alert alert-warning">
            Result:
            <span id="sendMalformedResult"></span>
          </p>
        </div>
    </div>`,
  );

  const sendWithInvalidValue = document.getElementById('sendWithInvalidValue');
  const sendWithInvalidTxType = document.getElementById(
    'sendWithInvalidTxType',
  );
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

  document.addEventListener('globalConnectionChange', function (e) {
    if (e.detail.connected) {
      // MetaMask is connected, enable the button
      sendWithInvalidValue.disabled = false;
      sendWithInvalidTxType.disabled = false;
      sendWithInvalidRecipient.disabled = false;
      /* there is other logic for enabling these 
      sendWithInvalidGasLimit.disabled = false;
      sendWithInvalidMaxFeePerGas.disabled = false; 
      */
    }
  });

  /**
   * Send With Invalid Value
   */
  sendWithInvalidValue.onclick = async () => {
    try {
      const from = globalContext.accounts[0];
      const send = await globalContext.provider.request({
        method: 'eth_sendTransaction',
        params: [
          {
            from,
            to: '0x0c54FcCd2e384b4BB6f2E405Bf5Cbc15a017AaFb',
            value: 'invalid', // invalid value - expected int/hex value
          },
        ],
      });
      sendMalformedResult.innerHTML = send;
    } catch (err) {
      console.error(err);
      sendMalformedResult.innerHTML = `Error: ${err.message}`;
    }
  };

  /**
   * Send With Invalid Transaction Type
   */

  sendWithInvalidTxType.onclick = async () => {
    try {
      const from = globalContext.accounts[0];
      const send = await globalContext.provider.request({
        method: 'eth_sendTransaction',
        params: [
          {
            from,
            to: '0x0c54FcCd2e384b4BB6f2E405Bf5Cbc15a017AaFb',
            value: '0x0',
            type: '0x5', // invalid tx type - expected 0x1 or 0x2
          },
        ],
      });
      sendMalformedResult.innerHTML = send;
    } catch (err) {
      console.error(err);
      sendMalformedResult.innerHTML = `Error: ${err.message}`;
    }
  };

  /**
   * Send With Invalid Recipient
   */

  sendWithInvalidRecipient.onclick = async () => {
    try {
      const from = globalContext.accounts[0];
      const send = await globalContext.provider.request({
        method: 'eth_sendTransaction',
        params: [
          {
            from,
            to: 'invalid', // invalid recipient - expected int/hex address
            value: '0x0',
          },
        ],
      });
      sendMalformedResult.innerHTML = send;
    } catch (err) {
      console.error(err);
      sendMalformedResult.innerHTML = `Error: ${err.message}`;
    }
  };

  /**
   * Send With Invalid gasLimit
   */

  sendWithInvalidGasLimit.onclick = async () => {
    try {
      const from = globalContext.accounts[0];
      const send = await globalContext.provider.request({
        method: 'eth_sendTransaction',
        params: [
          {
            from,
            to: '0x0c54FcCd2e384b4BB6f2E405Bf5Cbc15a017AaFb',
            value: '0x0',
            gasLimit: 'invalid', // invalid gasLimit - expected int/hex value
            maxFeePerGas: '0x2540be400',
            maxPriorityFeePerGas: '0x3b9aca00',
          },
        ],
      });
      sendMalformedResult.innerHTML = send;
    } catch (err) {
      console.error(err);
      sendMalformedResult.innerHTML = `Error: ${err.message}`;
    }
  };

  /**
   * Send With Invalid maxFeePerGas
   */

  sendWithInvalidMaxFeePerGas.onclick = async () => {
    try {
      const from = globalContext.accounts[0];
      const send = await globalContext.provider.request({
        method: 'eth_sendTransaction',
        params: [
          {
            from,
            to: '0x0c54FcCd2e384b4BB6f2E405Bf5Cbc15a017AaFb',
            value: '0x0',
            gasLimit: '0x5028',
            maxFeePerGas: 'invalid', // invalid maxFeePerGas - expected int/hex value
            maxPriorityFeePerGas: '0x3b9aca00',
          },
        ],
      });
      sendMalformedResult.innerHTML = send;
    } catch (err) {
      console.error(err);
      sendMalformedResult.innerHTML = `Error: ${err.message}`;
    }
  };
}
