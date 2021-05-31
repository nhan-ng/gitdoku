import {
  Box,
  Button,
  createStyles,
  Divider,
  Grid,
  IconButton,
  LinearProgress,
  makeStyles,
  Paper,
  Theme,
  Tooltip,
  Typography,
  withStyles,
} from "@material-ui/core";
import React from "react";
import CreateIcon from "@material-ui/icons/Create";
import CommentIcon from "@material-ui/icons/Comment";
import BackspaceIcon from "@material-ui/icons/Backspace";
import RateReviewIcon from "@material-ui/icons/RateReview";
import DeleteIcon from "@material-ui/icons/Delete";
import { SudokuInputMode, useSudokuContext } from ".";
import { ToggleButton, ToggleButtonGroup } from "@material-ui/lab";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    paper: {
      display: "flex",
      border: `1px solid ${theme.palette.divider}`,
      flexWrap: "wrap",
      // borderRadius: theme.shape.borderRadius,
      // backgroundColor: theme.palette.background.paper,
      // color: theme.palette.text.secondary,
    },
    grow: {
      flexGrow: 1,
    },
    divider: {
      margin: theme.spacing(1, 0.5),
    },
    number: {
      fontWeight: theme.typography.fontWeightBold,
    },
  })
);

const StyledToggleButtonGroup = withStyles((theme) => ({
  grouped: {
    margin: theme.spacing(0.5),
    border: "none",
    "&:not(:first-child)": {
      borderRadius: theme.shape.borderRadius,
    },
    "&:first-child": {
      borderRadius: theme.shape.borderRadius,
    },
  },
}))(ToggleButtonGroup);

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

  const toggleInputMode = () => {
    dispatch({ type: "TOGGLE_INPUT_MODE" });
  };

  return (
    <Paper elevation={0} className={classes.paper}>
      <StyledToggleButtonGroup
        value={inputMode}
        exclusive
        onChange={toggleInputMode}
      >
        <ToggleButton value={SudokuInputMode.Fill}>
          <Tooltip title="Fill A Cell">
            <CreateIcon />
          </Tooltip>
        </ToggleButton>
        <ToggleButton value={SudokuInputMode.Note}>
          <Tooltip title="Make A Note">
            <RateReviewIcon />
          </Tooltip>
        </ToggleButton>
        <Divider flexItem orientation="vertical" className={classes.divider} />
        <IconButton>
          <Tooltip title="Delete">
            <BackspaceIcon onClick={() => onNumberDelete()} />
          </Tooltip>
        </IconButton>
        <Divider flexItem orientation="vertical" className={classes.divider} />
        {[...Array(9)].map((_, i) => {
          const val = i + 1;
          return (
            <Button key={i} onClick={() => onNumberInput(val)}>
              <Typography
                variant="h5"
                color={
                  inputMode === SudokuInputMode.Fill
                    ? "textPrimary"
                    : "textSecondary"
                }
                className={classes.number}
              >
                {val}
              </Typography>
            </Button>
          );
        })}
      </StyledToggleButtonGroup>
    </Paper>
  );
};
