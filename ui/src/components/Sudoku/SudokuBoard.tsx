import {
  Cell,
  CommitType,
  useAddCommitMutation,
} from "../../__generated__/types";
import React, { useState } from "react";
import { useBranchContext } from "../../contexts/BranchContext";
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
      borderStyle: "solid",
      borderColor: theme.palette.primary.light,
      borderCollapse: "collapse",
    },
    scaled: {
      transform: ({ scale }) => `scale(${scale})`,
    },
    row: {
      "&:nth-child(3n)": {
        borderBottom: `2px solid ${theme.palette.primary.light}`,
      },
    },
  })
);

type SelectedCell = {
  row: number;
  col: number;
};

export type SudokuBoardProps = {
  scale?: number;
  board: Cell[][];
  inputMode: InputMode;
  toggleInputMode?: () => void;
};

export type InputMode = "fill" | "note" | "readonly";

export const SudokuBoard: React.FC<SudokuBoardProps> = ({
  scale,
  board,
  inputMode,
  toggleInputMode,
}) => {
  const branchId = useBranchContext();
  const [selectedCell, setSelectedCell] = useState<SelectedCell>();
  const [addCommit, { loading }] = useAddCommitMutation();

  const classes = useStyles({ scale });

  const isReadOnly = inputMode === "readonly";

  function onCellClicked(row: number, col: number) {
    if (isReadOnly) {
      return;
    }
    if (!selectedCell) {
      setSelectedCell({ row, col });
    } else if (selectedCell.row !== row || selectedCell.col !== col) {
      setSelectedCell({ row, col });
    } else {
      setSelectedCell(undefined);
    }
  }

  console.log("rerender");

  function moveSelectedCell(
    selectedCell: SelectedCell,
    rowDelta: number,
    colDelta: number
  ) {
    const newRow = Math.min(8, Math.max(0, selectedCell.row + rowDelta));
    const newCol = Math.min(8, Math.max(0, selectedCell.col + colDelta));
    setSelectedCell({ row: newRow, col: newCol });
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
        moveSelectedCell(selectedCell, 1, 0);
        return;

      case "ArrowLeft":
        moveSelectedCell(selectedCell, 0, -1);
        return;

      case "ArrowRight":
        moveSelectedCell(selectedCell, 0, 1);
        return;

      case "ArrowUp":
        moveSelectedCell(selectedCell, -1, 0);
        return;

      case " ":
        if (toggleInputMode) {
          toggleInputMode();
        }
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
                    const isSelected =
                      (selectedCell &&
                        selectedCell.row === i &&
                        selectedCell.col === j) ||
                      false;
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
