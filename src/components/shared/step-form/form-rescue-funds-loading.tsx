'use client';

import {
  IconHourglass,
  IconCircleCheck,
  IconCircleX,
} from '@tabler/icons-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';

export type FormRescueFundsLoadingStatus = 'loading' | 'success' | 'error';

const Particle = ({ index }: { index: number }) => {
  const randomDelay = Math.random() * 2;
  return (
    <motion.div
      className="absolute h-2 w-2 rounded-full bg-purple-300"
      animate={{
        y: [0, -100, 0],
        x: [0, Math.random() * 100 - 50, 0],
        opacity: [0, 1, 0],
        scale: [0, 1, 0],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        delay: randomDelay,
        ease: 'easeInOut',
      }}
      style={{
        left: `${Math.random() * 100}%`,
        top: '100%',
      }}
    />
  );
};

const IconWrapper = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    className="relative mb-8"
    initial={{ scale: 0 }}
    animate={{ scale: 1 }}
    exit={{ scale: 0 }}
    transition={{ duration: 0.5 }}
  >
    <div className="absolute left-0 top-0 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 opacity-50 blur-md" />
    {children}
  </motion.div>
);

export const FormRescueFundsLoading = ({
  formRescueFundsLoadingStatus,
  tryAgain,
  balanceUrl,
}: {
  formRescueFundsLoadingStatus: FormRescueFundsLoadingStatus;
  tryAgain?: () => void;
  balanceUrl?: string;
}) => {
  const [particles, setParticles] = useState<number[]>([]);

  useEffect(() => {
    setParticles(Array.from({ length: 20 }, (_, i) => i));
  }, []);

  const getFormRescueFundsLoadingStatusContent = (
    currentFormRescueFundsLoadingStatus: FormRescueFundsLoadingStatus,
  ) => {
    switch (currentFormRescueFundsLoadingStatus) {
      case 'loading':
        return {
          icon: (
            <IconHourglass
              size={80}
              className="relative z-10 text-purple-400"
            />
          ),
          text: 'Rescuing Funds',
          subtext: 'In Progress',
        };
      case 'success':
        return {
          icon: (
            <IconCircleCheck
              size={80}
              className="relative z-10 text-green-400"
            />
          ),
          text: 'Rescue Successful',
          subtext: 'Funds Secured',
        };
      case 'error':
        return {
          icon: (
            <IconCircleX size={80} className="relative z-10 text-red-400" />
          ),
          text: 'Rescue Failed',
          subtext: 'Error Occurred, Please Try Again',
        };
      default:
        return {
          icon: (
            <IconHourglass
              size={80}
              className="relative z-10 text-purple-400"
            />
          ),
          text: 'Rescuing Funds',
          subtext: 'In Progress',
        };
    }
  };

  const { icon, text, subtext } = getFormRescueFundsLoadingStatusContent(
    formRescueFundsLoadingStatus,
  );

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden">
      {formRescueFundsLoadingStatus === 'loading' && (
        <>
          {particles.map((index) => (
            <Particle key={index} index={index} />
          ))}
        </>
      )}
      <AnimatePresence mode="wait">
        <IconWrapper key={formRescueFundsLoadingStatus}>
          {formRescueFundsLoadingStatus === 'loading' ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
            >
              {icon}
            </motion.div>
          ) : (
            icon
          )}
        </IconWrapper>
      </AnimatePresence>
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        <motion.h1
          key={text}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="mb-4 bg-gradient-to-r from-purple-300 to-purple-500 bg-clip-text text-3xl font-bold text-transparent"
        >
          {text}
        </motion.h1>
        <motion.div
          key={subtext}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="text-xl"
        >
          {formRescueFundsLoadingStatus === 'loading' ? (
            <span className="inline-block">
              <span className="inline-block">{subtext}</span>
              <motion.span
                animate={{ opacity: [0, 1, 0] }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 0.2,
                }}
                className="ml-1 inline-block"
              >
                .
              </motion.span>
              <motion.span
                animate={{ opacity: [0, 1, 0] }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 0.4,
                }}
                className="inline-block"
              >
                .
              </motion.span>
              <motion.span
                animate={{ opacity: [0, 1, 0] }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 0.6,
                }}
                className="inline-block"
              >
                .
              </motion.span>
            </span>
          ) : (
            subtext
          )}
        </motion.div>

        {formRescueFundsLoadingStatus === 'success' && (
          <Link href="/">
            <Button variant="outline" className="mt-4">
              Go to Home
            </Button>
          </Link>
        )}

        {formRescueFundsLoadingStatus === 'error' && (
          <Button
            variant="outline"
            className="mt-4"
            onClick={(e) => {
              e.preventDefault();
              tryAgain?.();
            }}
          >
            Try Again
          </Button>
        )}

        {balanceUrl && formRescueFundsLoadingStatus === 'success' && (
          <Link href={balanceUrl} target="_blank" className="ml-4">
            <span className="!text-md !rounded-full border border-green-100 px-[10px] py-2 !text-green-500 hover:!bg-green-100 dark:border-green-900/50 dark:hover:!bg-green-900/50">
              View Balance
            </span>
          </Link>
        )}
      </motion.div>
    </div>
  );
};
