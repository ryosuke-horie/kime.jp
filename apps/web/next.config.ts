// NextConfigを直接インポートするのではなく、型のみを定義
type NextConfig = {
	/* config options here */
	[key: string]: any;
};

const nextConfig: NextConfig = {
	/* config options here */
};

export default nextConfig;

// 開発環境向けの設定
// @opennextjs/cloudflareの型定義がない場合は、any型として扱う
// added by create cloudflare to enable calling `getCloudflareContext()` in `next dev`
try {
	// 型エラーを回避するため、動的インポートを使用
	const { initOpenNextCloudflareForDev } = require("@opennextjs/cloudflare");
	initOpenNextCloudflareForDev();
} catch (error) {
	console.warn("@opennextjs/cloudflare is not available:", error);
}
