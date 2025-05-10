"use client";

export default function AddBucketCard({ onClick }) {
  return (
    <div
      onClick={onClick}
      className="cursor-pointer flex items-center justify-center bg-gray-100 border-2 border-dashed rounded-lg h-32 hover:bg-gray-200 transition-colors duration-150 ease-in-out hover:scale-105 active:scale-95"
    >
      <span className="text-4xl text-gray-400">➕</span>
    </div>
  );
}
