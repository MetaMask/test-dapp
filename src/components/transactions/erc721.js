import { recoverTypedSignature } from '@metamask/eth-sig-util';
import { toChecksumAddress } from 'ethereumjs-util';
import { splitSig } from '../../signatures/utils';
import globalContext from '../..';

export function erc721Component(parentContainer) {
  parentContainer.insertAdjacentHTML(
    'beforeend',
    `<div class="col-xl-4 col-lg-6 col-md-12 col-sm-12 col-12 d-flex align-items-stretch">
      <div class="card full-width">
        <div class="card-body">
          <h4 class="card-title">
            ERC 721
          </h4>

          <p class="info-text alert alert-success">
            Token(s): <span id="erc721TokenAddresses"></span>
          </p>

          <button
            class="btn btn-primary btn-lg btn-block mb-3"
            id="deployNFTsButton"
            disabled
          >
            Deploy
          </button>

          <div class="form-group">
            <label>Amount</label>
            <input
              class="form-control"
              type="number"
              id="mintAmountInput"
              value="1"
            />
          </div>

          <div class="form-group">
            <button
              class="btn btn-primary btn-lg btn-block mb-3"
              id="mintButton"
              disabled
            >
              Mint
            </button>
          </div>

          <div class="form-group">
            <label>Watch NFT</label>
            <input
              class="form-control"
              type="number"
              id="watchNFTInput"
              value="1"
            />
          </div>

          <div class="form-group">
            <button
              class="btn btn-primary btn-lg btn-block mb-3"
              id="watchNFTButton"
              disabled
            >
              Watch NFT
            </button>
          </div>

          <div class="form-group">
            <button
              class="btn btn-primary btn-lg btn-block mb-3"
              id="watchNFTsButton"
              disabled
            >
              Watch all NFTs
            </button>
          </div>

          <div class="form-group" id="watchNFTButtons">
          </div>

          <div class="form-group">
            <label>Approve Token</label>
            <input
              class="form-control"
              type="number"
              id="approveTokenInput"
              value="1"
            />
          </div>

          <div class="form-group">
            <button
              class="btn btn-primary btn-lg btn-block mb-3"
              id="approveButton"
              disabled
            >
              Approve
            </button>
          </div>

          <div class="form-group">
            <button
              class="btn btn-primary btn-lg btn-block mb-3"
              id="setApprovalForAllButton"
              disabled
            >
              Set Approval For All
            </button>
          </div>

          <div class="form-group">
            <button
              class="btn btn-primary btn-lg btn-block mb-3"
              id="revokeButton"
              disabled
            >
              Revoke
            </button>
          </div>

          <div class="form-group">
            <label>Transfer Token</label>
            <input
              class="form-control"
              type="number"
              id="transferTokenInput"
              value="1"
            />
          </div>

          <div class="form-group">
            <button
              class="btn btn-primary btn-lg btn-block mb-3"
              id="transferFromButton"
              disabled
            >
              Transfer From
            </button>
          </div>

          <div class="form-group">
            <label>NFT Permit</label>
            <button
              class="btn btn-primary btn-lg btn-block mb-3"
              id="sign721Permit"
              disabled
            >
              Sign
            </button>

            <p class="info-text alert alert-warning">
              Result:
              <span id="sign721PermitResult"></span>
              <p class="info-text alert alert-warning" id="sign721PermitResultR">r: </p>
              <p class="info-text alert alert-warning" id="sign721PermitResultS">s: </p>
              <p class="info-text alert alert-warning" id="sign721PermitResultV">v: </p>
            </p>

            <button
              class="btn btn-primary btn-lg btn-block mb-3"
              id="sign721PermitVerify"
              disabled
            >
              Verify
            </button>

            <p class="info-text alert alert-warning">
              Recovery result:
              <span id="sign721PermitVerifyResult"></span>
            </p>
          </div>

          <p class="info-text alert alert-secondary">
            ERC 721 methods result: <span id="nftsStatus"></span>
          </p>
        </div>
      </div>
    </div>`,
  );

  // NFTs Section
  const deployNFTsButton = document.getElementById('deployNFTsButton');
  const mintButton = document.getElementById('mintButton');
  const watchNFTsButton = document.getElementById('watchNFTsButton');
  const watchNFTButtons = document.getElementById('watchNFTButtons');

  const mintAmountInput = document.getElementById('mintAmountInput');
  const approveTokenInput = document.getElementById('approveTokenInput');
  const approveButton = document.getElementById('approveButton');
  const watchNFTInput = document.getElementById('watchNFTInput');
  const watchNFTButton = document.getElementById('watchNFTButton');
  const setApprovalForAllButton = document.getElementById(
    'setApprovalForAllButton',
  );
  const revokeButton = document.getElementById('revokeButton');
  const transferTokenInput = document.getElementById('transferTokenInput');
  const transferFromButton = document.getElementById('transferFromButton');
  const nftsStatus = document.getElementById('nftsStatus');
  const erc721TokenAddresses = document.getElementById('erc721TokenAddresses');
  // 721 Permit
  const sign721Permit = document.getElementById('sign721Permit');
  const sign721PermitResult = document.getElementById('sign721PermitResult');
  const sign721PermitResultR = document.getElementById('sign721PermitResultR');
  const sign721PermitResultS = document.getElementById('sign721PermitResultS');
  const sign721PermitResultV = document.getElementById('sign721PermitResultV');
  const sign721PermitVerify = document.getElementById('sign721PermitVerify');
  const sign721PermitVerifyResult = document.getElementById(
    'sign721PermitVerifyResult',
  );

  /**
   * ERC721 Token
   */

  let nftsContract;

  deployNFTsButton.onclick = async () => {
    nftsStatus.innerHTML = 'Deploying';

    try {
      nftsContract = await globalContext.nftsFactory.deploy();
      await nftsContract.deployTransaction.wait();
    } catch (error) {
      nftsStatus.innerHTML = 'Deployment Failed';
      throw error;
    }

    if (nftsContract.address === undefined) {
      return;
    }

    console.log(
      `Contract mined! address: ${nftsContract.address} transactionHash: ${nftsContract.deployTransaction.hash}`,
    );

    erc721TokenAddresses.innerHTML = erc721TokenAddresses.innerHTML
      .concat(', ', nftsContract.address)
      .split(', ')
      .filter(Boolean)
      .join(', ');

    nftsStatus.innerHTML = 'Deployed';
    mintButton.disabled = false;
    sign721Permit.disabled = false;
    mintAmountInput.disabled = false;
  };

  watchNFTsButton.onclick = async () => {
    const contract = nftsContract || globalContext.nftsContract;
    const currentTokenId = await contract.currentTokenId();
    const nftsContractAddress = contract.address;
    let watchNftsResult;
    try {
      watchNftsResult = await globalContext.provider.sendAsync(
        Array.from({ length: currentTokenId }, (_, i) => i + 1).map(
          (tokenId) => {
            return {
              method: 'wallet_watchAsset',
              params: {
                type: 'ERC721',
                options: {
                  address: nftsContractAddress,
                  tokenId: tokenId.toString(),
                },
              },
            };
          },
        ),
      );
    } catch (error) {
      console.error(error);
    }
    console.log(watchNftsResult);
  };

  mintButton.onclick = async () => {
    const contract = nftsContract || globalContext.nftsContract;
    nftsStatus.innerHTML = 'Mint initiated';
    let result = await contract.mintNFTs(mintAmountInput.value, {
      from: globalContext.accounts[0],
    });
    result = await result.wait();
    console.log(result);
    nftsStatus.innerHTML = 'Mint completed';
    approveTokenInput.disabled = false;
    approveButton.disabled = false;
    watchNFTInput.disabled = false;
    watchNFTButton.disabled = false;
    setApprovalForAllButton.disabled = false;
    revokeButton.disabled = false;
    transferTokenInput.disabled = false;
    transferFromButton.disabled = false;
    watchNFTsButton.disabled = false;
    watchNFTButtons.innerHTML = '';
  };

  sign721Permit.onclick = async () => {
    const from = globalContext.accounts[0];
    const msgParams = await getNFTMsgParams();
    console.log(msgParams);

    let sign;
    let r;
    let s;
    let v;

    try {
      sign = await globalContext.provider.request({
        method: 'eth_signTypedData_v4',
        params: [from, JSON.stringify(msgParams)],
      });
      const { _r, _s, _v } = splitSig(sign);
      r = `0x${_r.toString('hex')}`;
      s = `0x${_s.toString('hex')}`;
      v = _v.toString();

      sign721PermitResult.innerHTML = sign;
      sign721PermitResultR.innerHTML = `r: ${r}`;
      sign721PermitResultS.innerHTML = `s: ${s}`;
      sign721PermitResultV.innerHTML = `v: ${v}`;
      sign721PermitVerify.disabled = false;
    } catch (err) {
      console.error(err);
      sign721PermitResult.innerHTML = `Error: ${err.message}`;
    }
  };

  /**
   *  Sign Permit Verification
   */
  sign721PermitVerify.onclick = async () => {
    const from = globalContext.accounts[0];
    const msgParams = await getNFTMsgParams();

    try {
      const sign = sign721PermitResult.innerHTML;
      const recoveredAddr = recoverTypedSignature({
        data: msgParams,
        signature: sign,
        version: 'V4',
      });
      if (toChecksumAddress(recoveredAddr) === toChecksumAddress(from)) {
        console.log(`Successfully verified signer as ${recoveredAddr}`);
        sign721PermitVerifyResult.innerHTML = recoveredAddr;
      } else {
        console.log(
          `Failed to verify signer when comparing ${recoveredAddr} to ${from}`,
        );
      }
    } catch (err) {
      console.error(err);
      sign721PermitVerifyResult.innerHTML = `Error: ${err.message}`;
    }
  };

  watchNFTButton.onclick = async () => {
    const contract = nftsContract || globalContext.nftsContract;
    let watchNftsResult;
    try {
      watchNftsResult = await globalContext.provider.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC721',
          options: {
            address: contract.address,
            tokenId: watchNFTInput.value,
          },
        },
      });
    } catch (error) {
      console.error(error);
    }
    console.log(watchNftsResult);
  };

  approveButton.onclick = async () => {
    const contract = nftsContract || globalContext.nftsContract;
    nftsStatus.innerHTML = 'Approve initiated';
    let result = await contract.approve(
      '0x9bc5baF874d2DA8D216aE9f137804184EE5AfEF4',
      approveTokenInput.value,
      {
        from: globalContext.accounts[0],
      },
    );
    result = await result.wait();
    console.log(result);
    nftsStatus.innerHTML = 'Approve completed';
  };

  setApprovalForAllButton.onclick = async () => {
    nftsStatus.innerHTML = 'Set Approval For All initiated';
    const contract = nftsContract || globalContext.nftsContract;
    let result = await contract.setApprovalForAll(
      '0x9bc5baF874d2DA8D216aE9f137804184EE5AfEF4',
      true,
      {
        from: globalContext.accounts[0],
      },
    );
    result = await result.wait();
    console.log(result);
    nftsStatus.innerHTML = 'Set Approval For All completed';
  };

  revokeButton.onclick = async () => {
    nftsStatus.innerHTML = 'Revoke initiated';
    const contract = nftsContract || globalContext.nftsContract;
    let result = await contract.setApprovalForAll(
      '0x9bc5baF874d2DA8D216aE9f137804184EE5AfEF4',
      false,
      {
        from: globalContext.accounts[0],
      },
    );
    result = await result.wait();
    console.log(result);
    nftsStatus.innerHTML = 'Revoke completed';
  };

  transferFromButton.onclick = async () => {
    nftsStatus.innerHTML = 'Transfer From initiated';
    const contract = nftsContract || globalContext.nftsContract;
    let result = await contract.transferFrom(
      globalContext.accounts[0],
      '0x2f318C334780961FB129D2a6c30D0763d9a5C970',
      transferTokenInput.value,
      {
        from: globalContext.accounts[0],
      },
    );
    result = await result.wait();
    console.log(result);
    nftsStatus.innerHTML = 'Transfer From completed';
  };

  async function getNFTMsgParams() {
    const contract = nftsContract || globalContext.nftsContract;
    return {
      domain: {
        name: 'My NFT',
        version: '1',
        chainId: globalContext.chainIdInt,
        verifyingContract: contract.address,
      },
      types: {
        Permit: [
          { name: 'spender', type: 'address' },
          { name: 'tokenId', type: 'uint256' },
          { name: 'nonce', type: 'uint256' },
          { name: 'deadline', type: 'uint256' },
        ],
      },
      primaryType: 'Permit',
      message: {
        spender: '0x0521797E19b8E274E4ED3bFe5254FAf6fac96F08',
        tokenId: '3606393',
        nonce: '0',
        deadline: '1734995006',
      },
    };
  }
}
