import {
  Button,
  createStyles,
  Grid,
  LinearProgress,
  makeStyles,
  Theme,
  Typography,
} from "@material-ui/core";
import { Sudoku } from "components/Sudoku";
import React, { useState } from "react";
import { BranchList, BranchSwitcher, PlayerList } from ".";
import {
  GetBranchesDocument,
  GetFullBranchDocument,
  useAddBranchMutation,
  useGetBranchesQuery,
  useMergeBranchMutation,
} from "../../__generated__/types";
import { NewBranchControl } from ".";
import { MergeBranchControl } from "./MergeBranchControl";
import { orderBy } from "lodash";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCodeBranch, faUserFriends } from "@fortawesome/free-solid-svg-icons";

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
    icon: {
      paddingTop: 5,
    },
    summaryGroup: {
      margin: theme.spacing(0, 1.5),
      "& strong": {
        fontWeight: theme.typography.fontWeightBold,
      },
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

  if (loading || error || !data) {
    return <LinearProgress />;
  }

  // Revert sort by commit timestamp, i.e. larger timestamp first
  const branches = orderBy(
    data.branches,
    [
      (branch) => new Date(branch.commit.authorTimestamp).getTime(),
      (branch) => branch.id,
    ],
    ["desc", "asc"]
  );

  const branchIds = branches.map((branch) => branch.id);

  return (
    <Grid container justify="center">
      <Grid item md={12}>
        <Grid
          container
          spacing={1}
          justify="flex-start"
          alignItems="center"
          alignContent="space-around"
        >
          <Grid item md={3}>
            <BranchSwitcher
              branchIds={branchIds}
              currentBranchId={branchId}
              onSelected={setBranchId}
            />
          </Grid>

          <Grid item md={4}>
            <Typography component="span" className={classes.summaryGroup}>
              <FontAwesomeIcon icon={faCodeBranch} />
              <Typography component="strong">{` ${branches.length}`}</Typography>
              <Typography component="span" color="textSecondary">
                {" branches"}
              </Typography>
            </Typography>

            <Typography component="span" className={classes.summaryGroup}>
              <FontAwesomeIcon icon={faUserFriends} />
              <Typography component="strong">{` ${branches.length}`}</Typography>
              <Typography component="span" color="textSecondary">
                {" contributors"}
              </Typography>
            </Typography>
          </Grid>

          <Grid item md>
            <MergeBranchControl
              branchIds={branchIds}
              currentBranchId={branchId}
            />
          </Grid>

          <Grid item md>
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
          </Grid>
        </Grid>
      </Grid>

      <Grid item md={8}>
        <Sudoku branchId={branchId} />
      </Grid>

      <Grid item md={4}>
        <PlayerList />
        <BranchList
          onBranchClicked={setBranchId}
          branches={branches}
          currentBranchId={branchId}
        />
      </Grid>
    </Grid>
  );
};
