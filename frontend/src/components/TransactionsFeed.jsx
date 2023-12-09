import './transactionFeed.css';
import {Typography} from "@mui/material";
import dayjs, { Dayjs } from "dayjs";
import { calculateRelativeTime } from '../utils';
export const TransactionsFeed=({date,hash,description}) => {
    return (
        <>
        <div id="main-container">
            <div id="main">
            <Typography variant="subtitle2" id="date">{calculateRelativeTime(date)}</Typography>
            <Typography id="address" variant = "subtitle1">{hash}</Typography>
            </div>
            <Typography variant="h6" id="description">
                {description}
            </Typography>
        </div>
        </>
    )
}