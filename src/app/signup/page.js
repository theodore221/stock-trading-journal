"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const router = useRouter();

  const handleSignup = async (e) => {
    e.preventDefault();

    try {
      const { data } = await axios.post("api/auth/signup", { email, password });

      console.log("Sign-up successful:", data.user);

      router.push("/login");
    } catch (err) {
      console.error("Sign-up error:'", err);
    }

    // try {

    //   await axios.post("/api/auth/signup", { email, password });
    //   router.push("/login");
    // } catch (err) {
    //   console.error(err);
    // }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <form onSubmit={handleSignup} className="bg-white p-6 rounded shadow-md">
        <h2 className="text-2xl mb-4">Sign Up</h2>
        <input
          type="email"
          placeholder="Email"
          className="border p-2 mb-4 w-full"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="border p-2 mb-4 w-full"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          className="bg-blue-500 text-white p-2 rounded w-full"
        >
          Sign Up
        </button>
      </form>
    </div>
  );
}
