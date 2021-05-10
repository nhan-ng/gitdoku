import { useContext } from "react";
import { RefHeadContext } from "../contexts/RefHeadContextProvider";

export const useRefHeadContext = () => useContext(RefHeadContext);
