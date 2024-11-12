export const WALLET_STEPPER_FORM_KEYS = {
  1: ['victimPrivateKey', 'tokenAddress', 'amountToSalvage'],
  2: ['rescuerPrivateKey'],
} as const;

export const AIRDROP_STEPPER_FORM_KEYS = {
  1: ['airdropContractAddress', 'callData'],
  2: ['victimPrivateKey', 'tokenAddress', 'amountToSalvage'],
  3: ['rescuerPrivateKey'],
} as const;
