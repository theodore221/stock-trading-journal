"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function Header({ isLoggedIn }) {
  const router = useRouter();
  return (
    <header className="flex justify-between items-center p-4 border-b">
      <nav className="space-x-2">
        <Link href="/">
          <Button variant="ghost">Dashboard</Button>
        </Link>
        <Link href="/trades">
          <Button variant="ghost">Trades</Button>
        </Link>
        <Link href="/buckets">
          <Button variant="ghost">Buckets</Button>
        </Link>
        <Link href="/chart">
          <Button variant="ghost">Charts</Button>
        </Link>
      </nav>

      <div>
        {!isLoggedIn ? (
          <>
            <Link href="/login">
              <Button>Log In</Button>
            </Link>
            <Link href="/signup">
              <Button variant="secondary" className="ml-2">
                Sign Up
              </Button>
            </Link>
          </>
        ) : (
          <Avatar
            onClick={() => router.push("/profile")}
            className="cursor-pointer"
          >
            <AvatarFallback>T</AvatarFallback>
          </Avatar>
        )}
      </div>
    </header>
  );
}
