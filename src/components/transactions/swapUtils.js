import { ethers } from 'ethers';

// ============================================================
// Constants
// ============================================================

// Token Addresses
export const USDC_ADDRESS = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
export const WETH_ADDRESS = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';

// Contract Addresses
export const PERMIT2_ADDRESS = '0x000000000022D473030F116dDEE9F6B43aC78BA3';
export const UNIVERSAL_ROUTER = '0x66a9893cc07d91d95644aedd05d03f95e1dba8af';
export const ROUTER_AS_RECIPIENT = '0x0000000000000000000000000000000000000002';

// Defaults
export const DEFAULT_FEE_RECIPIENT =
  '0x58c51ee8998e8ef06362df26a0d966bbd0cf5113';
export const DEFAULT_FEE_PERCENTAGE = 50; // 50%
export const EMPTY_BYTES = '0x';
export const EIP5792_VERSION = '2.0.0';

// Action Types
export const Actions = {
  SWAP_EXACT_IN_SINGLE: 0x06,
  SWAP_EXACT_IN: 0x07,
  SETTLE_ALL: 0x0c,
  TAKE: 0x0e,
  TAKE_ALL: 0x0f,
  TAKE_PORTION: 0x10,
};

// ============================================================
// ABI Type Definitions
// ============================================================

export const POOL_KEY_STRUCT =
  '(address currency0,address currency1,uint24 fee,int24 tickSpacing,address hooks)';

export const PATH_KEY_STRUCT =
  '(address intermediateCurrency,uint256 fee,int24 tickSpacing,address hooks,bytes hookData)';

export const SWAP_EXACT_IN_SINGLE_STRUCT = `(${POOL_KEY_STRUCT} poolKey,bool zeroForOne,uint128 amountIn,uint128 amountOutMinimum,bytes hookData)`;

export const SWAP_EXACT_IN_STRUCT = `(address currencyIn,${PATH_KEY_STRUCT}[] path,uint128 amountIn,uint128 amountOutMinimum)`;

export const V4_BASE_ACTIONS_ABI_DEFINITION = {
  [Actions.SWAP_EXACT_IN_SINGLE]: [
    {
      name: 'swap',
      type: SWAP_EXACT_IN_SINGLE_STRUCT,
    },
  ],
  [Actions.SWAP_EXACT_IN]: [
    {
      name: 'swap',
      type: SWAP_EXACT_IN_STRUCT,
    },
  ],
  [Actions.SETTLE_ALL]: [
    { name: 'currency', type: 'address' },
    { name: 'maxAmount', type: 'uint256' },
  ],
  [Actions.TAKE]: [
    { name: 'currency', type: 'address' },
    { name: 'recipient', type: 'address' },
    { name: 'amount', type: 'uint256' },
  ],
  [Actions.TAKE_ALL]: [
    { name: 'currency', type: 'address' },
    { name: 'minAmount', type: 'uint256' },
  ],
  [Actions.TAKE_PORTION]: [
    { name: 'currency', type: 'address' },
    { name: 'recipient', type: 'address' },
    { name: 'bips', type: 'uint256' },
  ],
};

// ============================================================
// Validation Helpers
// ============================================================

/**
 * Validates if a string is a valid Ethereum address
 * @param {string} address - Address to validate
 * @returns {boolean} True if valid address
 */
export function isValidAddress(address) {
  return ethers.utils.isAddress(address);
}

/**
 * Removes leading zeros from hex string
 * @param {string} hexString - Hex string to strip
 * @returns {string} Hex string without leading zeros
 */
export function stripLeadingZeros(hexString) {
  // Handle 0x0 or 0x00...0 -> return 0x0
  if (hexString === '0x' || /^0x0+$/u.test(hexString)) {
    return '0x0';
  }
  // Remove leading zeros: 0x0110d... -> 0x110d...
  return hexString.replace(/^0x0+/u, '0x');
}

// ============================================================
// Parsing Helpers
// ============================================================

