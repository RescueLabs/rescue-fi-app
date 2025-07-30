import * as React from 'react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const FloatingInput = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <Input
        placeholder=" "
        className={cn('peer', className)}
        ref={ref}
        {...props}
      />
    );
  },
);
FloatingInput.displayName = 'FloatingInput';

const FloatingLabel = React.forwardRef<
  React.ElementRef<typeof Label>,
  React.ComponentPropsWithoutRef<typeof Label> & { className?: string }
>(({ className, ...props }, ref) => {
  return (
    <Label
      className={cn(
        'peer-focus:secondary peer-focus:dark:secondary absolute start-2 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform rounded-lg bg-background-light px-2 text-sm text-gray-600 duration-300 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-placeholder-shown:!bg-transparent peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:!bg-background-light peer-focus:px-2 dark:bg-background-dark dark:text-gray-400 peer-focus:dark:!bg-background-dark rtl:peer-focus:left-auto rtl:peer-focus:translate-x-1/4',
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
FloatingLabel.displayName = 'FloatingLabel';

type FloatingLabelInputProps = InputProps & { label?: string; error?: string };

const FloatingLabelInput = React.forwardRef<
  React.ElementRef<typeof FloatingInput>,
  React.PropsWithoutRef<FloatingLabelInputProps> & {
    id: string;
    label?: string;
    error?: string;
    infoElement?: React.ReactNode;
    className?: string;
    containerClassName?: string;
    extraElement?: React.ReactNode;
  }
>(
  (
    {
      id,
      label,
      error,
      infoElement,
      extraElement,
      containerClassName,
      ...props
    },
    ref,
  ) => {
    return (
      <>
        <div className={cn('relative', containerClassName)}>
          <FloatingInput
            ref={ref}
            id={id}
            {...props}
            className={cn(props?.className || '', error && '!border-red-500')}
          />
          <FloatingLabel htmlFor={id}>
            {label} <span className="text-red-500">*</span>
          </FloatingLabel>
          {extraElement}
        </div>
        {infoElement}
        {error && (
          <span className="!mt-[5px] block text-[12px] text-red-500">
            {error}
          </span>
        )}
      </>
    );
  },
);
FloatingLabelInput.displayName = 'FloatingLabelInput';

export { FloatingInput, FloatingLabel, FloatingLabelInput };
