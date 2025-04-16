import globalContext from '../..';
import { maliciousAddress } from '../../sample-addresses';
import { MIN_GAS_LIMIT } from '../../shared/constants';

export function ppomMaliciousBatchingAndQueueing(parentContainer) {
  parentContainer.insertAdjacentHTML(
    'beforeend',
    `<div
      class="col-xl-4 col-lg-6 col-md-12 col-sm-12 col-12 d-flex align-items-stretch"
    >
      <div class="card full-width">
        <div class="card-body">
          <h4>
            PPOM - Malicious Batching and Queueing
          </h4>
          <p>We know we are vulnerable if any of these Transactions/Signatures are not flagged as Malicious</p>
          <h5>Transactions</h5>
          <button
            class="btn btn-primary btn-lg btn-block mb-3"
            id="sendEIP1559Batch"
            disabled
          >
            Send Eth Malicious x10 Batch
          </button>

          <button
            class="btn btn-primary btn-lg btn-block mb-3"
            id="sendEIP1559Queue"
            disabled
          >
            Send Eth Malicious x10 Queue
          </button>

          <h5>Signatures</h5>
          <button
            class="btn btn-primary btn-lg btn-block mb-3"
            id="signTypedDataV4Batch"
            disabled
          >
            Sign Malicious x10 Batch
          </button>

          <button
            class="btn btn-primary btn-lg btn-block mb-3"
            id="signTypedDataV4Queue"
            disabled
          >
            Sign Malicious x10 Queue
          </button>
          <hr />
          <h4>PPOM - Malicious Deeplinks</h4>
          <a
            id="maliciousSendEthWithDeeplink"
          >
            <button
              class="btn btn-warning btn-lg btn-block mb-3 text-dark"
            >
            (Mobile) Malicious Eth Transfer With Deeplink
            </button>
          </a>
          <a
            id="maliciousTransferERC20WithDeeplink"
          >
            <button
              class="btn btn-warning btn-lg btn-block mb-3 text-dark"
            >
            (Mobile) Malicious ERC20 Transfer With Deeplink
            </button>
          </a>
          <a
          id="maliciousApproveERC20WithDeeplink"
          >
            <button
              class="btn btn-warning btn-lg btn-block mb-3 text-dark"
            >
            (Mobile) Malicious ERC20 Approval With Deeplink
            </button>
          </a>
        </div>
      </div>
    </div>`,
  );

  const sendEIP1559Batch = document.getElementById('sendEIP1559Batch');
  const sendEIP1559Queue = document.getElementById('sendEIP1559Queue');
  const signTypedDataV4Batch = document.getElementById('signTypedDataV4Batch');
  const signTypedDataV4Queue = document.getElementById('signTypedDataV4Queue');

  document.getElementById(
    'maliciousSendEthWithDeeplink',
  ).href = `https://metamask.app.link/send/${maliciousAddress}?value=0`;
  document.getElementById(
    'maliciousTransferERC20WithDeeplink',
  ).href = `https://metamask.app.link/send/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48@1/transfer?address=${maliciousAddress}&uint256=1e6`;
  document.getElementById(
    'maliciousApproveERC20WithDeeplink',
  ).href = `https://metamask.app.link/approve/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48@1/approve?address=${maliciousAddress}&uint256=1e6`;

  document.addEventListener('globalConnectionChange', function (e) {
    if (e.detail.connected) {
      // MetaMask is connected, enable the button
      signTypedDataV4Batch.disabled = false;
      signTypedDataV4Queue.disabled = false;
    }
  });

  document.addEventListener('disableAndClear', function () {
    signTypedDataV4Batch.disabled = true;
    signTypedDataV4Queue.disabled = true;
  });

  document.addEventListener('blockBaseFeePerGasUpdate', function (e) {
    if (e.detail.supported) {
      sendEIP1559Batch.disabled = false;
      sendEIP1559Batch.hidden = false;
      sendEIP1559Queue.disabled = false;
      sendEIP1559Queue.hidden = false;
    } else {
      sendEIP1559Batch.disabled = true;
      sendEIP1559Batch.hidden = true;
      sendEIP1559Queue.disabled = true;
      sendEIP1559Queue.hidden = true;
    }
  });

  /**
   *  Batch of 10 Malicious Transactions
   */
  sendEIP1559Batch.onclick = async () => {
    for (let i = 0; i < 10; i++) {
      try {
        globalContext.provider.request({
          method: 'eth_sendTransaction',
          params: [
            {
              from: globalContext.accounts[0],
              to: `${maliciousAddress}`,
              value: '0x0',
              gasLimit: MIN_GAS_LIMIT,
              maxFeePerGas: '0x2540be400',
              maxPriorityFeePerGas: '0x3b9aca00',
            },
          ],
        });
      } catch (err) {
        console.error(err);
      }
    }
  };

  /**
   *  Queue of 10 Malicious Transactions
   */
  sendEIP1559Queue.onclick = async () => {
    for (let i = 0; i < 10; i++) {
      try {
        await globalContext.provider.request({
          method: 'eth_sendTransaction',
          params: [
            {
              from: globalContext.accounts[0],
              to: maliciousAddress,
              value: '0x0',
              gasLimit: MIN_GAS_LIMIT,
              maxFeePerGas: '0x2540be400',
              maxPriorityFeePerGas: '0x3b9aca00',
            },
          ],
        });
      } catch (err) {
        console.error(err);
      }
    }
  };

  /**
   * Batch of 10 Malicious Signatures
   */
  signTypedDataV4Batch.onclick = async () => {
    for (let i = 0; i < 10; i++) {
      try {
        const from = globalContext.accounts[0];
        globalContext.provider.request({
          method: 'eth_signTypedData_v4',
          params: [
            from,
            `{"types":{"EIP712Domain":[{"name":"name","type":"string"},{"name":"version","type":"string"},{"name":"chainId","type":"uint256"},{"name":"verifyingContract","type":"address"}],"Permit":[{"name":"owner","type":"address"},{"name":"spender","type":"address"},{"name":"value","type":"uint256"},{"name":"nonce","type":"uint256"},{"name":"deadline","type":"uint256"}]},"primaryType":"Permit","domain":{"name":"USD Coin","verifyingContract":"0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48","chainId":${globalContext.chainIdInt},"version":"2"},"message":{"owner":"${globalContext.accounts[0]}","spender":"0x1661F1B207629e4F385DA89cFF535C8E5Eb23Ee3","value":"1033366316628","nonce":1,"deadline":1678709555}}`,
          ],
        });
      } catch (err) {
        console.error(err);
      }
    }
  };

  /**
   * Queue of 10 Malicious Signatures
   */
  signTypedDataV4Queue.onclick = async () => {
    for (let i = 0; i < 10; i++) {
      try {
        const from = globalContext.accounts[0];
        await globalContext.provider.request({
          method: 'eth_signTypedData_v4',
          params: [
            from,
            `{"types":{"EIP712Domain":[{"name":"name","type":"string"},{"name":"version","type":"string"},{"name":"chainId","type":"uint256"},{"name":"verifyingContract","type":"address"}],"Permit":[{"name":"owner","type":"address"},{"name":"spender","type":"address"},{"name":"value","type":"uint256"},{"name":"nonce","type":"uint256"},{"name":"deadline","type":"uint256"}]},"primaryType":"Permit","domain":{"name":"USD Coin","verifyingContract":"0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48","chainId":${globalContext.chainIdInt},"version":"2"},"message":{"owner":"${globalContext.accounts[0]}","spender":"0x1661F1B207629e4F385DA89cFF535C8E5Eb23Ee3","value":"1033366316628","nonce":1,"deadline":1678709555}}`,
          ],
        });
      } catch (err) {
        console.error(err);
      }
    }
  };
}
