import globalContext from '../../..';

export function getCallsStatusComponent(parentContainer) {
  parentContainer.insertAdjacentHTML(
    'beforeend',
    `<div class="form-group">
        <label>Request ID</label>
        <input
            class="form-control"
            type="text"
            id="eip5792RequestIdInput"
        />
    </div>

    <button
        class="btn btn-primary btn-lg btn-block mb-3"
        id="eip5792GetCallsStatusButton"
        disabled
    >
        Get Calls Status
    </button>

    <p class="info-text alert alert-success">
        <span class="wrap" id="eip5792GetCallsStatusResult">Status</span>
    </p>`,
  );

  const requestIdInput = document.getElementById('eip5792RequestIdInput');

  const getCallsStatusButton = document.getElementById(
    'eip5792GetCallsStatusButton',
  );

  const resultOutput = document.getElementById('eip5792GetCallsStatusResult');

  document.addEventListener('globalConnectionChange', function (e) {
    if (e.detail.connected) {
      getCallsStatusButton.disabled = false;
    }
  });

  document.addEventListener('disableAndClear', function () {
    getCallsStatusButton.disabled = true;
  });

  getCallsStatusButton.onclick = async () => {
    try {
      const result = await globalContext.provider.request({
        method: 'wallet_getCallsStatus',
        params: [requestIdInput.value],
      });

      resultOutput.innerHTML = JSON.stringify(result, null, 2);
    } catch (error) {
      console.error(error);
      resultOutput.innerHTML = `Error: ${error.message}`;
    }
  };
}
