import { z } from "zod";

/**
 * ログインリクエストのバリデーションスキーマ
 */
export const loginRequestSchema = z.object({
	email: z
		.string()
		.email("有効なメールアドレスを入力してください")
		.min(1, "メールアドレスは必須です"),
	password: z
		.string()
		.min(8, "パスワードは8文字以上である必要があります")
		.max(100, "パスワードは100文字以内で入力してください"),
});

/**
 * ログインリクエストの型（Zodから推論）
 */
export type LoginRequestType = z.infer<typeof loginRequestSchema>;
