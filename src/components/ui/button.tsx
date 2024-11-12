import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 disabled:pointer-events-none disabled:opacity-50 dark:focus-visible:ring-slate-300',
  {
    variants: {
      variant: {
        default:
          'border bg-slate-100 border-slate-800/50 hover:border-slate-800/50 text-in-gray hover:bg-slate-100 hover:text-black dark:bg-background-dark dark:border-slate-200/50 dark:hover:bg-background-dark dark:hover:border-slate-200/50 dark:text-gray-50 dark:hover:text-white px-[10px] py-2',
        outline:
          'border bg-white border-in-slate-150 hover:border-slate-100 text-in-gray hover:bg-slate-100 hover:text-black dark:bg-in-black-300 dark:border-gray-200 dark:hover:bg-in-black dark:hover:border-gray-200 dark:text-gray-50 dark:hover:text-white px-[10px] py-2',
        ghost:
          'bg-transparent text-in-gray hover:bg-slate-100 hover:text-black dark:hover:bg-in-black dark:text-gray-50 dark:hover:text-white px-[10px] py-2',
        'glowing-border':
          'px-[10px] py-2 relative text-black font-normal hover:font-medium dark:text-white',
        link: 'text-black hover:text-purple-600 dark:text-white dark:hover:text-green-400',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<
  HTMLButtonElement,
  ButtonProps & {
    as?: React.ElementType;
  }
>(({ className, variant, as, asChild = false, ...props }, ref) => {
  const Comp = as || (asChild ? Slot : 'button');
  return (
    <Comp
      className={cn(
        buttonVariants({ variant, className }),
        'group/button rounded-md',
      )}
      ref={ref}
      data-glowing-border={variant === 'glowing-border'}
      {...props}
    />
  );
});
Button.displayName = 'Button';

export { Button, buttonVariants };
