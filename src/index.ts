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
  try {
    await connectMongoDB(env.mongoDb.url);
    
    mailTransporter.verifyTransporter();

    const server = http.createServer(app);

    const io = initIo(server);
    io.on('connection', socketController);

    server.listen(env.port, () => {
      console.log(`Server running on port ${env.port} (${env.environment})`);
    });
  } catch (error) {
    console.error('Failed to start the server:', error);
  }
};


// Start the application
start();