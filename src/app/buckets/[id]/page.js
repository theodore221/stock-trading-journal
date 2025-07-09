"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import AddTradeForm from "@/components/trades/AddTradeForm";
import SellTradeForm from "@/components/trades/SellTradeForm";

export default function BucketDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [bucketSize, setBucketSize] = useState(0);
  const [adjustAmount, setAdjustAmount] = useState(0);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjustType, setAdjustType] = useState("deposit");
  const [cash, setCash] = useState(0);
  const [position, setPosition] = useState(0);
  const [wins, setWins] = useState(0);
  const [losses, setLosses] = useState(0);
  const [openTrades, setOpenTrades] = useState(0);
  const [closedTrades, setClosedTrades] = useState(0);
  const [avgWin, setAvgWin] = useState(0);
  const [avgLoss, setAvgLoss] = useState(0);
  const [pnl, setPnl] = useState(0);
  const [trades, setTrades] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [bucketName, setBucketName] = useState("");
  const [showTradeForm, setShowTradeForm] = useState(false);
  const [showSellForm, setShowSellForm] = useState(false);
  const [editingTrade, setEditingTrade] = useState(null);
  const [testData, setTestData] = useState({});

  const transactionRows = useMemo(() => {
    let balance = 0;
    return transactions.map((t) => {
      balance += Number(t.amount);
      return { ...t, balance };
    });
  }, [transactions]);

  const fetchBucket = async () => {
    try {
      const res = await axios.get(`/api/buckets/${id}`, {
        withCredentials: true,
      });
      const data = res.data;
      setTestData(data);
      setBucketName(data.name);
      setBucketSize(data.bucket_size || 0);
      setTrades(data.trades || []);
      setTransactions(data.transactions || []);

      let computedCash = data.bucket_size || 0;
      let computedPos = 0;
      (data.trades || []).forEach((t) => {
        if (t.status !== "CLOSED") {
          const value = Number(t.quantity) * Number(t.price);
          computedCash -= value;
          computedPos += value;
        }
      });
      if (computedCash < 0) computedCash = 0;
      if (computedCash > (data.bucket_size || 0)) computedCash = data.bucket_size || 0;
      setCash(computedCash);
      setPosition(computedPos);
      setOpenTrades((data.trades || []).filter((t) => t.status !== "CLOSED").length);
      setClosedTrades((data.trades || []).filter((t) => t.status === "CLOSED").length);
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

          {/* Deposit/Withdraw Buttons */}
          <div className="mt-6 flex items-center justify-center space-x-2">
            <Button
              onClick={() => {
                setAdjustType("deposit");
                setShowAdjustModal(true);
              }}
            >
              Deposit
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setAdjustType("withdraw");
                setShowAdjustModal(true);
              }}
            >
              Withdraw
            </Button>
          </div>

          {/* Bucket Stats */}
          <div className="mt-4 text-center space-y-1">
            <div className="text-3xl font-bold text-blue-600">
              {`$${bucketSize.toLocaleString()}`}
            </div>
            <div>{`Cash: $${cash.toLocaleString()}`}</div>
            <div>{`Position: $${position.toLocaleString()}`}</div>
          </div>

          {/* Centered Add Trade Button */}
          <div className="my-auto flex flex-col gap-2 justify-center">
            <Button
              onClick={() => {
                setEditingTrade(null);
                setShowTradeForm(true);
              }}
            >
              + Add Trade
            </Button>
            <Button
              onClick={() => {
                setShowSellForm(true);
              }}
            >
              Sell Trade
            </Button>
            <Button onClick={handleTest}> Test Trade</Button>
            <Button
              variant="destructive"
              onClick={() => console.log("Bucket Deleted")}
            >
              Delete Bucket
            </Button>
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-4/5 pl-6 flex flex-col space-y-6 max-h-[calc(100vh-4rem)] overflow-auto">
          {/* Stats Cards */}
          <div className="flex flex-wrap justify-center gap-3">
            {[
              {
                label: "Bucket Size",
                value: `$${bucketSize.toLocaleString()}`,
                positive: null,
              },
              {
                label: "Cash",
                value: `$${cash.toLocaleString()}`,
                positive: null,
              },
              {
                label: "Position",
                value: `$${position.toLocaleString()}`,
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

          <Tabs defaultValue="activity" className="w-full">
            <TabsList className="mb-2">
              <TabsTrigger value="activity">Bucket Activity</TabsTrigger>
              <TabsTrigger value="trades">Trades</TabsTrigger>
            </TabsList>

            <TabsContent value="activity" className="overflow-auto">
              <Table className="min-w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Change ($)</TableHead>
                    <TableHead>Balance ($)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactionRows.map((tx, idx) => (
                    <TableRow key={tx.id ?? idx}>
                      <TableCell>
                        {tx.created_at
                          ? new Date(tx.created_at).toLocaleDateString("en-GB")
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {idx === 0
                          ? "Initial Bucket Size"
                          : tx.amount > 0
                          ? "Deposit"
                          : "Withdraw"}
                      </TableCell>
                      <TableCell
                        className={
                          tx.amount >= 0 ? "text-green-600" : "text-red-600"
                        }
                      >
                        {tx.amount >= 0
                          ? `+$${Number(tx.amount).toLocaleString()}`
                          : `-$${Math.abs(Number(tx.amount)).toLocaleString()}`}
                      </TableCell>
                      <TableCell>{`$${Number(tx.balance).toLocaleString()}`}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="trades" className="overflow-auto min-h-[19rem]">
              <Table className="min-w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Symbol</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Entry ($)</TableHead>
                    <TableHead>Exit ($)</TableHead>
                    <TableHead>Hold</TableHead>
                    <TableHead>Return ($)</TableHead>
                    <TableHead>Return %</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trades.map((t) => (
                    <TableRow
                      key={t.id}
                      className="cursor-pointer"
                      onClick={() => {
                        setEditingTrade(t);
                        setShowTradeForm(true);
                      }}
                    >
                      <TableCell>
                        {t?.created_at
                          ? new Date(t.created_at).toLocaleDateString("en-GB")
                          : "-"}
                      </TableCell>
                      <TableCell>{t.symbol || ""}</TableCell>
                      <TableCell>{t.status || ""}</TableCell>
                      <TableCell>{t.quantity}</TableCell>
                      <TableCell>{Number(t.price).toFixed(2)}</TableCell>
                      <TableCell>{t.exit_price ?? ""}</TableCell>
                      <TableCell>{t.holdDuration || "2 Days"}</TableCell>
                      <TableCell>{t.return_amount ?? ""}</TableCell>
                      <TableCell>
                        {t.return_percent ? `${t.return_percent}%` : ""}
                      </TableCell>
                      <TableCell className="space-x-1">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Sell
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Trash className="size-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {showTradeForm && (
        <AddTradeForm
          bucketId={id}
          trade={editingTrade}
          cash={cash}
          onClose={() => {
            setShowTradeForm(false);
            setEditingTrade(null);
          }}
          onCreate={handleCreate}
        />
      )}

      {showSellForm && (
        <SellTradeForm
          bucketId={id}
          onClose={() => setShowSellForm(false)}
          onSold={handleCreate}
        />
      )}

      {showAdjustModal && (
        <Dialog
          open
          onOpenChange={(open) => !open && setShowAdjustModal(false)}
        >
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>
                {adjustType === "deposit" ? "Deposit Funds" : "Withdraw Funds"}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-2 mt-2">
              <Label htmlFor="adjust-amount">$ Amount</Label>
              <Input
                id="adjust-amount"
                type="number"
                step="0.01"
                inputMode="decimal"
                value={adjustAmount}
                onChange={(e) => setAdjustAmount(parseFloat(e.target.value))}
                placeholder="0.00"
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowAdjustModal(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={async () => {
                  try {
                    await axios.post(
                      `/api/buckets/${id}`,
                      {
                        bucket_size:
                          adjustType === "deposit"
                            ? bucketSize + adjustAmount
                            : bucketSize - adjustAmount,
                      },
                      { withCredentials: true }
                    );
                    setAdjustAmount(0);
                    setShowAdjustModal(false);
                    fetchBucket();
                  } catch (err) {
                    console.error(err);
                  }
                }}
              >
                Confirm
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
