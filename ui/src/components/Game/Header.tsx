import React, { useState } from "react";
import { Autocomplete, AutocompleteCloseReason } from "@material-ui/lab";
import {
  ButtonBase,
  TextField,
  Popper,
  InputBase,
  makeStyles,
  createStyles,
  Theme,
  fade,
  Button,
  Icon,
} from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import DoneIcon from "@material-ui/icons/Done";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCodeBranch } from "@fortawesome/free-solid-svg-icons";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: 200,
    },
    button: {
      width: "100%",
      textAlign: "left",
      margin: theme.spacing(1.5, 0),
      fontWeight: theme.typography.fontWeightBold,
      "& span": {
        width: "100%",
        padding: theme.spacing(0, 1),
        textTransform: "none",
        textOverflow: "ellipsis",
        overflow: "hidden",
      },
    },
    popper: {
      border: "1px solid rgba(27,31,35,.15)",
      boxShadow: "0 3px 12px rgba(27,31,35,.15)",
      borderRadius: 3,
      width: 200,
      zIndex: 1,
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
  })
);

type HeaderProps = {
  branchIds: string[];
  currentBranchId: string;
  onSelected: (targetBranchId: string) => void;
};

export const Header: React.FC<HeaderProps> = ({
  currentBranchId,
  branchIds,
  onSelected,
}) => {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (
    event: React.ChangeEvent<Record<string, never>>,
    reason: AutocompleteCloseReason
  ) => {
    console.log("Close reason", reason);

    if (reason === "toggleInput") {
      return;
    }

    if (anchorEl) {
      anchorEl.focus();
    }
    setAnchorEl(null);
  };

  const handleChange = (
    event: React.ChangeEvent<Record<string, never>>,
    newValue: string
  ) => {
    onSelected(newValue);
  };

  const open = Boolean(anchorEl);

  return (
    <div className={classes.root}>
      <Button
        color="primary"
        variant="contained"
        disableRipple
        onClick={handleClick}
        className={classes.button}
      >
        <FontAwesomeIcon icon={faCodeBranch} />
        <span>{currentBranchId}</span>
        <ExpandMoreIcon />
      </Button>
      <Popper
        open={open}
        anchorEl={anchorEl}
        placement="bottom-start"
        className={classes.popper}
      >
        <div className={classes.header}>Switch branch</div>
        <Autocomplete
          open
          onClose={handleClose}
          options={branchIds}
          onChange={handleChange}
          disableClearable
          disablePortal
          classes={{
            paper: classes.paper,
            option: classes.option,
            popperDisablePortal: classes.popperDisablePortal,
          }}
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
            <InputBase
              ref={params.InputProps.ref}
              inputProps={params.inputProps}
              autoFocus
              className={classes.inputBase}
            />
          )}
        />
      </Popper>
    </div>
  );
};
