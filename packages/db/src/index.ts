export * from './schema';

// スキーマからの型定義をエクスポート
import * as schema from './schema';
import { InferModel } from 'drizzle-orm';

// 各テーブルのレコード型を定義
export type Gym = InferModel<typeof schema.gyms>;
export type Member = InferModel<typeof schema.members>;
export type Class = InferModel<typeof schema.classes>;
export type Booking = InferModel<typeof schema.bookings>;
export type Checkin = InferModel<typeof schema.checkins>;
export type Staff = InferModel<typeof schema.staff>;
export type ClassStaff = InferModel<typeof schema.classStaff>;
export type Shift = InferModel<typeof schema.shifts>;
export type Consent = InferModel<typeof schema.consents>;
export type AiConversation = InferModel<typeof schema.aiConversations>;
export type AiMessage = InferModel<typeof schema.aiMessages>;
export type AiOutcome = InferModel<typeof schema.aiOutcomes>;
export type SuspensionPolicy = InferModel<typeof schema.suspensionPolicies>;
export type Payment = InferModel<typeof schema.payments>;

// Insert型も定義
export type NewGym = InferModel<typeof schema.gyms, 'insert'>;
export type NewMember = InferModel<typeof schema.members, 'insert'>;
export type NewClass = InferModel<typeof schema.classes, 'insert'>;
export type NewBooking = InferModel<typeof schema.bookings, 'insert'>;
export type NewCheckin = InferModel<typeof schema.checkins, 'insert'>;
export type NewStaff = InferModel<typeof schema.staff, 'insert'>;
export type NewClassStaff = InferModel<typeof schema.classStaff, 'insert'>;
export type NewShift = InferModel<typeof schema.shifts, 'insert'>;
export type NewConsent = InferModel<typeof schema.consents, 'insert'>;
export type NewAiConversation = InferModel<typeof schema.aiConversations, 'insert'>;
export type NewAiMessage = InferModel<typeof schema.aiMessages, 'insert'>;
export type NewAiOutcome = InferModel<typeof schema.aiOutcomes, 'insert'>;
export type NewSuspensionPolicy = InferModel<typeof schema.suspensionPolicies, 'insert'>;
export type NewPayment = InferModel<typeof schema.payments, 'insert'>;