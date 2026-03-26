import globalContext from '../..';

// Tempo Transactions

// ERC20 TST token created and owned by shared account 0x13b7e6EBcd40777099E4c45d407745aB2de1D1F8
const defaultErc20TokenAddress = '0x8757b7EABAAaC8173DF72B868B4947FaE1368784';
// pathUSD (default Tempo fee token
const defaultFeeToken = '0x20c0000000000000000000000000000000000000';

export function tempoTransactionsComponent(parentContainer) {
  parentContainer.insertAdjacentHTML(
    'beforeend',
    `<div
      class="col-xl-4 col-lg-6 col-md-12 col-sm-12 col-12 d-flex align-items-stretch"
    >
      <div class="card full-width">
        <div class="card-body">
          <h4>
            Tempo Transactions
          </h4>

          <div class="mb-3">
            <label for="tempoErc20TokenAddressInput" class="form-label">ERC20 Token Address</label>
            <input
              type="text"
              class="form-control"
              id="tempoErc20TokenAddressInput"
              value="${defaultErc20TokenAddress}"
              placeholder="${defaultErc20TokenAddress}"
            />
          </div>

          <div class="mb-3">
            <label for="tempoFeeTokenInput" class="form-label">Fee Token Address</label>
            <input
              type="text"
              class="form-control"
              id="tempoFeeTokenInput"
              value="${defaultFeeToken}"
              placeholder="${defaultFeeToken}"
            />
          </div>
          <button
            class="btn btn-primary btn-lg btn-block mb-3"
            id="sendTempoBatchTx"
            disabled
          >
          Send Tempo (0x76) Batch Transaction
          </button>
          <p>Sends a minimalistic 0x76 batch with 2 ERC20 transfers for initial testing:</p>
          <ul>
            <li>0.01 [erc20Token] to 0x2367e6eca6e1fcc2d112133c896e3bddad375aff</li>
            <li>0.01 [erc20Token] to 0x1e3abc74428056924cEeE2F45f060879c3F063ed</li>
          </ul>
          <p class="info-text alert alert-warning">
            Result:
            <span id="sendTempoBatchTxResult"></span>
          </p>
        </div>
      </div>
    </div>`,
  );

  const sendTempoBatchTx = document.getElementById('sendTempoBatchTx');

  const sendTempoBatchTxResult = document.getElementById(
    'sendTempoBatchTxResult',
  );

  document.addEventListener('globalConnectionChange', function (e) {
    if (e.detail.connected) {
      sendTempoBatchTx.disabled = false;
    }
  });

  document.addEventListener('disableAndClear', function () {
    sendTempoBatchTx.disabled = true;
  });

  /**
   * Send as would be sent by Viem Tempo implementation for dApps
   */
  sendTempoBatchTx.onclick = async () => {
    try {
      const from = globalContext.accounts[0];
      const erc20TokenAddress = document.getElementById(
        'tempoErc20TokenAddressInput',
      ).value;
      const feeToken = document.getElementById('tempoFeeTokenInput').value;
      // As sent by some Tempo example dapps
      const ethRequest = {
        method: 'eth_sendTransaction',
        params: [
          {
            calls: [
              {
                data: '0xa9059cbb0000000000000000000000002367e6eca6e1fcc2d112133c896e3bddad375aff000000000000000000000000000000000000000000000000002386f26fc10000',
                to: erc20TokenAddress,
                value: '0x',
              },
              {
                data: '0xa9059cbb0000000000000000000000001e3abc74428056924ceee2f45f060879c3f063ed000000000000000000000000000000000000000000000000002386f26fc10000',
                to: erc20TokenAddress,
                value: '0x',
              },
            ],
            feeToken,
            from,
            type: '0x76', // Tempo in-house tx type.
          },
        ],
      };
      const send = await globalContext.provider.request(ethRequest);
      sendTempoBatchTxResult.innerHTML = send;
    } catch (err) {
      console.error(err);
      sendTempoBatchTxResult.innerHTML = `Error: ${err.message}`;
    }
  };
}
