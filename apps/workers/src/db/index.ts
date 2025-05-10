export * from "./schema";

import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
// スキーマからの型定義をエクスポート
import type * as schema from "./schema";

// 各テーブルのレコード型を定義
export type Gym = InferSelectModel<typeof schema.gyms>;
export type Member = InferSelectModel<typeof schema.members>;
export type Class = InferSelectModel<typeof schema.classes>;
export type Booking = InferSelectModel<typeof schema.bookings>;
export type Checkin = InferSelectModel<typeof schema.checkins>;
export type Staff = InferSelectModel<typeof schema.staff>;
export type ClassStaff = InferSelectModel<typeof schema.classStaff>;
export type Shift = InferSelectModel<typeof schema.shifts>;
export type Consent = InferSelectModel<typeof schema.consents>;
export type AiConversation = InferSelectModel<typeof schema.aiConversations>;
export type AiMessage = InferSelectModel<typeof schema.aiMessages>;
export type AiOutcome = InferSelectModel<typeof schema.aiOutcomes>;
export type SuspensionPolicy = InferSelectModel<typeof schema.suspensionPolicies>;
export type Payment = InferSelectModel<typeof schema.payments>;

// Insert型も定義
export type NewGym = InferInsertModel<typeof schema.gyms>;
export type NewMember = InferInsertModel<typeof schema.members>;
export type NewClass = InferInsertModel<typeof schema.classes>;
export type NewBooking = InferInsertModel<typeof schema.bookings>;
export type NewCheckin = InferInsertModel<typeof schema.checkins>;
export type NewStaff = InferInsertModel<typeof schema.staff>;
export type NewClassStaff = InferInsertModel<typeof schema.classStaff>;
export type NewShift = InferInsertModel<typeof schema.shifts>;
export type NewConsent = InferInsertModel<typeof schema.consents>;
export type NewAiConversation = InferInsertModel<typeof schema.aiConversations>;
export type NewAiMessage = InferInsertModel<typeof schema.aiMessages>;
export type NewAiOutcome = InferInsertModel<typeof schema.aiOutcomes>;
export type NewSuspensionPolicy = InferInsertModel<typeof schema.suspensionPolicies>;
export type NewPayment = InferInsertModel<typeof schema.payments>;
