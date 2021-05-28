import { History, SudokuBoard } from ".";
import { BranchContextProvider } from "contexts";
import {
  OnCommitAddedDocument,
  OnCommitAddedSubscription,
  OnCommitAddedSubscriptionVariables,
  useGetFullBranchQuery,
} from "__generated__/types";
import React, { useEffect, useState } from "react";
import {
  Box,
  createStyles,
  Divider,
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
import FormatAlignLeftIcon from "@material-ui/icons/FormatAlignLeft";
import FormatAlignCenterIcon from "@material-ui/icons/FormatAlignCenter";
import FormatAlignRightIcon from "@material-ui/icons/FormatAlignRight";
import FormatBoldIcon from "@material-ui/icons/FormatBold";
import FormatItalicIcon from "@material-ui/icons/FormatItalic";
import FormatUnderlinedIcon from "@material-ui/icons/FormatUnderlined";
import { PlayerList } from "components/Game";

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

export const Sudoku: React.FC<SudokuProps> = ({ branchId }: SudokuProps) => {
  const classes = useStyles();
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
    <Layout>
      <BranchContextProvider id={branchId}>
        <Grid container>
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
        </Grid>
      </BranchContextProvider>
    </Layout>
  );
};
