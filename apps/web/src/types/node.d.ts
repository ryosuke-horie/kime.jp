// Node.js型定義
declare interface Process {
	env: {
		[key: string]: string | undefined;
		NODE_ENV: "development" | "production" | "test";
	};
}

declare const process: Process;
declare const __dirname: string;
declare const __filename: string;
