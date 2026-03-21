'use client';

import React, { createContext, ReactNode, useContext, useState } from 'react';

interface HeaderConfig {
  title?: string;
  backButton?: {
    enabled: boolean;
    onClick?: () => void;
  };
  rightButton?: ReactNode;
}

interface HeaderContextType {
  config: HeaderConfig;
  setConfig: (config: HeaderConfig) => void;
}

const HeaderContext = createContext<HeaderContextType | undefined>(undefined);

export function HeaderProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<HeaderConfig>({
    title: 'Toto Suppie',
  });

  return <HeaderContext.Provider value={{ config, setConfig }}>{children}</HeaderContext.Provider>;
}

export function useHeader() {
  const context = useContext(HeaderContext);
  if (context === undefined) throw new Error('useHeader must be used within a HeaderProvider');
  return context;
}
