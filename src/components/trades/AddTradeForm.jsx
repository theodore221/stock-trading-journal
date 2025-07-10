"use client";

import React, { useEffect, useState } from "react";
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
import {
  Slider,
  SliderTrack,
  SliderRange,
  SliderThumb,
} from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import axios from "axios";

const AddTradeForm = ({
  bucketId,
  trade = null,
  cash = 0,
  onClose,
  onCreate,
  onDeleted,
}) => {
  // General fields
  const [market, setMarket] = useState(trade?.market || "");
  const [symbol, setSymbol] = useState(trade?.symbol || "");
  const [target, setTarget] = useState(trade?.target || "");
  const [stopLoss, setStopLoss] = useState(trade?.stop_loss || "");
  const [date, setDate] = useState(
    trade?.date ? trade.date.slice(0, 16) : new Date().toISOString().slice(0, 16)
  );
  const [quantity, setQuantity] = useState(trade?.quantity || 0);
  const [price, setPrice] = useState(trade?.price || 0);

  // Journal fields
  const [tags, setTags] = useState(trade?.tags || []);
  const [notes, setNotes] = useState(trade?.notes || "");
  const [confidence, setConfidence] = useState(trade?.confidence || 0);
  const [errors, setErrors] = useState({ symbol: false, quantity: false, price: false });
  const [cashError, setCashError] = useState("");
  const [cashErrorField, setCashErrorField] = useState(null);

  useEffect(() => {
    if (trade) {
      setMarket(trade.market || "");
      setSymbol(trade.symbol || "");
      setTarget(trade.target || "");
      setStopLoss(trade.stop_loss || "");
      setDate(trade.date ? trade.date.slice(0, 16) : new Date().toISOString().slice(0, 16));
      setQuantity(trade.quantity || 0);
      setPrice(trade.price || 0);
      setTags(trade.tags || []);
      setNotes(trade.notes || "");
      setConfidence(trade.confidence || 0);
    }
  }, [trade]);

  const onSubmit = async (e) => {
    e.preventDefault();
    const symbolError = !symbol.trim();
    const qtyError = Number(quantity) <= 0;
    const priceError = Number(price) <= 0;
    if (symbolError || qtyError || priceError) {
      setErrors({ symbol: symbolError, quantity: qtyError, price: priceError });
      return;
    }
    setErrors({ symbol: false, quantity: false, price: false });

    const numPrice = Number(price);
    const numQty = Number(quantity);
    const totalCost = numPrice * numQty;
    if (totalCost > cash) {
      if (numQty > cash / (numPrice || 1)) {
        setCashErrorField("quantity");
      } else {
        setCashErrorField("price");
      }
      setCashError("Insufficient available cash");
      return;
    }
    setCashErrorField(null);
    setCashError("");

    const payload = {
      symbol,
      market,
      target,
      stop_loss: stopLoss,
      date,
      quantity: Number(quantity),
      price: Number(price),
      notes,
      tags,
      confidence,
    };

    try {
      if (trade?.id) {
        await axios.put(`/api/buckets/${bucketId}/trades/${trade.id}`, payload, {
          withCredentials: true,
        });
      } else {
        await axios.post(`/api/buckets/${bucketId}/trades`, payload, {
          withCredentials: true,
        });
      }
      onCreate?.();
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = async () => {
    if (!trade?.id) return;
    try {
      await axios.delete(`/api/buckets/${bucketId}/trades/${trade.id}`, {
        withCredentials: true,
      });
      onCreate?.();
      onDeleted?.();
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
                <DialogTitle className="my-2">
                  {trade ? "Edit Trade" : "New Trade"}
                </DialogTitle>
                <DialogDescription>Enter descriptions of your trade</DialogDescription>
              </div>

              <TabsList>
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="journal">Journal</TabsTrigger>
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
                  <Input
                    id="symbol"
                    placeholder="e.g. SOXL"
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value)}
                    aria-invalid={errors.symbol}
                  />
                  {errors.symbol && (
                    <p className="text-destructive text-sm mt-1">Symbol required</p>
                  )}
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
                    onChange={(e) => {
                      setQuantity(e.target.value);
                      setCashError("");
                      setCashErrorField(null);
                    }}
                    aria-invalid={errors.quantity}
                  />
                  {errors.quantity && (
                    <p className="text-destructive text-sm mt-1">Qty required</p>
                  )}
                  {cashError && cashErrorField === "quantity" && (
                    <p className="text-destructive text-sm mt-1">{cashError}</p>
                  )}
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
                    onChange={(e) => {
                      setPrice(e.target.value);
                      setCashError("");
                      setCashErrorField(null);
                    }}
                    aria-invalid={errors.price}
                  />
                  {errors.price && (
                    <p className="text-destructive text-sm mt-1">Price required</p>
                  )}
                  {cashError && cashErrorField === "price" && (
                    <p className="text-destructive text-sm mt-1">{cashError}</p>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="journal" className="space-y-4">
              <div>
                <Label htmlFor="tags" className="mb-2">
                  Tags
                </Label>
                <Select multiple onValueChange={(vals) => setTags(vals)} value={tags}>
                  <SelectTrigger id="tags">
                    <SelectValue placeholder="Select tags" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="research">Research</SelectItem>
                    <SelectItem value="entry">Entry</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="notes" className="mb-2">
                  Notes
                </Label>
                <Textarea
                  id="notes"
                  placeholder="Write your notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-[120px]"
                />
              </div>

              <div>
                <Label className="mb-4">Confidence: {confidence}</Label>
                <Slider
                  value={[confidence]}
                  onValueChange={(val) => setConfidence(val[0])}
                  max={10}
                  step={1}
                >
                  <SliderTrack>
                    <SliderRange />
                  </SliderTrack>
                  <SliderThumb />
                </Slider>
              </div>
            </TabsContent>

            <div className="flex justify-between mt-4">
              {trade?.id && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  Delete
                </Button>
              )}
              <Button type="submit" className="ml-auto">
                Save
              </Button>
            </div>
          </form>
        </Tabs>
      </DialogContent>
    </Dialog>

    {showDeleteConfirm && (
      <Dialog open onOpenChange={(open) => !open && setShowDeleteConfirm(false)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Trade</DialogTitle>
          </DialogHeader>
          <p className="my-2">Are you sure you want to delete this trade?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )}
  );
};

export default AddTradeForm;
