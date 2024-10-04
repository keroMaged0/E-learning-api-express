const socketController = (socket) => {
    console.log('User connected',socket.id);

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
}

export default socketController;
