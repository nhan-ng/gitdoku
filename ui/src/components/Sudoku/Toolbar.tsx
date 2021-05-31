import {
  Box,
  Button,
  createStyles,
  Divider,
  Grid,
  IconButton,
  LinearProgress,
  makeStyles,
  Theme,
  Typography,
} from "@material-ui/core";
import React from "react";
import FormatAlignLeftIcon from "@material-ui/icons/FormatAlignLeft";
import FormatAlignCenterIcon from "@material-ui/icons/FormatAlignCenter";
import FormatAlignRightIcon from "@material-ui/icons/FormatAlignRight";
import FormatBoldIcon from "@material-ui/icons/FormatBold";
import FormatItalicIcon from "@material-ui/icons/FormatItalic";
import FormatUnderlinedIcon from "@material-ui/icons/FormatUnderlined";
import CreateIcon from "@material-ui/icons/Create";
import CommentIcon from "@material-ui/icons/Comment";
import { useSudokuContext } from ".";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      border: `1px solid ${theme.palette.divider}`,
      borderRadius: theme.shape.borderRadius,
      backgroundColor: theme.palette.background.paper,
      color: theme.palette.text.secondary,
      "& svg": {
        margin: theme.spacing(1.5),
      },
      "& hr": {
        margin: theme.spacing(0, 0.5),
      },
    },
    grow: {
      flexGrow: 1,
    },
  })
);

type ToolbarProps = {
  onNumberInput: (input: number) => Promise<void>;
  onNumberDelete: () => Promise<void>;
};

export const Toolbar: React.FC<ToolbarProps> = ({
  onNumberInput,
  onNumberDelete,
}) => {
  const classes = useStyles();
  const {
    state: { branchId, inputMode, selectedCell },
    dispatch,
  } = useSudokuContext();

  const isFillInputMode = inputMode === "fill";
  const toggleInputMode = () => {
    dispatch({ type: "TOGGLE_INPUT_MODE" });
  };

  return (
    <Grid container alignItems="center" className={classes.root}>
      {isFillInputMode ? (
        <CreateIcon onClick={toggleInputMode} />
      ) : (
        <CommentIcon onClick={toggleInputMode} />
      )}
      <Divider orientation="vertical" flexItem />
      {[...Array(9)].map((_, i) => {
        const val = i + 1;
        return (
          <Button key={i} onClick={() => onNumberInput(val)}>
            {val}
          </Button>
        );
      })}
      <div className={classes.grow} />
    </Grid>
  );
};
