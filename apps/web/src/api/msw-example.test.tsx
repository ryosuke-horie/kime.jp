import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
/**
 * MSWを使用したAPIテストの実装例
 * Issue #360 フロントエンドテスト環境構築の実装例
 */
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { describe, expect, it } from "vitest";

// テスト用のAPIフックコンポーネント
function UserList() {
	const {
		data: users,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["users"],
		queryFn: async () => {
			const response = await fetch("/api/users");
			if (!response.ok) {
				throw new Error("Failed to fetch users");
			}
			return response.json();
		},
	});

	if (isLoading) return <div data-testid="loading">読み込み中...</div>;
	if (error) return <div data-testid="error">エラーが発生しました</div>;

	return (
		<div data-testid="user-list">
			<h2>ユーザー一覧</h2>
			{users?.map((user: any) => (
				<div key={user.id} data-testid={`user-${user.id}`}>
					<span>{user.name}</span>
					<span>{user.email}</span>
				</div>
			))}
		</div>
	);
}

// テスト用のユーザー作成フォームコンポーネント
function CreateUserForm() {
	const [name, setName] = React.useState("");
	const [email, setEmail] = React.useState("");
	const [isSubmitting, setIsSubmitting] = React.useState(false);
	const [result, setResult] = React.useState<any>(null);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);

		try {
			const response = await fetch("/api/users", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ name, email }),
			});

			const data = await response.json();
			setResult(data);
		} catch (error) {
			setResult({ error: "Failed to create user" });
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} data-testid="create-user-form">
			<input
				type="text"
				placeholder="名前"
				value={name}
				onChange={(e) => setName(e.target.value)}
				data-testid="name-input"
			/>
			<input
				type="email"
				placeholder="メール"
				value={email}
				onChange={(e) => setEmail(e.target.value)}
				data-testid="email-input"
			/>
			<button type="submit" disabled={isSubmitting} data-testid="submit-button">
				{isSubmitting ? "作成中..." : "ユーザー作成"}
			</button>
			{result && (
				<div data-testid="result">{result.error ? result.error : `作成成功: ${result.name}`}</div>
			)}
		</form>
	);
}

// テストユーティリティ: React Query Provider付きでコンポーネントをレンダリング
function renderWithQueryClient(component: React.ReactElement) {
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: { retry: false },
			mutations: { retry: false },
		},
	});

	return render(<QueryClientProvider client={queryClient}>{component}</QueryClientProvider>);
}

describe("MSWを使用したAPIテスト", () => {
	describe("UserList", () => {
		it("ユーザー一覧を正しく表示する", async () => {
			renderWithQueryClient(<UserList />);

			// ローディング状態の確認
			expect(screen.getByTestId("loading")).toBeInTheDocument();

			// MSWがモックレスポンスを返すまで待機
			await waitFor(() => {
				expect(screen.getByTestId("user-list")).toBeInTheDocument();
			});

			// ユーザー情報の確認（mocks/handlers.tsで定義したデータ）
			expect(screen.getByText("田中太郎")).toBeInTheDocument();
			expect(screen.getByText("tanaka@example.com")).toBeInTheDocument();
			expect(screen.getByText("佐藤花子")).toBeInTheDocument();
			expect(screen.getByText("sato@example.com")).toBeInTheDocument();
		});
	});

	describe("CreateUserForm", () => {
		it("新しいユーザーを作成する", async () => {
			const user = userEvent.setup();
			render(<CreateUserForm />);

			// フォーム入力
			await user.type(screen.getByTestId("name-input"), "新規ユーザー");
			await user.type(screen.getByTestId("email-input"), "new@example.com");

			// フォーム送信
			await user.click(screen.getByTestId("submit-button"));

			// 送信中状態の確認
			expect(screen.getByText("作成中...")).toBeInTheDocument();

			// MSWのレスポンスを待機して結果を確認
			await waitFor(() => {
				expect(screen.getByTestId("result")).toBeInTheDocument();
			});

			expect(screen.getByText("作成成功: 新規ユーザー")).toBeInTheDocument();
		});
	});

	describe("認証テスト", () => {
		it("正しい認証情報でログインに成功する", async () => {
			const response = await fetch("/api/auth/signin", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email: "test@example.com", password: "password" }),
			});

			const data = await response.json();

			expect(response.ok).toBe(true);
			expect(data.user.email).toBe("test@example.com");
			expect(data.token).toBe("mock-jwt-token");
		});

		it("間違った認証情報でログインに失敗する", async () => {
			const response = await fetch("/api/auth/signin", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email: "wrong@example.com", password: "wrong" }),
			});

			const data = await response.json();

			expect(response.ok).toBe(false);
			expect(response.status).toBe(401);
			expect(data.error).toBe("Invalid credentials");
		});
	});

	describe("エラーハンドリング", () => {
		it("サーバーエラーを正しく処理する", async () => {
			const response = await fetch("/api/error");
			const data = await response.json();

			expect(response.ok).toBe(false);
			expect(response.status).toBe(500);
			expect(data.error).toBe("Internal Server Error");
		});
	});
});
