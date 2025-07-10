import { NextResponse } from "next/server";
import { verifyUserFromCookie } from "@/lib/authMiddleware";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(request) {
  try {
    const user = await verifyUserFromCookie(request);
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get("symbol");
    const status = searchParams.get("status");
    const bucketId = searchParams.get("bucket_id");

    let query = supabaseAdmin
      .from("trades")
      .select(
        "id, bucket_id, symbol, notes, created_at, status, market, target, stop_loss, quantity, price, exit_price, return_amount, return_percent, buckets(name)"
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (symbol) query = query.ilike("symbol", `%${symbol}%`);
    if (status) query = query.eq("status", status);
    if (bucketId) query = query.eq("bucket_id", bucketId);

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}
