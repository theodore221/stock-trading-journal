"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import BucketGrid from "@/components/buckets/BucketGrid";
import CreateBucketModal from "@/components/buckets/CreateBucketModal";
import BucketDetailModal from "@/components/buckets/BucketDetailModal";
// import { useStore } from "../../store";

export default function Buckets() {
  const [buckets, setBuckets] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedBucket, setSelectedBucket] = useState(null);

  const [name, setName] = useState("");

  const fetchBuckets = async () => {
    try {
      const res = await axios.get("/api/buckets", {
        withCredentials: true,
      });
      setBuckets(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchBuckets();
  }, []);

  // //TODO:Might be Outdated
  // const handleCreateBucket = async (e) => {
  //   e.preventDefault();
  //   try {
  //     await axios.post("/api/buckets", { name }, { withCredentials: true });
  //     setName("");
  //     fetchBuckets();
  //   } catch (err) {
  //     console.error(err);
  //   }
  // };

  // const handleDelete = async (id) => {
  //   try {
  //     await axios.delete(`/api/buckets/${id}`, {
  //       withCredentials: true,
  //     });
  //     fetchBuckets();
  //   } catch (err) {
  //     console.error(err);
  //   }
  // };

  const handleCreate = async (name) => {
    try {
      await axios.post("/api/buckets", { name }, { withCredentials: true });
      setShowCreateModal(false);
      fetchBuckets();
    } catch (err) {
      console.error(err);
    }
  };

  function handleCardClick(bucket) {
    setSelectedBucket(bucket);
  }

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
