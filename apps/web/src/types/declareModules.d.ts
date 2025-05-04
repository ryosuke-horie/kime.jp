// React JSX型定義
declare namespace React {
  type ReactNode = string | number | boolean | null | undefined | ReactElement | ReactFragment | ReactPortal | (() => ReactNode);
  interface ReactElement<P = any, T extends string | JSXElementConstructor<any> = string | JSXElementConstructor<any>> {
    type: T;
    props: P;
    key: Key | null;
  }
  type Key = string | number;
  type ReactFragment = Iterable<ReactNode>;
  interface ReactPortal extends ReactElement {
    key: Key | null;
    children: ReactNode;
  }
  type JSXElementConstructor<P> = ((props: P) => ReactElement<any, any> | null) | (new (props: P) => Component<any, any>);
  class Component<P, S> {
    props: Readonly<P>;
    state: Readonly<S>;
    setState(state: S | ((prevState: Readonly<S>, props: Readonly<P>) => S | null)): void;
    forceUpdate(): void;
    render(): ReactNode;
  }
}

// JSX名前空間
declare namespace JSX {
  interface Element extends React.ReactElement<any, any> { }
  interface IntrinsicElements {
    // HTML要素の型定義
    [elemName: string]: any;
  }
}

// Next.js関連の型定義
declare module "next" {
  export type Metadata = {
    title?: string;
    description?: string;
    [key: string]: any;
  };
  export type NextConfig = {
    [key: string]: any;
  };
}

// next/font関連の型定義
declare module "next/font/google" {
  export type FontOptions = {
    variable?: string;
    subsets?: string[];
    [key: string]: any;
  };
  export function Geist(options: FontOptions): { variable: string; className: string };
  export function Geist_Mono(options: FontOptions): { variable: string; className: string };
}

// Vitest関連の型定義
declare module "vitest" {
  export function describe(name: string, fn: () => void): void;
  export function it(name: string, fn: () => void): void;
  export function test(name: string, fn: () => void): void;
  export function expect<T>(actual: T): any;
  export function beforeAll(fn: () => void): void;
  export function afterAll(fn: () => void): void;
}

// OpenNext Cloudflare関連の型定義
declare module "@opennextjs/cloudflare" {
  export function defineCloudflareConfig(config: any): any;
  export function initOpenNextCloudflareForDev(): void;
}