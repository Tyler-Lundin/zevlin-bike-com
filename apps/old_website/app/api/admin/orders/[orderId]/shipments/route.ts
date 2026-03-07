// app/api/admin/orders/[orderId]/shipments/route.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// NB: createClient() is async in your setup, so we use Awaited<ReturnType<...>>
type ServerSupabase = Awaited<ReturnType<typeof createClient>>;

// Self-contained auth check
async function requireAdmin(supabase: ServerSupabase) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { data: customer } = await supabase
    .from("customers")
    .select("id")
    .eq("auth_user_id", user.id)
    .single();
  if (!customer) return false;

  const { data: roles } = await supabase.rpc("get_user_roles", {
    user_id: customer.id,
  });

  return !!(roles && Array.isArray(roles) && roles.includes("admin"));
}

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ orderId: string }> }
) {
  const supabase = await createClient();

  const isAdmin = await requireAdmin(supabase);
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { orderId } = await ctx.params || {};
  if (!orderId) {
    return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
  }

  try {
    const { data: shipments, error } = await supabase
      .from("shipments")
      .select("*")
      .eq("order_id", orderId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ shipments });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to fetch shipments";
    console.error(`Failed to fetch shipments for order ${orderId}:`, err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

