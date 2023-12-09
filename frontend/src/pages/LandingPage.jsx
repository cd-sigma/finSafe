import React from "react";
import "./landingPage.css";

// Components
import Navbar from "../components/Navbar";
import HomePage from "../components/HomePage";

const LandingPage = () => {
  return (
    <div style={{width:"100vw"}}>
      <Navbar />
      <HomePage />
    </div>
  );
};

export default LandingPage;
