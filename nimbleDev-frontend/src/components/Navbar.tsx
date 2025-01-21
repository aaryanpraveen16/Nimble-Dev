import React from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";

const Navbar: React.FC = () => {
  return (
    <AppBar position="static" style={{ background: "#121212" }}>
      <Toolbar>
        <Typography variant="h6" style={{ flexGrow: 1 }}>
          Nimble Dev
        </Typography>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
