import {
  Cell,
  CommitType,
  useAddCommitMutation,
} from "../../__generated__/types";
import styled from "styled-components";
import React, { useState } from "react";
import { useRefHeadContext } from "../../hooks";
import { Table, TableBody, TableRow, TableCell } from "@material-ui/core";

// const backgroundColor = "#FFF";
// const blue = "hsl(210, 88%, 56%)";
const grey = "hsl(213, 30%, 29%)";
const greyLight = "hsl(213, 30%, 59%)";
const greyLighter = "hsl(213, 30%, 79%)";
const orange = "hsl(34, 26%, 89%)";
// const orangeDark = "hsl(34, 76%, 89%)";

const SudokuTable = styled(Table)`
  border: 2px solid ${grey};
  border-collapse: collapse;
`;

const SudokuRow = styled(TableRow)`
  &:nth-child(3n) {
    border-bottom: 2px solid ${grey};
  }
`;

type SudokuCellProps = {
  immutable: boolean;
  isSelected: boolean;
};
const SudokuCell = styled(TableCell)<SudokuCellProps>`
  border: 1px solid ${greyLighter};
  cursor: pointer;
  color: ${({ immutable }) => (immutable ? grey : greyLight)};
  background-color: ${({ isSelected }) =>
    isSelected ? orange : "transparent"};
  &:nth-child(3n) {
    border-right: 2px solid ${grey};
  }
`;

type SelectedCell = {
  row: number;
  col: number;
};

export type SudokuProps = {
  board: Cell[][];
};

export function Sudoku({ board }: SudokuProps) {
  const refHeadId = useRefHeadContext();
  const [selectedCell, setSelectedCell] = useState<SelectedCell>();
  const [addCommit] = useAddCommitMutation();

  function onCellClicked(row: number, col: number) {
    if (!selectedCell) {
      setSelectedCell({ row, col });
    } else if (selectedCell.row !== row || selectedCell.col !== col) {
      setSelectedCell({ row, col });
    } else {
      setSelectedCell(undefined);
    }
  }

  console.log("rerender");

  async function onKeyDown(e: React.KeyboardEvent<HTMLTableElement>) {
    e.preventDefault();
    console.log("Key down", e.key);
    if (!selectedCell) {
      return;
    }

    const action =
      e.key >= "1" && e.key <= "9"
        ? CommitType.AddFill
        : e.key === "0" || e.key === "Backspace" || e.key === "Delete"
        ? CommitType.RemoveFill
        : CommitType.Unknown;

    if (action !== CommitType.Unknown) {
      console.log("Add new commit", action);
      try {
        await addCommit({
          variables: {
            input: {
              row: selectedCell.row,
              col: selectedCell.col,
              val: parseInt(e.key, 10) || 0,
              type: action,
              refHeadId: refHeadId,
            },
          },
        });
      } catch (e) {
        console.log(e);
      }
    }
  }

  return (
    <SudokuTable onKeyDown={onKeyDown} tabIndex={0}>
      <TableBody>
        {board.map((row, i) => {
          return (
            <SudokuRow key={`${i}`}>
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
                return (
                  <SudokuCell
                    immutable={cell.immutable}
                    isSelected={isSelected}
                    key={`${i}${j}`}
                    onClick={() => onCellClicked(i, j)}
                  >
                    {cell.val === 0 ? " " : cell.val}
                  </SudokuCell>
                );
              })}
            </SudokuRow>
          );
        })}
      </TableBody>
    </SudokuTable>
  );
}
