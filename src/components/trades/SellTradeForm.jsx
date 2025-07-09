"use client";

import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Search, Minus, Plus } from "lucide-react";
import axios from "axios";

const SellTradeForm = ({ bucketId, onClose, onSold }) => {
  const [market, setMarket] = useState("");
  const [symbol, setSymbol] = useState("");
  const [target, setTarget] = useState("");
  const [stopLoss, setStopLoss] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 16));
  const [quantity, setQuantity] = useState(0);
  const [price, setPrice] = useState(0);
  const [openTrades, setOpenTrades] = useState([]);
  const [allocations, setAllocations] = useState({});

  const fetchTrades = async () => {
    try {
      const res = await axios.get(
        `/api/buckets/${bucketId}/trades?symbol=${symbol}&status=OPEN`,
        { withCredentials: true }
      );
      setOpenTrades(res.data || []);
      const map = {};
      (res.data || []).forEach((t) => {
        map[t.id] = 0;
      });
      setAllocations(map);
    } catch (err) {
      console.error(err);
    }
  };

  const adjust = (id, delta, max) => {
    setAllocations((prev) => {
      const val = Math.min(Math.max((prev[id] || 0) + delta, 0), max);
      return { ...prev, [id]: val };
    });
  };

  const totalAlloc = Object.values(allocations).reduce((s, v) => s + v, 0);

  const onSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      date,
      price: Number(price),
      quantity: Number(quantity),
      allocations: Object.entries(allocations).map(([trade_id, qty]) => ({
        trade_id,
        qty,
      })),
    };
    try {
      await axios.post(`/api/buckets/${bucketId}/sell`, payload, {
        withCredentials: true,
      });
      onSold?.();
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-4xl">
        <Tabs defaultValue="general">
          <DialogHeader className="flex pr-2 pt-5 mb-8">
            <div className="flex justify-between items-center ">
              <div className="flex flex-col">
                <DialogTitle className="my-2">Sell Trade</DialogTitle>
                <DialogDescription>Close existing trades</DialogDescription>
              </div>

              <TabsList>
                <TabsTrigger value="general">General</TabsTrigger>
              </TabsList>
            </div>
          </DialogHeader>

          <form onSubmit={onSubmit} className="space-y-6">
            <TabsContent value="general" className="space-y-4">
              <div className="grid grid-cols-4 gap-3">
                <div>
                  <Label htmlFor="market" className="mb-2">
                    Market
                  </Label>
                  <Select value={market} onValueChange={setMarket}>
                    <SelectTrigger id="market">
                      <SelectValue placeholder="Select market" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ETF">ETF</SelectItem>
                      <SelectItem value="FOREX">FOREX</SelectItem>
                      <SelectItem value="DERIVATIVE">DERIVATIVE</SelectItem>
                      <SelectItem value="EQUITY">EQUITY</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="symbol" className="mb-2">
                    Symbol
                  </Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="symbol"
                      placeholder="e.g. SOXL"
                      value={symbol}
                      onChange={(e) => setSymbol(e.target.value)}
                    />
                    <Button type="button" size="icon" onClick={fetchTrades}>
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="target" className="mb-2">
                    Target
                  </Label>
                  <Input
                    id="target"
                    type="number"
                    step="0.01"
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="stopLoss" className="mb-2">
                    Stop-Loss
                  </Label>
                  <Input
                    id="stopLoss"
                    type="number"
                    step="0.01"
                    value={stopLoss}
                    onChange={(e) => setStopLoss(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mt-6">
                <div>
                  <Label htmlFor="date" className="mb-2">
                    Date
                  </Label>
                  <Input
                    id="date"
                    type="datetime-local"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="quantity" className="mb-2">
                    Quantity
                  </Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="price" className="mb-2">
                    Price
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>
              </div>

              {openTrades.length > 0 && (
                <div className="mt-4 space-y-2">
                  {openTrades.map((t) => (
                    <div
                      key={t.id}
                      className="flex items-center justify-between border rounded p-2"
                    >
                      <div>
                        <div className="font-medium">{t.symbol}</div>
                        <div className="text-sm text-muted-foreground">
                          Qty: {t.quantity}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          type="button"
                          size="icon"
                          onClick={() => adjust(t.id, -1, t.quantity)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <div>{allocations[t.id] || 0}</div>
                        <Button
                          type="button"
                          size="icon"
                          onClick={() => adjust(t.id, 1, t.quantity)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  <div className="text-sm text-muted-foreground">
                    Allocated: {totalAlloc} / {quantity}
                  </div>
                </div>
              )}
            </TabsContent>

            <div className="flex justify-end mt-4">
              <Button type="submit">Save</Button>
            </div>
          </form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default SellTradeForm;
