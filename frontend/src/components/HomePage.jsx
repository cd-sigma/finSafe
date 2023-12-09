import React, {useState} from "react";
import Web3 from "web3";
import ConnectWalletButton from "./ConnectWalltet/Walltet";
import axios from "axios";
const HomePage = () => {
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState("");

  const onPressConnect = async () => {
    setLoading(true);

    try {
      if (window?.ethereum?.isMetaMask) {
        // Desktop browser
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });

        let account = Web3.utils.toChecksumAddress(accounts[0]);
        setAddress(account);
        account = account.toLowerCase();
        // get nonce
        const nonce = await axios.get(
          `http://localhost:3001/user/nonce/${account}`
          );

          console.log("nonce", nonce.data.result.data.nonce);
          const message = `Welcome to FINSAFE! \n\nPlease sign in and authorize. By signing in, you agree to our Terms of Service  and Privacy Policy .\n\nThis request will not trigger a blockchain transaction or cost any gas fees.\n\nWallet address:\n${account}\n\nNonce:\n${nonce.data.result.data.nonce}`;
          console.log("message", message)
        // sign message

        const signature = await window.ethereum.request({
          method: "personal_sign",
          params: [message, account],
        });

        console.log(signature);
        // send signature to backend

        const response = await axios.post(
          "http://localhost:3001/user/validate/signature",
          {
            address: account,
            signature: signature,
          }
        );

        console.log(response);
      }
    } catch (error) {
      console.log(error);
    }

    setLoading(false);
  };

  const onPressLogout = () => setAddress("");
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
      {/* <Button color="inherit" sx={{border:"1px solid white", fontSize:"20px"}}>Connect Wallet</Button> */}
      <ConnectWalletButton
          onPressConnect={onPressConnect}
          onPressLogout={onPressLogout}
          loading={loading}
          address={address}
        />
      {/* Add more text or components as needed */}
    </div>
  );
};

export default HomePage;
