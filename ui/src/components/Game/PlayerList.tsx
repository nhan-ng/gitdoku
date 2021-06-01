import React from "react";
import {
  Avatar,
  createStyles,
  makeStyles,
  Theme,
  Tooltip,
} from "@material-ui/core";
import { useGetPlayersQuery } from "__generated__/types";
import { AvatarGroup } from "@material-ui/lab";
import { orderBy } from "lodash";
import { cyan, deepOrange, deepPurple, pink } from "@material-ui/core/colors";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    orange: {
      color: theme.palette.getContrastText(deepOrange[500]),
      backgroundColor: deepOrange[500],
    },
    purple: {
      color: theme.palette.getContrastText(deepPurple[500]),
      backgroundColor: deepPurple[500],
    },
    pink: {
      color: theme.palette.getContrastText(pink[500]),
      backgroundColor: pink[500],
    },
    cyan: {
      color: theme.palette.getContrastText(cyan[500]),
      backgroundColor: cyan[500],
    },
  })
);

const acronym = (input: string): string => {
  const matches = input.match(/\b(\w)/g);
  return matches?.join("").toUpperCase() ?? "NA";
};

const getHash = (input: string): number => {
  let hash = 0;

  if (input.length == 0) {
    return hash;
  }

  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }

  return hash < 0 ? -hash : hash;
};

type ColorType = keyof ReturnType<typeof useStyles>;

export const PlayerList: React.FC = () => {
  const classes = useStyles();
  const classKeys = Object.keys(classes) as ColorType[];
  console.log("ClassKeys", classKeys);
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
                <Avatar
                  className={
                    classes[
                      classKeys[getHash(player.displayName) % classKeys.length]
                    ]
                  }
                >
                  {acronym(player.displayName)}
                </Avatar>
              </Tooltip>
            );
          })}
        </AvatarGroup>
      )}
    </>
  );
};
