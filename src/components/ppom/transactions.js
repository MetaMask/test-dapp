import globalContext from '../..';
import { maliciousAddress } from '../../sample-addresses';
import { isSepoliaNetworkId } from '../../utils';
import { getMaliciousTransactions } from './sharedConstants';

export function ppomMaliciousTransactionsAndSignatures(parentContainer) {
  parentContainer.insertAdjacentHTML(
    'beforeend',
    `<div
      class="col-xl-4 col-lg-6 col-md-12 col-sm-12 col-12 d-flex align-items-stretch"
    >
      <div class="card full-width">
        <div class="card-body">
          <h4 class="card-title">
            PPOM - Malicious Transactions and Signatures
          </h4>
          <p>We know we are vulnerable if any of these Transactions/Signatures are not flagged as Malicious</p>
          <h5>Transactions</h5>
          <button
            class="btn btn-primary btn-lg btn-block mb-3"
            id="maliciousRawEthButton"
            disabled
          >
            Malicious Eth Transfer
          </button>
          <button
          class="btn btn-primary btn-lg btn-block mb-3"
          id="mintSepoliaERC20"
          hidden
        >
          Mint ERC20
        </button>
          <button
            class="btn btn-primary btn-lg btn-block mb-3"
            id="maliciousERC20TransferButton"
            disabled
            title="This will only be flagged if you have some ERC20 balance"
          >
            Malicious ERC20 Transfer (USDC)
          </button>
          <button
            class="btn btn-primary btn-lg btn-block mb-3"
            id="maliciousApprovalButton"
            disabled
          >
            Malicious ERC20 Approval (BUSD)
          </button>
          <button
            class="btn btn-primary btn-lg btn-block mb-3"
            id="maliciousSetApprovalForAll"
            disabled
          >
            Malicious Set Approval For All
          </button>
          <button
            class="btn btn-primary btn-lg btn-block mb-3"
            id="maliciousContractInteractionButton"
            disabled
          >
            Malicious Contract Interaction
          </button>
          <h5>Signatures</h5>
          <button
            class="btn btn-primary btn-lg btn-block mb-3"
            id="maliciousPermit"
            disabled
          >
            Malicious Permit
          </button>
          <button
            class="btn btn-primary btn-lg btn-block mb-3"
            id="maliciousTradeOrder"
            disabled
          >
            Malicious Trade Order
          </button>
          <button
            class="btn btn-primary btn-lg btn-block mb-3"
            id="maliciousSeaport"
            disabled
          >
            Malicious Seaport
          </button>
        </div>
      </div>
    </div>`,
  );

  const maliciousRawEthButton = document.getElementById(
    'maliciousRawEthButton',
  );
  const mintSepoliaERC20 = document.getElementById('mintSepoliaERC20');
  const maliciousERC20TransferButton = document.getElementById(
    'maliciousERC20TransferButton',
  );
  const maliciousApprovalButton = document.getElementById(
    'maliciousApprovalButton',
  );
  const maliciousContractInteractionButton = document.getElementById(
    'maliciousContractInteractionButton',
  );
  const maliciousSetApprovalForAll = document.getElementById(
    'maliciousSetApprovalForAll',
  );
  const maliciousPermit = document.getElementById('maliciousPermit');
  const maliciousTradeOrder = document.getElementById('maliciousTradeOrder');
  const maliciousSeaport = document.getElementById('maliciousSeaport');

  document.addEventListener('globalConnectionChange', function (e) {
    if (e.detail.connected) {
      // MetaMask is connected, enable the button
      maliciousRawEthButton.disabled = false;
      mintSepoliaERC20.disabled = false;
      maliciousERC20TransferButton.disabled = false;
      maliciousApprovalButton.disabled = false;
      maliciousContractInteractionButton.disabled = false;
      maliciousSetApprovalForAll.disabled = false;
      maliciousPermit.disabled = false;
      maliciousTradeOrder.disabled = false;
      maliciousSeaport.disabled = false;
    }
  });

  document.addEventListener('disableAndClear', function () {
    maliciousRawEthButton.disabled = true;
    mintSepoliaERC20.disabled = true;
    maliciousERC20TransferButton.disabled = true;
    maliciousApprovalButton.disabled = true;
    maliciousContractInteractionButton.disabled = true;
    maliciousSetApprovalForAll.disabled = true;
    maliciousPermit.disabled = true;
    maliciousTradeOrder.disabled = true;
    maliciousSeaport.disabled = true;
  });

  document.addEventListener('newNetwork', function (e) {
    mintSepoliaERC20.hidden = !isSepoliaNetworkId(e.detail.networkId);
  });

  // Malicious raw ETH transfer
  maliciousRawEthButton.onclick = async () => {
    const { eth } = getMaliciousTransactions(globalContext);
    const result = await globalContext.provider.request({
      method: 'eth_sendTransaction',
      params: [
        {
          from: globalContext.accounts[0],
          ...eth,
        },
      ],
    });
    console.log(result);
  };

  /**
   *  PPOM
   */

  // Mint ERC20 in Sepolia
  mintSepoliaERC20.onclick = async () => {
    const from = globalContext.accounts[0];
    const noPrefixedAddress = from.slice(2);
    const result = await globalContext.provider.request({
      method: 'eth_sendTransaction',
      params: [
        {
          from,
          to: '0x27A56df30bC838BCA36141E517e7b5376dea68eE',
          value: '0x0',
          data: `0x40c10f19000000000000000000000000${noPrefixedAddress}000000000000000000000000000000000000000000000000000000001dcd6500`,
        },
      ],
    });
    console.log(result);
  };

  // Malicious ERC20 transfer
  maliciousERC20TransferButton.onclick = async () => {
    const { erc20Transfer } = getMaliciousTransactions(globalContext);
    const result = await globalContext.provider.request({
      method: 'eth_sendTransaction',
      params: [
        {
          from: globalContext.accounts[0],
          ...erc20Transfer,
        },
      ],
    });
    console.log(result);
  };

  // Malicious ERC20 Approval
  maliciousApprovalButton.onclick = async () => {
    const { erc20Approval } = getMaliciousTransactions(globalContext);
    const result = await globalContext.provider.request({
      method: 'eth_sendTransaction',
      params: [
        {
          from: globalContext.accounts[0],
          ...erc20Approval,
        },
      ],
    });
    console.log(result);
  };

  // Malicious Contract interaction
  maliciousContractInteractionButton.onclick = async () => {
    const { maliciousContractInteraction } =
      getMaliciousTransactions(globalContext);

    const result = await globalContext.provider.request({
      method: 'eth_sendTransaction',
      params: [
        {
          from: globalContext.accounts[0],
          ...maliciousContractInteraction,
        },
      ],
    });
    console.log(result);
  };

  // Malicious Set Approval For All
  maliciousSetApprovalForAll.onclick = async () => {
    const { setApprovalForAll } = getMaliciousTransactions(globalContext);

    const result = await globalContext.provider.request({
      method: 'eth_sendTransaction',
      params: [
        {
          from: globalContext.accounts[0],
          ...setApprovalForAll,
        },
      ],
    });
    console.log(result);
  };

  // Malicious permit
  maliciousPermit.onclick = async () => {
    const result = await globalContext.provider.request({
      method: 'eth_signTypedData_v4',
      params: [
        globalContext.accounts[0],
        `{"types":{"EIP712Domain":[{"name":"name","type":"string"},{"name":"version","type":"string"},{"name":"chainId","type":"uint256"},{"name":"verifyingContract","type":"address"}],"Permit":[{"name":"owner","type":"address"},{"name":"spender","type":"address"},{"name":"value","type":"uint256"},{"name":"nonce","type":"uint256"},{"name":"deadline","type":"uint256"}]},"primaryType":"Permit","domain":{"name":"USD Coin","verifyingContract":"0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48","chainId":${globalContext.chainIdInt},"version":"2"},"message":{"owner":"${globalContext.accounts[0]}","spender":"0x1661F1B207629e4F385DA89cFF535C8E5Eb23Ee3","value":"1033366316628","nonce":1,"deadline":1678709555}}`,
      ],
    });
    console.log(result);
  };

  // Malicious trade order
  maliciousTradeOrder.onclick = async () => {
    const result = await globalContext.provider.request({
      method: 'eth_signTypedData_v4',
      params: [
        globalContext.accounts[0],
        `{"types":{"ERC721Order":[{"type":"uint8","name":"direction"},{"type":"address","name":"maker"},{"type":"address","name":"taker"},{"type":"uint256","name":"expiry"},{"type":"uint256","name":"nonce"},{"type":"address","name":"erc20Token"},{"type":"uint256","name":"erc20TokenAmount"},{"type":"Fee[]","name":"fees"},{"type":"address","name":"erc721Token"},{"type":"uint256","name":"erc721TokenId"},{"type":"Property[]","name":"erc721TokenProperties"}],"Fee":[{"type":"address","name":"recipient"},{"type":"uint256","name":"amount"},{"type":"bytes","name":"feeData"}],"Property":[{"type":"address","name":"propertyValidator"},{"type":"bytes","name":"propertyData"}],"EIP712Domain":[{"name":"name","type":"string"},{"name":"version","type":"string"},{"name":"chainId","type":"uint256"},{"name":"verifyingContract","type":"address"}]},"domain":{"name":"ZeroEx","version":"1.0.0","chainId":"${globalContext.chainIdInt}","verifyingContract":"0xdef1c0ded9bec7f1a1670819833240f027b25eff"},"primaryType":"ERC721Order","message":{"direction":"0","maker":"${globalContext.accounts[0]}","taker":"${maliciousAddress}","expiry":"2524604400","nonce":"100131415900000000000000000000000000000083840314483690155566137712510085002484","erc20Token":"0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2","erc20TokenAmount":"42000000000000","fees":[],"erc721Token":"0x8a90CAb2b38dba80c64b7734e58Ee1dB38B8992e","erc721TokenId":"2516","erc721TokenProperties":[]}}`,
      ],
    });
    console.log(result);
  };

  // Malicious Seaport
  maliciousSeaport.onclick = async () => {
    const result = await globalContext.provider.request({
      method: 'eth_signTypedData_v4',
      params: [
        globalContext.accounts[0],
        `{"types":{"OrderComponents":[{"name":"offerer","type":"address"},{"name":"zone","type":"address"},{"name":"offer","type":"OfferItem[]"},{"name":"consideration","type":"ConsiderationItem[]"},{"name":"orderType","type":"uint8"},{"name":"startTime","type":"uint256"},{"name":"endTime","type":"uint256"},{"name":"zoneHash","type":"bytes32"},{"name":"salt","type":"uint256"},{"name":"conduitKey","type":"bytes32"},{"name":"counter","type":"uint256"}],"OfferItem":[{"name":"itemType","type":"uint8"},{"name":"token","type":"address"},{"name":"identifierOrCriteria","type":"uint256"},{"name":"startAmount","type":"uint256"},{"name":"endAmount","type":"uint256"}],"ConsiderationItem":[{"name":"itemType","type":"uint8"},{"name":"token","type":"address"},{"name":"identifierOrCriteria","type":"uint256"},{"name":"startAmount","type":"uint256"},{"name":"endAmount","type":"uint256"},{"name":"recipient","type":"address"}],"EIP712Domain":[{"name":"name","type":"string"},{"name":"version","type":"string"},{"name":"chainId","type":"uint256"},{"name":"verifyingContract","type":"address"}]},"domain":{"name":"Seaport","version":"1.1","chainId":${globalContext.chainIdInt},"verifyingContract":"0x00000000006c3852cbef3e08e8df289169ede581"},"primaryType":"OrderComponents","message":{"offerer":"0x5a6f5477bdeb7801ba137a9f0dc39c0599bac994","zone":"0x004c00500000ad104d7dbd00e3ae0a5c00560c00","offer":[{"itemType":"2","token":"0x60e4d786628fea6478f785a6d7e704777c86a7c6","identifierOrCriteria":"26464","startAmount":"1","endAmount":"1"},{"itemType":"2","token":"0x60e4d786628fea6478f785a6d7e704777c86a7c6","identifierOrCriteria":"7779","startAmount":"1","endAmount":"1"},{"itemType":"2","token":"0x60e4d786628fea6478f785a6d7e704777c86a7c6","identifierOrCriteria":"4770","startAmount":"1","endAmount":"1"},{"itemType":"2","token":"0xba30e5f9bb24caa003e9f2f0497ad287fdf95623","identifierOrCriteria":"9594","startAmount":"1","endAmount":"1"},{"itemType":"2","token":"0xba30e5f9bb24caa003e9f2f0497ad287fdf95623","identifierOrCriteria":"2118","startAmount":"1","endAmount":"1"},{"itemType":"2","token":"0xba30e5f9bb24caa003e9f2f0497ad287fdf95623","identifierOrCriteria":"1753","startAmount":"1","endAmount":"1"}],"consideration":[{"itemType":"2","token":"0x60e4d786628fea6478f785a6d7e704777c86a7c6","identifierOrCriteria":"26464","startAmount":"1","endAmount":"1","recipient":"0xdfdc0b1cf8e9950d6a860af6501c4fecf7825cc1"},{"itemType":"2","token":"0x60e4d786628fea6478f785a6d7e704777c86a7c6","identifierOrCriteria":"7779","startAmount":"1","endAmount":"1","recipient":"0xdfdc0b1cf8e9950d6a860af6501c4fecf7825cc1"},{"itemType":"2","token":"0x60e4d786628fea6478f785a6d7e704777c86a7c6","identifierOrCriteria":"4770","startAmount":"1","endAmount":"1","recipient":"0xdfdc0b1cf8e9950d6a860af6501c4fecf7825cc1"},{"itemType":"2","token":"0xba30e5f9bb24caa003e9f2f0497ad287fdf95623","identifierOrCriteria":"9594","startAmount":"1","endAmount":"1","recipient":"0xdfdc0b1cf8e9950d6a860af6501c4fecf7825cc1"},{"itemType":"2","token":"0xba30e5f9bb24caa003e9f2f0497ad287fdf95623","identifierOrCriteria":"2118","startAmount":"1","endAmount":"1","recipient":"0xdfdc0b1cf8e9950d6a860af6501c4fecf7825cc1"},{"itemType":"2","token":"0xba30e5f9bb24caa003e9f2f0497ad287fdf95623","identifierOrCriteria":"1753","startAmount":"1","endAmount":"1","recipient":"0xdfdc0b1cf8e9950d6a860af6501c4fecf7825cc1"}],"orderType":"2","startTime":"1681810415","endTime":"1681983215","zoneHash":"0x0000000000000000000000000000000000000000000000000000000000000000","salt":"1550213294656772168494388599483486699884316127427085531712538817979596","conduitKey":"0x0000007b02230091a7ed01230072f7006a004d60a8d4e71d599b8104250f0000","counter":"0"}}`,
      ],
    });
    console.log(result);
  };
}
