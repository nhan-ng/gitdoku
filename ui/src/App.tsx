import { Box, Container } from "@material-ui/core";
import React from "react";
import "./App.css";
import { Game } from "./components/Game";

export function App() {
  return (
    <Container maxWidth="sm">
      <Box>
        <Game />
      </Box>
    </Container>
  );
}
