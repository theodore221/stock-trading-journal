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

  const response = NextResponse.json(
    { session: data.session, user: data.user },
    { status: 200 }
  );

  //Set up JWT in an HTTP-only secure cookie
  response.cookies.set("token", data.session.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: data.session.expires_in,
    path: "/",
  });

  return response;
}
//TODO: Setting JWT in an HTTP-only secure cookie --> required for Production
// if (error) {
//   return NextResponse.json({ error: error.message }, { status: 401 });
// }

// const response = NextResponse.json({ user: data.user }, { status: 200 });

// // Set JWT in an HTTP-only secure cookie
// response.cookies.set('token', data.session.access_token, {
//   httpOnly: true,
//   secure: process.env.NODE_ENV === 'production',
//   sameSite: 'strict',
//   maxAge: data.session.expires_in, // Token expiry (e.g., 1 hour)
//   path: '/',
// });

// return response;
// }
