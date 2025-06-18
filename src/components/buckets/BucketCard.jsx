"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function BucketCard({ bucket, onClick, onDelete }) {
  return (
    <Card
      onClick={onClick}
      className="cursor-pointer transition-transform duration-150 ease-in-out hover:shadow-lg hover:scale-105 active:scale-95"
    >
      <CardHeader>
        <CardTitle className="text-lg">{bucket.name}</CardTitle>
      </CardHeader>
      <CardContent className="text-gray-500 flex items-center">
        <span className="mr-2">🗂️</span>
        <span>{bucket.trade_count || 0}</span>
      </CardContent>
    </Card>
    // <div>
    //   <div
    //     onClick={onClick}
    //     className="cursor-pointer bg-white rounded-lg shadow hover:shadow-lg p-4 flex flex-col justify-between transition-transform duration-150 ease-in-out hover:scale-105 active:scale-95"
    //   >
    //     <h2 className="text-xl font-semibold">{bucket.name}</h2>
    //     <span className="mt-2 text-gray-500">🗂️ {bucket.trade_count || 0}</span>
    //   </div>
    //   <button
    //     onClick={() => {
    //       onDelete(bucket.id);
    //     }}
    //   >
    //     X
    //   </button>
    // </div>
  );
}
