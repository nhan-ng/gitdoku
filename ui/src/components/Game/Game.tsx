import { Sudoku } from "components/Sudoku";
import React, { useState } from "react";
import { useAddCommitMutation, useGetSudokuQuery } from "__generated__/types";

type Cell = {
  row: number;
  col: number;
};

export function Game() {
  const { data, error, loading } = useGetSudokuQuery();
  const [selectedCell, setSelectedCell] = useState<Cell>();
  const [commit, { data: commitedData }] = useAddCommitMutation();

  if (loading || error) {
    return <>Loading or Error: {error}</>;
  }

  if (!data) {
    return <>Invalid state</>;
  }

  const {
    sudoku: { board },
  } = data;

  if (selectedCell) {
    console.log(
      `Selected cell: [${selectedCell.row + 1}][${selectedCell.col + 1}]`
    );
  }

  function onClick(row: number, col: number) {
    setSelectedCell({ row, col });
  }
  async function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    console.log(e);
    if (selectedCell && e.key >= "1" && e.key <= "9") {
      await commit({
        variables: {
          input: {
            row: selectedCell.row,
            col: selectedCell.col,
            val: 3,
            refHeadId: "master", // Fix this
          },
        },
      });
    }
  }

  return (
    <div onKeyDown={onKeyDown} tabIndex={0}>
      <Sudoku board={board} onCellClicked={onClick} />;
    </div>
  );
}
