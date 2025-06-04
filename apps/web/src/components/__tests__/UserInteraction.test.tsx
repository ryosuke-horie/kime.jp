/**
 * ユーザーインタラクションテストの実装例
 * Issue #360 フロントエンドテスト環境構築の実装例
 */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { describe, expect, it } from "vitest";

// テスト用のカウンターコンポーネント
function Counter() {
	const [count, setCount] = React.useState(0);

	return (
		<div>
			<p data-testid="count">カウント: {count}</p>
			<button data-testid="increment" onClick={() => setCount(count + 1)} type="button">
				増加
			</button>
			<button data-testid="decrement" onClick={() => setCount(count - 1)} type="button">
				減少
			</button>
			<button data-testid="reset" onClick={() => setCount(0)} type="button">
				リセット
			</button>
		</div>
	);
}

// テスト用のトグルコンポーネント
function Toggle() {
	const [isOn, setIsOn] = React.useState(false);

	return (
		<div>
			<p data-testid="status">状態: {isOn ? "ON" : "OFF"}</p>
			<button data-testid="toggle" onClick={() => setIsOn(!isOn)} type="button">
				{isOn ? "OFF" : "ON"}に切り替え
			</button>
		</div>
	);
}

// テスト用の入力フォームコンポーネント
function InputForm() {
	const [name, setName] = React.useState("");
	const [email, setEmail] = React.useState("");
	const [submitted, setSubmitted] = React.useState(false);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		setSubmitted(true);
	};

	return (
		<form onSubmit={handleSubmit} data-testid="form">
			<div>
				<label htmlFor="name">名前:</label>
				<input
					id="name"
					type="text"
					value={name}
					onChange={(e) => setName(e.target.value)}
					data-testid="name-input"
				/>
			</div>
			<div>
				<label htmlFor="email">メール:</label>
				<input
					id="email"
					type="email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					data-testid="email-input"
				/>
			</div>
			<button type="submit" data-testid="submit">
				送信
			</button>
			{submitted && (
				<div data-testid="success">
					送信完了: {name} ({email})
				</div>
			)}
		</form>
	);
}

describe("ユーザーインタラクションテスト", () => {
	describe("Counter", () => {
		it("ボタンクリックでカウントが増減する", async () => {
			const user = userEvent.setup();
			const { container } = render(<Counter />);
			
			// DOMの存在確認とデバッグ
			expect(container).toBeTruthy();
			if (!container.innerHTML) {
				console.error("Container is empty:", container);
				console.error("Document body:", document.body.innerHTML);
			}
			expect(container.innerHTML).toBeTruthy();

			// 初期状態の確認
			expect(screen.getByTestId("count")).toHaveTextContent("カウント: 0");

			// 増加ボタンのクリック
			await user.click(screen.getByTestId("increment"));
			expect(screen.getByTestId("count")).toHaveTextContent("カウント: 1");

			await user.click(screen.getByTestId("increment"));
			expect(screen.getByTestId("count")).toHaveTextContent("カウント: 2");

			// 減少ボタンのクリック
			await user.click(screen.getByTestId("decrement"));
			expect(screen.getByTestId("count")).toHaveTextContent("カウント: 1");

			// リセットボタンのクリック
			await user.click(screen.getByTestId("reset"));
			expect(screen.getByTestId("count")).toHaveTextContent("カウント: 0");
		});

		it("複数回の操作が正しく動作する", async () => {
			const user = userEvent.setup();
			render(<Counter />);

			// 複数回のクリック
			await user.click(screen.getByTestId("increment"));
			await user.click(screen.getByTestId("increment"));
			await user.click(screen.getByTestId("increment"));
			expect(screen.getByTestId("count")).toHaveTextContent("カウント: 3");

			await user.click(screen.getByTestId("decrement"));
			await user.click(screen.getByTestId("decrement"));
			expect(screen.getByTestId("count")).toHaveTextContent("カウント: 1");
		});
	});

	describe("Toggle", () => {
		it("トグルボタンで状態が切り替わる", async () => {
			const user = userEvent.setup();
			render(<Toggle />);

			// 初期状態の確認
			expect(screen.getByTestId("status")).toHaveTextContent("状態: OFF");
			expect(screen.getByTestId("toggle")).toHaveTextContent("ONに切り替え");

			// ONに切り替え
			await user.click(screen.getByTestId("toggle"));
			expect(screen.getByTestId("status")).toHaveTextContent("状態: ON");
			expect(screen.getByTestId("toggle")).toHaveTextContent("OFFに切り替え");

			// OFFに切り替え
			await user.click(screen.getByTestId("toggle"));
			expect(screen.getByTestId("status")).toHaveTextContent("状態: OFF");
			expect(screen.getByTestId("toggle")).toHaveTextContent("ONに切り替え");
		});
	});

	describe("InputForm", () => {
		it("フォーム入力と送信が正しく動作する", async () => {
			const user = userEvent.setup();
			render(<InputForm />);

			// フォーム要素の存在確認
			expect(screen.getByTestId("name-input")).toBeInTheDocument();
			expect(screen.getByTestId("email-input")).toBeInTheDocument();
			expect(screen.getByTestId("submit")).toBeInTheDocument();

			// 入力操作
			await user.type(screen.getByTestId("name-input"), "田中太郎");
			await user.type(screen.getByTestId("email-input"), "tanaka@example.com");

			// 入力値の確認
			expect(screen.getByTestId("name-input")).toHaveValue("田中太郎");
			expect(screen.getByTestId("email-input")).toHaveValue("tanaka@example.com");

			// フォーム送信
			await user.click(screen.getByTestId("submit"));

			// 送信結果の確認
			expect(screen.getByTestId("success")).toHaveTextContent(
				"送信完了: 田中太郎 (tanaka@example.com)",
			);
		});

		it("部分的な入力でも送信できる", async () => {
			const user = userEvent.setup();
			render(<InputForm />);

			// 名前のみ入力
			await user.type(screen.getByTestId("name-input"), "佐藤");
			await user.click(screen.getByTestId("submit"));

			expect(screen.getByTestId("success")).toHaveTextContent("送信完了: 佐藤 ()");
		});

		it("キーボード操作でフォーム送信できる", async () => {
			const user = userEvent.setup();
			render(<InputForm />);

			await user.type(screen.getByTestId("name-input"), "キーボードユーザー");
			await user.type(screen.getByTestId("email-input"), "keyboard@example.com");

			// Enterキーでフォーム送信
			await user.keyboard("{Enter}");

			expect(screen.getByTestId("success")).toHaveTextContent(
				"送信完了: キーボードユーザー (keyboard@example.com)",
			);
		});
	});

	describe("複合的なユーザーインタラクション", () => {
		it("複数のコンポーネントが同時に動作する", async () => {
			const user = userEvent.setup();
			render(
				<div>
					<Counter />
					<Toggle />
				</div>,
			);

			// カウンターの操作
			await user.click(screen.getByTestId("increment"));
			expect(screen.getByTestId("count")).toHaveTextContent("カウント: 1");

			// トグルの操作
			await user.click(screen.getByTestId("toggle"));
			expect(screen.getByTestId("status")).toHaveTextContent("状態: ON");

			// カウンターの追加操作
			await user.click(screen.getByTestId("increment"));
			expect(screen.getByTestId("count")).toHaveTextContent("カウント: 2");

			// 両方の状態が独立して管理されていることを確認
			expect(screen.getByTestId("status")).toHaveTextContent("状態: ON");
		});
	});
});
