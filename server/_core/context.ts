import ws from "ws";
import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import * as db from "../db";
import { ENV } from "./env";
import { createClient } from "@supabase/supabase-js";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

const supabaseAdmin = createClient(
  ENV.supabaseUrl,
  ENV.supabaseServiceRoleKey,
  {
    realtime: {
      transport: ws
    }
  }
);

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    const authHeader = opts.req.headers.authorization;
    console.log("[Auth] Authorization header:", authHeader ? "present" : "missing");

    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.slice(7);
      console.log("[Auth] Token length:", token.length);

      const { data: { user: supabaseUser }, error } =
        await supabaseAdmin.auth.getUser(token);

      console.log("[Auth] Supabase user:", supabaseUser?.id ?? "null", "Error:", error?.message ?? "none");

      if (!error && supabaseUser) {
        user = await db.getUserByOpenId(supabaseUser.id);
        console.log("[Auth] DB user found:", user?.id ?? "null");

        if (!user) {
          await db.upsertUser({
            openId: supabaseUser.id,
            email: supabaseUser.email ?? null,
            name: supabaseUser.user_metadata?.name ?? null,
            loginMethod: "email",
            lastSignedIn: new Date(),
          });
          user = await db.getUserByOpenId(supabaseUser.id);
          console.log("[Auth] New user created:", user?.id ?? "null");
        } else {
          await db.upsertUser({
            openId: supabaseUser.id,
            lastSignedIn: new Date(),
          });
        }
      }
    }
  } catch (error) {
    console.warn("[Auth] Failed to authenticate request:", error);
    user = null;
  }

  console.log("[Auth] Final user:", user?.id ?? "null");

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
