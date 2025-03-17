import "@testing-library/jest-dom";
import '@testing-library/jest-dom/jest-globals';
import { TextEncoder, TextDecoder } from "util";

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as any;

jest.mock("@/lib/database/dbConnect");
jest.mock("jsonwebtoken");
