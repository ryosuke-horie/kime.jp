import { handleError } from "@/components/ui/error-handler";

/**
 * API関数をエラーハンドリング機能で拡張する高階関数
 * @param apiFn 元のAPI関数
 * @param errorMessage エラー時のデフォルトメッセージ
 * @returns エラーハンドリング機能を持つラップされたAPI関数
 */
export function withErrorHandling<T extends (...args: any[]) => Promise<any>>(
	apiFn: T,
	errorMessage?: string,
): (...args: Parameters<T>) => Promise<Awaited<ReturnType<T>>> {
	return async (...args: Parameters<T>): Promise<Awaited<ReturnType<T>>> => {
		try {
			return (await apiFn(...args)) as Awaited<ReturnType<T>>;
		} catch (error) {
			// グローバルエラーハンドラーを使用
			handleError(error, errorMessage);
			// 元のエラーを再スロー（呼び出し元が追加の処理を行えるように）
			throw error;
		}
	};
}
