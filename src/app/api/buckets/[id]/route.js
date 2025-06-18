import { verifyUserFromCookie } from "@/lib/authMiddleware";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { NextResponse } from "next/server";

// export async function GET(request, {params}){
//   try {
//     const user = await verifyUserFromCookie(request);
//     const bucketId = (await params).id;

//       // 1) Fetch the bucket record (including budget)
//       const { data: bucket, error: bErr } = await supabaseAdmin
//       .from("buckets")
//       .select("*")
//       .eq("id", bucketId)
//       .eq("user_id", user.id)
//       .single();
//     if (bErr) throw bErr;

//     // 2) Fetch all trades for that bucket
//     const { data: trades, error: tErr } = await supabaseAdmin
//       .from("trades")
//       .select("*")
//       .eq("bucket_id", bucketId)
//       .order("date", { ascending: true });
//     if (tErr) throw tErr;
//   }
// }

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
