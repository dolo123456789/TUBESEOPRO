import React, { createContext, useState, useContext } from 'react';

interface SearchContextType {
  lastKeyword: string;
  setLastKeyword: (keyword: string) => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const SearchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lastKeyword, setLastKeyword] = useState('');
  const value = React.useMemo(() => ({ lastKeyword, setLastKeyword }), [lastKeyword]);
  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
};

export const useSearchContext = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearchContext must be used within a SearchProvider');
  }
  return context;
};
