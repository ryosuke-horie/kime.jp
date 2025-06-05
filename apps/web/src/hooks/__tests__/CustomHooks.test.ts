/**
 * カスタムフックテストの実装例
 * Issue #360 フロントエンドテスト環境構築の実装例
 */
import { act, renderHook, waitFor } from "@testing-library/react";
import * as React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// カウンターフック
function useCounter(initialValue = 0) {
	const [count, setCount] = React.useState(initialValue);

	const increment = React.useCallback(() => {
		setCount((prev) => prev + 1);
	}, []);

	const decrement = React.useCallback(() => {
		setCount((prev) => prev - 1);
	}, []);

	const reset = React.useCallback(() => {
		setCount(initialValue);
	}, [initialValue]);

	const setValue = React.useCallback((value: number) => {
		setCount(value);
	}, []);

	return {
		count,
		increment,
		decrement,
		reset,
		setValue,
	};
}

// ローカルストレージフック
function useLocalStorage<T>(key: string, initialValue: T) {
	const [value, setValue] = React.useState<T>(() => {
		try {
			const item = window.localStorage.getItem(key);
			return item ? JSON.parse(item) : initialValue;
		} catch (error) {
			console.warn(`Error reading localStorage key "${key}":`, error);
			return initialValue;
		}
	});

	const setStoredValue = React.useCallback(
		(newValue: T | ((val: T) => T)) => {
			try {
				const valueToStore = newValue instanceof Function ? newValue(value) : newValue;
				setValue(valueToStore);
				window.localStorage.setItem(key, JSON.stringify(valueToStore));
			} catch (error) {
				console.warn(`Error setting localStorage key "${key}":`, error);
			}
		},
		[key, value],
	);

	const removeValue = React.useCallback(() => {
		try {
			setValue(initialValue);
			window.localStorage.removeItem(key);
		} catch (error) {
			console.warn(`Error removing localStorage key "${key}":`, error);
		}
	}, [key, initialValue]);

	return [value, setStoredValue, removeValue] as const;
}

// 非同期データフックのモック
interface ApiResponse<T> {
	data: T | null;
	loading: boolean;
	error: string | null;
	refetch: () => Promise<void>;
}

function useApi<T>(url: string): ApiResponse<T> {
	const [data, setData] = React.useState<T | null>(null);
	const [loading, setLoading] = React.useState(true);
	const [error, setError] = React.useState<string | null>(null);

	const fetchData = React.useCallback(async () => {
		setLoading(true);
		setError(null);

		try {
			const response = await fetch(url);
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			const result = await response.json();
			setData(result as T);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Unknown error");
			setData(null);
		} finally {
			setLoading(false);
		}
	}, [url]);

	React.useEffect(() => {
		fetchData();
	}, [fetchData]);

	return {
		data,
		loading,
		error,
		refetch: fetchData,
	};
}

// デバウンスフック
function useDebounce<T>(value: T, delay: number): T {
	const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

	React.useEffect(() => {
		const handler = setTimeout(() => {
			setDebouncedValue(value);
		}, delay);

		return () => {
			clearTimeout(handler);
		};
	}, [value, delay]);

	return debouncedValue;
}

