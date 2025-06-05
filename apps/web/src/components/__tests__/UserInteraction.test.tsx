/**
 * ユーザーインタラクションテストの実装例
 * Issue #360 フロントエンドテスト環境構築の実装例
 */
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { describe, expect, it } from "vitest";
import { getByTestId, render, waitForTestId } from "../../test/test-utils";

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
			console.log("Container HTML:", container.innerHTML);
			console.log("Document ready state:", document.readyState);
			console.log("Window object exists:", typeof window !== "undefined");

			if (!container.innerHTML) {
				console.error("Container is empty:", container);
				console.error("Document body:", document.body.innerHTML);
				// React DevToolsがある場合の追加情報
				console.error("React render attempt");
			}

			// waitForも試す
			await new Promise((resolve) => setTimeout(resolve, 100));
			expect(container.innerHTML).toBeTruthy();

			// container から直接クエリ（CI環境でのscreen問題回避）
			expect(getByTestId(container, "count")).toHaveTextContent("カウント: 0");

			// 増加ボタンのクリック
			await user.click(getByTestId(container, "increment"));
			expect(getByTestId(container, "count")).toHaveTextContent("カウント: 1");

			await user.click(getByTestId(container, "increment"));
			expect(getByTestId(container, "count")).toHaveTextContent("カウント: 2");

			// 減少ボタンのクリック
			await user.click(getByTestId(container, "decrement"));
			expect(getByTestId(container, "count")).toHaveTextContent("カウント: 1");

			// リセットボタンのクリック
			await user.click(getByTestId(container, "reset"));
			expect(getByTestId(container, "count")).toHaveTextContent("カウント: 0");
		});

		it("複数回の操作が正しく動作する", async () => {
			const user = userEvent.setup();
			const { container } = render(<Counter />);

			// 複数回のクリック
			await user.click(getByTestId(container, "increment"));
			await user.click(getByTestId(container, "increment"));
			await user.click(getByTestId(container, "increment"));
			expect(getByTestId(container, "count")).toHaveTextContent("カウント: 3");

			await user.click(getByTestId(container, "decrement"));
			await user.click(getByTestId(container, "decrement"));
			expect(getByTestId(container, "count")).toHaveTextContent("カウント: 1");
		});
	});

	describe("Toggle", () => {
		it("トグルボタンで状態が切り替わる", async () => {
			const user = userEvent.setup();
			const { container } = render(<Toggle />);

			// 初期状態の確認
			expect(getByTestId(container, "status")).toHaveTextContent("状態: OFF");
			expect(getByTestId(container, "toggle")).toHaveTextContent("ONに切り替え");

			// ONに切り替え
			await user.click(getByTestId(container, "toggle"));
			expect(getByTestId(container, "status")).toHaveTextContent("状態: ON");
			expect(getByTestId(container, "toggle")).toHaveTextContent("OFFに切り替え");

			// OFFに切り替え
			await user.click(getByTestId(container, "toggle"));
			expect(getByTestId(container, "status")).toHaveTextContent("状態: OFF");
			expect(getByTestId(container, "toggle")).toHaveTextContent("ONに切り替え");
		});
	});

	describe("InputForm", () => {
		it("フォーム入力と送信が正しく動作する", async () => {
			const user = userEvent.setup();
			const { container } = render(<InputForm />);

			// フォーム要素の存在確認
			expect(getByTestId(container, "name-input")).toBeInTheDocument();
			expect(getByTestId(container, "email-input")).toBeInTheDocument();
			expect(getByTestId(container, "submit")).toBeInTheDocument();

			// 入力操作（CI環境での安定性向上）
			const nameInput = getByTestId(container, "name-input") as HTMLInputElement;
			const emailInput = getByTestId(container, "email-input") as HTMLInputElement;

			// より確実な入力方法
			await user.clear(nameInput);
			await user.type(nameInput, "John Doe");
			await new Promise((resolve) => setTimeout(resolve, 100)); // CI環境での待機

			await user.clear(emailInput);
			await user.type(emailInput, "john.doe@example.com");
			await new Promise((resolve) => setTimeout(resolve, 100)); // CI環境での待機

			// 入力値の確認
			expect(nameInput).toHaveValue("John Doe");
			expect(emailInput).toHaveValue("john.doe@example.com");

			// フォーム送信
			await user.click(getByTestId(container, "submit"));

			// 送信結果の確認（非同期要素の待機）
			const successElement = await waitForTestId(container, "success");
			expect(successElement).toHaveTextContent("送信完了: John Doe (john.doe@example.com)");
		});

		it("部分的な入力でも送信できる", async () => {
			const user = userEvent.setup();
			const { container } = render(<InputForm />);

			// 名前のみ入力（CI環境での安定性向上）
			const nameInput = getByTestId(container, "name-input") as HTMLInputElement;
			await user.clear(nameInput);
			await user.type(nameInput, "Sato");
			await new Promise((resolve) => setTimeout(resolve, 100)); // CI環境での待機

			// 入力値確認
			expect(nameInput).toHaveValue("Sato");

			await user.click(getByTestId(container, "submit"));

			// 送信結果の確認（非同期要素の待機）
			const successElement = await waitForTestId(container, "success");
			expect(successElement).toHaveTextContent("送信完了: Sato ()");
		});

		it("キーボード操作でフォーム送信できる", async () => {
			const user = userEvent.setup();
			const { container } = render(<InputForm />);

			// 入力操作（CI環境での安定性向上）
			const nameInput = getByTestId(container, "name-input") as HTMLInputElement;
			const emailInput = getByTestId(container, "email-input") as HTMLInputElement;

			await user.clear(nameInput);
			await user.type(nameInput, "Keyboard User");
			await new Promise((resolve) => setTimeout(resolve, 100));

			await user.clear(emailInput);
			await user.type(emailInput, "keyboard@example.com");
			await new Promise((resolve) => setTimeout(resolve, 100));

			// 入力値確認
			expect(nameInput).toHaveValue("Keyboard User");
			expect(emailInput).toHaveValue("keyboard@example.com");

			// Enterキーでフォーム送信
			await user.keyboard("{Enter}");

			// 送信結果の確認（非同期要素の待機）
			const successElement = await waitForTestId(container, "success");
			expect(successElement).toHaveTextContent("送信完了: Keyboard User (keyboard@example.com)");
		});
	});

	describe("複合的なユーザーインタラクション", () => {
		it("複数のコンポーネントが同時に動作する", async () => {
			const user = userEvent.setup();
			const { container } = render(
				<div>
					<Counter />
					<Toggle />
				</div>,
			);

			// カウンターの操作
			await user.click(getByTestId(container, "increment"));
			expect(getByTestId(container, "count")).toHaveTextContent("カウント: 1");

			// トグルの操作
			await user.click(getByTestId(container, "toggle"));
			expect(getByTestId(container, "status")).toHaveTextContent("状態: ON");

			// カウンターの追加操作
			await user.click(getByTestId(container, "increment"));
			expect(getByTestId(container, "count")).toHaveTextContent("カウント: 2");

			// 両方の状態が独立して管理されていることを確認
			expect(getByTestId(container, "status")).toHaveTextContent("状態: ON");
		});
	});
});
