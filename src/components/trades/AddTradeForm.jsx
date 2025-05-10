"use client";
import { useState } from "react";
import axios from "axios";

export default function AddTradeForm({ bucketId, onAdded }) {
  const [date, setDate] = useState("");
  const [stock, setStock] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [type, setType] = useState("buy");

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post(
      `/api/buckets/${bucketId}/trades`,
      {
        date,
        stock,
        quantity: Number(quantity),
        price: Number(price),
        type: type.toUpperCase(),
      },
      { withCredentials: true }
    );
    setDate("");
    setStock("");
    setQuantity("");
    setPrice("");
    setType("buy");
    onAdded();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-4 flex flex-wrap gap-2 items-end"
    >
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="border p-2 rounded"
        required
      />
      <input
        type="text"
        placeholder="Stock"
        value={stock}
        onChange={(e) => setStock(e.target.value)}
        className="border p-2 rounded"
        required
      />
      <input
        type="number"
        placeholder="Qty"
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
        className="border p-2 rounded"
        required
      />
      <input
        type="number"
        placeholder="Price"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        className="border p-2 rounded"
        required
      />
      <select
        value={type}
        onChange={(e) => setType(e.target.value)}
        className="border p-2 rounded"
      >
        <option value="BUY">Buy</option>
        <option value="SELL">Sell</option>
      </select>
      <button
        type="submit"
        className="bg-green-500 tex2t-white px-4 py-2 rounded transition-transform duration-150 ease-in-out hover:scale-105 active:scale-95"
      >
        Add Trade
      </button>
    </form>
  );
}
