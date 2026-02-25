import globalContext from '../..';

// Tempo Transactions

// ERC20 TST token created and owned by shared account 0x13b7e6EBcd40777099E4c45d407745aB2de1D1F8
const erc20TokenAddress = '0x86fA047df5b69df0CBD6dF566F1468756dCF339D';
const chainId = '0x89'; // Forcing to Polygon PoS for now since EIP7702 not available on Tempo

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

          <button
            class="btn btn-primary btn-lg btn-block mb-3"
            id="sendTempoBatchTx"
            disabled
          >
          Send Tempo (0x76) Batch Transaction
          </button>
          <p>Sends a minimalistic 0x76 batch with 2 ERC20 transfers on chain ${chainId} for initial testing:</p>
          <ul>
            <li>0.01 TST to 0x1e3abc74428056924cEeE2F45f060879c3F063ed</li>
            <li>0.01 TST to 0xac91467e4E373Ed6758040a1247d46fF15723a41</li>
          </ul>
          <p>TST address: ${erc20TokenAddress}</p>
          <p>'feeToken' set to 0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359</p>
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
   * Send With Invalid Value
   */
  sendTempoBatchTx.onclick = async () => {
    try {
      const from = globalContext.accounts[0];
      // As sent by some Tempo example dapps
      const send = await globalContext.provider.request({
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
            chainId,
            feeToken: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359', // USDC Coin (PoS)
            from,
            type: '0x76', // Tempo in-house tx type.
          },
        ],
      });
      sendTempoBatchTxResult.innerHTML = send;
    } catch (err) {
      console.error(err);
      sendTempoBatchTxResult.innerHTML = `Error: ${err.message}`;
    }
  };
}
