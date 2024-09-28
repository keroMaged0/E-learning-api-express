/* eslint-disable indent */
import http from 'http';

import { connectMongoDB } from './config/mongoConnect';
import { mailTransporter } from './utils/mail';
import { env } from './config/env';
import './types/customDefinition';
import { app } from './app';

const start = async () => {
    // connect to DB
    await connectMongoDB(env.mongoDb.url);

    mailTransporter.verifyTransporter();

    // create server 
    const server = http.createServer(app);

    // start server
    server.listen(env.port, () => {
        console.log(`Server is running on port ${env.port} in ${env.environment} mode.`);
    });

}

start()