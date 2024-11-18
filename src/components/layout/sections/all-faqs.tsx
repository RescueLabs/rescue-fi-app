'use client';

import { motion } from 'framer-motion';
import React from 'react';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const allFaqs = [
  {
    question: 'Why do we need private key of victim wallet?',
    answer:
      'The private key of the victim wallet is required to access the wallet account and sign the transaction to transfer the funds to the rescue wallet.',
  },
  {
    question: 'What is the victim wallet?',
    answer:
      'The victim wallet is the wallet that is being scammed. you are trying to rescue funds from.',
  },
  {
    question: 'What is the rescue wallet?',
    answer:
      'The rescue wallet is the wallet that sends ETH to the victim wallet to cover the transaction fees for the transfer of funds from the victim wallet to receiver wallet.',
  },
  {
    question: 'Why do I need to send ETH to the rescue wallet?',
    answer:
      'You need to send ETH to the rescue wallet to cover the transaction fees for the transfer of funds from the victim wallet to the rescue wallet. The rescue wallet is advised to be a fresh wallet in order to clear your doubts, and reduce the risk of losing any extra funds.',
  },
  {
    question: 'What is the receiver wallet?',
    answer:
      'The receiver wallet is the wallet that will receive the funds from the victim wallet.',
  },
];

export const AllFaqs = () => {
  return (
    <>
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.15 }}
        className="text-center text-3xl font-bold"
      >
        Frequently Asked Questions
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className="w-full"
      >
        <Accordion type="single" collapsible className="w-full">
          {allFaqs.map((faq, index) => (
            <AccordionItem value={`item-${index + 1}`} key={index}>
              <AccordionTrigger>{faq.question}</AccordionTrigger>
              <AccordionContent>{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </motion.div>
    </>
  );
};
