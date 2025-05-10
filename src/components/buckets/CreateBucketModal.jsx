"use client";
import { useState } from "react";

export default function CreateBucketModal({ onClose, onCreate }) {
  const [name, setName] = useState("");

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black bg-opacity-20 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md transform transition-transform duration-200 ease-out">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">New Bucket</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors duration-150"
          >
            ×
          </button>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onCreate(name);
          }}
          className="space-y-4"
        >
          <input
            type="text"
            placeholder="Bucket Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border p-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
          <button className="w-full bg-blue-500 text-white p-2 rounded transition-transform duration-150 ease-in-out hover:scale-105 active:scale-95">
            Create
          </button>
        </form>
      </div>
    </div>
  );
}
