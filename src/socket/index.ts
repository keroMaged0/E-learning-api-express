// import { Server, Socket } from "socket.io";
// import http from 'http';

// import { io } from "../config/socket";

// import { app } from "../app";

// // create server 
// const server = http.createServer(app);
// const io = new Server(server, {
//     cors: {
//         origin: '*',
//         credentials: true,
//     },
// });


// let globalSocket: Socket;
// // setup socket events
// io.on("connection", (socket) => {
//     console.log('User connected:', socket.id);

//     globalSocket = socket;

//     socket.on('disconnect', () => {
//         console.log('User disconnected:', socket.id);
//     });
// });


// export {
//     server,
//     globalSocket
// }