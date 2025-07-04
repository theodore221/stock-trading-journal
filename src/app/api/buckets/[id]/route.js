import { verifyUserFromCookie } from "@/lib/authMiddleware";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    const user = await verifyUserFromCookie(request);
    const { id: bucketId } = await params;

    const { data: bucket, error: bucketErr } = await supabaseAdmin
      .from("buckets")
      .select("*")
      .eq("id", bucketId)
      .eq("user_id", user.id)
      .single();
    if (bucketErr) {
      return NextResponse.json({ error: bucketErr.message }, { status: 500 });
    }

    const { data: trades, error: tradesErr } = await supabaseAdmin
      .from("trades")
      .select(
        `id, symbol, notes, created_at, status, profit_loss, market, target, stop_loss, bucket_id,
        trade_entries(id, trade_id, action, date_time, quantity, price, notes)`
      )
      .eq("bucket_id", bucketId)
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });
    if (tradesErr) {
      return NextResponse.json({ error: tradesErr.message }, { status: 500 });
    }

    return NextResponse.json({ ...bucket, trades });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}

export async function POST(request, { params }) {
  try {
    const user = await verifyUserFromCookie(request);
    const bucketId = params.id;
    const { bucket_size } = await request.json();

    const { data, error } = await supabaseAdmin
      .from("buckets")
      .update({ bucket_size })
      .eq("id", bucketId)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const user = await verifyUserFromCookie(request);

    const { id } = await params;
    const { error } = await supabaseAdmin
      .from("buckets")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error)
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
      });

    return new Response(JSON.stringify({ message: "Bucket deleted" }), {
      status: 200,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}
