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

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('success') === 'true') {
      setIsPro(true);
      localStorage.setItem('tube_seo_pro_status', 'true');
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const handleSetProMode = (status: boolean) => {
    setIsPro(status);
    localStorage.setItem('tube_seo_pro_status', status.toString());
  };

  return (
    <ProModeContext.Provider value={{ 
      isPro, 
      toggleProMode: () => handleSetProMode(!isPro),
      setProMode: handleSetProMode
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
