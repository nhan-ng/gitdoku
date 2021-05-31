import {
  Box,
  GridList,
  GridListTile,
  GridListTileBar,
  IconButton,
  makeStyles,
} from "@material-ui/core";
import React from "react";
import { LiteBranchFragment } from "../../__generated__/types";
import { SudokuBoard } from "../Sudoku";
import SwapVertIcon from "@material-ui/icons/SwapVert";

type BranchListProps = {
  currentBranchId: string;
  branches: Pick<LiteBranchFragment, "id" | "commit">[];
  onBranchClicked: (branchId: string) => void;
};

const useStyles = makeStyles({
  container: {
    flexWrap: "nowrap",
  },
});

export const BranchList: React.FC<BranchListProps> = ({
  currentBranchId,
  branches,
  onBranchClicked,
}) => {
  const classes = useStyles();

  return (
    <GridList className={classes.container} cellHeight="auto" cols={3}>
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
                scale={0.5}
                board={branch.commit.blob.board}
                isReadOnly={true}
              />
            </Box>
          </GridListTile>
        );
      })}
    </GridList>
  );
};
