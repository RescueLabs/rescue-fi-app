'use client';

import {
  IconAirBalloon,
  IconMoon,
  IconSun,
  IconWallet,
} from '@tabler/icons-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import React, { useState } from 'react';

import { SidebarLogo } from '@/components/shared/icons/sidebar-logo';
import { Sidebar, SidebarBody, SidebarLink } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

import { ThemeSwitch } from '../ui/theme-switch';

const links: {
  heading: string;
  subLinks: {
    label: string;
    href: string;
    icon: React.ReactNode;
    paths?: string[];
  }[];
}[] = [
  {
    heading: 'Rescue Options',
    subLinks: [
      {
        label: 'Wallet Funds',
        href: '/rescue/wallet-funds',
        icon: (
          <IconWallet className="text-in-gray dark:text-in-slate-700 h-5 w-5 flex-shrink-0 group-hover/sidebar:text-purple-600 dark:group-hover/sidebar:text-purple-400" />
        ),
      },
      {
        label: 'Airdrop Funds',
        href: '/rescue/airdrop-funds',
        icon: (
          <IconAirBalloon className="text-in-gray dark:text-in-slate-700 h-5 w-5 flex-shrink-0 group-hover/sidebar:text-purple-600 dark:group-hover/sidebar:text-purple-400" />
        ),
      },
    ],
  },
];

export const DashboardSidebar = () => {
  const [open, setOpen] = useState<boolean>(false);
  const pathname = usePathname();
  const { setTheme, theme } = useTheme();

  return (
    <Sidebar open={open} setOpen={setOpen}>
      <SidebarBody className="justify-between gap-10">
        <div className="flex flex-1 flex-col gap-y-2 overflow-x-hidden">
          <Link
            href="/"
            className={cn(
              'mb-8 flex w-full items-center justify-start gap-0 py-2',
            )}
          >
            <SidebarLogo
              initial={{
                width: 36,
                height: 36,
              }}
              animate={{
                width: open ? 40 : 36,
                height: open ? 40 : 36,
              }}
              className="flex min-h-8 min-w-8 items-center justify-center"
            />

            <motion.span
              initial={false}
              animate={{
                display: open ? 'inline-block' : 'none',
                opacity: open ? 1 : 0,
              }}
              transition={{
                delay: !open ? -1 : 0.15,
              }}
              className="-ml-2.5 mb-0.5 w-[146px] text-xs font-semibold text-black dark:text-white"
            >
              escueFi
            </motion.span>
          </Link>

          <div className="flex flex-1 flex-col gap-y-2 overflow-y-auto overflow-x-hidden">
            {links.map((link) => (
              <div className="flex flex-col gap-1.5" key={link.heading}>
                <motion.span
                  initial={{
                    visibility: 'hidden',
                    opacity: 0,
                  }}
                  animate={{
                    visibility: open ? 'visible' : 'hidden',
                    opacity: open ? 1 : 0,
                  }}
                  className="inline-block h-[15px] whitespace-nowrap text-[10px] font-semibold uppercase"
                >
                  {link.heading}
                </motion.span>

                <div className="flex flex-col gap-1.5">
                  {link.subLinks.map((subLink, idx) => (
                    <SidebarLink
                      key={idx}
                      link={subLink}
                      active={
                        subLink.href === '/'
                          ? pathname === '/' ||
                            subLink.paths?.some((path) =>
                              pathname.includes(path),
                            )
                          : pathname.includes(subLink.href)
                      }
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="w-full scale-90">
          <ThemeSwitch
            id="theme-button-mobile"
            iconChecked={<IconSun className="size-2 sm:size-4" />}
            iconUnchecked={<IconMoon className="size-2 sm:size-4" />}
            onCheckedChange={() =>
              setTheme(theme === 'light' ? 'dark' : 'light')
            }
            className="h-fit w-12 sm:h-8 sm:w-15"
            thumbClassName="h-5 w-5 sm:h-7 sm:w-7"
          />
        </div>
      </SidebarBody>
    </Sidebar>
  );
};
