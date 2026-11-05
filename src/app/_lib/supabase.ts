// 🟡 CHANGED: added this note. This file uses the SECRET service-role key,
// so only import it from server code (like src/app/api/.../route.ts),
// NEVER from a "use client" component.
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);
