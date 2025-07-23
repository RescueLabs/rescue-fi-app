import { Onest } from 'next/font/google';
import { headers } from 'next/headers';
import NextTopLoader from 'nextjs-toploader';

import { DashboardSidebar } from '@/components/layout/dashboard-sidebar';
import { Footer } from '@/components/layout/footer';
import { RainbowKitClientProvider } from '@/components/layout/rainbow-kit-provider';
import { RpcEnforcerProvider } from '@/components/rpc-enforcer-provider';
import { ThemeProvider } from '@/components/theme-provider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/sonner';
import { cn } from '@/lib/utils';

import type { Metadata } from 'next';

import '@rainbow-me/rainbowkit/styles.css';
import './globals.css';

const onest = Onest({
  subsets: ['latin'],
  variable: '--font-onest',
  weight: ['300', '400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'RescueFi',
  description: 'Rescue your locked funds',
  manifest: '/manifest.webmanifest',
  icons: [
    {
      rel: 'icon',
      type: 'image/x-icon',
      url: '/favicon.ico',
    },
    {
      rel: 'icon',
      type: 'image/svg+xml',
      url: '/favicons/favicon.svg',
    },
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '96x96',
      url: '/favicons/favicon-96x96.png',
    },
    {
      rel: 'apple-touch-icon',
      sizes: '180x180',
      url: '/favicons/apple-touch-icon.png',
    },
  ],
};

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const cookie = headers().get('cookie') ?? '';

  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={cn(onest.variable)}>
        <NextTopLoader showSpinner={false} color="#a855f7" />
        <RainbowKitClientProvider cookie={cookie}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <SidebarProvider>
              <RpcEnforcerProvider>
                <ScrollArea className="h-screen w-screen">
                  <div className="w-full bg-transparent px-0 py-0 md:p-4">
                    <div
                      className={cn(
                        'relative z-[1] flex w-screen flex-1 flex-col gap-x-6 overflow-hidden md:h-[calc(100dvh-32px)] md:w-[calc(100vw-32px)] md:flex-row',
                      )}
                    >
                      <DashboardSidebar />
                      <main className="flex flex-1 flex-col pt-[60px] md:pt-0">
                        {/* <ConnectWalletButton /> */}

                        {children}

                        <Footer />
                      </main>
                    </div>
                  </div>
                </ScrollArea>
              </RpcEnforcerProvider>
            </SidebarProvider>
          </ThemeProvider>
        </RainbowKitClientProvider>
        <Toaster />
      </body>
    </html>
  );
};

export default RootLayout;
