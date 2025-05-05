import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import LineProvider from "next-auth/providers/line";

export const authOptions = {
	// シークレットキー（本番環境では環境変数から取得）
	secret: process.env.NEXTAUTH_SECRET || "your-development-secret-key",

	// 認証プロバイダーの設定
	providers: [
		// Google認証
		GoogleProvider({
			clientId: process.env.GOOGLE_CLIENT_ID || "",
			clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
			authorization: {
				params: {
					prompt: "consent",
					access_type: "offline",
					response_type: "code",
				},
			},
		}),

		// LINE認証
		LineProvider({
			clientId: process.env.LINE_CLIENT_ID || "",
			clientSecret: process.env.LINE_CLIENT_SECRET || "",
		}),

		// カスタム認証（メール/パスワード）も提供
		CredentialsProvider({
			name: "メールアドレス",
			credentials: {
				email: {
					label: "メールアドレス",
					type: "email",
					placeholder: "mail@example.com",
				},
				password: { label: "パスワード", type: "password" },
			},
			async authorize(credentials) {
				// 実際のアプリでは、ここでDBからユーザーを検証するロジックを実装
				// この例では、特定のメールとパスワードを受け入れる単純な例
				if (
					credentials?.email === process.env.ADMIN_EMAIL &&
					credentials?.password === process.env.ADMIN_PASSWORD
				) {
					return {
						id: "1",
						name: "管理者",
						email: credentials.email,
						role: "admin",
					};
				}
				return null;
			},
		}),
	],

	// セッション設定
	session: {
		strategy: "jwt",
		maxAge: 30 * 24 * 60 * 60, // 30日間
	},

	// ページカスタマイズ
	pages: {
		signIn: "/auth/signin",
		signOut: "/auth/signout",
		error: "/auth/error",
	},

	// コールバック
	callbacks: {
		async session({ session, token }) {
			// セッションにユーザー情報を追加
			if (token && session.user) {
				session.user.id = token.sub as string;
				session.user.role = token.role as string;
			}
			return session;
		},
		async jwt({ token, user }) {
			// 初回サインイン時にユーザー情報をトークンに含める
			if (user) {
				token.role = user.role;
			}
			return token;
		},
	},
};

// Auth.js Route Handler
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
