import MetaMaskOnboarding from '@metamask/onboarding'
// eslint-disable-next-line camelcase
import { encrypt, recoverPersonalSignature, recoverTypedSignatureLegacy, recoverTypedSignature, recoverTypedSignature_v4 } from 'eth-sig-util'
import { ethers } from 'ethers'
import { toChecksumAddress } from 'ethereumjs-util'
import { hstBytecode, hstAbi, piggybankBytecode, piggybankAbi } from './constants.json'

// We must specify the network as 'any' for ethers to allow network changes
const ethersProvider = new ethers.providers.Web3Provider(window.ethereum, 'any')

const hstFactory = new ethers.ContractFactory(
  hstAbi,
  hstBytecode,
  ethersProvider.getSigner(),
)

const piggybankFactory = new ethers.ContractFactory(
  piggybankAbi,
  piggybankBytecode,
  ethersProvider.getSigner(),
)

const currentUrl = new URL(window.location.href)
const forwarderOrigin = currentUrl.hostname === 'localhost'
  ? 'http://localhost:9010'
  : undefined

const { isMetaMaskInstalled } = MetaMaskOnboarding

// Dapp Status Section
const networkDiv = document.getElementById('network')
const chainIdDiv = document.getElementById('chainId')
const accountsDiv = document.getElementById('accounts')

// Basic Actions Section
const onboardButton = document.getElementById('connectButton')
const getAccountsButton = document.getElementById('getAccounts')
const getAccountsResults = document.getElementById('getAccountsResult')

// Permissions Actions Section
const requestPermissionsButton = document.getElementById('requestPermissions')
const getPermissionsButton = document.getElementById('getPermissions')
const permissionsResult = document.getElementById('permissionsResult')

// Contract Section
const deployButton = document.getElementById('deployButton')
const depositButton = document.getElementById('depositButton')
const withdrawButton = document.getElementById('withdrawButton')
const contractStatus = document.getElementById('contractStatus')

// Send Eth Section
const sendButton = document.getElementById('sendButton')

// Send Tokens Section
const tokenAddress = document.getElementById('tokenAddress')
const createToken = document.getElementById('createToken')
const transferTokens = document.getElementById('transferTokens')
const approveTokens = document.getElementById('approveTokens')
const transferTokensWithoutGas = document.getElementById('transferTokensWithoutGas')
const approveTokensWithoutGas = document.getElementById('approveTokensWithoutGas')

// Personal Sign Section
const personalSign = document.getElementById('personalSign')
const personalSignResults = document.getElementById('personalSignResult')

// Signed Type Data Section
const signTypedData = document.getElementById('signTypedData')
const signTypedDataResults = document.getElementById('signTypedDataResult')

// Encrypt / Decrypt Section
const getEncryptionKeyButton = document.getElementById('getEncryptionKeyButton')
const encryptMessageInput = document.getElementById('encryptMessageInput')
const encryptButton = document.getElementById('encryptButton')
const decryptButton = document.getElementById('decryptButton')
const encryptionKeyDisplay = document.getElementById('encryptionKeyDisplay')
const ciphertextDisplay = document.getElementById('ciphertextDisplay')
const cleartextDisplay = document.getElementById('cleartextDisplay')

// Ethereum Signature Secrtion
const ethSign = document.getElementById('ethSign')
const ethSignResult = document.getElementById('ethSignResult')
const personalSignTest = document.getElementById('personalSignTest')
const personalRecoverTest = document.getElementById('personalRecoverTest')
const signTypedDataTest = document.getElementById('signTypedDataTest')
const signTypedDataV3Test = document.getElementById('signTypedDataV3Test')
const signTypedDataV4Test = document.getElementById('signTypedDataV4Test')

