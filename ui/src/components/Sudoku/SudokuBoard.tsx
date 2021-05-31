import {
  Cell,
  CommitType,
  useAddCommitMutation,
} from "../../__generated__/types";
import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableRow,
  TableContainer,
  Paper,
  Box,
  LinearProgress,
  createStyles,
  Theme,
  makeStyles,
} from "@material-ui/core";
import { SudokuCell } from ".";
import clsx from "clsx";
import { useSudokuContext } from "./SudokuContext";

type StyledProps = {
  scale?: number;
};

const useStyles = makeStyles<Theme, StyledProps>((theme: Theme) =>
  createStyles({
    root: {
      width: "max-content",
    },
    table: {
      borderRadius: theme.shape.borderRadius,
      border: `4px solid ${theme.palette.primary.dark}`,
      borderCollapse: "collapse",
    },
    scaled: {
      transform: ({ scale }) => `scale(${scale})`,
    },
    row: {
      "&:nth-child(3n)": {
        borderBottom: `3px solid ${theme.palette.primary.dark}`,
      },
    },
  })
);

export type SudokuBoardProps = {
  scale?: number;
  board: Cell[][];
  isReadOnly?: boolean;
};

export type InputMode = "fill" | "note";

export const SudokuBoard: React.FC<SudokuBoardProps> = ({
  scale,
  board,
  isReadOnly,
}) => {
  const {
    state: { selectedCell, inputMode, branchId },
    dispatch,
  } = useSudokuContext();
  const [addCommit, { loading }] = useAddCommitMutation();

  const classes = useStyles({ scale });

  function onCellClicked(row: number, col: number) {
    if (isReadOnly) {
      return;
    }
    dispatch({
      type: "SET_SELECTED_CELL",
      row,
      col,
    });
  }

  async function onKeyDown(e: React.KeyboardEvent<HTMLTableElement>) {
    e.preventDefault();
    console.log("Key down", e.key);
    if (!selectedCell || isReadOnly) {
      return;
    }

    // Move selected cell
    switch (e.key) {
      case "ArrowDown":
        dispatch({ type: "MOVE_DOWN" });
        return;

      case "ArrowLeft":
        dispatch({ type: "MOVE_LEFT" });
        return;

      case "ArrowRight":
        dispatch({ type: "MOVE_RIGHT" });
        return;

      case "ArrowUp":
        dispatch({ type: "MOVE_UP" });
        return;

      case " ":
        dispatch({ type: "TOGGLE_INPUT_MODE" });
        return;
    }

    // If the input is number 1-9
    const action =
      "1" <= e.key && e.key <= "9"
        ? inputMode === "fill"
          ? CommitType.AddFill
          : CommitType.ToggleNote
        : e.key === "0" || e.key === "Backspace" || e.key === "Delete"
        ? CommitType.RemoveFill
        : CommitType.Unknown;

    if (action === CommitType.Unknown) {
      return;
    }

    console.log("Add new commit", action);
    try {
      await addCommit({
        variables: {
          input: {
            row: selectedCell.row,
            col: selectedCell.col,
            val: parseInt(e.key, 10) || 0,
            type: action,
            branchId: branchId,
          },
        },
      });
    } catch (e) {
      console.log(e);
    }
  }

  const selectedVal = selectedCell
    ? board[selectedCell.row][selectedCell.col].val
    : 0;

  return (
    <TableContainer
      className={clsx(classes.root, scale && classes.scaled)}
      component={Paper}
    >
      <Box fontWeight="fontWeightBold">
        <Table className={classes.table} onKeyDown={onKeyDown} tabIndex={0}>
          <TableBody>
            {board.map((row, i) => {
              return (
                <TableRow className={classes.row} key={`${i}`}>
                  {row.map((cell, j) => {
                    const isSelected = !!(
                      selectedCell &&
                      selectedCell.row === i &&
                      selectedCell.col === j
                    );
                    if (isSelected) {
                      console.log(
                        "Selected cell",
                        JSON.stringify(selectedCell),
                        i,
                        j
                      );
                    }

                    const isPeered =
                      selectedVal === cell.val && selectedVal !== 0;

                    return (
                      <SudokuCell
                        cell={cell}
                        isSelected={isSelected}
                        isPeered={isPeered}
                        key={`${i}${j}`}
                        onClick={() => onCellClicked(i, j)}
                      />
                    );
                  })}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        {loading && <LinearProgress />}
      </Box>
    </TableContainer>
  );
};
