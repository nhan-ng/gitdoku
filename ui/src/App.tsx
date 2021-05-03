import "./App.css";
import { useGetSudokuQuery } from "./__generated__/types";
import { Sudoku } from "./components/Sudoku";

export const App: React.FC = () => {
  return (
    <div className="App">
      <Sudoku />
    </div>
  );
};
