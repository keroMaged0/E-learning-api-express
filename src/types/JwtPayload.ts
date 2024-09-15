import { Types } from 'mongoose';

import { SystemRoles } from './roles';

export interface IJwtPayload {
  _id: Types.ObjectId;
  role: SystemRoles;
  isVerified: boolean;
}
