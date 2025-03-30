"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import { useStore } from "../../store";

export default function Trades() {
  const token = useStore((state) => state.token);
  const [trades, setTrades] = useState([]);
  const [form, setForm] = useState({
    bucket_id: "",
    stock: "",
    type: "BUY",
    quantity: "",
    price: "",
    date: "",
    notes: "",
  });

  const fetchTrades = async () => {
    if (token) {
      try {
        const res = await axios.get("/api/trades", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTrades(res.data);
      } catch (err) {
        console.error(err);
      }
    }
  };

  useEffect(() => {
    fetchTrades();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/api/trades", form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setForm({
        bucket_id: "",
        stock: "",
        type: "BUY",
        quantity: "",
        price: "",
        date: "",
        notes: "",
      });
      fetchTrades();
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
      <h1 className="text-3xl mb-4">Trades</h1>
      <form
        onSubmit={handleSubmit}
        className="bg-white p-4 rounded shadow-md mb-6"
      >
        <div className="mb-2">
          <input
            type="text"
            placeholder="Bucket ID"
            value={form.bucket_id}
            onChange={(e) => setForm({ ...form, bucket_id: e.target.value })}
            className="border p-2 w-full"
            required
          />
        </div>
        <div className="mb-2">
          <input
            type="text"
            placeholder="Stock Symbol"
            value={form.stock}
            onChange={(e) => setForm({ ...form, stock: e.target.value })}
            className="border p-2 w-full"
            required
          />
        </div>
        <div className="mb-2">
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            className="border p-2 w-full"
          >
            <option value="BUY">BUY</option>
            <option value="SELL">SELL</option>
          </select>
        </div>
        <div className="mb-2">
          <input
            type="number"
            placeholder="Quantity"
            value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: e.target.value })}
            className="border p-2 w-full"
            required
          />
        </div>
        <div className="mb-2">
          <input
            type="number"
            step="0.01"
            placeholder="Price"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            className="border p-2 w-full"
            required
          />
        </div>
        <div className="mb-2">
          <input
            type="date"
            placeholder="Date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            className="border p-2 w-full"
            required
          />
        </div>
        <div className="mb-2">
          <textarea
            placeholder="Notes"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="border p-2 w-full"
          ></textarea>
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white p-2 rounded w-full"
        >
          Add Trade
        </button>
      </form>
      <h2 className="text-2xl mb-2">Trade History</h2>
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2">Bucket ID</th>
            <th className="py-2">Stock</th>
            <th className="py-2">Type</th>
            <th className="py-2">Quantity</th>
            <th className="py-2">Price</th>
            <th className="py-2">Date</th>
            <th className="py-2">Notes</th>
          </tr>
        </thead>
        <tbody>
          {trades.map((trade) => (
            <tr key={trade.id} className="text-center border-t">
              <td className="py-2">{trade.bucket_id}</td>
              <td className="py-2">{trade.stock}</td>
              <td className="py-2">{trade.type}</td>
              <td className="py-2">{trade.quantity}</td>
              <td className="py-2">{trade.price}</td>
              <td className="py-2">{trade.date}</td>
              <td className="py-2">{trade.notes}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
