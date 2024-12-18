import { stringifiableToHex } from '../../utils';
import { encrypt } from '@metamask/eth-sig-util';
import globalContext from '../..';

export function encryptDecryptComponent(parentContainer) {
  parentContainer.insertAdjacentHTML(
    'beforeend',
    `<div class="row d-flex justify-content-center">
      <div class="col-xl-4 col-lg-6 col-md-12 col-sm-12 col-12">
        <div class="card">
          <div class="card-body">
            <h4 class="card-title">
              Encrypt / Decrypt
            </h4>

            <button
              class="btn btn-primary btn-lg btn-block mb-3"
              id="getEncryptionKeyButton"
              disabled
            >
              Get Encryption Key
            </button>

            <hr />

            <div id="encrypt-message-form">
              <input
                class="form-control"
                type="text"
                placeholder="Message to encrypt"
                id="encryptMessageInput"
              />

              <button
                class="btn btn-primary btn-lg btn-block mb-3"
                id="encryptButton"
                disabled
              >
                Encrypt
              </button>
            </div>

            <hr />

            <button
              class="btn btn-primary btn-lg btn-block mb-3"
              id="decryptButton"
              disabled
            >
              Decrypt
            </button>

            <p class="info-text alert alert-secondary">
              Encryption key: <span id="encryptionKeyDisplay"></span>
            </p>

            <p class="info-text text-truncate alert alert-secondary">
              Ciphertext: <span id="ciphertextDisplay"></span>
            </p>

            <p class="info-text alert alert-secondary">
              Cleartext: <span id="cleartextDisplay"></span>
            </p>
          </div>
        </div>
      </div>
    </div>`
  );

  const getEncryptionKeyButton = document.getElementById(
    'getEncryptionKeyButton',
  );
  const encryptMessageInput = document.getElementById('encryptMessageInput');
  const encryptButton = document.getElementById('encryptButton');
  const decryptButton = document.getElementById('decryptButton');
  const encryptionKeyDisplay = document.getElementById('encryptionKeyDisplay');
  const ciphertextDisplay = document.getElementById('ciphertextDisplay');
  const cleartextDisplay = document.getElementById('cleartextDisplay');

  document.addEventListener('globalConnectionChange', function (e) {
    if (e.detail.connected) {
      // MetaMask is connected, enable the button
      getEncryptionKeyButton.disabled = false;
    }
  });

  /**
   * Encrypt / Decrypt
   */

  getEncryptionKeyButton.onclick = async () => {
    try {
      encryptionKeyDisplay.innerText = await globalContext.provider.request({
        method: 'eth_getEncryptionPublicKey',
        params: [globalContext.accounts[0]],
      });
      encryptMessageInput.disabled = false;
    } catch (error) {
      encryptionKeyDisplay.innerText = `Error: ${error.message}`;
      encryptMessageInput.disabled = true;
      encryptButton.disabled = true;
      decryptButton.disabled = true;
    }
  };

  encryptMessageInput.onkeyup = () => {
    if (
      !getEncryptionKeyButton.disabled &&
      encryptMessageInput.value.length > 0
    ) {
      if (encryptButton.disabled) {
        encryptButton.disabled = false;
      }
    } else if (!encryptButton.disabled) {
      encryptButton.disabled = true;
    }
  };

  encryptButton.onclick = () => {
    try {
      ciphertextDisplay.innerText = stringifiableToHex(
        encrypt({
          publicKey: encryptionKeyDisplay.innerText,
          data: encryptMessageInput.value,
          version: 'x25519-xsalsa20-poly1305',
        }),
      );
      decryptButton.disabled = false;
    } catch (error) {
      ciphertextDisplay.innerText = `Error: ${error.message}`;
      decryptButton.disabled = true;
    }
  };

  decryptButton.onclick = async () => {
    try {
      cleartextDisplay.innerText = await globalContext.provider.request({
        method: 'eth_decrypt',
        params: [ciphertextDisplay.innerText, globalContext.accounts[0]],
      });
    } catch (error) {
      cleartextDisplay.innerText = `Error: ${error.message}`;
    }
  };
} 