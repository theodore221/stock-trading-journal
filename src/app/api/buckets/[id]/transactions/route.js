import { NextResponse } from "next/server";
import { verifyUserFromCookie } from "@/lib/authMiddleware";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(request, { params }) {
  try {
    const user = await verifyUserFromCookie(request);
    const bucketId = params.id;
    const { data, error } = await supabaseAdmin
      .from("bucket_transactions")
      .select("id, amount, created_at")
      .eq("bucket_id", bucketId)
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}

export async function POST(request, { params }) {
  try {
    const user = await verifyUserFromCookie(request);
    const bucketId = params.id;
    const { amount } = await request.json();
    const { data, error } = await supabaseAdmin
      .from("bucket_transactions")
      .insert([{ bucket_id: bucketId, user_id: user.id, amount }])
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
