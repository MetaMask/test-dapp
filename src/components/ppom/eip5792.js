import globalContext from '../..';
import { DEFAULT_CALLS, VERSION } from '../transactions/eip5792/sendCalls';
import { getMaliciousTransactions } from './sharedConstants';

export function ppomMaliciousSendCalls(parentContainer) {
  parentContainer.insertAdjacentHTML(
    'beforeend',
    `<div class="col-xl-4 col-lg-6 col-md-12 col-sm-12 col-12 d-flex align-items-stretch">
      <div class="card full-width">
        <div class="card-body">
          <h4 class="card-title">
            PPOM - EIP 5792 - Malicious Send Calls
          </h4>
          <button class="btn btn-primary btn-lg btn-block mb-3" id="ppomSendMaliciousEthButton">
            Send Calls with Malicious ETH Transfer
          </button>
          <button class="btn btn-primary btn-lg btn-block mb-3" id="ppomSendMaliciousERC20TransferButton">
            Send Calls with Malicious ERC20 Transfer (USDC)
          </button>
          <button class="btn btn-primary btn-lg btn-block mb-3" id="ppomSendMaliciousERC20ApprovalButton">
            Send Calls with Malicious ERC20 Approval (BUSDC)
          </button>
          <button class="btn btn-primary btn-lg btn-block mb-3" id="ppomSendMaliciousSetApprovalForAllButton">
            Send Calls with Malicious Set Approval for All
          </button>
          <button class="btn btn-primary btn-lg btn-block mb-3" id="ppomSendMaliciousContractInteractionButton">
            Send Calls with Malicious Contract Interaction
          </button>
          <button class="btn btn-primary btn-lg btn-block mb-3" id="ppomSendThreeMaliciousTxsButton">
            Send Calls with 3 Malicious Transactions
          </button>
          <hr/>
          <div id="ppomRequestIdContainer" hidden>
            <label>Request ID:</label>
            <input type="text" id="ppomRequestIdInput" class="form-control" readonly />
          </div>
          <p class="info-text alert alert-warning" id="ppomSendCallsErrorContainer" hidden>
            <span class="wrap" id="ppomSendCallsError"></span>
          </p>
          <button class="btn btn-primary btn-lg btn-block mb-3" id="ppomGetCallsStatusButton" disabled>
            Get Calls Status
          </button>
          <p class="info-text alert alert-success">
            <span class="wrap" id="ppomGetCallsStatusResult">Status</span>
          </p>
        </div>
      </div>
    </div>`,
  );

  const ppomSendMaliciousEthButton = document.getElementById(
    'ppomSendMaliciousEthButton',
  );

  ppomSendMaliciousEthButton.onclick = async () => {
    await sendMaliciousCalls('eth');
  };

  const ppomSendMaliciousERC20TransferButton = document.getElementById(
    'ppomSendMaliciousERC20TransferButton',
  );

  ppomSendMaliciousERC20TransferButton.onclick = async () => {
    await sendMaliciousCalls('erc20Transfer');
  };

  const ppomSendMaliciousERC20ApprovalButton = document.getElementById(
    'ppomSendMaliciousERC20ApprovalButton',
  );

  ppomSendMaliciousERC20ApprovalButton.onclick = async () => {
    await sendMaliciousCalls('erc20Approval');
  };

  const ppomSendMaliciousSetApprovalForAllButton = document.getElementById(
    'ppomSendMaliciousSetApprovalForAllButton',
  );

  ppomSendMaliciousSetApprovalForAllButton.onclick = async () => {
    await sendMaliciousCalls('setApprovalForAll');
  };

  const ppomSendMaliciousContractInteractionButton = document.getElementById(
    'ppomSendMaliciousContractInteractionButton',
  );

  ppomSendMaliciousContractInteractionButton.onclick = async () => {
    await sendMaliciousCalls('maliciousContractInteraction');
  };

  const ppomSendThreeMaliciousTxsButton = document.getElementById(
    'ppomSendThreeMaliciousTxsButton',
  );

  ppomSendThreeMaliciousTxsButton.onclick = async () => {
    await sendThreeMaliciousCalls();
  };

  document.addEventListener('globalConnectionChange', function (e) {
    if (e.detail.connected) {
      // MetaMask is connected, enable the button
      ppomSendMaliciousEthButton.disabled = false;
      ppomSendMaliciousERC20TransferButton.disabled = false;
      ppomSendMaliciousERC20ApprovalButton.disabled = false;
      ppomSendMaliciousSetApprovalForAllButton.disabled = false;
      ppomSendMaliciousContractInteractionButton.disabled = false;
      ppomSendThreeMaliciousTxsButton.disabled = false;
    }
  });

  document.addEventListener('disableAndClear', function () {
    ppomSendMaliciousEthButton.disabled = true;
    ppomSendMaliciousERC20TransferButton.disabled = true;
    ppomSendMaliciousERC20ApprovalButton.disabled = true;
    ppomSendMaliciousSetApprovalForAllButton.disabled = true;
    ppomSendMaliciousContractInteractionButton.disabled = true;
    ppomSendThreeMaliciousTxsButton.disabled = true;
  });

  async function sendMaliciousCalls(type) {
    const maliciousTransactions = getMaliciousTransactions(globalContext);
    const calls = [];

    switch (type) {
      case 'eth':
        calls.push(maliciousTransactions.eth);
        break;
      case 'erc20Transfer':
        calls.push(maliciousTransactions.erc20Transfer);
        break;
      case 'erc20Approval':
        calls.push(maliciousTransactions.erc20Approval);
        break;
      case 'maliciousContractInteraction':
        calls.push(maliciousTransactions.maliciousContractInteraction);
        break;
      case 'setApprovalForAll':
        calls.push(maliciousTransactions.setApprovalForAll);
        break;
      default:
        // Do nothing
        break;
    }

    calls.push(...DEFAULT_CALLS);

    try {
      const result = await globalContext.provider.request({
        method: 'wallet_sendCalls',
        params: [getParams(calls)],
      });
      document.getElementById('ppomRequestIdInput').value = result.id;
      document.getElementById('ppomRequestIdContainer').hidden = false;
      document.getElementById('ppomGetCallsStatusButton').disabled = false;
      document.getElementById('ppomSendCallsErrorContainer').hidden = true;
    } catch (error) {
      console.error(error);
      document.getElementById('ppomSendCallsErrorContainer').hidden = false;
      document.getElementById(
        'ppomSendCallsError',
      ).innerHTML = `Error: ${error.message}`;
    }
  }

  async function sendThreeMaliciousCalls() {
    const maliciousTransactions = getMaliciousTransactions(globalContext);

    const calls = [
      maliciousTransactions.erc20Approval,
      maliciousTransactions.setApprovalForAll,
      maliciousTransactions.maliciousContractInteraction,
    ];

    try {
      const result = await globalContext.provider.request({
        method: 'wallet_sendCalls',
        params: [getParams(calls)],
      });
      document.getElementById('ppomRequestIdInput').value = result.id;
      document.getElementById('ppomRequestIdContainer').hidden = false;
      document.getElementById('ppomGetCallsStatusButton').disabled = false;
      document.getElementById('ppomSendCallsErrorContainer').hidden = true;
    } catch (error) {
      console.error(error);
      document.getElementById('ppomSendCallsErrorContainer').hidden = false;
      document.getElementById(
        'ppomSendCallsError',
      ).innerHTML = `Error: ${error.message}`;
    }
  }

  // Get Calls Status functionality
  document.getElementById('ppomGetCallsStatusButton').onclick = async () => {
    const requestId = document.getElementById('ppomRequestIdInput').value;
    const resultOutput = document.getElementById('ppomGetCallsStatusResult');

    try {
      const result = await globalContext.provider.request({
        method: 'wallet_getCallsStatus',
        params: [requestId],
      });

      resultOutput.innerHTML = JSON.stringify(result, null, 2);
      document.getElementById('ppomGetCallsStatusButton').disabled = false;
    } catch (error) {
      console.error(error);
      resultOutput.innerHTML = `Error: ${error.message}`;
    }
  };

  function getParams(calls) {
    return {
      version: VERSION,
      from: globalContext.accounts[0],
      chainId: `0x${globalContext.chainIdInt.toString(16)}`,
      atomicRequired: true,
      calls,
    };
  }
}
