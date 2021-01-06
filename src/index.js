// Modules
import MetaMaskOnboarding from '@metamask/onboarding'
import { isMetaMaskConnected, onClickConnect } from './modules/BasicActions'
// // Basic Actions Section
const connectButton = document.getElementById('connectButton')
const onboardingButton = document.getElementById('onboardingInProgressButton')
// const getAccountsButton = document.getElementById('getAccounts')
// const getAccountsResults = document.getElementById('getAccountsResult')
const { isMetaMaskInstalled } = MetaMaskOnboarding

onboardingButton.addEventListener('click', () => {
  location.reload()
})

const onClickInstall = () => {
  connectButton.style.display = 'none'
  onboardingButton.style.display = 'block'
  connectButton.disabled = true
}
// const updateButtons = () => {
//   const accountButtonsDisabled = !isMetaMaskInstalled() || !isMetaMaskConnected()
//   if (accountButtonsDisabled) {
//     for (const button of accountButtons) {
//       button.disabled = true
//     }
//     clearTextDisplays()
//   } else {
//     deployButton.disabled = false
//     sendButton.disabled = false
//     createToken.disabled = false
//     personalSign.disabled = false
//     signTypedData.disabled = false
//     getEncryptionKeyButton.disabled = false
//     ethSign.disabled = false
//     personalSign.disabled = false
//     signTypedData.disabled = false
//     signTypedDataV3.disabled = false
//     signTypedDataV4.disabled = false
//   }

//   if (!isMetaMaskInstalled()) {
//     onboardButton.innerText = 'Click here to install MetaMask!'
//     onboardButton.onclick = onClickInstall
//     onboardButton.disabled = false
//   } else if (isMetaMaskConnected()) {
//     onboardButton.innerText = 'Connected'
//     onboardButton.disabled = true
//     if (onboarding) {
//       onboarding.stopOnboarding()
//     }
//   } else {
//     onboardButton.innerText = 'Connect'
//     onboardButton.onclick = onClickConnect
//     onboardButton.disabled = false
//   }
// }
const currentUrl = new URL(window.location.href)
const forwarderOrigin = currentUrl.hostname === 'localhost' ? 'http://localhost:9010' : undefined

const onboarding = new MetaMaskOnboarding({ forwarderOrigin })
let accounts

// Ethereum Signature Section
const ethSign = document.getElementById('ethSign')
const ethSignResult = document.getElementById('ethSignResult')
const personalSign = document.getElementById('personalSign')
const personalSignResult = document.getElementById('personalSignResult')
const personalSignVerify = document.getElementById('personalSignVerify')
const personalSignVerifySigUtilResult = document.getElementById('personalSignVerifySigUtilResult')
const personalSignVerifyECRecoverResult = document.getElementById('personalSignVerifyECRecoverResult')
const signTypedData = document.getElementById('signTypedData')
const signTypedDataResult = document.getElementById('signTypedDataResult')
const signTypedDataVerify = document.getElementById('signTypedDataVerify')
const signTypedDataVerifyResult = document.getElementById('signTypedDataVerifyResult')
const signTypedDataV3 = document.getElementById('signTypedDataV3')
const signTypedDataV3Result = document.getElementById('signTypedDataV3Result')
const signTypedDataV3Verify = document.getElementById('signTypedDataV3Verify')
const signTypedDataV3VerifyResult = document.getElementById('signTypedDataV3VerifyResult')
const signTypedDataV4 = document.getElementById('signTypedDataV4')
const signTypedDataV4Result = document.getElementById('signTypedDataV4Result')
const signTypedDataV4Verify = document.getElementById('signTypedDataV4Verify')
const signTypedDataV4VerifyResult = document.getElementById('signTypedDataV4VerifyResult')

const initialize = async () => {
  onboardingButton.style.display = 'none'
  // const accountButtonsDisabled = !isMetaMaskInstalled() || !isMetaMaskConnected(accounts)

  if (!isMetaMaskInstalled()) {
    connectButton.innerText = 'Click here to install MetaMask!'
    connectButton.onclick = onClickInstall
    connectButton.disabled = false
  } else if (isMetaMaskConnected()) {
    connectButton.disabled = true
    if (onboarding) {
      onboarding.stopOnboarding()
    }
  } else {
    connectButton.onclick = onClickConnect
    connectButton.disabled = false
  }


}

window.addEventListener('DOMContentLoaded', initialize)
