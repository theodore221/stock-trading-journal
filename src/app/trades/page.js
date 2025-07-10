"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useBucketStore } from "@/store/useBucketStore";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export default function TradesPage() {
  const buckets = useBucketStore((s) => s.buckets);
  const fetchBuckets = useBucketStore((s) => s.fetchBuckets);

  const [trades, setTrades] = useState([]);
  const [symbol, setSymbol] = useState("");
  const [status, setStatus] = useState("");
  const [bucketId, setBucketId] = useState("");

  useEffect(() => {
    fetchBuckets();
    fetchTrades();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchTrades = async () => {
    const params = new URLSearchParams();
    if (symbol) params.set("symbol", symbol);
    if (status) params.set("status", status);
    if (bucketId) params.set("bucket_id", bucketId);
    try {
      const res = await axios.get(`/api/trades?${params.toString()}`, {
        withCredentials: true,
      });
      setTrades(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl mb-4">Trades</h1>

      <div className="flex flex-wrap gap-2 mb-6 items-end">
        <div>
          <Input
            placeholder="Symbol"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            className="w-32"
          />
        </div>
        <div>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="OPEN">Open</SelectItem>
              <SelectItem value="CLOSED">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Select
            value={bucketId || undefined}
            onValueChange={(v) => setBucketId(v === "all" ? "" : v)}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Bucket" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Buckets</SelectItem>
              {buckets.map((b) => (
                <SelectItem key={b.id} value={b.id}>
                  {b.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={fetchTrades}>Search</Button>
      </div>

      <Table className="min-w-full">
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Bucket</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Symbol</TableHead>
            <TableHead>Qty</TableHead>
            <TableHead>Entry ($)</TableHead>
            <TableHead>Exit ($)</TableHead>
            <TableHead>Return ($)</TableHead>
            <TableHead>Return %</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {trades.map((t) => (
            <TableRow key={t.id}>
              <TableCell>
                {t.created_at
                  ? new Date(t.created_at).toLocaleDateString("en-GB")
                  : "-"}
              </TableCell>
              <TableCell>
                {t.buckets?.name ||
                  buckets.find((b) => b.id === t.bucket_id)?.name || ""}
              </TableCell>
              <TableCell>
                <span
                  className={`px-3 py-1 rounded-full text-[11px] ${
                    t.status === "OPEN"
                      ? "bg-green-500 text-white"
                      : "bg-red-500 text-white"
                  }`}
                >
                  {t.status}
                </span>
              </TableCell>
              <TableCell>{t.symbol}</TableCell>
              <TableCell>{t.quantity}</TableCell>
              <TableCell>{Number(t.price).toFixed(2)}</TableCell>
              <TableCell>
                {t.exit_price !== null && t.exit_price !== undefined
                  ? Number(t.exit_price).toFixed(2)
                  : ""}
              </TableCell>
              <TableCell>
                {t.return_amount !== null && t.return_amount !== undefined
                  ? Number(t.return_amount).toFixed(2)
                  : ""}
              </TableCell>
              <TableCell>
                {t.return_percent !== null && t.return_percent !== undefined
                  ? `${Number(t.return_percent).toFixed(2)}%`
                  : ""}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
