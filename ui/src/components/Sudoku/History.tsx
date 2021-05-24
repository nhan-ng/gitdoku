import { ListItem, ListItemText } from "@material-ui/core";
import React from "react";
import { CommitFragment, CommitType } from "../../__generated__/types";
import { FixedSizeList, ListChildComponentProps } from "react-window";

export type HistoryProps = {
  commits: CommitFragment[];
};

export const History: React.FC<HistoryProps> = ({ commits }) => {
  const HistoryRow = ({ index, style }: ListChildComponentProps) => {
    const commit = commits[index];
    switch (commit.type) {
      case CommitType.Initial:
    }
    return (
      <ListItem button style={style} key={index}>
        <ListItemText
          primary={`[${commit.row + 1}][${commit.col + 1}]: ${commit.type} ${
            commit.val
          }`}
        />
      </ListItem>
    );
  };

  return (
    <FixedSizeList
      height={500}
      width={600}
      itemSize={50}
      itemCount={commits.length}
    >
      {HistoryRow}
    </FixedSizeList>
  );
};
