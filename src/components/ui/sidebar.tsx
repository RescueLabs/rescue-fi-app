'use client';

import {
  IconMenu2,
  IconX,
  IconArrowLeft,
  IconArrowRight,
} from '@tabler/icons-react';
import { AnimatePresence, motion } from 'framer-motion';
import Link, { LinkProps } from 'next/link';
import React, { useState, createContext, useContext, useEffect } from 'react';

import { cn } from '@/lib/utils';

import { SidebarLogo } from '../shared/icons/sidebar-logo';

import { Button } from './button';

interface Links {
  label: string;
  href: string;
  icon: React.JSX.Element | React.ReactNode;
}

interface SidebarContextProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  animate: boolean;
}

const SidebarContext = createContext<SidebarContextProps | undefined>(
  undefined,
);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};

export const SidebarProvider = ({
  children,
  open: openProp,
  setOpen: setOpenProp,
  animate = true,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  const [openState, setOpenState] = useState(false);

  const open = openProp !== undefined ? openProp : openState;
  const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenState;

  return (
    <SidebarContext.Provider value={{ open, setOpen, animate }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const DesktopSidebar = ({
  className,
  children,
  ...props
}: React.ComponentProps<typeof motion.div> & {
  className?: string;
}) => {
  const { open, setOpen, animate } = useSidebar();

  return (
    <motion.div
      initial={false}
      className={cn(
        'relative z-[50] hidden h-full w-[250px] flex-shrink-0 rounded-xl border border-slate-800/50 bg-white px-3 py-4 dark:border-slate-200/50 dark:bg-in-black-300 md:flex md:flex-col',
        className,
      )}
      animate={{
        width: animate ? (open ? '250px' : '80px') : '250px',
      }}
      {...props}
    >
      <>
        <Button
          onClick={() => setOpen((prev) => !prev)}
          className={cn(
            'group absolute -right-[1px] top-4 z-[1] flex h-8 items-center justify-center !rounded-l-2xl !rounded-r-none border-r-0 transition-all',
            open ? 'w-9' : 'w-7',
          )}
        >
          {open ? (
            <IconArrowLeft className="h-[14px] min-h-[14px] w-[14px] min-w-[14px] transition-all group-hover:-translate-x-1.5" />
          ) : (
            <IconArrowRight className="h-[14px] min-h-[14px] w-[14px] min-w-[14px] transition-all group-hover:translate-x-1.5" />
          )}
        </Button>

        {children}
      </>
    </motion.div>
  );
};

export const MobileSidebar = ({
  className,
  children,
  ...props
}: React.ComponentProps<'div'> & {
  className?: string;
}) => {
  const { open, setOpen } = useSidebar();

  const handleLinkClick = (ev: MouseEvent): any => {
    const isLink = (ev.target as HTMLElement).closest('a');
    if (isLink) {
      setOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('click', handleLinkClick);

    return () => document.removeEventListener('click', handleLinkClick);
  }, [open]);

  return (
    <div
      className={cn(
        'fixed left-0 top-0 z-50 flex h-10 w-full flex-row items-center justify-between rounded-full md:hidden',
      )}
      {...props}
    >
      <div className="z-20 mx-auto mt-8 flex h-10 w-[95%] items-center justify-between rounded-full bg-white/60 px-4 py-4 dark:bg-in-black-300/60">
        <Link href="/" className="flex items-center">
          <SidebarLogo className="mt-3 h-10 w-10" />
          <span className="-ml-4 mt-2 text-sm">escueFi</span>
        </Link>

        <IconMenu2
          className="text-neutral-800 dark:text-neutral-200"
          onClick={() => setOpen(!open)}
        />
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ x: '-100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '-100%', opacity: 0 }}
            transition={{
              duration: 0.3,
              ease: 'easeInOut',
            }}
            className={cn(
              'fixed inset-0 z-[49] flex h-full w-full flex-col justify-between bg-white p-10 dark:bg-in-black-300',
              className,
            )}
          >
            <div
              className="absolute right-10 top-10 z-50 text-neutral-800 dark:text-neutral-200"
              onClick={() => setOpen(!open)}
            >
              <IconX />
            </div>
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const SidebarLink = ({
  link,
  className,
  active,
  ...props
}: {
  link: Links;
  className?: string;
  props?: LinkProps;
  active?: boolean;
}) => {
  const { open, animate } = useSidebar();
  return (
    <Link href={link.href} className={cn(className)} {...props}>
      <Button
        variant="ghost"
        className={cn(
          'group/sidebar flex h-10 w-full items-center justify-start gap-3',
          {
            'px-4.5': !open,
            'group/active bg-slate-100 dark:bg-in-black-500 [&_.icon-colored]:block [&_.icon-plain]:hidden [&_svg]:text-purple-600 dark:[&_svg]:text-purple-400':
              active,
          },
        )}
      >
        {link.icon}

        <motion.span
          initial={false}
          animate={{
            display: animate
              ? open
                ? 'inline-block'
                : 'none'
              : 'inline-block',
            opacity: animate ? (open ? 1 : 0) : 1,
          }}
          className={cn(
            '!m-0 inline-block whitespace-pre !p-0 text-[13px] font-normal leading-5 text-gray-800 transition duration-150 group-hover/sidebar:font-medium group-hover/sidebar:text-black dark:text-slate-200 dark:group-hover/sidebar:text-white',
            {
              'text-black dark:text-white': active,
            },
          )}
        >
          {link.label}
        </motion.span>
      </Button>
    </Link>
  );
};

export const Sidebar = ({ children }: { children: React.ReactNode }) => {
  return children;
};

export const SidebarBody = (props: React.ComponentProps<typeof motion.div>) => {
  return (
    <>
      <DesktopSidebar {...props} />
      <MobileSidebar {...(props as React.ComponentProps<'div'>)} />
    </>
  );
};
