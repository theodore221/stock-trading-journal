"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import { useBucketStore } from "@/store/useBucketStore";

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
import { Button } from "@/components/ui/button";

import AddTradeForm from "@/components/trades/AddTradeForm";

export default function BucketDetailModal({ bucket, onClose }) {
  const [trades, setTrades] = useState([]);
  const deleteBucket = useBucketStore((s) => s.deleteBucket);

  const fetchTrades = async () => {
    try {
      const res = await axios.get(`/api/buckets/${bucket.id}/trades`, {
        withCredentials: true,
      });
      setTrades(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteBucket = async () => {
    try {
      await deleteBucket(bucket.id);
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTrades();
  }, [bucket.id]);

  const handleTradeAdded = () => {
    fetchTrades();
  };

  //TODO: Add a 'theres no trades yet waiting text'

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-full !max-w-5xl">
        <DialogHeader>
          <DialogTitle>{bucket.name}</DialogTitle>
        </DialogHeader>
        <div className="mt-4 overflow-auto">
          <Table>
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
              {trades.length > 0 ? (
                trades.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell>{t.date}</TableCell>
                    <TableCell>{t.stock}</TableCell>
                    <TableCell>{t.quantity}</TableCell>
                    <TableCell>{t.price}</TableCell>
                    <TableCell>{t.type}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    No trades yet…
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* <div className="mt-6">
            <AddTradeForm bucketId={bucket.id} onAdded={fetchTrades} />
          </div> */}
        </div>
        {/* //TODO: Add a loader for when the deletefunction is running */}
        <DialogFooter className="flex justify-between">
          <Button variant="destructive" onClick={handleDeleteBucket}>
            Delete Bucket
          </Button>
          <div className="space-x-2">
            {/* <Button variant="outline" onClick={onClose}>
              Close
            </Button> */}
            <Link href={`/buckets/${bucket.id}`} passHref>
              <Button asChild>
                <a>Open Full Page</a>
              </Button>
            </Link>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
