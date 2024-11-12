import { Onest } from 'next/font/google';
import NextTopLoader from 'nextjs-toploader';

import { DashboardSidebar } from '@/components/layout/dashboard-sidebar';
import { ThemeProvider } from '@/components/theme-provider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Toaster } from '@/components/ui/sonner';
import { cn } from '@/lib/utils';

import type { Metadata } from 'next';

// import { AppQueryClientProvider } from '@/components/layout/QueryClientProvider';

import './globals.css';

const onest = Onest({
  subsets: ['latin'],
  variable: '--font-onest',
  weight: ['300', '400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'Innovity',
  description: 'Welcome to Innovity AI',
  manifest: '/manifest.webmanifest',
  icons: [
    {
      rel: 'icon',
      type: 'image/x-icon',
      url: '/favicon.ico',
    },
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '32x32',
      url: '/favicons/favicon-32x32.png',
    },
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '16x16',
      url: '/favicons/favicon-16x16.png',
    },
    {
      rel: 'apple-touch-icon',
      sizes: '180x180',
      url: '/favicons/apple-touch-icon.png',
    },
    {
      rel: 'mask-icon',
      color: '#333333',
      url: '/favicons/safari-pinned-tab.svg',
    },
  ],
};

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => (
  <html lang="en" suppressHydrationWarning>
    <head />
    <body className={cn(onest.variable)}>
      <NextTopLoader showSpinner={false} />
      {/* <AppQueryClientProvider> */}
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <ScrollArea className="h-screen w-screen">
          <div className="w-full bg-transparent px-0 py-0 md:p-4">
            <div
              className={cn(
                'relative z-[1] flex w-screen flex-1 flex-col gap-x-6 overflow-hidden md:h-[calc(100dvh-32px)] md:w-[calc(100vw-32px)] md:flex-row',
              )}
            >
              <DashboardSidebar />
              <main className="flex flex-1 pt-[60px] md:pt-0">{children}</main>
            </div>
          </div>
        </ScrollArea>
      </ThemeProvider>
      {/* </AppQueryClientProvider> */}

      <Toaster />
    </body>
  </html>
);

export default RootLayout;
