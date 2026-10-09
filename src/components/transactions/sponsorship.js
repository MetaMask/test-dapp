import { ethers } from 'ethers';
import globalContext from '../..';
import {
  sponsorshipProbeAbi,
  sponsorshipProbeBytecode,
} from './sponsorship-probe';

// Cold SSTORE of a zero slot is 20,000, plus the cold-account access.
const GAS_PER_ITERATION = 22000;
const MAX_ITERATIONS = 500;

const probeInterface = new ethers.utils.Interface(sponsorshipProbeAbi);

export function sponsorshipComponent(parentContainer) {
  parentContainer.insertAdjacentHTML(
    'beforeend',
    `<div class="col-xl-4 col-lg-6 col-md-12 col-sm-12 col-12 d-flex align-items-stretch">
        <div class="card full-width">
            <div class="card-body">
            <h4 class="card-title">
                Paid by MetaMask
            </h4>
            <p class="info-text alert alert-secondary">
                Use on Monad with an upgraded account to test Gas Sponsorship.
            </p>

            <button
                class="btn btn-primary btn-lg btn-block mb-3"
                id="deploySponsorshipProbeButton"
                disabled
            >
                Deploy gas burner
            </button>

            <p class="info-text alert alert-secondary">
                Contract: <span id="sponsorshipAddress" style="word-break: break-all;">Not deployed</span>
            </p>

            <div class="form-group">
                <label for="sponsorshipIterations">
                    Storage writes (~22k gas each)
                </label>
                <input
                    class="form-control"
                    type="number"
                    id="sponsorshipIterations"
                    value="100"
                    min="1"
                    max="${MAX_ITERATIONS}"
                />
            </div>

            <button
                class="btn btn-primary btn-lg btn-block mb-3"
                id="burnGasButton"
                disabled
            >
                Burn gas
            </button>

            <p class="info-text alert alert-secondary">
                Status: <span id="sponsorshipStatus">Not clicked</span>
            </p>
            </div>
        </div>
    </div>`,
  );

  const deployButton = document.getElementById('deploySponsorshipProbeButton');
  const burnGasButton = document.getElementById('burnGasButton');
  const iterationsInput = document.getElementById('sponsorshipIterations');
  const contractAddress = document.getElementById('sponsorshipAddress');
  const status = document.getElementById('sponsorshipStatus');

  let probeContract;

  document.addEventListener('globalConnectionChange', (event) => {
    if (event.detail.connected) {
      deployButton.disabled = false;
    }
  });

  document.addEventListener('disableAndClear', () => {
    deployButton.disabled = true;
    burnGasButton.disabled = true;
    probeContract = undefined;
    contractAddress.innerHTML = 'Not deployed';
  });

  document.addEventListener('newChainIdInt', () => {
    if (!probeContract) {
      return;
    }
    probeContract = undefined;
    burnGasButton.disabled = true;
    contractAddress.innerHTML = 'Not deployed';
    status.innerHTML = 'Network changed. Deploy the gas burner again.';
  });

  const readIterations = () => {
    const iterations = Number.parseInt(iterationsInput.value, 10);
    if (
      !Number.isInteger(iterations) ||
      iterations < 1 ||
      iterations > MAX_ITERATIONS
    ) {
      throw new Error(
        `Iterations must be an integer from 1 to ${MAX_ITERATIONS}.`,
      );
    }
    return iterations;
  };

  deployButton.onclick = async () => {
    status.innerHTML = 'Deploying';
    burnGasButton.disabled = true;
    try {
      const factory = new ethers.ContractFactory(
        sponsorshipProbeAbi,
        sponsorshipProbeBytecode,
        globalContext.ethersProvider.getSigner(),
      );
      const deployed = await factory.deploy();
      await deployed.deployTransaction.wait();
      if (!deployed.address) {
        status.innerHTML = 'Deployment failed';
        burnGasButton.disabled = !probeContract;
        return;
      }

      probeContract = deployed;
      burnGasButton.disabled = false;
      contractAddress.innerHTML = deployed.address;
      status.innerHTML = 'Deployed';
      console.log(
        `Sponsorship probe mined at ${deployed.address} tx ${deployed.deployTransaction.hash}`,
      );
    } catch (error) {
      status.innerHTML = error.message || 'Deployment failed';
      burnGasButton.disabled = !probeContract;
      console.log('error', error);
      throw error;
    }
  };

  burnGasButton.onclick = async () => {
    try {
      if (!probeContract) {
        throw new Error('Deploy the gas burner first.');
      }
      const iterations = readIterations();
      const approximateGas = iterations * GAS_PER_ITERATION;
      status.innerHTML = `Waiting for confirmation. About ${approximateGas} gas, no gas limit on the request.`;
      const txHash = await globalContext.provider.request({
        method: 'eth_sendTransaction',
        params: [
          {
            from: globalContext.accounts[0],
            to: probeContract.address,
            data: probeInterface.encodeFunctionData('burn', [iterations]),
          },
        ],
      });
      status.innerHTML = `Submitted ${txHash}. About ${approximateGas} gas was executed. Compare gasUsed on the explorer.`;
      console.log('burn gas', txHash);
    } catch (error) {
      status.innerHTML = error.message || 'Burn failed';
      console.log('error', error);
      throw error;
    }
  };
}
