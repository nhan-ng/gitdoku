import React, { useState } from "react";
import { Autocomplete } from "@material-ui/lab";
import { Grid, IconButton, makeStyles, TextField } from "@material-ui/core";
import CallMergeIcon from "@material-ui/icons/CallMerge";

const useStyles = makeStyles({
  icon: {
    transform: "rotate(90deg)",
  },
});

type MergeBranchControlProps = {
  onSubmit: (targetBranchId: string) => Promise<void>;
  branchIds: string[];
  currentBranchId: string;
};

export const MergeBranchControl: React.FC<MergeBranchControlProps> = ({
  branchIds,
  currentBranchId,
  onSubmit,
}) => {
  const classes = useStyles();

  const [selection, setSelection] = useState<string>();

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
          getOptionDisabled={(option) => option === currentBranchId}
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
          <CallMergeIcon className={classes.icon} />
        </IconButton>
      </Grid>
    </Grid>
  );
};
