import {Typography} from "@mui/material";
import {TransactionsFeed} from "../components/TransactionsFeed";
import {feedData} from "../components/data";
import {useUserStore} from "../store/userStore";
import {getFeedDetails} from "../api/profile.api";
import {useEffect} from "react";

export const FeedPage=({isActive}) => {
    const data=useUserStore((state) => state.feedData);
    const setFeedData=useUserStore((state) => state.setFeedData);
    const userAddress='0x464c71f6c2f760dda6093dcb91c24c39e5d6e18c'
    const searchId=window.location.pathname.split('/')[2];
    const getUserFeed=async () => {
        const data=await getFeedDetails(searchId);
        setFeedData(data);
    }
    useEffect(() => {   
        getUserFeed();
    }, [isActive]);

    return(
        <>
        {/*<Typography variant="h2" className='title'>Feed Content Goes Here</Typography>*/}
        <div style={{display: 'flex',justifyContent: 'center',alignItems: 'center', flexDirection: 'column'}}>
            {data.map((item) => (
                <TransactionsFeed hash={item.title} date={item.timestamp} description={item.body}/>
            ))}
        </div>
        </>
    )
}