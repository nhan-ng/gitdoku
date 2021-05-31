import { History, SudokuBoard, Toolbar } from ".";
import {
  CommitType,
  OnCommitAddedDocument,
  OnCommitAddedSubscription,
  OnCommitAddedSubscriptionVariables,
  useAddCommitMutation,
  useGetFullBranchQuery,
} from "__generated__/types";
import React, { useEffect } from "react";
import {
  Box,
  createStyles,
  Grid,
  LinearProgress,
  makeStyles,
  Theme,
  Typography,
} from "@material-ui/core";
import { Fab } from "@material-ui/core";
import EditIcon from "@material-ui/icons/Edit";
import NoteIcon from "@material-ui/icons/Note";
import ClearIcon from "@material-ui/icons/Clear";
import { SudokuContextProvider, useSudokuContext } from "./SudokuContext";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      border: `1px solid ${theme.palette.divider}`,
      borderRadius: theme.shape.borderRadius,
      backgroundColor: theme.palette.background.paper,
      color: theme.palette.text.secondary,
      "& svg": {
        margin: theme.spacing(1.5),
      },
      "& hr": {
        margin: theme.spacing(0, 0.5),
      },
    },
    grow: {
      flexGrow: 1,
    },
    layout: {
      height: "700px",
    },
  })
);

const Layout: React.FC = ({ children }) => {
  const classes = useStyles();

  return <Box className={classes.layout}>{children}</Box>;
};

type SudokuProps = {
  branchId: string;
};

const SudokuComponent: React.FC = () => {
  const {
    state: { branchId, inputMode, selectedCell },
    dispatch,
  } = useSudokuContext();

  const { data, error, loading, subscribeToMore } = useGetFullBranchQuery({
    variables: {
      id: branchId,
    },
  });

  const [addCommit, addCommitMutation] = useAddCommitMutation();

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

  const onNumberInput = async (val: number) => {
    if (!selectedCell) {
      return;
    }

    try {
      await addCommit({
        variables: {
          input: {
            type:
              inputMode === "fill" ? CommitType.AddFill : CommitType.ToggleNote,
            branchId: branchId,
            row: selectedCell.row,
            col: selectedCell.col,
            val: val,
          },
        },
      });
    } catch (err) {
      console.log(err);
    }
  };

  const onNumberDelete = async () => {
    if (!selectedCell) {
      return;
    }

    try {
      await addCommit({
        variables: {
          input: {
            type: CommitType.RemoveFill,
            branchId: branchId,
            row: selectedCell.row,
            col: selectedCell.col,
          },
        },
      });
    } catch (err) {
      console.log(err);
    }
  };

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
    <Layout>
      <Grid container>
        <Grid item md={8}>
          <Toolbar
            onNumberInput={onNumberInput}
            onNumberDelete={onNumberDelete}
          />
          <SudokuBoard
            board={board}
            loading={addCommitMutation.loading}
            onNumberInput={onNumberInput}
            onNumberDelete={onNumberDelete}
          />
        </Grid>
        <Grid item md={4}>
          <History commits={commits} />
        </Grid>
      </Grid>
    </Layout>
  );
};

export const Sudoku: React.FC<SudokuProps> = ({ branchId }) => {
  return (
    <SudokuContextProvider branchId={branchId}>
      <SudokuComponent />
    </SudokuContextProvider>
  );
};
