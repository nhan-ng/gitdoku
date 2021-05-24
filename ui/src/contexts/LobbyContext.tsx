import { LinearProgress } from "@material-ui/core";
import React, { createContext, useContext, useEffect } from "react";
import { Player, useJoinMutation } from "__generated__/types";

export type LobbyState = {
  id: string;
  player: Pick<Player, "id" | "displayName">;
};

const defaultState: LobbyState = {
  id: "",
  player: {
    id: "",
    displayName: "",
  },
};

export const LobbyContext = createContext<LobbyState>(defaultState);

export type LobbyContextProviderProps = {
  id: string;
};

export const LobbyContextProvider: React.FC<LobbyContextProviderProps> = ({
  id,
  children,
}) => {
  const [join, { loading, error, data }] = useJoinMutation({});

  useEffect(() => {
    join();
  }, []);

  if (loading || error || !data) {
    return <LinearProgress />;
  }

  const player = data.join;

  return (
    <LobbyContext.Provider value={{ id, player }}>
      {children}
    </LobbyContext.Provider>
  );
};

export const useLobbyContext = (): LobbyState => useContext(LobbyContext);
