import React, {useEffect, useState} from "react";
import Web3 from "web3";
import ConnectWalletButton from "./ConnectWalltet/Walltet";
import axios from "axios";
import {useUserStore} from "../store/userStore";
import Onboarding from "./Onboarding/Onboarding";

import { ethers } from "ethers";
const HomePage = () => {
  const [loading, setLoading] = useState(false);
  const userAddress = useUserStore((state) => state.userAddress);
  const setUserAddress = useUserStore((state) => state.setUserAddress)
  const [open, setOpen] = useState(false);
  const [signer, setSigner] = useState(null);
  const searchId=window.location.pathname.split('/')[2];
  const onPressConnect = async () => {
    setLoading(true);
    try {
      if (window?.ethereum?.isMetaMask) {
        // Desktop browser
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });

        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner();
        setSigner(signer);
        let account = Web3.utils.toChecksumAddress(accounts[0]);
        setUserAddress(account);
        account = account.toLowerCase();

        const nonce = await axios.get(
          `https://finsafe-backend.insidefi.io/user/nonce/${account}`
        );

        const message = `Welcome to FINSAFE! \n\nPlease sign in and authorize. By signing in, you agree to our Terms of Service  and Privacy Policy .\n\nThis request will not trigger a blockchain transaction or cost any gas fees.\n\nWallet address:\n${account}\n\nNonce:\n${nonce.data.result.data.nonce}`;

        const signature = await window.ethereum.request({
          method: "personal_sign",
          params: [message, account],
        });

        const response = await axios.post(
          "https://finsafe-backend.insidefi.io/user/validate/signature",
          {
            address: account,
            signature: signature,
          }
        );
        if (response.data.status === 200) {
          setOpen(true);
        }
        console.log(userAddress)
       
    
      }
    } catch (error) {
      
    }

    setLoading(false);
  };
  

  const onPressLogout = () => setUserAddress("");
 
  return (
    <div
    style={{
      display: "flex",
      color: "white",
      backgroundColor: "black",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "flex-start", // Added justifyContent to center vertically
      paddingTop: "0px",
      height: "calc(100vh - 64px)",
      width: "98.6vw",

    }}  
  >
    <div style={{ fontSize: "50px", width:"83vw", fontWeight: "bolder" ,textAlign: "center", marginBottom: "5px", marginTop:"150px", fontFamily:"Montserrat"}} className="font">
    FinSafe: Your Guardian in Crypto Asset Management and Liquidation Prevention
    </div>
    <p style={{ textAlign: "center", fontSize:"20px",fontWeight:"normal", width:"80vw", marginBottom:"25px", fontFamily:"Montserrat" }}>
      Take control of your crypto assets like never before. FinSafe actively monitors and manages the health of your loans across major platforms, ensuring stability and preventing liquidation risks.
    </p>
    <ConnectWalletButton
      onPressConnect={onPressConnect}
      onPressLogout={onPressLogout}
      loading={loading}
      address={userAddress}
    />
    <Onboarding open={open} setOpen={setOpen} signer={signer} />
  </div>
  );
};

export default HomePage;
