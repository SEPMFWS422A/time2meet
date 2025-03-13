import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    throw new Error("Bitte definiere die MONGODB_URI Umgebungsvariable in der .env.local Datei");
}

// Caching für die MongoDB-Verbindung (Verhindert doppelte Verbindungen in Next.js API-Routen)
interface MongooseCache {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
}

declare global {
    var mongooseCache: MongooseCache;
}

let cached = globalThis.mongooseCache || { conn: null, promise: null };

if (!cached) {
    cached = globalThis.mongooseCache = { conn: null, promise: null };
}

async function dbConnect() {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        // @ts-ignore
        cached.promise = mongoose
            .connect(MONGODB_URI!, {
                dbName: "time2meet",
            })
            .then((mongoose) => {
                return mongoose;
            })
            .catch((error) => {
                console.error("Fehler bei der Verbindung mit MongoDB Atlas:", error);
                throw new Error("Verbindung zu MongoDB fehlgeschlagen");
            });
    }

    try {
        cached.conn = await cached.promise;
    } catch (error) {
        cached.promise
        throw error;
    }
    
    return cached.conn;
}

export default dbConnect;
