import { makeStyles } from "@material-ui/core";
import React from "react";

const useStyles = makeStyles({
  grow: {
    flexGrow: 1,
  },
});

export const Spacer: React.FC = () => {
  const classes = useStyles();
  return <div className={classes.grow} />;
};
