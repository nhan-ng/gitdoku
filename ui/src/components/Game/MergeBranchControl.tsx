import React from "react";
import { Autocomplete } from "@material-ui/lab";
import {
  Button,
  ButtonGroup,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
} from "@material-ui/core";
import CallMergeIcon from "@material-ui/icons/CallMerge";
import styled from "styled-components";

const MergeIcon = styled(CallMergeIcon)`
  transform: rotate(90deg);
`;

export type MergeBranchControlProps = {
  branchIds: string[];
};

export const MergeBranchControl = ({ branchIds }: MergeBranchControlProps) => {
  return (
    <Grid container>
      <Grid item sm={10}>
        <Autocomplete
          id="merge-branch-input"
          options={branchIds}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Merge Target"
              variant="outlined"
              InputProps={{
                ...params.InputProps,
                // endAdornment: (
                //   <InputAdornment position="end">
                //     <IconButton edge="end">
                //       <CallMergeIcon />
                //     </IconButton>
                //   </InputAdornment>
                // ),
              }}
              InputLabelProps={{ ...params.InputLabelProps }}
              inputProps={{ ...params.inputProps }}
            />
          )}
        />
      </Grid>
      <Grid item sm={2}>
        <IconButton color="primary" component="span">
          <MergeIcon />
        </IconButton>
      </Grid>
    </Grid>
  );
};
