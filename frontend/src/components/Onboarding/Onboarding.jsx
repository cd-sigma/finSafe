import React, { useState } from 'react';
import { Button, Modal, FormControlLabel, Checkbox, FormGroup, Fade, TextField } from '@mui/material';
import { PushAPI } from '@pushprotocol/restapi';
import { CONSTANTS } from '@pushprotocol/restapi';
import axios from 'axios';
const Onboarding = ({ open, setOpen, signer }) => {
    const [selectedProtocols, setSelectedProtocols] = useState([]);
    const [slackWebhook, setSlackWebhook] = useState('');
    const [emailAddress, setEmailAddress] = useState('');
    const [discordWebhook, setDiscordWebhook] = useState('');
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

    const handleSlackWebhookChange = (event) => {
        event.preventDefault();
        event.stopPropagation();
        setSlackWebhook(event.target.value);
    };

    const handleEmailAddressChange = (event) => {
        event.preventDefault();
        event.stopPropagation();
        setEmailAddress(event.target.value);
    };
    const handleDiscordWebhookChange = (event) => {
        event.preventDefault();
        event.stopPropagation();
        setDiscordWebhook(event.target.value);
    }

    const handleNext = async () => {
        if (selectedProtocols.includes('Slack') && !slackWebhook) {
            alert('Please enter slack webhook');
            return;
        }

        selectedProtocols.includes('Slack') && axios.post('https://finsafe-backend.insidefi.io/alert/slack/subscribe', { webhook: slackWebhook }, { headers: { 'Content-Type': 'application/json', authorization: `Bearer ${localStorage.getItem('token')}` } });
        selectedProtocols.includes('Discord') && axios.post('https://finsafe-backend.insidefi.io/alert/discord/subscribe', { webhook: discordWebhook }, { headers: { 'Content-Type': 'application/json', authorization: `Bearer ${localStorage.getItem('token')}` } });
        if (selectedProtocols.includes('Email') && !emailAddress) {
            alert('Please enter email address');
            return;
        }

        selectedProtocols.includes('Email') && axios.post('https://finsafe-backend.insidefi.io/alert/email/subscribe', { email: emailAddress }, { headers: { 'Content-Type': 'application/json', authorization: `Bearer ${localStorage.getItem('token')}` } });

        if (selectedProtocols.includes('Alerts')) {
            const userAlice = await PushAPI.initialize(signer, { env: CONSTANTS.ENV.STAGING });
            const response2 = await userAlice.notification.subscribe(`eip155:11155111:0x786A45A142d812DFECb0d854B23b030987eC4671`);
            alert('Subscribed to alerts');
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
                        <h2 style={{ marginBottom: '20px' }}>Select Alert Prefrences</h2>
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
                                label="Push Protocol Alerts"
                            />
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        style={{ color: 'white' }}
                                        checked={selectedProtocols.includes('Discord')}
                                        onChange={handleProtocolChange}
                                        value="Discord"
                                    />
                                }
                                label="Discord"
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
                                    value={slackWebhook}
                                    onChange={(e) => handleSlackWebhookChange(e)}
                                />
                            </div>
                        )}
                         {selectedProtocols.includes('Discord') && (
                            <div>
                                <TextField
                                    label="Discord Webhook"
                                    variant="outlined"
                                    fullWidth
                                    margin="normal"
                                    value={discordWebhook}
                                    onChange={(e) => handleDiscordWebhookChange(e)}
                                />
                            </div>
                        )}


                        {selectedProtocols.includes('Email') && (
                            <div>
                                <TextField
                                    label="Email Address"
                                    variant="outlined"
                                    fullWidth
                                    margin="normal"
                                    value={emailAddress}
                                    onChange={(e) => handleEmailAddressChange(e)}
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
