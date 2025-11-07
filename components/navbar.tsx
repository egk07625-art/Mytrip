import { SignedOut, SignInButton, SignedIn, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import React, { Suspense } from "react";
import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import TourSearch from "@/components/tour-search";

const Navbar = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95">
      <div className="w-full max-w-7xl mx-auto flex justify-between items-center gap-4 px-4 py-4 h-16">
        {/* 왼쪽: 로고 */}
        <Link href="/" className="text-2xl font-bold flex-shrink-0">
          My Trip
        </Link>
        
        {/* 가운데: 검색창 */}
        <div className="flex-1 flex justify-center">
          <Suspense fallback={<div className="w-full max-w-xl h-10 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />}>
            <TourSearch variant="compact" className="w-full max-w-xl" />
          </Suspense>
        </div>
        
        {/* 오른쪽: 북마크 및 로그인 */}
        <div className="flex gap-4 items-center flex-shrink-0">
          {/* 북마크 페이지 링크 */}
          <Link href="/bookmarks">
            <Button variant="ghost" size="sm" className="gap-2">
              <Bookmark className="w-4 h-4" />
              <span className="hidden sm:inline">북마크</span>
            </Button>
          </Link>
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
