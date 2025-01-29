import { MongoClient } from "mongodb";

const uri: string = process.env.MONGODB_URI || "mongodb://localhost:27017";
const options = {};

declare global {
  var _mongoClientPromise: Promise<MongoClient>;
}
let clientPromise: Promise<MongoClient>;

if (!(global as any)._mongoClientPromise) {
  let client: MongoClient;

  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
}

clientPromise = global._mongoClientPromise;
export default clientPromise;