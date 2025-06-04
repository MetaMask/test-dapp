import globalContext from '../../..';

export const VERSION = '2.0.0';

export function transactionBatchButtonsComponent(parentContainer) {
  parentContainer.insertAdjacentHTML(
    'beforeend',
    `<button
        class="btn btn-primary btn-lg btn-block mb-3"
        id="transactionBatchSendRequest"
        disabled
    >
        Send Transaction Batch Request
    </button>
    `,
  );

  const sendRequestButton = document.getElementById('transactionBatchSendRequest');

  document.addEventListener('globalConnectionChange', function (e) {
    if (e.detail.connected) {
      sendRequestButton.disabled = false;
    }
  });

  document.addEventListener('disableAndClear', function () {
    sendRequestButton.disabled = true;
  });

  const calls = [
    {
      data: "0xa9059cbb000000000000000000000000dc47789de4ceff0e8fe9d15d728af7f17550c164000000000000000000000000000000000000000000000001158e460913d00000",
      to: "0x6b175474e89094c44da98b954eedeac495271d0f",
      value: "0x0",
    },
    {
      data: "0xa9059cbb000000000000000000000000dc47789de4ceff0e8fe9d15d728af7f17550c164000000000000000000000000000000000000000000000001158e460913d00000",
      to: "0x6b175474e89094c44da98b954eedeac495271d0f",
      value: "0x0",
    },
  ];

  function getDefaultChainId() {
    return `0x${globalContext.chainIdInt.toString(16)}`;
  }

  function getDefaultFrom() {
    return globalContext.accounts[0];
  }

  function getParams() {
    const from = getDefaultFrom();
    const chainId = getDefaultChainId();;

    return {
      version: VERSION,
      from,
      chainId,
      atomicRequired: true,
      calls,
    };
  }

  sendRequestButton.onclick = async () => {
    try {
      await globalContext.provider.request({
        method: 'wallet_sendCalls',
        params: [getParams()],
      });
    } catch (error) {
      console.error(error.message);
    }
  };
}
