import globalContext from '../..';

export const siwe = document.getElementById('siwe');
export const siweResources = document.getElementById('siweResources');
export const siweBadDomain = document.getElementById('siweBadDomain');
export const siweBadAccount = document.getElementById('siweBadAccount');
export const siweMalformed = document.getElementById('siweMalformed');
export const siweResult = document.getElementById('siweResult');

export function siweComponent(parentContainer) {
  parentContainer.insertAdjacentHTML(
    'beforeend',
    `<div class="col-xl-4 col-lg-6 col-md-12 col-sm-12 col-12 d-flex align-items-stretch" >
      <div class="card full-width">
        <div class="card-body">
          <h4>
            Sign In With Ethereum
          </h4>

          <button
            class="btn btn-primary btn-lg btn-block mb-3"
            id="siwe"
            disabled
          >
          Sign In With Ethereum
          </button>
          <button
            class="btn btn-primary btn-lg btn-block mb-3"
            id="siweResources"
            disabled
          >
          Sign In With Ethereum (w/ Resources)
          </button>

          <button
            class="btn btn-primary btn-lg btn-block mb-3"
            id="siweBadDomain"
            disabled
          >
          Sign In With Ethereum (Bad Domain)
          </button>

          <button
            class="btn btn-primary btn-lg btn-block mb-3"
            id="siweBadAccount"
            disabled
          >
          Sign In With Ethereum (Bad Account)
          </button>

          <button
            class="btn btn-primary btn-lg btn-block mb-3"
            id="siweMalformed"
            disabled
          >
          Sign In With Ethereum (Malformed)
          </button>

          <p class="info-text alert alert-warning">
            Result:
            <span id="siweResult"></span>
          </p>
        </div>
      </div>
    </div>`,
  );

  /**
   * Sign In With Ethereum helper
   */

  const siweSign = async (siweMessage) => {
    try {
      const from = globalContext.accounts[0];
      const msg = `0x${Buffer.from(siweMessage, 'utf8').toString('hex')}`;
      const sign = await globalContext.provider.request({
        method: 'personal_sign',
        params: [msg, from, 'Example password'],
      });
      siweResult.innerHTML = sign;
    } catch (err) {
      console.error(err);
      siweResult.innerHTML = `Error: ${err.message}`;
    }
  };

  /**
   * Sign In With Ethereum
   */
  siwe.onclick = async () => {
    const domain = window.location.host;
    const from = globalContext.accounts[0];
    const siweMessage = `${domain} wants you to sign in with your Ethereum account:\n${from}\n\nI accept the MetaMask Terms of Service: https://community.metamask.io/tos\n\nURI: https://${domain}\nVersion: 1\nChain ID: 1\nNonce: 32891757\nIssued At: 2021-09-30T16:25:24.000Z`;
    siweSign(siweMessage);
  };

  /**
   * Sign In With Ethereum (with Resources)
   */
  siweResources.onclick = async () => {
    const domain = window.location.host;
    const from = globalContext.accounts[0];
    const siweMessageResources = `${domain} wants you to sign in with your Ethereum account:\n${from}\n\nI accept the MetaMask Terms of Service: https://community.metamask.io/tos\n\nURI: https://${domain}\nVersion: 1\nChain ID: 1\nNonce: 32891757\nIssued At: 2021-09-30T16:25:24.000Z\nNot Before: 2022-03-17T12:45:13.610Z\nRequest ID: some_id\nResources:\n- ipfs://Qme7ss3ARVgxv6rXqVPiikMJ8u2NLgmgszg13pYrDKEoiu\n- https://example.com/my-web2-claim.json`;
    siweSign(siweMessageResources);
  };

  /**
   * Sign In With Ethereum (Bad Domain)
   */
  siweBadDomain.onclick = async () => {
    const domain = 'metamask.badactor.io';
    const from = globalContext.accounts[0];
    const siweMessageBadDomain = `${domain} wants you to sign in with your Ethereum account:\n${from}\n\nI accept the MetaMask Terms of Service: https://community.metamask.io/tos\n\nURI: https://${domain}\nVersion: 1\nChain ID: 1\nNonce: 32891757\nIssued At: 2021-09-30T16:25:24.000Z\nResources:\n- ipfs://Qme7ss3ARVgxv6rXqVPiikMJ8u2NLgmgszg13pYrDKEoiu\n- https://example.com/my-web2-claim.json`;
    siweSign(siweMessageBadDomain);
  };

  /**
   * Sign In With Ethereum (Bad Account)
   */
  siweBadAccount.onclick = async () => {
    const domain = window.location.host;
    const from = '0x0000000000000000000000000000000000000000';
    const siweMessageBadAccount = `${domain} wants you to sign in with your Ethereum account:\n${from}\n\nI accept the MetaMask Terms of Service: https://community.metamask.io/tos\n\nURI: https://${domain}\nVersion: 1\nChain ID: 1\nNonce: 32891757\nIssued At: 2021-09-30T16:25:24.000Z\nResources:\n- ipfs://Qme7ss3ARVgxv6rXqVPiikMJ8u2NLgmgszg13pYrDKEoiu\n- https://example.com/my-web2-claim.json`;
    siweSign(siweMessageBadAccount);
  };

  /**
   * Sign In With Ethereum (Malformed)
   */
  siweMalformed.onclick = async () => {
    const domain = window.location.host;
    const from = globalContext.accounts[0];
    const siweMessageMissing = `${domain} wants you to sign in with your Ethereum account:\n${from}\n\nI accept the MetaMask Terms of Service: https://community.metamask.io/tos\n\nVersion: 1\nNonce: 32891757\nIssued At: 2021-09-30T16:25:24Z`;
    siweSign(siweMessageMissing);
  };
}
