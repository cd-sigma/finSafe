import React, { useState } from 'react';
import { Button, Modal, FormControlLabel, Checkbox, FormGroup, Fade, TextField } from '@mui/material';
import axios from 'axios';
const Onboarding = ({ open, setOpen }) => {
    const [selectedProtocols, setSelectedProtocols] = useState([]);
    const [slackWebhook, setSlackWebhook] = useState('');
    const [emailAddress, setEmailAddress] = useState('');

    const handleClose = () => {
        setOpen(false);
    };

    const handleProtocolChange = (event) => {
        event.preventDefault();
        event.stopPropagation(); // Add this line to stop the event propagation
        const { value, checked } = event.target;
        if (checked) {
            setSelectedProtocols((prevSelectedProtocols) => [...prevSelectedProtocols, value]);
        } else {
            setSelectedProtocols((prevSelectedProtocols) =>
                prevSelectedProtocols.filter((protocol) => protocol !== value)
            );
        }
    };

   const  handleSlackWebhookChange = (event) => {
        event.preventDefault();
        event.stopPropagation(); 
        setSlackWebhook(event.target.value);
    };

    const handleEmailAddressChange = (event) => {
        event.preventDefault();
        event.stopPropagation(); 
        setEmailAddress(event.target.value);
    };

    const handleNext = () => {
        //sendthe data to api
        const data = {
            slackWebhook,
            emailAddress,
            selectedProtocols,
        };
        if (selectedProtocols.includes('Slack') && !slackWebhook) {
            alert('Please enter slack webhook');
            return;
        }

        selectedProtocols.includes('Slack') && axios.post('https://finsafe-backend.insidefi.io/alert/email/subscribe', { slackWebhook });

        if (selectedProtocols.includes('Email') && !emailAddress) {
            alert('Please enter email address');
            return;
        }

        handleClose();
    };

    return (
        <div>
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
                                <TextField
                                    label="Slack Webhook"
                                    variant="outlined"
                                    fullWidth
                                    margin="normal"
                                    value={emailAddress}
                                    onChange={(e) => handleEmailAddressChange(e)}
                                />
                            </div>
                        )}

                        {selectedProtocols.includes('Email') && (
                            <div>
                                <TextField
                                    label="Slack Webhook"
                                    variant="outlined"
                                    fullWidth
                                    margin="normal"
                                    value={slackWebhook}
                                    onChange={(e) => handleSlackWebhookChange(e)}
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
