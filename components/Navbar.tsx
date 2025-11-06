import { SignedOut, SignInButton, SignedIn, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import React from "react";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  return (
    <header className="w-full border-b border-gray-200 dark:border-gray-700">
      <div className="w-full max-w-7xl mx-auto flex justify-between items-center px-4 py-4 h-16">
        <Link href="/" className="text-2xl font-bold flex-shrink-0">
          My Trip
        </Link>
        <div className="flex gap-4 items-center flex-shrink-0">
          <SignedOut>
            <SignInButton mode="modal">
              <Button>로그인</Button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
