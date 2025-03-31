"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type SignupFormInputs, signupSchema } from "@/lib/validationSchema";
import { yupResolver } from "@hookform/resolvers/yup";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

// 必須アスタリスク用のコンポーネント
const RequiredAsterisk = () => (
	<span className="text-red-600" aria-hidden="true">
		*
	</span>
);

function SignupForm() {
	const [adminId, setAdminId] = useState("");
	const router = useRouter();
	const [imagePreview, setImagePreview] = useState<string | null>(null);
	const [successMessage, setSuccessMessage] = useState<string | null>(null);
	const {
		register,
		handleSubmit,
		formState: { errors, isValid, isSubmitting },
		setError: setFormError,
		clearErrors,
	} = useForm<SignupFormInputs>({
		resolver: yupResolver(signupSchema),
		mode: "onChange",
	});

	useEffect(() => {
		// 初回マウント時にadminIdを取得
		const searchParams = new URLSearchParams(window.location.search);
		const adminIdFromUrl = searchParams.get("adminId") ?? "";

		if (adminIdFromUrl) {
			// URLから取得できた場合、状態とローカルストレージに保存
			setAdminId(adminIdFromUrl);
			localStorage.setItem("adminId", adminIdFromUrl);
		} else {
			// ローカルストレージから取得
			const adminIdFromStorage = localStorage.getItem("adminId") ?? "";
			setAdminId(adminIdFromStorage);
		}
	}, []);

	// adminIdが存在しない場合のエラーメッセージ
	if (!adminId) {
		return (
			<div className="text-red-500 text-center">
				ジム・道場からの招待リンクを開いてください。
			</div>
		);
	}

	const onSubmit = async (data: SignupFormInputs) => {
		const apiUrl = process.env.NEXT_PUBLIC_API_URL;

		try {
			const formData = new FormData();
			formData.append("email", data.email);
			formData.append("name", data.name);
			formData.append("password", data.password);
			formData.append("password_confirmation", data.passwordConfirmation);
			formData.append("phone", data.phone);
			formData.append("admin_id", adminId);

			if (data.image) {
				const imageFile = (data.image as FileList)[0];
				formData.append("image", imageFile);
			}

			const response = await fetch(`${apiUrl}/api/user/signup`, {
				method: "POST",
				headers: {
					Accept: "application/json",
				},
				body: formData,
			});

			if (!response.ok) {
				const resData = await response.json();
				// エラーメッセージをユーザー向けにマッピング
				const errorMessage = mapApiErrorToUserMessage(resData);

				// エラーメッセージをフォームに設定
				setFormError("root", { type: "manual", message: errorMessage });
				throw new Error(errorMessage);
			}

			// 登録成功時の処理
			setSuccessMessage("登録が成功しました。");
			setTimeout(() => {
				router.push("/login");
			}, 500);
		} catch (err) {
			if (err instanceof Error) {
				// エラーメッセージをユーザー向けにマッピング（キャッチされたエラー）
				const errorMessage = mapErrorToUserMessage(err.message);
				// エラーメッセージをフォームに設定
				setFormError("root", { type: "manual", message: errorMessage });
			} else {
				setFormError("root", {
					type: "manual",
					message: "予期しないエラーが発生しました。再度お試しください。",
				});
			}
		}
	};

	/**
	 * APIからのエラーレスポンスをユーザー向けのメッセージにマッピングします。
	 * @param resData APIからのレスポンスデータ
	 * @returns ユーザー向けのエラーメッセージ
	 */
	const mapApiErrorToUserMessage = (resData: any): string => {
		// ここでresDataの構造に応じてエラーメッセージをマッピングします。
		// 例として、エラーメッセージに基づいてユーザー向けメッセージを設定します。
		if (resData.errorCode) {
			switch (resData.errorCode) {
				case "EMAIL_ALREADY_EXISTS":
					return "このメールアドレスは既に登録されています。";
				case "INVALID_PASSWORD":
					return "パスワードが無効です。8文字以上で入力してください。";
				// 他のエラーコードに応じたメッセージを追加
				default:
					return "登録に失敗しました。再度お試しください。";
			}
		}

		// エラーメッセージが特定のフィールドに関連している場合
		if (resData.message) {
			// 例: "email is already taken"
			if (resData.message.includes("email")) {
				return "このメールアドレスは既に使用されています。";
			}
			if (resData.message.includes("password")) {
				return "パスワードが無効です。8文字以上で入力してください。";
			}
			if (resData.message.includes("name")) {
				return "名前が無効です。";
			}
			if (resData.message.includes("phone")) {
				return "電話番号が無効です。正しい形式で入力してください。";
			}
			if (resData.message.includes("image")) {
				return "プロフィール画像のアップロードに失敗しました。";
			}
		}

		// それ以外のエラーの場合は一般的なメッセージを返す
		return "登録に失敗しました。再度お試しください。";
	};

	/**
	 * キャッチされたエラーメッセージをユーザー向けのメッセージにマッピングします。
	 * @param errorMessage キャッチされたエラーメッセージ
	 * @returns ユーザー向けのエラーメッセージ
	 */
	const mapErrorToUserMessage = (errorMessage: string): string => {
		// 技術的なエラーメッセージを含む場合は一般的なメッセージに置き換える
		const technicalKeywords = ["SQLState", "Error", "Exception", "StackTrace"];
		const containsTechnical = technicalKeywords.some((keyword) =>
			errorMessage.includes(keyword),
		);

		if (containsTechnical) {
			return "登録に失敗しました。再度お試しください。";
		}

		// 技術的なキーワードが含まれない場合はそのまま表示
		return errorMessage;
	};

	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			const reader = new FileReader();
			reader.onloadend = () => {
				setImagePreview(reader.result as string);
			};
			reader.readAsDataURL(file);
		} else {
			setImagePreview(null);
		}
	};

	if (!adminId) {
		return (
			<div className="text-red-500 text-center">
				ジム・道場からの招待リンクを開いてください。
			</div>
		);
	}

	return (
		<div className="mx-auto max-w-md space-y-6">
			<div className="space-y-2 text-center">
				<h1 className="text-3xl font-bold">会員登録</h1>
			</div>
			{successMessage && (
				<div className="text-green-500 text-center mb-4">{successMessage}</div>
			)}
			{errors.root?.message && (
				<div className="text-red-500 text-center mb-4">
					リクエストに失敗しました。お手数ですが、もう一度お試しください。
				</div>
			)}
			<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
				<div className="space-y-2">
					<Label htmlFor="name">
						名前（本名）
						<RequiredAsterisk />
					</Label>
					<Input
						id="name"
						placeholder="田中 太郎"
						aria-invalid={!!errors.name}
						aria-describedby={errors.name ? "name-error" : undefined}
						{...register("name")}
					/>
					<p className="text-sm text-gray-500">※本名を記載してください</p>
					{errors.name && (
						<p id="name-error" className="text-red-500 text-sm">
							{errors.name.message}
						</p>
					)}
				</div>
				<div className="space-y-2">
					<Label htmlFor="email">
						メールアドレス
						<RequiredAsterisk />
					</Label>
					<Input
						id="email"
						type="email"
						placeholder="example@email.com"
						aria-invalid={!!errors.email}
						aria-describedby={errors.email ? "email-error" : undefined}
						{...register("email")}
					/>
					{errors.email && (
						<p id="email-error" className="text-red-500 text-sm">
							{errors.email.message}
						</p>
					)}
				</div>
				<div className="space-y-2">
					<Label htmlFor="password">
						パスワード
						<RequiredAsterisk />
					</Label>
					<Input
						id="password"
						type="password"
						aria-invalid={!!errors.password}
						aria-describedby={errors.password ? "password-error" : undefined}
						{...register("password")}
					/>
					{errors.password && (
						<p id="password-error" className="text-red-500 text-sm">
							{errors.password.message}
						</p>
					)}
				</div>
				<div className="space-y-2">
					<Label htmlFor="passwordConfirmation">
						パスワード確認
						<RequiredAsterisk />
					</Label>
					<Input
						id="passwordConfirmation"
						type="password"
						aria-invalid={!!errors.passwordConfirmation}
						aria-describedby={
							errors.passwordConfirmation
								? "passwordConfirmation-error"
								: undefined
						}
						{...register("passwordConfirmation")}
					/>
					{errors.passwordConfirmation && (
						<p id="passwordConfirmation-error" className="text-red-500 text-sm">
							{errors.passwordConfirmation.message}
						</p>
					)}
				</div>
				<div className="space-y-2">
					<Label htmlFor="phone">
						電話番号
						<RequiredAsterisk />
					</Label>
					<Input
						id="phone"
						type="text"
						placeholder="090-1234-5678"
						aria-invalid={!!errors.phone}
						aria-describedby={errors.phone ? "phone-error" : undefined}
						{...register("phone")}
					/>
					{errors.phone && (
						<p id="phone-error" className="text-red-500 text-sm">
							{errors.phone.message}
						</p>
					)}
				</div>
				<div className="space-y-2">
					<Label htmlFor="image">
						プロフィール画像
						<RequiredAsterisk />
					</Label>
					<Input
						id="image"
						type="file"
						accept="image/*"
						aria-invalid={!!errors.image}
						aria-describedby={errors.image ? "image-error" : undefined}
						{...register("image", {
							onChange: (e) => {
								handleImageChange(e);
							},
						})}
					/>
					<p className="text-sm text-gray-500">
						※ご自身の顔が映っている写真をアップロードしてください
					</p>
					{imagePreview && (
						<div className="mt-2">
							<img
								src={imagePreview}
								alt="プロフィール画像プレビュー"
								width={100}
								height={100}
								className="rounded-full object-cover"
							/>
						</div>
					)}
					{errors.image && (
						<p id="image-error" className="text-red-500 text-sm">
							{errors.image.message as string}
						</p>
					)}
				</div>
				<Button
					type="submit"
					className={`w-full ${
						!isValid || isSubmitting ? "bg-gray-400 cursor-not-allowed" : ""
					}`}
					disabled={!isValid || isSubmitting}
				>
					{isSubmitting ? (
						<>
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							登録中...
						</>
					) : (
						"登録"
					)}
				</Button>
			</form>
		</div>
	);
}

export default function Page() {
	return (
		<main className="flex justify-center bg-gray-100 min-h-screen p-4 sm:p-6 md:p-8">
			<div className="w-full max-w-md">
				<SignupForm />
			</div>
		</main>
	);
}
