"use client";

export default function BucketCard({ bucket, onClick }) {
  return (
    <div
      onClick={onClick}
      className="cursor-pointer bg-white rounded-lg shadow hover:shadow-lg p-4 flex flex-col justify-between transition-transform duration-150 ease-in-out hover:scale-105 active:scale-95"
    >
      <h2 className="text-xl font-semibold">{bucket.name}</h2>
      <span className="mt-2 text-gray-500">🗂️ {bucket.trade_count || 0}</span>
    </div>
  );
}
