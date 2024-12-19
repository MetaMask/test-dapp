import globalContext from '../..';

export function ethSignComponent(parentContainer) {
  parentContainer.insertAdjacentHTML(
    'beforeend',
    `<div class="col-xl-4 col-lg-6 col-md-12 col-sm-12 col-12 d-flex align-items-stretch">
        <div class="card full-width">
            <div class="card-body">
                <h4>
                Eth Sign
                </h4>

                <button
                class="btn btn-primary btn-lg btn-block mb-3"
                id="ethSign"
                disabled
                >
                Sign
                </button>

                <p class="info-text alert alert-warning">
                Result: <span id="ethSignResult"></span>
                </p>
            </div>
        </div>
    </div>`,
  );

  const ethSign = document.getElementById('ethSign');
  const ethSignResult = document.getElementById('ethSignResult');

  document.addEventListener('globalConnectionChange', function (e) {
    if (e.detail.connected) {
      // MetaMask is connected, enable the button
      ethSign.disabled = false;
    }
  });

  document.addEventListener('disableAndClear', function () {
    ethSign.disabled = true;
  });

  ethSign.onclick = async () => {
    try {
      // const msg = 'Sample message to hash for signature'
      // const msgHash = keccak256(msg)
      const msg =
        '0x879a053d4800c6354e76c7985a865d2922c82fb5b3f4577b2fe08b998954f2e0';
      const ethResult = await globalContext.provider.request({
        method: 'eth_sign',
        params: [globalContext.accounts[0], msg],
      });
      ethSignResult.innerHTML = JSON.stringify(ethResult);
    } catch (err) {
      console.error(err);
      ethSign.innerHTML = `Error: ${err.message}`;
    }
  };
}
