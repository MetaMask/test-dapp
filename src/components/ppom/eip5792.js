import globalContext from '../..';
import { maliciousAddress } from '../../sample-addresses';
import { DEFAULT_CALLS } from '../transactions/eip5792/sendCalls';
import {
  ERC20_SAMPLE_CONTRACTS,
  ERC721_SAMPLE_CONTRACTS,
} from '../../onchain-sample-contracts';

export function ppomMaliciousSendCalls(parentContainer) {
  parentContainer.insertAdjacentHTML(
    'beforeend',
    `<div class="col-xl-4 col-lg-6 col-md-12 col-sm-12 col-12 d-flex align-items-stretch">
      <div class="card full-width">
        <div class="card-body">
          <h4 class="card-title">
            EIP 5792 - PPOM - Malicious Send Calls
          </h4>
          <button class="btn btn-primary btn-lg btn-block mb-3" id="ppomSendMaliciousEthButton">
            Send Calls with Malicious ETH Transfer
          </button>
          <button class="btn btn-primary btn-lg btn-block mb-3" id="ppomSendMaliciousERC20TransferButton">
            Send Calls with Malicious ERC20 Transfer (USDC)
          </button>
          <button class="btn btn-primary btn-lg btn-block mb-3" id="ppomSendMaliciousERC20ApprovalButton">
            Send Calls with Malicious ERC20 Approval (USDC)
          </button>
          <button class="btn btn-primary btn-lg btn-block mb-3" id="ppomSendMaliciousSetApprovalForAllButton">
            Send Calls with Malicious Set Approval for All (USDC)
          </button>
          <hr/>
          <div id="ppomRequestIdContainer" hidden>
            <label>Request ID:</label>
            <input type="text" id="ppomRequestIdInput" class="form-control" readonly />
          </div>
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

  document.getElementById('ppomSendMaliciousEthButton').onclick = async () => {
    await sendMaliciousCalls('eth');
  };

  document.getElementById('ppomSendMaliciousERC20TransferButton').onclick =
    async () => {
      await sendMaliciousCalls('erc20Transfer');
    };

  document.getElementById('ppomSendMaliciousERC20ApprovalButton').onclick =
    async () => {
      await sendMaliciousCalls('erc20Approval');
    };

  document.getElementById('ppomSendMaliciousSetApprovalForAllButton').onclick =
    async () => {
      await sendMaliciousCalls('setApprovalForAll');
    };

  async function sendMaliciousCalls(type) {
    const calls = [];

    switch (type) {
      case 'eth':
        calls.push({
          to: maliciousAddress,
          value: '0x9184e72a000',
        });
        break;
      case 'erc20Transfer':
        calls.push({
          to: ERC20_SAMPLE_CONTRACTS[globalContext.networkName],
          data: '0xa9059cbb0000000000000000000000005fbdb2315678afecb367f032d93f642f64180aa30000000000000000000000000000000000000000000000000000000000000064', // Malicious ERC20 transfer data
          value: '0x0',
        });
        break;
      case 'erc20Approval':
        calls.push({
          to: ERC20_SAMPLE_CONTRACTS[globalContext.networkName],
          data: '0x095ea7b3000000000000000000000000e50a2dbc466d01a34c3e8b7e8e45fce4f7da39e6000000000000000000000000000000000000000000000000ffffffffffffffff', // Malicious ERC20 approval data
          value: '0x0',
        });
        break;
      case 'setApprovalForAll':
        calls.push({
          to: ERC721_SAMPLE_CONTRACTS[globalContext.networkName],
          data: '0xa22cb465000000000000000000000000b85492afc686d5ca405e3cd4f50b05d358c75ede0000000000000000000000000000000000000000000000000000000000000001', // Malicious set approval for all data
          value: '0x0',
        });
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
    } catch (error) {
      console.error(error);
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
      version: '1.0',
      from: globalContext.accounts[0],
      chainId: `0x${globalContext.chainIdInt.toString(16)}`,
      calls,
    };
  }
}
