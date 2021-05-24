import React, { useState } from "react";
import { Autocomplete } from "@material-ui/lab";
import { Grid, IconButton, TextField } from "@material-ui/core";
import CallMergeIcon from "@material-ui/icons/CallMerge";
import styled from "styled-components";

const MergeIcon = styled(CallMergeIcon)`
  transform: rotate(90deg);
`;

export type MergeBranchControlProps = {
  onSubmit: (targetBranchId: string) => Promise<void>;
  branchIds: string[];
};

export const MergeBranchControl: React.FC<MergeBranchControlProps> = ({
  branchIds,
  onSubmit,
}) => {
  const [selection, setSelection] = useState<string | undefined>(undefined);

  const handleSubmit = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    try {
      if (selection) {
        await onSubmit(selection);
      }
      setSelection(undefined);
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <Grid container>
      <Grid item sm={10}>
        <Autocomplete
          id="merge-branch-input"
          value={selection}
          onChange={(_, value) => setSelection(value || "")}
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
        <IconButton color="primary" component="span" onClick={handleSubmit}>
          <MergeIcon />
        </IconButton>
      </Grid>
    </Grid>
  );
};
