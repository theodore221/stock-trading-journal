import { NextResponse } from "next/server";
import { verifyToken, verifyUserFromCookie } from "@/lib/authMiddleware";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
// import { isCustomErrorPage } from "next/dist/build/utils";

export async function GET(request) {
  try {
    const user = await verifyUserFromCookie(request);

    //Insert code here..
    const { data, error } = await supabaseAdmin
      .from("buckets")
      .select("*")
      .eq("user_id", user.id);

    if (error)
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
      });

    return new Response(JSON.stringify(data), { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}

export async function POST(request) {
  try {
    const user = await verifyUserFromCookie(request);

    const { name } = await request.json();
    const { data, error } = await supabaseAdmin
      .from("buckets")
      .insert([{ user_id: user.id, name }])
      .select()
      .single();

    if (error)
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
      });

    return new Response(JSON.stringify(data), { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}
