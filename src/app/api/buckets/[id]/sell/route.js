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

    const remaining = Number(trade.quantity) - Number(qty);
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

    await supabaseAdmin.from("bucket_transactions").insert([
      {
        bucket_id: bucketId,
        user_id: user.id,
        amount: Number(price) * Number(qty),
        description: `${trade.symbol} - SELL`,
        qty,
        price,
      },
    ]);
  }

  return NextResponse.json({ message: "Trades updated" });
}
