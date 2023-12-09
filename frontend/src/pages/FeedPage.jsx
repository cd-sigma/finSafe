import {Typography} from "@mui/material";
import {TransactionsFeed} from "../components/TransactionsFeed";
import {feedData} from "../components/data";

export const FeedPage=() => {
    return(
        <>
        {/*<Typography variant="h2" className='title'>Feed Content Goes Here</Typography>*/}
        <div>
            {feedData.map((item) => (
                <TransactionsFeed hash={item.txHash} date={item.timestamp} description={item.actionType}/>
            ))}
        </div>
        </>
    )
}