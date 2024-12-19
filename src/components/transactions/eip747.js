import globalContext from '../..';

export function eip747Component(parentContainer) {
  parentContainer.insertAdjacentHTML(
    'beforeend',
    `      <div
        class="col-xl-4 col-lg-6 col-md-12 col-sm-12 col-12 d-flex align-items-stretch"
      >
        <div class="card full-width">
          <div class="card-body">
            <h4 class="card-title">
              EIP 747
            </h4>

            <div class="form-group">
              <label>ERC20 Token Address</label>
              <input
                class="form-control"
                type="text"
                placeholder="0x..."
                id="eip747ContractAddress"
              />
            </div>

            <div class="form-group">
              <label>Symbol</label>
              <input
                class="form-control"
                type="text"
                placeholder="XYZ"
                id="eip747Symbol"
              />
            </div>

            <div class="form-group">
              <label>Decimals</label>
              <input
                class="form-control"
                type="number"
                placeholder="18"
                id="eip747Decimals"
              />
            </div>

            <div class="form-group">
              <button
                class="btn btn-primary btn-lg btn-block mb-3"
                id="eip747WatchButton"
                disabled
              >
                Add Token
              </button>
            </div>

            <p class="info-text alert alert-secondary">
              EIP 747: <span id="eip747Status"></span>
            </p>
          </div>
        </div>
      </div>`,
  );

  // ERC 747 Section
  const eip747ContractAddress = document.getElementById(
    'eip747ContractAddress',
  );
  const eip747Symbol = document.getElementById('eip747Symbol');
  const eip747Decimals = document.getElementById('eip747Decimals');
  const eip747WatchButton = document.getElementById('eip747WatchButton');
  const eip747Status = document.getElementById('eip747Status');

  document.addEventListener('globalConnectionChange', function (e) {
    if (e.detail.connected) {
      // MetaMask is connected, enable the button
      eip747WatchButton.disabled = false;
    }
  });

  /**
   *  EIP 747
   */

  eip747WatchButton.onclick = async () => {
    eip747Status.innerHTML = 'Adding token...';

    try {
      const result = await globalContext.provider.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address: eip747ContractAddress.value,
            symbol: eip747Symbol.value,
            decimals: parseInt(eip747Decimals.value, 10),
            image: 'https://metamask.github.io/test-dapp/metamask-fox.svg',
          },
        },
      });
      eip747Status.innerHTML = 'NFT added successfully';
      console.log(result);
    } catch (error) {
      eip747Status.innerHTML =
        'There was an error adding the token. See console for details.';
      console.error(error);
    }
  };
}
