export async function POST(request) {
  // In a stateless JWT approach, simply instruct the client to remove the token.
  return new Response(JSON.stringify({ message: "Logout successful" }), {
    status: 200,
  });
}
