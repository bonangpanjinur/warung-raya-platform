import React from 'react';
import { WhitelabelContext, useWhitelabelProvider } from '@/hooks/useWhitelabel';

export function WhitelabelProvider({ children }: { children: React.ReactNode }) {
  const whitelabel = useWhitelabelProvider();

  return (
    <WhitelabelContext.Provider value={whitelabel}>
      {children}
    </WhitelabelContext.Provider>
  );
}
