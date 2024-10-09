import { NotFoundError } from "../../errors/notFoundError";
import { Users } from "../../models/user.models";

/*************** Find a user by query. ***************/
const findUser = async (query: any, next: Function) => {
    const user = await Users.findOne(query);
    if (!user) {
        return next(new NotFoundError('User not found'));
    }
    return user;
};

/*************** Find a user by ID. ***************/
const findUserById = async (userId: string, next: Function) => {
    const user = await Users.findById(userId);
    if (!user) {
        return next(new NotFoundError('User not found'));
    }
    return user;
};

export{
    findUser,
    findUserById,
}