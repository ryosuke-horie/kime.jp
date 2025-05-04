"use client";

// @ts-ignore
import { ThemeProvider as NextThemesProvider } from "next-themes";
// @ts-ignore
import type { ThemeProviderProps } from "next-themes/dist/types";
import * as React from "react";

// @ts-ignore
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
	return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
