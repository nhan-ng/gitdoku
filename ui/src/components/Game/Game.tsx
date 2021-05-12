import { Box, Button, Grid } from "@material-ui/core";
import { Sudoku } from "components/Sudoku";
import React, { useState } from "react";
import { BranchList } from ".";
import {
  GetBranchesDocument,
  useAddBranchMutation,
} from "../../__generated__/types";
import { NewBranchButton } from ".";

export const Game = () => {
  const [branchId, setBranchId] = useState("master");
  const [addBranch] = useAddBranchMutation({
    refetchQueries: [
      {
        query: GetBranchesDocument,
      },
    ],
  });

  console.log("Branch", branchId);

  return (
    <Grid container>
      <Grid item md={12}>
        <Sudoku branchId={branchId} />
      </Grid>
      <Box my={6}>
        <NewBranchButton
          onSubmit={async (newBranchId: string) => {
            await addBranch({
              variables: {
                input: {
                  id: newBranchId,
                  branchId: branchId,
                },
              },
            });
            setBranchId(newBranchId);
          }}
        />
      </Box>
      <Grid item md={12}>
        <BranchList onBranchClicked={setBranchId} />
      </Grid>
    </Grid>
  );
};
