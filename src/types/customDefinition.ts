/* eslint-disable @typescript-eslint/no-namespace */

import { IJwtPayload } from "./JwtPayload";
import { IPagination } from "./pagination";


declare global {
  namespace Express {
    interface Request {
      loggedUser: IJwtPayload;
      pagination: IPagination;
    }
  }
}


