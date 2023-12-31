export const  calculateRelativeTime=(eventTimestamp) =>{
    const currentTimestamp = Math.floor(Date.now() / 1000); // Convert milliseconds to seconds
    const timeDifference = parseInt(currentTimestamp - (eventTimestamp)/1000);
  
    if (timeDifference < 60) {
      return `${timeDifference} second${timeDifference !== 1 ? 's' : ''} ago`;
    } else if (timeDifference < 3600) {
      const minutes = Math.floor(timeDifference / 60);
  
      return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    } else if (timeDifference < 86400) {
      const hours = Math.floor(timeDifference / 3600);
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(timeDifference / 86400);
      return `${days} day${days !== 1 ? 's' : ''} ago`;
    }
  }
  export const Avatars=[
    "https://www.larvalabs.com/cryptopunks/cryptopunk9166.png",
    "https://www.larvalabs.com/cryptopunks/cryptopunk7804.png",
    "https://www.larvalabs.com/cryptopunks/cryptopunk3100.png",
    "https://www.larvalabs.com/cryptopunks/cryptopunk2645.png",
    "https://www.larvalabs.com/cryptopunks/cryptopunk6487.png",
    "https://www.larvalabs.com/cryptopunks/cryptopunk9166.png",
    "https://www.larvalabs.com/cryptopunks/cryptopunk7804.png",
    "https://www.larvalabs.com/cryptopunks/cryptopunk3100.png",
    "https://www.larvalabs.com/cryptopunks/cryptopunk2645.png",
    "https://www.larvalabs.com/cryptopunks/cryptopunk6487.png",
    "https://www.larvalabs.com/cryptopunks/cryptopunk9166.png",
    "https://www.larvalabs.com/cryptopunks/cryptopunk7804.png",
    "https://www.larvalabs.com/cryptopunks/cryptopunk3100.png",
    "https://www.larvalabs.com/cryptopunks/cryptopunk2645.png",
    "https://www.larvalabs.com/cryptopunks/cryptopunk6487.png",
  
  ]

