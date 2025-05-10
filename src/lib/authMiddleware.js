import { supabaseAdmin } from "./supabaseAdmin";

export async function verifyUserFromCookie(request) {
  const token = request.cookies.get("token")?.value;

  if (!token) {
    throw new Error("Unauthorized: No token provided");
  }

  const {
    data: { user },
    error,
  } = await supabaseAdmin.auth.getUser(token);

  if (error || !user) {
    throw new Error("Unauthorized: Invalid token");
  }

  return user;
}

// export async function verifyToken(request) {
//   const token = request.headers.get("Authorization")?.replace("Bearer ", "");

//   if (!token) {
//     throw new Error("Unauthorized: No token provided");
//   }

//   const {
//     data: { user },
//     error,
//   } = await supabaseAdmin.auth.getUser(token);

//   if (error || !user) {
//     throw new Error("Unauthorized: Invalid token");
//   }

//   return user;
// }
