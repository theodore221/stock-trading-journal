import { supabase } from "@/lib/supabaseClient";
import { NextResponse } from "next/server";

export async function POST(request) {
  const { email, password } = await request.json();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
  return NextResponse.json(
    { session: data.session, user: data.user },
    { status: 200 }
  );
}
