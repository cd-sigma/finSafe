import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    TextField,
    InputAdornment,
    Button,
} from '@mui/material';
import { useUserStore } from '../../store/userStore';

const HealthFactor = () => {
    const [loading, setLoading] = useState(false);
    const [addressInput, setAddressInput] = useState('');
    const [userAddress, setUserAddress] = useState('');
    const [healthFactor, setHealthFactor] = useState(0);
    const [collateralData, setCollateralData] = useState([]);
    const [debtData, setDebtData] = useState([]);

    useEffect(() => {
        fetchData();
    }, [userAddress]);

    const fetchData = async () => {
        if (userAddress) {
            setLoading(true);
            const response = await axios.get(`https://finsafe-backend.insidefi.io/health/factor/${userAddress}`);

            setCollateralData(
                response.data.result.data?.metadata?.supplied.map((item) => ({
                    address: item.underlying,
                    amount: item.balance,
                    price: item.usdPrice,
                    threshold: item.liqudationThreshold,
                }))
            );
            setDebtData(
                response.data.result.data?.metadata?.borrowed.map((item) => ({
                    address: item.underlying,
                    amount: item.balance,
                    price: item.usdPrice,
                }))
            );

            setHealthFactor(response.data.result.data?.metadata?.healthFactor);
            setLoading(false);
        }
    };

    const fetchDataAndUpdateHealthFactor = async () => {
        if (userAddress) {
            setLoading(true);

            const payload = {
                supplied: collateralData.map((item) => ({
                    underlying: item.address,
                    balance: item.amount,
                    usdPrice: item.price,
                    liqudationThreshold: item.threshold,
                })),
                borrowed: debtData.map((item) => ({
                    underlying: item.address,
                    balance: item.amount,
                    usdPrice: item.price,
                })),
            };

            try {
                const response = await axios.post(`https://finsafe-backend.insidefi.io/health/factor/calculate`, payload);

                setHealthFactor(response.data?.result?.data);
            } catch (error) {
                console.error('Error updating health factor:', error);
            }

            setLoading(false);
        }
    };

    const handleCollateralChange = (index, field, value) => {
        const updatedData = [...collateralData];
        updatedData[index][field] = value;
        setCollateralData(updatedData);

        fetchDataAndUpdateHealthFactor();
    };

    const handleDebtChange = (index, field, value) => {
        const updatedData = [...debtData];
        updatedData[index][field] = value;
        setDebtData(updatedData);

        fetchDataAndUpdateHealthFactor();
    };

    const handleEnterKeyPress = (index, isCollateral) => {
        if (isCollateral) {
            setCollateralData([...collateralData, { address: '', amount: '', price: '', threshold: '' }]);
        } else {
            setDebtData([...debtData, { address: '', amount: '', price: '' }]);
        }
    };

    const handleAddRow = (isCollateral) => {
        if (isCollateral) {
            setCollateralData([...collateralData, { address: '', amount: '', price: '', threshold: '' }]);
        } else {
            setDebtData([...debtData, { address: '', amount: '', price: '' }]);
        }
    };

    const handleDeleteRow = (index, isCollateral) => {
        if (isCollateral) {
            const updatedData = [...collateralData];
            updatedData.splice(index, 1);
            setCollateralData(updatedData);
        } else {
            const updatedData = [...debtData];
            updatedData.splice(index, 1);
            setDebtData(updatedData);
        }

        fetchDataAndUpdateHealthFactor();
    };

    const handleManualApiCall = () => {
        fetchDataAndUpdateHealthFactor();
    };

    return (
        <div>
            <h1>HEALTH FACTOR SIMULATION TOOL</h1>

      
            <TextField
                label="Enter Address"
                placeholder="Search by Address"
                value={addressInput}
                onChange={(e) => setAddressInput(e.target.value)}
                InputProps={{
                    style: { color: 'white' },
                    endAdornment: (
                        <InputAdornment position="end">
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => setUserAddress(addressInput)}
                                style={{ background: 'blue', color: 'white' }}
                            >
                                Search
                            </Button>
                        </InputAdornment>
                    ),
                }}
                style={{ margin: '10px 0', width: '100%' }}
                InputLabelProps={{
                    style: {
                        color: 'white',
                    },
                }}
            />

            <h2>Collateral</h2>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Collateral Address</TableCell>
                            <TableCell>Collateral Amount</TableCell>
                            <TableCell>Price</TableCell>
                            <TableCell>Liquidation Threshold</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {collateralData.map((row, index) => (
                            <TableRow key={index}>
                                <TableCell>
                                    <TextField
                                        value={row.address}
                                        onChange={(e) => handleCollateralChange(index, 'address', e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleEnterKeyPress(index, true)}
                                    />
                                </TableCell>
                                <TableCell>
                                    <TextField
                                        value={row.amount}
                                        onChange={(e) => handleCollateralChange(index, 'amount', e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleEnterKeyPress(index, true)}
                                    />
                                </TableCell>
                                <TableCell>
                                    <TextField
                                        value={row.price}
                                        onChange={(e) => handleCollateralChange(index, 'price', e.target.value)}
                                        InputProps={{
                                            startAdornment: <InputAdornment position="start">$</InputAdornment>,
                                        }}
                                        onKeyPress={(e) => e.key === 'Enter' && handleEnterKeyPress(index, true)}
                                    />
                                </TableCell>
                                <TableCell>
                                    <TextField
                                        value={row.threshold}
                                        onChange={(e) => handleCollateralChange(index, 'threshold', e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleEnterKeyPress(index, true)}
                                    />
                                </TableCell>
                                <TableCell>
                                    {index === collateralData.length - 1 && (
                                        <>
                                            <Button
                                                sx={{ mr: 1 }}
                                                variant="contained"
                                                color="primary"
                                                onClick={() => handleAddRow(true)}
                                            >
                                                +
                                            </Button>
                                            <Button
                                                variant="contained"
                                                color="secondary"
                                                onClick={() => handleDeleteRow(index, true)}
                                            >
                                                -
                                            </Button>
                                        </>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <h2>Debt</h2>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Debt Address</TableCell>
                            <TableCell>Debt Amount</TableCell>
                            <TableCell>Price</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {debtData.map((row, index) => (
                            <TableRow key={index}>
                                <TableCell>
                                    <TextField
                                        value={row.address}
                                        onChange={(e) => handleDebtChange(index, 'address', e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleEnterKeyPress(index, false)}
                                    />
                                </TableCell>
                                <TableCell>
                                    <TextField
                                        value={row.amount}
                                        onChange={(e) => handleDebtChange(index, 'amount', e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleEnterKeyPress(index, false)}
                                    />
                                </TableCell>
                                <TableCell>
                                    <TextField
                                        value={row.price}
                                        onChange={(e) => handleDebtChange(index, 'price', e.target.value)}
                                        InputProps={{
                                            startAdornment: <InputAdornment position="start">$</InputAdornment>,
                                        }}
                                        onKeyPress={(e) => e.key === 'Enter' && handleEnterKeyPress(index, false)}
                                    />
                                </TableCell>
                                <TableCell>
                                    {index === debtData.length - 1 && (
                                        <>
                                            <Button
                                                sx={{ mr: 1 }}
                                                variant="contained"
                                                color="primary"
                                                onClick={() => handleAddRow(false)}
                                            >
                                                +
                                            </Button>
                                            <Button
                                                variant="contained"
                                                color="secondary"
                                                onClick={() => handleDeleteRow(index, false)}
                                            >
                                                -
                                            </Button>
                                        </>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
{/* 
            <Button variant="contained" color="primary" onClick={handleManualApiCall}>
                Update Health Factor
            </Button> */}

            <h2>Health Factor = {healthFactor}</h2>
        </div>
    );
};

export default HealthFactor;
