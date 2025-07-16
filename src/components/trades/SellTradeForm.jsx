"use client";

import React, { useState, useMemo } from "react";
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
import { Search, Minus, Plus } from "lucide-react";
import axios from "axios";

const SellTradeForm = ({ bucketId, onClose, onSold }) => {
  const [symbol, setSymbol] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 16));
  const [quantity, setQuantity] = useState(0);
  const [price, setPrice] = useState(0);
  const [openTrades, setOpenTrades] = useState([]);
  const [allocations, setAllocations] = useState({});
  const [searched, setSearched] = useState(false);
  const [sortBy, setSortBy] = useState("date");
  const [formError, setFormError] = useState("");

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
      setSearched(true);
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
  const sortedTrades = useMemo(() => {
    const copy = [...openTrades];
    return copy.sort((a, b) => {
      if (sortBy === "price") {
        return Number(a.price) - Number(b.price);
      }
      return new Date(a.created_at) - new Date(b.created_at);
    });
  }, [openTrades, sortBy]);

  const onSubmit = async (e) => {
    e.preventDefault();
    const qtyNum = Number(quantity);
    if (qtyNum <= 0) {
      setFormError("Quantity must be greater than 0");
      return;
    }
    if (totalAlloc !== qtyNum) {
      setFormError("Allocated quantity must match sell quantity");
      return;
    }
    setFormError("");
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
              <div>
                <Label htmlFor="symbol" className="mb-2">Symbol</Label>
                <div className="flex items-center space-x-2 w-fit">
                  <Input
                    id="symbol"
                    placeholder="e.g. SOXL"
                    value={symbol}
                    onChange={(e) => {
                      setSymbol(e.target.value);
                      setSearched(false);
                    }}
                    className="w-36"
                  />
                  <Button
                    type="button"
                    size="icon"
                    onClick={fetchTrades}
                    className="shrink-0"
                  >
                    <Search className="h-4 w-4" />
                  </Button>
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

              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">Available Lots</h3>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger id="sortBy" className="w-[100px]">
                      <SelectValue placeholder="Sort" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date">Date</SelectItem>
                      <SelectItem value="price">Price</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {openTrades.length > 0 ? (
                  <div className="space-y-2">
                    {sortedTrades.map((t) => (
                      <div
                        key={t.id}
                        className="flex items-center justify-between border rounded p-2"
                      >
                        <div>
                          <div className="font-medium">{t.symbol}</div>
                          <div className="text-sm text-muted-foreground">
                            Qty: {t.quantity} | Bought {t.created_at
                              ? new Date(t.created_at).toLocaleDateString(
                                  "en-GB"
                                )
                              : "-"} @ ${Number(t.price).toFixed(2)}
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
                    {formError && (
                      <p className="text-destructive text-sm mt-1">{formError}</p>
                    )}
                  </div>
                ) : (
                  searched && (
                    <div className="text-sm text-muted-foreground">
                      No results found
                    </div>
                  )
                )}
              </div>
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
