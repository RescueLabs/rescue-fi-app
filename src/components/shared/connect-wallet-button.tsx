'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import React from 'react';

export const ConnectWalletButton = () => (
  <div className="flex items-center justify-end gap-2 pr-4 pt-4 md:pr-0 md:pt-0">
    <ConnectButton showBalance={false} />
  </div>
);
