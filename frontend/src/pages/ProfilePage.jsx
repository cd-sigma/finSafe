import React from "react";
import {
  AppBar,
  Avatar,
  Container,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import {Avatars} from '../utils/index'
import Navbar from "../components/Navbar";
import {FeedPage} from "./FeedPage";
import PortfolioDetails from "../components/PortfolioDetails";

const ProfilePage = () => {
  const [currentTab, setCurrentTab] = React.useState(0);
  const [isFeedReference,setisFeedReference]=React.useState(false);
  const random = Math.floor(Math.random() * 10);
  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };
  const searchId=window.location.pathname.split('/')[2];

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
            src= {Avatars[random]}
            sx={{ width: 120, height: 120, marginRight: "20px" }}
          />
          <div>
            <Typography variant="h6">{searchId.slice(0,5)+'...'+searchId.slice(-4)}</Typography>
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
                  <PortfolioDetails searchId={searchId} isActive={currentTab}/>
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
