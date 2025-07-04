import NextAuth from "next-auth";
import { authOptions } from "./config";

const { handlers, signIn, signOut, auth } = NextAuth(authOptions);

export { handlers, signIn, signOut, auth };
