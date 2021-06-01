import {
  createStyles,
  ListItem,
  ListItemText,
  makeStyles,
  Paper,
  Theme,
  Typography,
} from "@material-ui/core";
import React from "react";
import { CommitFragment, CommitType } from "../../__generated__/types";
import { FixedSizeList, ListChildComponentProps } from "react-window";
import {
  Timeline,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineDotProps,
  TimelineItem,
  TimelineOppositeContent,
  TimelineSeparator,
} from "@material-ui/lab";
import CreateIcon from "@material-ui/icons/Create";
import PlayArrowIcon from "@material-ui/icons/PlayArrow";
import BackspaceIcon from "@material-ui/icons/Backspace";
import RateReviewIcon from "@material-ui/icons/RateReview";

export type HistoryProps = {
  commits: CommitFragment[];
};

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      height: "100%",
      overflow: "auto",
    },
  })
);

const getCommitDot = (commitType: CommitType): JSX.Element => {
  switch (commitType) {
    case CommitType.Initial:
      return (
        <TimelineDot color="grey">
          <PlayArrowIcon fontSize="small" />
        </TimelineDot>
      );
    case CommitType.AddFill:
      return (
        <TimelineDot color="primary">
          <CreateIcon fontSize="small" />
        </TimelineDot>
      );
    case CommitType.ToggleNote:
      return (
        <TimelineDot color="primary">
          <RateReviewIcon fontSize="small" />
        </TimelineDot>
      );
    case CommitType.RemoveFill:
      return (
        <TimelineDot color="secondary">
          <BackspaceIcon fontSize="small" />
        </TimelineDot>
      );

    default:
      return <TimelineDot />;
  }
};

export const History: React.FC<HistoryProps> = ({ commits }) => {
  const classes = useStyles();
  const lastItemIndex = commits.length - 1;

  return (
    <Paper className={classes.root}>
      <Timeline>
        {commits.map((commit, idx) => {
          return (
            <TimelineItem key={commit.id}>
              <TimelineOppositeContent>
                <Typography color="textSecondary">
                  {new Date(commit.authorTimestamp).toLocaleTimeString()}
                </Typography>
              </TimelineOppositeContent>
              <TimelineSeparator>
                {getCommitDot(commit.type)}
                {idx !== lastItemIndex && <TimelineConnector />}
              </TimelineSeparator>
              <TimelineContent>
                <Typography>{commit.type}</Typography>
              </TimelineContent>
            </TimelineItem>
          );
        })}
      </Timeline>
    </Paper>
  );
};
