import { SafeUser } from "./index.ts";

declare global {
  namespace Express {
    interface Request {
      user?: SafeUser;
    }
  }
}
