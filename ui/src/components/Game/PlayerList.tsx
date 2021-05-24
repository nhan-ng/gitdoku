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
    <Grid container direction="row" justify="flex-start" alignItems="center">
      <Grid item sm={1}>
        <Avatar alt={player.displayName}>{acronym(player.displayName)}</Avatar>
      </Grid>
      <Grid item sm={11}>
        <Typography>{player.displayName}</Typography>
      </Grid>
    </Grid>
  );
};
