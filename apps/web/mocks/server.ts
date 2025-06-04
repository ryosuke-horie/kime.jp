/**
 * MSW テストサーバーセットアップ
 * Node.js環境（テスト環境）でAPIリクエストをモッキングするためのサーバー設定
 */
import { setupServer } from "msw/node";
import { handlers } from "./handlers";

// MSWサーバーをセットアップ
export const server = setupServer(...handlers);
