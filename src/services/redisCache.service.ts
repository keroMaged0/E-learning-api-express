import { logger } from "../config/logger";
import client from "../config/redisClient.config";


/******************** cache data ********************/
const setCache = async (key: string, value: any, ttl: number = 3600): Promise<void> => {
    try {
        const data = JSON.stringify(value)
        await client.set(key, data, 'EX', ttl);
    } catch (error) {
        logger.error(`Error caching data with key: ${key} - ${error}`);
        throw error;
    }
}

/******************** get data ********************/
const getData = async (key: string): Promise<any> => {
    try {
        const data = await client.get(key);
        if (data) {
            return JSON.parse(data);
        } else {
            logger.warn(`No data found in cache with key: ${key}`);
            return null;
        }

    } catch (error) {
        logger.error(`Error retrieving data from cache with key: ${key} - ${error}`);
        throw error;
    }
}

/******************** delete data ********************/
const deleteData = async (key: string): Promise<void> => {
    try {
        await client.del(key);
    } catch (error) {
        logger.error(`Error deleting data from cache with key: ${key} - ${error}`);
        throw error;
    }
}

export {
    setCache,
    getData,
    deleteData
}