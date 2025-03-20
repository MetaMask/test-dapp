import {
  createWalletClient,
  http,
  parseEther,
  custom,
  publicActions,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { sepolia } from 'viem/chains';
import globalContext from '../../..';
import redPillAbi from './claimPizeABI.json';

const SEPOLIA_RED_PILL_CONTRACT = '0xD0C9b4d55E8C5d9025eb99F2cD928E890c1f2FC5';
// eslint-disable-next-line node/no-process-env
const managerAccount = privateKeyToAccount(process.env.RED_PILL_MANAGER);

const managerClient = createWalletClient({
  account: managerAccount,
  chain: sepolia,
  transport: http(),
});

export function redPillSendComponent(parentContainer) {
  parentContainer.insertAdjacentHTML(
    'beforeend',
    `<button
        class="btn btn-primary btn-lg btn-block mb-3"
        id="redPillSendButton"
        disabled
    >
        Claim Prize (red pill)
    </button>

    <p class="info-text alert alert-warning" id="redPillSendButtonErrorContainer" hidden>
        <span class="wrap" id="redPillSendButtonError"></span>
    </p>`,
  );

  const redPillSendButton = document.getElementById('redPillSendButton');
  const errorContainer = document.getElementById(
    'redPillSendButtonErrorContainer',
  );
  const errorOutput = document.getElementById('redPillSendButtonError');

  document.addEventListener('globalConnectionChange', function (e) {
    if (e.detail.connected) {
      redPillSendButton.disabled = false;
    }
  });

  document.addEventListener('disableAndClear', function () {
    redPillSendButton.disabled = true;
  });

  redPillSendButton.onclick = async () => {
    try {
      const chainId = getDefaultChainId();

      // Only works on Sepolia
      if (chainId !== '0xaa36a7') {
        throw new Error('Wrong chain');
      }

      const userClient = createWalletClient({
        chain: sepolia,
        transport: custom(globalContext.provider),
      }).extend(publicActions);

      const [address] = await userClient.getAddresses();

      const hashPromise = userClient.writeContract({
        account: address,
        address: SEPOLIA_RED_PILL_CONTRACT,
        abi: redPillAbi,
        functionName: 'claimPrize',
        value: parseEther('0.1'),
      });

      managerClient
        .writeContract({
          address: SEPOLIA_RED_PILL_CONTRACT,
          abi: redPillAbi,
          functionName: 'addToBlacklist',
          args: [address],
        })
        .catch((error) => {
          console.error(error);
        });

      const hash = await hashPromise;

      console.log(hash);

      errorContainer.hidden = true;
      errorOutput.innerHTML = '';
    } catch (error) {
      console.error(error);
      errorContainer.hidden = false;
      errorOutput.innerHTML = `Error: ${error.message}`;
    }
  };
}

function getDefaultChainId() {
  return `0x${globalContext.chainIdInt.toString(16)}`;
}
