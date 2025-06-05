/**
 * Textareaコンポーネントのテスト
 * IME入力時の背景色問題修正の検証を含む
 */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Textarea } from "./textarea";

describe("Textarea", () => {
	it("基本的なレンダリングが動作する", () => {
		render(<Textarea />);
		const textarea = screen.getByRole("textbox");
		expect(textarea).toBeInTheDocument();
	});

	it("プレースホルダーが正しく表示される", () => {
		render(<Textarea placeholder="テストプレースホルダー" />);
		const textarea = screen.getByPlaceholderText("テストプレースホルダー");
		expect(textarea).toBeInTheDocument();
	});

	it("data-slotが正しく設定される", () => {
		render(<Textarea data-testid="test-textarea" />);
		const textarea = screen.getByTestId("test-textarea");
		expect(textarea).toHaveAttribute("data-slot", "textarea");
	});

	it("カスタムclassNameが追加される", () => {
		render(<Textarea className="custom-class" data-testid="custom-textarea" />);
		const textarea = screen.getByTestId("custom-textarea");
		expect(textarea).toHaveClass("custom-class");
	});

	it("disabled状態が正しく動作する", () => {
		render(<Textarea disabled data-testid="disabled-textarea" />);
		const textarea = screen.getByTestId("disabled-textarea");
		expect(textarea).toBeDisabled();
	});

	it("ユーザー入力が正しく処理される", async () => {
		const user = userEvent.setup();
		render(<Textarea data-testid="user-textarea" />);
		const textarea = screen.getByTestId("user-textarea") as HTMLTextAreaElement;
		
		await user.type(textarea, "複数行の\nテスト入力");
		expect(textarea.value).toBe("複数行の\nテスト入力");
	});

	it("rowsプロパティが正しく設定される", () => {
		render(<Textarea rows={5} data-testid="rows-textarea" />);
		const textarea = screen.getByTestId("rows-textarea");
		expect(textarea).toHaveAttribute("rows", "5");
	});

	it("IME対応のCSSクラスが含まれている", () => {
		render(<Textarea data-testid="ime-textarea" />);
		const textarea = screen.getByTestId("ime-textarea");
		
		// IME関連のCSSクラスが含まれていることを確認
		const classList = textarea.className;
		expect(classList).toContain("ime-mode:auto");
		expect(classList).toContain("[ime-mode:active]:bg-transparent");
		expect(classList).toContain("[composition-start]:bg-transparent");
		expect(classList).toContain("[composition-update]:bg-transparent");
		expect(classList).toContain("[composition-end]:bg-transparent");
	});

	it("フォーカス時のスタイルクラスが適用される", () => {
		render(<Textarea data-testid="focus-textarea" />);
		const textarea = screen.getByTestId("focus-textarea");
		
		expect(textarea).toHaveClass("focus-visible:border-ring");
		expect(textarea).toHaveClass("focus-visible:ring-ring/50");
	});

	it("バリデーションエラー時のaria-invalid属性が動作する", () => {
		render(<Textarea aria-invalid="true" data-testid="invalid-textarea" />);
		const textarea = screen.getByTestId("invalid-textarea");
		
		expect(textarea).toHaveAttribute("aria-invalid", "true");
		expect(textarea).toHaveClass("aria-invalid:border-destructive");
	});

	it("最小の高さが設定されている", () => {
		render(<Textarea data-testid="height-textarea" />);
		const textarea = screen.getByTestId("height-textarea");
		
		expect(textarea).toHaveClass("min-h-16");
	});

	it("field-sizing-contentクラスが適用される", () => {
		render(<Textarea data-testid="field-sizing-textarea" />);
		const textarea = screen.getByTestId("field-sizing-textarea");
		
		expect(textarea).toHaveClass("field-sizing-content");
	});
});

if (import.meta.vitest) {
	const { test, expect } = import.meta.vitest;
	
	test("IME入力時の背景色が透明に設定されている", () => {
		render(<Textarea data-testid="ime-test" />);
		const textarea = screen.getByTestId("ime-test");
		
		// IME関連のクラスが正しく設定されていることを確認
		const classList = textarea.className;
		expect(classList).toContain("[ime-mode:active]:bg-transparent");
		expect(classList).toContain("[composition-start]:bg-transparent");
		expect(classList).toContain("[composition-update]:bg-transparent");
		expect(classList).toContain("[composition-end]:bg-transparent");
	});
}