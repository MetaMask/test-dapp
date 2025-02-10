import globalContext from '../..';

const DEFAULT_CALLS = [
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
];

export function eip5792Component(parentContainer) {
  parentContainer.insertAdjacentHTML(
    'beforeend',
    `<div class="col-xl-4 col-lg-6 col-md-12 col-sm-12 col-12 d-flex align-items-stretch">
      <div class="card full-width">
        <div class="card-body">
          <h4 class="card-title">
            EIP 5792
          </h4>

          <div class="form-group" id="fromContainer" hidden>
            <label>From</label>
            <input
              class="form-control"
              type="text"
              id="eip5792From"
            />
          </div>

          <div class="form-group" id="chainIdContainer" hidden>
            <label>Chain ID</label>
            <input
              class="form-control"
              type="text"
              id="eip5792ChainId"
            />
          </div>

          <div id="eip5792Calls">
          </div>

           <button
            class="btn btn-primary btn-lg btn-block mb-3"
            id="eip5792AddCall"
            disabled
            hidden
          >
            Add Call
          </button>

          <button
            class="btn btn-primary btn-lg btn-block mb-3"
            id="sendCallsEdit"
            disabled
          >
            Edit Send Calls Request
          </button>

          <button
            class="btn btn-primary btn-lg btn-block mb-3"
            id="sendCalls"
            disabled
          >
            Send Calls
          </button>

          <p class="info-text alert alert-warning" id="eip5792SendCallsErrorContainer" hidden>
            <span class="wrap" id="eip5792SendCallsError"></span>
          </p>

          <hr/>

          <div class="form-group">
            <label>Request ID</label>
            <input
              class="form-control"
              type="text"
              id="eip5792CallId"
              />
          </div>

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
  const editSendCallsButton = document.getElementById('sendCallsEdit');
  const addCallButton = document.getElementById('eip5792AddCall');
  const fromInput = getFromInput();
  const fromContainer = getFromContainer();
  const chainIdInput = getChainIdInput();
  const chainIdContainer = document.getElementById('chainIdContainer');
  const calls = document.getElementById('eip5792Calls');
  const sendCallsErrorContainer = document.getElementById(
    'eip5792SendCallsErrorContainer',
  );
  const sendCallsError = document.getElementById('eip5792SendCallsError');

  document.addEventListener('globalConnectionChange', function (e) {
    if (e.detail.connected) {
      addCallButton.disabled = false;
      editSendCallsButton.disabled = false;
      sendCallsButton.disabled = false;
      getCallsStatusButton.disabled = false;
    }
  });

  document.addEventListener('disableAndClear', function () {
    addCallButton.disabled = true;
    editSendCallsButton.disabled = true;
    sendCallsButton.disabled = true;
    getCallsStatusButton.disabled = true;
    callId.value = '';
    callStatus.innerHTML = '';
  });

  sendCallsButton.onclick = async () => {
    try {
      const result = await globalContext.provider.request({
        method: 'wallet_sendCalls',
        params: [getParams()],
      });

      callId.value = `${result}`;
      sendCallsErrorContainer.hidden = true;
      sendCallsError.innerHTML = '';
    } catch (error) {
      sendCallsErrorContainer.hidden = false;
      sendCallsError.innerHTML = `Error: ${error.message}`;
    }
  };

  getCallsStatusButton.onclick = async () => {
    const result = await globalContext.provider.request({
      method: 'wallet_getCallsStatus',
      params: [callId.value],
    });

    callStatus.innerHTML = JSON.stringify(result, null, 2);
  };

  editSendCallsButton.onclick = async () => {
    const showInputs = !isCustom();

    fromContainer.hidden = !showInputs;
    fromInput.value = getDefaultFrom();

    chainIdContainer.hidden = !showInputs;
    chainIdInput.value = getDefaultChainId();

    addCallButton.hidden = !showInputs;

    if (showInputs) {
      for (let i = 0; i < DEFAULT_CALLS.length; i++) {
        addCallInputs(calls, DEFAULT_CALLS[i]);
      }
    } else {
      getCallContainers().forEach((callContainer) =>
        callContainer.parentElement.removeChild(callContainer),
      );
    }
  };

  addCallButton.onclick = () => {
    addCallInputs(calls);
  };
}

function getParams() {
  const useInputs = isCustom();
  const from = useInputs ? getFromInput().value : getDefaultFrom();
  const chainId = useInputs ? getChainIdInput().value : getDefaultChainId();
  const calls = useInputs ? getCalls() : DEFAULT_CALLS;

  return {
    from,
    chainId,
    calls,
  };
}

function getCalls() {
  const callCount = getCallCount();
  return Array.from({ length: callCount }, (_, i) => getCall(i));
}

function getCall(index) {
  const to = getCallToInput(index).value;
  const data = getCallDataInput(index).value;
  const { value } = getCallValueInput(index);

  return {
    to,
    data,
    value,
  };
}

function addCallInputs(container, call = { to: '', data: '', value: '' }) {
  container.insertAdjacentHTML(
    'beforeend',
    `
    <div class="card full-width eip5792Call">
      <div class="card-body">
        <h4 class="card-title">
          Call
        </h4>

        <div class="form-group">
          <label>To</label>
          <input
            class="form-control eip5792CallTo"
            type="text"
            value="${call.to}"
          />
        </div>

        <div class="form-group">
          <label>Data</label>
          <input
            class="form-control eip5792CallData"
            type="text"
            value="${call.data}"
          />
        </div>

        <div class="form-group">
          <label>Value</label>
          <input
            class="form-control eip5792CallValue"
            type="text"
            value="${call.value}"
          />
        </div>

        <button
          class="btn btn-primary btn-lg btn-block mb-3 eip5792CallRemove"
        >
          Remove Call
        </button>
      </div>
    </div>`,
  );

  const removeButtons = document.querySelectorAll('.eip5792CallRemove');
  const removeButton = removeButtons[removeButtons.length - 1];

  removeButton.onclick = () => {
    const callContainer = removeButton.parentElement.parentElement;
    callContainer.parentElement.removeChild(callContainer);
  };
}

function getFromContainer() {
  return document.getElementById('fromContainer');
}

function getFromInput() {
  return document.getElementById('eip5792From');
}

function isCustom() {
  return !getFromContainer().hidden;
}

function getChainIdInput() {
  return document.getElementById('eip5792ChainId');
}

function getCallContainers() {
  return document.querySelectorAll('.eip5792Call');
}

function getCallCount() {
  return getCallContainers().length;
}

function getCallToInput(index) {
  return getCallContainers()[index].querySelector('.eip5792CallTo');
}

function getCallDataInput(index) {
  return getCallContainers()[index].querySelector('.eip5792CallData');
}

function getCallValueInput(index) {
  return getCallContainers()[index].querySelector('.eip5792CallValue');
}

function getDefaultChainId() {
  return `0x${globalContext.chainIdInt.toString(16)}`;
}

function getDefaultFrom() {
  return globalContext.accounts[0];
}
