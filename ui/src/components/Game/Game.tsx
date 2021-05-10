import { Sudoku } from "components/Sudoku";
import { RefHeadContextProvider } from "contexts/RefHeadContextProvider";
import {
  OnCommitAddedDocument,
  OnCommitAddedSubscription,
  OnCommitAddedSubscriptionVariables,
  useGetFullRefHeadQuery,
} from "__generated__/types";
import { History } from "components/History";
import React, { useEffect } from "react";
import { Grid } from "@material-ui/core";

export function Game() {
  const { data, error, loading, subscribeToMore } = useGetFullRefHeadQuery({
    variables: {
      id: "master",
    },
  });
  useEffect(() => {
    return subscribeToMore<
      OnCommitAddedSubscription,
      OnCommitAddedSubscriptionVariables
    >({
      document: OnCommitAddedDocument,
      variables: {
        refHeadId: "master",
      },
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData) {
          return prev;
        }
        const newCommit = subscriptionData.data.commitAdded;

        if (prev.refHead.commits.find((c) => c.id === newCommit.id)) {
          return prev;
        }

        return {
          __typename: prev.__typename,
          refHead: {
            ...prev.refHead,
            commit: newCommit,
            commits: [...prev.refHead.commits, newCommit],
          },
        };
      },
    });
  }, [subscribeToMore]);

  if (loading || error || !data) {
    return <>Loading or Error: {error}</>;
  }

  const board = data.refHead.commit.blob.board;
  const commits = data.refHead.commits.slice().reverse();

  return (
    <RefHeadContextProvider id="master">
      <Grid container direction="row" justify="center" alignItems="flex-start">
        <Grid item sm={8}>
          <Sudoku board={board} />
        </Grid>
        <Grid item sm={4}>
          <History commits={commits} />
        </Grid>
      </Grid>
    </RefHeadContextProvider>
  );
}
