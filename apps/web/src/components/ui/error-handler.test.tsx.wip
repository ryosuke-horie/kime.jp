import { handleError } from "./error-handler";
import { toast } from "sonner";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";

// toastモックを設定
vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
  },
}));

describe("handleError", () => {
  // テスト前に準備
  beforeEach(() => {
    // コンソールエラーをモック化して出力抑制
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  // テスト後にモックをクリア
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("API由来のエラーを適切に処理する", () => {
    const apiError = { error: "APIエラーメッセージ" };
    
    handleError(apiError);
    
    expect(toast.error).toHaveBeenCalledWith("APIエラーメッセージ", expect.anything());
    expect(console.error).toHaveBeenCalled();
  });

  it("通常のErrorオブジェクトを適切に処理する", () => {
    const regularError = new Error("通常のエラーメッセージ");
    
    handleError(regularError);
    
    expect(toast.error).toHaveBeenCalledWith("通常のエラーメッセージ", expect.anything());
    expect(console.error).toHaveBeenCalled();
  });

  it("エラーメッセージがない場合はフォールバックメッセージを使用する", () => {
    const emptyError = new Error("");
    const fallbackMessage = "フォールバックメッセージ";
    
    handleError(emptyError, fallbackMessage);
    
    expect(toast.error).toHaveBeenCalledWith(fallbackMessage, expect.anything());
  });

  it("未知のエラータイプでもフォールバックメッセージを使用する", () => {
    const unknownError = 123; // 数値タイプのエラー
    const fallbackMessage = "デフォルトエラーメッセージ";
    
    handleError(unknownError, fallbackMessage);
    
    expect(toast.error).toHaveBeenCalledWith(fallbackMessage, expect.anything());
  });
});