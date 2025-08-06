'use client';

import { IconClock, IconRocket } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { ConstructionIcon } from 'lucide-react';
import React from 'react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { SidebarLogo } from './icons/sidebar-logo';

export const ComingSoon = () => {
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
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

  const iconBounce = {
    animate: {
      y: [0, -10, 0],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  };

  const features = [
    {
      icon: <IconRocket className="h-6 w-6" />,
      title: 'Enhanced Rescue Features',
      description: 'Advanced fund recovery mechanisms',
    },
    {
      icon: <ConstructionIcon className="h-6 w-6" />,
      title: 'Improved User Experience',
      description: 'Streamlined interface and better workflows',
    },
    {
      icon: <IconClock className="h-6 w-6" />,
      title: 'Faster Processing',
      description: 'Optimized transaction handling',
    },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex min-h-[calc(100vh-120px)] w-full items-center justify-center p-4"
    >
      <Card className="w-full max-w-3xl p-4 shadow-xl md:p-6">
        <CardHeader className="text-center">
          <motion.div variants={itemVariants} className="mx-auto mb-6">
            <motion.div
              variants={iconBounce}
              animate="animate"
              className="inline-block"
            >
              <SidebarLogo className="h-16 w-16" />
            </motion.div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <CardTitle className="mb-4 text-3xl font-bold text-gray-800 dark:text-white">
              Coming Soon
            </CardTitle>
            <CardDescription className="text-lg text-gray-600 dark:text-gray-300">
              We&apos;re working hard to bring you something amazing
            </CardDescription>
          </motion.div>
        </CardHeader>

        <CardContent className="space-y-8">
          <motion.div variants={itemVariants} className="text-center">
            <p className="leading-relaxed text-gray-700 dark:text-gray-200">
              RescueFi is getting an upgrade! We&apos;re building new features
              to make fund recovery even more powerful and user-friendly. Stay
              tuned for exciting updates.
            </p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="grid gap-4 md:grid-cols-3"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center dark:border-slate-200/20 dark:bg-in-black-300"
              >
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30">
                  <div className="text-purple-600 dark:text-purple-400">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="mb-2 text-sm font-semibold text-gray-800 dark:text-white">
                  {feature.title}
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>

          <motion.div variants={itemVariants} className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-purple-100 px-4 py-2 text-sm dark:bg-purple-900/30">
              <div className="h-2 w-2 animate-pulse rounded-full bg-purple-500" />
              <span className="font-medium text-purple-700 dark:text-purple-300">
                Development in progress
              </span>
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="border-t border-gray-200 pt-6 text-center text-sm text-gray-500 dark:border-slate-200/20 dark:text-gray-400"
          >
            Thank you for your patience as we build something extraordinary
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
