import { useContext, createContext, useState, useMemo } from 'react';

import { RescueRequest } from '@/types/rescue';

interface FinalBundleContextType {
  finalBundle: RescueRequest | null;
  setFinalBundle: (finalBundle: RescueRequest) => void;
}

export const FinalBundleContext = createContext<FinalBundleContextType>({
  finalBundle: null,
  setFinalBundle: () => {},
});

export const FinalBundleProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [finalBundle, setFinalBundle] = useState<RescueRequest | null>(null);

  const contextValue = useMemo(
    () => ({ finalBundle, setFinalBundle }),
    [finalBundle, setFinalBundle],
  );

  return (
    <FinalBundleContext.Provider value={contextValue}>
      {children}
    </FinalBundleContext.Provider>
  );
};

export const useFinalBundleContext = () => {
  const context = useContext(FinalBundleContext);

  if (!context) {
    throw new Error(
      'useFinalBundleContext must be used within a FinalBundleProvider',
    );
  }

  return context;
};
