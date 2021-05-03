import { useGetSudokuQuery } from "../../__generated__/types";
import styled from "styled-components";
import React from "react";

const backgroundColor = "#FFF";
const blue = "hsl(210, 88%, 56%)";
const grey = "hsl(213, 30%, 29%)";
const greyLight = "hsl(213, 30%, 59%)";
const greyLighter = "hsl(213, 30%, 79%)";
const orange = "hsl(34, 26%, 89%)";
const orangeDark = "hsl(34, 76%, 89%)";

const SudokuTable = styled.table`
  font-size: 26px;
  margin: 30px;
  border: 2px solid ${grey};
  border-collapse: collapse;
`;

const SudokuRow = styled.tr`
  &:nth-child(3n) {
    border-bottom: 2px solid ${grey};
  }
`;
const SudokuCell = styled.td`
  border: 1px solid ${greyLighter};
  padding: 12px 16px;
  cursor: pointer;
  &:nth-child(3n) {
    border-right: 2px solid ${grey};
  }
`;

export type SudokuProps = {
  onCellClicked: (row: number, col: number) => void;
  board: number[][];
};

export function Sudoku(props: SudokuProps) {
  const { board, onCellClicked } = props;
  return (
    <SudokuTable>
      <tbody>
        {board.map((row, i) => {
          return (
            <SudokuRow key={`row-${i}`}>
              {row.map((cell, j) => {
                return (
                  <SudokuCell
                    key={`cell-${i}${j}`}
                    onClick={() => onCellClicked(i, j)}
                  >
                    {cell === 0 ? " " : cell}
                  </SudokuCell>
                );
              })}
            </SudokuRow>
          );
        })}
      </tbody>
    </SudokuTable>
  );
}
