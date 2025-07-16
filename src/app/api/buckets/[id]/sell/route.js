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
    await supabaseAdmin
      .from("trades")
      .update({ quantity: remaining })
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
        trade_id: trade_id,
      },
    ]);

    if (remaining <= 0) {
      const { data: sells } = await supabaseAdmin
        .from("bucket_transactions")
        .select("qty, price")
        .eq("bucket_id", bucketId)
        .eq("user_id", user.id)
        .eq("trade_id", trade_id)
        .eq("description", `${trade.symbol} - SELL`);

      const totalQty = (sells || []).reduce(
        (sum, tx) => sum + Number(tx.qty),
        0
      );
      const weightedExit = (sells || []).reduce(
        (sum, tx) => sum + Number(tx.price) * Number(tx.qty),
        0
      );
      const exitPrice = totalQty ? weightedExit / totalQty : price;
      const returnAmount = (sells || []).reduce(
        (sum, tx) => sum + (Number(tx.price) - trade.price) * Number(tx.qty),
        0
      );
      const returnPercent =
        totalQty > 0 ? (returnAmount / (trade.price * totalQty)) * 100 : 0;

      await supabaseAdmin
        .from("trades")
        .update({
          status: "CLOSED",
          exit_price: exitPrice,
          return_amount: returnAmount,
          return_percent: returnPercent,
        })
        .eq("id", trade_id)
        .eq("bucket_id", bucketId)
        .eq("user_id", user.id);
    }
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
