import { useEffect, useRef } from 'react';

export const useEffectOnce = (fn: () => void) => {
  const hasRun = useRef(false);

  useEffect(() => {
    if (!hasRun.current) {
      fn();
    }

    return () => {
      hasRun.current = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};
