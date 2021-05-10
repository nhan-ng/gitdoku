import { CommitFragment } from "../../__generated__/types";

export type HistoryProps = {
  commits: CommitFragment[];
};

export const History = ({ commits }: HistoryProps) => {
  return (
    <ul>
      {commits.map((commit) => {
        return (
          <li key={commit.id}>
            [{commit.row + 1}][{commit.col + 1}]: +{commit.val}
          </li>
        );
      })}
    </ul>
  );
};
