import { integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";

// ----------------------------------------------------------
// gyms - ジム情報
// ----------------------------------------------------------
export const gyms = sqliteTable("gyms", {
	gymId: text("gym_id").primaryKey(),
	name: text("name").notNull(),
	timezone: text("timezone").default("Asia/Tokyo"),
	ownerEmail: text("owner_email").notNull(),
	phoneNumber: text("phone_number"),
	plan: text("plan").notNull().default("basic"),
	createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
	updatedAt: text("updated_at").default("CURRENT_TIMESTAMP"),
});

// ----------------------------------------------------------
// members - 会員情報
// ----------------------------------------------------------
export const members = sqliteTable("members", {
	memberId: text("member_id").primaryKey(),
	gymId: text("gym_id")
		.notNull()
		.references(() => gyms.gymId),
	name: text("name").notNull(),
	email: text("email"),
	phone: text("phone"),
	status: text("status", { enum: ["active", "suspended", "withdrawn"] })
		.notNull()
		.default("active"),
	joinedAt: text("joined_at"),
	policyVersion: text("policy_version"),
	policySignedAt: text("policy_signed_at"),
	createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
	updatedAt: text("updated_at").default("CURRENT_TIMESTAMP"),
});

// ----------------------------------------------------------
// classes - クラス（授業）情報
// ----------------------------------------------------------
export const classes = sqliteTable("classes", {
	classId: text("class_id").primaryKey(),
	gymId: text("gym_id")
		.notNull()
		.references(() => gyms.gymId),
	title: text("title").notNull(),
	startsAt: text("starts_at").notNull(),
	endsAt: text("ends_at").notNull(),
	capacity: integer("capacity").notNull(),
	instructor: text("instructor"),
	createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
	updatedAt: text("updated_at").default("CURRENT_TIMESTAMP"),
});

// ----------------------------------------------------------
// bookings - 予約情報
// ----------------------------------------------------------
export const bookings = sqliteTable("bookings", {
	bookingId: text("booking_id").primaryKey(),
	gymId: text("gym_id")
		.notNull()
		.references(() => gyms.gymId),
	classId: text("class_id")
		.notNull()
		.references(() => classes.classId),
	memberId: text("member_id")
		.notNull()
		.references(() => members.memberId),
	status: text("status", {
		enum: ["reserved", "cancelled", "attended", "no_show"],
	})
		.notNull()
		.default("reserved"),
	bookedAt: text("booked_at").default("CURRENT_TIMESTAMP"),
});

// ----------------------------------------------------------
// checkins - 入退館ログ
// ----------------------------------------------------------
export const checkins = sqliteTable("checkins", {
	checkinId: text("checkin_id").primaryKey(),
	gymId: text("gym_id")
		.notNull()
		.references(() => gyms.gymId),
	memberId: text("member_id")
		.notNull()
		.references(() => members.memberId),
	scannedAt: text("scanned_at").default("CURRENT_TIMESTAMP"),
	source: text("source", { enum: ["qr", "nfc"] }),
});

// ----------------------------------------------------------
// staff / shifts - スタッフ情報と勤務スケジュール
// ----------------------------------------------------------
export const staff = sqliteTable("staff", {
	staffId: text("staff_id").primaryKey(),
	gymId: text("gym_id")
		.notNull()
		.references(() => gyms.gymId),
	name: text("name").notNull(),
	email: text("email"),
	role: text("role", { enum: ["admin", "reception"] })
		.notNull()
		.default("reception"),
	active: integer("active").notNull().default(1),
	createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
});

export const classStaff = sqliteTable(
	"class_staff",
	{
		classId: text("class_id")
			.notNull()
			.references(() => classes.classId),
		staffId: text("staff_id")
			.notNull()
			.references(() => staff.staffId),
	},
	(table) => {
		return {
			pk: primaryKey(table.classId, table.staffId),
		};
	},
);

export const shifts = sqliteTable("shifts", {
	shiftId: text("shift_id").primaryKey(),
	gymId: text("gym_id")
		.notNull()
		.references(() => gyms.gymId),
	staffId: text("staff_id")
		.notNull()
		.references(() => staff.staffId),
	startsAt: text("starts_at").notNull(),
	endsAt: text("ends_at").notNull(),
	createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
});

// ----------------------------------------------------------
// admin_accounts - 管理者アカウント（外部認証サポート）
// ----------------------------------------------------------
export const adminAccounts = sqliteTable("admin_accounts", {
	adminId: text("admin_id").primaryKey(),
	email: text("email").notNull().unique(),
	name: text("name").notNull(),
	role: text("role", { enum: ["admin", "staff"] })
		.notNull()
		.default("staff"),
	passwordHash: text("password_hash"),
	isActive: integer("is_active").notNull().default(1),
	lastLoginAt: text("last_login_at"),
	createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
	updatedAt: text("updated_at").default("CURRENT_TIMESTAMP"),
});

export const adminOauthAccounts = sqliteTable("admin_oauth_accounts", {
	oauthId: text("oauth_id").primaryKey(),
	adminId: text("admin_id")
		.notNull()
		.references(() => adminAccounts.adminId, { onDelete: "cascade" }),
	provider: text("provider", { enum: ["google", "line"] }).notNull(),
	providerAccountId: text("provider_account_id").notNull(),
	refreshToken: text("refresh_token"),
	accessToken: text("access_token"),
	expiresAt: integer("expires_at"),
	tokenType: text("token_type"),
	scope: text("scope"),
	idToken: text("id_token"),
	createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
	updatedAt: text("updated_at").default("CURRENT_TIMESTAMP"),
});

export const adminGymRelationships = sqliteTable(
	"admin_gym_relationships",
	{
		adminId: text("admin_id")
			.notNull()
			.references(() => adminAccounts.adminId, { onDelete: "cascade" }),
		gymId: text("gym_id")
			.notNull()
			.references(() => gyms.gymId, { onDelete: "cascade" }),
		role: text("role", { enum: ["owner", "manager", "staff"] })
			.notNull()
			.default("staff"),
		createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
	},
	(table) => {
		return {
			pk: primaryKey(table.adminId, table.gymId),
		};
	},
);

// ----------------------------------------------------------
// consents - 法的同意
// ----------------------------------------------------------
export const consents = sqliteTable("consents", {
	consentId: text("consent_id").primaryKey(),
	memberId: text("member_id")
		.notNull()
		.references(() => members.memberId),
	documentType: text("document_type", { enum: ["privacy", "tos"] }).notNull(),
	version: text("version").notNull(),
	signedAt: text("signed_at").default("CURRENT_TIMESTAMP"),
	signatureHash: text("signature_hash"),
});

// ----------------------------------------------------------
// AI conversation logging - AI会話ログ
// ----------------------------------------------------------
export const aiConversations = sqliteTable("ai_conversations", {
	conversationId: text("conversation_id").primaryKey(),
	gymId: text("gym_id")
		.notNull()
		.references(() => gyms.gymId),
	memberId: text("member_id").references(() => members.memberId),
	bookingId: text("booking_id").references(() => bookings.bookingId),
	startedAt: text("started_at").default("CURRENT_TIMESTAMP"),
	lastMsgAt: text("last_msg_at"),
});

export const aiMessages = sqliteTable("ai_messages", {
	msgId: text("msg_id").primaryKey(),
	conversationId: text("conversation_id")
		.notNull()
		.references(() => aiConversations.conversationId),
	sender: text("sender", { enum: ["ai", "member", "staff"] }).notNull(),
	staffId: text("staff_id").references(() => staff.staffId),
	channel: text("channel", { enum: ["line", "email", "web"] }).notNull(),
	content: text("content"),
	aiModel: text("ai_model"),
	tokensIn: integer("tokens_in"),
	tokensOut: integer("tokens_out"),
	confidence: text("confidence"), // SQLiteではREAL型をDrizzleでは直接サポートしていないため、textに
	sentAt: text("sent_at").default("CURRENT_TIMESTAMP"),
});

export const aiOutcomes = sqliteTable("ai_outcomes", {
	outcomeId: text("outcome_id").primaryKey(),
	msgId: text("msg_id")
		.notNull()
		.references(() => aiMessages.msgId),
	autoReplied: integer("auto_replied").default(0),
	escalated: integer("escalated").default(0),
	overrideByStaff: integer("override_by_staff").default(0),
	reason: text("reason"),
	latencyMs: integer("latency_ms"),
	createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
});

// ----------------------------------------------------------
// suspension policy - 休会ポリシー
// ----------------------------------------------------------
export const suspensionPolicies = sqliteTable("suspension_policies", {
	gymId: text("gym_id")
		.primaryKey()
		.references(() => gyms.gymId),
	feeType: text("fee_type", { enum: ["fixed", "percentage", "free"] })
		.notNull()
		.default("free"),
	feeValue: integer("fee_value"),
	minTermMonths: integer("min_term_months").default(1),
	note: text("note"),
	updatedAt: text("updated_at").default("CURRENT_TIMESTAMP"),
});

// ----------------------------------------------------------
// payments - 支払い情報（Stripe再導入用）
// ----------------------------------------------------------
export const payments = sqliteTable("payments", {
	orderId: text("order_id").primaryKey(),
	gymId: text("gym_id")
		.notNull()
		.references(() => gyms.gymId),
	memberId: text("member_id").references(() => members.memberId),
	stripeSessionId: text("stripe_session_id"),
	stripePaymentIntent: text("stripe_payment_intent").unique(),
	amount: integer("amount"),
	currency: text("currency").default("JPY"),
	status: text("status", {
		enum: ["pending", "succeeded", "failed", "refunded"],
	})
		.notNull()
		.default("pending"),
	paidAt: text("paid_at"),
	createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
	updatedAt: text("updated_at").default("CURRENT_TIMESTAMP"),
});
