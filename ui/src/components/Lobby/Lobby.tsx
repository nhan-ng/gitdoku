import { Game } from "components/Game";
import { LobbyContextProvider } from "contexts";
import React from "react";
import { Route, Switch, useParams, useRouteMatch } from "react-router-dom";

type LobbyRouteParams = {
  id: string;
};

export const Lobby: React.FC = () => {
  const { id } = useParams<LobbyRouteParams>();
  console.log("Lobby: ", id);

  // Render lobby
  return (
    <LobbyContextProvider id={id}>
      <Game />;
    </LobbyContextProvider>
  );
};
