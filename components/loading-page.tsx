import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface LoadingPageProps {
  /**
   * 로딩 메시지
   * @default "로딩 중..."
   */
  message?: string;
  /**
   * 추가 클래스명
   */
  className?: string;
}

export default function LoadingPage({
  message = "로딩 중...",
  className,
}: LoadingPageProps) {
  return (
    <div className={className} role="status" aria-label={message}>
      <div className="flex flex-col items-center justify-center gap-4 min-h-[400px]">
        <LoadingSpinner size="lg" className="text-primary" />
        <p className="text-muted-foreground text-sm">{message}</p>
      </div>
    </div>
  );
}



