import { History, SudokuBoard, SudokuInputMode, Toolbar } from ".";
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
  Paper,
  Theme,
  Typography,
} from "@material-ui/core";
import { SudokuContextProvider, useSudokuContext } from "./SudokuContext";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    grow: {
      flexGrow: 1,
    },
    root: {
      // height: "50em",
    },
    history: {
      height: "100%",
      marginBottom: theme.spacing(3),
    },
    spacer: {
      marginBottom: theme.spacing(3),
    },
    summary: {
      padding: theme.spacing(1),
      margin: theme.spacing(1, 0),
    },
  })
);

type SudokuProps = {
  branchId: string;
};

const SudokuComponent: React.FC = () => {
  const {
    state: { branchId, inputMode, selectedCell },
    dispatch,
  } = useSudokuContext();

  console.log("Use Sudoku Context. BranchID: ", branchId);

  const { data, error, loading, subscribeToMore } = useGetFullBranchQuery({
    variables: {
      id: branchId,
    },
  });

  const classes = useStyles();

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

  useEffect(() => {
    dispatch({ type: "SET_LOADING", loading: addCommitMutation.loading });
  }, [addCommitMutation.loading, dispatch]);

  const onNumberInput = async (val: number) => {
    if (!selectedCell) {
      return;
    }

    try {
      await addCommit({
        variables: {
          input: {
            type:
              inputMode === SudokuInputMode.Fill
                ? CommitType.AddFill
                : CommitType.ToggleNote,
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
      <div className={classes.root}>
        <Grid item sm={12}>
          <LinearProgress />
        </Grid>
      </div>
    );
  }

  if (error || !data) {
    return <>Error: {error}</>;
  }

  const lastCommit = data.branch.commit;
  const lastCommitDate = new Date(lastCommit.authorTimestamp);
  const board = lastCommit.blob.board;
  const commits = data.branch.commits;

  return (
    <Grid
      direction="column"
      container
      alignContent="flex-start"
      spacing={1}
      className={classes.root}
    >
      <Grid item md={12}>
        <SudokuBoard
          board={board}
          onNumberInput={onNumberInput}
          onNumberDelete={onNumberDelete}
        />

        <Box marginY={1}>
          <Toolbar
            onNumberInput={onNumberInput}
            onNumberDelete={onNumberDelete}
          />
        </Box>
        <Paper elevation={0} className={classes.summary}>
          <Typography variant="h4" color="primary" gutterBottom>
            {`Branch: ${branchId}`}
          </Typography>
          <Typography variant="subtitle1" gutterBottom>
            {`Last committed: ${lastCommitDate.toLocaleString()}`}
          </Typography>
        </Paper>
      </Grid>
      <Grid item md={12} className={classes.history}>
        <History commits={commits} />
      </Grid>
    </Grid>
  );
};

export const Sudoku: React.FC<SudokuProps> = ({ branchId }) => {
  console.log("Rerender Sudoku. BranchID: ", branchId);
  return (
    <SudokuContextProvider branchId={branchId}>
      <SudokuComponent />
    </SudokuContextProvider>
  );
};
