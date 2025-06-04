/**
 * Next.jsルーターモックのテスト実装例
 * Issue #360 フロントエンドテスト環境構築の実装例
 */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Next.js App Routerのモック
vi.mock("next/navigation", () => ({
	useRouter: vi.fn(),
	useSearchParams: vi.fn(),
	usePathname: vi.fn(),
}));

import { usePathname, useRouter, useSearchParams } from "next/navigation";

// テスト用のナビゲーションコンポーネント
function NavigationComponent() {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	const handleNavigate = (path: string) => {
		router.push(path);
	};

	const handleReplace = (path: string) => {
		router.replace(path);
	};

	const handleBack = () => {
		router.back();
	};

	const handleRefresh = () => {
		router.refresh();
	};

	return (
		<div>
			<p data-testid="current-path">現在のパス: {pathname}</p>
			<p data-testid="search-params">クエリパラメータ: {searchParams?.get("q") || "なし"}</p>

			<button data-testid="navigate-home" onClick={() => handleNavigate("/")} type="button">
				ホームへ
			</button>
			<button data-testid="navigate-about" onClick={() => handleNavigate("/about")} type="button">
				About
			</button>
			<button data-testid="replace-contact" onClick={() => handleReplace("/contact")} type="button">
				お問い合わせ（置換）
			</button>
			<button data-testid="back-button" onClick={handleBack} type="button">
				戻る
			</button>
			<button data-testid="refresh-button" onClick={handleRefresh} type="button">
				更新
			</button>
		</div>
	);
}

// テスト用の検索コンポーネント
function SearchComponent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [query, setQuery] = React.useState("");

	const currentQuery = searchParams?.get("q") || "";

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		router.push(`/search?q=${encodeURIComponent(query)}`);
	};

	return (
		<div>
			<p data-testid="current-query">現在の検索: {currentQuery}</p>
			<form onSubmit={handleSearch}>
				<input
					type="text"
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					placeholder="検索キーワード"
					data-testid="search-input"
				/>
				<button type="submit" data-testid="search-submit">
					検索
				</button>
			</form>
		</div>
	);
}

