import { Box, Button, Grid, LinearProgress } from "@material-ui/core";
import { Sudoku } from "components/Sudoku";
import React, { useState } from "react";
import { BranchList } from ".";
import {
  GetBranchesDocument,
  useAddBranchMutation,
  useGetBranchesQuery,
} from "../../__generated__/types";
import { NewBranchControl } from ".";
import { MergeBranchControl } from "./MergeBranchControl";

export const Game = () => {
  const [branchId, setBranchId] = useState("master");
  const { data, loading, error } = useGetBranchesQuery({
    pollInterval: 5000,
  });
  const [addBranch] = useAddBranchMutation({
    refetchQueries: [
      {
        query: GetBranchesDocument,
      },
    ],
  });

  if (loading || error || !data) {
    return <LinearProgress />;
  }

  // Revert sort by commit timestamp, i.e. larger timestamp first
  const branches = [...data.branches].sort(
    (a, b) =>
      new Date(b.commit.authorTimestamp).getTime() -
      new Date(a.commit.authorTimestamp).getTime()
  );

  return (
    <Grid container>
      <Grid item md={12}>
        <Sudoku branchId={branchId} />
      </Grid>
      <Box my={6}>
        <Box mb={3}>
          <NewBranchControl
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
        <MergeBranchControl
          branchIds={branches
            .map((branch) => branch.id)
            .filter((id) => id !== branchId)}
        />
      </Box>
      <Grid item md={12}>
        <BranchList
          onBranchClicked={setBranchId}
          branches={branches}
          currentBranchId={branchId}
        />
      </Grid>
    </Grid>
  );
};
