import {
  populateNetworkLists,
  updateCurrentNetworkDisplay,
  updateActiveNetworkInModal,
  hideNetworkError,
} from './networks-helpers';

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

  // Populate network lists
  populateNetworkLists();

  // Event listeners
  openButton.addEventListener('click', () => {
    modal.style.display = 'flex';
    updateActiveNetworkInModal();
  });

  closeButton.addEventListener('click', () => {
    modal.style.display = 'none';
    hideNetworkError();
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
      hideNetworkError();
    }
  });

  // Update current network display when chain changes
  document.addEventListener('newNetwork', () => {
    updateCurrentNetworkDisplay();
  });

  // Initial update
  updateCurrentNetworkDisplay();
}
