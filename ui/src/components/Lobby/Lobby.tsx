import { ApolloProvider } from "@apollo/client";
import { Game } from "components/Game";
import { LobbyContextProvider } from "contexts";
import { newClient } from "graphql";
import React, { useMemo } from "react";
import { useParams } from "react-router-dom";

type LobbyRouteParams = {
  id: string;
};

export const Lobby: React.FC = () => {
  const { id } = useParams<LobbyRouteParams>();

  // Initialize a GraphQL client to the dedicated server
  const address = window.atob(id);
  console.log("Lobby: ", id, "Address", address);
  const client = useMemo(
    () => newClient({ address, withSubscription: true }),
    [address]
  );

  // Render lobby
  return (
    <ApolloProvider client={client}>
      <LobbyContextProvider id={id}>
        <Game />
      </LobbyContextProvider>
    </ApolloProvider>
  );
};
