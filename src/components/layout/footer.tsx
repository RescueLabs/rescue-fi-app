'use client';

import { IconBrandGithub } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import React from 'react';

import { BuyMeACoffeeIcon } from '@/components/shared/icons/buy-me-a-coffee';
import { QuestionsLinkButton } from '@/components/shared/questions-link-button';
import { Button } from '@/components/ui/button';
import { useSidebar } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

export const Footer = () => {
  const { open } = useSidebar();

  return (
    <motion.footer
      className="fixed bottom-2 left-0 flex w-full flex-col items-center md:absolute"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.3 }}
      layout="preserve-aspect"
    >
      <section
        className={cn(
          'flex w-[95%] justify-center transition-all duration-300',
          {
            'md:ml-[266px] md:w-[calc(100%-266px)]': open,
            'md:ml-[96px] md:w-[calc(100%-96px)]': !open,
          },
        )}
      >
        <div className="z-[12] flex min-h-10 w-full max-w-[1200px] items-center justify-between rounded-full border border-slate-800/50 bg-white/80 px-4 py-2 transition-all duration-300 dark:border-slate-200/50 dark:bg-in-black-300/80">
          <div className="flex items-center gap-x-5">
            <Link
              href="https://github.com/RescueLabs/rescue-fi-app"
              target="_blank"
              className="block hover:text-purple-500 dark:hover:text-purple-400"
            >
              <IconBrandGithub
                size={24}
                className="transition-all duration-300 hover:scale-110"
              />
            </Link>

            <Link
              href="/support-us"
              className="block transition-all duration-300 hover:scale-105"
            >
              <Button className="flex h-10 items-center justify-center !rounded-full">
                <BuyMeACoffeeIcon className="-ml-2 h-10 w-10" />
                <span className="mr-2 text-xs">Support us</span>
              </Button>
            </Link>
          </div>

          <QuestionsLinkButton />
        </div>
      </section>
    </motion.footer>
  );
};
