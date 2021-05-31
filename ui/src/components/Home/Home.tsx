import { ApolloProvider } from "@apollo/client";
import {
  Button,
  CircularProgress,
  createStyles,
  LinearProgress,
  makeStyles,
  Theme,
} from "@material-ui/core";
import React, { useMemo, useState } from "react";
import { newClient } from "../../graphql/client";
import { green } from "@material-ui/core/colors";
import { Redirect } from "react-router";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: "flex",
      alignItems: "center",
    },
    wrapper: {
      margin: theme.spacing(1),
      position: "relative",
      flexGrow: 1,
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
    <div className={classes.root}>
      <div className={classes.wrapper}>
        {gameId && <Redirect push to={`/l/${gameId}`} />}
        <Button
          onClick={handleOnClick}
          variant="contained"
          color="primary"
          disabled={loading}
          fullWidth={true}
        >
          New Game
        </Button>
        {loading && <LinearProgress />}
      </div>
    </div>
  );
};
