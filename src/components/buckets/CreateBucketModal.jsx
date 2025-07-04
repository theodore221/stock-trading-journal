"use client";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function CreateBucketModal({ onClose, onCreate }) {
  const [name, setName] = useState("");
  const [bucketSize, setBucketSize] = useState(0);

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>New Bucket</DialogTitle>
          <DialogDescription>
            Enter a name for your new strategy bucket.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-2">
            {/* <Label htmlFor="bucket-name">Bucket Name</Label> */}
            <Input
              id="bucket-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Strategy"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="bucket-size">Bucket Size</Label>
            <Input
              id="bucket-size"
              type="number"
              value={bucketSize}
              onChange={(e) => setBucketSize(Number(e.target.value))}
              placeholder="1000"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => onCreate(name, bucketSize)}>Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
