import { NextResponse } from "next/server";
import { verifyUserFromCookie } from "@/lib/authMiddleware";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { calculateAvailableCash } from "@/lib/bucketUtils";

export async function GET(request, { params }) {
  const { id: bucketId } = params;
  const user = await verifyUserFromCookie(request);

  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol");
  const status = searchParams.get("status");

  let query = supabaseAdmin
    .from("trades")
    .select(
      "id, symbol, notes, created_at, status, profit_loss, market, target, stop_loss, quantity, price, exit_price, return_amount, return_percent"
    )
    .eq("bucket_id", bucketId)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (symbol) query = query.eq("symbol", symbol);
  if (status) query = query.eq("status", status);

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

export async function POST(request, { params }) {
  const { id: bucketId } = params;
  const user = await verifyUserFromCookie(request);
  const { symbol, notes, market, target, stop_loss, date, quantity, price } =
    await request.json();

  const tradeCost = Number(price) * Number(quantity);
  const availableCash = await calculateAvailableCash(
    supabaseAdmin,
    bucketId,
    user.id
  );
  if (tradeCost > availableCash) {
    return NextResponse.json(
      { error: "Insufficient cash for this trade" },
      { status: 400 }
    );
  }

  const { data: trade, error } = await supabaseAdmin
    .from("trades")
    .insert([
      {
        user_id: user.id,
        bucket_id: bucketId,
        symbol,
        notes,
        market,
        target,
        stop_loss,
        quantity,
        price,
        status: "OPEN",
      },
    ])
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const tradeAmount = -Number(price) * Number(quantity);
  await supabaseAdmin.from("bucket_transactions").insert([
    {
      bucket_id: bucketId,
      user_id: user.id,
      amount: tradeAmount,
      description: `${symbol} - BUY`,
      qty: quantity,
      price,
    },
  ]);

  return NextResponse.json(trade, { status: 201 });
}
