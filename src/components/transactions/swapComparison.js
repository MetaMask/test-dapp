import { ethers } from 'ethers';
import globalContext from '../..';
import {
  UNIVERSAL_ROUTER,
  USDC_ADDRESS,
  DEFAULT_FEE_RECIPIENT,
  DEFAULT_FEE_PERCENTAGE,
  EMPTY_BYTES,
  Actions,
  isValidAddress,
  parseEthAmount,
  parseFeePercentage,
  stripLeadingZeros,
  addAction,
} from './swapUtils';

// Comparison-specific constants
const DEFAULT_ETH_AMOUNT = '0.0003'; // 0.0003 ETH

// Helper function to get configuration values from UI
function getConfigValues() {
  const feeRecipientElement = document.getElementById('feeRecipientInput');
  const ethAmountElement = document.getElementById('ethAmountInput');
  const feePercentageElement = document.getElementById('feePercentageInput');

  const feeRecipientInput = feeRecipientElement
    ? feeRecipientElement.value.trim()
    : '';
  const ethAmountInput = ethAmountElement ? ethAmountElement.value.trim() : '';
  const feePercentageInput = feePercentageElement
    ? feePercentageElement.value.trim()
    : '';

  // Use defaults if inputs are empty or invalid
  const feeRecipient =
    feeRecipientInput && isValidAddress(feeRecipientInput)
      ? feeRecipientInput
      : DEFAULT_FEE_RECIPIENT;

  const ethAmountHex =
    parseEthAmount(ethAmountInput) ||
    stripLeadingZeros(
      ethers.utils.parseEther(DEFAULT_ETH_AMOUNT).toHexString(),
    );

  const feeBips =
    parseFeePercentage(feePercentageInput) || DEFAULT_FEE_PERCENTAGE * 100;

  return {
    feeRecipient,
    ethAmountHex,
    feeBips,
    ethAmountDisplay: ethAmountInput || DEFAULT_ETH_AMOUNT,
    feePercentageDisplay:
      feePercentageInput || DEFAULT_FEE_PERCENTAGE.toString(),
  };
}

