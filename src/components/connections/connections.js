/* import { walletConnect } from "../../connections"; */
import globalContext from '../..';

export function connectionsComponent(parentContainer) {
  parentContainer.insertAdjacentHTML(
    'beforeend',
    `<div class="col-xl-4 col-lg-6 col-md-12 col-sm-12 col-12">
      <div class="card">
        <div class="card-body">
          <h4 class="card-title">
            Connect Actions
          </h4>

          <button
            class="btn btn-primary btn-lg btn-block mb-3"
            id="connectButton"
            disabled
          >
            Connect
          </button>

          <button
            class="btn btn-primary btn-lg btn-block mb-3"
            id="walletConnect"
          >
          Wallet Connect
          </button>
          <button
            class="btn btn-primary btn-lg btn-block mb-3"
            id="sdkConnect"
          >
          SDK Connect
          </button>
          <hr />
          <button
            class="btn btn-primary btn-lg btn-block mb-3"
            id="getAccounts"
          >
            eth_accounts
          </button>

          <p class="info-text alert alert-secondary">
            eth_accounts result: <span id="getAccountsResult"></span>
          </p>
        </div>
      </div>
    </div>`,
  );

  /*
  const onboardButton = document.getElementById('connectButton');
  const walletConnectBtn = document.getElementById('walletConnect');
  const sdkConnectBtn = document.getElementById('sdkConnect');
  */
  const getAccounts = document.getElementById('getAccounts');
  const getAccountsResult = document.getElementById('getAccountsResult');

  getAccounts.onclick = async () => {
    try {
      const _accounts = await globalContext.provider.request({
        method: 'eth_accounts',
      });
      getAccountsResult.innerHTML = _accounts || 'Not able to get accounts';
    } catch (err) {
      console.error(err);
      getAccountsResult.innerHTML = `Error: ${err.message}`;
    }
  };
}
