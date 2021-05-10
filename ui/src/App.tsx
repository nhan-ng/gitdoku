import { Box, Container } from "@material-ui/core";
import React from "react";
import "./App.css";
import { Game } from "./components/Game";
import { createMuiTheme, ThemeProvider } from "@material-ui/core/styles";

const theme = createMuiTheme({});

export function App() {
  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="md">
        <Box my={8}>
          <Game />
        </Box>
      </Container>
    </ThemeProvider>
  );
}
