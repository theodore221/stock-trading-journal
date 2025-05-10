"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import AddTradeForm from "@/components/trades/AddTradeForm";

export default function BucketDetailModal({ bucket, onClose }) {
  const [trades, setTrades] = useState([]);

  const fetchTrades = async () => {
    try {
      const res = await axios.get(`/api/buckets/${bucket.id}/trades`, {
        withCredentials: true,
      });
      setTrades(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTrades();
  }, [bucket.id]);

  const handleTradeAdded = () => {
    fetchTrades();
  };

  //TODO: Add a 'theres no trades yet waiting text'

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black bg-opacity-20 flex items-start justify-center z-50 overflow-auto p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-3xl transform transition-transform duration-200 ease-out">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">{bucket.name}</h3>
          <div className="space-x-2">
            <Link
              href={`/buckets/${bucket.id}`}
              className="text-blue-500 hover:underline transition-colors duration-150"
            >
              Open Full Page
            </Link>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors duration-150"
            >
              ×
            </button>
          </div>
        </div>
        <table className="min-w-full table-auto mb-4">
          <thead>
            <tr>
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">Stock</th>
              <th className="px-4 py-2">Qty</th>
              <th className="px-4 py-2">Price</th>
              <th className="px-4 py-2">Type</th>
            </tr>
          </thead>
          <tbody>
            {trades.map((t) => (
              <tr
                key={t.id}
                className="hover:bg-gray-50 transition-colors duration-150"
              >
                <td className="border px-4 py-2">{t.date}</td>
                <td className="border px-4 py-2">{t.stock}</td>
                <td className="border px-4 py-2">{t.quantity}</td>
                <td className="border px-4 py-2">{t.price}</td>
                <td className="border px-4 py-2">{t.type}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <AddTradeForm bucketId={bucket.id} onAdded={handleTradeAdded} />
      </div>
    </div>
  );
}
