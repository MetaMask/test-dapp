import globalContext from '../..';

export function ensResolutionComponent(parentContainer) {
  parentContainer.insertAdjacentHTML(
    'beforeend',
    `<div class="row d-flex justify-content-center">
  <div class="col-xl-4 col-lg-6 col-md-12 col-sm-12 col-12">
    <div class="card">
      <div class="card-body">
        <h4 class="card-title">
          ENS Resolution
        </h4>
        <div class="form-group">
          <label>Address</label>
          <input
            class="form-control"
            type="text"
            id="ensInput"
          />
        </div>
        <button
          class="btn btn-primary btn-lg btn-block mb-3"
          id="ensSubmit"
        >
          Submit
        </button>
        <p class="info-text alert alert-warning">
          Result:
          <span id="ensResult"></span>
        </p>
      </div>
    </div>
  </div>
</div>`,
  );

  // ENS Resolution
  const ensInput = document.getElementById('ensInput');
  const ensSubmit = document.getElementById('ensSubmit');
  const ensResult = document.getElementById('ensResult');

  document.addEventListener('globalConnectionChange', function (e) {
    if (e.detail.connected) {
      // MetaMask is connected, enable the button
      ensSubmit.disabled = false;
    }
  });

  /**
   * ENS Resolution
   */
  ensSubmit.onclick = async () => {
    try {
      ensResult.innerHTML = 'Resolving...';
      const ensAddress = ensInput.value;
      const ensResolver = await globalContext.ethersProvider.getResolver(
        ensAddress,
      );
      const ethAddress = await ensResolver.getAddress();

      ensResult.innerHTML = String(ethAddress);
    } catch (error) {
      console.error(error);
      ensResult.innerHTML = 'Failed to resolve address';
    }
  };
}
