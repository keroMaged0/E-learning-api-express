import { SOCKET_EVENTS } from "../../types/socketEvents";

const socketController = (socket) => {
    console.log('User connected', socket.id);

    // Handle join room event and join the courseId room
    socket.on(SOCKET_EVENTS.joinRoom, ({ courseId, userId }) => {
        if (!courseId || !userId) {
            console.error('Invalid courseId or userId');
            return;
        }

        socket.join(courseId);
        console.log(`User ${socket.id} joined room: ${courseId}`);
        socket.emit(SOCKET_EVENTS.roomJoined, { courseId, message: `Welcome to the room: ${courseId}` });
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
}

export default socketController;
