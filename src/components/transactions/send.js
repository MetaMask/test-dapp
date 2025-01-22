import globalContext from '../..';
import Constants from '../../constants.json';

const { heavyCallData } = Constants;

export function sendComponent(parentContainer) {
  parentContainer.insertAdjacentHTML(
    'beforeend',
    `<div class="col-xl-4 col-lg-6 col-md-12 col-sm-12 col-12 d-flex align-items-stretch">
        <div class="card full-width">
            <div class="card-body">
            <h4 class="card-title">
                Send Eth
            </h4>

            <button
                class="btn btn-primary btn-lg btn-block mb-3"
                id="sendButton"
                disabled
            >
                Send
            </button>

            <button
                class="btn btn-primary btn-lg btn-block mb-3"
                id="sendEIP1559Button"
                disabled
                hidden
            >
                Send EIP 1559 Transaction
            </button>
            <button
                class="btn btn-primary btn-lg btn-block mb-3"
                id="sendEIP1559WithoutGasButton"
                disabled
                hidden
            >
                Send EIP 1559 Without Gas
            </button>
            <a
                id="sendDeeplinkButton"
            >
                <button
                class="btn btn-warning btn-lg btn-block mb-3 text-dark"
                >
                (Mobile) Send with Deeplink
                </button>
            </a>
            <hr />
            <h4 class="card-title">
                Piggy bank contract
            </h4>

            <button
                class="btn btn-primary btn-lg btn-block mb-3"
                id="deployButton"
                disabled
            >
                Deploy Contract
            </button>

            <button
                class="btn btn-primary btn-lg btn-block mb-3"
                id="depositButton"
                disabled
            >
                Deposit
            </button>

            <button
                class="btn btn-primary btn-lg btn-block mb-3"
                id="withdrawButton"
                disabled
            >
                Withdraw
            </button>

            <p class="info-text alert alert-secondary">
                Contract Status: <span id="contractStatus">Not clicked</span>
            </p>
            <hr />
            <h4 class="card-title">
                Failing contract
            </h4>

            <button
                class="btn btn-primary btn-lg btn-block mb-3"
                id="deployFailingButton"
                disabled

            >
                Deploy Failing Contract
            </button>

            <button
                class="btn btn-primary btn-lg btn-block mb-3"
                id="sendFailingButton"
                disabled
            >
                Send Failing Transaction
            </button>

            <p class="info-text alert alert-secondary">
                Failing Contract Status: <span id="failingContractStatus">Not clicked</span>
            </p>
            <hr />
            <h4 class="card-title">
                Multisig contract
            </h4>

            <button
                class="btn btn-primary btn-lg btn-block mb-3"
                id="deployMultisigButton"
                disabled

            >
                Deploy Multisig Contract
            </button>

            <button
                class="btn btn-primary btn-lg btn-block mb-3"
                id="sendMultisigButton"
                disabled
            >
                Send ETH to Multisig Address
            </button>

            <p class="info-text alert alert-secondary">
                Multisig Contract Status: <span id="multisigContractStatus">Not clicked</span>
            </p>
            <hr />
            <div class="contract-interaction-section">
                <h4 class="card-title">Heavy Hex Data</h4>
                <button
                    class="btn btn-primary btn-lg btn-block mb-3"
                    id="sendHeavyHexDataButton"
                    disabled
                >
                    Send with heavy hex data
                </button>
            </div>
            </div>
        </div>
    </div>`,
  );

  const sendButton = document.getElementById('sendButton');
  const sendEIP1559Button = document.getElementById('sendEIP1559Button');
  const sendEIP1559WithoutGasButton = document.getElementById(
    'sendEIP1559WithoutGasButton',
  );
  const sendDeeplinkButton = document.getElementById('sendDeeplinkButton');
  const deployButton = document.getElementById('deployButton');
  const depositButton = document.getElementById('depositButton');
  const withdrawButton = document.getElementById('withdrawButton');
  const contractStatus = document.getElementById('contractStatus');
  const deployFailingButton = document.getElementById('deployFailingButton');
  const sendFailingButton = document.getElementById('sendFailingButton');
  const failingContractStatus = document.getElementById(
    'failingContractStatus',
  );
  const deployMultisigButton = document.getElementById('deployMultisigButton');
  const sendMultisigButton = document.getElementById('sendMultisigButton');
  const multisigContractStatus = document.getElementById(
    'multisigContractStatus',
  );
  const sendHeavyHexDataButton = document.getElementById(
    'sendHeavyHexDataButton',
  );

  sendDeeplinkButton.href =
    'https://metamask.app.link/send/0x0c54FcCd2e384b4BB6f2E405Bf5Cbc15a017AaFb?value=0';

  document.addEventListener('globalConnectionChange', function (e) {
    if (e.detail.connected) {
      // MetaMask is connected, enable the button
      sendButton.disabled = false;
      deployButton.disabled = false;
      deployFailingButton.disabled = false;
      deployMultisigButton.disabled = false;
      sendHeavyHexDataButton.disabled = false;
    }
  });

  document.addEventListener('disableAndClear', function () {
    sendButton.disabled = true;
    deployButton.disabled = true;
    depositButton.disabled = true;
    withdrawButton.disabled = true;
    deployFailingButton.disabled = true;
    sendFailingButton.disabled = true;
    deployMultisigButton.disabled = true;
    sendMultisigButton.disabled = true;
    sendHeavyHexDataButton.disabled = true;
  });

  document.addEventListener('contractIsDeployed', function () {
    // Piggy bank contract
    contractStatus.innerHTML = 'Deployed';
    depositButton.disabled = false;
    withdrawButton.disabled = false;
    // Failing contract
    failingContractStatus.innerHTML = 'Deployed';
    sendFailingButton.disabled = false;
    // Multisig contract
    multisigContractStatus.innerHTML = 'Deployed';
    sendMultisigButton.disabled = false;
    // Heavy calldata
    sendHeavyHexDataButton.disabled = false;
  });

  document.addEventListener('blockBaseFeePerGasUpdate', function (e) {
    if (e.detail.supported) {
      sendEIP1559Button.disabled = false;
      sendEIP1559Button.hidden = false;
      sendEIP1559WithoutGasButton.disabled = false;
      sendEIP1559WithoutGasButton.hidden = false;
      sendButton.innerText = 'Send Legacy Transaction';
    } else {
      sendEIP1559Button.disabled = true;
      sendEIP1559Button.hidden = true;
      sendEIP1559WithoutGasButton.disabled = true;
      sendEIP1559WithoutGasButton.hidden = true;
      sendButton.innerText = 'Send';
    }
  });

  /**
   * Sending ETH
   */

  sendButton.onclick = async () => {
    const result = await globalContext.provider.request({
      method: 'eth_sendTransaction',
      params: [
        {
          from: globalContext.accounts[0],
          to: '0x0c54FcCd2e384b4BB6f2E405Bf5Cbc15a017AaFb',
          value: '0x0',
          gasLimit: '0x5208',
          gasPrice: '0x2540be400',
          type: '0x0',
        },
      ],
    });
    console.log(result);
  };

  sendEIP1559Button.onclick = async () => {
    const result = await globalContext.provider.request({
      method: 'eth_sendTransaction',
      params: [
        {
          from: globalContext.accounts[0],
          to: '0x0c54FcCd2e384b4BB6f2E405Bf5Cbc15a017AaFb',
          value: '0x0',
          gasLimit: '0x5028',
          maxFeePerGas: '0x2540be400',
          maxPriorityFeePerGas: '0x3b9aca00',
        },
      ],
    });
    console.log(result);
  };

  sendEIP1559WithoutGasButton.onclick = async () => {
    const result = await globalContext.provider.request({
      method: 'eth_sendTransaction',
      params: [
        {
          from: globalContext.accounts[0],
          to: '0x0c54FcCd2e384b4BB6f2E405Bf5Cbc15a017AaFb',
          value: '0x0',
        },
      ],
    });
    console.log(result);
  };

  /**
   * Piggy bank
   */
  let piggybankContract;

  deployButton.onclick = async () => {
    contractStatus.innerHTML = 'Deploying';
    try {
      piggybankContract = await globalContext.piggybankFactory.deploy();
      await piggybankContract.deployTransaction.wait();
    } catch (error) {
      contractStatus.innerHTML = 'Deployment Failed';
      throw error;
    }

    console.log(piggybankContract.address);
    if (piggybankContract.address === undefined) {
      return;
    }

    console.log(
      `Contract mined! address: ${piggybankContract.address} transactionHash: ${piggybankContract.deployTransaction.hash}`,
    );
    contractStatus.innerHTML = 'Deployed';
    depositButton.disabled = false;
    withdrawButton.disabled = false;
  };

  depositButton.onclick = async () => {
    contractStatus.innerHTML = 'Deposit initiated';
    const contract = piggybankContract || globalContext.piggybankContract;
    const result = await contract.deposit({
      from: globalContext.accounts[0],
      value: '0x3782dace9d900000',
    });
    console.log(result);
    const receipt = await result.wait();
    console.log(receipt);
    contractStatus.innerHTML = 'Deposit completed';
  };

  withdrawButton.onclick = async () => {
    const contract = piggybankContract || globalContext.piggybankContract;
    const result = await contract.withdraw('0xde0b6b3a7640000', {
      from: globalContext.accounts[0],
    });
    console.log(result);
    const receipt = await result.wait();
    console.log(receipt);
    contractStatus.innerHTML = 'Withdrawn';
  };

  /**
   * Failing
   */

  let failingContract;
  deployFailingButton.onclick = async () => {
    failingContractStatus.innerHTML = 'Deploying';

    try {
      failingContract = await globalContext.failingContractFactory.deploy();
      await failingContract.deployTransaction.wait();
    } catch (error) {
      failingContractStatus.innerHTML = 'Deployment Failed';
      throw error;
    }

    if (failingContract.address === undefined) {
      return;
    }

    console.log(
      `Contract mined! address: ${failingContract.address} transactionHash: ${failingContract.deployTransaction.hash}`,
    );
    failingContractStatus.innerHTML = 'Deployed';
    sendFailingButton.disabled = false;
  };

  sendFailingButton.onclick = async () => {
    try {
      const contract = failingContract || globalContext.failingContract;
      const result = await globalContext.provider.request({
        method: 'eth_sendTransaction',
        params: [
          {
            from: globalContext.accounts[0],
            to: contract.address,
            value: '0x0',
            gasLimit: '0x5028',
            maxFeePerGas: '0x2540be400',
            maxPriorityFeePerGas: '0x3b9aca00',
          },
        ],
      });
      failingContractStatus.innerHTML =
        'Failed transaction process completed as expected.';
      console.log('send failing contract result', result);
    } catch (error) {
      console.log('error', error);
      throw error;
    }
  };

  /**
   * Multisig
   */

  let multisigContract;
  deployMultisigButton.onclick = async () => {
    multisigContractStatus.innerHTML = 'Deploying';
    try {
      multisigContract = await globalContext.multisigFactory.deploy();
      await multisigContract.deployTransaction.wait();
    } catch (error) {
      multisigContractStatus.innerHTML = 'Deployment Failed';
      throw error;
    }

    if (multisigContract.address === undefined) {
      return;
    }

    console.log(
      `Contract mined! address: ${multisigContract.address} transactionHash: ${multisigContract.deployTransaction.hash}`,
    );
    multisigContractStatus.innerHTML = 'Deployed';
    sendMultisigButton.disabled = false;
  };

  sendMultisigButton.onclick = async () => {
    try {
      const contract = multisigContract || globalContext.multisigContract;
      const result = await globalContext.provider.request({
        method: 'eth_sendTransaction',
        params: [
          {
            from: globalContext.accounts[0],
            to: contract.address,
            value: '0x16345785D8A0', // 24414062500000
            gasLimit: '0x5028',
            maxFeePerGas: '0x2540be400',
            maxPriorityFeePerGas: '0x3b9aca00',
          },
        ],
      });
      multisigContractStatus.innerHTML = 'Transaction completed as expected.';
      console.log('send multisig contract result', result);
    } catch (error) {
      console.log('error', error);
      throw error;
    }
  };

  sendHeavyHexDataButton.onclick = async () => {
    try {
      const result = await globalContext.provider.request({
        method: 'eth_sendTransaction',
        params: [
          {
            from: globalContext.accounts[0],
            to: '0x0000000000000000000000000000000000000000',
            data: heavyCallData,
          },
        ],
      });
      console.log('Transaction completed as expected.', result);
    } catch (error) {
      console.log('Error sending transaction', error);
      throw error;
    }
  };
}
