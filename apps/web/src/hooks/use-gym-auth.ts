import { useRouter } from "next/navigation";
import { useCallback } from "react";
import type { GymLoginRequest } from "../api/gym-client";
import { useGymAuthContext } from "../contexts/gym-auth-provider";

/**
 * ジム認証用のカスタムフック
 *
 * ジム認証の状態管理、ログイン/ログアウト処理、
 * ナビゲーションなどの機能を提供します。
 */
export function useGymAuth() {
	const context = useGymAuthContext();
	const router = useRouter();

	/**
	 * ログイン処理
	 */
	const login = useCallback(
		async (credentials: GymLoginRequest): Promise<boolean> => {
			const success = await context.login(credentials);
			if (success) {
				// ログイン成功時はダッシュボードにリダイレクト
				router.push("/gym/dashboard");
			}
			return success;
		},
		[context, router],
	);

	/**
	 * ログアウト処理
	 */
	const logout = useCallback(async (): Promise<void> => {
		await context.logout();
		// ログアウト後はログインページにリダイレクト
		router.push("/gym/auth/signin");
	}, [context, router]);

	/**
	 * 認証が必要なページへのリダイレクト処理
	 */
	const requireAuth = useCallback((): void => {
		if (!context.isAuthenticated && !context.isLoading) {
			router.push("/gym/auth/signin");
		}
	}, [context.isAuthenticated, context.isLoading, router]);

	/**
	 * 未認証時のホームページへのリダイレクト処理
	 */
	const redirectIfAuthenticated = useCallback((): void => {
		if (context.isAuthenticated && !context.isLoading) {
			router.push("/gym/dashboard");
		}
	}, [context.isAuthenticated, context.isLoading, router]);

	/**
	 * ユーザーがオーナーかどうかを判定
	 */
	const isOwner = context.user?.role === "owner";

	/**
	 * ユーザーがスタッフかどうかを判定
	 */
	const isStaff = context.user?.role === "staff";

	/**
	 * ユーザーの権限をチェック
	 */
	const hasRole = useCallback(
		(role: "owner" | "staff"): boolean => {
			return context.user?.role === role;
		},
		[context.user?.role],
	);

	/**
	 * エラーメッセージのクリア
	 */
	const clearError = useCallback((): void => {
		context.clearError();
	}, [context]);

	return {
		// 認証状態
		...context,

		// 便利な判定フラグ
		isOwner,
		isStaff,

		// アクション
		login,
		logout,
		clearError,
		hasRole,

		// ナビゲーション
		requireAuth,
		redirectIfAuthenticated,
	};
}
