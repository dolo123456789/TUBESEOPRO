import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ProModeContextType {
  isPro: boolean;
  toggleProMode: () => void;
  setProMode: (status: boolean) => void;
}

const ProModeContext = createContext<ProModeContextType | undefined>(undefined);

export function ProModeProvider({ children }: { children: ReactNode }) {
  const [isPro, setIsPro] = useState(false);
  return (
    <ProModeContext.Provider value={{ 
      isPro, 
      toggleProMode: () => setIsPro(!isPro),
      setProMode: (status: boolean) => setIsPro(status)
    }}>
      {children}
    </ProModeContext.Provider>
  );
}

export function useProMode() {
  const context = useContext(ProModeContext);
  if (context === undefined) {
    throw new Error('useProMode must be used within a ProModeProvider');
  }
  return context;
}
