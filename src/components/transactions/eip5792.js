import globalContext from '../..';

export function eip5792Component(parentContainer) {
  parentContainer.insertAdjacentHTML(
    'beforeend',
    `<div class="col-xl-4 col-lg-6 col-md-12 col-sm-12 col-12 d-flex align-items-stretch">
      <div class="card full-width">
        <div class="card-body">
          <h4 class="card-title">
            EIP 5792
          </h4>

          <button
            class="btn btn-primary btn-lg btn-block mb-3"
            id="sendCalls"
            disabled
          >
            Send Calls
          </button>

          <p class="info-text alert alert-success">
            Call ID: <span id="eip5792CallId"></span>
          </p>

          <button
            class="btn btn-primary btn-lg btn-block mb-3"
            id="getCallsStatus"
            disabled
          >
            Get Calls Status
          </button>

          <p class="info-text alert alert-success">
            <span class="wrap">Status:\n</span><span class="wrap" id="eip5792CallStatus"></span>
          </p>

        </div>
      </div>
    </div>`,
  );

  const sendCallsButton = document.getElementById('sendCalls');
  const getCallsStatusButton = document.getElementById('getCallsStatus');
  const callId = document.getElementById('eip5792CallId');
  const callStatus = document.getElementById('eip5792CallStatus');

  document.addEventListener('globalConnectionChange', function (e) {
    if (e.detail.connected) {
      // MetaMask is connected, enable the button
      sendCallsButton.disabled = false;
      getCallsStatusButton.disabled = false;
    }
  });

  document.addEventListener('disableAndClear', function () {
    sendCallsButton.disabled = true;
    getCallsStatusButton.disabled = true;
    callId.innerHTML = '';
    callStatus.innerHTML = '';
  });

  sendCallsButton.onclick = async () => {
    const result = await globalContext.provider.request({
      method: 'wallet_sendCalls',
      params: [
        {
          version: '1.0',
          from: globalContext.accounts[0],
          calls: [
            {
              to: '0x0c54FcCd2e384b4BB6f2E405Bf5Cbc15a017AaFb',
              data: '0x654365436543',
              value: '0x1234123412341234',
            },
            {
              to: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
              data: '0x789078907890',
              value: '0x4321432143214321',
            },
          ],
        },
      ],
    });

    callId.innerHTML = result;
  };

  getCallsStatusButton.onclick = async () => {
    const result = await globalContext.provider.request({
      method: 'wallet_getCallsStatus',
      params: [callId.innerHTML],
    });

    callStatus.innerHTML = JSON.stringify(result, null, 2);
  };
}
