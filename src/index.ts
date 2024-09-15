/* eslint-disable indent */
import https from 'https';
import http from 'http';
import path from 'path';
import fs from 'fs';

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
    const server =
        env.environment === 'production'
            ? https.createServer(
                {
                    cert: fs.readFileSync(path.resolve('/app/fullchain.pem')),
                    key: fs.readFileSync(path.resolve('/app/privkey.pem')),
                },
                app
            )
            : http.createServer(app);

    // start server
    server.listen(env.port, () => {
        console.log(`Server is running on port ${env.port} in ${env.environment} mode.`);
    });

}

start()