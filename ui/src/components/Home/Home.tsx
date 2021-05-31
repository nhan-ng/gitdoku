import { ApolloProvider } from "@apollo/client";
import {
  Button,
  CircularProgress,
  createStyles,
  makeStyles,
  Theme,
} from "@material-ui/core";
import React, { useMemo, useState } from "react";
import { newClient } from "../../graphql/client";
import { green } from "@material-ui/core/colors";
import { Redirect } from "react-router";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    buttonProgress: {
      color: green[500],
      position: "absolute",
      top: "50%",
      left: "50%",
      marginTop: -12,
      marginLeft: -12,
    },
  })
);

export const Home: React.FC = () => {
  const classes = useStyles();

  const [loading, setLoading] = useState(false);
  const [gameId, setGameId] = useState<string>();

  const handleOnClick = async (event: React.SyntheticEvent) => {
    event.preventDefault();
    if (!loading) {
      setLoading(true);
    }

    try {
      const response = await fetch("/", {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();

      setGameId(data.gameId);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {gameId && <Redirect push to={`/l/${gameId}`} />}
      <Button
        onClick={handleOnClick}
        variant="contained"
        color="primary"
        disabled={loading}
      >
        New Game
      </Button>
      {loading && (
        <CircularProgress size={24} className={classes.buttonProgress} />
      )}
    </>
  );
};
