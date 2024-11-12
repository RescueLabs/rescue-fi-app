import { motion, MotionProps } from 'framer-motion';
import React, { FC } from 'react';

import { cn } from '@/lib/utils';

export const SidebarLogo: FC<React.SVGProps<SVGSVGElement> & MotionProps> = ({
  className,
  ...rest
}) => (
  <motion.svg
    xmlns="http://www.w3.org/2000/svg"
    width="36"
    height="36"
    viewBox="0 0 36 36"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn(
      'icon icon-tabler icons-tabler-outline icon-tabler-brand-revolut',
      className,
    )}
    {...rest}
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M5 10h3v10h-3z" />
    <path d="M14.5 4h-9.5v3h9.4a1.5 1.5 0 0 1 0 3h-3.4v4l4 6h4l-5 -7h.5a4.5 4.5 0 1 0 0 -9z" />
  </motion.svg>
);
