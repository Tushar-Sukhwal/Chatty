import "socket.io";

import { IUserDocument } from "../models/User.model";

declare module "socket.io" {
  interface Socket {
    userName?: string;
    // user?: IUserDocument;
    mongoId?: Schema.Types.ObjectId;
  }
}
