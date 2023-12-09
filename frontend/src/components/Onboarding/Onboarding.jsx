import React, { useState } from 'react';
import { Button, Modal, FormControlLabel, Checkbox, FormGroup, Fade, styled, TextField } from '@mui/material';

const Onboarding = () => {
  const [open, setOpen] = useState(false);
  const [selectedProtocols, setSelectedProtocols] = useState([]);
  const [slackWebhook, setSlackWebhook] = useState('');
  const [emailAddress, setEmailAddress] = useState('');

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleProtocolChange = (event) => {
    const { value, checked } = event.target;
    if (checked) {
      setSelectedProtocols((prevSelectedProtocols) => [...prevSelectedProtocols, value]);
    } else {
      setSelectedProtocols((prevSelectedProtocols) =>
        prevSelectedProtocols.filter((protocol) => protocol !== value)
      );
    }
  };

  const handleNext = () => {
    // Handle next step logic, e.g., saving webhook and email address based on selected protocols
    console.log('Selected Protocols:', selectedProtocols);
    console.log('Slack Webhook:', slackWebhook);
    console.log('Email Address:', emailAddress);
    handleClose();
  };

  const CssTextField = styled(TextField)({
    '& label.Mui-focused': {
      color: '#A0AAB4',
    },
    '& .MuiInput-underline:after': {
      borderBottomColor: '#B2BAC2',
    },
    '& .MuiOutlinedInput-root': {
      '& fieldset': {
        borderColor: '#E0E3E7',
      },
      '&:hover fieldset': {
        borderColor: '#B2BAC2',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#6F7E8C',
      },
    },
    '& .MuiInputBase-input': {
      color: 'white', // Set text color to white
    },
  });

  return (
    <div>
      {/* <Button variant="contained" onClick={handleOpen}>
        Open Modal
      </Button> */}
      <Modal
        open={open}
        onClose={handleClose}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Fade in={open}>
          <div
            style={{
              backgroundColor: '#333',
              padding: '30px',
              borderRadius: '10px',
              color: 'white',
              maxWidth: '500px',
              width: '100%',
            }}
          >
            <h2 style={{ marginBottom: '20px' }}>Select Push Protocols</h2>
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    style={{ color: 'white' }}
                    checked={selectedProtocols.includes('Alerts')}
                    onChange={handleProtocolChange}
                    value="Alerts"
                  />
                }
                label="Alerts"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    style={{ color: 'white' }}
                    checked={selectedProtocols.includes('Slack')}
                    onChange={handleProtocolChange}
                    value="Slack"
                  />
                }
                label="Slack"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    style={{ color: 'white' }}
                    checked={selectedProtocols.includes('Email')}
                    onChange={handleProtocolChange}
                    value="Email"
                  />
                }
                label="Email"
              />
            </FormGroup>

            {selectedProtocols.includes('Slack') && (
              <div>
                <CssTextField
                  label="Slack Webhook"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  value={slackWebhook}
                  onChange={(e) => setSlackWebhook(e.target.value)}
                />
              </div>
            )}

            {selectedProtocols.includes('Email') && (
              <div>
                <CssTextField
                  label="Email Address"
                  type="email"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  value={emailAddress}
                  onChange={(e) => setEmailAddress(e.target.value)}
                />
              </div>
            )}

            <Button variant="contained" onClick={handleNext} style={{ marginTop: '20px', float: 'right' }}>
              Next
            </Button>
          </div>
        </Fade>
      </Modal>
    </div>
  );
};

export default Onboarding;
