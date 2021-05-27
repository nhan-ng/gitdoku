import React from "react";
import { useLobbyContext } from "../../contexts";
import {
  Avatar,
  Box,
  CircularProgress,
  Grid,
  Typography,
} from "@material-ui/core";

export const PlayerList: React.FC = () => {
  const { player } = useLobbyContext();

  const acronym = (input: string): string => {
    const matches = input.match(/\b(\w)/g);
    return matches?.join("").toUpperCase() ?? "NA";
  };

  return (
    <>
      <Avatar alt={player.displayName}>{acronym(player.displayName)}</Avatar>
      <Avatar alt={player.displayName}>{acronym(player.displayName)}</Avatar>
      <Avatar alt={player.displayName}>{acronym(player.displayName)}</Avatar>
    </>
  );
};
