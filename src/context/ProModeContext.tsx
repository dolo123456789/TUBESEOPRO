import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface ProModeContextType {
  isPro: boolean;
  toggleProMode: () => void;
  setProMode: (status: boolean) => void;
}

const ProModeContext = createContext<ProModeContextType | undefined>(undefined);

export function ProModeProvider({ children }: { children: ReactNode }) {
  const [isPro, setIsPro] = useState(() => {
    const saved = localStorage.getItem('tube_seo_pro_status');
    return saved === 'true';
  });

  const handleSetProMode = (status: boolean) => {
    setIsPro(status);
    localStorage.setItem('tube_seo_pro_status', status.toString());
  };

  const value = React.useMemo(() => ({ 
    isPro, 
    toggleProMode: () => handleSetProMode(!isPro),
    setProMode: handleSetProMode
  }), [isPro]);

  return (
    <ProModeContext.Provider value={value}>
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
