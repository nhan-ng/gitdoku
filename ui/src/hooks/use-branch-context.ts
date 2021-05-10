import { useContext } from "react";
import { BranchContext } from "../contexts/BranchContextProvider";

export const useBranchContext = () => useContext(BranchContext);
