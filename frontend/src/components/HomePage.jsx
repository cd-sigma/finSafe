import React, {useState} from "react";
import Web3 from "web3";
import ConnectWalletButton from "./ConnectWalltet/Walltet";
import axios from "axios";
import {useUserStore} from "../store/userStore";
import Onboarding from "./Onboarding/Onboarding";

const HomePage = () => {
  const [loading, setLoading] = useState(false);
  const userAddress = useUserStore((state) => state.userAddress);
  const setUserAddress = useUserStore((state) => state.setUserAddress)
  const [open, setOpen] = useState(false);
  const onPressConnect = async () => {
    setLoading(true);

    try {
      if (window?.ethereum?.isMetaMask) {
        // Desktop browser
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });

        let account = Web3.utils.toChecksumAddress(accounts[0]);
        setUserAddress(account);
        account = account.toLowerCase();
        // get nonce
        const nonce = await axios.get(
          `https://finsafe-backend.insidefi.io/user/nonce/${account}`
          );

          console.log("nonce", nonce.data.result.data.nonce);
          const message = `Welcome to FINSAFE! \n\nPlease sign in and authorize. By signing in, you agree to our Terms of Service  and Privacy Policy .\n\nThis request will not trigger a blockchain transaction or cost any gas fees.\n\nWallet address:\n${account}\n\nNonce:\n${nonce.data.result.data.nonce}`;
          console.log("message", message)
        // sign message

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
      }
    } catch (error) {
      console.log(error);
    }

    setLoading(false);
  };
  console.log(userAddress)

  const onPressLogout = () => setUserAddress("");
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
      <ConnectWalletButton
          onPressConnect={onPressConnect}
          onPressLogout={onPressLogout}
          loading={loading}
          address={userAddress}
        />
        <Onboarding open={open} setOpen={setOpen} />
    </div>
  );
};

export default HomePage;
