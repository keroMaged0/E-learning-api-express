import mongoose, { Schema } from "mongoose";
import { ICommonModel, MODELS } from "../types/modelNames";

interface IChatRoom extends ICommonModel {
    courseId: mongoose.Types.ObjectId;
    participants: mongoose.Types.ObjectId[];
}


const chatRoomSchema = new Schema<IChatRoom>({
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: MODELS.course
    },
    participants: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: MODELS.users
        }
    ],
}, { timestamps: true})

export const ChatRoom = mongoose.model<IChatRoom>(MODELS.chatRoom, chatRoomSchema);
