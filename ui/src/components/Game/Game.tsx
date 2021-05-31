import {
  Box,
  Button,
  createStyles,
  Divider,
  Grid,
  LinearProgress,
  makeStyles,
  Theme,
} from "@material-ui/core";
import { Sudoku } from "components/Sudoku";
import React, { useState } from "react";
import { BranchList, PlayerList, Toolbar } from ".";
import {
  GetBranchesDocument,
  GetFullBranchDocument,
  useAddBranchMutation,
  useGetBranchesQuery,
  useMergeBranchMutation,
} from "../../__generated__/types";
import { NewBranchControl } from ".";
import { MergeBranchControl } from "./MergeBranchControl";
import FormatAlignLeftIcon from "@material-ui/icons/FormatAlignLeft";
import FormatAlignCenterIcon from "@material-ui/icons/FormatAlignCenter";
import FormatAlignRightIcon from "@material-ui/icons/FormatAlignRight";
import FormatBoldIcon from "@material-ui/icons/FormatBold";
import FormatItalicIcon from "@material-ui/icons/FormatItalic";
import FormatUnderlinedIcon from "@material-ui/icons/FormatUnderlined";
import { orderBy, sortBy } from "lodash";

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
  })
);

export const Game: React.FC = () => {
  const classes = useStyles();

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

  const [mergeBranch] = useMergeBranchMutation({
    refetchQueries: [
      {
        query: GetFullBranchDocument,
        variables: {
          id: branchId,
        },
      },
    ],
  });

  if (loading || error || !data) {
    return <LinearProgress />;
  }

  // Revert sort by commit timestamp, i.e. larger timestamp first
  const branches = orderBy(
    data.branches,
    [(branch) => new Date(branch.commit.authorTimestamp).getTime()],
    ["desc"]
  );

  return (
    <Grid container>
      <Grid item md={12}>
        <Sudoku branchId={branchId} />
        <PlayerList />
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
          onSubmit={async (targetBranchId) => {
            await mergeBranch({
              variables: {
                input: {
                  sourceBranchId: branchId,
                  targetBranchId,
                  authorId: "me",
                },
              },
            });
          }}
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
