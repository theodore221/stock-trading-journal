import { create } from "zustand";
import axios from "axios";

export const useBucketStore = create((set, get) => ({
  buckets: [],
  fetchBuckets: async () => {
    try {
      const res = await axios.get("/api/buckets", { withCredentials: true });
      set({ buckets: res.data });
    } catch (e) {
      console.error(e);
    }
  },
  createBucket: async (name) => {
    const tempId = crypto.randomUUID();
    set({ buckets: [...get().buckets, { id: tempId, name, trade_count: 0 }] });
    try {
      const res = await axios.post(
        "/api/buckets",
        { name },
        { withCredentaisl: true }
      );
      set({
        buckets: get().buckets.map((b) => (b.id === tempId ? res.data : b)),
      });
    } catch (e) {
      console.error(e);
      set({ buckets: get().buckets.filter((b) => b.id !== tempId) });
    }
  },
  deleteBucket: async (id) => {
    const prev = get().buckets;
    set({ buckets: prev.filter((b) => b.id !== id) });
    try {
      await axios.delete(`/api/buckets/${id}`, { withCredentials: true });
    } catch (e) {
      console.error(e);
      set({ buckets: prev });
    }
  },
}));
