import NextAuth from "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            name?: string | null;
            vorname?: string | null;
            email?: string | null;
        }
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id?: string;
    }
}