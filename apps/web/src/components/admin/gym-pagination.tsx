import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@/components/ui/pagination";
import type { PaginationMetaType } from "@/types/common";
import React, { useEffect, useState } from "react";

interface GymPaginationProps {
	meta: PaginationMetaType;
	onPageChange: (page: number) => void;
}

export function GymPagination({ meta, onPageChange }: GymPaginationProps) {
	const [currentPage, setCurrentPage] = useState(meta.page);

	// メタデータが変わったら現在のページも更新
	useEffect(() => {
		setCurrentPage(meta.page);
	}, [meta.page]);

	// ページ切り替えハンドラー
	const handlePageChange = (page: number) => {
		if (page < 1 || page > meta.totalPages) return;
		setCurrentPage(page);
		onPageChange(page);
	};

	// 表示するページ番号の配列を生成
	const getPageNumbers = () => {
		const pageNumbers: (number | null)[] = [];
		const totalPages = meta.totalPages;
		const currentPage = meta.page;

		// 5ページ以下の場合はすべて表示
		if (totalPages <= 5) {
			for (let i = 1; i <= totalPages; i++) {
				pageNumbers.push(i);
			}
			return pageNumbers;
		}

		// 現在のページの前後2ページを表示
		pageNumbers.push(1); // 常に最初のページを表示

		if (currentPage > 3) {
			pageNumbers.push(null); // 省略記号を追加
		}

		const startPage = Math.max(2, currentPage - 1);
		const endPage = Math.min(totalPages - 1, currentPage + 1);

		for (let i = startPage; i <= endPage; i++) {
			pageNumbers.push(i);
		}

		if (currentPage < totalPages - 2) {
			pageNumbers.push(null); // 省略記号を追加
		}

		if (totalPages > 1) {
			pageNumbers.push(totalPages); // 常に最後のページを表示
		}

		return pageNumbers;
	};

	if (meta.totalPages <= 1) {
		return null; // ページが1つしかない場合はページネーションを表示しない
	}

	return (
		<Pagination className="mt-6">
			<PaginationContent>
				<PaginationItem>
					<PaginationPrevious
						href="#"
						onClick={(e) => {
							e.preventDefault();
							handlePageChange(currentPage - 1);
						}}
						className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
					/>
				</PaginationItem>

				{getPageNumbers().map((pageNumber, index) =>
					pageNumber === null ? (
						<PaginationItem key={`ellipsis-${index}`}>
							<PaginationEllipsis />
						</PaginationItem>
					) : (
						<PaginationItem key={pageNumber}>
							<PaginationLink
								href="#"
								onClick={(e) => {
									e.preventDefault();
									handlePageChange(pageNumber);
								}}
								isActive={currentPage === pageNumber}
							>
								{pageNumber}
							</PaginationLink>
						</PaginationItem>
					),
				)}

				<PaginationItem>
					<PaginationNext
						href="#"
						onClick={(e) => {
							e.preventDefault();
							handlePageChange(currentPage + 1);
						}}
						className={currentPage === meta.totalPages ? "pointer-events-none opacity-50" : ""}
					/>
				</PaginationItem>
			</PaginationContent>
		</Pagination>
	);
}
