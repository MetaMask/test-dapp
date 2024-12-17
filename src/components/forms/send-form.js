import globalContext from '../..';

export function sendFormComponent(parentContainer) {
  parentContainer.insertAdjacentHTML(
    'beforeend',
    `<div class="row d-flex justify-content-center">
      <div class="col-xl-4 col-lg-6 col-md-12 col-sm-12 col-12">
        <div class="card">
          <div class="card-body">
            <h4 class="card-title">
              Send form
            </h4>
            <div class="form-group">
              <label>From</label>
              <input
                class="form-control"
                type="text"
                id="fromInput"
              />
            </div>
            <div class="form-group">
              <label>To</label>
              <input
                class="form-control"
                type="text"
                id="toInput"
              />
            </div>
            <div class="form-group">
              <label>Amount</label>
              <input
                class="form-control"
                type="text"
                id="amountInput"
              />
            </div>
            <div class="form-group">
              <label>Type</label>
              <select class="browser-default custom-select" id="typeInput">
                <option value="0x0">0x0</option>
                <option value="0x2">0x2</option>
              </select>
            </div>
            <div class="form-group" id="gasPriceDiv">
              <label>Gas Price</label>
              <input
                class="form-control"
                type="text"
                id="gasInput"
              />
            </div>
            <div class="form-group" id="maxFeeDiv">
              <label>Max Fee</label>
              <input
                class="form-control"
                type="text"
                id="maxFeeInput"
              />
            </div>
            <div class="form-group" id="maxPriorityDiv">
              <label>Max Priority Fee</label>
              <input
                class="form-control"
                type="text"
                id="maxPriorityFeeInput"
              />
            </div>
            <div class="form-group">
              <label>Data</label>
              <input
                class="form-control"
                type="text"
                id="dataInput"
              />
            </div>
            <button
              class="btn btn-primary btn-lg btn-block mb-3"
              id="submitForm"
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>`,
  );

  // Send form section
  const toDiv = document.getElementById('toInput');
  const type = document.getElementById('typeInput');
  const amount = document.getElementById('amountInput');
  const gasPrice = document.getElementById('gasInput');
  const maxFee = document.getElementById('maxFeeInput');
  const maxPriority = document.getElementById('maxPriorityFeeInput');
  const data = document.getElementById('dataInput');

  document.getElementById('submitForm').onclick = async () => {
    let params;
    if (type.value === '0x0') {
      params = [
        {
          from: globalContext.accounts[0],
          to: toDiv.value,
          value: amount.value,
          gasPrice: gasPrice.value,
          type: type.value,
          data: data.value,
        },
      ];
    } else {
      params = [
        {
          from: globalContext.accounts[0],
          to: toDiv.value,
          value: amount.value,
          maxFeePerGas: maxFee.value,
          maxPriorityFeePerGas: maxPriority.value,
          type: type.value,
          data: data.value,
        },
      ];
    }
    const result = await globalContext.provider.request({
      method: 'eth_sendTransaction',
      params,
    });
    console.log(result);
  };
}
