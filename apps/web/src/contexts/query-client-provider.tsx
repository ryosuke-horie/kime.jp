"use client";

import {
	QueryClient,
	QueryClientProvider as TanstackQueryClientProvider,
} from "@tanstack/react-query";
import { useState } from "react";

export function QueryClientProvider({ children }: { children: React.ReactNode }) {
	const [queryClient] = useState(
		() =>
			new QueryClient({
				defaultOptions: {
					queries: {
						// デフォルトの設定
						refetchOnWindowFocus: false, // ウィンドウにフォーカスが戻った時に再取得しない
						retry: 1, // エラー時の再試行回数
						staleTime: 1000 * 60 * 5, // 5分間はデータを新鮮とみなす
					},
				},
			}),
	);

	return <TanstackQueryClientProvider client={queryClient}>{children}</TanstackQueryClientProvider>;
}
