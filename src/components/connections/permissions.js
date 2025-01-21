import { getPermissionsDisplayString } from '../../utils';
import globalContext from '../..';

export function permissionsComponent(parentContainer) {
  parentContainer.insertAdjacentHTML(
    'beforeend',
    `<div class="col-xl-4 col-lg-6 col-md-12 col-sm-12 col-12">
      <div class="card">
        <div class="card-body">
          <h4 class="card-title">
            Permissions Actions
          </h4>

          <button
            class="btn btn-primary btn-lg btn-block mb-3"
            id="requestPermissions"
          >
            Request Permissions
          </button>

          <button
            class="btn btn-primary btn-lg btn-block mb-3"
            id="getPermissions"
          >
            Get Permissions
          </button>
          <button
            class="btn btn-primary btn-lg btn-block mb-3"
            id="revokeAccountsPermission"
          >
            Revoke Accounts Permission
          </button>

          <p class="info-text alert alert-secondary">
            Permissions result: <span id="permissionsResult"></span>
          </p>
        </div>
      </div>
    </div>`,
  );

  const requestPermissions = document.getElementById('requestPermissions');
  const getPermissions = document.getElementById('getPermissions');
  const revokeAccountsPermission = document.getElementById(
    'revokeAccountsPermission',
  );
  const permissionsResult = document.getElementById('permissionsResult');

  document.addEventListener('disableAndClear', function () {
    permissionsResult.innerText = '';
  });

  requestPermissions.onclick = async () => {
    try {
      const permissionsArray = await globalContext.provider.request({
        method: 'wallet_requestPermissions',
        params: [{ eth_accounts: {} }],
      });
      permissionsResult.innerHTML =
        getPermissionsDisplayString(permissionsArray);
    } catch (err) {
      console.error(err);
      permissionsResult.innerHTML = `Error: ${err.message}`;
    }
  };

  getPermissions.onclick = async () => {
    try {
      const permissionsArray = await globalContext.provider.request({
        method: 'wallet_getPermissions',
      });
      permissionsResult.innerHTML =
        getPermissionsDisplayString(permissionsArray);
    } catch (err) {
      console.error(err);
      permissionsResult.innerHTML = `Error: ${err.message}`;
    }
  };

  revokeAccountsPermission.onclick = async () => {
    try {
      await globalContext.provider.request({
        method: 'wallet_revokePermissions',
        params: [
          {
            eth_accounts: {},
          },
        ],
      });
    } catch (err) {
      permissionsResult.innerHTML = `${err.message}`;
    }
  };
}