const initialize = async () => {

  let onboarding
  try {
    onboarding = new MetaMaskOnboarding({ forwarderOrigin })
  } catch (error) {
    console.error(error)
  }

  let accounts
  let accountButtonsInitialized = false

  const accountButtons = [
    deployButton,
    depositButton,
    withdrawButton,
    sendButton,
    createToken,
    transferTokens,
    approveTokens,
    transferTokensWithoutGas,
    approveTokensWithoutGas,
    personalSign,
    signTypedData,
    getEncryptionKeyButton,
    encryptMessageInput,
    encryptButton,
    decryptButton,
    ethSign,
    personalSignTest,
    personalRecoverTest,
    signTypedDataTest,
    signTypedDataV3Test,
    signTypedDataV4Test,
  ]

  const isMetaMaskConnected = () => accounts && accounts.length > 0

  const onClickInstall = () => {
    onboardButton.innerText = 'Onboarding in progress'
    onboardButton.disabled = true
    onboarding.startOnboarding()
  }

  const onClickConnect = async () => {
    try {
      const newAccounts = await ethereum.request({
        method: 'eth_requestAccounts',
      })
      handleNewAccounts(newAccounts)
    } catch (error) {
      console.error(error)
    }
  }

  const clearTextDisplays = () => {
    encryptionKeyDisplay.innerText = ''
    encryptMessageInput.value = ''
    ciphertextDisplay.innerText = ''
    cleartextDisplay.innerText = ''
  }

  const updateButtons = () => {
    const accountButtonsDisabled = !isMetaMaskInstalled() || !isMetaMaskConnected()
    if (accountButtonsDisabled) {
      for (const button of accountButtons) {
        button.disabled = true
      }
      clearTextDisplays()
    } else {
      deployButton.disabled = false
      sendButton.disabled = false
      createToken.disabled = false
      personalSign.disabled = false
      signTypedData.disabled = false
      getEncryptionKeyButton.disabled = false
      ethSign.disabled = false
      personalSignTest.disabled = false
      personalRecoverTest.disabled = false
      signTypedDataTest.disabled = false
      signTypedDataV3Test.disabled = false
      signTypedDataV4Test.disabled = false
    }

    if (!isMetaMaskInstalled()) {
      onboardButton.innerText = 'Click here to install MetaMask!'
      onboardButton.onclick = onClickInstall
      onboardButton.disabled = false
    } else if (isMetaMaskConnected()) {
      onboardButton.innerText = 'Connected'
      onboardButton.disabled = true
      if (onboarding) {
        onboarding.stopOnboarding()
      }
    } else {
      onboardButton.innerText = 'Connect'
      onboardButton.onclick = onClickConnect
      onboardButton.disabled = false
    }
  }

  const initializeAccountButtons = () => {

    if (accountButtonsInitialized) {
      return
    }
    accountButtonsInitialized = true

    /**
     * Contract Interactions
     */

    deployButton.onclick = async () => {
      let contract
      contractStatus.innerHTML = 'Deploying'

      try {
        contract = await piggybankFactory.deploy()
        await contract.deployTransaction.wait()
      } catch (error) {
        contractStatus.innerHTML = 'Deployment Failed'
        throw error
      }

      if (contract.address === undefined) {
        return
      }

      console.log(`Contract mined! address: ${contract.address} transactionHash: ${contract.transactionHash}`)
      contractStatus.innerHTML = 'Deployed'
      depositButton.disabled = false
      withdrawButton.disabled = false

      depositButton.onclick = async () => {
        contractStatus.innerHTML = 'Deposit initiated'
        const result = await contract.deposit({
          from: accounts[0],
          value: '0x3782dace9d900000',
        })
        console.log(result)
        contractStatus.innerHTML = 'Deposit completed'
      }

      withdrawButton.onclick = async () => {
        const result = await contract.withdraw(
          '0xde0b6b3a7640000',
          { from: accounts[0] },
        )
        console.log(result)
        contractStatus.innerHTML = 'Withdrawn'
      }

      console.log(contract)
    }

    /**
     * Sending ETH
     */

    sendButton.onclick = async () => {
      const result = await ethersProvider.getSigner().sendTransaction({
        to: '0x2f318C334780961FB129D2a6c30D0763d9a5C970',
        value: '0x29a2241af62c0000',
        gasLimit: 21000,
        gasPrice: 20000000000,
      })
      console.log(result)
    }

    /**
     * ERC20 Token
     */

    createToken.onclick = async () => {
      const _initialAmount = 100
      const _tokenName = 'TST'
      const _decimalUnits = 0
      const _tokenSymbol = 'TST'

      try {
        const contract = await hstFactory.deploy(
          _initialAmount,
          _tokenName,
          _decimalUnits,
          _tokenSymbol,
        )
        await contract.deployTransaction.wait()
        if (contract.address === undefined) {
          return undefined
        }

        console.log(`Contract mined! address: ${contract.address} transactionHash: ${contract.transactionHash}`)
        tokenAddress.innerHTML = contract.address
        transferTokens.disabled = false
        approveTokens.disabled = false
        transferTokensWithoutGas.disabled = false
        approveTokensWithoutGas.disabled = false

        transferTokens.onclick = async () => {
          const result = await contract.transfer('0x2f318C334780961FB129D2a6c30D0763d9a5C970', '15000', {
            from: accounts[0],
            gasLimit: 60000,
            gasPrice: '20000000000',
          })
          console.log('result', result)
        }

        approveTokens.onclick = async () => {
          const result = await contract.approve('0x9bc5baF874d2DA8D216aE9f137804184EE5AfEF4', '70000', {
            from: accounts[0],
            gasLimit: 60000,
            gasPrice: '20000000000',
          })
          console.log(result)
        }

        transferTokensWithoutGas.onclick = async () => {
          const result = await contract.transfer('0x2f318C334780961FB129D2a6c30D0763d9a5C970', '15000', {
            gasPrice: '20000000000',
          })
          console.log('result', result)
        }

        approveTokensWithoutGas.onclick = async () => {
          const result = await contract.approve('0x2f318C334780961FB129D2a6c30D0763d9a5C970', '70000', {
            gasPrice: '20000000000',
          })
          console.log(result)
        }

        return contract
      } catch (error) {
        tokenAddress.innerHTML = 'Creation Failed'
        throw error
      }
    }

    /**
     * Sign Typed Data
     */

    personalSign.onclick = async () => {
      const exampleMessage = 'Example `personal_sign` message'
      try {
        const msg = `0x${Buffer.from(exampleMessage, 'utf8').toString('hex')}`
        const result = await ethereum.request({
          method: 'personal_sign',
          params: [msg, accounts[0], 'Example password'],
        })
        personalSignResults.innerHTML = JSON.stringify(result)
      } catch (err) {
        console.error(err)
      }
    }

    /**
     * Sign Typed Data
     */

    signTypedData.onclick = async () => {
      const networkId = parseInt(networkDiv.innerHTML, 10)
      const chainId = parseInt(chainIdDiv.innerHTML, 16) || networkId

      const typedData = {
        types: {
          EIP712Domain: [
            { name: 'name', type: 'string' },
            { name: 'version', type: 'string' },
            { name: 'chainId', type: 'uint256' },
            { name: 'verifyingContract', type: 'address' },
          ],
          Person: [
            { name: 'name', type: 'string' },
            { name: 'wallet', type: 'address' },
          ],
          Mail: [
            { name: 'from', type: 'Person' },
            { name: 'to', type: 'Person' },
            { name: 'contents', type: 'string' },
          ],
        },
        primaryType: 'Mail',
        domain: {
          name: 'Ether Mail',
          version: '1',
          chainId,
          verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
        },
        message: {
          sender: {
            name: 'Cow',
            wallet: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
          },
          recipient: {
            name: 'Bob',
            wallet: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
          },
          contents: 'Hello, Bob!',
        },
      }

      try {
        const result = await ethereum.request({
          method: 'eth_signTypedData_v3',
          params: [accounts[0], JSON.stringify(typedData)],
        })
        signTypedDataResults.innerHTML = JSON.stringify(result)
      } catch (err) {
        console.error(err)
      }
    }

    /**
     * Permissions
     */

    requestPermissionsButton.onclick = async () => {
      try {
        const permissionsArray = await ethereum.request({
          method: 'wallet_requestPermissions',
          params: [{ eth_accounts: {} }],
        })
        permissionsResult.innerHTML = getPermissionsDisplayString(permissionsArray)
      } catch (err) {
        console.error(err)
        permissionsResult.innerHTML = `Error: ${err.message}`
      }
    }

    getPermissionsButton.onclick = async () => {
      try {
        const permissionsArray = await ethereum.request({
          method: 'wallet_getPermissions',
        })
        permissionsResult.innerHTML = getPermissionsDisplayString(permissionsArray)
      } catch (err) {
        console.error(err)
        permissionsResult.innerHTML = `Error: ${err.message}`
      }
    }

    getAccountsButton.onclick = async () => {
      try {
        const _accounts = await ethereum.request({
          method: 'eth_accounts',
        })
        getAccountsResults.innerHTML = _accounts[0] || 'Not able to get accounts'
      } catch (err) {
        console.error(err)
        getAccountsResults.innerHTML = `Error: ${err.message}`
      }
    }

    /**
     * Encrypt / Decrypt
     */

    getEncryptionKeyButton.onclick = async () => {
      try {
        encryptionKeyDisplay.innerText = await ethereum.request({
          method: 'eth_getEncryptionPublicKey',
          params: [accounts[0]],
        })
        encryptMessageInput.disabled = false
      } catch (error) {
        encryptionKeyDisplay.innerText = `Error: ${error.message}`
        encryptMessageInput.disabled = true
        encryptButton.disabled = true
        decryptButton.disabled = true
      }
    }

    encryptMessageInput.onkeyup = () => {
      if (
        !getEncryptionKeyButton.disabled &&
        encryptMessageInput.value.length > 0
      ) {
        if (encryptButton.disabled) {
          encryptButton.disabled = false
        }
      } else if (!encryptButton.disabled) {
        encryptButton.disabled = true
      }
    }

    encryptButton.onclick = () => {
      try {
        ciphertextDisplay.innerText = stringifiableToHex(encrypt(
          encryptionKeyDisplay.innerText,
          { 'data': encryptMessageInput.value },
          'x25519-xsalsa20-poly1305',
        ))
        decryptButton.disabled = false
      } catch (error) {
        ciphertextDisplay.innerText = `Error: ${error.message}`
        decryptButton.disabled = true
      }
    }

    decryptButton.onclick = async () => {
      try {
        cleartextDisplay.innerText = await ethereum.request({
          method: 'eth_decrypt',
          params: [ciphertextDisplay.innerText, ethereum.selectedAddress],
        })
      } catch (error) {
        cleartextDisplay.innerText = `Error: ${error.message}`
      }
    }
  }

  /**
   * Ethereum Signature
   */
  ethSign.onclick = async () => {
    try {
      // const msg = 'Sample message to hash for signature'
      // const msgHash = keccak256(msg)
      const msg = '0x879a053d4800c6354e76c7985a865d2922c82fb5b3f4577b2fe08b998954f2e0'
      const ethResult = await ethereum.request({
        method: 'eth_sign',
        params: [accounts[0], msg],
      })
      console.log('signed:', JSON.stringify(ethResult))
      ethSignResult.innerHTML = JSON.stringify(ethResult)
    } catch (err) {
      console.log(err)
    }
  }

  /**
     * Personal Sign
     */

  personalSignTest.onclick = async () => {
    const exampleMessage = 'Sample message for personal sign test'
    try {
      const from = accounts[0]
      const msg = `0x${Buffer.from(exampleMessage, 'utf8').toString('hex')}`
      const result = await ethereum.request({
        method: 'personal_sign',
        params: [msg, from, 'Example password'],
      })
      console.log('recovering!!!')
      const recoveredAddr = recoverPersonalSignature({
        'data': msg,
        'sig': result,
      })
      if (recoveredAddr === from) {
        console.log(`SigUtil Successfully verified signer as ${recoveredAddr}`)
      } else {
        console.log(`SigUtil Failed to verify signer when comparing ${recoveredAddr} to ${from}`)
        console.log(`Failed comparing ${recoveredAddr} to ${from}`)
      }
    } catch (err) {
      console.error(err)
    }
  }

  /**
   * Personal ecRecover Test
   */
  personalRecoverTest.onclick = async () => {
    const exampleMessage = 'Sample message for personal ec Recover Test'
    try {
      const from = accounts[0]
      const msg = `0x${Buffer.from(exampleMessage, 'utf8').toString('hex')}`
      const result = await ethereum.request({
        method: 'personal_sign',
        params: [msg, from, 'Example password'],
      })
      console.log(result)
      console.log('recovering!!!')
      const ecRecoverAddr = await ethereum.request({
        method: 'personal_ecRecover',
        params: [msg, result],
      })
      if (ecRecoverAddr === from) {
        console.log(`Successfully ecRecovered signer as ${ecRecoverAddr}`)
      } else {
        console.log(`Failed to verify signer when comparing ${ecRecoverAddr} to ${from}`)
      }
    } catch (err) {
      console.error(err)
    }
  }

  /**
   * Sign Typed Data Test
  */
  signTypedDataTest.onclick = async () => {
    const msgParams = [
      {
        type: 'string',
        name: 'Message',
        value: 'Hi, Alice!',
      },
      {
        type: 'uint32',
        name: 'A number',
        value: '1337',
      },
    ]

    try {
      const from = accounts[0]
      const signTypedResult = await ethereum.request({
        method: 'eth_signTypedData',
        params: [msgParams, from],
      })
      console.log(signTypedResult)
      console.log('recovering!!!')
      const recoveredAddr = recoverTypedSignatureLegacy({
        'data': msgParams,
        'sig': signTypedResult,
      })
      console.log(recoveredAddr)
      if (toChecksumAddress(recoveredAddr) === toChecksumAddress(from)) {
        console.log(`Successfully verified signer as ${recoveredAddr}`)
      } else {
        console.log(`Failed to verify signer when comparing ${recoveredAddr} to ${from}`)
      }
    } catch (err) {
      console.log(err)
    }
  }

  /**
   * Sign Typed Data Version 3 Test
   */
  signTypedDataV3Test.onclick = async () => {
    const networkId = parseInt(networkDiv.innerHTML, 10)
    const chainId = parseInt(chainIdDiv.innerHTML, 16) || networkId

    const msgParams = {
      types: {
        EIP712Domain: [
          { name: 'name', type: 'string' },
          { name: 'version', type: 'string' },
          { name: 'chainId', type: 'uint256' },
          { name: 'verifyingContract', type: 'address' },
        ],
        Person: [
          { name: 'name', type: 'string' },
          { name: 'wallet', type: 'address' },
        ],
        Mail: [
          { name: 'from', type: 'Person' },
          { name: 'to', type: 'Person' },
          { name: 'contents', type: 'string' },
        ],
      },
      primaryType: 'Mail',
      domain: {
        name: 'Ether Mail',
        version: '1',
        chainId,
        verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
      },
      message: {
        sender: {
          name: 'Cow',
          wallet: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
        },
        recipient: {
          name: 'Bob',
          wallet: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
        },
        contents: 'Hello, Bob!',
      },
    }
    try {
      const from = accounts[0]
      const signTypedV3 = await ethereum.request({
        method: 'eth_signTypedData_v3',
        params: [from, JSON.stringify(msgParams)],
      })
      console.log(signTypedV3)
      console.log('recovering!!!')
      const recoveredAddr = recoverTypedSignature({
        'data': msgParams,
        'sig': signTypedV3,
      })
      if (toChecksumAddress(recoveredAddr) === toChecksumAddress(from)) {
        console.log(`Successfully verified signer as ${recoveredAddr}`)
      } else {
        console.log(`Failed to verify signer when comparing ${recoveredAddr} to ${from}`)
      }
    } catch (err) {
      console.log(err)
    }
  }

  signTypedDataV4Test.onclick = async () => {
    const networkId = parseInt(networkDiv.innerHTML, 10)
    const chainId = parseInt(chainIdDiv.innerHTML, 16) || networkId
    const msgParams = {
      domain: {
        chainId,
        name: 'Ether Mail',
        verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
        version: '1',
      },
      message: {
        contents: 'Hello, Bob!',
        from: {
          name: 'Cow',
          wallets: [
            '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
            '0xDeaDbeefdEAdbeefdEadbEEFdeadbeEFdEaDbeeF',
          ],
        },
        to: [
          {
            name: 'Bob',
            wallets: [
              '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
              '0xB0BdaBea57B0BDABeA57b0bdABEA57b0BDabEa57',
              '0xB0B0b0b0b0b0B000000000000000000000000000',
            ],
          },
        ],
      },
      primaryType: 'Mail',
      types: {
        EIP712Domain: [
          { name: 'name', type: 'string' },
          { name: 'version', type: 'string' },
          { name: 'chainId', type: 'uint256' },
          { name: 'verifyingContract', type: 'address' },
        ],
        Group: [{ name: 'name', type: 'string' }, { name: 'members', type: 'Person[]' }],
        Mail: [
          { name: 'from', type: 'Person' },
          { name: 'to', type: 'Person[]' },
          { name: 'contents', type: 'string' },
        ],
        Person: [{ name: 'name', type: 'string' }, { name: 'wallets', type: 'address[]' }],
      },
    }
    try {
      const from = accounts[0]
      const signTypedV4 = await ethereum.request({
        method: 'eth_signTypedData_v4',
        params: [from, JSON.stringify(msgParams)],
      })
      console.log(signTypedV4)
      console.log('recovering!!!')
      const recoveredAddr = recoverTypedSignature_v4({
        'data': msgParams,
        'sig': signTypedV4,
      })
      if (toChecksumAddress(recoveredAddr) === toChecksumAddress(from)) {
        console.log(`Successfully verified signer as ${recoveredAddr}`)
      } else {
        console.log(`Failed to verify signer when comparing ${recoveredAddr} to ${from}`)
      }
    } catch (err) {
      console.log(err)
    }
  }
  function handleNewAccounts (newAccounts) {
    accounts = newAccounts
    accountsDiv.innerHTML = accounts
    if (isMetaMaskConnected()) {
      initializeAccountButtons()
    }
    updateButtons()
  }

  function handleNewChain (chainId) {
    chainIdDiv.innerHTML = chainId
  }

  function handleNewNetwork (networkId) {
    networkDiv.innerHTML = networkId
  }

  async function getNetworkAndChainId () {
    try {
      const chainId = await ethereum.request({
        method: 'eth_chainId',
      })
      handleNewChain(chainId)

      const networkId = await ethereum.request({
        method: 'net_version',
      })
      handleNewNetwork(networkId)
    } catch (err) {
      console.error(err)
    }
  }

  updateButtons()

  if (isMetaMaskInstalled()) {

    ethereum.autoRefreshOnNetworkChange = false
    getNetworkAndChainId()

    ethereum.on('chainChanged', handleNewChain)
    ethereum.on('networkChanged', handleNewNetwork)
    ethereum.on('accountsChanged', handleNewAccounts)

    try {
      const newAccounts = await ethereum.request({
        method: 'eth_accounts',
      })
      handleNewAccounts(newAccounts)
    } catch (err) {
      console.error('Error on init when getting accounts', err)
    }
  }
}

window.addEventListener('DOMContentLoaded', initialize)

// utils

function getPermissionsDisplayString (permissionsArray) {
  if (permissionsArray.length === 0) {
    return 'No permissions found.'
  }
  const permissionNames = permissionsArray.map((perm) => perm.parentCapability)
  return permissionNames.reduce((acc, name) => `${acc}${name}, `, '').replace(/, $/u, '')
}

function stringifiableToHex (value) {
  return ethers.utils.hexlify(Buffer.from(JSON.stringify(value)))
}
