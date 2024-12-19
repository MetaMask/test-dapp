import globalContext from '../..';

export function erc20Component(parentContainer) {
  parentContainer.insertAdjacentHTML(
    'beforeend',
    `<div class="col-xl-4 col-lg-6 col-md-12 col-sm-12 col-12 d-flex align-items-stretch">
      <div class="card full-width">
        <div class="card-body">
          <h4 class="card-title">
            ERC 20
          </h4>

          <p class="info-text alert alert-success">
            Token(s): <span id="erc20TokenAddresses"></span>
          </p>

          <div class="form-group">
            <label>Token Decimals</label>
            <input
              class="form-control"
              type="number"
              id="tokenDecimals"
              value="4"
              max="18"
              min="0"
            />
          </div>

          <button
            class="btn btn-primary btn-lg btn-block mb-3"
            id="createToken"
            disabled
          >
            Create Token
          </button>

          <button
            class="btn btn-primary btn-lg btn-block mb-3"
            id="watchAssets"
            disabled
          >
            Add Token(s) to Wallet
          </button>

          <button
            class="btn btn-primary btn-lg btn-block mb-3"
            id="transferTokens"
            disabled
          >
            Transfer Tokens
          </button>

          <a
            id="transferTokensDeeplink"
          >
            <button
            class="btn btn-warning btn-lg btn-block mb-3 text-dark"
            >
            (Mobile) Transfer Tokens with Deeplink
            </button>
          </a>

          <hr />
          <div class="form-group">
            <label>Approve to Address</label>
            <input
              class="form-control"
              id="approveTo"
              value="0x9bc5baF874d2DA8D216aE9f137804184EE5AfEF4"
            />
          </div>

          <button
            class="btn btn-primary btn-lg btn-block mb-3"
            id="approveTokens"
            disabled
          >
            Approve Tokens
          </button>
          <a
            id="approveTokensDeeplink"
          >
            <button
            class="btn btn-warning btn-lg btn-block mb-3 text-dark"
            >
            (Mobile) Approve Tokens with Deeplink
            </button>
          </a>

          <button
            class="btn btn-primary btn-lg btn-block mb-3"
            id="increaseTokenAllowance"
            disabled
          >
            Increase Token Allowance
          </button>

          <hr />
          <div class="form-group">
            <label>Owner Address</label>
            <input
              class="form-control"
              id="allowanceOwner"
            />
          </div>

          <div class="form-group">
            <label>Spender Address</label>
            <input
              class="form-control"
              id="allowanceSpender"
            />
          </div>
          <button
            class="btn btn-primary btn-lg btn-block mb-3"
            id="getAllowance"
            disabled
          >
            Get Allowance
          </button>
          <p class="info-text alert alert-secondary">
            Allowance amount: <span id="allowanceAmountResult"></span>
          </p>
          <hr />
          <div class="form-group">
            <label>Transfer From</label>
            <input
              class="form-control"
              id="transferFromSenderInput"
            />
          </div>

          <div class="form-group">
            <label>Transfer To</label>
            <input
              class="form-control"
              id="transferFromRecipientInput"
            />
          </div>
          <button
            class="btn btn-primary btn-lg btn-block mb-3"
            id="transferFromTokens"
            disabled
          >
            Transfer From Tokens
          </button>
          <hr />
          <button
            class="btn btn-primary btn-lg btn-block mb-3"
            id="transferTokensWithoutGas"
            disabled
          >
            Transfer Tokens Without Gas
          </button>

          <button
            class="btn btn-primary btn-lg btn-block mb-3"
            id="approveTokensWithoutGas"
            disabled
          >
            Approve Tokens Without Gas
          </button>

          <p class="info-text alert alert-secondary">
            ERC 20 methods result: <span id="tokenMethodsResult"></span>
          </p>
        </div>
      </div>
    </div>`,
  );

  const erc20TokenAddresses = document.getElementById('erc20TokenAddresses');
  const createToken = document.getElementById('createToken');
  const watchAssets = document.getElementById('watchAssets');
  const transferTokens = document.getElementById('transferTokens');
  const transferFromTokens = document.getElementById('transferFromTokens');
  const transferTokensDeeplink = document.getElementById(
    'transferTokensDeeplink',
  );
  const approveTokens = document.getElementById('approveTokens');
  const approveTokensDeeplink = document.getElementById(
    'approveTokensDeeplink',
  );
  const increaseTokenAllowance = document.getElementById(
    'increaseTokenAllowance',
  );
  const allowanceOwnerInput = document.getElementById('allowanceOwner');
  const allowanceSpenderInput = document.getElementById('allowanceSpender');
  const allowanceAmountResult = document.getElementById(
    'allowanceAmountResult',
  );
  const getAllowance = document.getElementById('getAllowance');
  const transferTokensWithoutGas = document.getElementById(
    'transferTokensWithoutGas',
  );
  const approveTokensWithoutGas = document.getElementById(
    'approveTokensWithoutGas',
  );

  const tokenMethodsResult = document.getElementById('tokenMethodsResult');
  const decimalUnitsInput = document.getElementById('tokenDecimals');
  const approveTokensToInput = document.getElementById('approveTo');
  const transferFromSenderInput = document.getElementById(
    'transferFromSenderInput',
  );
  const transferFromRecipientInput = document.getElementById(
    'transferFromRecipientInput',
  );
  const tokenSymbol = 'TST';

  transferTokensDeeplink.href = `https://metamask.app.link/send/${globalContext.deployedContractAddress}/transfer?address=0x2f318C334780961FB129D2a6c30D0763d9a5C970&uint256=4e${globalContext.tokenDecimals}`;
  approveTokensDeeplink.href = `https://metamask.app.link/approve/${globalContext.deployedContractAddress}/approve?address=0x178e3e6c9f547A00E33150F7104427ea02cfc747&uint256=3e${globalContext.tokenDecimals}`;

  document.addEventListener('globalConnectionChange', function (e) {
    if (e.detail.connected) {
      // MetaMask is connected, enable the button
      createToken.disabled = false; 
      decimalUnitsInput.disabled = false; 
    }
  });

  /**
   * ERC20 Token
   */

  let hstContract;
  createToken.onclick = async () => {
    const _initialAmount = 10;
    const _tokenName = 'TST';

    try {
      hstContract = await globalContext.hstFactory.deploy(
        _initialAmount,
        _tokenName,
        decimalUnitsInput.value,
        tokenSymbol,
      );
      await hstContract.deployTransaction.wait();
    } catch (error) {
      erc20TokenAddresses.innerHTML = 'Creation Failed';
      throw error;
    }

    if (hstContract.address === undefined) {
      return;
    }

    console.log(
      `Contract mined! address: ${hstContract.address} transactionHash: ${hstContract.deployTransaction.hash}`,
    );
    erc20TokenAddresses.innerHTML = erc20TokenAddresses.innerHTML
      .concat(', ', hstContract.address)
      .split(', ')
      .filter(Boolean)
      .join(', ');
    watchAssets.disabled = false;
    transferTokens.disabled = false;
    transferFromTokens.disabled = false;
    approveTokens.disabled = false;
    increaseTokenAllowance.disabled = false;
    allowanceOwnerInput.disabled = false;
    allowanceSpenderInput.disabled = false;
    allowanceAmountResult.disabled = false;
    getAllowance.disabled = false;
    transferTokensWithoutGas.disabled = false;
    approveTokensWithoutGas.disabled = false;
    approveTokensToInput.disabled = false;
    transferFromSenderInput.disabled = false;
    transferFromRecipientInput.disabled = false;
  };

  watchAssets.onclick = async () => {
    const contractAddresses = erc20TokenAddresses.innerHTML.split(', ');

    const promises = contractAddresses.map((erc20Address) => {
      return globalContext.provider.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address: erc20Address,
            symbol: tokenSymbol,
            decimals: decimalUnitsInput.value,
            image: 'https://metamask.github.io/test-dapp/metamask-fox.svg',
          },
        },
      });
    });

    Promise.all(promises).then((result) => {
      console.log('result', result);
    });
  };

  transferTokens.onclick = async () => {
    const contract = hstContract || globalContext.hstContract;
    const result = await contract.transfer(
      '0x2f318C334780961FB129D2a6c30D0763d9a5C970',
      decimalUnitsInput.value === '0'
        ? 1
        : `${1.5 * 10 ** decimalUnitsInput.value}`,
      { from: globalContext.accounts[0] },
    );
    console.log('result', result);
  };

  approveTokens.onclick = async () => {
    const contract = hstContract || globalContext.hstContract;
    const result = await contract.approve(
      approveTokensToInput.value,
      `${7 * 10 ** decimalUnitsInput.value}`,
      { from: globalContext.accounts[0] },
    );
    console.log('result', result);
  };

  increaseTokenAllowance.onclick = async () => {
    const contract = hstContract || globalContext.hstContract;
    const result = await contract.increaseAllowance(
      approveTokensToInput.value,
      `${1 * 10 ** decimalUnitsInput.value}`,
      { from: globalContext.accounts[0] },
    );
    console.log('result', result);
  };

  getAllowance.onclick = async () => {
    const contract = hstContract || globalContext.hstContract;
    const result = await contract.allowance(
      allowanceOwnerInput.value,
      allowanceSpenderInput.value,
      { from: globalContext.accounts[0] },
    );
    const allowance = result.toNumber() / 10 ** decimalUnitsInput.value;
    allowanceAmountResult.innerHTML = allowance.toFixed(
      decimalUnitsInput.value,
    );
  };

  transferFromTokens.onclick = async () => {
    try {
      const contract = hstContract || globalContext.hstContract;
      const result = await contract.transferFrom(
        transferFromSenderInput.value,
        transferFromRecipientInput.value,
        decimalUnitsInput.value === '0'
          ? 1
          : `${1.5 * 10 ** decimalUnitsInput.value}`,
        { from: globalContext.accounts[0] },
      );
      console.log('result', result);
      tokenMethodsResult.innerHTML = result;
    } catch (error) {
      tokenMethodsResult.innerHTML = `${error.message}`;
    }
  };

  transferTokensWithoutGas.onclick = async () => {
    const contract = hstContract || globalContext.hstContract;
    const result = await contract.transfer(
      '0x2f318C334780961FB129D2a6c30D0763d9a5C970',
      decimalUnitsInput.value === '0'
        ? 1
        : `${1.5 * 10 ** decimalUnitsInput.value}`,
      {
        gasPrice: '20000000000',
      },
    );
    console.log('result', result);
  };

  approveTokensWithoutGas.onclick = async () => {
    const contract = hstContract || globalContext.hstContract;
    const result = await contract.approve(
      '0x2f318C334780961FB129D2a6c30D0763d9a5C970',
      `${7 * 10 ** decimalUnitsInput.value}`,
      {
        gasPrice: '20000000000',
      },
    );
    console.log('result', result);
  };
}
