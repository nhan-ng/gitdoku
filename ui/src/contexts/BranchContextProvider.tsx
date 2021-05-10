import { createContext } from "react";

export const BranchContext = createContext<string>("");

export type BranchContextProviderProps = {
  id: string;
  children: React.ReactNode;
};

export const BranchContextProvider = ({
  children,
  id,
}: BranchContextProviderProps) => {
  return (
    <BranchContext.Provider value={id}>{children}</BranchContext.Provider>
  );
};
