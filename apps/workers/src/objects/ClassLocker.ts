// ClassLocker.ts - 授業（クラス）予約の同時実行制御用Durable Object

export class ClassLocker {
	private locks: Map<string, boolean> = new Map();

	constructor(private state: DurableObjectState) {
		// ロック状態の初期化
	}

	// Worker EnvironmentからのHTTP fetchイベントを処理
	async fetch(request: Request): Promise<Response> {
		const url = new URL(request.url);
		const path = url.pathname.split("/").filter(Boolean);

		// ルートパスはDOの状態を返す
		if (path.length === 0) {
			return new Response(
				JSON.stringify({ status: "ok", type: "ClassLocker" }),
				{
					headers: { "Content-Type": "application/json" },
				},
			);
		}

		// 主な操作: lock, unlock, check
		const action = path[0];
		const classId = path[1]; // クラスID

		if (!classId) {
			return new Response(JSON.stringify({ error: "Class ID is required" }), {
				status: 400,
				headers: { "Content-Type": "application/json" },
			});
		}

		switch (action) {
			case "lock":
				return this.lockClass(classId);
			case "unlock":
				return this.unlockClass(classId);
			case "check":
				return this.checkLock(classId);
			default:
				return new Response(JSON.stringify({ error: "Invalid action" }), {
					status: 400,
					headers: { "Content-Type": "application/json" },
				});
		}
	}

	// クラスをロック（予約処理中）
	private async lockClass(classId: string): Promise<Response> {
		if (this.locks.get(classId)) {
			return new Response(
				JSON.stringify({ locked: true, message: "Class is already locked" }),
				{
					status: 409, // Conflict
					headers: { "Content-Type": "application/json" },
				},
			);
		}

		this.locks.set(classId, true);

		// 将来的にはstate.storageにロック情報を永続化可能
		// await this.state.storage.put(`lock:${classId}`, true);

		return new Response(JSON.stringify({ locked: true, success: true }), {
			headers: { "Content-Type": "application/json" },
		});
	}

	// クラスのロックを解除（予約処理完了）
	private async unlockClass(classId: string): Promise<Response> {
		this.locks.set(classId, false);

		// 将来的にはstate.storageからロック情報を削除可能
		// await this.state.storage.delete(`lock:${classId}`);

		return new Response(JSON.stringify({ locked: false, success: true }), {
			headers: { "Content-Type": "application/json" },
		});
	}

	// クラスのロック状態を確認
	private async checkLock(classId: string): Promise<Response> {
		const isLocked = this.locks.get(classId) || false;

		return new Response(JSON.stringify({ locked: isLocked }), {
			headers: { "Content-Type": "application/json" },
		});
	}
}
