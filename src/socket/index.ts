import { Server } from "socket.io";
import http from 'http';
import { app } from "../app";


// create server 
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        credentials: true,
    },
});

io.on("connection", (socket) => {
    console.log('====================================');
    console.log('connected', socket.id);
    console.log('====================================');

    io.on("disconnect", () => {
        console.log('user disconnected', socket.id);
    });

    socket.on("joinRoom", (room) => {
        console.log("joining room", room);
        socket.join(room);
    });

});

export {
    server,
    io
}