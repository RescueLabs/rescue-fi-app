export const WALLET_STEPPER_FORM_KEYS = {
  1: [
    'victimPrivateKey',
    'tokenAddress',
    'amountToSalvage',
    'receiverWalletAddress',
  ],
  2: ['rescuerPrivateKey'],
} as const;

export const AIRDROP_STEPPER_FORM_KEYS = {
  1: ['airdropContractAddress', 'callData'],
  2: [
    'victimPrivateKey',
    'tokenAddress',
    'amountToSalvage',
    'receiverWalletAddress',
  ],
  3: ['rescuerPrivateKey'],
} as const;

export const NEW_WALLET_STEPPER_FORM_KEYS = {
  1: [
    'victimPrivateKey',
    'receiverWalletAddress',
    'showInputManual',
    'manualTokenAddress',
    'manualTokenDetails',
  ],
  2: ['rescuerPrivateKey'],
} as const;
