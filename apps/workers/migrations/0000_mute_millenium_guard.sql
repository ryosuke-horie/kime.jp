CREATE TABLE `admin_accounts` (
	`admin_id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`name` text NOT NULL,
	`role` text DEFAULT 'staff' NOT NULL,
	`password_hash` text,
	`is_active` integer DEFAULT 1 NOT NULL,
	`last_login_at` text,
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP',
	`updated_at` text DEFAULT 'CURRENT_TIMESTAMP'
);
--> statement-breakpoint
CREATE UNIQUE INDEX `admin_accounts_email_unique` ON `admin_accounts` (`email`);--> statement-breakpoint
CREATE TABLE `admin_gym_relationships` (
	`admin_id` text NOT NULL,
	`gym_id` text NOT NULL,
	`role` text DEFAULT 'staff' NOT NULL,
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP',
	PRIMARY KEY(`admin_id`, `gym_id`),
	FOREIGN KEY (`admin_id`) REFERENCES `admin_accounts`(`admin_id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`gym_id`) REFERENCES `gyms`(`gym_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `admin_oauth_accounts` (
	`oauth_id` text PRIMARY KEY NOT NULL,
	`admin_id` text NOT NULL,
	`provider` text NOT NULL,
	`provider_account_id` text NOT NULL,
	`refresh_token` text,
	`access_token` text,
	`expires_at` integer,
	`token_type` text,
	`scope` text,
	`id_token` text,
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP',
	`updated_at` text DEFAULT 'CURRENT_TIMESTAMP',
	FOREIGN KEY (`admin_id`) REFERENCES `admin_accounts`(`admin_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `ai_conversations` (
	`conversation_id` text PRIMARY KEY NOT NULL,
	`gym_id` text NOT NULL,
	`member_id` text,
	`booking_id` text,
	`started_at` text DEFAULT 'CURRENT_TIMESTAMP',
	`last_msg_at` text,
	FOREIGN KEY (`gym_id`) REFERENCES `gyms`(`gym_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`member_id`) REFERENCES `members`(`member_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`booking_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `ai_messages` (
	`msg_id` text PRIMARY KEY NOT NULL,
	`conversation_id` text NOT NULL,
	`sender` text NOT NULL,
	`staff_id` text,
	`channel` text NOT NULL,
	`content` text,
	`ai_model` text,
	`tokens_in` integer,
	`tokens_out` integer,
	`confidence` text,
	`sent_at` text DEFAULT 'CURRENT_TIMESTAMP',
	FOREIGN KEY (`conversation_id`) REFERENCES `ai_conversations`(`conversation_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`staff_id`) REFERENCES `staff`(`staff_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `ai_outcomes` (
	`outcome_id` text PRIMARY KEY NOT NULL,
	`msg_id` text NOT NULL,
	`auto_replied` integer DEFAULT 0,
	`escalated` integer DEFAULT 0,
	`override_by_staff` integer DEFAULT 0,
	`reason` text,
	`latency_ms` integer,
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP',
	FOREIGN KEY (`msg_id`) REFERENCES `ai_messages`(`msg_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `bookings` (
	`booking_id` text PRIMARY KEY NOT NULL,
	`gym_id` text NOT NULL,
	`class_id` text NOT NULL,
	`member_id` text NOT NULL,
	`status` text DEFAULT 'reserved' NOT NULL,
	`booked_at` text DEFAULT 'CURRENT_TIMESTAMP',
	FOREIGN KEY (`gym_id`) REFERENCES `gyms`(`gym_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`class_id`) REFERENCES `classes`(`class_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`member_id`) REFERENCES `members`(`member_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `checkins` (
	`checkin_id` text PRIMARY KEY NOT NULL,
	`gym_id` text NOT NULL,
	`member_id` text NOT NULL,
	`scanned_at` text DEFAULT 'CURRENT_TIMESTAMP',
	`source` text,
	FOREIGN KEY (`gym_id`) REFERENCES `gyms`(`gym_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`member_id`) REFERENCES `members`(`member_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `class_staff` (
	`class_id` text NOT NULL,
	`staff_id` text NOT NULL,
	PRIMARY KEY(`class_id`, `staff_id`),
	FOREIGN KEY (`class_id`) REFERENCES `classes`(`class_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`staff_id`) REFERENCES `staff`(`staff_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `classes` (
	`class_id` text PRIMARY KEY NOT NULL,
	`gym_id` text NOT NULL,
	`title` text NOT NULL,
	`starts_at` text NOT NULL,
	`ends_at` text NOT NULL,
	`capacity` integer NOT NULL,
	`instructor` text,
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP',
	`updated_at` text DEFAULT 'CURRENT_TIMESTAMP',
	FOREIGN KEY (`gym_id`) REFERENCES `gyms`(`gym_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `consents` (
	`consent_id` text PRIMARY KEY NOT NULL,
	`member_id` text NOT NULL,
	`document_type` text NOT NULL,
	`version` text NOT NULL,
	`signed_at` text DEFAULT 'CURRENT_TIMESTAMP',
	`signature_hash` text,
	FOREIGN KEY (`member_id`) REFERENCES `members`(`member_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `gyms` (
	`gym_id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`owner_email` text NOT NULL,
	`phone_number` text,
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP',
	`updated_at` text DEFAULT 'CURRENT_TIMESTAMP'
);
--> statement-breakpoint
CREATE TABLE `members` (
	`member_id` text PRIMARY KEY NOT NULL,
	`gym_id` text NOT NULL,
	`name` text NOT NULL,
	`email` text,
	`phone` text,
	`status` text DEFAULT 'active' NOT NULL,
	`joined_at` text,
	`policy_version` text,
	`policy_signed_at` text,
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP',
	`updated_at` text DEFAULT 'CURRENT_TIMESTAMP',
	FOREIGN KEY (`gym_id`) REFERENCES `gyms`(`gym_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`order_id` text PRIMARY KEY NOT NULL,
	`gym_id` text NOT NULL,
	`member_id` text,
	`stripe_session_id` text,
	`stripe_payment_intent` text,
	`amount` integer,
	`currency` text DEFAULT 'JPY',
	`status` text DEFAULT 'pending' NOT NULL,
	`paid_at` text,
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP',
	`updated_at` text DEFAULT 'CURRENT_TIMESTAMP',
	FOREIGN KEY (`gym_id`) REFERENCES `gyms`(`gym_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`member_id`) REFERENCES `members`(`member_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `payments_stripe_payment_intent_unique` ON `payments` (`stripe_payment_intent`);--> statement-breakpoint
CREATE TABLE `shifts` (
	`shift_id` text PRIMARY KEY NOT NULL,
	`gym_id` text NOT NULL,
	`staff_id` text NOT NULL,
	`starts_at` text NOT NULL,
	`ends_at` text NOT NULL,
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP',
	FOREIGN KEY (`gym_id`) REFERENCES `gyms`(`gym_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`staff_id`) REFERENCES `staff`(`staff_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `staff` (
	`staff_id` text PRIMARY KEY NOT NULL,
	`gym_id` text NOT NULL,
	`name` text NOT NULL,
	`email` text,
	`role` text DEFAULT 'reception' NOT NULL,
	`active` integer DEFAULT 1 NOT NULL,
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP',
	FOREIGN KEY (`gym_id`) REFERENCES `gyms`(`gym_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `suspension_policies` (
	`gym_id` text PRIMARY KEY NOT NULL,
	`fee_type` text DEFAULT 'free' NOT NULL,
	`fee_value` integer,
	`min_term_months` integer DEFAULT 1,
	`note` text,
	`updated_at` text DEFAULT 'CURRENT_TIMESTAMP',
	FOREIGN KEY (`gym_id`) REFERENCES `gyms`(`gym_id`) ON UPDATE no action ON DELETE no action
);
