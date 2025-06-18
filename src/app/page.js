"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useStore } from "../store";
import { useBucketStore } from "../store/useBucketStore";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import BucketGrid from "@/components/buckets/BucketGrid";
import CreateBucketModal from "@/components/buckets/CreateBucketModal";
import BucketDetailModal from "@/components/buckets/BucketDetailModal";

export default function Dashboard() {
  const buckets = useBucketStore((s) => s.buckets);
  const fetchBuckets = useBucketStore((s) => s.fetchBuckets);
  const createBucket = useBucketStore((s) => s.createBucket);
  const deleteBucket = useBucketStore((s) => s.deleteBucket);
  const router = useRouter();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedBucket, setSelectedBucket] = useState(null);

  useEffect(() => {
    fetchBuckets();
  }, [fetchBuckets]);

  const metrics = [
    { label: "Wins", value: "0" },
    { label: "Losses", value: "0" },
    { label: "Open", value: buckets.length },
    { label: "Wash", value: "0" },
    { label: "Avg W", value: "$0" },
    { label: "Avg L", value: "$0" },
    { label: "PnL", value: "$0" },
  ];

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-7 gap-4 mb-8">
        {metrics.map((m) => (
          <Card key={m.label} className="p-4">
            <CardHeader>
              <CardTitle className="text-sm">{m.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-2xl font-semibold">{m.value}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      <BucketGrid
        buckets={buckets}
        onAddClick={() => setShowCreateModal(true)}
        onBucketClick={setSelectedBucket}
        onDelete={deleteBucket}
      />

      {showCreateModal && (
        <CreateBucketModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreate}
        />
      )}

      {selectedBucket && (
        <BucketDetailModal
          bucket={selectedBucket}
          onClose={() => setSelectedBucket(null)}
        />
      )}
    </div>
  );
}
