import React from "react";
import {
  AppBar,
  Avatar,
  Container,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";

import Navbar from "../components/Navbar";

const ProfilePage = () => {
  const [currentTab, setCurrentTab] = React.useState(0);

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  return (
    <>
      <Navbar />
      <div
        style={{
          backgroundColor: "black",
          color: "white",
          minHeight: "100vh",
          paddingTop: "10px",
          width: "100vw",
        }}
      >
        {/* Top Section - User Profile */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginTop: "20px",
            marginLeft: "30px",
          }}
        >
          <Avatar
            alt="User Avatar"
            src="https://via.placeholder.com/150"
            sx={{ width: 120, height: 120, marginRight: "20px" }}
          />
          <div>
            <Typography variant="h5">0x1324...3242</Typography>
            <Typography variant="subtitle1">Secured</Typography>
          </div>
        </div>

        {/* Bottom Section - Tabs (Portfolio and Feed) */}
        <div style={{ marginTop: "30px", marginLeft: "30px" }}>
          <AppBar
            position="static"
            color="default"
            sx={{ backgroundColor: "black" }}
          >
            <Tabs
              value={currentTab}
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="primary"
            >
              <Tab
                label="Portfolio"
                sx={{ backgroundColor: "black", color: "white" }}
              />
              <Tab
                label="Feed"
                sx={{ backgroundColor: "black", color: "white" }}
              />
            </Tabs>
          </AppBar>
          <div style={{ marginTop: "25px" }}>
            {currentTab === 0 && (
              <div>
                <Typography variant="h6">
                  Portfolio Content Goes Here
                </Typography>
              </div>
            )}
            {currentTab === 1 && (
              <div>
                <Typography variant="h6">Feed Content Goes Here</Typography>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfilePage;
