import { Metadata } from 'next';
// import dynamic from 'next/dynamic';
import React, { Suspense } from 'react';

import { ComingSoon } from '@/components/shared/coming-soon';
import { ScrollAreaWithMobileContraints } from '@/components/shared/scrollarea-with-mobile-constraints';

export const metadata: Metadata = {
  title: 'RescueFi | Rescue airdrop funds',
};

// const AirdropStepForm = dynamic(
//   () =>
//     import('@/components/shared/step-form/test-airdrop-step-form').then(
//       (mod) => mod.AirdropStepForm,
//     ),
//   {
//     ssr: false,
//   },
// );

const RescueAirdropFundsPage = () => {
  return (
    <ScrollAreaWithMobileContraints>
      <Suspense fallback={null}>
        {/* <AirdropStepForm /> */}
        <ComingSoon />
      </Suspense>
    </ScrollAreaWithMobileContraints>
  );
};

export default RescueAirdropFundsPage;
