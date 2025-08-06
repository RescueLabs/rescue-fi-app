'use client';

import { motion } from 'framer-motion';
import { CopyIcon } from 'lucide-react';
import React, { useState } from 'react';

import { BuyMeACoffeeIcon } from '@/components/shared/icons/buy-me-a-coffee';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { SUPPORT_US_CHAINS } from '@/constants';
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard';
import { cn } from '@/lib/utils';

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

const SupportUsSection = () => {
  const [_, copy] = useCopyToClipboard();
  const [selectedChain, setSelectedChain] = useState('ethereum');

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex h-full flex-col items-center justify-center py-8"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold text-gray-800 dark:text-white">
          Support RescueFi
        </h1>
        <p className="max-w-2xl text-lg text-gray-600 dark:text-slate-300">
          Help us continue building tools to rescue locked funds and support the
          community. Every contribution helps us improve and expand our
          services.
        </p>
      </motion.div>

      {/* Support Options */}
      <div className="grid w-full max-w-4xl grid-cols-1 gap-6 md:grid-cols-2">
        {/* Buy Me a Coffee */}
        <motion.div variants={itemVariants}>
          <Card className="flex h-full flex-col justify-center p-4 transition-all duration-300 hover:shadow-sm hover:shadow-purple-200/10">
            <CardHeader className="pb-4 text-center">
              <div className="mb-4 flex justify-center">
                <BuyMeACoffeeIcon className="h-16 w-16 text-white" />
              </div>
              <CardTitle className="text-xl font-semibold text-gray-800 dark:text-white">
                Buy Me a Coffee
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-slate-300">
                Support us with a one-time donation
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center pt-0">
              <Button
                className="w-full max-w-80 font-medium text-black"
                onClick={() =>
                  window.open('https://buymeacoffee.com/rescuefilabs', '_blank')
                }
              >
                Buy Coffee
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Multi-chain Donation */}
        <motion.div variants={itemVariants}>
          <Card className="flex h-full flex-col justify-center p-4 transition-all duration-300 hover:shadow-sm hover:shadow-purple-200/10">
            <CardHeader className="pb-4 text-center">
              <div className="mb-4 flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-blue-500">
                  <svg
                    className="h-10 w-10 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                    />
                  </svg>
                </div>
              </div>
              <CardTitle className="text-xl font-semibold text-gray-800 dark:text-white">
                Multi-chain Support
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-slate-300">
                Send crypto on any supported chain
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-0">
              {/* Chain Selector */}
              <div className="flex flex-wrap justify-center gap-2">
                {SUPPORT_US_CHAINS.map((chain) => (
                  <button
                    key={chain.id}
                    onClick={() => setSelectedChain(chain.id)}
                    className={cn(
                      'rounded-full px-3 py-1.5 text-xs font-medium transition-all',
                      selectedChain === chain.id
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-in-black-300 dark:text-gray-300 dark:hover:bg-in-black',
                    )}
                  >
                    {chain.name}
                  </button>
                ))}
              </div>

              {/* Address Input */}
              <div className="relative">
                <Input
                  value={
                    SUPPORT_US_CHAINS.find(
                      (chain) => chain.id === selectedChain,
                    )?.address
                  }
                  readOnly
                  className="pr-8 font-mono text-sm"
                />
                <Button
                  variant="ghost"
                  className="absolute right-1 top-1 h-8 px-3"
                  onClick={() =>
                    copy(
                      SUPPORT_US_CHAINS.find(
                        (chain) => chain.id === selectedChain,
                      )?.address || '',
                    )
                  }
                >
                  <CopyIcon className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div variants={itemVariants} className="mt-12 text-center">
        <p className="text-lg text-gray-600 dark:text-slate-300">
          Thank you for supporting RescueFi! 🙏
        </p>
        <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">
          Your contributions help us build better tools for the community
        </p>
      </motion.div>
    </motion.div>
  );
};

export default SupportUsSection;
