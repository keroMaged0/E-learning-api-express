import { logger } from "../utils/logger";
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


/******************** delete all course cache keys ********************/
export const deleteAllCacheKeys = async (cacheKey): Promise<void> => {
    try {
        const keys = await client.keys(cacheKey);
        if (keys.length > 0) {
            await client.del(keys);
            logger.info(`Deleted ${keys.length} cache keys related to courses`);
        } else {
            logger.warn('No course-related cache keys found to delete');
        }
    } catch (error) {
        logger.error(`Error deleting course cache keys - ${error}`);
        throw error;
    }
};

export {
    setCache,
    getData,
    deleteData
}