import { NextResponse } from "next/server";
import { verifyUserFromCookie } from "@/lib/authMiddleware";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(request, { params }) {
  const { id: bucketId } = await params;
  const user = await verifyUserFromCookie(request);

  const { data, error } = await supabaseAdmin
    .from("trades")
    .select("id, stock, type, quantity, price, date, notes, created_at")
    .eq("bucket_id", bucketId)
    .eq("user_id", user.id)
    .order("date", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

export async function POST(request, { params }) {
  const { id: bucketId } = await params;
  const user = await verifyUserFromCookie(request);
  const { stock, type, quantity, price, date, notes } = await request.json();

  const { data, error } = await supabaseAdmin
    .from("trades")
    .insert([
      {
        user_id: user.id,
        bucket_id: bucketId,
        stock,
        type,
        quantity,
        price,
        date,
        notes,
      },
    ])
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data, { status: 201 });
}
