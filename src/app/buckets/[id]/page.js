"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import AddTradeForm from "@/components/trades/AddTradeForm";

export default function BucketDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [budget, setBudget] = useState(0);
  const [available, setAvailable] = useState(0);
  const [locked, setLocked] = useState(0);
  const [wins, setWins] = useState(0);
  const [losses, setLosses] = useState(0);
  const [openTrades, setOpenTrades] = useState(0);
  const [closedTrades, setClosedTrades] = useState(0);
  const [avgWin, setAvgWin] = useState(0);
  const [avgLoss, setAvgLoss] = useState(0);
  const [pnl, setPnl] = useState(0);
  const [trades, setTrades] = useState([]);
  const [bucketName, setBucketName] = useState("");
  const [showTradeForm, setShowTradeForm] = useState(false);

  const fetchBucket = async () => {
    try {
      const res = await axios.get(`/api/buckets/${id}`, {
        withCredentials: true,
      });
      const data = res.data;
      console.log("printing response data)");
      console.log(data);
      setBucketName(data.name);
      setBudget(data.budget || 0);
      setTrades(data.trades || []);
      // simple metrics based on trades
      setOpenTrades((data.trades || []).length);
      setClosedTrades(0);
      setAvailable(data.budget || 0);
      setLocked(0);
      setWins(0);
      setLosses(0);
      setAvgWin(0);
      setAvgLoss(0);
      setPnl(0);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchBucket();
  }, [id]);

  const handleCreate = () => {
    fetchBucket();
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header, budget and stats */}
      <div className="flex flex-wrap items-start gap-6">
        {/* Left side: title and budget setter */}
        <div className="flex flex-col gap-2 flex-1">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => router.back()}>
              ← Back
            </Button>
            <h1 className="text-3xl font-bold">Bucket: {bucketName}</h1>
          </div>
          <div className="flex items-center space-x-2">
            <Input
              type="number"
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              placeholder="Budget"
              className="w-32"
            />
            <Button
              onClick={async () => {
                try {
                  await axios.post(
                    `/api/buckets/${id}`,
                    { budget },
                    { withCredentials: true }
                  );
                } catch (err) {
                  console.error(err);
                }
              }}
            >
              Set Budget
            </Button>
          </div>
        </div>

        {/* Right side: stats */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <Card className="flex-row items-center min-w-[9rem] p-2 gap-2">
              <CardHeader className="p-0">
                <CardTitle className="text-sm">Budget</CardTitle>
              </CardHeader>
              <CardContent className="p-0 pl-2">
                ${budget.toLocaleString()}
              </CardContent>
            </Card>
            <Card className="flex-row items-center min-w-[9rem] p-2 gap-2">
              <CardHeader className="p-0">
                <CardTitle className="text-sm">Available</CardTitle>
              </CardHeader>
              <CardContent className="p-0 pl-2">
                ${available.toLocaleString()}
              </CardContent>
            </Card>
            <Card className="flex-row items-center min-w-[9rem] p-2 gap-2">
              <CardHeader className="p-0">
                <CardTitle className="text-sm">Locked</CardTitle>
              </CardHeader>
              <CardContent className="p-0 pl-2">
                ${locked.toLocaleString()}
              </CardContent>
            </Card>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Card className="flex-row items-center min-w-[9rem] p-2 gap-2">
              <CardHeader className="p-0">
                <CardTitle className="text-sm">Wins</CardTitle>
              </CardHeader>
              <CardContent className="p-0 pl-2">{wins}</CardContent>
            </Card>
            <Card className="flex-row items-center min-w-[9rem] p-2 gap-2">
              <CardHeader className="p-0">
                <CardTitle className="text-sm">Losses</CardTitle>
              </CardHeader>
              <CardContent className="p-0 pl-2">{losses}</CardContent>
            </Card>
            <Card className="flex-row items-center min-w-[9rem] p-2 gap-2">
              <CardHeader className="p-0">
                <CardTitle className="text-sm">Open Trades</CardTitle>
              </CardHeader>
              <CardContent className="p-0 pl-2">{openTrades}</CardContent>
            </Card>
            <Card className="flex-row items-center min-w-[9rem] p-2 gap-2">
              <CardHeader className="p-0">
                <CardTitle className="text-sm">Closed Trades</CardTitle>
              </CardHeader>
              <CardContent className="p-0 pl-2">{closedTrades}</CardContent>
            </Card>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Card className="flex-row items-center min-w-[9rem] p-2 gap-2">
              <CardHeader className="p-0">
                <CardTitle className="text-sm">Avg Win</CardTitle>
              </CardHeader>
              <CardContent className="p-0 pl-2">${avgWin.toFixed(2)}</CardContent>
            </Card>
            <Card className="flex-row items-center min-w-[9rem] p-2 gap-2">
              <CardHeader className="p-0">
                <CardTitle className="text-sm">Avg Loss</CardTitle>
              </CardHeader>
              <CardContent className="p-0 pl-2">${avgLoss.toFixed(2)}</CardContent>
            </Card>
            <Card className="flex-row items-center min-w-[9rem] p-2 gap-2">
              <CardHeader className="p-0">
                <CardTitle className="text-sm">Profit / Loss</CardTitle>
              </CardHeader>
              <CardContent className="p-0 pl-2">${pnl.toLocaleString()}</CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Add Trade button */}
      <div className="flex justify-end">
        <Button onClick={() => setShowTradeForm(true)}>+ Add Trade</Button>
      </div>

      {showTradeForm && (
        <AddTradeForm
          bucketId={id}
          onClose={() => {
            setShowTradeForm(false);
          }}
          onCreate={handleCreate}
        />
      )}

      {/* Trades table */}
      <div className="overflow-auto">
        <Table className="min-w-full">
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Qty</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Type</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {trades.map((t) => (
              <TableRow key={t.id}>
                <TableCell>{t.date}</TableCell>
                <TableCell>{t.stock}</TableCell>
                <TableCell>{t.quantity}</TableCell>
                <TableCell>${t.price}</TableCell>
                <TableCell>{t.type}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
