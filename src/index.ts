import http from 'http';

import socketController from './controllers/socket/socket.controller';
import { connectMongoDB } from './config/mongoConnect';
import { mailTransporter } from './utils/mail';
import { initIo } from './utils/initSocketIo';
import { env } from './config/env';
import './types/customDefinition';
import { app } from './app';

/*************** Start App ***************/
const start = async () => {
    // connect to DB
    await connectMongoDB(env.mongoDb.url);

    // verify mail transporter
    mailTransporter.verifyTransporter();

    // create server 
    const server = http.createServer(app);

    // create socket server
    const io = initIo(server)
    io.on('connection', (socket) => {
        socketController(socket);
    });

    // start server
    server.listen(env.port, () => {
        console.log(`Server is running on port ${env.port} in ${env.environment} mode.`);
    });
}

start()