import type { GymType } from "@/types/gym";

// ジム一覧のモックデータ
export const mockGyms: GymType[] = [
	{
		gymId: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
		name: "NEXUS MMA GYM",
		ownerEmail: "owner@nexusmma.com",
		createdAt: "2024-12-01T09:00:00Z",
		updatedAt: "2025-05-01T14:30:00Z",
	},
	{
		gymId: "550e8400-e29b-41d4-a716-446655440000",
		name: "POWER BOXING CLUB",
		ownerEmail: "admin@powerboxing.jp",
		createdAt: "2025-01-15T10:30:00Z",
		updatedAt: "2025-05-02T11:15:00Z",
	},
	{
		gymId: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
		name: "剛拳道場",
		ownerEmail: "master@goukendojo.co.jp",
		createdAt: "2024-11-12T08:45:00Z",
		updatedAt: "2025-04-28T16:20:00Z",
	},
	{
		gymId: "7c9e6679-7425-40de-944b-e07fc1f90ae7",
		name: "FREEDOM KICKBOXING",
		ownerEmail: "info@freedomkick.jp",
		createdAt: "2025-02-28T13:15:00Z",
		updatedAt: "2025-05-03T12:00:00Z",
	},
	{
		gymId: "8a7b330e-3f4a-45e0-b8d2-cb3adc3acaf2",
		name: "BJJ EVOLUTION",
		ownerEmail: "contact@bjjevolution.com",
		createdAt: "2025-01-30T09:30:00Z",
		updatedAt: "2025-04-25T18:45:00Z",
	},
	{
		gymId: "9c4b8d82-9f8c-4e8e-bc5e-f46f7c3b7c0d",
		name: "SAMURAI COMBAT",
		ownerEmail: "support@samuraicombat.jp",
		createdAt: "2024-10-05T11:00:00Z",
		updatedAt: "2025-05-01T09:10:00Z",
	},
	{
		gymId: "a1b2c3d4-e5f6-4a5b-9c8d-e7f6a5b4c3d2",
		name: "格闘空手アカデミー",
		ownerEmail: "academy@kakutokarate.co.jp",
		createdAt: "2025-03-10T10:00:00Z",
		updatedAt: "2025-05-02T15:30:00Z",
	},
	{
		gymId: "b4a6c8e0-d2f4-4a6c-8e0b-4a6c8e0b4a6c",
		name: "ELITE MMA CENTER",
		ownerEmail: "info@elitemma.jp",
		createdAt: "2024-09-20T14:20:00Z",
		updatedAt: "2025-04-30T10:45:00Z",
	},
	{
		gymId: "c5d7e9f1-2a3b-4c5d-7e8f-9a0b1c2d3e4f",
		name: "LA FIGHT CLUB",
		ownerEmail: "manager@lafightclub.com",
		createdAt: "2025-01-05T16:30:00Z",
		updatedAt: "2025-05-01T22:10:00Z",
	},
	{
		gymId: "d6e8f0a2-3b4c-5d6e-8f0a-2b3c4d5e6f7a",
		name: "SYDNEY BOXING GYM",
		ownerEmail: "contact@sydneyboxing.com.au",
		createdAt: "2025-01-10T02:15:00Z",
		updatedAt: "2025-04-29T05:40:00Z",
	},
	{
		gymId: "e7f9a1b3-4c5d-6e7f-9a1b-3c4d5e6f7a8b",
		name: "柔術ファミリー東京",
		ownerEmail: "info@jujutsu-family.jp",
		createdAt: "2025-02-15T08:20:00Z",
		updatedAt: "2025-05-03T10:15:00Z",
	},
	{
		gymId: "f8a0b2c4-5d6e-7f8a-0b2c-4d5e6f7a8b9c",
		name: "BERLIN KICKBOX AKADEMIE",
		ownerEmail: "kontakt@berlinkickbox.de",
		createdAt: "2024-12-20T11:45:00Z",
		updatedAt: "2025-04-26T14:30:00Z",
	},
	{
		gymId: "a9b1c3d5-6e7f-8a9b-1c3d-5e6f7a8b9c0d",
		name: "MUAY THAI BANGKOK",
		ownerEmail: "training@muaythaibkk.co.th",
		createdAt: "2025-02-01T09:00:00Z",
		updatedAt: "2025-05-02T12:15:00Z",
	},
	{
		gymId: "b0c2d4e6-7f8a-9b0c-2d4e-6f7a8b9c0d1e",
		name: "ボクシングジム横浜",
		ownerEmail: "contact@yokohamaboxing.jp",
		createdAt: "2025-01-25T10:30:00Z",
		updatedAt: "2025-04-30T15:45:00Z",
	},
	{
		gymId: "c1d3e5f7-8a9b-0c1d-3e5f-7a8b9c0d1e2f",
		name: "LONDON FIGHT ACADEMY",
		ownerEmail: "info@londonfight.co.uk",
		createdAt: "2024-11-15T14:45:00Z",
		updatedAt: "2025-04-28T17:20:00Z",
	},
];

// ページネーション用のモックメタデータ
export const mockPaginationMeta = {
	total: 15, // 全レコード数（実際のmockGymsの長さ）
	page: 1, // 現在のページ
	limit: 10, // 1ページあたりの件数
	totalPages: 2, // 総ページ数
};
