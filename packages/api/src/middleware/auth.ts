import { Request, Response, NextFunction } from "express";
import { supabase } from "../services/supabase";

export interface AuthenticatedRequest extends Request {
  userId?: string;
}

export async function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing authorization header" });
    return;
  }

  const token = authHeader.slice(7);

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error || !user) {
    res.status(401).json({ error: "Invalid or expired token" });
    return;
  }

  req.userId = user.id;

  // Ensure user exists in public.users (mirrors auth.users)
  const { data: publicUser } = await supabase
    .from("users")
    .select("id")
    .eq("id", user.id)
    .single();

  if (!publicUser) {
    await supabase.from("users").insert({
      id: user.id,
      email: user.email ?? "",
      display_name: user.user_metadata?.display_name || user.email?.split("@")[0] || "Player",
    });
  }

  next();
}
