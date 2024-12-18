import globalContext from '../..';
import { maliciousAddress } from '../../sample-addresses';
import { ERC20_SAMPLE_CONTRACTS } from '../../onchain-sample-contracts';

export function ppomMaliciousWarningBypasses(parentContainer) {
  parentContainer.insertAdjacentHTML(
    'beforeend',
    `<div
      class="col-xl-4 col-lg-6 col-md-12 col-sm-12 col-12 d-flex align-items-stretch"
    >
      <div class="card full-width">
        <div class="card-body">
          <h4>
            PPOM - Malicious Warning Bypasses
          </h4>
          <p>We know we are vulnerable if any of these Transactions/Signatures are not flagged as Malicious</p>
          <h5>Transactions</h5>
          <button
            class="btn btn-primary btn-lg btn-block mb-3"
            id="maliciousSendWithOddHexData"
            disabled
          >
            Malicious Eth Transfer With Odd Hex Data
          </button>
          <button
            class="btn btn-primary btn-lg btn-block mb-3"
            id="maliciousApproveERC20WithOddHexData"
            disabled
          >
            Malicious ERC20 Approval With Odd Hex Data
          </button>
          <button
            class="btn btn-primary btn-lg btn-block mb-3"
            id="maliciousSendWithoutHexPrefixValue"
            disabled
          >
            Malicious Eth Transfer Without 0x Prefix for Hex Value
          </button>
          <h5>Signatures</h5>
          <button
            class="btn btn-primary btn-lg btn-block mb-3"
            id="maliciousPermitHexPaddedChain"
            disabled
          >
            Malicious Permit with Padded chainId
          </button>

          <button
            class="btn btn-primary btn-lg btn-block mb-3"
            id="maliciousPermitIntAddress"
            disabled
          >
            Malicious Permit with Integer Address
          </button>
          <p class="info-text alert alert-warning">
            Result:
            <span id="maliciousWarningBypassResult"></span>
          </p>
        </div>
      </div>
    </div>`,
  );

  const maliciousSendWithOddHexData = document.getElementById(
    'maliciousSendWithOddHexData',
  );
  const maliciousApproveERC20WithOddHexData = document.getElementById(
    'maliciousApproveERC20WithOddHexData',
  );
  const maliciousSendWithoutHexPrefixValue = document.getElementById(
    'maliciousSendWithoutHexPrefixValue',
  );
  const maliciousPermitHexPaddedChain = document.getElementById(
    'maliciousPermitHexPaddedChain',
  );
  const maliciousPermitIntAddress = document.getElementById(
    'maliciousPermitIntAddress',
  );
  const maliciousWarningBypassResult = document.getElementById(
    'maliciousWarningBypassResult',
  );

  document.addEventListener('globalConnectionChange', function (e) {
    if (e.detail.connected) {
      // MetaMask is connected, enable the button
      maliciousSendWithOddHexData.disabled = false;
      maliciousApproveERC20WithOddHexData.disabled = false;
      maliciousSendWithoutHexPrefixValue.disabled = false;
      maliciousPermitHexPaddedChain.disabled = false;
      maliciousPermitIntAddress.disabled = false;
    }
  });

  /**
   *  PPOM - Malicious Warning Bypasses
   */
  maliciousSendWithOddHexData.onclick = async () => {
    try {
      const from = globalContext.accounts[0];
      const send = await globalContext.provider.request({
        method: 'eth_sendTransaction',
        params: [
          {
            from,
            to: `${maliciousAddress}`,
            value: '0x9184e72a000',
            data: '0x1', // odd hex data - expected 0x01
          },
        ],
      });
      maliciousWarningBypassResult.innerHTML = send;
    } catch (err) {
      console.error(err);
      maliciousWarningBypassResult.innerHTML = `Error: ${err.message}`;
    }
  };

  maliciousApproveERC20WithOddHexData.onclick = async () => {
    let erc20Contract;

    if (globalContext.networkName) {
      erc20Contract = ERC20_SAMPLE_CONTRACTS[globalContext.networkName];
    } else {
      erc20Contract = '0x4fabb145d64652a948d72533023f6e7a623c7c53';
    }

    try {
      const from = globalContext.accounts[0];
      const send = await globalContext.provider.request({
        method: 'eth_sendTransaction',
        params: [
          {
            from,
            to: erc20Contract,
            value: '0x0',
            // odd approve hex data - expected 0x095ea7b3...
            data: '0x95ea7b3000000000000000000000000e50a2dbc466d01a34c3e8b7e8e45fce4f7da39e6000000000000000000000000000000000000000000000000ffffffffffffffff',
          },
        ],
      });
      maliciousWarningBypassResult.innerHTML = send;
    } catch (err) {
      console.error(err);
      maliciousWarningBypassResult.innerHTML = `Error: ${err.message}`;
    }
  };

  maliciousSendWithoutHexPrefixValue.onclick = async () => {
    try {
      const from = globalContext.accounts[0];
      const send = await globalContext.provider.request({
        method: 'eth_sendTransaction',
        params: [
          {
            from,
            to: `${maliciousAddress}`,
            value: 'ffffffffffffff', // value without 0x prefix
          },
        ],
      });
      maliciousWarningBypassResult.innerHTML = send;
    } catch (err) {
      console.error(err);
      maliciousWarningBypassResult.innerHTML = `Error: ${err.message}`;
    }
  };

  maliciousPermitHexPaddedChain.onclick = async () => {
    const result = await globalContext.provider.request({
      method: 'eth_signTypedData_v4',
      params: [
        globalContext.accounts[0],
        `{"types":{"EIP712Domain":[{"name":"name","type":"string"},{"name":"version","type":"string"},{"name":"chainId","type":"uint256"},{"name":"verifyingContract","type":"address"}],"Permit":[{"name":"owner","type":"address"},{"name":"spender","type":"address"},{"name":"value","type":"uint256"},{"name":"nonce","type":"uint256"},{"name":"deadline","type":"uint256"}]},"primaryType":"Permit","domain":{"name":"USD Coin","verifyingContract":"0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48","chainId":"${globalContext.chainIdPadded}","version":"2"},"message":{"owner":"${globalContext.accounts[0]}","spender":"0x1661F1B207629e4F385DA89cFF535C8E5Eb23Ee3","value":"1033366316628","nonce":1,"deadline":1678709555}}`,
      ],
    });
    console.log(result);
  };

  maliciousPermitIntAddress.onclick = async () => {
    const result = await globalContext.provider.request({
      method: 'eth_signTypedData_v4',
      params: [
        globalContext.accounts[0],
        `{"types":{"EIP712Domain":[{"name":"name","type":"string"},{"name":"version","type":"string"},{"name":"chainId","type":"uint256"},{"name":"verifyingContract","type":"address"}],"Permit":[{"name":"owner","type":"address"},{"name":"spender","type":"address"},{"name":"value","type":"uint256"},{"name":"nonce","type":"uint256"},{"name":"deadline","type":"uint256"}]},"primaryType":"Permit","domain":{"name":"USD Coin","verifyingContract":"917551056842671309452305380979543736893630245704","chainId":${globalContext.chainIdInt},"version":"2"},"message":{"owner":"${globalContext.accounts[0]}","spender":"0x1661F1B207629e4F385DA89cFF535C8E5Eb23Ee3","value":"1033366316628","nonce":1,"deadline":1678709555}}`,
      ],
    });
    console.log(result);
  };
}
