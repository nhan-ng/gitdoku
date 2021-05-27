import { Grid, makeStyles, TableCell } from "@material-ui/core";
import React from "react";
import styled, { css } from "styled-components";
import { Cell } from "../../__generated__/types";

// const backgroundColor = "#FFF";
// const blue = "hsl(210, 88%, 56%)";
const grey = "hsl(213, 30%, 29%)";
const greyLight = "hsl(213, 30%, 59%)";
const greyLighter = "hsl(213, 30%, 79%)";
const orange = "hsl(34, 26%, 89%)";
const orangeDark = "hsl(34, 76%, 89%)";

// Define quick style prop with "$" prefix to avoid React throwing unknown
// DOM prop names
type StyledSudokuCellProps = {
  $isSelected: boolean;
  $isPeered: boolean;
  $isImmutable: boolean;
};
const StyledSudokuCell = styled(TableCell)<StyledSudokuCellProps>`
  border: 1px solid ${greyLighter};
  cursor: pointer;
  font-weight: bolder;
  text-align: center;
  font-size: 2rem;
  padding: 2px;
  width: 1.6em;
  height: 1.6em;
  color: ${({ $isImmutable }) => ($isImmutable ? grey : greyLight)};
  background-color: ${({ $isSelected, $isPeered }) =>
    $isSelected ? orangeDark : $isPeered ? orange : "transparent"};
  &:nth-child(3n) {
    border-right: 2px solid ${grey};
  }
`;

type NoteProps = {
  $transparent: boolean;
};
const StyledGridItem = styled(Grid)<NoteProps>`
  font-size: 0.3em;
  text-align: center;
  ${({ $transparent }) =>
    $transparent &&
    css`
      color: transparent;
    `};
`;

type SudokuCellProps = {
  isSelected: boolean;
  isPeered: boolean;
  cell: Cell;
  onClick: () => void;
};

const NotesCell: React.FC<Pick<Cell, "notes">> = ({ notes }) => {
  return (
    <Grid container justify="center" alignItems="center" alignContent="center">
      {[...Array(9)].map((_, i) => {
        const note = notes.includes(i + 1) ? i + 1 : 0;

        return (
          <StyledGridItem item sm={4} key={i} $transparent={note === 0}>
            {note}
          </StyledGridItem>
        );
      })}
    </Grid>
  );
};

export const SudokuCell: React.FC<SudokuCellProps> = ({
  isSelected,
  isPeered,
  cell,
  onClick,
}) => {
  const { immutable, val: value, notes } = cell;

  return (
    <StyledSudokuCell
      $isSelected={isSelected}
      $isPeered={isPeered}
      $isImmutable={immutable}
      onClick={() => onClick()}
    >
      {value !== 0 ? (
        value
      ) : notes.length === 0 ? null : (
        <NotesCell notes={notes} />
      )}
    </StyledSudokuCell>
  );
};
