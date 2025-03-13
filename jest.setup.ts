import "@testing-library/jest-dom";
import { TextEncoder, TextDecoder } from "util";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

console.log("🔍 MONGODB_URI:", process.env.MONGODB_URI);

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as any;

//jest.mock("@/lib/database/dbConnect");
//jest.mock("jsonwebtoken");
