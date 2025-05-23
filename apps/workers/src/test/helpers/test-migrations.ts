/**
 * テスト環境用の簡潔なマイグレーション定義
 * D1互換のクリーンなSQL
 */

export interface Migration {
	id: string;
	sql: string;
}

// テスト環境用の簡潔なマイグレーション
export const migrations: Migration[] = [
	{
		id: "0000_initial_tables",
		sql: `
CREATE TABLE gyms (
	gym_id text PRIMARY KEY NOT NULL,
	name text NOT NULL,
	owner_email text NOT NULL,
	password_hash text,
	created_at text,
	updated_at text
);
--> statement-breakpoint
CREATE TABLE admin_accounts (
	admin_id text PRIMARY KEY NOT NULL,
	email text NOT NULL,
	name text NOT NULL,
	role text DEFAULT 'staff' NOT NULL,
	password_hash text,
	is_active integer DEFAULT 1 NOT NULL,
	last_login_at text,
	created_at text,
	updated_at text
);
--> statement-breakpoint
CREATE UNIQUE INDEX admin_accounts_email_unique ON admin_accounts (email);
--> statement-breakpoint
CREATE TABLE admin_gym_relationships (
	admin_id text NOT NULL,
	gym_id text NOT NULL,
	role text DEFAULT 'staff' NOT NULL,
	created_at text,
	PRIMARY KEY(admin_id, gym_id),
	FOREIGN KEY (admin_id) REFERENCES admin_accounts(admin_id) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (gym_id) REFERENCES gyms(gym_id) ON UPDATE no action ON DELETE cascade
);
`,
	},
];