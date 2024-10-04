// import { globalSocket, io } from "."


// export const createSocketChatRoom = async (chatRoom) => {
//     globalSocket.on(`createRoom-${chatRoom.courseId}`, (data) => {
//         console.log('====================================');
//         console.log(globalSocket.id);
//         console.log('====================================');
//         console.log('Room created:', data);
//         io.emit(`roomCreated-${chatRoom.courseId}`, chatRoom);
//     })
// }