import { NextResponse } from "next/server";
import { verifyUserFromCookie } from "@/lib/authMiddleware";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(request, { params }) {
  const { id: bucketId, tradeId } = params;
  const user = await verifyUserFromCookie(request);
  const { data, error } = await supabaseAdmin
    .from("trades")
    .select(
      "id, symbol, notes, created_at, status, profit_loss, market, target, stop_loss, trade_entries(id, action, date_time, quantity, price, notes)"
    )
    .eq("id", tradeId)
    .eq("bucket_id", bucketId)
    .eq("user_id", user.id)
    .single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

export async function PUT(request, { params }) {
  const { id: bucketId, tradeId } = params;
  const user = await verifyUserFromCookie(request);
  const { symbol, notes, market, target, stop_loss, entries } = await request.json();

  const { data: trade, error } = await supabaseAdmin
    .from("trades")
    .update({ symbol, notes, market, target, stop_loss })
    .eq("id", tradeId)
    .eq("bucket_id", bucketId)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await supabaseAdmin.from("trade_entries").delete().eq("trade_id", tradeId);

  if (entries && Array.isArray(entries) && entries.length > 0) {
    const entriesData = entries.map((e) => ({ ...e, trade_id: tradeId }));
    const { error: entriesError } = await supabaseAdmin
      .from("trade_entries")
      .insert(entriesData);
    if (entriesError) {
      return NextResponse.json({ error: entriesError.message }, { status: 500 });
    }
  }

  return NextResponse.json(trade);
}
