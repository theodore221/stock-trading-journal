export async function calculateAvailableCash(supabase, bucketId, userId) {
  const { data: bucket } = await supabase
    .from("buckets")
    .select("bucket_size")
    .eq("id", bucketId)
    .eq("user_id", userId)
    .single();
  if (!bucket) return 0;

  const { data: trades } = await supabase
    .from("trades")
    .select("quantity, price")
    .eq("bucket_id", bucketId)
    .eq("user_id", userId)
    .neq("status", "CLOSED");

  const openValue = (trades || []).reduce(
    (sum, t) => sum + Number(t.quantity) * Number(t.price),
    0
  );

  return Number(bucket.bucket_size) - openValue;
}
