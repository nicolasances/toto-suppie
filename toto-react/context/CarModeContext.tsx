"use client";

import { createContext, ReactNode, useContext, useState } from "react";

interface CarModeContextContent {
  carMode: boolean;
  setCarMode: (carMode: boolean) => void;
  toggleCarMode: () => void;
}

const CarModeContext = createContext<CarModeContextContent | undefined>(undefined);

interface CarModeContextProviderProps {
  children: ReactNode;
}

export const CarModeContextProvider: React.FC<CarModeContextProviderProps> = ({ children }) => {
  const [carMode, setCarMode] = useState(false);

  const toggleCarMode = () => {
    setCarMode(!carMode);
  };

  return (
    <CarModeContext.Provider value={{ carMode, setCarMode, toggleCarMode }}>
      {children}
    </CarModeContext.Provider>
  );
};

export const useCarMode = (): CarModeContextContent => {
  const context = useContext(CarModeContext);
  if (!context) {
    throw new Error("useCarMode must be used within a CarModeContextProvider");
  }
  return context;
};
