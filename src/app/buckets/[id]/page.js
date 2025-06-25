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
  const [testData, setTestData] = useState({});

  const fetchBucket = async () => {
    try {
      const res = await axios.get(`/api/buckets/${id}`, {
        withCredentials: true,
      });
      const data = res.data;
      setTestData(data);
      setBucketName(data.name);
      setBudget(data.budget || 0);
      setTrades(data.trades || []);
      setAvailable(data.budget || 0);
      setLocked(0);
      setOpenTrades((data.trades || []).length);
      setClosedTrades(0);
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

  const handleTest = () => {
    console.log("trades");
    console.log(trades);
    console.log("printing response data");
    console.log(testData);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex">
        {/* Left Panel */}
        <div className="w-1/5 flex flex-col bg-muted pr-6 p-2 h-[calc(100vh-5rem)] ">
          {/* Back Button */}
          <div>
            <Button
              variant="ghost"
              className="justify-start hover:bg-black hover:text-white"
              onClick={() => router.back()}
            >
              ← Back
            </Button>
          </div>

          {/* Bucket Title */}
          <div className="text-center mt-4">
            <h1 className="text-3xl font-bold">{bucketName}</h1>
          </div>

          {/* Budget Setter */}
          <div className="mt-6 flex items-center space-x-2">
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
                  fetchBucket();
                } catch (err) {
                  console.error(err);
                }
              }}
            >
              Set Budget
            </Button>
          </div>

          {/* Centered Add Trade Button */}
          <div className="my-auto flex flex-col gap-2 justify-center">
            <Button onClick={() => setShowTradeForm(true)}>+ Add Trade</Button>
            <Button
              variant="destructive"
              onClick={() => console.log("Bucket Deleted")}
            >
              Delete Bucket
            </Button>
            <Button onClick={handleTest}> Test Trade</Button>
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-4/5 pl-6 flex flex-col space-y-6 max-h-[calc(100vh-4rem)] overflow-auto">
          {/* Stats Cards */}
          <div className="flex flex-wrap justify-center gap-3">
            {[
              {
                label: "Budget",
                value: `$${budget.toLocaleString()}`,
                positive: null,
              },
              {
                label: "Available",
                value: `$${available.toLocaleString()}`,
                positive: null,
              },
              {
                label: "Locked",
                value: `$${locked.toLocaleString()}`,
                positive: null,
              },
              { label: "Wins", value: wins, positive: null },
              { label: "Losses", value: losses, positive: null },
              { label: "Open Trades", value: openTrades, positive: null },
              { label: "Closed Trades", value: closedTrades, positive: null },
              {
                label: "Avg Win",
                value: `$${avgWin.toFixed(2)}`,
                positive: avgWin >= 0,
              },
              {
                label: "Avg Loss",
                value: `$${avgLoss.toFixed(2)}`,
                positive: avgLoss >= 0,
              },
              {
                label: "Profit / Loss",
                value: `$${pnl.toLocaleString()}`,
                positive: pnl >= 0,
              },
            ].map((stat) => (
              <Card
                key={stat.label}
                className="flex flex-row justify-between items-center min-w-[10rem] p-3"
              >
                <CardHeader className="p-0">
                  <CardTitle className="text-sm whitespace-nowrap min-w-[8rem]">
                    {stat.label}
                  </CardTitle>
                </CardHeader>
                <CardContent
                  className={`p-0 text-right ${
                    stat.positive === null
                      ? ""
                      : stat.positive
                      ? "text-green-500"
                      : "text-red-500"
                  }`}
                >
                  {stat.value}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Trades Table */}
          <div className="overflow-auto min-h-[19rem]">
            <Table className="min-w-full">
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Symbol</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Entry</TableHead>
                  <TableHead>Exit</TableHead>
                  <TableHead>Hold</TableHead>
                  <TableHead>Return</TableHead>
                  <TableHead>Return %</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trades.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell>{t.date}</TableCell>
                    <TableCell>{t.symbol || "SOXL"}</TableCell>
                    <TableCell>{t.status || "Open"}</TableCell>
                    <TableCell>{t.quantity}</TableCell>
                    <TableCell>{t.entryPrice || "$1.00"}</TableCell>
                    <TableCell>{t.exitPrice || ""}</TableCell>
                    <TableCell>{t.holdDuration || "2 Days"}</TableCell>
                    <TableCell>{t.returnAmount || ""}</TableCell>
                    <TableCell>
                      {t.returnPercent ? `${t.returnPercent}%` : ""}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {showTradeForm && (
        <AddTradeForm
          bucketId={id}
          onClose={() => setShowTradeForm(false)}
          onCreate={handleCreate}
        />
      )}
    </div>
  );
}
