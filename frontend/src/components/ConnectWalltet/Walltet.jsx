import React from "react";
import { Button } from '@mui/material';
const ConnectWalletButton = ({
    onPressLogout,
    onPressConnect,
    loading,
    address,
  }) => {
    return (
      <div>
        {address && !loading ? (
          <Button onClick={onPressLogout} color="inherit" sx={{border:"1px solid white", fontSize:"20px"}}>
            Disconnect
          </Button>
        ) : loading ? (
          <Button
          color="inherit" sx={{border:"1px solid white", fontSize:"20px"}}
            disabled
          >
            <div>Loading...</div>
          </Button>
        ) : (
          <Button color="inherit" sx={{border:"1px solid white", fontSize:"20px"}} onClick={onPressConnect} >
            Connect Wallet
          </Button>
        )}
      </div>
    );
  };
  
  export default ConnectWalletButton;