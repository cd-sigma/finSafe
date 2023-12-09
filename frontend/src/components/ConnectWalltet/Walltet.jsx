import React from "react";

const ConnectWalletButton = ({
    onPressLogout,
    onPressConnect,
    loading,
    address,Montserrat
  }) => {
    return (
      <div>
        {address && !loading ? (
          <div onClick={onPressLogout} style={{border:"1px solid white", fontSize:"30px",fontFamily:"Bebas neue",marginTop:"10px",borderRadius:"30px" , padding:"12px 20px",background:"white" , color:"black",
         }}>
            Disconnect
          </div>
        ) : loading ? (
          <div
          style={{border:"1px solid white", fontSize:"30px",fontFamily:"Bebas neue",marginTop:"10px",borderRadius:"30px" , padding:"12px 20px",background:"white" , color:"black",ml: 1,
          }}
            disabled
          >
          Loading...
          </div>
        ) : (
          <div  style={{border:"1px solid white", fontSize:"30px",fontFamily:"Bebas neue",marginTop:"10px",borderRadius:"30px" , padding:"12px 20px",background:"white" , color:"black",
          }}  onClick={onPressConnect} >
            Connect Wallet
          </div>
        )}
      </div>
    );
  };
  
  export default ConnectWalletButton;