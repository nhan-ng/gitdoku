import { Box, Container, CssBaseline } from "@material-ui/core";
import React from "react";
import "./App.css";
import { Game } from "./components/Game";
import { createMuiTheme, ThemeProvider } from "@material-ui/core/styles";
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
  Link,
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

// Routes

export const App: React.FC = () => {
  return (
    <>
      <CssBaseline />
      <ThemeProvider theme={theme}>
        <ApolloProvider client={client}>
          <Router>
            <Container maxWidth="md">
              <Switch>
                <Route exact path="/">
                  <Redirect push to="/l/12345" />
                </Route>
                <Route path="/l/:id">
                  <Lobby />
                </Route>
              </Switch>
            </Container>
          </Router>
        </ApolloProvider>
      </ThemeProvider>
    </>
  );
};
