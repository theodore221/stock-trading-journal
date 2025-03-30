"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { useStore } from "../store";

export default function Dashboard() {
  const token = useStore((state) => state.token);
  const [positions, setPositions] = useState([]);

  useEffect(() => {
    if (token) {
      axios
        .get("/api/positions", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => setPositions(res.data))
        .catch((err) => console.error(err));
    }
  }, [token]);

  return (
    <div className="container mx-auto p-4">
      <nav className="flex justify-between items-center mb-4">
        <div>
          <Link href="/">Dashboard</Link> | <Link href="/trades">Trades</Link> |{" "}
          <Link href="/buckets">Buckets</Link> |{" "}
          <Link href="/chart">Charts</Link>
        </div>
        <div>
          <Link href="/login">Log In</Link> |{" "}
          <Link href="/signup">Sign Up</Link>
        </div>
      </nav>
      <h1 className="text-3xl mb-4">Dashboard</h1>
      <h2 className="text-2xl mb-2">Current Positions</h2>
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2">Bucket</th>
            <th className="py-2">Stock</th>
            <th className="py-2">Total Quantity</th>
            <th className="py-2">Avg. Price</th>
            <th className="py-2">Current Price</th>
            <th className="py-2">Unrealized P/L</th>
          </tr>
        </thead>
        <tbody>
          {positions.map((pos) => (
            <tr key={pos.id} className="text-center border-t">
              <td className="py-2">{pos.bucket_id}</td>
              <td className="py-2">{pos.stock}</td>
              <td className="py-2">{pos.total_quantity}</td>
              <td className="py-2">{pos.avg_price}</td>
              <td className="py-2">{pos.current_price}</td>
              <td className="py-2">{pos.unrealized_pl}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
