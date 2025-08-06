import React from 'react';

import SupportUsSection from '@/components/layout/sections/support-us-section';
import { ScrollAreaWithMobileContraints } from '@/components/shared/scrollarea-with-mobile-constraints';

const SupportUsPage = () => {
  return (
    <ScrollAreaWithMobileContraints>
      <SupportUsSection />
    </ScrollAreaWithMobileContraints>
  );
};

export default SupportUsPage;
