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

export default function BucketDetailsPage() {
  const { id } = useParams();
  const router = useRouter();

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={() => router.back()}>
          ← Back
        </Button>
        <h1 className="text-3xl font-bold">Bucket: {id}</h1>
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
          onClick={() => {
            /* TODO: POST /api/buckets/${id} to save budget */
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
        <Button
          onClick={() => {
            /* TODO: open Add Trade modal */
          }}
        >
          + Add Trade
        </Button>
      </div>

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
