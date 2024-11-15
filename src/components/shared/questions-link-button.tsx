import { IconQuestionMark } from '@tabler/icons-react';
import Link from 'next/link';
import React from 'react';

import { Button } from '../ui/button';

export const QuestionsLinkButton = () => {
  return (
    <Link href="/faqs" className="fixed bottom-4 right-4">
      <Button className="group flex h-8 w-[34px] items-center justify-end gap-1.5 whitespace-nowrap !rounded-full px-2 transition-[width] duration-200 ease-in-out hover:w-[110px]">
        <span className="opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          Questions
        </span>
        <IconQuestionMark className="size-4 min-w-4" />
      </Button>
    </Link>
  );
};
