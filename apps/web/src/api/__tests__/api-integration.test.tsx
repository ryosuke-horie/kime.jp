import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
/**
 * API統合テスト
 * MSWを使用してAPIリクエストとレスポンスをテストする
 */
import React from "react";
import { server } from "../../mocks/server";

// CI環境でのDOM問題回避のためのユーティリティ関数
const getByText = (container: HTMLElement, text: string | RegExp) => {
	const elements = Array.from(container.querySelectorAll("*")).filter((el) => {
		const textContent = el.textContent;
		if (typeof text === "string") {
			return textContent?.includes(text);
		}
		return text.test(textContent || "");
	});
	if (elements.length === 0) {
		throw new Error(`Unable to find element with text: ${text}`);
	}
	return elements[0];
};

// テスト用のコンポーネント
const TestComponent = () => {
	const [data, setData] = React.useState<any>(null);
	const [loading, setLoading] = React.useState(false);
	const [error, setError] = React.useState<string | null>(null);

	const fetchData = React.useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const response = await fetch("/api/gyms");
			if (!response.ok) {
				throw new Error("Failed to fetch");
			}
			const result = await response.json();
			setData(result);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Unknown error");
		} finally {
			setLoading(false);
		}
	}, []);

	React.useEffect(() => {
		fetchData();
	}, [fetchData]);

	if (loading) return <div>Loading...</div>;
	if (error) return <div>Error: {error}</div>;
	if (!data) return <div>No data</div>;

	return (
		<div>
			<h1>ジム一覧</h1>
			<ul>
				{(data as any).data.map((gym: any) => (
					<li key={gym.id}>{gym.name}</li>
				))}
			</ul>
		</div>
	);
};

const createTestQueryClient = () =>
	new QueryClient({
		defaultOptions: {
			queries: {
				retry: false,
			},
		},
	});

describe("API統合テスト", () => {
	test("ジム一覧データを正常に取得できる", async () => {
		const queryClient = createTestQueryClient();

		const { container } = render(
			<QueryClientProvider client={queryClient}>
				<TestComponent />
			</QueryClientProvider>,
		);

		// ローディング状態の確認
		expect(getByText(container, "Loading...")).toBeInTheDocument();

		// データが取得されて表示されることを確認
		await waitFor(() => {
			expect(getByText(container, "ジム一覧")).toBeInTheDocument();
		});

		expect(getByText(container, "テストジム1")).toBeInTheDocument();
		expect(getByText(container, "テストジム2")).toBeInTheDocument();
	});

	test("APIエラー時にエラーメッセージが表示される", async () => {
		// エラーレスポンスを返すハンドラーに一時的に変更
		server.use(
			http.get("/api/gyms", () => {
				return new HttpResponse(null, {
					status: 500,
					statusText: "Internal Server Error",
				});
			}),
		);

		const queryClient = createTestQueryClient();

		const { container } = render(
			<QueryClientProvider client={queryClient}>
				<TestComponent />
			</QueryClientProvider>,
		);

		// エラーメッセージが表示されることを確認
		await waitFor(() => {
			expect(getByText(container, /Error:/)).toBeInTheDocument();
		});
	});

	test("ヘルスチェックAPIが正常に動作する", async () => {
		const response = await fetch("/api/health");
		const data = (await response.json()) as any;

		expect(response.ok).toBe(true);
		expect(data).toHaveProperty("status", "ok");
		expect(data).toHaveProperty("timestamp");
	});

	test("特定ジムの詳細データを取得できる", async () => {
		const response = await fetch("/api/gyms/1");
		const data = (await response.json()) as any;

		expect(response.ok).toBe(true);
		expect(data.data).toHaveProperty("id", "1");
		expect(data.data).toHaveProperty("name", "テストジム1");
		expect(data.data).toHaveProperty("email", "test1@example.com");
	});

	test("新しいジムを作成できる", async () => {
		const newGym = {
			name: "新しいジム",
			description: "新規作成されたジムです",
			address: "東京都港区3-3-3",
			phone: "03-3456-7890",
			email: "new@example.com",
		};

		const response = await fetch("/api/gyms", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(newGym),
		});

		const data = (await response.json()) as any;

		expect(response.status).toBe(201);
		expect(data.data).toHaveProperty("id", "3");
		expect(data.data).toHaveProperty("name", "新しいジム");
		expect(data.data).toHaveProperty("createdAt");
		expect(data.data).toHaveProperty("updatedAt");
	});
});

// @ts-expect-error - vitest provides this property
if (import.meta.vitest) {
	// @ts-expect-error - vitest provides this property
	const { test, expect } = import.meta.vitest;

	test("MSW統合テストが正しく設定されている", () => {
		expect(server).toBeDefined();
		expect(TestComponent).toBeDefined();
		expect(createTestQueryClient).toBeDefined();
	});
}
