import { Connection } from "mongoose";

declare global {
  var mongo_conn: {
    conn: Connection | null;
    promise: Promise<Connection> | null;
  };
}

export {};
