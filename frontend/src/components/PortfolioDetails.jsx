import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import { useUserStore } from "../store/userStore";

import { getPortfolioDetails, getTokenDetails } from "../api/profile.api";

const PortfolioDetails = () => {
  const [suppliedDetails, setSuppliedDetails] = useState([]);
  const [borrowedDetails, setBorrowedDetails] = useState([]);
  let userAddress = useUserStore((state) => state.userAddress);
  userAddress = "0x464c71f6c2f760dda6093dcb91c24c39e5d6e18c";

  const convertSuppliedToDesiredFormat = (array) => {
    let result = [];
    array.map(async (value) => {
      const { token, balance, symbol } = value;
      // const moreDetails = await getTokenDetails(token);
      const moreDetails = {
        logoURI:
          "https://tokens-data.1inch.io/images/0xdac17f958d2ee523a2206206994597c13d831ec7.png",
        price: 1,
      };
      let obj = {};
      obj.logo = moreDetails?.logoURI;
      obj.symbol = symbol;
      obj.balance = balance.toFixed(2);
      obj.price = (moreDetails?.price * balance).toFixed(2);
      result.push(obj);
    });
    return result;
  };
  const callApis = async () => {
    const details = await getPortfolioDetails(userAddress);
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
    <TableContainer component={Paper}>
      <Table>
        <TableHead style={{marginBottom:"50px"}}>
          <TableRow>
            <TableCell>Supplied</TableCell>
            <TableCell>Balance</TableCell>
            <TableCell>USD Value</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {/* Add your table rows here */}
          {suppliedDetails.map((value) => {
            const { logo, balance, price, symbol } = value;
            return (
              <TableRow>
                <TableCell>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <img src={logo} style={{ width: "30px" }} />
                    <span style={{ marginLeft: "10px" }}>{symbol}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {balance} {symbol}
                </TableCell>
                <TableCell>${price}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default PortfolioDetails;
