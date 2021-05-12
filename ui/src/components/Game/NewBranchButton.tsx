import { OutlinedInput } from "@material-ui/core";
import {
  Button,
  ButtonGroup,
  FormControl,
  IconButton,
  Input,
  InputAdornment,
  InputBase,
  InputLabel,
  Paper,
  TextField,
} from "@material-ui/core";
import CallSplitIcon from "@material-ui/icons/CallSplit";
import React, { useState } from "react";

export type NewBranchButtonProps = {
  onSubmit: (branchId: string) => Promise<void>;
};

export const NewBranchButton = ({ onSubmit }: NewBranchButtonProps) => {
  const [branchId, setBranchId] = useState("");

  const handleChange = (
    event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    setBranchId(event.target.value);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await onSubmit(branchId);
      setBranchId("");
    } catch (e) {
      console.log(e);
    }
  };

  const label = "Create New Branch";

  return (
    <Paper component="form" onSubmit={handleSubmit}>
      <FormControl variant="outlined">
        <InputLabel htmlFor="new-branch-input">{label}</InputLabel>
        <OutlinedInput
          id="new-branch-input"
          value={branchId}
          onChange={handleChange}
          label={label}
          endAdornment={
            <InputAdornment position="end">
              <IconButton onClick={handleSubmit} edge="end">
                <CallSplitIcon />
              </IconButton>
            </InputAdornment>
          }
        />
      </FormControl>
    </Paper>
  );
};
