"use client";

import { useSyncUser } from "@/hooks/use-sync-user";
import { usePathname } from "next/navigation";

/**
 * Clerk 사용자를 Supabase DB에 자동으로 동기화하는 프로바이더
 *
 * RootLayout에 추가하여 로그인한 모든 사용자를 자동으로 Supabase에 동기화합니다.
 * not-found 페이지에서는 실행하지 않습니다 (정적 생성 호환성).
 */
export function SyncUserProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // not-found 페이지인지 확인
  const isNotFoundPage = pathname === null || 
    (typeof window !== 'undefined' && 
     (window.location.pathname.includes('_not-found') || window.location.pathname === '/404'));
  
  // Hook은 항상 호출해야 하므로, skip 파라미터로 조건부 처리
  useSyncUser(isNotFoundPage);
  
  return <>{children}</>;
}
