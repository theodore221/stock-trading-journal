import { verifyUserFromCookie } from "@/lib/authMiddleware";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { NextResponse } from "next/server";
import { calculateAvailableCash } from "@/lib/bucketUtils";

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
        `id, symbol, notes, created_at, status, profit_loss, market, target, stop_loss, bucket_id, quantity, price, exit_price, return_amount, return_percent`
      )
      .eq("bucket_id", bucketId)
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });
    if (tradesErr) {
      return NextResponse.json({ error: tradesErr.message }, { status: 500 });
    }

    const { data: transactions, error: txErr } = await supabaseAdmin
      .from("bucket_transactions")
      .select("id, amount, description, qty, price, created_at")
      .eq("bucket_id", bucketId)
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });
    if (txErr) {
      return NextResponse.json({ error: txErr.message }, { status: 500 });
    }
    return NextResponse.json({ ...bucket, trades, transactions });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}

export async function POST(request, { params }) {
  try {
    const user = await verifyUserFromCookie(request);
    const bucketId = params.id;
    const { bucket_size } = await request.json();

    const { data: current, error: currentErr } = await supabaseAdmin
      .from("buckets")
      .select("bucket_size")
      .eq("id", bucketId)
      .eq("user_id", user.id)
      .single();
    if (currentErr) {
      return NextResponse.json({ error: currentErr.message }, { status: 500 });
    }

    const delta = bucket_size - (current?.bucket_size || 0);

    if (delta < 0) {
      const availableCash = await calculateAvailableCash(
        supabaseAdmin,
        bucketId,
        user.id
      );
      if (availableCash < Math.abs(delta)) {
        return NextResponse.json(
          { error: "Insufficient cash to withdraw" },
          { status: 400 }
        );
      }
    }

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

    if (delta !== 0) {
      await supabaseAdmin.from("bucket_transactions").insert([
        {
          bucket_id: bucketId,
          user_id: user.id,
          amount: delta,
          description: delta > 0 ? "Deposit" : "Withdraw",
        },
      ]);
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

    // delete associated trades
    const { error: tradesError } = await supabaseAdmin
      .from("trades")
      .delete()
      .eq("bucket_id", id)
      .eq("user_id", user.id);
    if (tradesError) {
      return new Response(JSON.stringify({ error: tradesError.message }), {
        status: 500,
      });
    }

    // delete associated transactions
    const { error: txError } = await supabaseAdmin
      .from("bucket_transactions")
      .delete()
      .eq("bucket_id", id)
      .eq("user_id", user.id);
    if (txError) {
      return new Response(JSON.stringify({ error: txError.message }), {
        status: 500,
      });
    }

    // delete bucket
    const { error: bucketError } = await supabaseAdmin
      .from("buckets")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (bucketError)
      return new Response(JSON.stringify({ error: bucketError.message }), {
        status: 500,
      });

    return new Response(JSON.stringify({ message: "Bucket deleted" }), {
      status: 200,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}
