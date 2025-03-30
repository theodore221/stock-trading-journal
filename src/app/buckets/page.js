"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import { useStore } from "../../store";

export default function Buckets() {
  const token = useStore((state) => state.token);
  const [buckets, setBuckets] = useState([]);
  const [name, setName] = useState("");

  const fetchBuckets = async () => {
    if (token) {
      try {
        const res = await axios.get("/api/buckets", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBuckets(res.data);
      } catch (err) {
        console.error(err);
      }
    }
  };

  useEffect(() => {
    fetchBuckets();
  }, [token]);

  const handleCreateBucket = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        "/api/buckets",
        { name },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setName("");
      fetchBuckets();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/buckets/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchBuckets();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <nav className="mb-4">
        <Link href="/">Dashboard</Link> | <Link href="/trades">Trades</Link> |{" "}
        <Link href="/buckets">Buckets</Link> | <Link href="/chart">Charts</Link>
      </nav>
      <h1 className="text-3xl mb-4">Strategy Buckets</h1>
      <form
        onSubmit={handleCreateBucket}
        className="bg-white p-4 rounded shadow-md mb-6"
      >
        <input
          type="text"
          placeholder="Bucket Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border p-2 w-full"
          required
        />
        <button
          type="submit"
          className="bg-blue-500 text-white p-2 rounded w-full mt-2"
        >
          Create Bucket
        </button>
      </form>
      <h2 className="text-2xl mb-2">Your Buckets</h2>
      <ul>
        {buckets.map((bucket) => (
          <li
            key={bucket.id}
            className="flex justify-between items-center bg-white p-2 my-2 rounded shadow"
          >
            <span>{bucket.name}</span>
            <button
              onClick={() => handleDelete(bucket.id)}
              className="bg-red-500 text-white px-2 py-1 rounded"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
