import React from "react";
import { useLobbyContext } from "../../contexts";
import { Avatar, Tooltip } from "@material-ui/core";
import { Player, useGetPlayersQuery } from "__generated__/types";
import { AvatarGroup } from "@material-ui/lab";
import { orderBy, sortBy } from "lodash";
import { Spacer } from ".";

const acronym = (input: string): string => {
  const matches = input.match(/\b(\w)/g);
  return matches?.join("").toUpperCase() ?? "NA";
};

export const PlayerList: React.FC = () => {
  // const { currentPlayer } = useLobbyContext();
  const { data, loading, error } = useGetPlayersQuery({
    fetchPolicy: "cache-first",
    pollInterval: 60000,
  });

  const players = data?.players;
  if (loading) {
    return null;
  }
  if (error) {
    console.log("Error when getting players", error);
    return null;
  }

  return (
    <>
      {players && (
        <AvatarGroup max={6}>
          {orderBy(players, [(p) => p.id]).map((player) => {
            return (
              <Tooltip title={player.displayName} key={player.id}>
                <Avatar>{acronym(player.displayName)}</Avatar>
              </Tooltip>
            );
          })}
        </AvatarGroup>
      )}
    </>
  );
};
