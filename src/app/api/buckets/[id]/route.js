import { verifyUserFromCookie } from "@/lib/authMiddleware";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

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
