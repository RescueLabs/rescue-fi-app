'use client';

import { IconArrowRight } from '@tabler/icons-react';
import Link from 'next/link';
import React, { FC } from 'react';

import { RescueOptionType } from '@/data/rescue-options';
import { cn } from '@/lib/utils';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';

import { SidebarLogo } from './icons/sidebar-logo';

interface RescueOptionsProps {
  rescueOptions: RescueOptionType[];
}

export const RescueOptions: FC<RescueOptionsProps> = ({ rescueOptions }) => (
  <Card
    withBackground={false}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 1, delayChildren: 0.5 }}
    className="mb-3 flex flex-col px-2 py-8 md:py-12"
  >
    <CardHeader className="mb-8 flex flex-col items-center gap-y-10">
      <CardTitle>
        <SidebarLogo className="ml-3 h-20 w-20" />
      </CardTitle>

      <div className="space-y-2 px-6 text-center text-gray-800 dark:text-white">
        <CardDescription className="!text-sm font-normal leading-8">
          Welcome to RescueFi
        </CardDescription>
        <CardDescription className="!text-[22px] font-semibold leading-8">
          Please select the funds rescue option you need
        </CardDescription>
      </div>
    </CardHeader>

    <CardContent className="mb-12 flex w-full flex-col items-center gap-y-4">
      {rescueOptions.map((option) => (
        <Link
          href={option.href}
          passHref
          className="w-full max-w-[600px]"
          key={option.id}
        >
          <button
            className={cn(
              'group flex w-full flex-wrap items-center justify-between gap-2 rounded-md bg-white px-4 py-3 hover:shadow hover:shadow-purple-200 dark:bg-in-black-300 min-[325px]:flex-nowrap min-[410px]:flex-nowrap',
            )}
          >
            {option.icon}

            <div className="flex min-w-[150px] flex-auto flex-col gap-y-1 text-left lg:min-w-0">
              <p className="text-sm font-semibold text-gray-800 dark:text-white">
                {option.title}
              </p>
              <p className="text-xs text-gray-500 dark:text-slate-300">
                {option.description}
              </p>
            </div>

            <div
              className={cn(
                '!text-xxs bg-in-slate-300 rounded-2xl border-2 border-white bg-purple-100 px-3 py-1.5 font-medium text-purple-500 dark:border-in-black-300 dark:bg-purple-800 dark:text-purple-50',
              )}
            >
              <p>Explore</p>
            </div>

            <IconArrowRight className="text-in-gray-175 dark:text-in-slate-700 h-4 w-4 min-w-4 transition-all group-hover:translate-x-1 group-hover:text-purple-600 dark:group-hover:text-purple-200" />
          </button>
        </Link>
      ))}
    </CardContent>
  </Card>
);
