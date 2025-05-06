-- 外部認証（Google・LINE）をサポートするための管理者アカウント用テーブル
CREATE TABLE `admin_accounts` (
    `admin_id` text PRIMARY KEY NOT NULL,
    `email` text NOT NULL,
    `name` text NOT NULL,
    `role` text DEFAULT 'staff' NOT NULL, -- 'admin', 'staff' など
    `password_hash` text, -- パスワード認証用（ハッシュ化されたパスワード）
    `is_active` integer DEFAULT 1 NOT NULL,
    `last_login_at` text,
    `created_at` text DEFAULT 'CURRENT_TIMESTAMP',
    `updated_at` text DEFAULT 'CURRENT_TIMESTAMP'
);
--> statement-breakpoint

-- 外部認証プロバイダーとの連携用テーブル
CREATE TABLE `admin_oauth_accounts` (
    `oauth_id` text PRIMARY KEY NOT NULL,
    `admin_id` text NOT NULL,
    `provider` text NOT NULL, -- 'google', 'line'
    `provider_account_id` text NOT NULL,
    `refresh_token` text,
    `access_token` text,
    `expires_at` integer,
    `token_type` text,
    `scope` text,
    `id_token` text,
    `created_at` text DEFAULT 'CURRENT_TIMESTAMP',
    `updated_at` text DEFAULT 'CURRENT_TIMESTAMP',
    FOREIGN KEY (`admin_id`) REFERENCES `admin_accounts`(`admin_id`) ON UPDATE no action ON DELETE CASCADE
);
--> statement-breakpoint

-- 管理者とジムの関連付けテーブル
CREATE TABLE `admin_gym_relationships` (
    `admin_id` text NOT NULL,
    `gym_id` text NOT NULL,
    `role` text DEFAULT 'staff' NOT NULL, -- 'owner', 'manager', 'staff'
    `created_at` text DEFAULT 'CURRENT_TIMESTAMP',
    PRIMARY KEY(`admin_id`, `gym_id`),
    FOREIGN KEY (`admin_id`) REFERENCES `admin_accounts`(`admin_id`) ON UPDATE no action ON DELETE CASCADE,
    FOREIGN KEY (`gym_id`) REFERENCES `gyms`(`gym_id`) ON UPDATE no action ON DELETE CASCADE
);
--> statement-breakpoint

-- インデックス作成
CREATE UNIQUE INDEX `admin_accounts_email_unique` ON `admin_accounts` (`email`);
CREATE UNIQUE INDEX `admin_oauth_accounts_provider_provider_account_id_unique` ON `admin_oauth_accounts` (`provider`, `provider_account_id`);