"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { useStore } from "../../store";

export default function ChartPage() {
  const token = useStore((state) => state.token);
  const [data, setData] = useState([]);

  useEffect(() => {
    // For demo purposes, we simulate chart data.
    setData([
      { date: "2023-01-01", profit: 100 },
      { date: "2023-02-01", profit: 200 },
      { date: "2023-03-01", profit: -50 },
      { date: "2023-04-01", profit: 300 },
      { date: "2023-05-01", profit: 150 },
    ]);
  }, [token]);

  return (
    <div className="container mx-auto p-4">
      <nav className="mb-4">
        <Link href="/">Dashboard</Link> | <Link href="/trades">Trades</Link> |{" "}
        <Link href="/buckets">Buckets</Link> | <Link href="/chart">Charts</Link>
      </nav>
      <h1 className="text-3xl mb-4">Profit/Loss Chart</h1>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="profit" stroke="#8884d8" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
