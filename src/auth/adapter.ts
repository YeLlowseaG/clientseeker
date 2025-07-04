import { Adapter } from "next-auth/adapters";
import { db } from "@/db";
import { accounts, sessions, users, verificationTokens } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export function DrizzleAdapter(): Adapter {
  return {
    async createUser(user) {
      const insertedUser = await db()
        .insert(users)
        .values({
          uuid: user.id,
          email: user.email!,
          nickname: user.name || "",
          avatar_url: user.image || "",
          created_at: new Date(),
        })
        .returning();

      return {
        id: insertedUser[0].uuid,
        email: insertedUser[0].email,
        name: insertedUser[0].nickname,
        image: insertedUser[0].avatar_url,
        emailVerified: null,
      };
    },

    async getUser(id) {
      const user = await db()
        .select()
        .from(users)
        .where(eq(users.uuid, id))
        .limit(1);

      if (!user[0]) return null;

      return {
        id: user[0].uuid,
        email: user[0].email,
        name: user[0].nickname,
        image: user[0].avatar_url,
        emailVerified: null,
      };
    },

    async getUserByEmail(email) {
      const user = await db()
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (!user[0]) return null;

      return {
        id: user[0].uuid,
        email: user[0].email,
        name: user[0].nickname,
        image: user[0].avatar_url,
        emailVerified: null,
      };
    },

    async getUserByAccount({ providerAccountId, provider }) {
      const account = await db()
        .select()
        .from(accounts)
        .where(and(
          eq(accounts.providerAccountId, providerAccountId),
          eq(accounts.provider, provider)
        ))
        .limit(1);

      if (!account[0]) return null;

      const user = await db()
        .select()
        .from(users)
        .where(eq(users.uuid, account[0].userId))
        .limit(1);

      if (!user[0]) return null;

      return {
        id: user[0].uuid,
        email: user[0].email,
        name: user[0].nickname,
        image: user[0].avatar_url,
        emailVerified: null,
      };
    },

    async updateUser(user) {
      if (!user.id) throw new Error("User ID is required");

      const updatedUser = await db()
        .update(users)
        .set({
          email: user.email!,
          nickname: user.name || "",
          avatar_url: user.image || "",
        })
        .where(eq(users.uuid, user.id))
        .returning();

      if (!updatedUser[0]) throw new Error("User not found");

      return {
        id: updatedUser[0].uuid,
        email: updatedUser[0].email,
        name: updatedUser[0].nickname,
        image: updatedUser[0].avatar_url,
        emailVerified: null,
      };
    },

    async deleteUser(userId) {
      await db().delete(users).where(eq(users.uuid, userId));
    },

    async linkAccount(account) {
      await db().insert(accounts).values({
        userId: account.userId,
        type: account.type,
        provider: account.provider,
        providerAccountId: account.providerAccountId,
        refresh_token: account.refresh_token,
        access_token: account.access_token,
        expires_at: account.expires_at,
        token_type: account.token_type,
        scope: account.scope,
        id_token: account.id_token,
        session_state: account.session_state,
      });
    },

    async unlinkAccount({ providerAccountId, provider }) {
      await db()
        .delete(accounts)
        .where(and(
          eq(accounts.providerAccountId, providerAccountId),
          eq(accounts.provider, provider)
        ));
    },

    async createSession({ sessionToken, userId, expires }) {
      const session = await db()
        .insert(sessions)
        .values({
          sessionToken,
          userId,
          expires,
        })
        .returning();

      return {
        sessionToken: session[0].sessionToken,
        userId: session[0].userId,
        expires: session[0].expires,
      };
    },

    async getSessionAndUser(sessionToken) {
      const sessionWithUser = await db()
        .select()
        .from(sessions)
        .where(eq(sessions.sessionToken, sessionToken))
        .limit(1);

      if (!sessionWithUser[0]) return null;

      const user = await db()
        .select()
        .from(users)
        .where(eq(users.uuid, sessionWithUser[0].userId))
        .limit(1);

      if (!user[0]) return null;

      return {
        session: {
          sessionToken: sessionWithUser[0].sessionToken,
          userId: sessionWithUser[0].userId,
          expires: sessionWithUser[0].expires,
        },
        user: {
          id: user[0].uuid,
          email: user[0].email,
          name: user[0].nickname,
          image: user[0].avatar_url,
          emailVerified: null,
        },
      };
    },

    async updateSession({ sessionToken, ...updates }) {
      const session = await db()
        .update(sessions)
        .set(updates)
        .where(eq(sessions.sessionToken, sessionToken))
        .returning();

      return {
        sessionToken: session[0].sessionToken,
        userId: session[0].userId,
        expires: session[0].expires,
      };
    },

    async deleteSession(sessionToken) {
      await db().delete(sessions).where(eq(sessions.sessionToken, sessionToken));
    },

    async createVerificationToken({ identifier, expires, token }) {
      const verificationToken = await db()
        .insert(verificationTokens)
        .values({
          identifier,
          token,
          expires,
        })
        .returning();

      return {
        identifier: verificationToken[0].identifier,
        token: verificationToken[0].token,
        expires: verificationToken[0].expires,
      };
    },

    async useVerificationToken({ identifier, token }) {
      const verificationToken = await db()
        .select()
        .from(verificationTokens)
        .where(and(
          eq(verificationTokens.identifier, identifier),
          eq(verificationTokens.token, token)
        ))
        .limit(1);

      if (!verificationToken[0]) return null;

      await db()
        .delete(verificationTokens)
        .where(and(
          eq(verificationTokens.identifier, identifier),
          eq(verificationTokens.token, token)
        ));

      return {
        identifier: verificationToken[0].identifier,
        token: verificationToken[0].token,
        expires: verificationToken[0].expires,
      };
    },
  };
}