import { Server } from "socket.io";


let io

/*************** Init Socket Io ***************/
const initIo = (server) => {
    io = new Server(server, {
        cors: {
            origin: '*',
            credentials: true,
        },
    });
    return io;
}


/*************** Get Socket Io ***************/
const getIo = () => {
    if (!io) { throw new Error('Socket.io not initialized'); }
    return io;
}


export {
    initIo,
    getIo
}