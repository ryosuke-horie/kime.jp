import { describe, expect, it } from "vitest";
import { comparePassword, hashPassword } from "./password";

describe("パスワードユーティリティ", () => {
	describe("hashPassword", () => {
		it("パスワードを正しくハッシュ化できる", async () => {
			const password = "testPassword123";
			const hashedPassword = await hashPassword(password);

			// ハッシュ化されたパスワードは元のパスワードと異なる
			expect(hashedPassword).not.toBe(password);
			// ハッシュ化されたパスワードは文字列
			expect(typeof hashedPassword).toBe("string");
			// ハッシュ化されたパスワードは一定の長さを持つ
			expect(hashedPassword.length).toBeGreaterThan(0);
		});

		it("同じパスワードでも異なるハッシュを生成する", async () => {
			const password = "testPassword123";
			const hash1 = await hashPassword(password);
			const hash2 = await hashPassword(password);

			// ソルトが使用されているため、同じパスワードでも異なるハッシュになる
			expect(hash1).not.toBe(hash2);
		});

		it("空文字列のパスワードでエラーをスローする", async () => {
			await expect(hashPassword("")).rejects.toThrow("Password cannot be empty");
		});
	});

	describe("comparePassword", () => {
		it("正しいパスワードを検証できる", async () => {
			const password = "testPassword123";
			const hashedPassword = await hashPassword(password);

			const isValid = await comparePassword(password, hashedPassword);
			expect(isValid).toBe(true);
		});

		it("間違ったパスワードを検証できる", async () => {
			const password = "testPassword123";
			const wrongPassword = "wrongPassword123";
			const hashedPassword = await hashPassword(password);

			const isValid = await comparePassword(wrongPassword, hashedPassword);
			expect(isValid).toBe(false);
		});

		it("空のハッシュでfalseを返す", async () => {
			const isValid = await comparePassword("password", "");
			expect(isValid).toBe(false);
		});

		it("不正なハッシュ形式でfalseを返す", async () => {
			const isValid = await comparePassword("password", "invalid-hash");
			expect(isValid).toBe(false);
		});
	});
});
