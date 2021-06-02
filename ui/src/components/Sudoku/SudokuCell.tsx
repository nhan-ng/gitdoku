import {
  LinearProgress,
  createStyles,
  Grid,
  makeStyles,
  TableCell,
  Theme,
  CircularProgress,
  Fade,
} from "@material-ui/core";
import clsx from "clsx";
import React from "react";
import { Cell } from "../../__generated__/types";

type StyledProps = {
  isSelected?: boolean;
  isPeered?: boolean;
  isImmutable?: boolean;
};

const useStyles = makeStyles<Theme, StyledProps>((theme: Theme) =>
  createStyles({
    note: {
      fontSize: "0.3em",
      textAlign: "center",
    },
    noteTransparent: {
      color: "transparent",
    },
    cell: {
      borderWidth: "1px",
      borderStyle: "solid",
      borderColor: theme.palette.primary.light,
      cursor: "pointer",
      fontWeight: theme.typography.fontWeightBold,
      fontSize: "2rem",
      textAlign: "center",
      padding: theme.spacing(1),
      width: "2em",
      height: "1.6em",
      color: ({ isImmutable }) =>
        isImmutable ? theme.palette.primary.dark : theme.palette.success.dark,
      backgroundColor: ({ isSelected, isPeered }) =>
        isSelected
          ? theme.palette.grey.A100
          : isPeered
          ? theme.palette.grey.A200
          : "transparent",
      "&:nth-child(3n)": {
        borderRight: `3px solid ${theme.palette.primary.dark}`,
      },
    },
  })
);

type SudokuCellProps = {
  isSelected: boolean;
  isPeered: boolean;
  cell: Cell;
  onClick: () => void;
};

const NotesCell: React.FC<Pick<Cell, "notes">> = ({ notes }) => {
  const classes = useStyles({});

  return (
    <Grid container justify="center" alignItems="center" alignContent="center">
      {[...Array(9)].map((_, i) => {
        const note = notes.includes(i + 1) ? i + 1 : 0;

        return (
          <Grid
            item
            sm={4}
            key={i}
            className={clsx(
              classes.note,
              note === 0 && classes.noteTransparent
            )}
          >
            {note}
          </Grid>
        );
      })}
    </Grid>
  );
};

export const SudokuCell: React.FC<SudokuCellProps> = ({
  isSelected,
  isPeered,
  cell,
  onClick,
}) => {
  const { immutable, val: value, notes } = cell;
  const classes = useStyles({
    isSelected,
    isPeered,
    isImmutable: immutable,
  });

  return (
    <TableCell className={classes.cell} onClick={() => onClick()}>
      {value !== 0 ? (
        value
      ) : notes.length === 0 ? null : (
        <NotesCell notes={notes} />
      )}
    </TableCell>
  );
};
