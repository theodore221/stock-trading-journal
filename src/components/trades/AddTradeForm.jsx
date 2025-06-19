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

const AddTradeForm = (onClose, onCreate) => {
  const [lines, setLines] = useState([
    {
      action: "BUY",
      datetime: new Date().toISOString().slice(0, 16),
      quantity: 0,
      price: 0,
      fee: 0,
    },
  ]);

  const [tags, setTags] = useState([]);
  const [notes, setNotes] = useState("");
  const [confidence, setConfidence] = useState(0);

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

  const onSubmit = (e) => {
    e.preventDefault();
    // TODO: handle save logic (e.g. send to API)
    console.log({ lines, tags, notes, confidence });
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
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

            <TabsContent value="general" className="space-y-4">
              {/* Market / Symbol / Target / Stop-Loss Fields */}
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="market">Market</Label>
                  <Select>
                    <SelectTrigger id="market">
                      <SelectValue placeholder="Select market" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INDEX">INDEX</SelectItem>
                      <SelectItem value="EQUITY">EQUITY</SelectItem>
                      {/* ...more... */}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="symbol">Symbol</Label>
                  <Input id="symbol" placeholder="e.g. SOXL" />
                </div>
                <div>
                  <Label htmlFor="target">Target</Label>
                  <Input id="target" type="number" step="0.01" />
                </div>
                <div>
                  <Label htmlFor="stopLoss">Stop-Loss</Label>
                  <Input id="stopLoss" type="number" step="0.01" />
                </div>
              </div>

              {/* Dynamic Trade Lines */}
              <div className="space-y-2">
                {lines.map((line, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => removeLine(idx)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <ToggleGroup
                      type="single"
                      value={line.action}
                      onValueChange={(val) => updateLine(idx, "action", val)}
                      className="bg-muted rounded-full p-1"
                    >
                      <ToggleGroupItem
                        value="BUY"
                        className={
                          line.action === "BUY" ? "bg-green-500 text-white" : ""
                        }
                      >
                        BUY
                      </ToggleGroupItem>
                      <ToggleGroupItem
                        value="SELL"
                        className={
                          line.action === "SELL" ? "bg-red-500 text-white" : ""
                        }
                      >
                        SELL
                      </ToggleGroupItem>
                    </ToggleGroup>
                    <Input
                      type="datetime-local"
                      value={line.datetime}
                      onChange={(e) =>
                        updateLine(idx, "datetime", e.target.value)
                      }
                      className="max-w-[200px]"
                    />
                    <Input
                      type="number"
                      value={line.quantity}
                      placeholder="Qty"
                      onChange={(e) =>
                        updateLine(idx, "quantity", Number(e.target.value))
                      }
                      className="w-24"
                    />
                    <Input
                      type="number"
                      value={line.price}
                      placeholder="Price"
                      onChange={(e) =>
                        updateLine(idx, "price", Number(e.target.value))
                      }
                      className="w-24"
                    />
                    <Input
                      type="number"
                      value={line.fee}
                      placeholder="Fee"
                      onChange={(e) =>
                        updateLine(idx, "fee", Number(e.target.value))
                      }
                      className="w-24"
                    />
                  </div>
                ))}
                <Button
                  variant="outline"
                  onClick={addLine}
                  className="w-8 h-8 p-0"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </TabsContent>

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
                    {/* ...more... */}
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

          {/* Save Button */}
          <div className="text-right">
            <Button type="submit">Save</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddTradeForm;
