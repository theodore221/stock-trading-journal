"use client";
import BucketCard from "./BucketCard";
import AddBucketCard from "./AddBucketCard";

export default function BucketGrid({
  buckets,
  onAddClick,
  onBucketClick,
  onDelete,
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {buckets.map((b) => (
        <BucketCard
          key={b.id}
          bucket={b}
          onDelete={onDelete}
          onClick={() => onBucketClick(b)}
        />
      ))}
      <AddBucketCard onClick={onAddClick} />
    </div>
  );
}
