'use client';

import { motion } from 'framer-motion';
import React from 'react';

import { Skeleton } from '@/components/ui/skeleton';

export const FaqsLoading = () => {
  const containerVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.15,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.2 },
    },
  };

  // Create 6 skeleton items to match the number of FAQs
  const skeletonItems = Array.from({ length: 6 }, (_, index) => index);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full"
    >
      {/* Title Skeleton */}
      <motion.div variants={itemVariants} className="mb-20 text-center">
        <Skeleton className="mx-auto h-9 w-80" />
      </motion.div>

      {/* Accordion Skeleton */}
      <motion.div variants={itemVariants} className="mb-8 w-full">
        <div className="w-full space-y-0">
          {skeletonItems.map((index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="border-b border-slate-500 py-4"
            >
              {/* Question/Trigger Skeleton */}
              <div className="flex items-center justify-between gap-x-3">
                <Skeleton
                  className={`h-6 ${
                    // Vary the width to make it look more natural
                    index === 0
                      ? 'w-72'
                      : index === 1
                        ? 'w-48'
                        : index === 2
                          ? 'w-56'
                          : index === 3
                            ? 'w-80'
                            : index === 4
                              ? 'w-64'
                              : 'w-52'
                  }`}
                />
                {/* Chevron icon skeleton */}
                <Skeleton className="h-6 w-6 shrink-0 rounded-full" />
              </div>

              {/* Content skeleton - shown for first item to simulate default open state */}
              {index === 0 && (
                <motion.div variants={itemVariants} className="mt-4 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-4/5" />
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};