export function swapComparisonComponent(parentContainer) {
  parentContainer.insertAdjacentHTML(
    'beforeend',
    `<div class="col-xl-4 col-lg-6 col-md-12 col-sm-12 col-12 d-flex align-items-stretch">
        <div class="card full-width">
            <div class="card-body">
            <h4 class="card-title">
                Swap Comparison (High Fee Test - Mainnet only)
            </h4>

            <p class="info-text alert alert-warning">
                ⚠️ This swap includes a high fee for testing purposes
            </p>

            <div class="alert alert-secondary">
                <strong>Current Swap Details:</strong><br/>
                <span id="swapDetailsDisplay">
                • From: <span id="displayEthAmount">${DEFAULT_ETH_AMOUNT}</span> ETH<br/>
                • To: USDC<br/>
                • Fee: <span id="displayFeePercentage">${DEFAULT_FEE_PERCENTAGE}</span>% of output
                </span>
            </div>

            <!-- Configuration Section -->
            <div class="card mb-3" style="background-color: #f8f9fa;">
                <div class="card-body">
                    <h6 class="card-subtitle mb-3 text-muted">
                        <strong>Configuration (Optional)</strong>
                    </h6>

                    <div class="form-group mb-3">
                        <label for="ethAmountInput" style="font-size: 0.9em;">
                            <strong>ETH Amount</strong>
                        </label>
                        <input
                            type="number"
                            class="form-control"
                            id="ethAmountInput"
                            placeholder="${DEFAULT_ETH_AMOUNT}"
                            step="0.0001"
                            min="0"
                            style="font-size: 0.9em;"
                        />
                        <small class="form-text text-muted">Leave empty for default (${DEFAULT_ETH_AMOUNT} ETH)</small>
                    </div>

                    <div class="form-group mb-3">
                        <label for="feePercentageInput" style="font-size: 0.9em;">
                            <strong>Fee Percentage</strong>
                        </label>
                        <input
                            type="number"
                            class="form-control"
                            id="feePercentageInput"
                            placeholder="${DEFAULT_FEE_PERCENTAGE}"
                            step="1"
                            min="0"
                            max="100"
                            style="font-size: 0.9em;"
                        />
                        <small class="form-text text-muted">Leave empty for default (${DEFAULT_FEE_PERCENTAGE}%)</small>
                    </div>

                    <div class="form-group mb-3">
                        <label for="feeRecipientInput" style="font-size: 0.9em;">
                            <strong>Fee Recipient Address</strong>
                        </label>
                        <input
                            type="text"
                            class="form-control"
                            id="feeRecipientInput"
                            placeholder="${DEFAULT_FEE_RECIPIENT}"
                            style="font-size: 0.85em; font-family: monospace;"
                        />
                        <small class="form-text text-muted">Leave empty for default address</small>
                    </div>

                    <button
                        class="btn btn-sm btn-secondary btn-block"
                        id="resetConfigButton"
                    >
                        Reset to Defaults
                    </button>
                </div>
            </div>

            <button
                class="btn btn-primary btn-lg btn-block mb-3"
                id="swapComparisonSwapButton"
                disabled
            >
                Swap ETH to USDC
            </button>

            <p class="info-text alert alert-secondary">
                Status: <span id="swapStatus">Not executed</span>
            </p>

            <p class="info-text alert alert-secondary" style="word-break: break-all;">
                Transaction Hash: <span id="swapTxHash">-</span>
            </p>
            </div>
        </div>
    </div>`,
  );

  const swapButton = document.getElementById('swapComparisonSwapButton');
  const statusDisplay = document.getElementById('swapStatus');
  const txHashDisplay = document.getElementById('swapTxHash');
  const resetButton = document.getElementById('resetConfigButton');
  const ethAmountInput = document.getElementById('ethAmountInput');
  const feePercentageInput = document.getElementById('feePercentageInput');
  const feeRecipientInput = document.getElementById('feeRecipientInput');
  const displayEthAmount = document.getElementById('displayEthAmount');
  const displayFeePercentage = document.getElementById('displayFeePercentage');

  // Function to update the swap details display
  function updateSwapDetailsDisplay() {
    const config = getConfigValues();
    displayEthAmount.textContent = config.ethAmountDisplay;
    displayFeePercentage.textContent = config.feePercentageDisplay;
  }

  // Add event listeners for input changes to update display
  ethAmountInput.addEventListener('input', updateSwapDetailsDisplay);
  feePercentageInput.addEventListener('input', updateSwapDetailsDisplay);

  // Reset button handler
  resetButton.addEventListener('click', function () {
    ethAmountInput.value = '';
    feePercentageInput.value = '';
    feeRecipientInput.value = '';
    updateSwapDetailsDisplay();
  });

  document.addEventListener('newChainIdInt', function (e) {
    swapButton.disabled = e.detail.chainIdInt !== 1;
  });

  document.addEventListener('globalConnectionChange', function (e) {
    if (e.detail.connected && globalContext.chainIdInt === 1) {
      swapButton.disabled = false;
    }
  });

  document.addEventListener('disableAndClear', function () {
    swapButton.disabled = true;
  });

  /**
   * Build Swap Comparison transaction using working example as template
   */
  swapButton.onclick = async () => {
    try {
      statusDisplay.innerHTML = 'Building transaction...';

      // Get configuration values from inputs or use defaults
      const config = getConfigValues();

      console.log('=== Swap Comparison Transaction ===');
      console.log('Router:', UNIVERSAL_ROUTER);
      console.log(
        'ETH Amount:',
        config.ethAmountHex,
        `(${config.ethAmountDisplay} ETH)`,
      );
      console.log('Fee Recipient:', config.feeRecipient);
      console.log('Fee %:', config.feeBips / 100, '%');

      // Use working example as template and modify only necessary values
      const deadline = Math.floor(Date.now() / 1000) + 1200; // 20 minutes from now

      // Build calldata using template from working example
      const data = buildCalldata(
        deadline,
        config.feeRecipient,
        config.feeBips,
        config.ethAmountHex,
      );

      statusDisplay.innerHTML = 'Sending transaction...';

      // Send the transaction
      const txParams = {
        from: globalContext.accounts[0],
        to: UNIVERSAL_ROUTER,
        value: config.ethAmountHex,
        data,
      };

      console.log('Transaction params:', txParams);

      const txHash = await globalContext.provider.request({
        method: 'eth_sendTransaction',
        params: [txParams],
      });

      console.log('Transaction sent! Hash:', txHash);
      statusDisplay.innerHTML = 'Transaction sent!';
      txHashDisplay.innerHTML = txHash;
    } catch (error) {
      console.error('swap error:', error);
      statusDisplay.innerHTML = `Error: ${
        error.message || 'Transaction failed'
      }`;
      txHashDisplay.innerHTML = '-';
    }
  };
}

