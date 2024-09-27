import { Users } from "../models/user.models";
import { NotFoundError } from "../errors/notFoundError";

export const findUser = async (userId: string) => {
    const user = await Users.findById(userId);
    if (!user) throw new NotFoundError('User not found');
    return user;
};
