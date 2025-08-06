'use client';

import { IconArrowLeft, IconRocket, IconSearch } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import React from 'react';

import { SidebarLogo } from '@/components/shared/icons/sidebar-logo';
import { ScrollAreaWithMobileContraints } from '@/components/shared/scrollarea-with-mobile-constraints';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

const rescueLinks = [
  {
    label: 'Wallet Rescue',
    href: '/rescue/wallet-funds',
  },
  {
    label: 'Airdrop Rescue',
    href: '/rescue/airdrop-funds',
  },
  {
    label: 'Help & FAQs',
    href: '/faqs',
  },
];

const containerVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 },
  },
};

const logoFloat = {
  animate: {
    y: [0, -2, 2, 0],
    rotate: [0, 2, -2, 0],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

const numberGlow = {
  animate: {
    textShadow: [
      '0 0 20px rgba(123, 63, 228, 0.5)',
      '0 0 40px rgba(123, 63, 228, 0.8)',
      '0 0 20px rgba(123, 63, 228, 0.5)',
    ],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

const NotFound = () => {
  return (
    <ScrollAreaWithMobileContraints className="bg-gradient-to-br from-white to-purple-50/30 dark:from-in-black-300 dark:to-purple-950/20">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex h-full w-full items-center justify-center p-4"
      >
        <Card className="mb-10 flex flex-col items-center justify-center overflow-hidden border-none !bg-transparent md:mb-0 md:px-8">
          <CardHeader className="pb-4 text-center">
            <motion.div variants={itemVariants} className="mx-auto mb-3">
              <motion.div
                variants={logoFloat}
                animate="animate"
                className="inline-block"
              >
                <SidebarLogo className="h-16 w-16" />
              </motion.div>
            </motion.div>

            <motion.div variants={itemVariants} className="mb-4">
              <motion.h1
                variants={numberGlow}
                animate="animate"
                className="text-8xl font-bold text-purple-600 dark:text-purple-400 md:text-9xl"
                style={{
                  fontFamily: 'var(--font-onest)',
                  background:
                    'linear-gradient(135deg, #7b3fe4, #a855f7, #c084fc)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                404
              </motion.h1>
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white md:text-3xl">
                Page Not Found
              </h2>
              <p className="mx-auto max-w-md leading-relaxed text-gray-600 dark:text-gray-300">
                Looks like this page got lost in the blockchain. Don&apos;t
                worry, we&apos;ll help you find your way back to safety.
              </p>
            </motion.div>
          </CardHeader>

          <CardContent className="space-y-8 pt-4">
            <motion.div variants={itemVariants} className="text-center">
              <div className="inline-flex items-center gap-2 rounded-full bg-purple-100 px-4 py-2 text-sm dark:bg-purple-900/30">
                <IconSearch className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <span className="font-medium text-purple-700 dark:text-purple-300">
                  This page needs rescuing too!
                </span>
              </div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="flex flex-col gap-4 sm:flex-row sm:justify-center"
            >
              <Link href="/">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 px-6 py-3 font-medium text-white shadow-lg transition-all hover:bg-purple-700 hover:shadow-xl dark:bg-purple-500 dark:hover:bg-purple-600 sm:w-auto"
                >
                  <IconRocket className="h-5 w-5" />
                  Start Rescue
                </motion.button>
              </Link>
            </motion.div>

            {/* Navigation Links */}
            <motion.div
              variants={itemVariants}
              className="border-t border-gray-200 pt-6 dark:border-slate-200/20"
            >
              <div className="grid grid-cols-1 gap-3 text-center sm:grid-cols-3">
                {rescueLinks.map((link) => (
                  <Link
                    href={link.href}
                    className="group flex items-center justify-center gap-2 rounded-lg p-3 text-sm text-gray-600 transition-all hover:bg-purple-50 hover:text-purple-600 dark:text-gray-400 dark:hover:bg-purple-900/20 dark:hover:text-purple-400"
                  >
                    <IconArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                    {link.label}
                  </Link>
                ))}
              </div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="text-center text-xs text-gray-500 dark:text-gray-400"
            >
              Lost something else? We specialize in finding what&apos;s missing.
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </ScrollAreaWithMobileContraints>
  );
};

export default NotFound;
