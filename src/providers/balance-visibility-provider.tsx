'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface BalanceVisibilityContextType {
  isBalanceVisible: boolean;
  toggleBalanceVisibility: () => void;
  setBalanceVisibility: (visible: boolean) => void;
}

const BalanceVisibilityContext = createContext<BalanceVisibilityContextType | undefined>(undefined);

export const useBalanceVisibility = () => {
  const context = useContext(BalanceVisibilityContext);
  if (!context) {
    throw new Error('useBalanceVisibility must be used within a BalanceVisibilityProvider');
  }
  return context;
};

interface BalanceVisibilityProviderProps {
  children: React.ReactNode;
}

export const BalanceVisibilityProvider: React.FC<BalanceVisibilityProviderProps> = ({ children }) => {
  const [isBalanceVisible, setIsBalanceVisible] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('balanceVisibility');
      return saved !== null ? JSON.parse(saved) : true;
    }
    return true;
  });

  useEffect(() => {
    localStorage.setItem('balanceVisibility', JSON.stringify(isBalanceVisible));
  }, [isBalanceVisible]);

  const toggleBalanceVisibility = () => {
    setIsBalanceVisible(prev => !prev);
  };

  const setBalanceVisibility = (visible: boolean) => {
    setIsBalanceVisible(visible);
  };

  return (
    <BalanceVisibilityContext.Provider value={{
      isBalanceVisible,
      toggleBalanceVisibility,
      setBalanceVisibility
    }}>
      {children}
    </BalanceVisibilityContext.Provider>
  );
};