import globalContext from '../../..';

export function getCapabilitiesComponent(parentContainer) {
  parentContainer.insertAdjacentHTML(
    'beforeend',
    `<div class="form-group">
        <label>Account</label>
        <input
            class="form-control"
            type="text"
            id="eip5792AccountInput"
        />
    </div>

    <button
        class="btn btn-primary btn-lg btn-block mb-3"
        id="eip5792GetCapabilitiesButton"
        disabled
    >
        Get Capabilities
    </button>

    <p class="info-text alert alert-success">
        <span class="wrap" id="eip5792GetCapabilitiesResult">Status</span>
    </p>`,
  );

  const accountInput = document.getElementById('eip5792AccountInput');
  const getCapabilitiesButton = document.getElementById(
    'eip5792GetCapabilitiesButton',
  );
  const resultOutput = document.getElementById('eip5792GetCapabilitiesResult');

  document.addEventListener('globalConnectionChange', function (e) {
    if (e.detail.connected) {
      accountInput.value = '';
      getCapabilitiesButton.disabled = false;
      accountInput.value = globalContext.accounts[0];
    }
  });

  document.addEventListener('disableAndClear', function () {
    accountInput.value = '';
    getCapabilitiesButton.disabled = true;
  });

  getCapabilitiesButton.onclick = async () => {
    try {
      const result = await globalContext.provider.request({
        method: 'wallet_getCapabilities',
        params: [accountInput.value],
      });

      resultOutput.innerHTML = JSON.stringify(result, null, 2);
    } catch (error) {
      console.error(error);
      resultOutput.innerHTML = `Error: ${error.message}`;
    }
  };
}