// ウィンドウサイズフック
function useWindowSize() {
	const [windowSize, setWindowSize] = React.useState({
		width: 0,
		height: 0,
	});

	React.useEffect(() => {
		const handleResize = () => {
			setWindowSize({
				width: window.innerWidth,
				height: window.innerHeight,
			});
		};

		// 初期サイズを設定
		handleResize();

		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	return windowSize;
}

describe("カスタムフックテスト", () => {
	describe("useCounter", () => {
		it("初期値が正しく設定される", () => {
			const { result } = renderHook(() => useCounter(5));

			expect(result.current).toBeDefined();
			expect(result.current.count).toBe(5);
		});

		it("初期値が指定されない場合は0になる", () => {
			const { result } = renderHook(() => useCounter());

			expect(result.current.count).toBe(0);
		});

		it("incrementが正しく動作する", () => {
			const { result } = renderHook(() => useCounter(0));

			act(() => {
				result.current.increment();
			});

			expect(result.current.count).toBe(1);

			act(() => {
				result.current.increment();
			});

			expect(result.current.count).toBe(2);
		});

		it("decrementが正しく動作する", () => {
			const { result } = renderHook(() => useCounter(5));

			act(() => {
				result.current.decrement();
			});

			expect(result.current.count).toBe(4);
		});

		it("resetが正しく動作する", () => {
			const { result } = renderHook(() => useCounter(10));

			act(() => {
				result.current.increment();
				result.current.increment();
			});

			expect(result.current.count).toBe(12);

			act(() => {
				result.current.reset();
			});

			expect(result.current.count).toBe(10);
		});

		it("setValueが正しく動作する", () => {
			const { result } = renderHook(() => useCounter(0));

			act(() => {
				result.current.setValue(100);
			});

			expect(result.current.count).toBe(100);
		});
	});

	describe("useLocalStorage", () => {
		const mockLocalStorage = {
			getItem: vi.fn(),
			setItem: vi.fn(),
			removeItem: vi.fn(),
		};

		beforeEach(() => {
			vi.clearAllMocks();
			Object.defineProperty(window, "localStorage", {
				value: mockLocalStorage,
				writable: true,
			});
		});

		it("初期値が正しく設定される", () => {
			mockLocalStorage.getItem.mockReturnValue(null);

			const { result } = renderHook(() => useLocalStorage("test-key", "initial"));

			act(() => {
				// 初期化を確認
			});

			expect(result.current).toBeDefined();
			expect(result.current?.[0]).toBe("initial");
			expect(mockLocalStorage.getItem).toHaveBeenCalledWith("test-key");
		});

		it("ローカルストレージの値が正しく読み込まれる", () => {
			mockLocalStorage.getItem.mockReturnValue('"stored-value"');

			const { result } = renderHook(() => useLocalStorage("test-key", "initial"));

			act(() => {
				// 初期化を確認
			});

			expect(result.current).toBeDefined();
			expect(result.current?.[0]).toBe("stored-value");
		});

		it("値の設定が正しく動作する", () => {
			mockLocalStorage.getItem.mockReturnValue(null);

			const { result } = renderHook(() => useLocalStorage("test-key", "initial"));

			act(() => {
				// 初期化を確認
			});

			expect(result.current).toBeDefined();

			act(() => {
				result.current?.[1]("new-value");
			});

			expect(result.current?.[0]).toBe("new-value");
			expect(mockLocalStorage.setItem).toHaveBeenCalledWith("test-key", '"new-value"');
		});

		it("関数による値の更新が正しく動作する", () => {
			mockLocalStorage.getItem.mockReturnValue("5");

			const { result } = renderHook(() => useLocalStorage("test-key", 0));

			act(() => {
				// 初期化を確認
			});

			expect(result.current).toBeDefined();

			act(() => {
				result.current?.[1]((prev) => prev + 1);
			});

			expect(result.current?.[0]).toBe(6);
		});

		it("値の削除が正しく動作する", () => {
			mockLocalStorage.getItem.mockReturnValue('"stored-value"');

			const { result } = renderHook(() => useLocalStorage("test-key", "initial"));

			act(() => {
				// 初期化を確認
			});

			expect(result.current).toBeDefined();

			act(() => {
				result.current?.[2](); // removeValue
			});

			expect(result.current?.[0]).toBe("initial");
			expect(mockLocalStorage.removeItem).toHaveBeenCalledWith("test-key");
		});
	});

	describe("useApi", () => {
		const mockFetch = vi.fn();

		beforeEach(() => {
			vi.clearAllMocks();
			global.fetch = mockFetch;
		});

		it("成功時にデータが正しく取得される", async () => {
			const mockData = { id: 1, name: "Test User" };
			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => mockData,
			});

			const { result } = renderHook(() => useApi<typeof mockData>("/api/users"));

			act(() => {
				// 初期化を確認
			});

			expect(result.current).toBeDefined();

			// 初期状態の確認
			expect(result.current?.loading).toBe(true);
			expect(result.current?.data).toBeNull();
			expect(result.current?.error).toBeNull();

			// データ取得完了を待機
			await waitFor(() => {
				expect(result.current?.loading).toBe(false);
			});

			expect(result.current?.data).toEqual(mockData);
			expect(result.current?.error).toBeNull();
			expect(mockFetch).toHaveBeenCalledWith("/api/users");
		});

		it("エラー時に適切にエラーが設定される", async () => {
			mockFetch.mockRejectedValueOnce(new Error("Network error"));

			const { result } = renderHook(() => useApi("/api/users"));

			act(() => {
				// 初期化を確認
			});

			expect(result.current).toBeDefined();

			await waitFor(() => {
				expect(result.current?.loading).toBe(false);
			});

			expect(result.current?.data).toBeNull();
			expect(result.current?.error).toBe("Network error");
		});

		it("refetchが正しく動作する", async () => {
			const mockData = { id: 1, name: "Test User" };
			mockFetch.mockResolvedValue({
				ok: true,
				json: async () => mockData,
			});

			const { result } = renderHook(() => useApi<typeof mockData>("/api/users"));

			act(() => {
				// 初期化を確認
			});

			expect(result.current).toBeDefined();

			await waitFor(() => {
				expect(result.current?.loading).toBe(false);
			});

			// refetchを実行
			act(() => {
				result.current?.refetch();
			});

			expect(result.current?.loading).toBe(true);

			await waitFor(() => {
				expect(result.current?.loading).toBe(false);
			});

			expect(mockFetch).toHaveBeenCalledTimes(2);
		});
	});

	describe("useDebounce", () => {
		it("デバウンス機能が正しく動作する", async () => {
			const { result, rerender } = renderHook(
				({ value, delay }: { value: string; delay: number }) => useDebounce(value, delay),
				{
					initialProps: { value: "initial", delay: 500 },
				},
			);

			act(() => {
				// 初期化を確認
			});

			expect(result.current).toBeDefined();
			expect(result.current).toBe("initial");

			// 値を変更
			act(() => {
				rerender({ value: "updated", delay: 500 });
			});

			// すぐには変更されない
			expect(result.current).toBe("initial");

			// デバウンス後に変更される
			await waitFor(
				() => {
					expect(result.current).toBe("updated");
				},
				{ timeout: 600 },
			);
		});

		it("複数回の変更で最新の値のみが反映される", async () => {
			const { result, rerender } = renderHook(
				({ value, delay }: { value: string; delay: number }) => useDebounce(value, delay),
				{
					initialProps: { value: "initial", delay: 500 },
				},
			);

			act(() => {
				// 初期化を確認
			});

			expect(result.current).toBeDefined();

			// 連続で値を変更
			act(() => {
				rerender({ value: "first", delay: 500 });
				rerender({ value: "second", delay: 500 });
				rerender({ value: "final", delay: 500 });
			});

			// 最初は変更されない
			expect(result.current).toBe("initial");

			// 最終的な値のみが反映される
			await waitFor(
				() => {
					expect(result.current).toBe("final");
				},
				{ timeout: 600 },
			);
		});
	});

	describe("useWindowSize", () => {
		it("ウィンドウサイズが正しく取得される", () => {
			// ウィンドウサイズをモック
			Object.defineProperty(window, "innerWidth", {
				writable: true,
				configurable: true,
				value: 1024,
			});
			Object.defineProperty(window, "innerHeight", {
				writable: true,
				configurable: true,
				value: 768,
			});

			const { result } = renderHook(() => useWindowSize());

			act(() => {
				// 初期化を確認
			});

			expect(result.current).toBeDefined();
			expect(result.current?.width).toBe(1024);
			expect(result.current?.height).toBe(768);
		});

		it("ウィンドウリサイズ時に値が更新される", () => {
			const { result } = renderHook(() => useWindowSize());

			act(() => {
				// 初期化を確認
			});

			expect(result.current).toBeDefined();

			// ウィンドウサイズを変更
			Object.defineProperty(window, "innerWidth", {
				writable: true,
				configurable: true,
				value: 1920,
			});
			Object.defineProperty(window, "innerHeight", {
				writable: true,
				configurable: true,
				value: 1080,
			});

			// resize イベントを発火
			act(() => {
				window.dispatchEvent(new Event("resize"));
			});

			expect(result.current?.width).toBe(1920);
			expect(result.current?.height).toBe(1080);
		});
	});
});
