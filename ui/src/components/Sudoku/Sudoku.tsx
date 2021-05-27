import { History, SudokuBoard } from ".";
import { BranchContextProvider } from "contexts";
import {
  OnCommitAddedDocument,
  OnCommitAddedSubscription,
  OnCommitAddedSubscriptionVariables,
  useGetFullBranchQuery,
} from "__generated__/types";
import React, { useEffect, useState } from "react";
import { Grid, LinearProgress, Typography } from "@material-ui/core";
import { Fab } from "@material-ui/core";
import EditIcon from "@material-ui/icons/Edit";
import NoteIcon from "@material-ui/icons/Note";
import ClearIcon from "@material-ui/icons/Clear";
import styled from "styled-components";

export type SudokuProps = {
  branchId: string;
};

const FixedHeightContainer = styled(Grid)`
  height: 500px;
`;

const Layout: React.FC = ({ children }) => {
  return (
    <FixedHeightContainer
      container
      direction="row"
      justify="center"
      alignItems="flex-start"
    >
      {children}
    </FixedHeightContainer>
  );
};

export const Sudoku: React.FC<SudokuProps> = ({ branchId }: SudokuProps) => {
  const [isFillInputMode, setIsFillInputMode] = useState(true); // If false -> Note input mode
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

  const toggleInputMode = () => setIsFillInputMode((prev) => !prev);

  if (loading) {
    return (
      <Layout>
        <Grid item sm={12}>
          <LinearProgress />
        </Grid>
      </Layout>
    );
  }

  if (error || !data) {
    return <>Error: {error}</>;
  }

  const board = data.branch.commit.blob.board;
  const commits = data.branch.commits;

  return (
    <BranchContextProvider id={branchId}>
      <Layout>
        <Grid item md={8}>
          <Grid
            container
            direction="row"
            justify="flex-start"
            alignItems="flex-start"
          >
            <Grid item md={9}>
              <Typography variant="h5">{branchId}</Typography>
            </Grid>
          </Grid>
          <SudokuBoard
            board={board}
            inputMode={isFillInputMode ? "fill" : "note"}
            toggleInputMode={toggleInputMode}
          />
        </Grid>
        <Grid item md={4}>
          <Fab
            color={isFillInputMode ? "primary" : "secondary"}
            onClick={toggleInputMode}
          >
            {isFillInputMode ? <EditIcon /> : <NoteIcon />}
          </Fab>
          <Fab color="secondary" onClick={toggleInputMode}>
            <ClearIcon />
          </Fab>
          <History commits={commits} />
        </Grid>
      </Layout>
    </BranchContextProvider>
  );
};
