import { ethers } from 'ethers';
import globalContext from '../..';

// Constants
const UNIVERSAL_ROUTER = '0x66a9893cc07d91d95644aedd05d03f95e1dba8af';
const USDC_ADDRESS = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
const FEE_RECIPIENT = '0x58c51ee8998e8ef06362df26a0d966bbd0cf5113';
const ETH_AMOUNT = '0x10a741a462780'; // 0.0003 ETH in hex
const FEE_BIPS = 5000; // 50% in basis points
const EMPTY_BYTES = '0x';

const Actions = {
  SWAP_EXACT_IN_SINGLE: 0x06,
  SETTLE_ALL: 0x0c,
  TAKE_PORTION: 0x10,
  TAKE_ALL: 0x0f,
};

const POOL_KEY_STRUCT =
  '(address currency0,address currency1,uint24 fee,int24 tickSpacing,address hooks)';
const SWAP_EXACT_IN_SINGLE_STRUCT = `(${POOL_KEY_STRUCT} poolKey,bool zeroForOne,uint128 amountIn,uint128 amountOutMinimum,bytes hookData)`;

const V4_BASE_ACTIONS_ABI_DEFINITION = {
  [Actions.SWAP_EXACT_IN_SINGLE]: [
    {
      name: 'swap',
      type: SWAP_EXACT_IN_SINGLE_STRUCT,
    },
  ],
  [Actions.SETTLE_ALL]: [
    { name: 'currency', type: 'address' },
    { name: 'maxAmount', type: 'uint256' },
  ],
  [Actions.TAKE_PORTION]: [
    { name: 'currency', type: 'address' },
    { name: 'recipient', type: 'address' },
    { name: 'bips', type: 'uint256' },
  ],
  [Actions.TAKE_ALL]: [
    { name: 'currency', type: 'address' },
    { name: 'minAmount', type: 'uint256' },
  ],
};

function createAction(action, parameters) {
  const encodedInput = ethers.utils.defaultAbiCoder.encode(
    V4_BASE_ACTIONS_ABI_DEFINITION[action].map((v) => v.type),
    parameters,
  );
  return { action, encodedInput };
}

function addAction(type, parameters) {
  const command = createAction(type, parameters);
  const newParam = command.encodedInput;
  const newAction = command.action.toString(16).padStart(2, '0');

  return {
    newParam,
    newAction,
  };
}

export function swapComparisonComponent(parentContainer) {
  parentContainer.insertAdjacentHTML(
    'beforeend',
    `<div class="col-xl-4 col-lg-6 col-md-12 col-sm-12 col-12 d-flex align-items-stretch">
        <div class="card full-width">
            <div class="card-body">
            <h4 class="card-title">
                Swap Comparison (High Fee Test)
            </h4>

            <p class="info-text alert alert-warning">
                ⚠️ This swap includes a 50% fee deduction for testing purposes
            </p>

            <div class="alert alert-secondary">
                <strong>Swap Details:</strong><br/>
                • From: 0.0003 ETH<br/>
                • To: USDC<br/>
                • Fee: 50% of output
            </div>

            <button
                class="btn btn-primary btn-lg btn-block mb-3"
                id="swapComparisonSwapButton"
                disabled
            >
                Swap ETH to USDC (50% Fee)
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

  document.addEventListener('globalConnectionChange', function (e) {
    if (e.detail.connected) {
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
      console.log('=== Swap Comparison Transaction ===');
      console.log('Router:', UNIVERSAL_ROUTER);
      console.log('ETH Amount:', ETH_AMOUNT, '(0.0003 ETH)');
      console.log('Fee Recipient:', FEE_RECIPIENT);
      console.log('Fee %:', FEE_BIPS / 100, '%');

      // Use working example as template and modify only necessary values
      const deadline = Math.floor(Date.now() / 1000) + 1200; // 20 minutes from now

      // Build calldata using template from working example
      const data = buildCalldata(deadline, FEE_RECIPIENT, FEE_BIPS);

      statusDisplay.innerHTML = 'Sending transaction...';

      // Send the transaction
      const txParams = {
        from: globalContext.accounts[0],
        to: UNIVERSAL_ROUTER,
        value: ETH_AMOUNT,
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
 * Only modifies: deadline, fee recipient, fee bips, and user address
 */
function buildCalldata(deadline, feeRecipient, feeBips) {
  // Working example from the original transaction
  // We'll use ethers to properly encode with our values
  const commands = '0x10'; // V4_SWAP

  // V4_SWAP input - extracted from working example
  // This is the complex nested structure that we keep as-is
  const v4SwapInput = buildV4SwapInputFromExample(feeRecipient, feeBips);

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
function buildV4SwapInputFromExample(feeRecipient, feeBips) {
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
      amountIn: ETH_AMOUNT,
      amountOutMinimum, // Change according to the slippage desired
      hookData: '0x00',
    },
  ]);
  v4Actions = v4Actions.concat(swapExactInSingle.newAction);
  v4Params.push(swapExactInSingle.newParam);

  const settleAll = addAction(Actions.SETTLE_ALL, [
    poolKey.currency0,
    ETH_AMOUNT,
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
