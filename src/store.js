"use client";

import { create } from "zustand";

export const useStore = create((set) => ({
  token: null,
  setToken: (token) => set({ token }),
}));
