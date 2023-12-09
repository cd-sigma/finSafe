import React from "react";
import styles from "./Wallet.css";
const ConnectWalletButton = ({
    onPressLogout,
    onPressConnect,
    loading,
    address,
  }) => {
    return (
      <div>
        {address && !loading ? (
          <button onClick={onPressLogout} className={styles["connect-wallet"]} color="inherit" sx={{border:"1px solid white", fontSize:"20px"}}>
            Disconnect
          </button>
        ) : loading ? (
          <button
          color="inherit" sx={{border:"1px solid white", fontSize:"20px"}}
            className={`${styles["connect-wallet"]} ${styles["connect-button-loading"]}`}
            disabled
          >
            <div>Loading...</div>
          </button>
        ) : (
          <button color="inherit" sx={{border:"1px solid white", fontSize:"20px"}} onClick={onPressConnect} className={styles["connect-wallet"]}>
            Connect Wallet
          </button>
        )}
      </div>
    );
  };
  
  export default ConnectWalletButton;