'use client';

import * as SwitchPrimitives from '@radix-ui/react-switch';
import * as React from 'react';

import { cn } from '@/lib/utils';

const ThemeSwitch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root> & {
    className?: string;
    thumbClassName?: string;
    iconChecked?: React.ReactNode;
    iconUnchecked?: React.ReactNode;
  }
>(
  (
    {
      className = '',
      iconChecked,
      iconUnchecked,
      thumbClassName = '',
      ...props
    },
    ref,
  ) => (
    <SwitchPrimitives.Root
      className={cn(
        'peer inline-flex h-8 w-15 shrink-0 cursor-pointer items-center rounded-[18px] border border-purple-50 bg-[linear-gradient(109deg,_#4E93FF_0%,_#00FF7B_113.81%)] p-0.5 shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-[linear-gradient(109deg,_#5232AD_0%,_#0746AA_100%)] dark:focus-visible:ring-slate-300 dark:focus-visible:ring-offset-slate-950',
        className,
      )}
      {...props}
      ref={ref}
    >
      <SwitchPrimitives.Thumb
        className={cn(
          'pointer-events-none flex h-7 w-7 translate-x-[105%] items-center justify-center rounded-full bg-white text-black shadow-lg ring-0 transition-transform dark:translate-x-0 dark:bg-zinc-700 dark:text-white sm:translate-x-[95%] [&>span.checked]:inline-block dark:[&>span.checked]:hidden [&>span.unchecked]:hidden dark:[&>span.unchecked]:inline-block',
          thumbClassName,
        )}
      >
        <span className="checked">{iconChecked}</span>
        <span className="unchecked">{iconUnchecked}</span>
      </SwitchPrimitives.Thumb>
    </SwitchPrimitives.Root>
  ),
);
ThemeSwitch.displayName = SwitchPrimitives.Root.displayName;

export { ThemeSwitch };
