import React, { useState } from "react";
import { Autocomplete, AutocompleteCloseReason } from "@material-ui/lab";
import {
  Popper,
  Tooltip,
  InputBase,
  makeStyles,
  createStyles,
  Theme,
  fade,
  Button,
  TextField,
  ButtonGroup,
  IconButton,
} from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import DoneIcon from "@material-ui/icons/Done";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCodeBranch } from "@fortawesome/free-solid-svg-icons";
import {
  GetFullBranchDocument,
  useMergeBranchMutation,
} from "__generated__/types";
import CallMergeIcon from "@material-ui/icons/CallMerge";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {},
    button: {
      width: "100%",
      textAlign: "left",
      margin: theme.spacing(1.5, 0),
      color: theme.palette.success.contrastText,
      backgroundColor: theme.palette.success.main,
      "&:hover": {
        backgroundColor: theme.palette.success.dark,
      },
      fontWeight: theme.typography.fontWeightBold,
      "& span": {
        width: "100%",
        padding: theme.spacing(0, 0.5),
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        overflow: "hidden",
      },
    },
    popper: {
      border: "1px solid rgba(27,31,35,.15)",
      boxShadow: "0 3px 12px rgba(27,31,35,.15)",
      borderRadius: 3,
      width: 300,
      zIndex: 10,
      color: "#586069",
      backgroundColor: "#f6f8fa",
      margin: theme.spacing(0.5, 0),
    },
    header: {
      borderBottom: "1px solid #e1e4e8",
      padding: "8px 10px",
      fontWeight: theme.typography.fontWeightBold,
    },
    inputBase: {
      padding: 10,
      width: "100%",
      borderBottom: "1px solid #dfe2e5",
      "& input": {
        borderRadius: 4,
        backgroundColor: theme.palette.common.white,
        padding: 8,
        transition: theme.transitions.create(["border-color", "box-shadow"]),
        border: "1px solid #ced4da",
        fontSize: 14,
        "&:focus": {
          boxShadow: `${fade(theme.palette.primary.main, 0.25)} 0 0 0 0.2rem`,
          borderColor: theme.palette.primary.main,
        },
      },
    },
    input: {
      padding: 10,
      borderBottom: "1px solid #dfe2e5",
      backgroundColor: theme.palette.common.white,
      "& input": {
        padding: 8,
        fontSize: 14,
      },
    },
    paper: {
      boxShadow: "none",
      margin: 0,
      fontSize: theme.typography.fontSize,
    },
    option: {
      minHeight: "auto",
      alignItems: "flex-start",
      padding: 8,
      '&[aria-selected="true"]': {
        backgroundColor: "transparent",
      },
      '&[data-focus="true"]': {
        backgroundColor: theme.palette.action.hover,
      },
    },
    popperDisablePortal: {
      position: "relative",
    },
    iconSelected: {
      width: 17,
      height: 17,
      marginRight: 5,
      marginLeft: -2,
    },
    text: {
      margin: theme.spacing(0, 0.5),
      flexGrow: 1,
    },
    mergeIcon: {
      transform: "rotate(270deg)",
    },
  })
);

type MergeBranchControlProps = {
  branchIds: string[];
  currentBranchId: string;
};

export const MergeBranchControl: React.FC<MergeBranchControlProps> = ({
  currentBranchId,
  branchIds,
}) => {
  const classes = useStyles();
  const [mergeBranch] = useMergeBranchMutation({
    refetchQueries: [
      {
        query: GetFullBranchDocument,
        variables: {
          id: currentBranchId,
        },
      },
    ],
  });
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [value, setValue] = useState<string | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = async (
    event: React.ChangeEvent<Record<string, never>>,
    reason: AutocompleteCloseReason
  ) => {
    // When merge action
    if (reason === "toggleInput") {
      if (value !== null) {
        await mergeBranch({
          variables: {
            input: {
              sourceBranchId: currentBranchId,
              targetBranchId: value,
              authorId: "me",
            },
          },
        });
      } else {
        return;
      }
    }

    if (anchorEl) {
      anchorEl.focus();
    }
    setAnchorEl(null);
  };

  const handleChange = (
    event: React.ChangeEvent<Record<string, never>>,
    newValue: string | null
  ) => {
    setValue(newValue);
  };

  console.log("AnchorEl", anchorEl);
  const open = Boolean(anchorEl);

  return (
    <div className={classes.root}>
      <Button
        color="secondary"
        variant="contained"
        disableRipple
        onClick={handleClick}
        className={classes.button}
      >
        <span>Merge Branch</span>
        <ExpandMoreIcon />
      </Button>
      <Popper
        open={open}
        anchorEl={anchorEl}
        placement="bottom-start"
        className={classes.popper}
      >
        <div className={classes.header}>Select Target Branch</div>
        <Autocomplete
          open
          value={value}
          onClose={handleClose}
          options={branchIds}
          onChange={handleChange}
          disableCloseOnSelect
          disablePortal
          classes={{
            paper: classes.paper,
            option: classes.option,
            popperDisablePortal: classes.popperDisablePortal,
          }}
          getOptionDisabled={(option) => option === currentBranchId}
          renderOption={(option) => {
            return (
              <>
                <div className={classes.text}>{option}</div>
                {option === currentBranchId && (
                  <DoneIcon className={classes.iconSelected} />
                )}
              </>
            );
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              variant="standard"
              ref={params.InputProps.ref}
              inputProps={params.inputProps}
              autoFocus
              placeholder="Filter branches"
              className={classes.input}
              // endAdornment={
              //   <Tooltip title="Merge">
              //     <IconButton>
              //       <CallMergeIcon className={classes.mergeIcon} />
              //     </IconButton>
              //   </Tooltip>
              // }
            />
          )}
          popupIcon={
            <CallMergeIcon fontSize="small" className={classes.mergeIcon} />
          }
          closeText="Merge"
        />
      </Popper>
    </div>
  );
};
