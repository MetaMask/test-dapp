
// Modules
import { isMetaMaskConnected, onClickConnect } from './modules/BasicActions'
import MetaMaskOnboarding from '@metamask/onboarding'

// Basic Actions Section
const onboardButton = document.getElementById('connectButton')
const getAccountsButton = document.getElementById('getAccounts')
const getAccountsResults = document.getElementById('getAccountsResult')


const initialize = async () => {

  // Configureations
  const currentUrl = new URL(window.location.href)
  const forwarderOrigin = currentUrl.hostname === 'localhost'
    ? 'http://localhost:9010'
    : undefined
  const onboarding = new MetaMaskOnboarding({ forwarderOrigin })

  const { startOnboarding, stopOnboarding } = onboarding
  const { isMetaMaskInstalled } = MetaMaskOnboarding


  let accounts
  let newAccounts

  // ------Business Logic Functions----\\

  // Basic Action Functions
  const startMetaMaskOnboardingProcess = () => {
    onboardButton.innerText = 'Onboarding in progress'
    onboardButton.disabled = true
    startOnboarding()
  }

  // General Use Functions
  // const clearTextDisplays = () => {
  //   encryptionKeyDisplay.innerText = ''
  //   encryptMessageInput.value = ''
  //   ciphertextDisplay.innerText = ''
  //   cleartextDisplay.innerText = ''
  // }

  const updateButtons = () => {
    if (!isMetaMaskInstalled()) {
      onboardButton.innerText = 'Click here to install MetaMask!'
      onboardButton.onclick = startMetaMaskOnboardingProcess
      onboardButton.disabled = false
    } else if (isMetaMaskConnected(accounts)) {
      console.error(isMetaMaskConnected(accounts))
      onboardButton.innerText = 'Connected'
      onboardButton.disabled = true
      if (onboarding) {
        stopOnboarding()
      }
    } else {
      onboardButton.innerText = 'Connect'
      onboardButton.onclick = onClickConnect
      onClickConnect().then((result) => {
        newAccounts = result
        return newAccounts
      })
      onboardButton.disabled = false
      return newAccounts
    }
    return newAccounts
  }


  // -----Business Logic Functions-----\\

  // Start of application

  updateButtons()


}

window.addEventListener('DOMContentLoaded', initialize)
