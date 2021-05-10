import { Button, Grid } from "@material-ui/core";
import { Sudoku } from "components/Sudoku";
import React, { useState } from "react";
import { BranchList } from "components/BranchList";
import {
  GetBranchesDocument,
  useAddBranchMutation,
} from "../../__generated__/types";

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
      <Grid item md={12}>
        <Button
          variant="contained"
          color="primary"
          onClick={async () => {
            try {
              await addBranch({
                variables: {
                  input: {
                    id: `${Date.now()}`,
                    branchId: branchId,
                  },
                },
              });
            } catch (e) {
              console.log("Failed to add branch", e);
            }
          }}
        >
          Create new branch
        </Button>
      </Grid>
      <Grid item md={12}>
        <BranchList onBranchClicked={setBranchId} />
      </Grid>
    </Grid>
  );
};
