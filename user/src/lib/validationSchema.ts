// validationSchema.ts

import * as Yup from "yup";

export const signupSchema = Yup.object().shape({
	email: Yup.string()
		.email("有効なメールアドレスを入力してください")
		.required("メールアドレスは必須です"),
	name: Yup.string()
		.min(2, "名前は2文字以上で入力してください")
		.max(50, "名前は50文字以内で入力してください")
		.required("名前は必須です"),
	password: Yup.string()
		.min(8, "パスワードは8文字以上で入力してください")
		.matches(/[a-z]/, "パスワードには小文字を含めてください")
		.matches(/[A-Z]/, "パスワードには大文字を含めてください")
		.matches(/\d/, "パスワードには数字を含めてください")
		.required("パスワードは必須です"),
	passwordConfirmation: Yup.string()
		.oneOf([Yup.ref("password")], "パスワードが一致しません")
		.required("パスワード確認は必須です"),
	image: Yup.mixed().required("プロフィール画像は必須です"),
	phone: Yup.string()
		.matches(
			/^[0-9-]{10,15}$/,
			"有効な電話番号を入力してください（例: 090-1234-5678）",
		)
		.required("電話番号は必須です"),
});

// Yup の型推論を利用
export type SignupFormInputs = Yup.InferType<typeof signupSchema>;
