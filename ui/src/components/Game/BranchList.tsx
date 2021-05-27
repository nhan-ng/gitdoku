import {
  Box,
  GridList,
  GridListTile,
  GridListTileBar,
  IconButton,
} from "@material-ui/core";
import React from "react";
import { LiteBranchFragment } from "../../__generated__/types";
import { SudokuBoard } from "../Sudoku";
import SwapVertIcon from "@material-ui/icons/SwapVert";
import styled from "styled-components";

type BranchListProps = {
  currentBranchId: string;
  branches: Pick<LiteBranchFragment, "id" | "commit">[];
  onBranchClicked: (branchId: string) => void;
};

const StyledGridList = styled(GridList)`
  flex-wrap: nowrap;
`;

export const BranchList: React.FC<BranchListProps> = ({
  currentBranchId,
  branches,
  onBranchClicked,
}) => {
  return (
    <StyledGridList cellHeight="auto" cols={3}>
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
            <Box ml={-12} mt={-6}>
              <SudokuBoard
                board={branch.commit.blob.board}
                scale={0.5}
                inputMode={"readonly"}
              />
            </Box>
          </GridListTile>
        );
      })}
    </StyledGridList>
  );
};
