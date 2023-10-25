import { ethers } from 'ethers';

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
