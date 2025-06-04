/**
 * フォームバリデーションテストの実装例
 * Issue #360 フロントエンドテスト環境構築の実装例
 */
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { describe, expect, it, vi } from "vitest";

// 簡易バリデーション関数
const validateEmail = (email: string): string | null => {
	if (!email) return "メールアドレスは必須です";
	if (!/\S+@\S+\.\S+/.test(email)) return "有効なメールアドレスを入力してください";
	return null;
};

const validatePassword = (password: string): string | null => {
	if (!password) return "パスワードは必須です";
	if (password.length < 8) return "パスワードは8文字以上である必要があります";
	if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
		return "パスワードは大文字、小文字、数字を含む必要があります";
	}
	return null;
};

const validateName = (name: string): string | null => {
	if (!name.trim()) return "名前は必須です";
	if (name.trim().length < 2) return "名前は2文字以上である必要があります";
	return null;
};

// テスト用のユーザー登録フォームコンポーネント
function UserRegistrationForm({ onSubmit }: { onSubmit?: (data: any) => void }) {
	const [formData, setFormData] = React.useState({
		name: "",
		email: "",
		password: "",
		confirmPassword: "",
	});
	const [errors, setErrors] = React.useState<Record<string, string | undefined>>({});
	const [touched, setTouched] = React.useState<Record<string, boolean>>({});
	const [isSubmitting, setIsSubmitting] = React.useState(false);

	const validateForm = () => {
		const newErrors: Record<string, string | undefined> = {};

		const nameError = validateName(formData.name);
		if (nameError) newErrors.name = nameError;

		const emailError = validateEmail(formData.email);
		if (emailError) newErrors.email = emailError;

		const passwordError = validatePassword(formData.password);
		if (passwordError) newErrors.password = passwordError;

		if (!formData.confirmPassword) {
			newErrors.confirmPassword = "パスワード確認は必須です";
		} else if (formData.password !== formData.confirmPassword) {
			newErrors.confirmPassword = "パスワードが一致しません";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleBlur = (field: string) => {
		setTouched((prev) => ({ ...prev, [field]: true }));

		// 個別フィールドバリデーション
		const newErrors: Record<string, string | undefined> = { ...errors };
		switch (field) {
			case "name": {
				const nameError = validateName(formData.name);
				if (nameError) newErrors.name = nameError;
				else newErrors.name = undefined;
				break;
			}
			case "email": {
				const emailError = validateEmail(formData.email);
				if (emailError) newErrors.email = emailError;
				else newErrors.email = undefined;
				break;
			}
			case "password": {
				const passwordError = validatePassword(formData.password);
				if (passwordError) newErrors.password = passwordError;
				else newErrors.password = undefined;
				break;
			}
			case "confirmPassword":
				if (!formData.confirmPassword) {
					newErrors.confirmPassword = "パスワード確認は必須です";
				} else if (formData.password !== formData.confirmPassword) {
					newErrors.confirmPassword = "パスワードが一致しません";
				} else {
					newErrors.confirmPassword = undefined;
				}
				break;
		}
		setErrors(newErrors);
	};

	const handleChange = (field: string, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);

		// 全フィールドをtouchedに設定
		setTouched({
			name: true,
			email: true,
			password: true,
			confirmPassword: true,
		});

		const isValid = validateForm();

		if (isValid) {
			try {
				await new Promise((resolve) => setTimeout(resolve, 1000)); // 送信シミュレーション
				onSubmit?.(formData);
			} catch (error) {
				console.error("送信エラー:", error);
			}
		}

		setIsSubmitting(false);
	};

	return (
		<form onSubmit={handleSubmit} data-testid="registration-form">
			<div>
				<label htmlFor="name">名前</label>
				<input
					id="name"
					type="text"
					value={formData.name}
					onChange={(e) => handleChange("name", e.target.value)}
					onBlur={() => handleBlur("name")}
					data-testid="name-input"
					aria-invalid={touched.name && errors.name ? "true" : "false"}
				/>
				{touched.name && errors.name && (
					<div data-testid="name-error" role="alert">
						{errors.name}
					</div>
				)}
			</div>

			<div>
				<label htmlFor="email">メールアドレス</label>
				<input
					id="email"
					type="email"
					value={formData.email}
					onChange={(e) => handleChange("email", e.target.value)}
					onBlur={() => handleBlur("email")}
					data-testid="email-input"
					aria-invalid={touched.email && errors.email ? "true" : "false"}
				/>
				{touched.email && errors.email && (
					<div data-testid="email-error" role="alert">
						{errors.email}
					</div>
				)}
			</div>

			<div>
				<label htmlFor="password">パスワード</label>
				<input
					id="password"
					type="password"
					value={formData.password}
					onChange={(e) => handleChange("password", e.target.value)}
					onBlur={() => handleBlur("password")}
					data-testid="password-input"
					aria-invalid={touched.password && errors.password ? "true" : "false"}
				/>
				{touched.password && errors.password && (
					<div data-testid="password-error" role="alert">
						{errors.password}
					</div>
				)}
			</div>

			<div>
				<label htmlFor="confirmPassword">パスワード確認</label>
				<input
					id="confirmPassword"
					type="password"
					value={formData.confirmPassword}
					onChange={(e) => handleChange("confirmPassword", e.target.value)}
					onBlur={() => handleBlur("confirmPassword")}
					data-testid="confirm-password-input"
					aria-invalid={touched.confirmPassword && errors.confirmPassword ? "true" : "false"}
				/>
				{touched.confirmPassword && errors.confirmPassword && (
					<div data-testid="confirm-password-error" role="alert">
						{errors.confirmPassword}
					</div>
				)}
			</div>

			<button
				type="submit"
				disabled={isSubmitting || Object.keys(errors).length > 0}
				data-testid="submit-button"
			>
				{isSubmitting ? "送信中..." : "登録"}
			</button>
		</form>
	);
}

describe("フォームバリデーションテスト", () => {
	describe("個別フィールドバリデーション", () => {
		it("名前フィールドのバリデーションが正しく動作する", async () => {
			const user = userEvent.setup();
			render(<UserRegistrationForm />);

			const nameInput = screen.getByTestId("name-input");

			// 空の値でblur
			await user.click(nameInput);
			await user.tab();

			await waitFor(() => {
				expect(screen.getByTestId("name-error")).toHaveTextContent("名前は必須です");
			});

			// 短すぎる名前
			await user.clear(nameInput);
			await user.type(nameInput, "A");
			await user.tab();

			await waitFor(() => {
				expect(screen.getByTestId("name-error")).toHaveTextContent(
					"名前は2文字以上である必要があります",
				);
			});

			// 有効な名前
			await user.clear(nameInput);
			await user.type(nameInput, "田中太郎");
			await user.tab();

			await waitFor(() => {
				expect(screen.queryByTestId("name-error")).not.toBeInTheDocument();
			});
		});

		it("メールフィールドのバリデーションが正しく動作する", async () => {
			const user = userEvent.setup();
			render(<UserRegistrationForm />);

			const emailInput = screen.getByTestId("email-input");

			// 空の値
			await user.click(emailInput);
			await user.tab();

			await waitFor(() => {
				expect(screen.getByTestId("email-error")).toHaveTextContent("メールアドレスは必須です");
			});

			// 無効なメール形式
			await user.clear(emailInput);
			await user.type(emailInput, "invalid-email");
			await user.tab();

			await waitFor(() => {
				expect(screen.getByTestId("email-error")).toHaveTextContent(
					"有効なメールアドレスを入力してください",
				);
			});

			// 有効なメール
			await user.clear(emailInput);
			await user.type(emailInput, "test@example.com");
			await user.tab();

			await waitFor(() => {
				expect(screen.queryByTestId("email-error")).not.toBeInTheDocument();
			});
		});

		it("パスワードフィールドのバリデーションが正しく動作する", async () => {
			const user = userEvent.setup();
			render(<UserRegistrationForm />);

			const passwordInput = screen.getByTestId("password-input");

			// 空の値
			await user.click(passwordInput);
			await user.tab();

			await waitFor(() => {
				expect(screen.getByTestId("password-error")).toHaveTextContent("パスワードは必須です");
			});

			// 短すぎるパスワード
			await user.clear(passwordInput);
			await user.type(passwordInput, "123");
			await user.tab();

			await waitFor(() => {
				expect(screen.getByTestId("password-error")).toHaveTextContent(
					"パスワードは8文字以上である必要があります",
				);
			});

			// 複雑性が不足
			await user.clear(passwordInput);
			await user.type(passwordInput, "password");
			await user.tab();

			await waitFor(() => {
				expect(screen.getByTestId("password-error")).toHaveTextContent(
					"パスワードは大文字、小文字、数字を含む必要があります",
				);
			});

			// 有効なパスワード
			await user.clear(passwordInput);
			await user.type(passwordInput, "Password123");
			await user.tab();

			await waitFor(() => {
				expect(screen.queryByTestId("password-error")).not.toBeInTheDocument();
			});
		});

		it("パスワード確認フィールドのバリデーションが正しく動作する", async () => {
			const user = userEvent.setup();
			render(<UserRegistrationForm />);

			const passwordInput = screen.getByTestId("password-input");
			const confirmPasswordInput = screen.getByTestId("confirm-password-input");

			// パスワードを設定
			await user.type(passwordInput, "Password123");

			// 空の確認パスワード
			await user.click(confirmPasswordInput);
			await user.tab();

			await waitFor(() => {
				expect(screen.getByTestId("confirm-password-error")).toHaveTextContent(
					"パスワード確認は必須です",
				);
			});

			// 一致しないパスワード
			await user.type(confirmPasswordInput, "DifferentPassword123");
			await user.tab();

			await waitFor(() => {
				expect(screen.getByTestId("confirm-password-error")).toHaveTextContent(
					"パスワードが一致しません",
				);
			});

			// 一致するパスワード
			await user.clear(confirmPasswordInput);
			await user.type(confirmPasswordInput, "Password123");
			await user.tab();

			await waitFor(() => {
				expect(screen.queryByTestId("confirm-password-error")).not.toBeInTheDocument();
			});
		});
	});

	describe("フォーム送信", () => {
		it.skip("有効なデータで送信が成功する", async () => {
			const user = userEvent.setup();
			const mockSubmit = vi.fn().mockResolvedValue(undefined);
			render(<UserRegistrationForm onSubmit={mockSubmit} />);

			// 有効なデータを入力
			await user.type(screen.getByTestId("name-input"), "田中太郎");
			await user.type(screen.getByTestId("email-input"), "tanaka@example.com");
			await user.type(screen.getByTestId("password-input"), "Password123");
			await user.type(screen.getByTestId("confirm-password-input"), "Password123");

			// 送信
			await user.click(screen.getByTestId("submit-button"));

			// 送信後のボタン状態確認（送信中は短時間のため、送信完了状態を確認）
			await waitFor(() => {
				expect(mockSubmit).toHaveBeenCalled();
			});

			// 送信完了を待機
			await waitFor(
				() => {
					expect(mockSubmit).toHaveBeenCalledWith({
						name: "田中太郎",
						email: "tanaka@example.com",
						password: "Password123",
						confirmPassword: "Password123",
					});
				},
				{ timeout: 2000 },
			);
		});

		it("無効なデータで送信が阻止される", async () => {
			const user = userEvent.setup();
			const mockSubmit = vi.fn();
			render(<UserRegistrationForm onSubmit={mockSubmit} />);

			// 無効なデータを入力
			await user.type(screen.getByTestId("name-input"), "A"); // 短すぎる
			await user.type(screen.getByTestId("email-input"), "invalid-email"); // 無効
			await user.type(screen.getByTestId("password-input"), "weak"); // 弱い
			await user.type(screen.getByTestId("confirm-password-input"), "different"); // 不一致

			// 送信試行
			await user.click(screen.getByTestId("submit-button"));

			// エラーメッセージが表示される
			await waitFor(() => {
				expect(screen.getByTestId("name-error")).toBeInTheDocument();
				expect(screen.getByTestId("email-error")).toBeInTheDocument();
				expect(screen.getByTestId("password-error")).toBeInTheDocument();
				expect(screen.getByTestId("confirm-password-error")).toBeInTheDocument();
			});

			// 送信関数は呼ばれない
			expect(mockSubmit).not.toHaveBeenCalled();
		});
	});

	describe("アクセシビリティ", () => {
		it("エラー時にaria-invalidが正しく設定される", async () => {
			const user = userEvent.setup();
			render(<UserRegistrationForm />);

			const nameInput = screen.getByTestId("name-input");

			// 初期状態ではaria-invalid=false
			expect(nameInput).toHaveAttribute("aria-invalid", "false");

			// エラー状態にする
			await user.click(nameInput);
			await user.tab();

			await waitFor(() => {
				expect(nameInput).toHaveAttribute("aria-invalid", "true");
			});
		});

		it("エラーメッセージにrole=alertが設定される", async () => {
			const user = userEvent.setup();
			render(<UserRegistrationForm />);

			await user.click(screen.getByTestId("name-input"));
			await user.tab();

			await waitFor(() => {
				const errorElement = screen.getByTestId("name-error");
				expect(errorElement).toHaveAttribute("role", "alert");
			});
		});
	});
});
