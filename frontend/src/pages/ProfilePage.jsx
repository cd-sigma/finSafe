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
import {FeedPage} from "./FeedPage";
import PortfolioDetails from "../components/PortfolioDetails";

const ProfilePage = () => {
  const [currentTab, setCurrentTab] = React.useState(0);
  const [isFeedReference,setisFeedReference]=React.useState(false);
  // currentTab===1?setisFeedReference(true):setisFeedReference(false);

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
        <div style={{ marginTop: "30px", marginLeft: "50px", marginRight: "50px" }}>
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
                  <PortfolioDetails/>
                </Typography>
              </div>
            )}
            {currentTab === 1 && (
              <div>
                <FeedPage isActive={currentTab} />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfilePage;
