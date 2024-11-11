import { ThemeProvider } from '@/components/theme-provider';

import type { Metadata } from 'next';

import './globals.css';

export const metadata: Metadata = {
  title: 'Innovity',
  description: 'Welcome to Innovity AI',
};

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => (
  <html lang="en" suppressHydrationWarning>
    <head />
    <body>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        {children}
      </ThemeProvider>
    </body>
  </html>
);

export default RootLayout;
