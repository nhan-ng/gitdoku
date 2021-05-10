import { createContext } from "react";

export const RefHeadContext = createContext<string>("");

export type RefHeadContextProviderProps = {
  id: string;
  children: React.ReactNode;
};

export const RefHeadContextProvider = ({
  children,
  id,
}: RefHeadContextProviderProps) => {
  return (
    <RefHeadContext.Provider value={id}>{children}</RefHeadContext.Provider>
  );
};
