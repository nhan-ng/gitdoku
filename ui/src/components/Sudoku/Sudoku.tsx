import { History, SudokuBoard } from ".";
import { BranchContextProvider } from "contexts/BranchContextProvider";
import {
  OnCommitAddedDocument,
  OnCommitAddedSubscription,
  OnCommitAddedSubscriptionVariables,
  useGetFullBranchQuery,
} from "__generated__/types";
import React, { useEffect, useState } from "react";
import { Button, Grid, LinearProgress, Typography } from "@material-ui/core";
import { AppLoading } from "components/AppLoading";

export type SudokuProps = {
  branchId: string;
};

export function Sudoku({ branchId }: SudokuProps) {
  const { data, error, loading, subscribeToMore } = useGetFullBranchQuery({
    variables: {
      id: branchId,
    },
  });
  useEffect(() => {
    console.log("BranchId", branchId);
    return subscribeToMore<
      OnCommitAddedSubscription,
      OnCommitAddedSubscriptionVariables
    >({
      document: OnCommitAddedDocument,
      variables: {
        branchId: branchId,
      },
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData) {
          return prev;
        }
        const newCommit = subscriptionData.data.commitAdded;

        if (prev.branch.commits.find((c) => c.id === newCommit.id)) {
          return prev;
        }

        return {
          __typename: prev.__typename,
          branch: {
            ...prev.branch,
            commit: newCommit,
            commits: [newCommit, ...prev.branch.commits],
          },
        };
      },
    });
  }, [subscribeToMore, branchId]);

  if (loading) {
    return <LinearProgress />;
  }

  if (error || !data) {
    return <>Error: {error}</>;
  }

  const board = data.branch.commit.blob.board;
  const commits = data.branch.commits;

  return (
    <BranchContextProvider id={branchId}>
      <Grid container direction="row" justify="center" alignItems="flex-start">
        <Grid item md={8}>
          <Typography>{branchId}</Typography>
          <SudokuBoard board={board} scale={1} readOnly={false} />
        </Grid>
        <Grid item md={4}>
          <History commits={commits} />
        </Grid>
      </Grid>
    </BranchContextProvider>
  );
}
