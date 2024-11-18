import {
  WALLET_STEPPER_FORM_KEYS,
  AIRDROP_STEPPER_FORM_KEYS,
} from '@/lib/constants/hook-stepper-constants';

export type StepperFormKeysType =
  (typeof WALLET_STEPPER_FORM_KEYS)[keyof typeof WALLET_STEPPER_FORM_KEYS][number];

export type AirdropStepperFormKeysType =
  (typeof AIRDROP_STEPPER_FORM_KEYS)[keyof typeof AIRDROP_STEPPER_FORM_KEYS][number];

export type StepperFormValues = {
  [FieldName in StepperFormKeysType]: FieldName extends 'amountToSalvage'
    ? string
    : `0x${string}`;
} & {
  [FieldName in AirdropStepperFormKeysType]: FieldName extends 'amountToSalvage'
    ? string
    : `0x${string}`;
};
