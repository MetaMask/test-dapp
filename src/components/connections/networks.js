import globalContext from '../..';

const NETWORKS = [
  // Main networks
  { name: 'Ethereum Mainnet', chainId: '0x1', color: '#627eea', category: 'main' },
  { name: 'Linea', chainId: '0xe708', color: '#000000', category: 'main' },
  { name: 'Base Mainnet', chainId: '0x2105', color: '#0052ff', category: 'main' },
  { name: 'Arbitrum One', chainId: '0xa4b1', color: '#28a0f0', category: 'main' },
  { name: 'Avalanche Network C-Chain', chainId: '0xa86a', color: '#e84142', category: 'main' },
  { name: 'Binance Smart Chain', chainId: '0x38', color: '#f3ba2f', category: 'main' },
  { name: 'OP Mainnet', chainId: '0xa', color: '#ff0420', category: 'main' },
  { name: 'Polygon Mainnet', chainId: '0x89', color: '#8247e5', category: 'main' },
  { name: 'Sei Network', chainId: '0x1a', color: '#ff6b35', category: 'main' },
  { name: 'zkSync Era Mainnet', chainId: '0x144', color: '#8e71c7', category: 'main' },
  
  // Test networks
  { name: 'Sepolia', chainId: '0xaa36a7', color: '#f6c343', category: 'test' },
  { name: 'Linea Sepolia', chainId: '0xe705', color: '#000000', category: 'test' },
  { name: 'Mega Testnet', chainId: '0x1a4', color: '#ff6b35', category: 'test' },
  { name: 'Monad Testnet', chainId: '0x1a5', color: '#ff6b35', category: 'test' },
];

export function networksComponent(parentContainer) {
  parentContainer.insertAdjacentHTML(
    'beforeend',
    `<div class="col-xl-4 col-lg-6 col-md-12 col-sm-12 col-12">
      <div class="card">
        <div class="card-body">
          <h4 class="card-title">
            Network Picker
          </h4>
          <button id="openNetworkPicker" class="btn btn-outline-primary btn-lg btn-block mb-3">
            <span id="currentNetworkName">Select Network</span>
            <i class="fas fa-chevron-down ml-2"></i>
          </button>
        </div>
      </div>
    </div>`,
  );

  // Create modal dialog
  const modal = document.createElement('div');
  modal.className = 'network-modal';
  modal.innerHTML = `
    <div class="network-modal-content">
      <div class="network-modal-header">
        <h5>Select Network</h5>
        <button class="network-modal-close">&times;</button>
      </div>
      <div class="network-modal-body">
        <div class="network-category">
          <h6>Main Networks</h6>
          <div class="network-list" id="mainNetworks"></div>
        </div>
        <div class="network-category">
          <h6>Test Networks</h6>
          <div class="network-list" id="testNetworks"></div>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  const openButton = document.getElementById('openNetworkPicker');
  const closeButton = modal.querySelector('.network-modal-close');
  const currentNetworkName = document.getElementById('currentNetworkName');

  // Populate network lists
  populateNetworkLists();

  // Event listeners
  openButton.addEventListener('click', () => {
    modal.style.display = 'flex';
    updateActiveNetworkInModal();
  });

  closeButton.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  });

  // Update current network display when chain changes
  document.addEventListener('newNetwork', () => {
    updateCurrentNetworkDisplay();
  });

  // Initial update
  updateCurrentNetworkDisplay();
}

function populateNetworkLists() {
  const mainNetworks = document.getElementById('mainNetworks');
  const testNetworks = document.getElementById('testNetworks');

  NETWORKS.forEach(network => {
    const networkItem = createNetworkItem(network);
    
    switch (network.category) {
      case 'main':
        mainNetworks.appendChild(networkItem);
        break;
      case 'test':
        testNetworks.appendChild(networkItem);
        break;
    }
  });
}

function createNetworkItem(network) {
  const item = document.createElement('div');
  item.className = 'network-modal-item';
  item.dataset.chainId = network.chainId;
  item.innerHTML = `
    <div class="network-modal-item-content">
      <div class="network-modal-item-icon" style="background-color: ${network.color}"></div>
      <div class="network-modal-item-info">
        <div class="network-modal-item-name">${network.name}</div>
        <div class="network-modal-item-chain-id">${network.chainId}</div>
      </div>
    </div>
  `;

  item.addEventListener('click', async () => {
    await switchNetwork(network.chainId);
    document.querySelector('.network-modal').style.display = 'none';
  });

  return item;
}

async function switchNetwork(chainId) {
  if (!globalContext.provider) {
    console.error('No provider available');
    return;
  }

  try {
    await globalContext.provider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId }],
    });
  } catch (switchError) {
    // This error code indicates that the chain has not been added to MetaMask.
    if (switchError.code === 4902) {
      try {
        const network = NETWORKS.find(n => n.chainId === chainId);
        await globalContext.provider.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId,
              chainName: network?.name || 'Unknown Network',
              nativeCurrency: {
                name: 'ETH',
                symbol: 'ETH',
                decimals: 18,
              },
              rpcUrls: ['https://rpc.example.com'], // You might want to add proper RPC URLs
              blockExplorerUrls: ['https://explorer.example.com'], // You might want to add proper explorer URLs
            },
          ],
        });
      } catch (addError) {
        console.error('Error adding network:', addError);
      }
    } else {
      console.error('Error switching network:', switchError);
    }
  }
}

function updateCurrentNetworkDisplay() {
  const currentChainId = globalContext.chainIdInt?.toString(16) || globalContext.chainIdPadded;
  const currentNetworkName = document.getElementById('currentNetworkName');
  
  if (currentChainId) {
    // Convert chainId to proper format for comparison
    let normalizedChainId;
    if (typeof currentChainId === 'string') {
      if (currentChainId.startsWith('0x')) {
        normalizedChainId = currentChainId;
      } else {
        normalizedChainId = `0x${currentChainId}`;
      }
    } else {
      normalizedChainId = `0x${currentChainId.toString(16)}`;
    }
    
    const network = NETWORKS.find(n => n.chainId === normalizedChainId);
    
    if (network) {
      currentNetworkName.textContent = `Current Network: ${network.name}`;
    } else {
      // Extract the actual chain ID from the padded version if needed
      let displayChainId = normalizedChainId;
      if (normalizedChainId.length > 10) {
        // If it's a padded chain ID, try to extract the actual chain ID
        const actualChainId = globalContext.chainIdInt?.toString(16);
        if (actualChainId) {
          displayChainId = `0x${actualChainId}`;
        }
      }
      currentNetworkName.textContent = `Current Network: Chain ID ${displayChainId}`;
    }
  } else {
    currentNetworkName.textContent = 'Current Network: Not Connected';
  }
}

function updateActiveNetworkInModal() {
  const currentChainId = globalContext.chainIdPadded || globalContext.chainIdInt?.toString(16);
  const networkItems = document.querySelectorAll('.network-modal-item');

  networkItems.forEach(item => {
    const itemChainId = item.dataset.chainId;
    const isActive = currentChainId && 
      (itemChainId === currentChainId || 
       itemChainId === `0x${currentChainId}` ||
       itemChainId === parseInt(currentChainId, 16).toString(16));

    if (isActive) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });
} 