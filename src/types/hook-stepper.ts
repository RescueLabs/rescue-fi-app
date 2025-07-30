import {
  WALLET_STEPPER_FORM_KEYS,
  AIRDROP_STEPPER_FORM_KEYS,
  NEW_WALLET_STEPPER_FORM_KEYS,
} from '@/constants/hook-stepper-constants';

import { ITokenMetadata } from './tokens';

export type StepperFormKeysType =
  (typeof WALLET_STEPPER_FORM_KEYS)[keyof typeof WALLET_STEPPER_FORM_KEYS][number];

export type NewWalletStepperFormKeysType =
  (typeof NEW_WALLET_STEPPER_FORM_KEYS)[keyof typeof NEW_WALLET_STEPPER_FORM_KEYS][number];

export type AirdropStepperFormKeysType =
  (typeof AIRDROP_STEPPER_FORM_KEYS)[keyof typeof AIRDROP_STEPPER_FORM_KEYS][number];

type GetStepperFormValueType<
  FieldName extends
    | StepperFormKeysType
    | AirdropStepperFormKeysType
    | NewWalletStepperFormKeysType,
> = FieldName extends 'amountToSalvage'
  ? string
  : FieldName extends 'manualTokenDetails'
    ? ITokenMetadata | null
    : FieldName extends 'showInputManual'
      ? boolean
      : FieldName extends 'manualTokenAddress'
        ? string
        : `0x${string}`;

export type StepperFormValues = {
  [FieldName in StepperFormKeysType]: GetStepperFormValueType<FieldName>;
} & {
  [FieldName in AirdropStepperFormKeysType]: GetStepperFormValueType<FieldName>;
} & {
  [FieldName in NewWalletStepperFormKeysType]: GetStepperFormValueType<FieldName>;
};
