import { describe, expect, it } from "vitest";
import app from "./index";

describe("Worker Tests", () => {
	it("should return 'Kime API - Hello!' for the root path", async () => {
		const res = await app.request("/");
		expect(res.status).toBe(200);
		expect(await res.text()).toBe("Kime API - Hello!");
	});

	it("should have CORS headers", async () => {
		const res = await app.request("/");
		expect(res.headers.get("access-control-allow-origin")).toBe("*");
	});
});
