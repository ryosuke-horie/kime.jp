/**
 * Inputコンポーネントのテスト
 * IME入力時の背景色問題修正の検証を含む
 */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Input } from "./input";

describe("Input", () => {
	it("コンポーネントが正常にレンダリングされる", () => {
		const { container } = render(<Input data-testid="test-input" />);
		expect(container.firstChild).toBeInTheDocument();
		
		// Debug: DOMの内容を確認
		console.log("Rendered HTML:", container.innerHTML);
	});

	it("基本的なinput要素として動作する", () => {
		render(<Input />);
		const input = screen.getByRole("textbox");
		expect(input).toBeInTheDocument();
		expect(input.tagName).toBe("INPUT");
	});

	it("プレースホルダーが正しく表示される", () => {
		render(<Input placeholder="テストプレースホルダー" />);
		const input = screen.getByPlaceholderText("テストプレースホルダー");
		expect(input).toBeInTheDocument();
	});

	it("data-slotが正しく設定される", () => {
		render(<Input data-testid="test-input" />);
		const input = screen.getByTestId("test-input");
		expect(input).toHaveAttribute("data-slot", "input");
	});

	it("IME対応のCSSクラスが含まれている", () => {
		render(<Input data-testid="ime-input" />);
		const input = screen.getByTestId("ime-input");
		
		// IME関連のCSSクラスが含まれていることを確認
		const classList = input.className;
		expect(classList).toContain("ime-mode:auto");
		expect(classList).toContain("[ime-mode:active]:bg-transparent");
	});
});

if (import.meta.vitest) {
	const { test, expect } = import.meta.vitest;
	
	test("IME入力時の背景色設定をテスト", () => {
		render(<Input data-testid="ime-test" />);
		const input = screen.getByTestId("ime-test");
		
		// IME関連のクラスが正しく設定されていることを確認
		const classList = input.className;
		expect(classList).toContain("[composition-start]:bg-transparent");
		expect(classList).toContain("[composition-update]:bg-transparent"); 
		expect(classList).toContain("[composition-end]:bg-transparent");
	});
}