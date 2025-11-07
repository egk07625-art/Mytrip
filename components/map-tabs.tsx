/**
 * @file map-tabs.tsx
 * @description 지도/리스트 탭 전환 컴포넌트 (모바일용)
 *
 * 모바일 환경에서 리스트와 지도를 탭으로 전환하는 컴포넌트입니다.
 *
 * 주요 기능:
 * 1. 리스트/지도 탭 전환
 * 2. 현재 활성 탭 표시
 * 3. 반응형 디자인 (모바일 전용)
 *
 * @dependencies
 * - @/components/ui/button: Button 컴포넌트
 */

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { List, Map } from "lucide-react";

interface MapTabsProps {
  listContent: React.ReactNode;
  mapContent: React.ReactNode;
  className?: string;
}

/**
 * 지도/리스트 탭 전환 컴포넌트
 * @param listContent - 리스트 탭 내용
 * @param mapContent - 지도 탭 내용
 * @param className - 추가 CSS 클래스
 */
export default function MapTabs({ listContent, mapContent, className }: MapTabsProps) {
  const [activeTab, setActiveTab] = useState<"list" | "map">("list");

  return (
    <div className={`flex flex-col ${className || ""}`}>
      {/* 탭 버튼 */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700 mb-4">
        <Button
          variant={activeTab === "list" ? "default" : "ghost"}
          onClick={() => setActiveTab("list")}
          className="flex-1 gap-2"
          aria-pressed={activeTab === "list"}
          aria-label="목록 보기"
        >
          <List className="w-4 h-4" aria-hidden="true" />
          <span>목록</span>
        </Button>
        <Button
          variant={activeTab === "map" ? "default" : "ghost"}
          onClick={() => setActiveTab("map")}
          className="flex-1 gap-2"
          aria-pressed={activeTab === "map"}
          aria-label="지도 보기"
        >
          <Map className="w-4 h-4" aria-hidden="true" />
          <span>지도</span>
        </Button>
      </div>

      {/* 탭 내용 */}
      <div className="flex-1">
        {activeTab === "list" ? listContent : mapContent}
      </div>
    </div>
  );
}

