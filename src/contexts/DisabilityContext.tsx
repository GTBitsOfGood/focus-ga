
import { getDisabilities } from "@/server/db/actions/DisabilityActions";
import { Disability } from "@/utils/types/disability";
import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";

const DisabilityContext = createContext<Disability[] | undefined>(undefined);

export const DisabilityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [disabilities, setDisabilities] = useState<Disability[]>();

  useEffect(() => {
    const fetchDisabilities = async () => {
      const disabilities = await getDisabilities();
      setDisabilities(disabilities);
    };

    fetchDisabilities();
  }, []);

  return (
    <DisabilityContext.Provider value={disabilities}>
      {children}
    </DisabilityContext.Provider>
  );
};

export const useDisabilities = (): Disability[] => {
  const context = useContext(DisabilityContext);
  if (!context) {
    throw new Error("useDisabilities must be used within a DisabilityProvider");
  }
  return context;
};
