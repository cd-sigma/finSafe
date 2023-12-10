// src/components/Navbar.js
import React from 'react';
import { AppBar, Toolbar, Typography, InputBase, Button, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate } from 'react-router-dom';

// Logo
import Logo from "../assets/finsafe-logo.png";
import { useUserStore } from '../store/userStore';

const Navbar = () => {
  
  const navigate=useNavigate();
  const search=useUserStore((state) => state.search);
  const setSearch=useUserStore((state) => state.setSearch);
  const handleKeyDown = (event) => {
    
    if (event.key === 'Enter') {
      navigate(`/profile/${search}`);
    }   
  };
 
  return (
    <AppBar position="static" sx={{paddingTop:"25px", paddingLeft:"20px", paddingRight:"15px", backgroundColor:"black"}}>
      <Toolbar sx={{ justifyContent: 'space-between', background: 'black' }}>
        {/* Logo on the Left */}
        <Typography variant="h6" component="div">
          <img src={Logo} style={{width:"105px"}}/>
        </Typography>
     
        {/* Search Bar in the Center */}
        <div sx={{ flexGrow: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #fff', borderRadius: '4px', width:"450px" }}>
            <IconButton size="large" edge="start" color="inherit" aria-label="menu" sx={{marginLeft :"8px"}}>
              <SearchIcon />
            </IconButton>
            <InputBase
              sx={{color: 'white'}}
              placeholder="Search Address"
              onChange={(e) => setSearch(e.target.value)}
              value={search}
              inputProps={{ 'aria-label': 'search' }}
              style={{ flexGrow: 1, padding: '2px' }}
              onSubmit={(e) => {
                e.preventDefault();
                navigate(`/profile/${search}`);
              }}
              onKeyDown={handleKeyDown}
            />
          </div>
        </div>

        {/* Button on the Right */}
        {/* <Button color="inherit" sx={{border:"1px solid white"}}>Connect Wallet</Button> */}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
