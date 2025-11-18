import { ethers } from 'ethers';
import globalContext from '../..';
import {
  USDC_ADDRESS,
  WETH_ADDRESS,
  PERMIT2_ADDRESS,
  UNIVERSAL_ROUTER,
  ROUTER_AS_RECIPIENT,
  DEFAULT_FEE_RECIPIENT,
  DEFAULT_FEE_PERCENTAGE,
  EMPTY_BYTES,
  EIP5792_VERSION,
  Actions,
  isValidAddress,
  parseUsdcAmount,
  parseFeePercentage,
  addAction,
  encodeApprove,
  encodePermit2Approve,
} from './swapUtils';

// Batch-specific constants
const DEFAULT_USDC_AMOUNT = '0.5'; // 0.5 USDC

// Helper function to get configuration values from UI
function getConfigValues() {
  const feeRecipientElement = document.getElementById(
    'batchUsdcSwapFeeRecipient',
  );
  const usdcAmountElement = document.getElementById('batchUsdcSwapAmount');
  const feePercentageElement = document.getElementById(
    'batchUsdcSwapFeePercentage',
  );

  const feeRecipientInput = feeRecipientElement
    ? feeRecipientElement.value.trim()
    : '';
  const usdcAmountInput = usdcAmountElement
    ? usdcAmountElement.value.trim()
    : '';
  const feePercentageInput = feePercentageElement
    ? feePercentageElement.value.trim()
    : '';

  // Use defaults if inputs are empty or invalid
  const feeRecipient =
    feeRecipientInput && isValidAddress(feeRecipientInput)
      ? feeRecipientInput
      : DEFAULT_FEE_RECIPIENT;

  const usdcAmount =
    parseUsdcAmount(usdcAmountInput) ||
    ethers.utils.parseUnits(DEFAULT_USDC_AMOUNT, 6);

  const feeBips =
    parseFeePercentage(feePercentageInput) || DEFAULT_FEE_PERCENTAGE * 100;

  return {
    feeRecipient,
    usdcAmount,
    feeBips,
    usdcAmountDisplay: usdcAmountInput || DEFAULT_USDC_AMOUNT,
    feePercentageDisplay:
      feePercentageInput || DEFAULT_FEE_PERCENTAGE.toString(),
  };
}

// Build swap calldata for USDC → ETH (multihop)
function buildSwapCalldata(usdcAmount, feeRecipient, feeBips) {
  const deadline = Math.floor(Date.now() / 1000) + 1200; // 20 minutes from now

  let v4Actions = EMPTY_BYTES;
  const v4Params = [];

  const amountOutMinimum = '0x0'; // No slippage protection

  const path = [
    {
      intermediateCurrency: WETH_ADDRESS,
      fee: '3000',
      tickSpacing: 60,
      hooks: '0x0000000000000000000000000000000000000000',
      hookData: '0x',
    },
  ];

  // Action 1: Swap USDC for ETH
  const swapExactIn = addAction(Actions.SWAP_EXACT_IN, [
    {
      path,
      amountIn: usdcAmount,
      amountOutMinimum,
      currencyIn: USDC_ADDRESS,
    },
  ]);
  v4Actions = v4Actions.concat(swapExactIn.newAction);
  v4Params.push(swapExactIn.newParam);

  // Action 2: Settle USDC payment
  const settleAll = addAction(Actions.SETTLE_ALL, [
    USDC_ADDRESS, // USDC
    usdcAmount,
  ]);
  v4Actions = v4Actions.concat(settleAll.newAction);
  v4Params.push(settleAll.newParam);

  // Action 3: Take fee portion of ETH output
  const takePortion = addAction(Actions.TAKE_PORTION, [
    WETH_ADDRESS, // ETH
    feeRecipient,
    feeBips,
  ]);
  v4Actions = v4Actions.concat(takePortion.newAction);
  v4Params.push(takePortion.newParam);

  const take = addAction(Actions.TAKE, [
    WETH_ADDRESS, // ETH
    ROUTER_AS_RECIPIENT,
    amountOutMinimum,
  ]);
  v4Actions = v4Actions.concat(take.newAction);
  v4Params.push(take.newParam);

  // Encode the V4_SWAP input
  const v4SwapInput = ethers.utils.defaultAbiCoder.encode(
    ['bytes', 'bytes[]'],
    [v4Actions, v4Params],
  );

  const unwrapWethInput = ethers.utils.defaultAbiCoder.encode(
    ['address', 'uint256'],
    [globalContext.accounts[0], amountOutMinimum],
  );

  const commands = '0x100c'; // V4_SWAP + UNWRAP_WETH
  const inputs = [v4SwapInput, unwrapWethInput];

  // Encode the execute function call
  const iface = new ethers.utils.Interface([
    'function execute(bytes commands, bytes[] inputs, uint256 deadline)',
  ]);

  return iface.encodeFunctionData('execute', [commands, inputs, deadline]);
}

