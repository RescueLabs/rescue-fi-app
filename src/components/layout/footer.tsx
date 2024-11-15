import { IconBrandGithub } from '@tabler/icons-react';
import Link from 'next/link';
import React from 'react';

import { BuyMeACoffeeIcon } from '../shared/icons/buy-me-a-coffee';
import { QuestionsLinkButton } from '../shared/questions-link-button';
import { Button } from '../ui/button';

export const Footer = () => {
  return (
    <footer className="absolute bottom-4 left-0 flex w-full flex-col items-center">
      <section className="z-[12] flex min-h-10 w-[95%] items-center justify-between rounded-full border border-slate-800/50 bg-white/80 px-4 py-2 dark:border-slate-200/50 dark:bg-in-black-300/80 md:ml-[200px] md:w-[calc(100%-400px)]">
        <div className="flex items-center gap-x-5">
          <Link
            href="https://github.com/RescueLabs/rescue-fi-app"
            target="_blank"
            className="block hover:text-purple-600 dark:hover:text-purple-400"
          >
            <IconBrandGithub
              size={24}
              className="transition-all duration-300 hover:scale-110"
            />
          </Link>

          <Link
            href="https://buymeacoffee.com/rescuefilabs"
            target="_blank"
            className="block transition-all duration-300 hover:scale-105"
          >
            <Button className="flex h-10 items-center justify-center !rounded-full">
              <BuyMeACoffeeIcon className="-ml-2 h-10 w-10" />
              <span className="text-xs">Buy me a coffee</span>
            </Button>
          </Link>
        </div>

        <QuestionsLinkButton />
      </section>
    </footer>
  );
};