/**
 * Build calldata using the working example as a template
 * Only modifies: deadline, fee recipient, fee bips, eth amount, and user address
 */
function buildCalldata(deadline, feeRecipient, feeBips, ethAmount) {
  // Working example from the original transaction
  // We'll use ethers to properly encode with our values
  const commands = '0x10'; // V4_SWAP

  // V4_SWAP input - extracted from working example
  // This is the complex nested structure that we keep as-is
  const v4SwapInput = buildV4SwapInputFromExample(
    feeRecipient,
    feeBips,
    ethAmount,
  );

  // Encode the execute function call
  const inputs = [v4SwapInput]; //, payPortionInput, sweepInput];

  const iface = new ethers.utils.Interface([
    'function execute(bytes commands, bytes[] inputs, uint256 deadline)',
  ]);

  const calldata = iface.encodeFunctionData('execute', [
    commands,
    inputs,
    deadline,
  ]);

  return calldata;
}

/**
 * Build V4_SWAP input from working example structure
 * This uses the exact structure from a known working transaction
 */
function buildV4SwapInputFromExample(feeRecipient, feeBips, ethAmount) {
  // From working example: actions = 0x070b0e
  let v4Actions = EMPTY_BYTES;
  const v4Params = [];

  // Build the 3 params from the working example structure
  // These encode the pool configuration and swap parameters

  // Param 1: Pool key and swap amount configuration
  // Structure from example: complex nested data for the V4 pool
  const poolKey = {
    currency0: ethers.constants.AddressZero, // currency0 (ETH)
    currency1: USDC_ADDRESS, // currency1 (USDC)
    fee: 500,
    tickSpacing: 10,
    hooks: '0x0000000000000000000000000000000000000000',
  };
  const amountOutMinimum = '0x0';
  const swapExactInSingle = addAction(Actions.SWAP_EXACT_IN_SINGLE, [
    {
      poolKey,
      zeroForOne: true, // The direction of swap is ETH to USDC. Change it to 'false' for the reverse direction
      amountIn: ethAmount,
      amountOutMinimum, // Change according to the slippage desired
      hookData: '0x00',
    },
  ]);
  v4Actions = v4Actions.concat(swapExactInSingle.newAction);
  v4Params.push(swapExactInSingle.newParam);

  const settleAll = addAction(Actions.SETTLE_ALL, [
    poolKey.currency0,
    ethAmount,
  ]);
  v4Actions = v4Actions.concat(settleAll.newAction);
  v4Params.push(settleAll.newParam);

  const takePortion = addAction(Actions.TAKE_PORTION, [
    poolKey.currency1,
    feeRecipient,
    feeBips,
  ]);
  v4Actions = v4Actions.concat(takePortion.newAction);
  v4Params.push(takePortion.newParam);

  const takeAll = addAction(Actions.TAKE_ALL, [
    poolKey.currency1,
    amountOutMinimum,
  ]);
  v4Actions = v4Actions.concat(takeAll.newAction);
  v4Params.push(takeAll.newParam);

  // Encode the V4_SWAP input: (bytes actions, bytes[] params)
  const v4SwapInput = ethers.utils.defaultAbiCoder.encode(
    ['bytes', 'bytes[]'],
    [v4Actions, v4Params],
  );

  return v4SwapInput;
}
