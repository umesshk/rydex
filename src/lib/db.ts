import mongoose from "mongoose";

const MONGODB_URL = process.env.MONGODB_URL;

if (!MONGODB_URL) {
  throw new Error("Url Missing ");
}

let cachedConn = global.mongo_conn;

if (!cachedConn) {
  cachedConn = global.mongo_conn = { conn: null, promise: null };
}
const connectDb = async () => {
  if (cachedConn.conn) {
    return cachedConn.conn;
  }

  if (!cachedConn.promise) {
    cachedConn.promise = mongoose
      .connect(MONGODB_URL)
      .then((c) => c.connection);
  }

  try {
    const conn = await cachedConn.promise;
    return conn;
  } catch (e) {
    console.log(e);
  }
};

export default connectDb;
