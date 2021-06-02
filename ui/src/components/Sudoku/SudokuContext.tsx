import React, { createContext, useContext, useReducer } from "react";

export enum SudokuInputMode {
  Fill = "FILL",
  Note = "NOTE",
}

type SudokuState = {
  branchId: string;
  selectedCell?: SelectedCell;
  inputMode: SudokuInputMode;
  loading: boolean;
};

const initialState: SudokuState = {
  branchId: "",
  inputMode: SudokuInputMode.Fill,
  loading: false,
};

type SudokuContextProps = {
  state: SudokuState;
  dispatch: React.Dispatch<SudokuAction>;
};

type SelectedCell = {
  row: number;
  col: number;
};

type SudokuAction =
  | { type: "MOVE_LEFT" }
  | { type: "MOVE_RIGHT" }
  | { type: "MOVE_UP" }
  | { type: "MOVE_DOWN" }
  | { type: "SET_SELECTED_CELL"; row: number; col: number }
  | { type: "TOGGLE_INPUT_MODE" }
  | { type: "SET_LOADING"; loading: boolean }
  | { type: "SET_BRANCH"; branchId: string };

const SudokuContext = createContext<SudokuContextProps>({
  state: { ...initialState },
  dispatch: () => null,
});

type SudokuContextProviderProps = {
  branchId: string;
};

export const SudokuContextProvider: React.FC<SudokuContextProviderProps> = ({
  branchId,
  children,
}) => {
  const [state, dispatch] = useSudokuReducer(branchId);

  // Sync branch if the context is updated
  if (state.branchId !== branchId) {
    dispatch({ type: "SET_BRANCH", branchId });
  }

  return (
    <SudokuContext.Provider
      value={{
        state,
        dispatch,
      }}
    >
      {children}
    </SudokuContext.Provider>
  );
};

export const useSudokuContext = (): SudokuContextProps =>
  useContext(SudokuContext);

const useSudokuReducer = (
  branchId: string
): [SudokuState, React.Dispatch<SudokuAction>] => {
  return useReducer(sudokuReducer, { ...initialState }, (state) => {
    console.log("I'm initilaized", branchId);
    return { ...state, branchId };
  });
};

const sudokuReducer = (
  state: SudokuState,
  action: SudokuAction
): SudokuState => {
  switch (action.type) {
    case "MOVE_LEFT":
      return {
        ...state,
        selectedCell: moveSelectedCell({
          selectedCell: state.selectedCell,
          colDelta: -1,
        }),
      };

    case "MOVE_RIGHT":
      return {
        ...state,
        selectedCell: moveSelectedCell({
          selectedCell: state.selectedCell,
          colDelta: 1,
        }),
      };

    case "MOVE_UP":
      return {
        ...state,
        selectedCell: moveSelectedCell({
          selectedCell: state.selectedCell,
          rowDelta: -1,
        }),
      };

    case "MOVE_DOWN":
      return {
        ...state,
        selectedCell: moveSelectedCell({
          selectedCell: state.selectedCell,
          rowDelta: 1,
        }),
      };

    case "SET_SELECTED_CELL":
      return {
        ...state,
        selectedCell: setSelectedCell({
          selectedCell: state.selectedCell,
          row: action.row,
          col: action.col,
        }),
      };

    case "TOGGLE_INPUT_MODE":
      return {
        ...state,
        inputMode:
          state.inputMode === SudokuInputMode.Fill
            ? SudokuInputMode.Note
            : SudokuInputMode.Fill,
      };

    case "SET_BRANCH":
      return {
        ...state,
        branchId: action.branchId,
      };

    case "SET_LOADING":
      return {
        ...state,
        loading: action.loading,
      };

    default:
      throw new Error("Unreachable");
  }
};

const setSelectedCell = ({
  selectedCell,
  row,
  col,
}: {
  selectedCell?: SelectedCell;
  row: number;
  col: number;
}): SelectedCell | undefined => {
  // If the selected cell is the current cell, unset the cell
  if (selectedCell && selectedCell.row === row && selectedCell.col === col) {
    return undefined;
  }

  return { row, col };
};

const moveSelectedCell = ({
  selectedCell,
  rowDelta = 0,
  colDelta = 0,
}: {
  selectedCell?: SelectedCell;
  rowDelta?: number;
  colDelta?: number;
}): SelectedCell | undefined => {
  if (selectedCell === undefined) {
    return undefined;
  }

  const newRow = Math.min(8, Math.max(0, selectedCell.row + rowDelta));
  const newCol = Math.min(8, Math.max(0, selectedCell.col + colDelta));
  return { row: newRow, col: newCol };
};
