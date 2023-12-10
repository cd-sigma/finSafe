import React, { useState } from "react";
import {
  TextField,
  RadioGroup,
  Radio,
  FormControlLabel,
  Button,
  Container,
  Typography,
  Paper,
} from "@mui/material";

// components
import Navbar from "../components/Navbar";

const CollateralManagement = () => {
  const [formData, setFormData] = useState({
    healthFactorThreshold: "",
    action: "deposit",
    collateralAssetAddress: "",
    collateralAssetAmount: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleRadioChange = (e) => {
    setFormData((prevData) => ({ ...prevData, action: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form data submitted:", formData);
  };

  return (
    <>
      <Navbar />
      <Container component="main" maxWidth="lg" style={{border:"1px solid white", borderRadius:"12px", marginTop:"60px", padding:"30px 20px"}} >
        <Paper
          elevation={3}
          style={{
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            backgroundColor: "black",
          }}
        >
          <Typography
            variant="h5"
            style={{ marginBottom: "20px", color: "white" }}
          >
            Collateral Management Tool
          </Typography>
          <form onSubmit={handleSubmit} style={{ width: "100%" }}>
            <TextField
              label="Define a health factor threshold"
              variant="standard"
              fullWidth
              margin="normal"
              name="healthFactorThreshold"
              value={formData.healthFactorThreshold}
              onChange={handleInputChange}
              required
              InputLabelProps={{ style: { color: "white" } }}
              InputProps={{
                style: { color: "white", borderColor: "white" },
              }}
              style={{ borderBottom: "1px solid white" }}
            />

            <RadioGroup
              row
              name="action"
              value={formData.action}
              onChange={handleRadioChange}
            >
              <FormControlLabel
                value="deposit"
                control={<Radio style={{ color: "white" }} />}
                label="Deposit Collateral"
                labelPlacement="end"
                style={{ color: "white" }}
              />
              <FormControlLabel
                value="withdraw"
                control={<Radio style={{ color: "white" }} />}
                label="Withdraw Collateral"
                labelPlacement="end"
                style={{ color: "white" }}
              />
            </RadioGroup>

            <TextField
              label="Collateral asset address"
              variant="standard"
              fullWidth
              margin="normal"
              name="collateralAssetAddress"
              value={formData.collateralAssetAddress}
              onChange={handleInputChange}
              required
              InputLabelProps={{ style: { color: "white" } }}
              InputProps={{
                style: { color: "white", borderColor: "white" },
              }}
              style={{ borderBottom: "1px solid white" }}
            />

            <TextField
              label="Collateral asset amount"
              variant="standard"
              fullWidth
              margin="normal"
              name="collateralAssetAmount"
              type="number"
              value={formData.collateralAssetAmount}
              onChange={handleInputChange}
              required
              InputLabelProps={{ style: { color: "white" } }}
              InputProps={{
                style: { color: "white", borderColor: "white" },
              }}
              style={{ borderBottom: "1px solid white" }}
            />

            <Button
              type="submit"
              variant="contained"
              color="primary"
              style={{ marginTop: "30px", color: "white", backgroundColor:"black", padding:"8px 12px", fontSize:"16px", border:"1px solid white" }}
            >
              Submit
            </Button>
          </form>
        </Paper>
      </Container>
    </>
  );
};

export default CollateralManagement;
