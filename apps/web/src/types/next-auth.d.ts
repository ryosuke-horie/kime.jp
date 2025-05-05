import "next-auth";

// next-authの型を拡張して、userにroleプロパティを追加
declare module "next-auth" {
	interface Session {
		user: {
			id: string;
			name?: string | null;
			email?: string | null;
			image?: string | null;
			role?: string | null;
		};
	}

	interface User {
		id: string;
		name?: string | null;
		email?: string | null;
		image?: string | null;
		role?: string | null;
	}
}

// next-authのJWTに型を追加
declare module "next-auth/jwt" {
	interface JWT {
		id: string;
		role?: string | null;
	}
}
