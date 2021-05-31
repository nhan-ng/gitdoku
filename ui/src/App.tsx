import {
  AppBar,
  Box,
  Container,
  CssBaseline,
  Typography,
} from "@material-ui/core";
import React from "react";
import "./App.css";
import {
  createMuiTheme,
  makeStyles,
  ThemeProvider,
} from "@material-ui/core/styles";
import "@fontsource/roboto";
import { ApolloProvider } from "@apollo/client";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";
import { Lobby } from "components/Lobby";
import { newClient } from "graphql";

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

const defaultEncodedGameServerAddress = "bG9jYWxob3N0Ojk5OTkvZ3JhcGhxbA=="; // localhost:9999/graphql

// Routes

export const App: React.FC = () => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <CssBaseline />
      <ThemeProvider theme={theme}>
        <AppBar position="absolute">
          <Box m={1}>
            <Typography
              variant="h6"
              component="h1"
              color="inherit"
              className={classes.title}
            >
              Gitdoku
            </Typography>
          </Box>
        </AppBar>
        <main className={classes.content}>
          <div className={classes.appBarSpacer} />
          <Container maxWidth="md" className={classes.container}>
            <Router>
              <Switch>
                <Route exact path="/">
                  <ApolloProvider
                    client={newClient({ address: "localhost:9998/graphql" })}
                  >
                    <Redirect
                      push
                      to={`/l/${defaultEncodedGameServerAddress}`}
                    />
                  </ApolloProvider>
                </Route>
                <Route path="/l/:id">
                  <Lobby />
                </Route>
              </Switch>
            </Router>
          </Container>
        </main>
      </ThemeProvider>
    </div>
  );
};
