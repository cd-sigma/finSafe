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

const PortfolioDetails = ({searchId,isActive}) => {
  const [loading, setLoading] = useState(false);
  const suppliedDetails = useUserStore((state) => state.suppliedDetails);
  const setBorrowedDetails = useUserStore((state) => state.setBorrowedDetails);
  const borrowedDetails = useUserStore((state) => state.borrowedDetails);
  const setSuppliedDetails = useUserStore((state) => state.setSuppliedDetails);
  const search = useUserStore((state) => state.search);
  const [userData,setUserData]=useState({});
  const convertSuppliedToDesiredFormat = async (array) => {
    try {
      const result = await Promise.all(
        array.map(async (value) => {
          const { underlying, balance, symbol } = value;
          const moreDetails = await getTokenDetails(underlying);

          if (moreDetails && moreDetails.logo) {
            return {
              logo: moreDetails.logo,
              symbol,
              balance: balance.toFixed(2),
              price: (moreDetails.price * balance).toFixed(2),
            };
          } else {
            console.error("Invalid moreDetails or logo:", moreDetails);
            return null;
          }
        })
      );
      return result.filter(Boolean);
    } catch (error) {
      console.error("Error converting to desired format:", error);
      return [];
    }
  };

  const convertBorrowedToDesiredFormat = async (array) => {
    try {
      const result = await Promise.all(
        array.map(async (value) => {
          const { underlying, balance, symbol } = value;
          const moreDetails = await getTokenDetails(underlying);

          if (moreDetails && moreDetails.logo) {
            return {
              logo: moreDetails.logo,
              symbol,
              balance: balance.toFixed(2),
              price: (moreDetails.price * balance).toFixed(2),
            };
          } else {
            console.error("Invalid moreDetails or logo:", moreDetails);
            return null;
          }
        })
      );
      return result.filter(Boolean);
    } catch (error) {
      console.error("Error converting to desired format:", error);
      return [];
    }
  };

  const callApis = async () => {
    const details = await getPortfolioDetails(searchId);
    const { metadata } = details[0];  
    const { supplied, borrowed } = metadata;
    const derivedSupplied = await convertSuppliedToDesiredFormat(supplied);
    const data=await getPortfolioDetails(searchId);
    setUserData(data[0]);
    const derivedBorrowed = await convertBorrowedToDesiredFormat(borrowed);
    setSuppliedDetails(derivedSupplied);
    setBorrowedDetails(derivedBorrowed);
  };
  console.log(userData);
  
  useEffect(() => {
    callApis();
  }, [search,searchId]);
  //   console.log(suppliedDetails);
  return (
    
    <TableContainer component={Paper}>
      <Table>
        {suppliedDetails.length > 0 && (
          <>
            <TableHead style={{ marginBottom: "50px" }}>
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
          </>
        )}
        {borrowedDetails.length > 0 && (
          <>
            <TableHead>
              <TableRow>
                <TableCell>Borrowed</TableCell>
                <TableCell>Balance</TableCell>
                <TableCell>USD Value</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {/* Add your table rows here */}
              {borrowedDetails.map((value) => {
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
          </>
        )}
      </Table>
    </TableContainer>
  );
};

export default PortfolioDetails;
