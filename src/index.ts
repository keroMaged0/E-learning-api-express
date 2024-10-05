// Import necessary modules
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
    // Connect to MongoDB
    await connectMongoDB(env.mongoDb.url);

    // Verify mail transporter
    mailTransporter.verifyTransporter();

    // Create HTTP server
    const server = http.createServer(app);

    // Initialize socket server
    const io = initIo(server);
    io.on('connection', (socket) => {
        // Handle socket connections
        socketController(socket);
    });

    // Start the server
    server.listen(env.port, () => {
        console.log(`Server is running on port ${env.port} in ${env.environment} mode.`);
    });
}

// Start the application
start();