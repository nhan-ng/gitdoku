import { createContext, useContext } from "react";

export const BranchContext = createContext<string>("");

export type BranchContextProviderProps = {
  id: string;
};

export const BranchContextProvider: React.FC<BranchContextProviderProps> = ({
  id,
  children,
}) => {
  return <BranchContext.Provider value={id} children={children} />;
};

export const useBranchContext = () => useContext(BranchContext);
