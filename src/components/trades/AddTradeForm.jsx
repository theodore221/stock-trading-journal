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
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import {
  Slider,
  SliderTrack,
  SliderRange,
  SliderThumb,
} from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import axios from "axios";

const AddTradeForm = ({ bucketId, onClose, onCreate }) => {
  const [lines, setLines] = useState([
    {
      action: "BUY",
      datetime: new Date().toISOString().slice(0, 16),
      quantity: 0,
      price: 0,
    },
  ]);

  // General meta-fields
  const [market, setMarket] = useState("");
  const [symbol, setSymbol] = useState("");
  const [target, setTarget] = useState("");
  const [stopLoss, setStopLoss] = useState("");

  // Journal fields
  const [tags, setTags] = useState([]);
  const [notes, setNotes] = useState("");
  const [confidence, setConfidence] = useState(0);
  const [errors, setErrors] = useState({ symbol: false, lines: [], lineGlobal: false });

  const addLine = () => {
    setLines([
      ...lines,
      {
        action: "BUY",
        datetime: new Date().toISOString().slice(0, 16),
        quantity: 0,
        price: 0,
        fee: 0,
      },
    ]);
  };

  const removeLine = (index) => {
    setLines(lines.filter((_, i) => i !== index));
  };

  const updateLine = (index, field, value) => {
    const updated = [...lines];
    updated[index] = { ...updated[index], [field]: value };
    setLines(updated);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const symbolError = !symbol.trim();
    const lineErrors = lines.map((l) => ({
      quantity: Number(l.quantity) <= 0,
      price: Number(l.price) <= 0,
    }));
    const hasValidLine = lines.some(
      (l) => Number(l.quantity) > 0 && Number(l.price) > 0
    );
    const lineGlobal = !hasValidLine;
    if (symbolError || lineGlobal) {
      setErrors({ symbol: symbolError, lines: lineErrors, lineGlobal });
      return;
    }
    setErrors({ symbol: false, lines: [], lineGlobal: false });
    try {
      await axios.post(
        `/api/buckets/${bucketId}/trades`,
        {
          stock: symbol,
          market,
          target,
          stop_loss: stopLoss,
          entries: lines.map((l) => ({
            action: l.action,
            date_time: l.datetime,
            quantity: l.quantity,
            price: l.price,
          })),
          // journal fields you can pick up later on server if needed
          notes,
          tags,
          confidence,
        },
        { withCredentials: true }
      );
      onCreate?.();
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>New Trade</DialogTitle>
          <DialogDescription>
            Enter descriptions of your trade
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-6">
          <Tabs defaultValue="general">
            <TabsList>
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="journal">Journal</TabsTrigger>
            </TabsList>

            {/* ─── GENERAL TAB ─── */}
            <TabsContent value="general" className="space-y-4">
              {/* Market / Symbol / Target / Stop-Loss */}
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="market">Market</Label>
                  <Select value={market} onValueChange={setMarket}>
                    <SelectTrigger id="market">
                      <SelectValue placeholder="Select market" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ETF">ETF</SelectItem>
                      <SelectItem value="FOREX">FOREX</SelectItem>
                      <SelectItem value="DERIVATIVE">DERIVATIVE</SelectItem>
                      <SelectItem value="EQUITY">EQUITY</SelectItem>
                      {/* ...more */}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="symbol">Symbol</Label>
                  <Input
                    id="symbol"
                    placeholder="e.g. SOXL"
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value)}
                    aria-invalid={errors.symbol}
                  />
                  {errors.symbol && (
                    <p className="text-destructive text-sm mt-1">Symbol is required</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="target">Target</Label>
                  <Input
                    id="target"
                    type="number"
                    step="0.01"
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="stopLoss">Stop-Loss</Label>
                  <Input
                    id="stopLoss"
                    type="number"
                    step="0.01"
                    value={stopLoss}
                    onChange={(e) => setStopLoss(e.target.value)}
                  />
                </div>
              </div>

              {/* Trade Lines with Header */}
              <div className="space-y-2 mt-6">
                {/* Header Row */}
                <div className="flex items-center space-x-2 px-2 text-sm font-medium text-muted-foreground">
                  <div className="w-10" /> {/* for the remove-button space */}
                  <div className="w-16">Action</div>
                  <div className="w-[200px]">Date/Time</div>
                  <div className="w-24 text-right">Quantity</div>
                  <div className="w-24 text-right">Price</div>
                </div>

                {lines.map((line, idx) => (
                  <div
                    key={idx}
                    className="flex items-center space-x-2 px-2 py-1 rounded"
                  >
                    <Button
                      type="button"
                      size="icon"
                      onClick={() => removeLine(idx)}
                      className="bg-gray-200 text-gray-700 hover:bg-gray-300"
                    >
                      <X className="h-4 w-4" />
                    </Button>

                    {/* remove the X/delete button, inputs, etc. */}
                    <Button
                      type="button"
                      size="sm"
                      onClick={() =>
                        updateLine(
                          idx,
                          "action",
                          line.action === "BUY" ? "SELL" : "BUY"
                        )
                      }
                      className={`px-3 py-1 rounded-full ${
                        line.action === "BUY"
                          ? "bg-green-500 text-white"
                          : "bg-red-500 text-white"
                      }`}
                    >
                      {line.action}
                    </Button>

                    {/* now your datetime, qty, price inputs come after */}
                    <Input
                      type="datetime-local"
                      value={line.datetime}
                      onChange={(e) =>
                        updateLine(idx, "datetime", e.target.value)
                      }
                      className="max-w-[200px]"
                    />
                    <div className="flex flex-col w-24 text-right">
                      <Input
                        type="number"
                        value={line.quantity}
                        placeholder="Qty"
                        onChange={(e) =>
                          updateLine(idx, "quantity", Number(e.target.value))
                        }
                        aria-invalid={errors.lines[idx]?.quantity && errors.lineGlobal}
                      />
                      {errors.lines[idx]?.quantity && errors.lineGlobal && (
                        <p className="text-destructive text-xs mt-1">Required</p>
                      )}
                    </div>
                    <div className="flex flex-col w-24 text-right">
                      <Input
                        type="number"
                        value={line.price}
                        placeholder="Price"
                        onChange={(e) =>
                          updateLine(idx, "price", Number(e.target.value))
                        }
                        aria-invalid={errors.lines[idx]?.price && errors.lineGlobal}
                      />
                      {errors.lines[idx]?.price && errors.lineGlobal && (
                        <p className="text-destructive text-xs mt-1">Required</p>
                      )}
                    </div>
                  </div>
                ))}

                {/* Centered Add-Line Button */}
                <div className="flex justify-center mt-2 px-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addLine}
                    className="w-8 h-8 p-0"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {errors.lineGlobal && (
                  <p className="text-destructive text-sm px-2">Enter quantity and price for at least one line</p>
                )}
              </div>
            </TabsContent>

            {/* ─── JOURNAL TAB ─── */}
            <TabsContent value="journal" className="space-y-4">
              {/* Tags */}
              <div>
                <Label htmlFor="tags">Tags</Label>
                <Select
                  multiple
                  onValueChange={(vals) => setTags(vals)}
                  value={tags}
                >
                  <SelectTrigger id="tags">
                    <SelectValue placeholder="Select tags" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="research">Research</SelectItem>
                    <SelectItem value="entry">Entry</SelectItem>
                    {/* ...more */}
                  </SelectContent>
                </Select>
              </div>

              {/* Notes */}
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Write your notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-[120px]"
                />
              </div>

              {/* Confidence Slider */}
              <div>
                <Label>Confidence: {confidence}</Label>
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

              {/* Upload Screenshots */}
              <div>
                <Label>Upload screenshots</Label>
                <div className="border-dashed border rounded-lg p-4 text-center">
                  <Input type="file" accept="image/*" multiple />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="text-right mt-4">
            <Button type="submit">Save</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddTradeForm;
