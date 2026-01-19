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
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);

  // Load preference from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('balanceVisibility');
    if (saved !== null) {
      setIsBalanceVisible(JSON.parse(saved));
    }
  }, []);

  // Save preference to localStorage when it changes
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