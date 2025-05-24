import { GymAuthProvider } from "@/contexts/gym-auth-provider";
import type { ReactNode } from "react";

interface GymLayoutProps {
	children: ReactNode;
}

/**
 * ジム向け機能のレイアウト
 *
 * ジム認証プロバイダーを適用し、ジム向け機能全体の
 * 認証状態を管理します。
 */
export default function GymLayout({ children }: GymLayoutProps) {
	return <GymAuthProvider>{children}</GymAuthProvider>;
}

/**
 * メタデータ設定
 */
export const metadata = {
	title: {
		template: "%s | Kime.jp - ジム管理",
		default: "Kime.jp - ジム管理システム",
	},
	description: "ジム運営者向けの管理システム",
};
