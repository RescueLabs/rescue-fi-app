import { useContext, createContext, useState, useMemo } from 'react';

import { RescueRequest } from '@/types/rescue';

interface FinalBundleContextType {
  finalBundleSuccess: boolean;
  setFinalBundleSuccess: (finalBundleSuccess: boolean) => void;
  finalBundle: RescueRequest | null;
  setFinalBundle: (finalBundle: RescueRequest) => void;
}

export const FinalBundleContext = createContext<FinalBundleContextType>({
  finalBundle: null,
  setFinalBundle: () => {},
  finalBundleSuccess: false,
  setFinalBundleSuccess: () => {},
});

export const FinalBundleProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [finalBundle, setFinalBundle] = useState<RescueRequest | null>(null);
  const [finalBundleSuccess, setFinalBundleSuccess] = useState(false);

  const contextValue = useMemo(
    () => ({
      finalBundle,
      setFinalBundle,
      finalBundleSuccess,
      setFinalBundleSuccess,
    }),
    [finalBundle, setFinalBundle, finalBundleSuccess, setFinalBundleSuccess],
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
