import {
  AppBar,
  Box,
  Container,
  CssBaseline,
  Link as MuiLink,
  Typography,
} from "@material-ui/core";
import React from "react";
import {
  createMuiTheme,
  makeStyles,
  ThemeProvider,
} from "@material-ui/core/styles";
import "@fontsource/roboto";
import "@fortawesome/fontawesome-free";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import { Lobby } from "components/Lobby";
import { Home } from "components/Home";

const theme = createMuiTheme({});

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
  },
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  content: {
    flexGrow: 1,
    height: "100vh",
    overflow: "auto",
  },
  appBarSpacer: theme.mixins.toolbar,
  title: {
    flexGrow: 1,
  },
}));

// Routes

export const App: React.FC = () => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <CssBaseline />
      <ThemeProvider theme={theme}>
        <Router>
          <AppBar position="absolute">
            <Box m={1}>
              <Typography
                variant="h6"
                component="h1"
                color="inherit"
                className={classes.title}
              >
                <MuiLink
                  color="secondary"
                  underline="none"
                  component={Link}
                  to="/"
                >
                  Gitdoku
                </MuiLink>
              </Typography>
            </Box>
          </AppBar>
          <main className={classes.content}>
            <div className={classes.appBarSpacer} />
            <Container maxWidth="md" className={classes.container}>
              <Switch>
                <Route exact path="/">
                  <Home />
                </Route>
                <Route path="/l/:id">
                  <Lobby />
                </Route>
              </Switch>
            </Container>
          </main>
        </Router>
      </ThemeProvider>
    </div>
  );
};
