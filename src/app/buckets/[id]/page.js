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

  useEffect(() => {
    const fetchBucket = async () => {
      try {
        const res = await axios.get(`/api/buckets/${id}`, {
          withCredentials: true,
        });
        const data = res.data;
        console.log("printing response data");
        console.log(data);
        setBucketName(data.name);
        setBudget(data.budget || 0);
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

    const fetchTrades = async () => {
      try {
        const res = await axios.get(`/api/buckets/${id}/trades`, {
          withCredentials: true,
        });
        setTrades(res.data || []);
      } catch (err) {
        console.error(err);
      }
    };

    fetchBucket();
    fetchTrades();
  }, [id]);

  const handleCreate = (name) => {
    console.log("tradeform added");
    // createBucket(name);
    // setShowCreateModal(false);
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={() => router.back()}>
          ← Back
        </Button>
        <h1 className="text-3xl font-bold">Bucket: {bucketName}</h1>
      </div>

      {/* Budget setter */}
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

      {/* Top stats row */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Budget</CardTitle>
          </CardHeader>
          <CardContent>${budget.toLocaleString()}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Available</CardTitle>
          </CardHeader>
          <CardContent>${available.toLocaleString()}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Locked</CardTitle>
          </CardHeader>
          <CardContent>${locked.toLocaleString()}</CardContent>
        </Card>
      </div>

      {/* Secondary stats row: first line */}
      <div className="grid grid-cols-4 justify-center gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Wins</CardTitle>
          </CardHeader>
          <CardContent>{wins}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Losses</CardTitle>
          </CardHeader>
          <CardContent>{losses}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Open Trades</CardTitle>
          </CardHeader>
          <CardContent>{openTrades}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Closed Trades</CardTitle>
          </CardHeader>
          <CardContent>{closedTrades}</CardContent>
        </Card>
      </div>

      {/* Secondary stats row: second line */}
      <div className="grid grid-cols-3 justify-center gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Avg Win</CardTitle>
          </CardHeader>
          <CardContent>${avgWin.toFixed(2)}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Avg Loss</CardTitle>
          </CardHeader>
          <CardContent>${avgLoss.toFixed(2)}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Profit / Loss</CardTitle>
          </CardHeader>
          <CardContent>${pnl.toLocaleString()}</CardContent>
        </Card>
      </div>

      {/* Add Trade button */}
      <div className="flex justify-end">
        <Button onClick={() => setShowTradeForm(true)}>+ Add Trade</Button>
      </div>

      {showTradeForm && (
        <AddTradeForm
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
            {trades.flatMap((t) =>
              (t.trade_entries || []).map((e) => (
                <TableRow key={e.id}>
                  <TableCell>{e.date_time}</TableCell>
                  <TableCell>{t.stock}</TableCell>
                  <TableCell>{e.quantity}</TableCell>
                  <TableCell>${e.price}</TableCell>
                  <TableCell>{e.action}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
