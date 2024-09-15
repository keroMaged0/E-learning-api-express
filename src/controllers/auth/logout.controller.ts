import { catchError } from "../../middlewares/errorHandling.middleware";

export const logoutHandler = catchError(
    async (req, res, next) => {
        const {_id} = req.loggedUser;

        
    }
)