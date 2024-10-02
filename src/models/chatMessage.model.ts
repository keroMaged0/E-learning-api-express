import mongoose, { Schema } from "mongoose";
import { ICommonModel, MODELS } from "../types/modelNames";

interface IChatMessage extends ICommonModel {
    chatRoomId: mongoose.Types.ObjectId;
    senderId: mongoose.Types.ObjectId;
    content: string;
}

const chatMessageSchema = new Schema<IChatMessage>({
    chatRoomId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'ChatRoom'
    },
    senderId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    content: {
        type: String,
        required: true
    },
});

export const ChatMessage = mongoose.model<IChatMessage>(MODELS.chatMessage, chatMessageSchema);