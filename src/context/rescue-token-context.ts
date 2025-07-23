import { useContext, createContext } from 'react';

interface RescueTokenContextType {
  rescueTokenAddresses: `0x${string}`[];
  setRescueTokenAddresses: (rescueTokenAddresses: `0x${string}`[]) => void;
}

export const RescueTokenContext = createContext<RescueTokenContextType>({
  setStage: () => {},
});

export const useStageContext = () => {
  const context = useContext(StageContext);
  if (!context) {
    throw new Error('useStageContext must be used within a StageProvider');
  }
  return context;
};
