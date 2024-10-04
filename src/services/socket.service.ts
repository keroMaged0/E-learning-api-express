import { Socket } from "socket.io";

class socketService {

    handleMessage(socket: Socket, message: string) {
        console.log('Message received:', message);
        socket.emit('message', `Echo: ${message}`);
    }
}

export default new socketService()