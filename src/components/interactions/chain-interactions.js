import globalContext from '../..';

export function ethereumChainInteractions(parentContainer) {
  parentContainer.insertAdjacentHTML(
    'beforeend',
    `<div class="col-xl-4 col-lg-6 col-md-12 col-sm-12 col-12 d-flex align-items-stretch">
      <div class="card full-width">
        <div class="card-body">
          <h4 class="card-title">
            Ethereum Chain Interactions
          </h4>
          <button
            class="btn btn-primary btn-lg btn-block mb-3"
            id="addEthereumChain"
            disabled
          >
            Add Localhost 8546
          </button>
          <button
            class="btn btn-primary btn-lg btn-block mb-3"
            id="switchEthereumChain"
            disabled
          >
            Switch to Localhost 8546
          </button>
        </div>
      </div>
    </div>`,
  );

  const addEthereumChain = document.getElementById('addEthereumChain');
  const switchEthereumChain = document.getElementById('switchEthereumChain');

  addEthereumChain.onclick = async () => {
    await globalContext.provider.request({
      method: 'wallet_addEthereumChain',
      params: [
        {
          chainId: '0x53a',
          rpcUrls: ['http://127.0.0.1:8546'],
          chainName: 'Localhost 8546',
          nativeCurrency: { name: 'TEST', decimals: 18, symbol: 'TEST' },
          blockExplorerUrls: null,
        },
      ],
    });
  };

  switchEthereumChain.onclick = async () => {
    await globalContext.provider.request({
      method: 'wallet_switchEthereumChain',
      params: [
        {
          chainId: '0x53a',
        },
      ],
    });
  };
}
