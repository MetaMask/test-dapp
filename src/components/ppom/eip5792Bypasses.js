import globalContext from '../..';
import { DEFAULT_CALLS } from '../transactions/eip5792/sendCalls';
import { getMaliciousTransactionBypasses } from './sharedConstants';

export function ppomMaliciousSendCallsBypasses(parentContainer) {
  parentContainer.insertAdjacentHTML(
    'beforeend',
    `<div
      class="col-xl-4 col-lg-6 col-md-12 col-sm-12 col-12 d-flex align-items-stretch"
    >
      <div class="card full-width">
        <div class="card-body">
          <h4>
            PPOM - EIP 5792 - Malicious Warning Bypasses
          </h4>
          <p>We know we are vulnerable if any of these Transactions/Signatures are not flagged as Malicious</p>
          <button
            class="btn btn-primary btn-lg btn-block mb-3"
            id="maliciousSendCallsSendWithOddHexData"
            disabled
          >
            Malicious Eth Transfer With Odd Hex Data
          </button>
          <button
            class="btn btn-primary btn-lg btn-block mb-3"
            id="maliciousSendCallsApproveERC20WithOddHexData"
            disabled
          >
            Malicious ERC20 Approval With Odd Hex Data
          </button>
          <button
            class="btn btn-primary btn-lg btn-block mb-3"
            id="maliciousSendCallsSendWithoutHexPrefixValue"
            disabled
          >
            Malicious Eth Transfer Without 0x Prefix for Hex Value
          </button>
          <p class="info-text alert alert-warning">
            Result:
            <span id="maliciousSendCallsWarningBypassResult"></span>
          </p>
        </div>
      </div>
    </div>`,
  );

  const maliciousSendCallsSendWithOddHexData = document.getElementById(
    'maliciousSendCallsSendWithOddHexData',
  );
  const maliciousSendCallsApproveERC20WithOddHexData = document.getElementById(
    'maliciousSendCallsApproveERC20WithOddHexData',
  );
  const maliciousSendCallsSendWithoutHexPrefixValue = document.getElementById(
    'maliciousSendCallsSendWithoutHexPrefixValue',
  );
  const maliciousSendCallsWarningBypassResult = document.getElementById(
    'maliciousSendCallsWarningBypassResult',
  );

  const maliciousTransactions = getMaliciousTransactionBypasses(globalContext);

  document.addEventListener('globalConnectionChange', function (e) {
    if (e.detail.connected) {
      // MetaMask is connected, enable the button
      maliciousSendCallsSendWithOddHexData.disabled = false;
      maliciousSendCallsApproveERC20WithOddHexData.disabled = false;
      maliciousSendCallsSendWithoutHexPrefixValue.disabled = false;
    }
  });

  document.addEventListener('disableAndClear', function () {
    maliciousSendCallsSendWithOddHexData.disabled = true;
    maliciousSendCallsSendWithoutHexPrefixValue.disabled = true;
    maliciousSendCallsApproveERC20WithOddHexData.disabled = true;
  });

  function getParams(calls) {
    return {
      version: '1.0',
      from: globalContext.accounts[0],
      chainId: `0x${globalContext.chainIdInt.toString(16)}`,
      calls,
    };
  }

  /**
   *  PPOM - Malicious Warning Bypasses
   */
  maliciousSendCallsSendWithOddHexData.onclick = async () => {
    const calls = [maliciousTransactions.ethWithHexData, ...DEFAULT_CALLS];
    try {
      const result = await globalContext.provider.request({
        method: 'wallet_sendCalls',
        params: [getParams(calls)],
      });
      maliciousSendCallsWarningBypassResult.innerHTML = result.id;
    } catch (err) {
      console.error(err);
      maliciousSendCallsWarningBypassResult.innerHTML = `Error: ${err.message}`;
    }
  };

  maliciousSendCallsApproveERC20WithOddHexData.onclick = async () => {
    const calls = [
      {
        from: globalContext.accounts[0],
        to: maliciousTransactions.erc20Approval.to,
        value: '0x0',
        data: maliciousTransactions.erc20Approval.data,
      },
      ...DEFAULT_CALLS,
    ];

    try {
      const result = await globalContext.provider.request({
        method: 'wallet_sendCalls',
        params: [getParams(calls)],
      });
      maliciousSendCallsWarningBypassResult.innerHTML = result.id;
    } catch (err) {
      console.error(err);
      maliciousSendCallsWarningBypassResult.innerHTML = `Error: ${err.message}`;
    }
  };

  maliciousSendCallsSendWithoutHexPrefixValue.onclick = async () => {
    const transaction =
      maliciousTransactions.maliciousSendWithoutHexPrefixValue;
    try {
      const result = await globalContext.provider.request({
        method: 'wallet_sendCalls',
        params: [getParams([transaction, ...DEFAULT_CALLS])],
      });
      maliciousSendCallsWarningBypassResult.innerHTML = result.id;
    } catch (err) {
      console.error(err);
      maliciousSendCallsWarningBypassResult.innerHTML = `Error: ${err.message}`;
    }
  };
}
