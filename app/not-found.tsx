import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center gap-6 min-h-[calc(100vh-80px)] p-8">
      <div className="flex flex-col items-center gap-4 text-center">
        <FileQuestion className="size-16 text-muted-foreground" />
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-bold">404</h1>
          <h2 className="text-2xl font-semibold">페이지를 찾을 수 없습니다</h2>
          <p className="text-muted-foreground">
            요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
          </p>
        </div>
      </div>
      <Link href="/">
        <Button variant="default" size="lg">
          홈으로 가기
        </Button>
      </Link>
    </div>
  );
}

