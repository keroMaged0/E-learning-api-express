import mongoose from "mongoose";
import { logger } from "./logger";


export const connectMongoDB = (url: string) => {
    mongoose.connect(url).then(() => {
        console.log("scdlmndcdkcndncdnjdcndjndcjndcjdcndncncnjdcndc");
        
        logger.info("Connected to MongoDB")
    }).catch((error) => {
        logger.error("Error connecting to MongoDB", error);
    });;
}   