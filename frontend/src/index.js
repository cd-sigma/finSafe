import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { Web3ReactProvider } from '@web3-react/core'
import { Web3Provider } from "@ethersproject/providers";

// function getLibrary(provider) {
//   return new Web3Provider(provider);
// }
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <Web3ReactProvider >
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </Web3ReactProvider>
);
