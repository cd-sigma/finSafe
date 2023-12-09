import React from "react";
import { Button } from '@mui/material';

const HomePage = () => {
  return (
    <div
      style={{
        display: "flex",
        color: "white",
        backgroundColor: "black",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: "200px",
        height: "calc(100vh - 64px)",
      }}
    >
      <h1 style={{ fontSize: "72px" }}>want to secure your assets?</h1>
      <Button color="inherit" sx={{border:"1px solid white", fontSize:"20px"}}>Connect Wallet</Button>
      {/* Add more text or components as needed */}
    </div>
  );
};

export default HomePage;
