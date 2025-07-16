// import {streamChat} from "stream-chat";
// import "dotenv/config"


// const apiKey = process.env.STREAM_API_KEY;
// const apiSecret = process.env.STREAM_API_SECRET;

// if(!apiKey || !apiSecret) {
//     throw new Error("STREAM_API_KEY and STREAM_API_SECRET must be set in environment variables");
// }
// const streamClient = streamChat.getInstance(apiKey, apiSecret);

// export const upsertStreamUser = async (userData) => {

//     try{
//         await streamClient.upsertUser(userData);
//         return userData
//     }
//     catch (error) {
//         console.error("Error upserting Stream user:", error);
       
//     }
// };

// export const generateStreamToken = (userId) => {
//     try {
//         const token = streamClient.createToken(userId);
//         return token;
//     } catch (error) {
//         console.error("Error generating Stream token:", error);
//         throw error;
//     }};
   


import { StreamChat } from "stream-chat";
import "dotenv/config";


const apiKey = process.env.STREAM_API_KEY;
const apiSecret = process.env.STREAM_API_SECRET;

if (!apiKey || !apiSecret) {
    throw new Error("STREAM_API_KEY and STREAM_API_SECRET must be set in environment variables");
}
const streamClient = StreamChat.getInstance(apiKey, apiSecret);

export const upsertStreamUser = async (userData) => {
    try {
        await streamClient.upsertUser(userData);
        return userData;
    } catch (error) {
        console.error("Error upserting Stream user:", error);
    }
};

export const generateStreamToken = (userId) => {
    try {
        //ensure userId is a string
        const userIsStr=userId.toString();
        //create a token for the user
        const token = streamClient.createToken(userIsStr);
        return token;
    } catch (error) {
        console.error("Error generating Stream token:", error);
        throw error;
    }
};