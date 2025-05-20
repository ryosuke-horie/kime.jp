"use client";

import { ReactNode, useEffect } from "react";
import { toast } from "sonner";
import { ErrorResponseType } from "@/types";

/**
 * エラーハンドリングコンテキストのプロパティ
 */
interface ErrorHandlerProps {
  children: ReactNode;
}

/**
 * 汎用エラーハンドラー
 * API呼び出しなどでキャッチされたエラーを処理する
 * @param error 処理するエラー
 * @param fallbackMessage デフォルトのエラーメッセージ
 */
export const handleError = (error: unknown, fallbackMessage = "エラーが発生しました"): void => {
  console.error("エラー発生:", error);
  
  // ErrorResponseTypeかどうかをチェック (API由来のエラー)
  if (error && typeof error === "object" && "error" in error) {
    const apiError = error as Partial<ErrorResponseType>;
    
    toast.error(apiError.error || fallbackMessage, {
      description: "詳細はコンソールを確認してください",
    });
    return;
  }
  
  // Errorオブジェクトの場合
  if (error instanceof Error) {
    toast.error(error.message || fallbackMessage, {
      description: "詳細はコンソールを確認してください",
    });
    return;
  }
  
  // それ以外の場合はデフォルトメッセージを表示
  toast.error(fallbackMessage, {
    description: "詳細はコンソールを確認してください",
  });
};

/**
 * グローバルエラーハンドリングコンポーネント
 * グローバルなエラーをキャッチしてユーザーに通知する
 */
export function ErrorHandler({ children }: ErrorHandlerProps) {
  useEffect(() => {
    // グローバルなunhandled rejectionをキャッチ
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      event.preventDefault();
      handleError(event.reason, "予期しないエラーが発生しました");
    };
    
    // グローバルなエラーをキャッチ
    const handleGlobalError = (event: ErrorEvent) => {
      event.preventDefault();
      handleError(event.error || event.message, "システムエラーが発生しました");
    };
    
    // イベントリスナーを登録
    window.addEventListener("unhandledrejection", handleUnhandledRejection);
    window.addEventListener("error", handleGlobalError);
    
    // クリーンアップ関数
    return () => {
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
      window.removeEventListener("error", handleGlobalError);
    };
  }, []);
  
  return <>{children}</>;
}