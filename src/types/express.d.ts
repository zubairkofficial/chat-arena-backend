// ../types/express.d.ts
import { User } from './user.interface'; // Correct the path to your user interface

declare global {
  namespace Express {
    interface Request {
      user?: User; // Add user property to Request type
    }
  }
}
