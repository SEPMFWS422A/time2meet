import NextAuth from "next-auth";
import  CredentialsProvider  from "next-auth/providers/credentials";
import dbConnect from "@/lib/database/dbConnect";
import User from "@/lib/models/user";
import bcrypt from "bcrypt";

export default NextAuth({
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: {label: "Email", type:"email"},
                password: { label: "Passwort", type: "password"},
            },
            async authorize(credentials) {
                await dbConnect();

                const user = await User.findOne({email: credentials?.email});
                if(!user) {
                    throw new Error("Kein Benutzer mit dieser E-Mail gefunden");
                }

                const isValid = await bcrypt.compare(credentials!.password, user.password);
                if(!isValid){
                    throw new Error("Falsches Passwort");
                }

                return {id: user._id.toString(), email: user.email, name: user.name};
            },
        }),
    ],
    session: {
        strategy: "jwt",
    },
    callbacks: {
        async jwt({ token, user }) {
            if(user) {
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            if(token && session.user) {
                session.user.id = token.id as string;
            }
            return session;
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
});