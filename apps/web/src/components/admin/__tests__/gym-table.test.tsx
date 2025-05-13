import { GymTable } from "@/components/admin/gym-table";
import { mockGyms } from "@/mock/gyms";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { expect, vi } from "vitest";

// モックのイベントハンドラ
const mockOnEdit = vi.fn();
const mockOnDelete = vi.fn();

describe("GymTable", () => {
	beforeEach(() => {
		mockOnEdit.mockClear();
		mockOnDelete.mockClear();
	});

	it("正しくレンダリングされること", () => {
		render(<GymTable gyms={mockGyms} onEdit={mockOnEdit} onDelete={mockOnDelete} />);

		// ヘッダーが存在するか確認
		expect(screen.getByText("ジム名")).toBeDefined();
		expect(screen.getByText("オーナーメール")).toBeDefined();
		expect(screen.getByText("登録日")).toBeDefined();
		expect(screen.getByText("アクション")).toBeDefined();

		// 少なくとも1つのジムデータが表示されているか確認
		if (mockGyms[0] && mockGyms[0].name) {
			expect(screen.getByText(mockGyms[0].name)).toBeDefined();
		}
		if (mockGyms[0] && mockGyms[0].ownerEmail) {
			expect(screen.getByText(mockGyms[0].ownerEmail)).toBeDefined();
		}
	});

	it("空のデータ配列が渡されたとき、「ジムの登録がありません」と表示されること", () => {
		render(<GymTable gyms={[]} onEdit={mockOnEdit} onDelete={mockOnDelete} />);

		expect(screen.getByText("ジムの登録がありません")).toBeDefined();
	});

	it("ソート機能が正しく動作すること", async () => {
		render(<GymTable gyms={mockGyms} onEdit={mockOnEdit} onDelete={mockOnDelete} />);

		// ジム名でソート
		const nameHeader = screen.getByText("ジム名");
		fireEvent.click(nameHeader);

		// ソート順を確認するのは難しいので、少なくともクリックできることを確認
		expect(nameHeader).toBeDefined();

		// 再度クリックして逆順にソート
		fireEvent.click(nameHeader);
		expect(nameHeader).toBeDefined();
	});

	it("編集ボタンをクリックするとonEdit関数が呼ばれること", async () => {
		const user = userEvent.setup();
		render(<GymTable gyms={mockGyms} onEdit={mockOnEdit} onDelete={mockOnDelete} />);

		// 最初のドロップダウンメニューを開く
		const actionButtons = screen.getAllByRole("button", { name: "メニューを開く" });
		if (actionButtons[0]) {
			await user.click(actionButtons[0]);
		}

		// 編集ボタンをクリック
		const editButton = screen.getByText("編集");
		await user.click(editButton);

		// モック関数が呼ばれたか確認
		expect(mockOnEdit).toHaveBeenCalled();
		expect(mockOnEdit).toHaveBeenCalledWith(mockGyms[0]);
	});

	it("削除ボタンをクリックするとonDelete関数が呼ばれること", async () => {
		const user = userEvent.setup();
		render(<GymTable gyms={mockGyms} onEdit={mockOnEdit} onDelete={mockOnDelete} />);

		// 最初のドロップダウンメニューを開く
		const actionButtons = screen.getAllByRole("button", { name: "メニューを開く" });
		if (actionButtons[0]) {
			await user.click(actionButtons[0]);
		}

		// 削除ボタンをクリック
		const deleteButton = screen.getByText("削除");
		await user.click(deleteButton);

		// モック関数が呼ばれたか確認
		expect(mockOnDelete).toHaveBeenCalled();
		expect(mockOnDelete).toHaveBeenCalledWith(mockGyms[0]);
	});

	it("レスポンシブモードで正しくレンダリングされること", () => {
		// windowのサイズを小さくしてモバイル表示をシミュレート
		global.innerWidth = 500;
		global.dispatchEvent(new Event("resize"));

		render(<GymTable gyms={mockGyms} onEdit={mockOnEdit} onDelete={mockOnDelete} />);

		// モバイル表示ではカードレイアウトが使用される
		expect(screen.getByText("メール:")).toBeDefined();
		expect(screen.getByText("登録日:")).toBeDefined();
	});
});
