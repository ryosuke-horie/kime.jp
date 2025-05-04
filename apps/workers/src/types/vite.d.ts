// Viteとプラグインの型定義
declare module "node:path" {
  export function resolve(...paths: string[]): string;
  export function join(...paths: string[]): string;
  export function dirname(path: string): string;
  export function basename(path: string, ext?: string): string;
  export function extname(path: string): string;
  export function isAbsolute(path: string): boolean;
  export function relative(from: string, to: string): string;
  export function parse(path: string): {
    root: string;
    dir: string;
    base: string;
    ext: string;
    name: string;
  };
  export function format(pathObject: {
    root?: string;
    dir?: string;
    base?: string;
    ext?: string;
    name?: string;
  }): string;
}

declare module "vite" {
  export function defineConfig(config: any): any;
}

declare module "@cloudflare/vite-plugin" {
  export default function cloudflarePlugin(options?: {
    wrangler?: object;
    entrypoint?: string;
    cfPagesPlugin?: boolean;
  }): any;
}

declare module "@hono/vite-build/cloudflare-workers" {
  export default function honoCloudflareWorkersPlugin(options?: {
    entry?: string;
    outDir?: string;
    minify?: boolean;
    external?: string[];
  }): any;
}

declare module "vitest/config" {
  export function defineConfig(config: any): any;
}