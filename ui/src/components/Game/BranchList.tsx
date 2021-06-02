import {
  Box,
  createStyles,
  GridList,
  GridListTile,
  GridListTileBar,
  IconButton,
  makeStyles,
  Theme,
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

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: "flex",
      flexWrap: "wrap",
      backgroundColor: theme.palette.background.paper,
    },
    gridList: {
      width: "100%",
    },
    icon: {
      transform: "rotate(90deg)",
    },
  })
);

export const BranchList: React.FC<BranchListProps> = ({
  currentBranchId,
  branches,
  onBranchClicked,
}) => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <GridList className={classes.gridList} cellHeight={320}>
        {branches.map((branch) => {
          const isCurrentBranch = branch.id === currentBranchId;

          return (
            <GridListTile key={branch.id} cols={2}>
              <Box marginTop={8} marginX={4}>
                <SudokuBoard
                  scale={0.4}
                  board={branch.commit.blob.board}
                  isReadOnly={true}
                />
              </Box>
              <GridListTileBar
                titlePosition="top"
                title={branch.id}
                actionPosition="left"
                actionIcon={
                  !isCurrentBranch && (
                    <IconButton onClick={() => onBranchClicked(branch.id)}>
                      <SwapVertIcon className={classes.icon} />
                    </IconButton>
                  )
                }
              />
            </GridListTile>
          );
        })}
      </GridList>
    </div>
  );
};
