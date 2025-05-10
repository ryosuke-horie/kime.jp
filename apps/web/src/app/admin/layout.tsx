import type { ReactNode } from "react";

interface AdminLayoutProps {
	children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
	// Cloudflare Accessで保護されるため、認証は不要
	// ここではレイアウトのみを提供する
	return <>{children}</>;
}
