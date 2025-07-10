import { NextResponse } from "next/server";
import { verifyUserFromCookie } from "@/lib/authMiddleware";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request, { params }) {
  const { id: bucketId } = params;
  const user = await verifyUserFromCookie(request);
  const { date, price, quantity, allocations } = await request.json();

  if (!allocations || !Array.isArray(allocations)) {
    return NextResponse.json({ error: "No allocations" }, { status: 400 });
  }

  let totalProfit = 0;
  for (const alloc of allocations) {
    const { trade_id, qty } = alloc;
    const { data: trade, error } = await supabaseAdmin
      .from("trades")
      .select("quantity, price, symbol")
      .eq("id", trade_id)
      .eq("bucket_id", bucketId)
      .eq("user_id", user.id)
      .single();
    if (error || !trade) continue;

    const sellQty = Number(qty);
    if (sellQty <= 0 || sellQty > Number(trade.quantity)) continue;
    const remaining = Number(trade.quantity) - sellQty;
    const updates = { quantity: remaining };
    if (remaining <= 0) {
      updates.status = "CLOSED";
      updates.exit_price = price;
      updates.return_amount = (price - trade.price) * Number(trade.quantity);
      updates.return_percent =
        ((price - trade.price) / trade.price) * 100;
    }
    await supabaseAdmin
      .from("trades")
      .update(updates)
      .eq("id", trade_id)
      .eq("bucket_id", bucketId)
      .eq("user_id", user.id);

    const sellValue = Number(price) * sellQty;
    const costValue = Number(trade.price) * sellQty;
    totalProfit += sellValue - costValue;

    await supabaseAdmin.from("bucket_transactions").insert([
      {
        bucket_id: bucketId,
        user_id: user.id,
        amount: sellValue,
        description: `${trade.symbol} - SELL`,
        qty: sellQty,
        price,
      },
    ]);
  }

  if (totalProfit !== 0) {
    const { data: bucket } = await supabaseAdmin
      .from("buckets")
      .select("bucket_size")
      .eq("id", bucketId)
      .eq("user_id", user.id)
      .single();
    if (bucket) {
      await supabaseAdmin
        .from("buckets")
        .update({ bucket_size: Number(bucket.bucket_size) + totalProfit })
        .eq("id", bucketId)
        .eq("user_id", user.id);
    }
  }

  return NextResponse.json({ message: "Trades updated" });
}
