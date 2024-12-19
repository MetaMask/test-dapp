import { ethers } from 'ethers';
import { 
  SEPOLIA_NETWORK_ID_DEC,
  SEPOLIA_NETWORK_ID_HEX,
  BASE_NETWORK_ID,
  BASE_NETWORK_ID_HEX
} from './sample-networks';

export const getPermissionsDisplayString = (permissionsArray) => {
  if (permissionsArray.length === 0) {
    return 'No permissions found.';
  }
  const permissionNames = permissionsArray.map((perm) => perm.parentCapability);
  return permissionNames
    .reduce((acc, name) => `${acc}${name}, `, '')
    .replace(/, $/u, '');
};

export const stringifiableToHex = (value) => {
  return ethers.utils.hexlify(Buffer.from(JSON.stringify(value)));
};

export const isSepoliaNetworkId = (networkId) => { 
  return (
    networkId === SEPOLIA_NETWORK_ID_DEC || networkId === SEPOLIA_NETWORK_ID_HEX
  );
};

export const isBaseNetworkId = (networkId) => {
  return networkId === BASE_NETWORK_ID || networkId === BASE_NETWORK_ID_HEX;
}
