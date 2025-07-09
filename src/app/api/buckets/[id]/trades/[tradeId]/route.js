import { NextResponse } from "next/server";
import { verifyUserFromCookie } from "@/lib/authMiddleware";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(request, { params }) {
  const { id: bucketId, tradeId } = params;
  const user = await verifyUserFromCookie(request);
  const { data, error } = await supabaseAdmin
    .from("trades")
    .select(
      "id, symbol, notes, created_at, status, profit_loss, market, target, stop_loss, date, quantity, price, exit_price, return_amount, return_percent"
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
  const {
    symbol,
    notes,
    market,
    target,
    stop_loss,
    date,
    quantity,
    price,
    status,
    exit_price,
    return_amount,
    return_percent,
  } = await request.json();

  const { data: trade, error } = await supabaseAdmin
    .from("trades")
    .update({
      symbol,
      notes,
      market,
      target,
      stop_loss,
      date,
      quantity,
      price,
      status,
      exit_price,
      return_amount,
      return_percent,
    })
    .eq("id", tradeId)
    .eq("bucket_id", bucketId)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(trade);
}

export async function DELETE(request, { params }) {
  const { id: bucketId, tradeId } = params;
  const user = await verifyUserFromCookie(request);

  const { error } = await supabaseAdmin
    .from("trades")
    .delete()
    .eq("id", tradeId)
    .eq("bucket_id", bucketId)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: "Trade deleted" }, { status: 200 });
}
