/**
 * テスト用のプロバイダーセットアップユーティリティ
 * Reactコンポーネントテストで必要なプロバイダーを統合的に提供
 */
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type RenderOptions, renderHook, render as rtlRender } from "@testing-library/react";
import type * as React from "react";

// テスト用QueryClientの作成
const createTestQueryClient = () =>
	new QueryClient({
		defaultOptions: {
			queries: {
				retry: false,
				staleTime: 0,
				gcTime: 0,
			},
			mutations: {
				retry: false,
			},
		},
	});

// Next.js App Routerのモック
const mockRouter = {
	push: () => {},
	replace: () => {},
	back: () => {},
	forward: () => {},
	refresh: () => {},
	prefetch: () => {},
};

const mockPathname = "/";
const mockSearchParams = new URLSearchParams();

// プロバイダーコンポーネント
interface AllProvidersProps {
	children: React.ReactNode;
	queryClient?: QueryClient;
}

function AllProviders({ children, queryClient }: AllProvidersProps) {
	const client = queryClient || createTestQueryClient();

	return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

// カスタムrender関数
interface CustomRenderOptions extends Omit<RenderOptions, "wrapper"> {
	queryClient?: QueryClient;
}

const customRender = (ui: React.ReactElement, options: CustomRenderOptions = {}) => {
	const { queryClient, ...renderOptions } = options;

	const Wrapper = ({ children }: { children: React.ReactNode }) => (
		<AllProviders queryClient={queryClient}>{children}</AllProviders>
	);

	return rtlRender(ui, { wrapper: Wrapper, ...renderOptions });
};

// フック用のrender関数
export const renderHookWithProviders = <T, TProps = any>(
	hook: (props: TProps) => T,
	options: {
		queryClient?: QueryClient;
		initialProps?: TProps;
	} = {},
) => {
	const { queryClient, initialProps } = options;
	const client = queryClient || createTestQueryClient();

	const wrapper = ({ children }: { children: React.ReactNode }) => (
		<QueryClientProvider client={client}>{children}</QueryClientProvider>
	);

	return renderHook(hook, { wrapper, initialProps });
};

// 標準のReact Testing Libraryのqueryを使用した安定したユーティリティ関数
export const getByTestId = (container: HTMLElement, testId: string) => {
	const element = container.querySelector(`[data-testid="${testId}"]`) as HTMLElement;
	if (!element) {
		// デバッグ情報を提供
		const allTestIds = Array.from(container.querySelectorAll("[data-testid]"))
			.map((el) => el.getAttribute("data-testid"))
			.filter(Boolean);

		throw new Error(
			`Unable to find element with testId: ${testId}\nAvailable testIds: ${allTestIds.join(", ")}\nContainer HTML: ${container.innerHTML}`,
		);
	}
	return element;
};

export const getByText = (container: HTMLElement, text: string | RegExp) => {
	const elements = Array.from(container.querySelectorAll("*")).filter((el) => {
		const textContent = el.textContent;
		if (typeof text === "string") {
			return textContent?.includes(text);
		}
		return text.test(textContent || "");
	});
	if (elements.length === 0) {
		throw new Error(
			`Unable to find element with text: ${text}\nContainer HTML: ${container.innerHTML}`,
		);
	}
	return elements[0] as HTMLElement;
};

// React Testing LibraryのwaitForを使用した安定した非同期要素取得
export const waitForTestId = async (container: HTMLElement, testId: string, timeout = 5000) => {
	const { waitFor } = await import("@testing-library/react");

	let element: HTMLElement | null = null;

	await waitFor(
		() => {
			element = container.querySelector(`[data-testid="${testId}"]`) as HTMLElement;
			if (!element) {
				throw new Error(`Element with testId "${testId}" not found`);
			}
			return element;
		},
		{ timeout },
	);

	if (!element) {
		throw new Error(`Element with testId "${testId}" not found after ${timeout}ms`);
	}
	return element;
};

// re-export everything
export * from "@testing-library/react";
export { customRender as render };
export { createTestQueryClient, mockRouter, mockPathname, mockSearchParams };

// @ts-expect-error - vitest provides this property
if (import.meta.vitest) {
	// @ts-expect-error - vitest provides this property
	const { test, expect } = import.meta.vitest;

	test("テストユーティリティが正しく設定されている", () => {
		const client = createTestQueryClient();
		expect(client).toBeDefined();
		expect(mockRouter).toBeDefined();
		expect(getByTestId).toBeDefined();
		expect(renderHookWithProviders).toBeDefined();
	});
}
