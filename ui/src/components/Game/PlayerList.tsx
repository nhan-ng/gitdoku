import React from "react";
import { useLobbyContext } from "../../contexts";
import { Avatar } from "@material-ui/core";
import { Player, useGetPlayersQuery } from "__generated__/types";
import { AvatarGroup } from "@material-ui/lab";
import { sortBy } from "lodash";

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
        <AvatarGroup max={3}>
          {sortBy(players, (p) => p.id).map((player) => {
            return (
              <Avatar key={player.id}>{acronym(player.displayName)}</Avatar>
            );
          })}
        </AvatarGroup>
      )}
    </>
  );
};
