import {
  Box,
  GridList,
  GridListTile,
  GridListTileBar,
  IconButton,
  LinearProgress,
} from "@material-ui/core";
import React from "react";
import { Branch, useGetBranchesQuery } from "../../__generated__/types";
import { SudokuBoard } from "../Sudoku";
import SwapVertIcon from "@material-ui/icons/SwapVert";

export type BranchListProps = {
  branches: Pick<Branch, "id" | "commit">[];
  onBranchClicked: (branchId: string) => void;
};

export const BranchList = ({ branches, onBranchClicked }: BranchListProps) => {
  return (
    <GridList cellHeight="auto" cols={3} style={{ flexWrap: "nowrap" }}>
      {branches.map((branch) => (
        <GridListTile key={branch.id}>
          <Box ml={-6}>
            <SudokuBoard
              board={branch.commit.blob.board}
              scale={0.6}
              readOnly={true}
            />
          </Box>
          <GridListTileBar
            title={branch.id}
            actionIcon={
              <IconButton onClick={() => onBranchClicked(branch.id)}>
                <SwapVertIcon />
              </IconButton>
            }
          />
        </GridListTile>
      ))}
    </GridList>
  );
};
