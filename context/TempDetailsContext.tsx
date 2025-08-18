import React, { createContext, useContext, useState } from 'react';

export type TempDetails = {
  dueDate?: Date;
  dueTime?: Date;
  priority?: 'high' | 'medium' | 'low';
  earlyReminder?: string;
  repeat?: string;
  location?: string;
};

type TempDetailsContextType = {
  tempDetails: TempDetails | null;
  setTempDetails: (details: TempDetails | null) => void;
};

const TempDetailsContext = createContext<TempDetailsContextType | undefined>(undefined);

export const useTempDetailsContext = () => {
  const ctx = useContext(TempDetailsContext);
  if (!ctx) throw new Error("useTempDetailsContext must be used inside TempDetailsProvider");
  return ctx;
};

export const TempDetailsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tempDetails, setTempDetails] = useState<TempDetails | null>(null);

  return (
    <TempDetailsContext.Provider value={{ tempDetails, setTempDetails }}>
      {children}
    </TempDetailsContext.Provider>
  );
};
