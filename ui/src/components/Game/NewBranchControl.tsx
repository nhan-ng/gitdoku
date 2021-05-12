import { Grid, OutlinedInput } from "@material-ui/core";
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
import styled from "styled-components";

const SplitIcon = styled(CallSplitIcon)`
  transform: rotate(90deg);
`;

export type NewBranchControlProps = {
  onSubmit: (branchId: string) => Promise<void>;
};

export const NewBranchControl = ({ onSubmit }: NewBranchControlProps) => {
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
    <Grid container>
      <Grid item sm={10}>
        <TextField
          label={label}
          value={branchId}
          onChange={handleChange}
          variant="outlined"
        />
      </Grid>
      <Grid item sm={2}>
        <IconButton onClick={handleSubmit} edge="end" color="primary">
          <SplitIcon />
        </IconButton>
      </Grid>
    </Grid>
  );
};