// Build all three calls for the batch
function buildBatchCalls(usdcAmount, feeRecipient, feeBips) {
  const deadline = Math.floor(Date.now() / 1000) + 1200; // 20 minutes from now

  // Call 1: Approve Permit2 to spend USDC
  const call1 = {
    to: USDC_ADDRESS,
    data: encodeApprove(PERMIT2_ADDRESS, usdcAmount),
    value: '0x0',
  };

  // Call 2: Approve Universal Router on Permit2
  const call2 = {
    to: PERMIT2_ADDRESS,
    data: encodePermit2Approve(
      USDC_ADDRESS,
      UNIVERSAL_ROUTER,
      usdcAmount,
      deadline,
    ),
    value: '0x0',
  };

  // Call 3: Execute swap
  const call3 = {
    to: UNIVERSAL_ROUTER,
    data: buildSwapCalldata(usdcAmount, feeRecipient, feeBips),
    value: '0x0',
  };

  return [call1, call2, call3];
}

export function batchUsdcSwapComponent(parentContainer) {
  parentContainer.insertAdjacentHTML(
    'beforeend',
    `<div class="col-xl-4 col-lg-6 col-md-12 col-sm-12 col-12 d-flex align-items-stretch">
        <div class="card full-width">
            <div class="card-body">
            <h4 class="card-title">
                Batch USDC → ETH Swap (Mainnet only)
            </h4>

            <p class="info-text alert alert-warning">
                ⚠️ Atomic batch via EIP-5792 wallet_sendCalls
            </p>

            <div class="alert alert-secondary">
                <strong>Current Swap Details:</strong><br/>
                <span id="batchUsdcSwapDetailsDisplay">
                • From: <span id="displayUsdcAmount">${DEFAULT_USDC_AMOUNT}</span> USDC<br/>
                • To: ETH<br/>
                • Fee: <span id="displayBatchFeePercentage">${DEFAULT_FEE_PERCENTAGE}</span>% of output<br/>
                • Approvals: Exact amount only<br/>
                • Slippage: No protection (amountOutMin = 0)
                </span>
            </div>

            <!-- Configuration Section -->
            <div class="card mb-3" style="background-color: #f8f9fa;">
                <div class="card-body">
                    <h6 class="card-subtitle mb-3 text-muted">
                        <strong>Configuration (Optional)</strong>
                    </h6>

                    <div class="form-group mb-3">
                        <label for="batchUsdcSwapAmount" style="font-size: 0.9em;">
                            <strong>USDC Amount</strong>
                        </label>
                        <input
                            type="number"
                            class="form-control"
                            id="batchUsdcSwapAmount"
                            placeholder="${DEFAULT_USDC_AMOUNT}"
                            step="0.01"
                            min="0"
                            style="font-size: 0.9em;"
                        />
                        <small class="form-text text-muted">Leave empty for default (${DEFAULT_USDC_AMOUNT} USDC)</small>
                    </div>

                    <div class="form-group mb-3">
                        <label for="batchUsdcSwapFeePercentage" style="font-size: 0.9em;">
                            <strong>Fee Percentage</strong>
                        </label>
                        <input
                            type="number"
                            class="form-control"
                            id="batchUsdcSwapFeePercentage"
                            placeholder="${DEFAULT_FEE_PERCENTAGE}"
                            step="1"
                            min="0"
                            max="100"
                            style="font-size: 0.9em;"
                        />
                        <small class="form-text text-muted">Leave empty for default (${DEFAULT_FEE_PERCENTAGE}%)</small>
                    </div>

                    <div class="form-group mb-3">
                        <label for="batchUsdcSwapFeeRecipient" style="font-size: 0.9em;">
                            <strong>Fee Recipient Address</strong>
                        </label>
                        <input
                            type="text"
                            class="form-control"
                            id="batchUsdcSwapFeeRecipient"
                            placeholder="${DEFAULT_FEE_RECIPIENT}"
                            style="font-size: 0.85em; font-family: monospace;"
                        />
                        <small class="form-text text-muted">Leave empty for default address</small>
                    </div>

                    <button
                        class="btn btn-sm btn-secondary btn-block"
                        id="batchUsdcSwapResetButton"
                    >
                        Reset to Defaults
                    </button>
                </div>
            </div>

            <button
                class="btn btn-primary btn-lg btn-block mb-3"
                id="batchUsdcSwapExecuteButton"
                disabled
            >
                Execute Batch Swap
            </button>

            <p class="info-text alert alert-secondary">
                Status: <span id="batchUsdcSwapStatus">Not executed</span>
            </p>

            <p class="info-text alert alert-secondary" style="word-break: break-all;">
                Batch ID: <span id="batchUsdcSwapBatchId">-</span>
            </p>

            <button
                class="btn btn-sm btn-info btn-block mb-3"
                id="batchUsdcSwapCheckStatusButton"
                disabled
            >
                Check Batch Status
            </button>

            <p class="info-text alert alert-danger" id="batchUsdcSwapErrorContainer" hidden>
                <span class="wrap" id="batchUsdcSwapError"></span>
            </p>
            </div>
        </div>
    </div>`,
  );

  const executeButton = document.getElementById('batchUsdcSwapExecuteButton');
  const statusDisplay = document.getElementById('batchUsdcSwapStatus');
  const batchIdDisplay = document.getElementById('batchUsdcSwapBatchId');
  const checkStatusButton = document.getElementById(
    'batchUsdcSwapCheckStatusButton',
  );
  const resetButton = document.getElementById('batchUsdcSwapResetButton');
  const usdcAmountInput = document.getElementById('batchUsdcSwapAmount');
  const feePercentageInput = document.getElementById(
    'batchUsdcSwapFeePercentage',
  );
  const feeRecipientInput = document.getElementById(
    'batchUsdcSwapFeeRecipient',
  );
  const displayUsdcAmount = document.getElementById('displayUsdcAmount');
  const displayFeePercentage = document.getElementById(
    'displayBatchFeePercentage',
  );
  const errorContainer = document.getElementById('batchUsdcSwapErrorContainer');
  const errorOutput = document.getElementById('batchUsdcSwapError');

  let currentBatchId = null;

  // Function to update the swap details display
  function updateSwapDetailsDisplay() {
    const config = getConfigValues();
    displayUsdcAmount.textContent = config.usdcAmountDisplay;
    displayFeePercentage.textContent = config.feePercentageDisplay;
  }

  // Add event listeners for input changes to update display
  usdcAmountInput.addEventListener('input', updateSwapDetailsDisplay);
  feePercentageInput.addEventListener('input', updateSwapDetailsDisplay);

  // Reset button handler
  resetButton.addEventListener('click', function () {
    usdcAmountInput.value = '';
    feePercentageInput.value = '';
    feeRecipientInput.value = '';
    updateSwapDetailsDisplay();
  });

  // Enable/disable based on network
  document.addEventListener('newChainIdInt', function (e) {
    executeButton.disabled = e.detail.chainIdInt !== 1;
  });

  document.addEventListener('globalConnectionChange', function (e) {
    if (e.detail.connected && globalContext.chainIdInt === 1) {
      executeButton.disabled = false;
    }
  });

  document.addEventListener('disableAndClear', function () {
    executeButton.disabled = true;
  });

  // Check status button handler
  checkStatusButton.onclick = () => {
    if (currentBatchId) {
      const requestIdInput = document.getElementById('eip5792RequestIdInput');
      if (requestIdInput) {
        requestIdInput.value = currentBatchId;
        // Optionally scroll to the status section
        requestIdInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  // Execute batch swap
  executeButton.onclick = async () => {
    try {
      statusDisplay.innerHTML = 'Building batch transaction...';
      errorContainer.hidden = true;
      errorOutput.innerHTML = '';

      // Get configuration values
      const config = getConfigValues();

      console.log('=== Batch USDC → ETH Swap ===');
      console.log('USDC Amount:', config.usdcAmount.toString());
      console.log('Fee Recipient:', config.feeRecipient);
      console.log('Fee %:', config.feeBips / 100, '%');

      // Build the batch calls
      const calls = buildBatchCalls(
        config.usdcAmount,
        config.feeRecipient,
        config.feeBips,
      );

      console.log('Batch calls:', calls);

      statusDisplay.innerHTML = 'Sending batch transaction...';

      // Send the batch using wallet_sendCalls
      const result = await globalContext.provider.request({
        method: 'wallet_sendCalls',
        params: [
          {
            version: EIP5792_VERSION,
            from: globalContext.accounts[0],
            chainId: `0x${globalContext.chainIdInt.toString(16)}`,
            atomicRequired: true,
            calls,
          },
        ],
      });

      console.log('Batch result:', result);

      currentBatchId = result.id;
      statusDisplay.innerHTML = 'Batch submitted successfully!';
      batchIdDisplay.innerHTML = currentBatchId;
      checkStatusButton.disabled = false;
    } catch (error) {
      console.error('Batch swap error:', error);
      statusDisplay.innerHTML = 'Error';
      errorContainer.hidden = false;
      errorOutput.innerHTML = `Error: ${error.message || 'Transaction failed'}`;
      batchIdDisplay.innerHTML = '-';
      checkStatusButton.disabled = true;
    }
  };
}
