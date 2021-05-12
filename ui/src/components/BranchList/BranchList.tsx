import {
  Box,
  GridList,
  GridListTile,
  GridListTileBar,
  IconButton,
  LinearProgress,
} from "@material-ui/core";
import React from "react";
import { useGetBranchesQuery } from "../../__generated__/types";
import { SudokuBoard } from "../SudokuBoard";
import InfoIcon from "@material-ui/icons/Info";

export type BranchListProps = {
  onBranchClicked: (branchId: string) => void;
};

export const BranchList = ({ onBranchClicked }: BranchListProps) => {
  const { data, loading, error } = useGetBranchesQuery({
    pollInterval: 5000,
  });
  if (loading || error || !data) {
    return <LinearProgress />;
  }

  const branches = data.branches;

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
                <InfoIcon />
              </IconButton>
            }
          />
        </GridListTile>
      ))}
    </GridList>
  );
};
