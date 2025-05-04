// Next.js metadata interface declaration
declare module "next/dist/lib/metadata/types/metadata-interface.js" {
  export interface Metadata {
    title?: string | { absolute?: string; template?: string; default?: string };
    description?: string;
    applicationName?: string;
    authors?: Array<{ name: string; url?: string }> | { name: string; url?: string };
    generator?: string;
    keywords?: string | Array<string>;
    referrer?: "no-referrer" | "origin" | "no-referrer-when-downgrade" | "origin-when-cross-origin" | "same-origin" | "strict-origin" | "strict-origin-when-cross-origin" | "unsafe-url";
    themeColor?: string;
    colorScheme?: "light" | "dark" | "only light" | "only dark" | "light dark" | "dark light" | "normal";
    viewport?: string;
    creator?: string;
    publisher?: string;
    robots?: string | { index?: boolean; follow?: boolean; nocache?: boolean; googleBot?: string | { index?: boolean; follow?: boolean; noimageindex?: boolean; "max-video-preview"?: number | string; "max-image-preview"?: "standard" | "large" | "none"; "max-snippet"?: number; unavailable_after?: string; } };
    openGraph?: {
      title?: string;
      description?: string;
      url?: string;
      siteName?: string;
      images?: string | { url: string; alt?: string; width?: string | number; height?: string | number; }[];
      locale?: string;
      type?: "website" | "article" | "book" | "profile" | "music.song" | "music.album" | "music.playlist" | "music.radio_station" | "video.movie" | "video.episode" | "video.tv_show" | "video.other";
    };
    twitter?: {
      card?: "summary" | "summary_large_image" | "app" | "player";
      title?: string;
      description?: string;
      creator?: string;
      images?: string | { url: string; alt?: string; }[];
    };
    verification?: {
      google?: string | string[];
      yahoo?: string | string[];
      yandex?: string | string[];
      me?: string | string[];
      other?: Record<string, string | string[]>;
    };
    itunes?: {
      appId: string;
      appArgument?: string;
    };
    appleWebApp?: {
      capable?: boolean;
      title?: string;
      statusBarStyle?: "default" | "black" | "black-translucent";
    };
    alternates?: {
      canonical?: string;
      languages?: Record<string, string>;
      media?: Record<string, string>;
      types?: Record<string, string>;
    };
    bookmarks?: string[];
    category?: string;
    classification?: string;
    [key: string]: any;
  }

  export interface ResolvingMetadata {
    [key: string]: any;
  }

  export interface ResolvingViewport {
    [key: string]: any;
  }
}