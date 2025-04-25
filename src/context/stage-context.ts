import { useContext, createContext } from 'react';

interface StageContextType {
  setStage: (stage: number) => void;
}

export const StageContext = createContext<StageContextType>({
  setStage: () => {},
});

export const useStageContext = () => {
  const context = useContext(StageContext);
  if (!context) {
    throw new Error('useStageContext must be used within a StageProvider');
  }
  return context;
};
