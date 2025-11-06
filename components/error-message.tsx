import { AlertCircle, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";

export type ErrorType = "api" | "network" | "unknown";

interface ErrorMessageProps {
  /**
   * 에러 메시지
   */
  message?: string;
  /**
   * 에러 타입 (api, network, unknown)
   * @default "unknown"
   */
  type?: ErrorType;
  /**
   * 재시도 버튼 표시 여부
   * @default false
   */
  showRetry?: boolean;
  /**
   * 재시도 버튼 클릭 핸들러
   */
  onRetry?: () => void;
  /**
   * 추가 클래스명
   */
  className?: string;
}

export default function ErrorMessage({
  message,
  type = "unknown",
  showRetry = false,
  onRetry,
  className,
}: ErrorMessageProps) {
  const getErrorMessage = () => {
    if (message) return message;

    switch (type) {
      case "api":
        return "데이터를 불러오는 중 오류가 발생했습니다.";
      case "network":
        return "네트워크 연결을 확인해주세요.";
      default:
        return "오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
    }
  };

  const getIcon = () => {
    switch (type) {
      case "network":
        return <WifiOff className="size-5 text-destructive" />;
      default:
        return <AlertCircle className="size-5 text-destructive" />;
    }
  };

  return (
    <div role="alert" aria-live="polite" className={className}>
      <div className="flex flex-col items-center justify-center gap-4 p-6 rounded-lg border border-destructive/20 bg-destructive/5">
        <div className="flex items-center gap-3">
          {getIcon()}
          <p className="text-destructive font-medium text-sm">
            {getErrorMessage()}
          </p>
        </div>
        {showRetry && onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            aria-label="재시도"
          >
            다시 시도
          </Button>
        )}
      </div>
    </div>
  );
}

