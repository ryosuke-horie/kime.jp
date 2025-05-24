"use client";

import { type ReactNode, createContext, useContext, useEffect, useState } from "react";
import { type GymLoginRequest, type GymUser, gymAuthClient } from "../api/gym-client";

/**
 * ジム認証状態
 */
interface GymAuthState {
	/** 認証済みかどうか */
	isAuthenticated: boolean;
	/** ユーザー情報 */
	user: GymUser | null;
	/** JWTトークン */
	token: string | null;
	/** ローディング状態 */
	isLoading: boolean;
	/** エラーメッセージ */
	error: string | null;
}

/**
 * ジム認証コンテキストの型
 */
interface GymAuthContextType extends GymAuthState {
	/** ログイン */
	login: (credentials: GymLoginRequest) => Promise<boolean>;
	/** ログアウト */
	logout: () => Promise<void>;
	/** エラーをクリア */
	clearError: () => void;
}

/**
 * ジム認証コンテキスト
 */
const GymAuthContext = createContext<GymAuthContextType | undefined>(undefined);

/**
 * ローカルストレージキー
 */
const TOKEN_STORAGE_KEY = "gym_auth_token";
const USER_STORAGE_KEY = "gym_auth_user";

/**
 * ジム認証プロバイダー
 */
export function GymAuthProvider({ children }: { children: ReactNode }) {
	const [state, setState] = useState<GymAuthState>({
		isAuthenticated: false,
		user: null,
		token: null,
		isLoading: true,
		error: null,
	});

	/**
	 * 初期化時にローカルストレージからトークンとユーザー情報を復元
	 */
	useEffect(() => {
		const initializeAuth = async () => {
			try {
				const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
				const storedUser = localStorage.getItem(USER_STORAGE_KEY);

				if (storedToken && storedUser) {
					// ストレージから復元したトークンの有効性を確認
					try {
						const response = await gymAuthClient.getMe(storedToken);
						setState({
							isAuthenticated: true,
							user: response.user,
							token: storedToken,
							isLoading: false,
							error: null,
						});
					} catch (error) {
						// トークンが無効な場合はクリア
						localStorage.removeItem(TOKEN_STORAGE_KEY);
						localStorage.removeItem(USER_STORAGE_KEY);
						setState({
							isAuthenticated: false,
							user: null,
							token: null,
							isLoading: false,
							error: null,
						});
					}
				} else {
					setState((prev) => ({
						...prev,
						isLoading: false,
					}));
				}
			} catch (error) {
				console.error("認証状態の初期化に失敗:", error);
				setState({
					isAuthenticated: false,
					user: null,
					token: null,
					isLoading: false,
					error: "認証状態の初期化に失敗しました",
				});
			}
		};

		initializeAuth();
	}, []);

	/**
	 * ログイン
	 */
	const login = async (credentials: GymLoginRequest): Promise<boolean> => {
		setState((prev) => ({ ...prev, isLoading: true, error: null }));

		try {
			const response = await gymAuthClient.login(credentials);

			if (response.success) {
				// ローカルストレージに保存
				localStorage.setItem(TOKEN_STORAGE_KEY, response.token);
				localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(response.user));

				setState({
					isAuthenticated: true,
					user: response.user,
					token: response.token,
					isLoading: false,
					error: null,
				});

				return true;
			}
			setState((prev) => ({
				...prev,
				isLoading: false,
				error: response.error,
			}));
			return false;
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : "ログインに失敗しました";
			setState((prev) => ({
				...prev,
				isLoading: false,
				error: errorMessage,
			}));
			return false;
		}
	};

	/**
	 * ログアウト
	 */
	const logout = async (): Promise<void> => {
		setState((prev) => ({ ...prev, isLoading: true }));

		try {
			// サーバーサイドログアウト（オプション）
			if (state.token) {
				try {
					await gymAuthClient.logout(state.token);
				} catch (error) {
					// サーバーサイドログアウトに失敗してもクライアントサイドはクリア
					console.warn("サーバーサイドログアウトに失敗:", error);
				}
			}
		} finally {
			// ローカルストレージをクリア
			localStorage.removeItem(TOKEN_STORAGE_KEY);
			localStorage.removeItem(USER_STORAGE_KEY);

			setState({
				isAuthenticated: false,
				user: null,
				token: null,
				isLoading: false,
				error: null,
			});
		}
	};

	/**
	 * エラーをクリア
	 */
	const clearError = (): void => {
		setState((prev) => ({ ...prev, error: null }));
	};

	const contextValue: GymAuthContextType = {
		...state,
		login,
		logout,
		clearError,
	};

	return <GymAuthContext.Provider value={contextValue}>{children}</GymAuthContext.Provider>;
}

/**
 * ジム認証コンテキストを使用するためのフック
 */
export function useGymAuthContext(): GymAuthContextType {
	const context = useContext(GymAuthContext);
	if (context === undefined) {
		throw new Error("useGymAuthContext must be used within a GymAuthProvider");
	}
	return context;
}
