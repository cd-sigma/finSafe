import './transactionFeed.css';
import {Typography} from "@mui/material";
export const TransactionsFeed=({date,hash,description}) => {
    return (
        <>
        <div id="main-container">
            <div id="main">
            <Typography variant="subtitle2" id="date">{date}</Typography>
            <Typography id="address" variant = "subtitle1">{hash.slice(0,6) + '...' + hash.slice(-4)}</Typography>
            </div>
            <Typography variant="h6" id="description">
                {description}
            </Typography>
        </div>
        </>
    )
}