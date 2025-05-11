"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import BucketGrid from "@/components/buckets/BucketGrid";
import CreateBucketModal from "@/components/buckets/CreateBucketModal";
import BucketDetailModal from "@/components/buckets/BucketDetailModal";
// import { useStore } from "../../store";
import { useBucketStore } from "@/store/useBucketStore";

export default function Buckets() {
  const buckets = useBucketStore((s) => s.buckets);
  const fetchBuckets = useBucketStore((s) => s.fetchBuckets);
  const createBucket = useBucketStore((s) => s.createBucket);
  const deleteBucket = useBucketStore((s) => s.deleteBucket);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedBucket, setSelectedBucket] = useState(null);

  // const fetchBuckets = async () => {
  //   try {
  //     const res = await axios.get("/api/buckets", {
  //       withCredentials: true,
  //     });
  //     setBuckets(res.data);
  //   } catch (err) {
  //     console.error(err);
  //   }
  // };

  useEffect(() => {
    fetchBuckets();
  }, [fetchBuckets]);

  const handleCreate = (name) => {
    console.log(buckets);
    createBucket(name);
    setShowCreateModal(false);
  };

  return (
    <div className="container mx-auto p-4">
      <nav className="mb-4">
        <Link href="/">Dashboard</Link> | <Link href="/trades">Trades</Link> |{" "}
        <Link href="/buckets">Buckets</Link> | <Link href="/chart">Charts</Link>
      </nav>
      <h1 className="text-3xl mb-4">Strategy Buckets</h1>

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