describe("Next.jsルーターモックテスト", () => {
	const mockPush = vi.fn();
	const mockReplace = vi.fn();
	const mockBack = vi.fn();
	const mockRefresh = vi.fn();

	beforeEach(() => {
		// モック関数をリセット
		vi.clearAllMocks();

		// useRouterのモック設定
		vi.mocked(useRouter).mockReturnValue({
			push: mockPush,
			replace: mockReplace,
			back: mockBack,
			refresh: mockRefresh,
			forward: vi.fn(),
			prefetch: vi.fn(),
		});

		// usePathnameのモック設定
		vi.mocked(usePathname).mockReturnValue("/");

		// useSearchParamsのモック設定
		const mockSearchParams = {
			get: vi.fn(),
			has: vi.fn(),
			keys: vi.fn(),
			values: vi.fn(),
			entries: vi.fn(),
			forEach: vi.fn(),
			toString: vi.fn(),
			append: vi.fn(),
			delete: vi.fn(),
			set: vi.fn(),
			sort: vi.fn(),
			size: 0,
			[Symbol.iterator]: vi.fn(),
		};
		vi.mocked(useSearchParams).mockReturnValue(mockSearchParams as any);
	});

	describe("NavigationComponent", () => {
		it("現在のパスが正しく表示される", () => {
			vi.mocked(usePathname).mockReturnValue("/dashboard");

			render(<NavigationComponent />);

			expect(screen.getByTestId("current-path")).toHaveTextContent("現在のパス: /dashboard");
		});

		it("ナビゲーションボタンがrouter.pushを呼び出す", async () => {
			const user = userEvent.setup();
			render(<NavigationComponent />);

			await user.click(screen.getByTestId("navigate-home"));
			expect(mockPush).toHaveBeenCalledWith("/");

			await user.click(screen.getByTestId("navigate-about"));
			expect(mockPush).toHaveBeenCalledWith("/about");
		});

		it("置換ボタンがrouter.replaceを呼び出す", async () => {
			const user = userEvent.setup();
			render(<NavigationComponent />);

			await user.click(screen.getByTestId("replace-contact"));
			expect(mockReplace).toHaveBeenCalledWith("/contact");
		});

		it("戻るボタンがrouter.backを呼び出す", async () => {
			const user = userEvent.setup();
			render(<NavigationComponent />);

			await user.click(screen.getByTestId("back-button"));
			expect(mockBack).toHaveBeenCalledTimes(1);
		});

		it("更新ボタンがrouter.refreshを呼び出す", async () => {
			const user = userEvent.setup();
			render(<NavigationComponent />);

			await user.click(screen.getByTestId("refresh-button"));
			expect(mockRefresh).toHaveBeenCalledTimes(1);
		});

		it("URLパラメータが正しく表示される", () => {
			const mockSearchParams = {
				get: vi.fn().mockReturnValue("vitest"),
				has: vi.fn(),
				keys: vi.fn(),
				values: vi.fn(),
				entries: vi.fn(),
				forEach: vi.fn(),
				toString: vi.fn().mockReturnValue("q=vitest"),
				append: vi.fn(),
				delete: vi.fn(),
				set: vi.fn(),
				sort: vi.fn(),
				size: 1,
				[Symbol.iterator]: vi.fn(),
			};
			vi.mocked(useSearchParams).mockReturnValue(mockSearchParams as any);

			render(<NavigationComponent />);

			expect(screen.getByTestId("search-params")).toHaveTextContent("クエリパラメータ: vitest");
		});
	});

	describe("SearchComponent", () => {
		it("検索フォームが正しく動作する", async () => {
			const user = userEvent.setup();
			render(<SearchComponent />);

			// 検索キーワードを入力
			await user.type(screen.getByTestId("search-input"), "テストキーワード");

			// 検索ボタンをクリック
			await user.click(screen.getByTestId("search-submit"));

			// router.pushが正しいURLで呼び出されることを確認
			expect(mockPush).toHaveBeenCalledWith(
				"/search?q=%E3%83%86%E3%82%B9%E3%83%88%E3%82%AD%E3%83%BC%E3%83%AF%E3%83%BC%E3%83%89",
			);
		});

		it("現在の検索クエリが表示される", () => {
			const mockSearchParams = {
				get: vi.fn().mockReturnValue("現在の検索"),
				has: vi.fn(),
				keys: vi.fn(),
				values: vi.fn(),
				entries: vi.fn(),
				forEach: vi.fn(),
				toString: vi.fn().mockReturnValue("q=現在の検索"),
				append: vi.fn(),
				delete: vi.fn(),
				set: vi.fn(),
				sort: vi.fn(),
				size: 1,
				[Symbol.iterator]: vi.fn(),
			};
			vi.mocked(useSearchParams).mockReturnValue(mockSearchParams as any);

			render(<SearchComponent />);

			expect(screen.getByTestId("current-query")).toHaveTextContent("現在の検索: 現在の検索");
		});

		it("空の検索でも送信できる", async () => {
			const user = userEvent.setup();
			render(<SearchComponent />);

			await user.click(screen.getByTestId("search-submit"));

			expect(mockPush).toHaveBeenCalledWith("/search?q=");
		});

		it("Enterキーで検索が実行される", async () => {
			const user = userEvent.setup();
			render(<SearchComponent />);

			await user.type(screen.getByTestId("search-input"), "キーボード検索");
			await user.keyboard("{Enter}");

			expect(mockPush).toHaveBeenCalledWith(
				"/search?q=%E3%82%AD%E3%83%BC%E3%83%9C%E3%83%BC%E3%83%89%E6%A4%9C%E7%B4%A2",
			);
		});
	});

	describe("複雑なルーティングシナリオ", () => {
		it("複数のルーティング操作が順次実行される", async () => {
			const user = userEvent.setup();
			render(<NavigationComponent />);

			// 複数のナビゲーション操作
			await user.click(screen.getByTestId("navigate-about"));
			await user.click(screen.getByTestId("navigate-home"));
			await user.click(screen.getByTestId("replace-contact"));

			// 呼び出し回数と順序を確認
			expect(mockPush).toHaveBeenCalledTimes(2);
			expect(mockReplace).toHaveBeenCalledTimes(1);
			expect(mockPush).toHaveBeenNthCalledWith(1, "/about");
			expect(mockPush).toHaveBeenNthCalledWith(2, "/");
			expect(mockReplace).toHaveBeenCalledWith("/contact");
		});

		it("パスとクエリパラメータの組み合わせ", () => {
			vi.mocked(usePathname).mockReturnValue("/products");
			const mockSearchParams = {
				get: vi.fn().mockReturnValue(null),
				has: vi.fn(),
				keys: vi.fn(),
				values: vi.fn(),
				entries: vi.fn(),
				forEach: vi.fn(),
				toString: vi.fn().mockReturnValue("category=electronics&sort=price"),
				append: vi.fn(),
				delete: vi.fn(),
				set: vi.fn(),
				sort: vi.fn(),
				size: 2,
				[Symbol.iterator]: vi.fn(),
			};
			vi.mocked(useSearchParams).mockReturnValue(mockSearchParams as any);

			render(<NavigationComponent />);

			expect(screen.getByTestId("current-path")).toHaveTextContent("現在のパス: /products");
			// 最初のクエリパラメータのみ表示される（コンポーネントの仕様）
			expect(screen.getByTestId("search-params")).toHaveTextContent("クエリパラメータ: なし");
		});
	});
});
