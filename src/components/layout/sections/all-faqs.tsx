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
      'The rescue wallet is a wallet that will receive the funds from the victim wallet.',
  },
  {
    question: 'Why do I need to send ETH to the rescue wallet?',
    answer:
      'You need to send ETH to the rescue wallet to cover the transaction fees for the transfer of funds from the victim wallet to the rescue wallet. The rescue wallet is advised to be a fresh wallet in order to clear your doubts, and reduce the risk of losing any extra funds.',
  },
];

export const AllFaqs = () => {
  return (
    <Accordion type="single" collapsible className="w-full">
      {allFaqs.map((faq, index) => (
        <AccordionItem value={`item-${index + 1}`} key={index}>
          <AccordionTrigger>{faq.question}</AccordionTrigger>
          <AccordionContent>{faq.answer}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};
