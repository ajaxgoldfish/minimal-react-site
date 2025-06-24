"use client";

import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Button } from "./ui/button";
import Link from "next/link";

export function AuthButtons() {
  return (
    <div className="flex items-center gap-2">
      <SignedIn>
        <UserButton afterSignOutUrl="/" />
      </SignedIn>
      <SignedOut>
        <Button asChild variant="ghost">
          <Link href="/sign-in">登录</Link>
        </Button>
        <Button asChild>
          <Link href="/sign-up">注册</Link>
        </Button>
      </SignedOut>
    </div>
  );
} 