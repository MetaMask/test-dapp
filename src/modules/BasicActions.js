import MetaMaskOnboarding from '@metamask/onboarding'

export const isMetaMaskConnected = (listOfAccounts) => listOfAccounts && listOfAccounts.length > 0

export const onClickConnect = async () => {
  const newAccounts = await ethereum.request({
    method: 'eth_requestAccounts',
  })
    .catch((error) => {
      console.error(error)
    })
  return newAccounts
}
