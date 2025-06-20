import { NextResponse } from "next/server";
import { verifyUserFromCookie } from "@/lib/authMiddleware";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(request, { params }) {
  const { id: bucketId } = params;
  const user = await verifyUserFromCookie(request);

  const { data, error } = await supabaseAdmin
    .from("trades")
    .select(
      "id, stock, notes, created_at, status, profit_loss, market, target, stop_loss, trade_entries(id, action, date_time, quantity, price, notes)"
    )
    .eq("bucket_id", bucketId)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

export async function POST(request, { params }) {
  const { id: bucketId } = params;
  const user = await verifyUserFromCookie(request);
  const { stock, notes, market, target, stop_loss, entries } =
    await request.json();

  const { data: trade: trade, error } = await supabaseAdmin
    .from("trades")
    .insert([
      {
        user_id: user.id,
        bucket_id: bucketId,
        stock,
        notes,
        market,
        target,
        stop_loss,
        market,
        target,
        stop_loss,
      },
    ])
    .select()
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (entries && Array.isArray(entries) && entries.length > 0) {
    const entriesData = entries.map((e) => ({ ...e, trade_id: trade.id }));
    const { error: entriesError } = await supabaseAdmin
      .from("trade_entries")
      .insert(entriesData);

    if (entriesError) {
      return NextResponse.json(
        { error: entriesError.message },
        { status: 500 }
      );
    }
  }

  return NextResponse.json(trade, { status: 201 });
}
