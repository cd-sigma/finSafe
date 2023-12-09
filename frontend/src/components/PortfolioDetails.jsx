import React, { useState, useEffect } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import { getPortfolioDetails } from "../api/profile.api";

const PortfolioDetails = () => {
  const [expanded, setExpanded] = useState(false);
  const [suppliedDetails, setSuppliedDetails] = useState([]);
  const [borrowedDetails, setBorrowedDetails] = useState([]);
  const handleAccordionChange = () => {
    setExpanded((prevExpanded) => !prevExpanded);
  };
  const convertSuppliedToDesiredFormat = (array) => {
    let result = [];
    // array.map((value) => {
    //     let obj = {};
    //     obj.supplied = 
    // })
  };
  const callApis = async () => {
    const details = await getPortfolioDetails(
      "0x464c71f6c2f760dda6093dcb91c24c39e5d6e18c"
    );
    const { metadata } = details[0];
    const { supplied, borrowed } = metadata;
    const derivedSupplied = convertSuppliedToDesiredFormat(supplied);
    setSuppliedDetails(derivedSupplied);
    setBorrowedDetails(borrowed);
  };
  useEffect(() => {
    callApis();
  }, []);
  console.log(suppliedDetails);
  return (
    <Accordion expanded={expanded} onChange={handleAccordionChange}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="panel-content"
        id="panel-header"
      >
        <Typography>Supplied</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Supplied</TableCell>
                <TableCell>Balance</TableCell>
                <TableCell>USD Value</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {/* Add your table rows here */}
              <TableRow>
                <TableCell>Item 1</TableCell>
                <TableCell>10</TableCell>
                <TableCell>$100</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Item 2</TableCell>
                <TableCell>20</TableCell>
                <TableCell>$200</TableCell>
              </TableRow>
              {/* Add more rows as needed */}
            </TableBody>
          </Table>
        </TableContainer>
      </AccordionDetails>
    </Accordion>
  );
};

export default PortfolioDetails;
