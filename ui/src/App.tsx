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
import {
  ApolloClient,
  ApolloProvider,
  HttpLink,
  InMemoryCache,
  split,
} from "@apollo/client";
import { getMainDefinition } from "@apollo/client/utilities";
import { WebSocketLink } from "@apollo/client/link/ws";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";
import { Lobby } from "components/Lobby";

const httpLink = new HttpLink({
  uri: "http://localhost:9999/graphql",
});
const wsLink = new WebSocketLink({
  uri: "ws://localhost:9999/graphql",
  options: {
    reconnect: true,
  },
});
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === "OperationDefinition" &&
      definition.operation === "subscription"
    );
  },
  wsLink,
  httpLink
);

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: splitLink,
  // link: httpLink,
});
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
        <ApolloProvider client={client}>
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
                    <Redirect push to="/l/12345" />
                  </Route>
                  <Route path="/l/:id">
                    <Lobby />
                  </Route>
                </Switch>
              </Router>
            </Container>
          </main>
        </ApolloProvider>
      </ThemeProvider>
    </div>
  );
};