/**
 * Parses USDC amount from user input
 * @param {string} input - User input string
 * @returns {ethers.BigNumber|null} Parsed amount in USDC units (6 decimals) or null if invalid
 */
export function parseUsdcAmount(input) {
  const value = input.trim();
  if (!value) {
    return null;
  }

  try {
    const parsed = parseFloat(value);
    if (isNaN(parsed) || parsed <= 0) {
      return null;
    }
    // USDC has 6 decimals
    const amountInWei = ethers.utils.parseUnits(value.toString(), 6);
    return amountInWei;
  } catch {
    return null;
  }
}

/**
 * Parses ETH amount from user input and returns as hex string
 * @param {string} input - User input string
 * @returns {string|null} Parsed amount as hex string or null if invalid
 */
export function parseEthAmount(input) {
  const value = input.trim();
  if (!value) {
    return null;
  }

  try {
    const parsed = parseFloat(value);
    if (isNaN(parsed) || parsed < 0) {
      return null;
    }
    // Convert ETH to wei and then to hex, stripping leading zeros
    return stripLeadingZeros(
      ethers.utils.parseEther(value.toString()).toHexString(),
    );
  } catch {
    return null;
  }
}

/**
 * Parses fee percentage from user input and converts to basis points
 * @param {string} input - User input string (0-100)
 * @returns {number|null} Fee in basis points (1% = 100 bips) or null if invalid
 */
export function parseFeePercentage(input) {
  const value = input.trim();
  if (!value) {
    return null;
  }

  try {
    const parsed = parseFloat(value);
    if (isNaN(parsed) || parsed < 0 || parsed > 100) {
      return null;
    }
    // Convert percentage to basis points (1% = 100 basis points)
    return Math.round(parsed * 100);
  } catch {
    return null;
  }
}

// ============================================================
// Action Builders
// ============================================================

/**
 * Creates an action with encoded parameters
 * @param {number} action - Action type from Actions enum
 * @param {Array} parameters - Array of parameters to encode
 * @returns {{action: number, encodedInput: string}} Action object with encoded input
 */
export function createAction(action, parameters) {
  const encodedInput = ethers.utils.defaultAbiCoder.encode(
    V4_BASE_ACTIONS_ABI_DEFINITION[action].map((v) => v.type),
    parameters,
  );
  return { action, encodedInput };
}

/**
 * Adds an action to the action list with proper encoding
 * @param {number} type - Action type from Actions enum
 * @param {Array} parameters - Array of parameters for the action
 * @returns {{newParam: string, newAction: string}} Encoded parameter and action hex
 */
export function addAction(type, parameters) {
  const command = createAction(type, parameters);
  const newParam = command.encodedInput;
  const newAction = command.action.toString(16).padStart(2, '0');

  return {
    newParam,
    newAction,
  };
}

// ============================================================
// Encoding Helpers
// ============================================================

/**
 * Encodes ERC20 approve function call
 * @param {string} spender - Spender address
 * @param {ethers.BigNumber|string} amount - Amount to approve
 * @returns {string} Encoded function call data
 */
export function encodeApprove(spender, amount) {
  const iface = new ethers.utils.Interface([
    'function approve(address spender, uint256 amount) returns (bool)',
  ]);
  return iface.encodeFunctionData('approve', [spender, amount]);
}

/**
 * Encodes Permit2 approve function call
 * @param {string} token - Token address
 * @param {string} spender - Spender address
 * @param {ethers.BigNumber|string} amount - Amount to approve (must fit in uint160)
 * @param {number} deadline - Expiration timestamp (must fit in uint48)
 * @returns {string} Encoded function call data
 */
export function encodePermit2Approve(token, spender, amount, deadline) {
  const iface = new ethers.utils.Interface([
    'function approve(address token, address spender, uint160 amount, uint48 expiration)',
  ]);

  // Ensure amount fits in uint160 and deadline fits in uint48
  const amount160 = ethers.BigNumber.from(amount);
  const deadline48 = ethers.BigNumber.from(deadline);

  return iface.encodeFunctionData('approve', [
    token,
    spender,
    amount160,
    deadline48,
  ]);
}
