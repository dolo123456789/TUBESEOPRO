import React, { createContext, useContext, useState, ReactNode, useEffect, useMemo } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';

interface ProModeContextType {
  isPro: boolean;
  toggleProMode: () => void;
  setProMode: (status: boolean) => void;
  isLoading: boolean;
}

const ProModeContext = createContext<ProModeContextType | undefined>(undefined);

export function ProModeProvider({ children }: { children: ReactNode }) {
  const [isPro, setIsPro] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const response = await fetch('/api/user/status', {
            headers: {
              'x-user-email': user.email || ''
            }
          });
          if (response.ok) {
            const data = await response.json();
            setIsPro(data.isPro);
          }
        } catch (error) {
          console.error('Failed to fetch pro status:', error);
        }
      } else {
        setIsPro(false);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSetProMode = (status: boolean) => {
    setIsPro(status);
  };

  const value = useMemo(() => ({ 
    isPro, 
    toggleProMode: () => handleSetProMode(!isPro),
    setProMode: handleSetProMode,
    isLoading
  }), [isPro, isLoading]);

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
