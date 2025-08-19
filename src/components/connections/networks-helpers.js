import globalContext from '../..';

const NETWORKS = [
  // Main networks
  {
    name: 'Ethereum Mainnet',
    chainId: '0x1',
    color: '#627eea',
    category: 'main',
  },
  {
    name: 'Linea',
    chainId: '0xe708',
    color: '#000000',
    category: 'main',
  },
  {
    name: 'Base Mainnet',
    chainId: '0x2105',
    color: '#0052ff',
    category: 'main',
  },
  {
    name: 'Arbitrum One',
    chainId: '0xa4b1',
    color: '#28a0f0',
    category: 'main',
  },
  {
    name: 'Avalanche Network C-Chain',
    chainId: '0xa86a',
    color: '#e84142',
    category: 'main',
  },
  {
    name: 'Binance Smart Chain',
    chainId: '0x38',
    color: '#f3ba2f',
    category: 'main',
  },
  {
    name: 'OP Mainnet',
    chainId: '0xa',
    color: '#ff0420',
    category: 'main',
  },
  {
    name: 'Polygon Mainnet',
    chainId: '0x89',
    color: '#8247e5',
    category: 'main',
  },
  {
    name: 'Sei Network',
    chainId: '0x1a',
    color: '#ff6b35',
    category: 'main',
  },
  {
    name: 'zkSync Era Mainnet',
    chainId: '0x144',
    color: '#8e71c7',
    category: 'main',
  },

  // Test networks
  {
    name: 'Sepolia',
    chainId: '0xaa36a7',
    color: '#f6c343',
    category: 'test',
  },
  {
    name: 'Linea Sepolia',
    chainId: '0xe705',
    color: '#000000',
    category: 'test',
  },
  {
    name: 'Mega Testnet',
    chainId: '0x1a4',
    color: '#ff6b35',
    category: 'test',
  },
  {
    name: 'Monad Testnet',
    chainId: '0x1a5',
    color: '#ff6b35',
    category: 'test',
  },
];

export function populateNetworkLists() {
  const mainNetworks = document.getElementById('mainNetworks');
  const testNetworks = document.getElementById('testNetworks');

  NETWORKS.forEach((network) => {
    const networkItem = createNetworkItem(network);

    switch (network.category) {
      case 'main':
        mainNetworks.appendChild(networkItem);
        break;
      case 'test':
        testNetworks.appendChild(networkItem);
        break;
      default:
        break;
    }
  });
}

export function createNetworkItem(network) {
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
    hideNetworkError(); // Hide any existing error before attempting to switch
    await switchNetwork(network.chainId);
    document.querySelector('.network-modal').style.display = 'none';
  });

  return item;
}

export function showNetworkError(message) {
  // Remove any existing error message
  hideNetworkError();

  // Create error message element
  const errorDiv = document.createElement('div');
  errorDiv.id = 'networkError';
  errorDiv.className = 'error-message';
  errorDiv.style.marginTop = '10px';
  errorDiv.style.width = '100%';
  errorDiv.innerHTML = `<div class="error-message-text">${message}</div>`;

  // Find the network picker button and insert error after it
  const networkButton = document.getElementById('openNetworkPicker');
  const cardBody = networkButton.closest('.card-body');
  cardBody.appendChild(errorDiv);

  // Auto-hide after 5 seconds
  setTimeout(() => {
    hideNetworkError();
  }, 5000);
}

export function hideNetworkError() {
  const existingError = document.getElementById('networkError');
  if (existingError) {
    existingError.remove();
  }
}

export async function switchNetwork(chainId) {
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
      const network = NETWORKS.find((n) => n.chainId === chainId);
      const networkName = network ? network.name : `Chain ID ${chainId}`;
      showNetworkError(`${networkName} is not available in your wallet`);
    } else {
      console.error('Error switching network:', switchError);
      showNetworkError('Failed to switch network');
    }
  }
}

export function updateCurrentNetworkDisplay() {
  const currentNetworkName = document.getElementById('currentNetworkName');

  if (
    globalContext.chainIdInt !== undefined &&
    globalContext.chainIdInt !== null
  ) {
    const network = NETWORKS.find((n) => {
      const networkChainId = parseInt(n.chainId, 16);
      return networkChainId === globalContext.chainIdInt;
    });

    if (network) {
      currentNetworkName.textContent = `Current Network: ${network.name}`;
    } else {
      // Fallback to chain ID if network not found
      currentNetworkName.textContent = `Current Network: Chain ID 0x${globalContext.chainIdInt.toString(
        16,
      )}`;
    }
  } else {
    currentNetworkName.textContent = 'Current Network: Not Connected';
  }
}

export function updateActiveNetworkInModal() {
  const networkItems = document.querySelectorAll('.network-modal-item');

  networkItems.forEach((item) => {
    const itemChainId = item.dataset.chainId;
    const itemChainIdInt = parseInt(itemChainId, 16);
    const isActive = itemChainIdInt === globalContext.chainIdInt;

    if (isActive) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });
}
