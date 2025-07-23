import { useContext, createContext } from 'react';

interface RescueTokenContextType {
  rescueTokenAddresses: `0x${string}`[];
  setRescueTokenAddresses: (rescueTokenAddresses: `0x${string}`[]) => void;
}

export const RescueTokenContext = createContext<RescueTokenContextType>({
  rescueTokenAddresses: [],
  setRescueTokenAddresses: () => {},
});

export const useRescueTokenContext = () => {
  const context = useContext(RescueTokenContext);
  if (!context) {
    throw new Error(
      'useRescueTokenContext must be used within a RescueTokenProvider',
    );
  }
  return context;
};
