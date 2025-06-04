import globalContext from '../../..';

export const VERSION = '2.0.0';

export const DEFAULT_CALLS = [
  {
    to: '0x0c54FcCd2e384b4BB6f2E405Bf5Cbc15a017AaFb',
    data: '0x654365436543',
    value: '0x3B9ACA00', // 1 Gwei
  },
  {
    to: '0xbc2114a988e9CEf5bA63548D432024f34B487048',
    data: '0x789078907890',
    value: '0x1DCD6500', // 0.5 Gwei
  },
];

const ERC20_USDC = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
const ERC20_USDT = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
const ERC721_BORED_APE = '0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d';
const ERC1155_OPENSTORE = '0x495f947276749ce646f68ac8c248420045cb7b5e';
const PERMIT2 = '0x000000000022D473030F116dDEE9F6B43aC78BA3';

const CALL_APPROVAL_ERC20_LEGACY = {
  data: '0x095ea7b30000000000000000000000000c54FcCd2e384b4BB6f2E405Bf5Cbc15a017AaFb0000000000000000000000000000000000000000000000000000000000459480',
  to: ERC20_USDC,
};

const CALL_APPROVAL_ERC20_PERMIT_2 = {
  data: '0x87517c45000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb480000000000000000000000000c54FcCd2e384b4BB6f2E405Bf5Cbc15a017AaFb000000000000000000000000000000000000000000000000000000000012C4B00000000000000000000000000000000000000000000000000000000068437af0',
  to: PERMIT2,
};

const CALL_APPROVAL_ERC20_INCREASE_ALLOWANCE = {
  data: '0x395093510000000000000000000000000c54FcCd2e384b4BB6f2E405Bf5Cbc15a017AaFb0000000000000000000000000000000000000000000000000000000000786450',
  to: ERC20_USDC,
};

const CALL_APPROVAL_ERC20_LEGACY_UNLIMITED = {
  data: '0x095ea7b30000000000000000000000000c54FcCd2e384b4BB6f2E405Bf5Cbc15a017AaFb0000000000000000000000000000000000000000000FFFFFFFFFFFFFFFFFFFFF',
  to: ERC20_USDT,
};

const CALL_APPROVAL_ERC721_APPROVE = {
  data: '0x095ea7b30000000000000000000000000c54FcCd2e384b4BB6f2E405Bf5Cbc15a017AaFb00000000000000000000000000000000000000000000000000000000000020F0',
  to: ERC721_BORED_APE,
};

const CALL_APPROVAL_ERC721_APPROVE_ALL = {
  data: '0xa22cb4650000000000000000000000000c54FcCd2e384b4BB6f2E405Bf5Cbc15a017AaFb0000000000000000000000000000000000000000000000000000000000000001',
  to: ERC721_BORED_APE,
};

const CALL_APPROVAL_ERC1155_APPROVE_ALL = {
  data: '0xa22cb4650000000000000000000000000c54FcCd2e384b4BB6f2E405Bf5Cbc15a017AaFb0000000000000000000000000000000000000000000000000000000000000001',
  to: ERC1155_OPENSTORE,
};

