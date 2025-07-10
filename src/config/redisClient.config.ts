import Redis from 'ioredis';
import { env } from './env';
import { logger } from './logger';

// create new client 
const client = new Redis({
    host: env.redis.host,
    port: env.redis.port,
    password:env.redis.password,
});

client.on('error', (err) => {
    logger.info(err);
})

client.on('connect', () => {
    logger.info('Connected to Redis');
})

export default client;