'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { FC, PropsWithChildren } from 'react';

const queryClient = new QueryClient();

export const AppQueryClientProvider: FC<PropsWithChildren<{}>> = ({
  children,
}) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);
