'use client';

import { useTheme } from 'next-themes';
import { Toaster as Sonner } from 'sonner';

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-white group-[.toaster]:text-slate-950 group-[.toaster]:border-slate-200 group-[.toaster]:shadow-lg dark:group-[.toaster]:bg-slate-950 dark:group-[.toaster]:text-slate-50 dark:group-[.toaster]:border-slate-800',
          description:
            'group-[.toast]:text-slate-500 dark:group-[.toast]:text-slate-400',
          actionButton:
            'group-[.toast]:bg-slate-900 group-[.toast]:text-slate-50 dark:group-[.toast]:bg-slate-50 dark:group-[.toast]:text-slate-900',
          cancelButton:
            'group-[.toast]:bg-slate-100 group-[.toast]:text-slate-500 dark:group-[.toast]:bg-slate-800 dark:group-[.toast]:text-slate-400',
          error:
            'group-[.toaster]:!bg-red-50 group-[.toaster]:!text-red-900 dark:group-[.toaster]:!bg-red-900 dark:group-[.toaster]:!text-red-100 dark:group-[.toaster]:!bg-opacity-80',
          success:
            'group-[.toaster]:!bg-purple-50 group-[.toaster]:!text-purple-900 dark:group-[.toaster]:!bg-purple-900 dark:group-[.toaster]:!bg-opacity-80 dark:group-[.toaster]:!text-purple-100',
          warning:
            'group-[.toaster]:!bg-yellow-50 group-[.toaster]:!text-yellow-900 dark:group-[.toaster]:!bg-yellow-900 dark:group-[.toaster]:!text-yellow-100 dark:group-[.toaster]:!bg-opacity-80',
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
