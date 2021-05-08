import { Sudoku } from "components/Sudoku";
import React, { useState } from "react";
import {
  CommitType,
  GetRefHeadDocument,
  useAddCommitMutation,
  useGetRefHeadQuery,
  useOnCommitAddedSubscription,
} from "__generated__/types";

type SelectedCell = {
  row: number;
  col: number;
};

export function Game() {
  const { data, error, loading } = useGetRefHeadQuery({
    variables: {
      id: "master",
    },
  });
  const [selectedCell, setSelectedCell] = useState<SelectedCell>();

  const { data: commitAddedData } = useOnCommitAddedSubscription({
    variables: {
      refHeadId: "master",
    },
  });

  console.log("Render");

  if (loading || error) {
    return <>Loading or Error: {error}</>;
  }

  if (!data) {
    return <>Invalid state</>;
  }

  const board = commitAddedData
    ? commitAddedData.commitAdded.blob.board
    : data.refHead.commit.blob.board;

  function onClick(row: number, col: number) {
    setSelectedCell({ row, col });
  }

  return <Sudoku board={board} refHeadId="master" />;
}