export function sendCallsComponent(parentContainer) {
  parentContainer.insertAdjacentHTML(
    'beforeend',
    `<button
        class="btn btn-primary btn-lg btn-block mb-3"
        id="eip5792SendCallsEdit"
        disabled
    >
        Edit Request
    </button>
    
    <div class="form-group" id="eip5792FromContainer" hidden>
        <label>From</label>
        <input
            class="form-control"
            type="text"
            id="eip5792From"
        />
    </div>

    <div class="form-group" id="eip5792ChainIdContainer" hidden>
        <label>Chain ID</label>
        <input
            class="form-control"
            type="text"
            id="eip5792ChainId"
        />
    </div>

    <div id="eip5792Calls"></div>

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
        id="eip5792SendCallsButton"
        disabled
    >
        Send Calls
    </button>

     <button
        class="btn btn-primary btn-lg btn-block mb-3"
        id="eip5792SendCallsApprovalButton"
        disabled
    >
        Send Calls - Multiple Approvals
    </button>

    <p class="info-text alert alert-warning" id="eip5792SendCallsErrorContainer" hidden>
        <span class="wrap" id="eip5792SendCallsError"></span>
    </p>`,
  );

  const editButton = document.getElementById('eip5792SendCallsEdit');
  const fromContainer = document.getElementById('eip5792FromContainer');
  const fromInput = document.getElementById('eip5792From');
  const chainIdContainer = document.getElementById('eip5792ChainIdContainer');
  const chainIdInput = document.getElementById('eip5792ChainId');
  const callsContainer = document.getElementById('eip5792Calls');
  const addCallButton = document.getElementById('eip5792AddCall');
  const sendCallsButton = document.getElementById('eip5792SendCallsButton');
  const sendCallsApprovalButton = document.getElementById(
    'eip5792SendCallsApprovalButton',
  );
  const errorContainer = document.getElementById(
    'eip5792SendCallsErrorContainer',
  );
  const errorOutput = document.getElementById('eip5792SendCallsError');

  document.addEventListener('globalConnectionChange', function (e) {
    if (e.detail.connected) {
      editButton.disabled = false;
      addCallButton.disabled = false;
      sendCallsButton.disabled = false;
      sendCallsApprovalButton.disabled = false;
    }
  });

  document.addEventListener('disableAndClear', function () {
    editButton.disabled = true;
    addCallButton.disabled = true;
    sendCallsButton.disabled = true;
    sendCallsApprovalButton.disabled = true;
  });

  editButton.onclick = async () => {
    const showInputs = !isCustom();

    fromContainer.hidden = !showInputs;
    fromInput.value = getDefaultFrom();

    chainIdContainer.hidden = !showInputs;
    chainIdInput.value = getDefaultChainId();

    addCallButton.hidden = !showInputs;

    if (showInputs) {
      for (let i = 0; i < DEFAULT_CALLS.length; i++) {
        addCallInputs(callsContainer, DEFAULT_CALLS[i]);
      }
    } else {
      getCallContainers().forEach((callContainer) =>
        callContainer.parentElement.removeChild(callContainer),
      );
    }
  };

  addCallButton.onclick = () => {
    addCallInputs(callsContainer);
  };

  sendCallsButton.onclick = async () => {
    submitRequest();
  };

  sendCallsApprovalButton.onclick = () => {
    submitRequest([
      CALL_APPROVAL_ERC20_LEGACY,
      CALL_APPROVAL_ERC20_PERMIT_2,
      CALL_APPROVAL_ERC20_INCREASE_ALLOWANCE,
      CALL_APPROVAL_ERC20_LEGACY_UNLIMITED,
      CALL_APPROVAL_ERC721_APPROVE,
      CALL_APPROVAL_ERC721_APPROVE_ALL,
      CALL_APPROVAL_ERC1155_APPROVE_ALL,
    ]);
  };

  async function submitRequest(calls) {
    try {
      const result = await globalContext.provider.request({
        method: 'wallet_sendCalls',
        params: [
          {
            ...getParams(),
            ...(calls ? { calls } : {}),
          },
        ],
      });

      document.getElementById('eip5792RequestIdInput').value = result.id;
      errorContainer.hidden = true;
      errorOutput.innerHTML = '';
    } catch (error) {
      console.error(error);
      errorContainer.hidden = false;
      errorOutput.innerHTML = `Error: ${error.message}`;
    }
  }

  function getParams() {
    const useInputs = isCustom();
    const from = useInputs ? fromInput.value : getDefaultFrom();
    const chainId = useInputs ? chainIdInput.value : getDefaultChainId();
    const calls = useInputs ? getCalls() : DEFAULT_CALLS;

    return {
      version: VERSION,
      from,
      chainId,
      atomicRequired: true,
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
      `<div class="card full-width eip5792Call">
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

  function isCustom() {
    return fromContainer.hidden === false;
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
}
