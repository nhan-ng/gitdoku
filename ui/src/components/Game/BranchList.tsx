import {
  Box,
  GridList,
  GridListTile,
  GridListTileBar,
  IconButton,
  LinearProgress,
} from "@material-ui/core";
import React from "react";
import {
  LiteBranchFragment,
  useGetBranchesQuery,
} from "../../__generated__/types";
import { SudokuBoard } from "../Sudoku";
import SwapVertIcon from "@material-ui/icons/SwapVert";

export type BranchListProps = {
  currentBranchId: string;
  branches: Pick<LiteBranchFragment, "id" | "commit">[];
  onBranchClicked: (branchId: string) => void;
};

export const BranchList = ({
  currentBranchId,
  branches,
  onBranchClicked,
}: BranchListProps) => {
  return (
    <GridList cellHeight="auto" cols={3} style={{ flexWrap: "nowrap" }}>
      {branches.map((branch) => {
        const isCurrentBranch = branch.id === currentBranchId;

        return (
          <GridListTile key={branch.id}>
            <GridListTileBar
              titlePosition="top"
              title={branch.id}
              actionPosition="left"
              actionIcon={
                !isCurrentBranch && (
                  <IconButton onClick={() => onBranchClicked(branch.id)}>
                    <SwapVertIcon />
                  </IconButton>
                )
              }
            />
            <Box ml={-6}>
              <SudokuBoard
                board={branch.commit.blob.board}
                scale={0.6}
                readOnly={true}
              />
            </Box>
          </GridListTile>
        );
      })}
    </GridList>
  );
};
