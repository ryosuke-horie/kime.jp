"use client";

import { SessionProvider } from "next-auth/react";
import type { ReactNode } from "react";

// このプロバイダーは、アプリケーション全体で認証状態を管理します
export default function AuthProvider({ children }: { children: ReactNode }) {
	return <SessionProvider>{children}</SessionProvider>;
}
